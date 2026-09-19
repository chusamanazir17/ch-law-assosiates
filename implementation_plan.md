# Comprehensive CMS Refinement & Landing Page Content Control Implementation Plan

## Goal Description
Transform the existing admin dashboard into a lightweight, robust, section-based page-builder CMS so the non-technical tax consultant/website owner can manage almost all visible content across the public landing page, header, footer, services, FAQs, testimonials, blog/posts, CTA buttons, SEO, and WhatsApp settings without editing source code, while preserving the existing design system, performance, and responsive layout.

---

## User Review Required
> [!IMPORTANT]
> - **Zero Disruption to Existing Design**: The public visual design and theme (navy/gold/slate aesthetics, typography, animations, responsive layout) remain 100% intact.
> - **No Third-Party Bloat**: No complex drag-and-drop builders or heavy dependencies. All editing happens through clean, structured, responsive forms with instant live validation.
> - **Default Fallbacks**: If any CMS field is empty, the website gracefully falls back to existing default content, ensuring zero downtime or broken layouts.

---

## Proposed Changes

### 1. Data Layer & Store Expansion
#### [NEW] [`lib/db/homeSectionsStore.ts`](file:///c:/Users/HP/OneDrive/Desktop/Ch-Law-FINAL-audited-clean/Ch-Law-audited/lib/db/homeSectionsStore.ts)
- Atomic file-backed store for all homepage sections in `data/homeSections.json`.
- Manages structured section data:
  - **Hero**: Eyebrow badge, Main headline (H1), Highlight text, Subtitle, Primary CTA, Secondary CTA (WhatsApp), Trust badges.
  - **Services Section**: Section title, subtitle, visibility toggle.
  - **About / Process ("Prepare Visit")**: Badge, title, description, step-by-step guidance, buttons, office card, building image, advisor contacts.
  - **Why Choose Us ("Why Trust")**: Title, experience metric, image, 4 feature benefit cards.
  - **Tax Reminders Section**: Title, subtitle, visibility toggle.
  - **Testimonials Section**: Title, subtitle, visibility toggle, testimonial items (client name, role, text, rating, image, visibility).
  - **FAQ Section**: Title, subtitle, visibility toggle, FAQ items (question, answer, order, visibility).
  - **Office Location Section**: Title, subtitle, address text, hours, checklist points, map coordinates/link, buttons, visibility.
  - **Final CTA / Contact Section**: Title, description, contact cards, consultation form toggle, visit office button, visibility.
  - **Section Ordering**: Safe ordering array for landing-page sections.

#### [MODIFY] [`lib/db/siteSettingsStore.ts`](file:///c:/Users/HP/OneDrive/Desktop/Ch-Law-FINAL-audited-clean/Ch-Law-audited/lib/db/siteSettingsStore.ts)
- Add dedicated `whatsappSettings` (phone number, default message, floating button enabled, floating button message, section-specific messages).
- Add `headerSettings` (logo text, logo subtitle, phone, whatsapp, primary CTA button text, link, enabled).
- Add `footerSettings` (short description, copyright text, social links, contact display).

#### [MODIFY] [`app/api/cms/content/route.ts`](file:///c:/Users/HP/OneDrive/Desktop/Ch-Law-FINAL-audited-clean/Ch-Law-audited/app/api/cms/content/route.ts)
- Return `homeSections` alongside `settings`, `services`, and `pages`.

#### [NEW] [`app/api/admin/sections/route.ts`](file:///c:/Users/HP/OneDrive/Desktop/Ch-Law-FINAL-audited-clean/Ch-Law-audited/app/api/admin/sections/route.ts)
- Authenticated admin endpoint for fetching and updating homepage sections, FAQs, testimonials, and section ordering.

---

### 2. Admin CMS Interface & Section Editors
#### [MODIFY] [`features/admin/PagesContentManager.tsx`](file:///c:/Users/HP/OneDrive/Desktop/Ch-Law-FINAL-audited-clean/Ch-Law-audited/features/admin/PagesContentManager.tsx)
- Upgrade into a full **Section-Based Page Builder**:
  - Section selector / tabs: **Hero**, **Services Section**, **About & Visiting Guide**, **Why Choose Us**, **Tax Reminders**, **Testimonials**, **FAQ**, **Office & Map**, **Final CTA**, **SEO & Social Metadata**, and **Section Ordering / Visibility**.
  - Structured form controls with labels, tooltips, validation, character counters, and live preview cards.
  - Testimonial item manager (add, edit, delete, rating selector, visibility).
  - FAQ item manager (add, edit, delete, reorder, visibility).
  - Section visibility switches.

#### [MODIFY] [`features/admin/SiteSettingsManager.tsx`](file:///c:/Users/HP/OneDrive/Desktop/Ch-Law-FINAL-audited-clean/Ch-Law-audited/features/admin/SiteSettingsManager.tsx)
- Add dedicated **WhatsApp Management Tab**:
  - Phone number input with auto-formatting and validation.
  - Default WhatsApp message input.
  - Floating WhatsApp button toggle and custom tooltip text.
  - Section message overrides.
  - Live link generator preview (`https://wa.me/923057902744?text=...`).
