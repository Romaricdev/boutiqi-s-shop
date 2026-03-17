# Boutiqi (Boutiki) — Setup & démarrage

Ce repo contient la base du projet **Boutiqi** (SaaS “boutique WhatsApp” — V1 Order Manager).

## Prérequis
- Node.js **18+** (recommandé: 20+)
- npm (ou pnpm/yarn si tu préfères, mais scripts fournis pour npm)

## Installation

```bash
npm install
```

## Variables d’environnement
- Copie `.env.example` vers `.env.local`
- Remplis les valeurs Supabase.

> Important: on ne commit **jamais** `.env.local`.

## Lancer en dev

```bash
npm run dev
```

## Scripts utiles
- `npm run lint`
- `npm run typecheck`
- `npm run format`
- `npm run build`

## Structure (high-level)
- `src/app/` — Next.js App Router (routes)
- `src/components/` — UI components
- `src/lib/` — clients/config (Supabase, helpers)
- `src/styles/` — styles globaux + tokens

## Références produit
- PRD: `PRD.md`

