# Audit and Refactor Report

## Scope

The project was reviewed as a full-stack service/information website, including public UI, responsive navigation, CMS/admin flows, API routes, Supabase access, RLS assumptions, database functions, forms, SEO metadata, accessibility, deployment configuration and source-package hygiene.

## Major corrections completed

### Security and authorization

- Protected admin API routes with authenticated administrator checks instead of relying only on the admin UI.
- Removed the previous preview-path behavior that could bypass normal admin protection.
- Kept admin authorization server-side through Supabase Auth plus the `is_admin` database function.
- Hardened public consultation submission so anonymous clients cannot insert directly into the inquiries table.
- Routed inquiry creation through a validated, rate-limited database RPC that is executable only by the server-side service role.
- Added a honeypot to public inquiry submission.
- Hardened privileged Supabase functions with explicit `search_path` handling and restricted execution grants.
- Restricted worker-only reminder functions to the service role.
- Removed placeholder Supabase credentials and centralized environment configuration.
- Added production security headers including clickjacking, MIME-sniffing, referrer and browser-permission protections.
- Removed AVIF output from application image optimization to reduce unnecessary processing surface while retaining WebP.

### Data integrity and CMS behavior

- Removed the local JSON-file database fallback from production logic. Serverless deployments now rely on the configured persistent backend instead of attempting ephemeral file writes.
- Fixed post editing so loading an existing post retrieves and preserves its real body content.
- Removed mock/demo post behavior from the real admin posts workflow.
- Ensured post create/update/delete operations use the database repository and trigger relevant route revalidation.
- Reworked Categories to derive actual categories from stored post data rather than pretending to maintain an unsupported category table.
- Converted Settings, Services and Pages sections into accurate configuration/route views where the current schema does not provide persistent editing.
- Removed fabricated subscriber/category totals and fake administrator identity presentation.
- Corrected inquiry-status filtering so it matches the statuses supported by the database schema.
- Removed unreliable base64 media fallback behavior.
- Added the missing Supabase Storage media bucket policies, external URL validation, upload rollback on database failure and storage cleanup on deletion.
- Fixed post updates to target the existing post ID so changing a slug cannot collide with the primary key.

### Reminder system

- Corrected fallback reminder-category resolution from stable slugs to database UUIDs.
- Preserved confirmation-based subscription behavior.
- Hardened confirmation and unsubscribe token handling so tokens are consumed only after dependent writes succeed.
- Changed reminder and webhook Edge Functions to fail closed when required authentication/signing secrets are missing.
- Restricted privileged scheduled-reminder functions at the database permission layer.

### UI and responsive design

- Preserved the existing navy/gold visual identity rather than replacing it with an unrelated template.
- Refined header responsive behavior so full desktop mega-navigation activates at a safer wide breakpoint and smaller laptops/tablets use the mobile drawer.
- Consolidated repeated navigation behavior.
- Fixed footer React hook-order behavior on admin routes.
- Improved modal keyboard behavior and reduced-motion accessibility.
- Improved empty states, filtering, sorting and admin form feedback.
- Added a keyboard-accessible skip link.
- Maintained responsive service-page composition and reusable design-system components.

### SEO and application structure

- Centralized the canonical site origin through environment configuration.
- Improved generated sitemap inclusion of published posts.
- Preserved route metadata and structured-data support.
- Marked the admin application as `noindex`/`nofollow`.
- Added custom loading, error and not-found handling.
- Removed broken screenshot/audit scripts tied to local Windows paths and an unneeded Puppeteer dependency.
- Removed generated previews, build caches, local dependencies, Supabase CLI temp state and TypeScript build caches from the handoff package.

### Framework baseline

- Updated the intended framework baseline to Next.js 15.5.25 and React 19.3.
- Updated MUI App Router integration for the Next.js 15 adapter.
- Updated Next.js asynchronous server APIs used by the source where required.
- Migrated Supabase SSR cookies to the current `getAll`/`setAll` adapter contract.
- Corrected the middleware `setAll` adapter to the current single-argument Supabase SSR contract.
- Ensured admin unsubscribe actions cancel queued/processing reminder deliveries and surface persistence failures.
- Aligned structured-data opening hours with the displayed business hours and centralized its canonical URL.
- Removed the old lockfile because it was pinned to Next.js 14/React 18 and contradicted the corrected `package.json`. Generate a fresh lockfile with `npm install` in the target environment.

## Validation status

TypeScript static validation passed on the refactored source before generated dependencies were removed from the final handoff package.

A clean Linux production build could not be executed inside the audit runtime because the uploaded dependency tree had been generated on Windows and did not contain the Linux Next.js SWC binary, while package-registry access in that runtime was unavailable. The final package therefore excludes that incompatible dependency tree. On a normal connected development/CI machine, run:

```bash
npm install
npm run verify
```

This is also the correct way to generate a lockfile for the updated dependency baseline.

## Deployment prerequisites

The website's persistent features are intentionally dependent on external configuration. Public CMS content, administrator login, inquiries and reminder functionality require a configured Supabase project with the included migrations applied. Email reminder delivery additionally requires the Edge Function email provider secrets.
