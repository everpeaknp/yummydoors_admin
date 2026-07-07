# YummyDoors Admin Agent Guide

## Purpose

This repo is the super-admin console for YummyDoors.

Primary responsibilities:

- merchant application approvals
- restaurant/category/menu ingestion
- promo and homepage merchandising control
- reservation oversight
- future moderation and coupon operations

## Read This First

Before broad scans, read:

- `.codex/context/project-purpose.md`
- `.codex/context/repo-map.md`
- `.codex/context/current-state.md`
- `.codex/context/admin-flows.md`
- `.codex/context/backend-contracts.md`
- `.codex/context/known-pitfalls.md`

## Repo Boundary

Sibling repos:

- `../yummydoors_backend` = admin API source of truth
- `../yummydoors_desktop` = customer + merchant web app
- `../yummydoors_mobile` = Flutter app

This repo is not the merchant portal and not the customer site.

## Verify First

Useful checks:

```bash
git status --short
npm run dev
npm run build
rg -n "admin/login|merchant-applications|api/proxy" app components lib
```

## Working Rules

- Admin auth should use the backend admin login contract.
- When approvals or ingestion look empty, verify backend auth and API origin before assuming missing data.
- Keep admin UX operational and dense; this is not the marketing-facing frontend.
