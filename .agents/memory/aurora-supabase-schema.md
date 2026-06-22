---
name: Aurora Supabase backend was never provisioned
description: The Perform Anywhere / Aurora app depends on a Supabase schema that has no CREATE-TABLE source in the repo; how it was reconstructed and the access/security model.
---

# Aurora's Supabase backend must be created manually

The app (`artifacts/perform-anywhere` frontend + `artifacts/api-server` backend) stores
all data and files in **Supabase**, but the repo never contained any table-creation SQL —
only `ALTER TABLE ... ADD COLUMN` migrations that assume the tables already exist. A fresh
Supabase project is therefore completely empty, and every feature fails with
`42P01 relation "projects" does not exist`. Symptoms the user sees: "generations fail",
renders "disappear / never resume" (poll queries error out).

**Canonical fix:** `artifacts/api-server/migrations/000_init_schema.sql` is the
reconstructed, complete, idempotent setup (tables, storage buckets, RLS policies, grants,
credit RPCs). It was rebuilt purely from how the code reads/writes Supabase, and reviewed
by the architect.

**Why it must be run by the user in the Supabase SQL editor:** the agent only has the
**anon / publishable** key (`SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY`). No service-role
key and no DB connection string ⇒ the agent **cannot run DDL** itself. There is no
programmatic path; the user pastes the SQL into the dashboard once.

**Access / identity model (non-obvious):**
- No user login. Each browser generates a `client_id` UUID (localStorage) that scopes its
  rows. Server validates only the UUID *format*, not ownership.
- The **anon key is used from both the browser and the server**. So tables need RLS enabled
  with permissive `to anon, authenticated using(true)` policies, table/sequence grants, and
  a `storage.objects` policy covering the private `uploads` + `renders` buckets (signed-URL
  creation needs SELECT).

**Security debt (only matters if paid credits/Paystack are enabled):** because the browser
holds the anon key, granting `execute` on `public.grant_credits(...)` to `anon` lets anyone
mint credits from DevTools. **How to apply:** only harden this once the server is switched
to a `SUPABASE_SERVICE_ROLE_KEY` client for the webhook/refund paths, then revoke
`grant_credits` execute from anon/authenticated and grant to `service_role`. Do NOT revoke
in isolation or Paystack grants/refunds break. Currently dormant (text/image are free,
video render path uses no credits), so left functional intentionally.

**`DATABASE_URL` / `PG*` env vars point at Replit's internal Postgres, NOT Supabase** — do
not confuse them when probing.
