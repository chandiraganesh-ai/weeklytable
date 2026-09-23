# Weekly Table

A meal-delivery ordering platform: customers pre-order meals (at least 1 day ahead of delivery, cutoff TBD) by picking a pricing tier and that many dishes, paying once via Stripe. No customer accounts. An admin panel manages orders, the menu, and pricing.

This is a full rebuild of an earlier static-HTML MVP — see `/Users/ganeshkumarcr/.claude/plans/i-want-to-build-expressive-wall.md` for the full architecture plan (data model, order flow, admin panel design, GDPR notes, phased rollout).

## Stack

Next.js (App Router, TypeScript) + Tailwind CSS, deployed on Vercel. Postgres (Neon) + Prisma and Stripe Checkout land in later phases.

## Local development

```
npm install
npm run dev
```

Open http://localhost:3000.

## Status

**Phase 1 in progress:** bare scaffold, no database, no payments yet. See the plan doc for what's next.
