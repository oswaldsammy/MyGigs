# MyGigs

Two-sided musician marketplace. Two React apps share one Supabase backend.

## Structure

```
mygigs/
  packages/
    client-app/        Client-facing React app (Vite, port 5173)
    musician-app/      Musician-facing React app (Vite, port 5174)
    shared/            Shared Supabase client, types, hooks, utils
  supabase/
    migrations/        SQL migrations (schema, RLS, storage)
    seed.sql
```

## Setup

1. `pnpm install`
2. Copy `.env.example` to `.env` in each app folder, fill in Supabase keys
3. Apply migrations in the Supabase dashboard (or via Supabase CLI) in order:
   - `0001_init.sql`
   - `0002_rls.sql`
   - `0003_storage.sql`
4. Run the apps:
   - `pnpm dev:client` — client app on http://localhost:5173
   - `pnpm dev:musician` — musician app on http://localhost:5174

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · React Router v6 · React Hook Form · Supabase (DB, Auth, Realtime, Storage)

## Payments

Placeholder only. See `src/services/payments.ts` in each app — all functions are empty stubs marked `PAYMENT GATEWAY — TO BE INTEGRATED`.
