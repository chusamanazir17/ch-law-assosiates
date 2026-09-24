# Backend Setup & Connection Guide

This document describes how the frontend connects to Supabase and the exact
steps to make the site + CMS + office system fully live.

## Architecture (as of 2026-09-25)

There is **one data layer: Supabase**. All local JSON-file stores were removed.

| Feature | Supabase storage | Written through |
|---|---|---|
| Services catalog (`/services/*`) | `cms_services` | `/api/admin/services` (server, service-role) |
| Page hero/meta content | `cms_pages` | `/api/admin/pages` |
| Homepage sections, FAQ, testimonials | `site_settings` key `home_sections` | `/api/admin/sections` |
| Site/header/footer/WhatsApp settings | `site_settings` key `site` | `/api/admin/settings` |
| Blog posts | `posts` | `/api/admin/posts` → `posts.service` |
| Announcements | `site_announcements` | `/api/admin/announcements` |
| Inquiries | `consultation_inquiries` | `/api/inquiries`, `/api/admin/inquiries` |
| Subscribers | `subscribers` + `subscriber_categories` | `/api/reminders/subscribe`, `/api/admin/subscribers` |
| Media library | Storage `media` + `media_assets` | `/api/admin/media` (server upload) |
| Tax deadlines | `tax_deadlines` | `/api/admin/deadlines` (server CRUD) |
| Reminder history | `reminder_deliveries` | `/api/admin/reminder-history` |
| Office system (`/office`) | 20+ office tables (clients, cases, hearings, invoices, payments, stamps, attendance, …) | `/api/office/*` (16 routes) |

Content is seeded automatically: on first read, empty tables are populated
from the built-in defaults (the former `data/*.json` content).

## One-time setup steps

1. **Apply the new CMS migration.** Open the Supabase SQL Editor and run the
   contents of `supabase/migrations/20260925000001_cms_content_tables.sql`.
   (All earlier migrations are already applied on the project
   `uwqtddgrxrqoijrjapsf`.)

2. **Environment variables** (`.env.local` / hosting provider):
   - `NEXT_PUBLIC_SUPABASE_URL` — must match the project URL exactly
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — **required** for admin/office writes
   - `NEXT_PUBLIC_SITE_URL`
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
   - Optional: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

   The service-role key is server-only. Never prefix it with `NEXT_PUBLIC_`.

3. **(Recommended) Create a Supabase Auth admin.** In Supabase Dashboard →
   Authentication → Add user, then in the SQL Editor:

   ```sql
   INSERT INTO public.profiles (id, email, full_name, role)
   VALUES ('<auth-user-uuid>', '<email>', 'Administrator', 'super_admin')
   ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
   ```

   Supabase-auth admins get full RLS access (deadlines verification, storage,
   the `send-test-reminder` Edge Function). The env-credential admin
   (`ADMIN_USERNAME`/`ADMIN_PASSWORD`) works for everything routed through
   the server API but cannot invoke Edge Functions that check `is_admin`.

4. **Deploy Edge Functions** for reminder emails if not already deployed
   (`supabase/functions/*`): configure `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
   `SITE_URL`, `CRON_SECRET`, `RESEND_WEBHOOK_SECRET` as Supabase secrets and
   schedule `send-tax-reminders` via pg_cron/cron.

## Failure behavior (no silent mocks)

- If Supabase env vars are missing, public pages render built-in default
  content and every admin/office write returns a clear error.
- If a write fails, the admin UI now shows the real error message.
- There is no localStorage/JSON fallback anywhere; if data is not in
  Supabase, it does not exist.

## Verification checklist

```bash
npm run verify          # typecheck + production build
npm run dev             # then:
node scripts/smoke-test.mjs
```

Manual checks:
1. `/` renders with content served from Supabase (check `GET /api/cms/content`).
2. Edit the hero headline in `/admin/pages` → Save → reload `/` → change visible.
3. Create/edit/delete a service in `/admin/services` → check `cms_services`.
4. `/office` → Cash In / stamp sale / invoice → rows appear in Supabase tables.
5. Submit a consultation inquiry → row appears in `consultation_inquiries`.