- Add **Header & Navigation Management Tab**:
  - Logo text & badge customization.
  - Nav links management (labels, targets, show/hide, reorder).
  - Main CTA button customization.
- Add **Footer Management Tab**:
  - Description, contact details, working hours, copyright text.

#### [MODIFY] [`features/admin/AdminSidebar.tsx`](file:///c:/Users/HP/OneDrive/Desktop/Ch-Law-FINAL-audited-clean/Ch-Law-audited/features/admin/AdminSidebar.tsx)
- Ensure direct navigation to all CMS sections (Homepage Sections, Services, Posts, Media, WhatsApp & Settings, Inquiries, Reminders).

---

### 3. Public Landing Page & Component Integration
#### [MODIFY] [`components/home/HomePageClient.tsx`](file:///c:/Users/HP/OneDrive/Desktop/Ch-Law-FINAL-audited-clean/Ch-Law-audited/components/home/HomePageClient.tsx)
- Connect all sections to `useCms().homeSections`:
  - `Hero`: renders CMS headline, highlight, subtitle, buttons, trust badges.
  - `ServicesGrid`: renders CMS title, subtitle, service items.
  - `PrepareVisit` (About): renders CMS badge, title, description, step guidance, office building card, advisor contacts, buttons.
  - `WhyTrust`: renders CMS title, metric number, metric label, image, feature cards.
  - `TaxReminderSection`: respects CMS visibility and title/subtitle.
  - [NEW Component in Home] `TestimonialsSection`: renders client reviews with stars, client name, role, quote, when enabled.
  - [NEW Component in Home] `FaqSection`: renders interactive accessible accordion with questions and answers, when enabled.
  - `OfficeSection`: renders CMS title, subtitle, address, hours, guide points, buttons.
  - `FinalCta`: renders CMS title, subtitle, contact cards, consultation form, buttons.
- Render sections according to `homeSections.sectionOrder` and `enabled` flags.

#### [MODIFY] [`components/layout/Header.tsx`](file:///c:/Users/HP/OneDrive/Desktop/Ch-Law-FINAL-audited-clean/Ch-Law-audited/components/layout/Header.tsx)
- Pull navigation links, phone, WhatsApp link, and CTA button directly from CMS settings.

#### [MODIFY] [`components/layout/Footer.tsx`](file:///c:/Users/HP/OneDrive/Desktop/Ch-Law-FINAL-audited-clean/Ch-Law-audited/components/layout/Footer.tsx)
- Pull description, contact personnel, hours, and copyright from CMS settings.

#### [MODIFY] [`components/ui/WhatsAppIcon.tsx`](file:///c:/Users/HP/OneDrive/Desktop/Ch-Law-FINAL-audited-clean/Ch-Law-audited/components/ui/WhatsAppIcon.tsx)
- Include floating WhatsApp button that respects CMS settings (enabled/disabled, custom message).

---

### 4. SEO, Sitemap, Schema & 404
#### [MODIFY] [`components/seo/JsonLd.tsx`](file:///c:/Users/HP/OneDrive/Desktop/Ch-Law-FINAL-audited-clean/Ch-Law-audited/components/seo/JsonLd.tsx)
- Dynamically build `LegalService` / `ProfessionalService` schema from CMS settings.
- Dynamically add `FAQPage` schema when FAQ items are published.

#### [MODIFY] [`app/sitemap.ts`](file:///c:/Users/HP/OneDrive/Desktop/Ch-Law-FINAL-audited-clean/Ch-Law-audited/app/sitemap.ts)
- Include published posts from `postsStore.ts` and all active CMS pages with correct canonical URLs.

#### [MODIFY] [`app/not-found.tsx`](file:///c:/Users/HP/OneDrive/Desktop/Ch-Law-FINAL-audited-clean/Ch-Law-audited/app/not-found.tsx)
- Add WhatsApp CTA and contact link pulling from CMS settings.

---

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to verify type safety across all modified files.
- Run `node scripts/test-cms-complete.mjs` (or custom verification script) to verify API endpoints and store persistence.

### Manual Verification
1. **Admin Login**:
   - Navigate to `/admin/login` and log in.
2. **Homepage Sections Editor**:
   - In `/admin/pages`, open the Homepage section editor.
   - Edit Hero headline, change button text, update About section steps, update Why Trust metric.
   - Add/edit a Testimonial and an FAQ item.
   - Toggle section visibility (e.g. Testimonials on, FAQ on).
   - Click Save.
3. **Public Landing Page Verification**:
   - Open `/` in browser.
   - Confirm Hero displays edited headline and buttons.
   - Confirm About section displays updated content and working WhatsApp/Call buttons.
   - Confirm Testimonials and FAQ sections appear with proper accordion and stars.
   - Confirm WhatsApp links have correct encoded messages.
4. **WhatsApp Settings**:
   - Update WhatsApp number and default message in `/admin/settings`.
   - Verify that all WhatsApp buttons on the landing page update to the new number and encoded message.
5. **SEO & Sitemap**:
   - Check `/sitemap.xml` returns valid XML including home, services, and posts.
   - Check Google JSON-LD schema on `/` contains business details and FAQPage schema.
