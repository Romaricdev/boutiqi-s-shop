# Implémentation Onboarding Frontend — Boutiki

## Vue d'ensemble
L'onboarding est un parcours en **3 étapes** permettant à un commerçant de créer son compte, configurer sa boutique et optionnellement ajouter des produits. L'implémentation actuelle est **100% frontend**, avec state management Zustand et persistence locale.

---

## Architecture

### State Management
**Fichier**: `src/lib/store/onboarding.ts`

- **Zustand** avec middleware `persist` pour sauvegarder l'état dans `localStorage`
- **Types**:
  - `OnboardingAccount`: email, password, fullName, phone, businessType
  - `OnboardingShop`: shopName, city, neighborhood, description, openingHours, logoUrl
  - `OnboardingProduct`: id, name, price, imageUrl, category, description
- **Actions**:
  - `setStep(step)`: navigation entre étapes
  - `setAccount(account)`: sauvegarde données compte
  - `setShop(shop)`: sauvegarde données boutique + génération du slug
  - `addProduct(product)`, `updateProduct(id, updates)`, `removeProduct(id)`: gestion produits
  - `reset()`: réinitialisation complète

### Validation
**Fichier**: `src/lib/validations/onboarding.ts`

- **Zod schemas** pour chaque étape:
  - `accountSchema`: validation email, password (min 8 chars), phone (format camerounais), businessType
  - `shopSchema`: validation shopName (2-60 chars), city, neighborhood, description (10-200 chars), openingHours
  - `productSchema`: validation name (2-80 chars), price (100-10M FCFA), category, description (max 300 chars)

### Composants UI réutilisables
**Dossier**: `src/components/ui/`

- **Input** (`input.tsx`): champ texte avec label, error, hint, focus states
- **Select** (`select.tsx`): dropdown avec label, error, hint
- **Textarea** (`textarea.tsx`): zone texte multi-lignes avec label, error, hint
- **FileUpload** (`file-upload.tsx`): upload image avec preview, suppression, drag & drop visuel
- **Button** (`button.tsx`): bouton avec variants (primary, secondary, ghost) et sizes (sm, md, lg)

Tous les composants suivent le design system (couleurs `brand`, `warm`, transitions, focus states).

---

## Parcours utilisateur

### Étape 1: Création de compte
**Route**: `/onboarding/account`  
**Fichier**: `src/app/onboarding/account/page.tsx`

**Champs**:
- Email (validation email)
- Mot de passe (min 8 caractères)
- Nom et prénom
- Numéro WhatsApp (format: 6XXXXXXXX)
- Type de commerce (select: friperie, restaurant, épicerie, cosmétiques, électronique, autre)
- Checkbox CGU (required)

**Validation**: React Hook Form + Zod resolver  
**Navigation**: → `/onboarding/shop` après soumission

---

### Étape 2: Configuration boutique
**Route**: `/onboarding/shop`  
**Fichier**: `src/app/onboarding/shop/page.tsx`

**Champs**:
- Nom de la boutique (2-60 chars)
  - Génération live du slug: `boutiki.cm/{slug}`
- Ville (select: Douala, Yaoundé, Autre)
- Quartier
- Description (10-200 chars, 1-2 phrases)
- Horaires d'ouverture (presets: 8h-20h, 9h-18h, 10h-22h, personnalisé)
- Logo (optionnel, upload image)

**Fonctionnalités**:
- Génération automatique du slug à partir du nom de la boutique
- Affichage live du lien `boutiki.cm/{slug}` sous le champ "Nom de la boutique"
- Bouton "Retour" pour revenir à l'étape précédente

**Validation**: React Hook Form + Zod resolver  
**Navigation**: → `/onboarding/products` après soumission

---

### Étape 3: Produits (optionnel)
**Route**: `/onboarding/products`  
**Fichier**: `src/app/onboarding/products/page.tsx`

**Layout**: 2 colonnes (desktop)
- **Gauche**: formulaire + liste des produits ajoutés
- **Droite**: preview live de la boutique (sticky)

**Formulaire produit**:
- Photo du produit (optionnel, upload image)
- Nom du produit (2-80 chars)
- Prix (FCFA, min 100, max 10M)
- Catégorie (select: vêtements, chaussures, accessoires, alimentation, cosmétiques, électronique, autre)
- Description (optionnel, max 300 chars)

**Fonctionnalités**:
- Ajout multiple de produits (formulaire se cache après ajout)
- Liste des produits avec miniatures, prix, catégorie
- Suppression de produit (bouton X)
- **Preview live**: affiche la boutique avec logo, nom, localisation, description et grille de produits
- Boutons:
  - "Passer cette étape" (si aucun produit)
  - "Terminer l'inscription" (si au moins 1 produit)
  - "Retour" pour revenir à l'étape précédente

**Validation**: React Hook Form + Zod resolver  
**Navigation**: → `/onboarding/summary` après action

---

