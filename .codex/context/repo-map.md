# Repo Map

## App Router Areas

- `app/(auth)/login/page.tsx` = admin login
- `app/(dashboard)/dashboard/page.tsx` = overview
- `app/(dashboard)/merchant-applications/page.tsx` = approvals queue
- `app/(dashboard)/restaurants/page.tsx` = restaurant management
- `app/(dashboard)/categories/page.tsx` = category management
- `app/(dashboard)/menu-items/page.tsx` = menu item management
- `app/(dashboard)/promos/page.tsx` = promo management
- `app/(dashboard)/reservations/page.tsx` = reservation operations

## Shared Code

- `components/` = admin UI pieces
- `lib/` = admin auth, API proxy, config helpers

The admin repo is intentionally narrower than desktop.
