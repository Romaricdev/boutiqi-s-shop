# Spécification — Comptabilisation des clics sur le lien boutique

**Statut** : à implémenter (backend Supabase + Next.js)  
**Contexte** : permettre au commerçant de savoir combien de personnes ont ouvert le lien partagé (WhatsApp, SMS, etc.).

---

## 1. Objectif

Compter **combien de fois** le lien « boutique » a été **ouvert** lorsqu’il est partagé, et afficher ces métriques dans le dashboard commerçant (remplacement ou complément des valeurs mockées actuelles).

---

## 2. Principe produit

- Le commerçant partage un **lien de tracking** qui :
  1. enregistre l’événement **clic** côté serveur ;
  2. redirige en **302** vers la boutique publique `/shop/[slug]`.

- L’URL finale vue par le client reste la boutique ; seul le **premier saut** passe par le tracker.

---

## 3. Flux technique

1. **URL publique de tracking** (recommandé)  
   `GET https://{domaine}/r/{shop_slug}`

   Variante : `GET /api/go?slug=...` (moins lisible pour le partage).

2. **Handler**  
   - Route Handler Next.js **ou** Edge Function Supabase.  
   - Vérifier que `slug` correspond à une boutique existante.  
   - Insérer un enregistrement (voir §5) ou mettre à jour un agrégat.  
   - Répondre **302** avec `Location: /shop/{slug}` (URL absolue en prod).

3. **Dashboard**  
   - Lire les agrégats (jour / 7 jours / 30 jours) pour afficher « clics sur le lien », « nouveaux clics aujourd’hui », etc.

---

## 4. Intégration UI (post-backend)

- **Mon lien boutique** : lien copié, QR code et partage WhatsApp pointent vers `https://{domaine}/r/{slug}`.  
- Paramètre optionnel pour la source :  
  `https://{domaine}/r/{slug}?src=whatsapp` → stocker `source = whatsapp`.

---

## 5. Modèle de données (Supabase)

### 5.1 Table `shop_link_clicks` (événements bruts)

| Colonne        | Type           | Notes                          |
|----------------|----------------|--------------------------------|
| `id`           | `uuid` PK      |                                |
| `shop_id`      | `uuid` FK      | → `shops.id`                   |
| `occurred_at`  | `timestamptz`  | défaut `now()`                 |
| `referrer`     | `text` nullable| header `Referer` si présent    |
| `user_agent`   | `text` nullable| filtrage bots (phase 2)        |
| `source`       | `text` nullable| ex. `whatsapp`, `copy`, `qr`   |

**Index** : `(shop_id, occurred_at DESC)`.

### 5.2 Agrégation (optionnel, performance)

Table ou vue `shop_link_click_daily` :

| Colonne         | Type   |
|-----------------|--------|
| `shop_id`       | `uuid` |
| `day`           | `date` |
| `click_count`   | `int`  |

Mise à jour : trigger sur insert, ou job cron (Edge Function).

---

## 6. Sécurité (RLS)

- **Insert** : réservé au **serveur** (service role) via Route Handler ou Edge Function — éviter insert public anonyme direct pour limiter le spam.  
- **Select** : le commerçant ne lit que les lignes liées à sa boutique (`auth` → `merchant` → `shop`).

---

## 7. Anti-abus (phase 2)

- Rate limiting par IP sur `/r/[slug]` (middleware Vercel ou Edge).  
- Heuristique simple sur `User-Agent` (bots).  
- Déduplication optionnelle : fenêtre courte IP + slug (ex. 1 minute) si besoin.

---

## 8. Métriques affichables

- Clics **aujourd’hui**, **7 jours**, **30 jours**.  
- Répartition par `source` si `?src=` est utilisé.  
- Plus tard : rapprochement approximatif « clics → commandes » (fenêtres temporelles).

---

## 9. Vie privée / conformité

- Mentionner dans les CGU / politique de confidentialité la collecte de **statistiques d’accès** sur les liens de redirection.  
- Éviter de conserver l’IP en clair si possible ; sinon durée de rétention + anonymisation.

---

## 10. Ordre d’implémentation suggéré

1. Créer la table `shop_link_clicks` + RLS.  
2. Implémenter `GET /r/[slug]` (log + redirect 302).  
3. Remplacer lien copié / QR / partage par l’URL `/r/{slug}`.  
4. API ou requêtes agrégées pour le dashboard.  
5. Rate limit + agrégation quotidienne si le volume l’exige.

---

## 11. Références internes

- Dashboard commerçant : carte « Mon lien boutique » (`src/app/dashboard/page.tsx`).  
- Storefront : `/shop/[slug]`.
