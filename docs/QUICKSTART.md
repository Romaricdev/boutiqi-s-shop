# Démarrage rapide — Boutiki Onboarding

## Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Lancer le serveur de développement
npm run dev
```

Le projet sera accessible sur [http://localhost:3000](http://localhost:3000)

---

## Parcours de test

### 1. Landing page
- Ouvrir [http://localhost:3000](http://localhost:3000)
- Vérifier les animations au scroll
- Tester le menu mobile (responsive)
- Cliquer sur "Créer ma boutique gratuitement"

### 2. Onboarding — Étape 1 (Compte)
- URL: [http://localhost:3000/onboarding/account](http://localhost:3000/onboarding/account)
- Remplir le formulaire:
  - Email: `test@example.cm`
  - Mot de passe: `password123`
  - Nom: `Marie Fotso`
  - WhatsApp: `690123456`
  - Type: `Friperie / Vêtements`
- Cocher les CGU
- Cliquer "Continuer"

### 3. Onboarding — Étape 2 (Boutique)
- URL: [http://localhost:3000/onboarding/shop](http://localhost:3000/onboarding/shop)
- Remplir le formulaire:
  - Nom: `Boutique Solange`
  - Ville: `Douala`
  - Quartier: `Akwa`
  - Description: `Friperie de qualité à Akwa. Vêtements européens, prix abordables.`
  - Horaires: `Tous les jours 8h–20h`
  - Logo: (optionnel) uploader une image
- Observer le slug généré en temps réel: `boutiki.cm/boutique-solange`
- Cliquer "Continuer"

### 4. Onboarding — Étape 3 (Produits)
- URL: [http://localhost:3000/onboarding/products](http://localhost:3000/onboarding/products)
- **Option A**: Cliquer "Passer cette étape" (aucun produit)
- **Option B**: Ajouter des produits:
  - Cliquer "Ajouter un produit"
  - Remplir:
    - Photo: uploader une image
    - Nom: `Robe wax bleue`
    - Prix: `14500`
    - Catégorie: `Vêtements`
    - Description: `Belle robe en wax authentique, taille M`
  - Cliquer "Ajouter ce produit"
  - Observer le produit apparaître dans la liste ET dans le preview à droite
  - Répéter pour ajouter d'autres produits
- Cliquer "Terminer l'inscription"

### 5. Récapitulatif
- URL: [http://localhost:3000/onboarding/summary](http://localhost:3000/onboarding/summary)
- Vérifier que toutes les informations sont correctes
- Cliquer "Prévisualiser ma boutique" → ouvre `/shop/boutique-solange` dans un nouvel onglet
- Observer la boutique publique avec header, description, et grille de produits
- Revenir à l'onglet récapitulatif
- Cliquer "Lancer ma boutique" → alert (backend non implémenté) → redirect `/dashboard`

---

## État actuel

### ✅ Fonctionnel
- Landing page complète avec animations
- Onboarding 3 étapes avec validation Zod
- Preview boutique en temps réel
- Navigation entre étapes avec protection
- Responsive design (mobile, tablet, desktop)
- Persistence des données (localStorage via Zustand)

### ❌ Non fonctionnel (backend requis)
- Création de compte réel (Supabase Auth)
- Sauvegarde en base de données
- Upload d'images vers Supabase Storage
- Authentification et sessions
- Dashboard commerçant
- Boutiques publiques persistantes

---

## Commandes utiles

```bash
# Lancer le dev server
npm run dev

# Vérifier les types TypeScript
npm run typecheck

# Linter
npm run lint

# Formatter le code
npm run format

# Build de production
npm run build
npm run start
```

---

## Structure des fichiers clés

```
src/
├── app/
│   ├── onboarding/
│   │   ├── layout.tsx          # Layout onboarding
│   │   ├── page.tsx             # Redirect vers /account
│   │   ├── account/page.tsx     # Étape 1
│   │   ├── shop/page.tsx        # Étape 2
│   │   ├── products/page.tsx    # Étape 3
│   │   └── summary/page.tsx     # Récapitulatif
│   ├── shop/[slug]/page.tsx     # Preview boutique publique
│   └── dashboard/page.tsx       # Dashboard (placeholder)
├── components/
│   ├── ui/                      # Composants réutilisables
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── file-upload.tsx
│   │   └── button.tsx
│   └── landing/                 # Composants landing page
├── lib/
│   ├── store/
│   │   └── onboarding.ts        # Zustand store
│   └── validations/
│       └── onboarding.ts        # Zod schemas
└── styles/
    └── globals.css
```

---

## Prochaines étapes

1. **Configurer Supabase** (projet + tables + storage)
2. **Créer API route** `/api/onboarding/complete`
3. **Implémenter upload** d'images vers Supabase Storage
4. **Connecter l'onboarding** au backend
5. **Implémenter authentification** et sessions
6. **Créer dashboard** commerçant
7. **Implémenter gestion** produits/commandes

Voir `docs/BACKEND_TODO.md` pour le plan détaillé.
