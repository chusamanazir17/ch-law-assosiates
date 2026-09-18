# Ch Composing Estamp and Tax Advisor

Production-oriented full-stack service and information website for Ch Composing Estamp and Tax Advisor in Sahiwal, Pakistan. The project uses the Next.js App Router, TypeScript, Tailwind CSS, Material UI, Supabase authentication/database services, and Supabase Edge Functions for reminder workflows.

## Technology

- Next.js 15.5.25
- React 19.3
- TypeScript 5.8
- Tailwind CSS 3.4
- Material UI 6
- Framer Motion
- Supabase Auth, Postgres, RLS and Edge Functions
- Resend integration inside Supabase Edge Functions for reminder email delivery

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer
- A Supabase project for CMS, admin authentication, inquiries and reminder features
- Resend credentials if email reminders will be enabled

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The source package intentionally does not include `node_modules`, `.next`, local environment files, or a stale lockfile. Run `npm install` once on the target development/deployment machine to generate a lockfile matching the audited dependency versions in `package.json`, then commit that generated lockfile in your own repository.

## Environment variables

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
NEXT_PUBLIC_SITE_URL=https://chcomposing.pk
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

For legacy Supabase projects, `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also accepted. Never expose a Supabase service-role key, Resend API key, or other server secret through a `NEXT_PUBLIC_` variable.

## Database setup

Apply the SQL migrations in `supabase/migrations/` in filename order. The later 2026 migrations harden the original schema by removing anonymous direct inquiry inserts and restricting privileged database functions.

The application expects an administrator account to exist in Supabase Auth and for its user ID to be present in `public.admin_memberships`. Admin authorization is checked both in middleware and in protected API route handlers.

## Supabase Edge Functions

Deploy the functions in `supabase/functions/` when reminder subscriptions and email delivery are required:

- `subscribe`
- `confirm-subscription`
- `unsubscribe`
- `send-tax-reminders`
- `send-test-reminder`
- `resend-webhook`

Configure their server-side secrets in Supabase, not in the browser environment.

## Commands

```bash
npm run dev        # local development
npm run typecheck  # TypeScript validation
npm run build      # production Next.js build
npm run start      # run the production build
npm run verify     # typecheck + production build
npm run clean      # remove local Next.js/TypeScript build artifacts
```

## Main public routes

- `/`
- `/services/e-stamping`
- `/services/property-land`
- `/services/registry-deeds`
- `/services/business-registration`
- `/services/tax`
- `/services/banking-financial`
- `/services/family-legal`
- `/services/legal-documentation`
- `/services/trademark-ipo`
- `/updates`
- `/updates/[slug]`
- `/reminders/confirm`
- `/reminders/unsubscribe`

## Admin routes

The `/admin` area is protected by Supabase authentication plus the `is_admin` database authorization check. Admin pages are marked `noindex`.

CMS capabilities include posts, announcements, deadlines, inquiries, subscribers, reminder history and media. Routes that are application-defined rather than database-managed are presented as route inventories instead of pretending to persist edits that the data model does not support.

## Production notes

- Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin before deployment.
- Apply all Supabase migrations before enabling public forms.
- Configure Edge Function secrets before enabling reminder email delivery.
- Run `npm run verify` after installing dependencies in CI or on the deployment machine.
- Vercel is a suitable deployment target for the Next.js application. Supabase remains the persistent backend.

See `AUDIT_REPORT.md` for the completed code/security/UI audit summary.
