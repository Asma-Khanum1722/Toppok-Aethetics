# Toppko Aesthetics — B2B Clinic & Practitioner Portal

A high-performance, accessible, static web platform and product catalogue for **Toppko Aesthetics**, an aesthetic, dermal, and clinic product supplier serving licensed medical practitioners, dermatologists, and aesthetic clinics across Pakistan.

Designed and engineered under the **Hallmark design system** (CUSTOM visual parent mode), prioritizing clinical authority, zero-hallucination inventory accuracy, and streamlined WhatsApp inquiry workflows.

---

## 1. Key Architectural Features

- **Zero Runtime Dependencies:** Built strictly with vanilla HTML5, modern CSS, and lightweight client-side JavaScript. Zero client-side JavaScript frameworks (no React, Next.js, or Vue runtime overhead).
- **Static Site Generator (`build.js`):** A custom Node.js build pipeline compiles the entire site from structured data (`/data/*.json`) into static HTML files in `/dist/`.
- **Zero Config Deployment:** Fully compatible with Vercel, Netlify, and Cloudflare Pages out of the box with `vercel.json` pre-configured.
- **Hallmark Design System Certified:**
  - 100% compliant with strict Hallmark design gates (0 FAIL, 0 REFLEX violations).
  - Typographic discipline: strictly 3 weights of Archivo (400 Regular, 600 SemiBold, 800 Bold); zero external font CDNs (self-hosted WOFF2).
  - Strict 4px spatial rhythm (`--space-3xs` through `--space-4xl`).
  - Single primary button rule with high-contrast outline hierarchy for secondary actions.
  - Complete WCAG AA contrast compliance across all tinted and flood states.
- **Dual Conversion Protocol:** Every product card and dedicated detail page connects to the primary WhatsApp line (`0327-7319079`) via direct inquiry links and a multi-item persistent **Clinic Inquiry List** drawer (persisted via `localStorage`).
- **Empty Division Suppression & Auto-Revelation:** Skincare division is cleanly suppressed while zero products exist; automatically surfaces across global navigation, filter tabs, and `sitemap.xml` the moment items are added to `data/products.json`.

---

## 2. Quick Start & Commands

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
Clone or navigate to the project directory:
```bash
git clone <repository-url>
cd "toppok website"
npm install
```

### Build & Test Commands
```bash
# Start local development server with auto-rebuild on file changes
npm run dev

# Compile the entire static website into /dist/
npm run build

# Run the Empty Division Test (verifies suppression and auto-revelation)
npm test

# Run static Hallmark sloplint design audit
npx sloplint dist/index.html dist/style.css --genre modern-minimal

# Run rendered multi-viewport Hallmark sloplint audit (requires puppeteer-core + Chrome)
npx sloplint dist/index.html dist/style.css --genre modern-minimal --render
```

---

## 3. Deployment Guide

### Vercel (Zero-Config)
1. Push the repository to GitHub / GitLab.
2. Import the project into Vercel.
3. Configure Project Settings:
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Set Environment Variable:
   - `SITE_URL`: `https://toppkoaesthetics.com` (or your production domain).
5. Deploy. `vercel.json` provides pre-configured Content Security Policy (CSP), frame options, and cache-control headers.

### Netlify
1. Create a new site from your Git repository.
2. Build Settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Environment variables:
   - `SITE_URL`: `https://toppkoaesthetics.com`

### Cloudflare Pages
1. Connect repository in Cloudflare Dashboard > Pages.
2. Build Settings:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variable:** `SITE_URL` = `https://toppkoaesthetics.com`

---

## 4. Product Catalog Management

All catalogue data lives in `/data/products.json`.

### Adding a New Product
Append an object to the array in `/data/products.json`:
```json
{
  "id": "rejouve-skin-booster",
  "name": "Rejouve PDRN Skin Booster",
  "divisionSlug": "clinical",
  "groupSlug": "skin-rejuvenation",
  "categorySlug": "skin-booster",
  "specification": "5 vials x 3 ml",
  "description": "High-concentration polynucleotide formulation for intradermal tissue repair.",
  "keyPoints": [
    "Polydeoxyribonucleotide (PDRN) active complex",
    "Intended for professional mesotherapy administration",
    "Cold-chain distribution packaging"
  ],
  "image": "images/products/rejouve-skin-booster.svg",
  "imageSource": "generated-illustration",
  "isPrescriptionOnly": false,
  "hasDedicatedPage": false
}
```

