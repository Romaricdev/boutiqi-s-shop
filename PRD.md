# PRD — Boutique WhatsApp (SaaS) — V1 “Order Manager”
**Version**: 1.1  
**Date**: Mars 2026  
**Marché cible**: Cameroun (Douala → Yaoundé)  
**Source**: `cahier_des_charges_boutique_whatsapp.pdf` + décisions projet (chat)

---

## 1) Résumé exécutif
Boutique WhatsApp est une plateforme web mobile-first qui permet aux commerçants camerounais de **publier un catalogue**, **centraliser les commandes**, et **suivre le traitement** via un dashboard simple, tout en restant alignée sur l’usage WhatsApp (partage de lien, contact direct).

**Décisions V1 (périmètre réduit)**:
- **Pas de paiement in-app** (aucune transaction/commission via la plateforme en V1).
- **Pas de gestion de stock** (pas de quantités, pas d’alertes, pas de décrément).
- **Abonnements**: brique **implémentée mais désactivée** (période test/pilote).

---

## 2) Problème & opportunité
Le commerce informel au Cameroun utilise massivement WhatsApp pour vendre. Cela entraîne:
- commandes perdues dans les messages, pas d’historique fiable
- suivi client informel, statut incertain
- absence de tableau de bord pour le commerçant

**Opportunité**: structurer l’existant (WhatsApp-first) avec un outil léger, rapide et fiable.

---

## 3) Objectifs produit (V1)
- **O-01**: permettre à un commerçant de créer une boutique et partager un lien en **< 10 minutes**
- **O-02**: centraliser **100% des commandes** dans un dashboard accessible mobile
- **O-03**: permettre à un client de passer commande en **< 3 minutes** sans compte
- **O-04**: fournir un suivi clair (statuts + page de suivi) pour réduire l’incertitude

---

## 4) Utilisateurs cibles (personas)
### Commerçant (principal)
- 25–45 ans, Android milieu de gamme, 3G/4G, très actif WhatsApp
- peu habitué aux logiciels de gestion → UX ultra simple

### Client (anonyme)
- arrive via un lien WhatsApp
- veut voir des produits, commander vite, obtenir une confirmation, pouvoir recontacter la boutique

### Super Admin (opérations)
- support, gestion des commerçants, désactivation, préparation de la monétisation future

---

## 5) Périmètre V1 (IN) — fonctionnalités
### 5.1 Dashboard Commerçant (authentifié)
- **Auth**: inscription, connexion, récupération mot de passe
- **Profil boutique**: nom, logo, description, ville, quartier, horaires, numéro WhatsApp
- **Catalogue produits**:
  - ajout / modification / désactivation (soft) / suppression (avec garde-fou sur commandes passées)
  - photo (upload mobile), nom, prix, description courte, catégorie (optionnelle), actif/inactif
- **Commandes**:
  - vue dashboard (résumé: commandes du jour, dernières commandes)
  - liste commandes filtrable par statut
  - détail commande (articles, infos client, livraison/retrait, adresse, note, total)
  - actions statut (voir section 7)
- **Notifications in-app** (realtime): nouvelle commande + changements de statut
- **Partage**: lien boutique public + bouton copier
- **WhatsApp (deep links)**:
  - bouton “Partager ma boutique”
  - bouton “Contacter le client” (message pré-rempli avec récap)

### 5.2 Boutique publique Client (anonyme)
- **Page boutique** `/{shopSlug}`: infos boutique + CTA WhatsApp
- **Catalogue**: grille produits actifs
- **Panier**: ajout/retrait, quantités, total
- **Passage commande**:
  - nom, téléphone, livraison/retrait, adresse si livraison, note
  - création commande
- **Confirmation**: numéro de commande + récap + bouton WhatsApp pré-rempli
- **Suivi**: ` /track/[trackingToken] ` (public) — statut de commande, récap, CTA WhatsApp

### 5.3 Dashboard Admin (minimum viable V1)
- liste commerçants/boutiques + activation/désactivation
- vue support (lecture) commandes/boutiques
- gestion des plans/subscriptions **en mode pilote** (assignation manuelle)

---

## 6) Hors périmètre V1 (OUT)
- Paiement in-app (Campay, webhooks paiement, checkout achat, commissions)
- Gestion de stock (quantités, décrément, stock bas, masquage auto)
- Notifications SMS / WhatsApp automatiques (in-app uniquement + boutons WhatsApp)
- App mobile native
- Retours / remboursements
- Promotions / fidélité
- Avis produits
- Chat in-app
- Marketplace/annuaire public multi-boutiques

---

## 7) Workflows V1 (sans paiement, sans stock)
### 7.1 Création boutique
1. inscription commerçant
2. génération `shopSlug` unique
3. complétion profil boutique
4. ajout des produits
5. partage du lien boutique sur WhatsApp

