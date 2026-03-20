# Backend Implementation Plan — Onboarding

## Vue d'ensemble
Ce document décrit les étapes nécessaires pour connecter l'onboarding frontend à Supabase (auth, database, storage).

---

## 1. Configuration Supabase

### 1.1 Créer le projet Supabase
- Créer un projet sur [supabase.com](https://supabase.com)
- Noter l'URL du projet et l'API key (anon public)
- Configurer `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
  ```

### 1.2 Activer Supabase Auth
- Email/Password provider (activé par défaut)
- Configurer les templates d'emails (confirmation, reset password)
- Configurer les redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://boutiki.cm/auth/callback` (production)

---

## 2. Schéma de base de données

### 2.1 Table `merchants`
```sql
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view own data"
  ON merchants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Merchants can update own data"
  ON merchants FOR UPDATE
  USING (auth.uid() = user_id);
```

### 2.2 Table `shops`
```sql
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  description TEXT NOT NULL,
  opening_hours TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche par slug
CREATE INDEX idx_shops_slug ON shops(slug);
CREATE INDEX idx_shops_merchant_id ON shops(merchant_id);

-- RLS
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shops are viewable by everyone"
  ON shops FOR SELECT
  USING (is_active = true);

CREATE POLICY "Merchants can insert own shops"
  ON shops FOR INSERT
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Merchants can update own shops"
  ON shops FOR UPDATE
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE user_id = auth.uid()
    )
  );
```

### 2.3 Table `products`
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 100),
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche par boutique
CREATE INDEX idx_products_shop_id ON products(shop_id);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Merchants can manage own products"
  ON products FOR ALL
  USING (
    shop_id IN (
      SELECT s.id FROM shops s
      INNER JOIN merchants m ON s.merchant_id = m.id
      WHERE m.user_id = auth.uid()
    )
  );
```

---

## 3. Storage Buckets

### 3.1 Bucket `shop-logos`
```sql
-- Créer le bucket via Supabase Dashboard ou SQL:
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-logos', 'shop-logos', true);

-- RLS
CREATE POLICY "Anyone can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'shop-logos');

CREATE POLICY "Merchants can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'shop-logos' AND
    auth.role() = 'authenticated'
  );
```

### 3.2 Bucket `product-images`
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- RLS
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Merchants can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );
```

---

## 4. API Routes / Server Actions

### 4.1 Route `/api/onboarding/complete`
**Méthode**: POST  
**Body**:
```typescript
{
  account: OnboardingAccount,
  shop: OnboardingShop,
  products: OnboardingProduct[]
}
```

**Workflow**:
1. Créer utilisateur via `supabase.auth.signUp(email, password)`
2. Insérer dans `merchants` (user_id, full_name, phone, business_type)
3. Upload logo si présent → Supabase Storage → récupérer URL publique
4. Insérer dans `shops` (merchant_id, slug, name, city, neighborhood, description, opening_hours, logo_url)
5. Pour chaque produit:
   - Upload image si présente → Supabase Storage → récupérer URL publique
   - Insérer dans `products` (shop_id, name, price, category, description, image_url)
6. Envoyer email de confirmation (optionnel)
7. Retourner session token + shop slug

**Gestion d'erreurs**:
- Slug déjà existant → générer un slug alternatif (ajouter suffixe numérique)
- Email déjà existant → retourner erreur explicite
- Échec upload → rollback transaction (si possible) ou continuer sans image

### 4.2 Route `/api/shops/[slug]`
**Méthode**: GET  
**Params**: `slug`

**Workflow**:
1. Requête `shops` WHERE `slug = :slug` AND `is_active = true`
2. Requête `products` WHERE `shop_id = :shop_id` AND `is_active = true`
3. Retourner JSON avec shop + products

**Cache**: Utiliser Next.js `revalidate` pour ISR (ex: 60 secondes)

---

## 5. Modifications frontend nécessaires

### 5.1 Créer client Supabase
**Fichier**: `src/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

### 5.2 Modifier `src/app/onboarding/summary/page.tsx`
Remplacer `handleFinish`:
```typescript
const handleFinish = async () => {
  try {
    const response = await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account, shop, products }),
    });

    if (!response.ok) throw new Error('Inscription échouée');

    const { session, shopSlug } = await response.json();
    
    // Stocker session
    // Reset store
    reset();
    
    // Redirect dashboard
    router.push('/dashboard');
  } catch (error) {
    alert('Erreur lors de l\'inscription. Veuillez réessayer.');
  }
};
```

### 5.3 Modifier `src/app/shop/[slug]/page.tsx`
Remplacer la lecture du store Zustand par un fetch API:
```typescript
const { data: shop } = await fetch(`/api/shops/${slug}`).then(r => r.json());
```

Ou utiliser React Query:
```typescript
const { data: shop, isLoading } = useQuery({
  queryKey: ['shop', slug],
  queryFn: () => fetch(`/api/shops/${slug}`).then(r => r.json()),
});
```

---

## 6. Upload d'images

### Stratégie recommandée
1. **Pendant onboarding**: convertir en Data URL (base64) pour preview
2. **À la soumission finale**: upload vers Supabase Storage
3. **Optimisation**: compresser images côté client avant upload (ex: `browser-image-compression`)

### Helper fonction
**Fichier**: `src/lib/supabase/upload.ts`
```typescript
import { createClient } from './client';

export async function uploadImage(
  bucket: 'shop-logos' | 'product-images',
  file: File,
  path: string
): Promise<string> {
  const supabase = createClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}
```

---

## 7. Sécurité

### Points d'attention
- **RLS**: toutes les tables doivent avoir RLS activé
- **Validation**: valider côté serveur (ne jamais faire confiance au frontend)
- **Slug unique**: vérifier unicité avant insertion
- **Rate limiting**: limiter les créations de compte (ex: 5/heure par IP)
- **Upload**: valider type MIME, taille max (5MB), dimensions

---

## 8. Tests recommandés

### Tests unitaires
- Validation Zod schemas (cas valides/invalides)
- Génération de slug (accents, caractères spéciaux, doublons)

### Tests d'intégration
- Parcours onboarding complet (3 étapes)
- Upload d'images (succès, échec, formats invalides)
- Création boutique avec/sans produits
- Preview boutique après création

### Tests E2E
- Onboarding → Dashboard → Ajout produit → Preview boutique publique
- Validation erreurs (email existant, slug existant)

---

**Statut actuel**: Frontend 100% fonctionnel, prêt pour intégration backend.
