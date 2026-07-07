# Backend Contracts

Primary backend repo:

- `../yummydoors_backend`

Admin should rely on:

- dedicated admin login route
- admin-scoped approval and management endpoints

When admin data does not show up:

1. verify login used admin auth route
2. verify stored token is from admin login
3. verify API base URL
4. verify backend route returns records for that environment

The admin repo should never infer approval state purely from frontend assumptions.