### 7.2 Commande client
1. client ouvre `/{shopSlug}`
2. ajoute au panier
3. remplit le formulaire (livraison/retrait)
4. valide la commande → création en base avec statut `new`
5. confirmation + lien de suivi + bouton WhatsApp (message pré-rempli)
6. commerçant notifié en realtime

### 7.3 Traitement commande (commerçant)
1. consulte le détail
2. met à jour le statut selon la machine à états ci-dessous
3. client suit via `/track/[trackingToken]`

---

## 8) Machine à états “Order Status” (V1)
**Statuts**:
- `new`
- `confirmed`
- `preparing`
- `delivering`
- `delivered`
- `cancelled`

**Transitions (commerçant)**:
- `new → confirmed | cancelled`
- `confirmed → preparing | cancelled`
- `preparing → delivering | delivered | cancelled`
- `delivering → delivered | cancelled` *(à garder possible pour flexibilité; peut être resserré)*

**Règles**:
- le client (anonyme) ne change pas le statut
- toutes les transitions génèrent un événement (audit) pour support

---

## 9) Données & modèle (V1 — logique)
> Objectif: base simple, scalable, compatible Supabase + RLS.

### Tables principales (suggestion)
- `merchants`: profil + `shop_slug` unique + statut actif
- `products`: `merchant_id`, nom, prix, image, description, catégorie, `is_active`
- `orders`: `merchant_id`, infos client, livraison/retrait, adresse, total, `status`, `tracking_token`, timestamps
- `order_items`: snapshot `product_name`, `product_price`, `quantity`, `subtotal`
- `notifications`: destinataire (merchant), type, `is_read`, `order_id`, timestamps
- `plans`, `subscriptions`: **implémentés mais billing désactivé** (mode pilote)

### Décisions clés
- `order_items` doit stocker un **snapshot** (nom/prix) pour préserver l’historique.
- `tracking_token` doit être **non devinable** (pas un id incrémental exposé).

---

## 10) Sécurité & conformité (V1)
- Auth: Supabase Auth
- Autorisation: **RLS** (un commerçant voit uniquement ses données)
- Suivi client: accès uniquement via `tracking_token` (secret) + rate limiting (si nécessaire)
- Logs: audit des changements de statut de commande

---

## 11) Exigences non-fonctionnelles
- mobile-first, réseau lent (3G/4G)
- pages publiques rapides (SSR/SSG/ISR selon implémentation)
- images optimisées (CDN storage)
- disponibilité cible > 99%

---

## 12) Dashboards (récap)
### Dashboard Commerçant (V1)
- commandes (liste/détail/statuts)
- catalogue produits
- paramètres boutique
- notifications in-app

### Dashboard Admin (V1 minimal)
- gestion commerçants/boutiques (activer/désactiver)
- support lecture (boutique/commandes)
- gestion “plans/subscriptions” en **mode pilote**

---

## 13) Monétisation & Billing (implémenté mais OFF)
### Principes (période test)
- aucune limitation active
- aucun paiement actif (ni achat, ni abonnement)
- possibilité d’assigner un plan côté admin pour préparer l’activation future

### Activation future (hors V1)
- activation d’un flag `billingEnabled=true` (à définir dans config)
- application des règles de plan (limites / features)
- ajout du checkout abonnement + facturation

---

## 14) Phasage recommandé
### Phase 1 — MVP V1 (objectif: pilotes)
- ✅ **Frontend onboarding** (3 étapes: compte, boutique, produits optionnels)
- ✅ **Preview boutique** en temps réel pendant onboarding
- ✅ **State management** Zustand avec persistence
- ✅ **Validation** React Hook Form + Zod
- ✅ **Composants UI** réutilisables (Input, Select, Textarea, FileUpload, Button)
- 🔜 auth + profil boutique (backend Supabase)
- 🔜 produits + images (backend Supabase Storage)
- 🔜 boutique publique + panier + commande
- 🔜 dashboard commandes + statuts
- 🔜 tracking public `/track/[trackingToken]`
- 🔜 notifications realtime côté commerçant

**Checklist validation Phase 1**
- création boutique < 10 minutes (profil + 10 produits)
- commande end-to-end (client → commerçant → suivi)
- RLS validée (2 commerçants isolés)
- tracking token non devinable
- UX OK sur Android + réseau lent

**Rollback (Phase 1)**
- désactiver création commande côté client (mode read-only boutique) si incident

### Phase 2 — Stabilisation (V1.1)
- catégories (si besoin)
- recherche/filtre commande avancé
- exports CSV admin
- stats basiques

---

## 15) Critères d’acceptation (Definition of Done V1)
- un commerçant peut publier une boutique, ajouter des produits, recevoir des commandes, et gérer des statuts
- un client peut commander sans compte, obtenir un récap et un lien de suivi, et contacter la boutique sur WhatsApp
- sécurité RLS en place, tracking token sécurisé, performance mobile acceptable

