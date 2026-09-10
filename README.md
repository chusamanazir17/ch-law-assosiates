# LegalAssist Pakistan — Legal Documentation Website

A premium, fully responsive marketing website for a Pakistani legal documentation firm
(E-Stamping, property registry, business registration, tax, banking, family law,
trademark/IPO), built with **Next.js 14 (App Router) + TypeScript**, **Tailwind CSS**,
**Material UI (MUI) v6**, and **Framer Motion**.

## Tech stack

| Concern            | Choice |
| ------------------ | ------ |
| Framework          | Next.js 14 (App Router, RSC, static export of all pages) |
| Language           | TypeScript (strict) |
| Styling            | Tailwind CSS v3 + custom navy/gold design tokens |
| Component library  | Material UI v6 (AppBar, Menu mega-dropdown, Drawer, Buttons, Chips) via the App Router emotion cache |
| Animation          | Framer Motion (scroll reveals, stagger grids, parallax hero, hover lifts, scroll progress bar) |
| Icons              | Lucide React (+ a few MUI icons) |
| Fonts              | Inter + Playfair Display via `next/font` |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build
npm run start      # serve the production build
```

## Routes

| Route | Page |
| ----- | ---- |
| `/` | Landing page (hero, services, prepare-before-visit, trust, CTA, office) |
| `/services/e-stamping` | E-Stamp & Stamp Paper Services |
| `/services/property-land` | Property & Land Services |
| `/services/registry-deeds` | Registry & Deeds |
| `/services/business-registration` | Business Registration (SECP/FBR) |
| `/services/tax` | Tax Services (NTN, filing, sales tax, audit) |
| `/services/banking-financial` | Banking & Financial Documentation |
| `/services/family-legal` | Family & Legal Documents |
| `/services/legal-documentation` | Legal Documentation & Certification |
| `/services/trademark-ipo` | Trademark & IPO Registration |

Extras: custom 404 (`app/not-found.tsx`), route loading UI, `sitemap.xml`, `robots.txt`.

## Project structure

```
app/                       # App Router pages
  layout.tsx               # fonts, theme registry, header/footer, scroll progress
  page.tsx                 # landing page
  services/<slug>/page.tsx # 9 service pages
components/
  layout/                  # Header (MUI mega-menu + mobile drawer), Footer
  motion/                  # FadeIn, Stagger, ScrollProgress primitives (Framer Motion)
  ui/                      # PageHero, ServiceCard, NoticeBar, SplitShowcase, contact blocks …
theme/                     # MUI theme + ThemeRegistry (emotion cache)
lib/site.ts                # All content: contact info, navigation, service catalogue, images
```

## Design system

- Navy `#0b1d38` / gold `#c8973d` palette defined as Tailwind colors (`navy-*`, `gold-*`)
  and mirrored in the MUI theme.
- Reusable class components in `globals.css` (`btn-gold`, `btn-navy`, `btn-outline-*`,
  `eyebrow`, `section-title`, `card-base`).
- Shared content lives in `lib/site.ts` — change phone numbers, address, hours, nav and
  hero imagery in one place.

## Animation notes

- `FadeIn` / `Stagger` animate in on scroll (`whileInView`, once) with configurable
  direction/delay.
- Heroes use a slow Ken-Burns scale-in; the home hero adds scroll parallax.
- Cards lift on hover with a gold top-accent reveal; the top scroll-progress bar tracks
  page position.
- Entrance transforms are clipped with `overflow-x: hidden` on `html`/`body` so
  off-screen slide-ins never cause mobile horizontal scroll.

> MUI styles and Tailwind's (unlayered) preflight coexist via normal specificity:
> MUI's class selectors win over element resets, while Tailwind utilities still override
> MUI component styles where applied.

## Dev tooling (optional)

`scripts/` contains Puppeteer screenshot/audit helpers used during development
(requires `npx puppeteer browsers install chrome`). They are not part of the app.