### Étape 4: Récapitulatif & activation
**Route**: `/onboarding/summary`  
**Fichier**: `src/app/onboarding/summary/page.tsx`

**Affichage**:
- Icône de succès (CheckCircle2)
- Titre: "Tout est prêt !"
- 3 cartes récapitulatives:
  1. **Votre compte**: nom, email, WhatsApp, type de commerce
  2. **Votre boutique**: nom, lien, localisation, horaires, description
  3. **Produits ajoutés**: grille des produits (si présents)

**Actions**:
- **Retour**: revenir à l'étape produits
- **Prévisualiser ma boutique**: ouvre `/shop/{slug}` dans un nouvel onglet
- **Lancer ma boutique**: termine l'inscription (actuellement: alert + reset + redirect `/dashboard`)

---

## Preview boutique publique
**Route**: `/shop/[slug]`  
**Fichier**: `src/app/shop/[slug]/page.tsx`

**Fonctionnalités**:
- Affichage du header boutique (logo, nom, localisation, horaires, description)
- Grille de produits (image, nom, catégorie, description, prix, bouton panier)
- Barre de panier flottante en bas (demo, 0 article)
- Message "Boutique introuvable" si slug ne correspond pas

**État actuel**: Lit les données du store Zustand (onboarding en cours). Nécessitera backend pour afficher boutiques existantes.

---

## Routes & Navigation

### Routes créées
- `/onboarding` → redirect vers `/onboarding/account`
- `/onboarding/account` → Étape 1
- `/onboarding/shop` → Étape 2 (redirect si pas de `account`)
- `/onboarding/products` → Étape 3 (redirect si pas de `account` ou `shop`)
- `/onboarding/summary` → Récapitulatif (redirect si pas de `account` ou `shop`)
- `/dashboard` → Page placeholder (backend requis)
- `/shop/[slug]` → Preview boutique publique

### Layout onboarding
**Fichier**: `src/app/onboarding/layout.tsx`

- Header simple avec logo Boutiki et lien "Retour"
- Background `bg-warm-50`
- Appliqué à toutes les pages `/onboarding/*`

### Mise à jour CTAs landing page
Tous les liens "Créer ma boutique" de la landing page pointent maintenant vers `/onboarding`:
- Navbar (desktop + mobile)
- Hero
- Pricing (plan Pilote)
- CTA Section

---

## État actuel & prochaines étapes

### ✅ Implémenté (frontend)
- Store Zustand avec persistence
- Schémas Zod pour validation
- Composants UI réutilisables
- 3 étapes d'onboarding avec formulaires fonctionnels
- Preview live de la boutique pendant onboarding
- Page récapitulative
- Page preview boutique publique
- Navigation entre étapes avec protection (redirect si données manquantes)
- Responsive design (mobile, tablet, desktop)

### 🔜 À implémenter (backend)
- Création compte commerçant dans Supabase Auth
- Insertion `merchants` table
- Insertion `shops` table
- Upload logo et images produits vers Supabase Storage
- Insertion `products` table
- Génération token API pour boutique
- Envoi email de confirmation
- Redirect vers dashboard authentifié

---

## Dépendances ajoutées
- `zustand`: ^5.0.2 (state management)
- `@hookform/resolvers`: ^3.9.1 (intégration Zod avec React Hook Form)

---

## Notes techniques

### Génération du slug
Le slug est généré automatiquement à partir du nom de la boutique:
- Conversion en minuscules
- Normalisation NFD (suppression accents)
- Remplacement caractères non alphanumériques par `-`
- Suppression tirets en début/fin

Exemple: `"Boutique Solange"` → `"boutique-solange"`

### Persistence
Le store Zustand persiste dans `localStorage` sous la clé `boutiqi-onboarding`. Cela permet:
- Reprise du parcours en cas de fermeture du navigateur
- Pré-remplissage des formulaires si l'utilisateur revient en arrière

Le store est réinitialisé (`reset()`) après finalisation de l'inscription.

### Images
Actuellement, les images (logo, photos produits) sont converties en **Data URLs** (base64) via `FileReader`. En production avec backend:
- Upload vers Supabase Storage
- Stockage de l'URL publique dans la base de données
- Optimisation des images (compression, formats modernes)

---

## Checklist de validation frontend

- [x] Formulaire étape 1 valide et enregistre les données
- [x] Formulaire étape 2 valide et génère le slug
- [x] Formulaire étape 3 permet d'ajouter/supprimer des produits
- [x] Preview boutique se met à jour en temps réel
- [x] Navigation "Retour" fonctionne à chaque étape
- [x] Protection des routes (redirect si données manquantes)
- [x] Récapitulatif affiche toutes les données
- [x] Bouton "Prévisualiser ma boutique" ouvre la page publique
- [x] Responsive design sur mobile/tablet/desktop
- [x] Validation Zod affiche les erreurs appropriées
- [x] Pas de linter errors
- [x] CTAs landing page pointent vers `/onboarding`

---

**Prochaine phase**: Intégration backend Supabase (auth, database, storage).