### Dedicated Product Pages
To generate an individual deep-dive landing page (e.g. `/products/profhilo/index.html`):
- Set `"hasDedicatedPage": true`.
- Run `npm run build`. The builder automatically compiles the page with rich clinical specifications, key points, JSON-LD Schema, and custom WhatsApp inquiry prefill.

### Regulated / Prescription Medicines (POM)
- For prescription-only injectables (such as Mounjaro / Tirzepatide), set `"isPrescriptionOnly": true`.
- The frontend will badge the item with a prominent scarlet Rx badge and enforce licensed practitioner verification.
- **Emergency Legal Killswitch:** In `/data/site.json`, set `"hidePrescriptionOnly": true` to completely remove all POM items from public display and sitemaps.

---

## 5. Skincare Division & Auto-Revelation

The client requested face wash and serums to be categorized under a separate **Skincare** division. To adhere to strict zero-hallucination standards, no placeholder products were invented.

### How Auto-Revelation Works:
1. When `data/products.json` contains **0** items with `"divisionSlug": "skincare"`, the Skincare division is cleanly suppressed from:
   - Header navigation
   - Division filter tabs on `/products/`
   - `sitemap.xml`
2. To activate the Skincare division:
   - Copy or merge the sample records in `/data/_skincare.sample.json` into `/data/products.json`.
   - Run `npm run build`.
   - The Skincare division immediately reveals in all menus, landing pages, and sitemaps.

---

## 6. Updating Contact & WhatsApp Information

All global contact details, phone numbers, and WhatsApp prefill strings are centralized in `/data/site.json`:

```json
{
  "brandName": "Toppko Aesthetics",
  "primaryPhone": "0327-7319079",
  "whatsAppRaw": "923277319079",
  "secondaryPhone": "0336-0672712",
  "email": "toppkoaesthetic@gmail.com",
  "address": "LG-03 Business City Plaza",
  "publishLocalBusinessSchema": false
}
```

- **Changing Primary WhatsApp:** Updating `primaryPhone` and `whatsAppRaw` automatically updates every CTA button, header link, inquiry drawer payload, and footer across all 29+ generated pages.
- **LocalBusiness Schema Lock:** Once the physical facility address is verified by client leadership (see `NEEDS_CONFIRMATION.md`), toggle `"publishLocalBusinessSchema": true` to output Schema.org JSON-LD structured data.

---

## 7. Directory Structure

```
├── .agents/                    # Hallmark design engine and audit scripts
├── data/
│   ├── site.json               # Master site metadata and contact configuration
│   ├── catalog.json            # Division > Group > Category hierarchy & hues
│   ├── products.json           # Master product dataset (84 verified items)
│   ├── images.json             # Image source mappings and resolution tiers
│   └── _skincare.sample.json   # Test payload for Skincare auto-revelation
├── fonts/                      # Self-hosted Archivo Variable WOFF2 font
├── public/                     # Static assets (images, icons, brand marks)
│   ├── brand/                  # Vector brand marks and favicon assets
│   ├── images/
│   │   ├── products/           # Reseller photos, flyer crops & SVG illustrations
│   │   └── source/             # Raw client flyers (pok1 through pok4)
├── reference/                  # Client source files (Excel catalogue & prototype)
├── app.js                      # Client JavaScript (drawer, filters, storage)
├── base.css                    # Base styles, resets, reduced motion, typography
├── tokens.css                  # Hallmark spatial rhythm and color tokens
├── style.css                   # Main responsive stylesheet
├── build.js                    # Static Site Generator (SSG) compiler
├── package.json                # Project manifest and scripts
├── vercel.json                 # Vercel deployment and security header config
├── design.md                   # Locked design system and token specification
├── NEEDS_CONFIRMATION.md       # Client blockers, conflicts & confirmation tracker
└── README.md                   # This documentation
```

---

## 8. License & Attribution

- **Website Source Code:** Proprietary to Toppko Aesthetics.
- **Mounjaro (Tirzepatide) Packshot:** Licensed under CC BY-SA 4.0 (Raimond Spekking). Full citation and license terms documented on `/credits/index.html`.

