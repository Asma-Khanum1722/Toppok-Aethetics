# TOPPKO AESTHETICS — B2B Clinic & Practitioner Portal

A high-performance, editorial luxury web platform and product procurement portal for **Toppko Aesthetics**, providing certified aesthetic, dermal, and medical supplies directly to licensed practitioners, dermatologists, and aesthetic clinics.

---

## 1. Overview & Architecture

Designed with a high-fashion, editorial beauty aesthetic inspired by luxury skincare and clinical minimalism:

- **Veloura Editorial Visual Language**: Rich warm mocha grounds (`#3E322A`), floating cream pill navigation (`#EDE6DD`), and high-visibility electric chartreuse action triggers (`#D4E84A`).
- **Screen & Viewport Fitted**: The hero and category showcase sections are engineered to fit gracefully within laptop viewports (`100vh`) with zero above-the-fold clipping, while adapting smoothly to tablet and mobile screens.
- **Pure Native Performance**: Zero heavy framework overhead (no React, Next.js, or Vue runtime dependencies). Built strictly with clean semantic HTML5, modern CSS with custom design tokens, and lightweight ES6+ motion script.
- **Dual Direct Inquiries**: Instant WhatsApp procurement line (`0327-7319079`), secondary stock line (`0336-0672712`), and direct Gmail web compose integration.

---

## 2. Page Directory

| File | Route | Description |
| :--- | :--- | :--- |
| `index.html` | `/` | Editorial hero, infinite luxury marquee, featured portfolio matrix, and clinic requisition form. |
| `products.html` | `/products` | Live searchable clinic inventory with real-time keyword filtering, category tabs, and modal inspection. |
| `skin-booster.html` | `/skin-booster` | Category focus on Hyaluronic Acid bio-remodelling, Polynucleotides (PN), and PLLA tissue restorers. |
| `contact.html` | `/contact` | Official procurement channels, verified desk contacts, and structured requisition builder. |

---

## 3. Communication & Requisition Architecture

### Direct-to-Gmail Web Compose
All official email channels on the website (`toppkoaesthetic@gmail.com`) trigger direct **Gmail Web Compose**:
- **Recipient (`To`)**: `toppkoaesthetic@gmail.com`
- **Subject**: Pre-formatted clinic requisition tag
- **Body**: Pre-typed inquiry with practitioner details
- **Zero Configuration**: Works without third-party email APIs, DNS TXT/MX records, or external SMTP servers.

### Structured Requisition Builder
The interactive requisition form on `index.html` and `contact.html` formats incoming orders into structured bullets:
1. Practitioner enters Doctor/Clinic name, WhatsApp phone number, and requested items.
2. Clicking **Submit Clinic Requisition** immediately generates:
   - **Send via WhatsApp**: Instant batch allocation with formatted order bullets.
   - **Send via Gmail**: Launches Gmail with all order fields pre-filled in the message body.
   - **Copy Order Text**: One-tap clipboard copy for quick messaging.

---

## 4. Local Development

### Prerequisites
- Node.js >= 16.0.0

### Run Local Development Server
```bash
# Start zero-cache local server on http://localhost:3000/
node dev.js
```

Or run via npm:
```bash
npm run dev
```

---

## 5. Deployment Guide

### Vercel (Recommended)
1. Push this repository to GitHub.
2. Import repository in [Vercel](https://vercel.com).
3. Framework Preset: **Other** / **Static Site**.
4. Output Directory: `.` (root).
5. Click **Deploy**.

### Netlify
1. Connect repository in [Netlify](https://netlify.com).
2. Build Command: Leave blank (static).
3. Publish Directory: `.` (root).
4. Click **Deploy Site**.

### Static Hosting / Apache / Nginx
Upload all files in the root directory directly to your web server's `public_html` or document root.

---

## 6. Project Structure

```text
├── index.html              # Main landing & hero portal
├── products.html           # Full clinic inventory with live search
├── skin-booster.html       # Category showcase (Skin Boosters)
├── contact.html            # Contact & clinic requisition
├── style.css               # Core styling & responsive system
├── tokens.css              # Color tokens, typography, and spacing variables
├── dev.js                  # Local dev server with route rewriting & API
├── api/
│   └── requisition.js      # Serverless requisition endpoint
├── public/
│   ├── css/                # Supplemental styles
│   ├── images/             # Optimized WebP & JPG visual assets
│   │   ├── hero/           # Hero model portraits & treatment thumbs
│   │   └── products/       # Studio product packaging photos
│   └── js/                 # Pure ES6+ motion & navigation engine
├── .env.example            # Environment template
└── .gitignore              # Ignored secrets & temporary files
```

---

## 7. License & Rights

&copy; TOPPKO AESTHETICS. All rights reserved. Direct practitioner procurement & clinic distribution.
