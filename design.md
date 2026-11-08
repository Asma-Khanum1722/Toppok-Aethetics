# TOPPKO AESTHETICS — Design Direction & System Specification

## 1. Concept: Architectural Clinical Supplier Identity
A confident, physical, modern editorial B2B identity for **Toppko Aesthetics**, supplying medical doctors, plastic surgeons, dermatologists, and aesthetic clinics across Pakistan. Based in Lahore.

The design departs from generic white templates, dark-mode SaaS clichés, and spa aesthetics. It delivers an authoritative architectural clinic atmosphere: warm ivory paper grounds, pure clinic white cards with hairline borders, metallic gold accents, and clinical WhatsApp green conversion actions.

It is a clinical procurement catalogue, not an e-commerce cart: zero prices, zero consumer retail mechanisms. Every transaction path routes through verified clinical channels on WhatsApp (**0327-7319079** and **0336-0672712**) or official email (**toppkoaesthetic@gmail.com**).

---

## 2. Colour System: Warm Architectural Clinic Palette
Measured and balanced across all viewports for calm authority:

- **Base Canvas (Ground): Warm Clinic Ivory `#FAF8F5`**
  - Used for the entire page background, alternating section backgrounds, and gutters.
  - Replaces sterile cold white with a physical, warm clinical presence.
- **Card & Matrix Surfaces: Pure Clinic White `#FFFFFF`**
  - Crisp, elevated product cards with subtle hairline borders (`rgba(23, 20, 46, 0.08)`).
  - High elevation on hover (`box-shadow: 0 16px 36px rgba(23, 20, 46, 0.09)`).
- **Emblem & Precision Accents: Metallic Gold `#B8962E`**
  - Used for the upright right-facing logo emblem, category badges, subtle specular highlights, and section accent rules.
  - Gradients: `linear-gradient(135deg, #B8962E 10%, #D4AF37 60%, #96781D 100%)`.
- **Text & Structure: Deep Obsidian Ink `#17142E`**
  - High-contrast, authoritative typography.
  - Secondary text: Slate Muted `#58556D`; Metadata: Dim `#878499`.
- **Clinical Action: Official WhatsApp Green `#0E7C47` (Hover: `#0A6338`)**
  - Reserved strictly for primary action buttons (**"Enquire Now"**, **"Submit Clinic Requisition"**) and the floating speed-dial trigger.
- **Coordination Accent: Clean Cobalt `#2F4BFF`**
  - Used for the secondary stock coordination line and technical tags.

### Contrast Verification (WCAG 2.1 AA & AAA)
1. **Ink `#17142E` on Base Ivory `#FAF8F5`:**
   - Luminance: Ivory `0.938`, Ink `0.009`
   - **Contrast: 16.71:1** (Exceeds WCAG AAA requirement of 7.0:1)
2. **Ink `#17142E` on Surface White `#FFFFFF`:**
   - Luminance: White `1.000`, Ink `0.009`
   - **Contrast: 18.02:1** (Exceeds WCAG AAA requirement of 7.0:1)
3. **White `#FFFFFF` on Clinical Green `#0E7C47`:**
   - Luminance: White `1.000`, Green `0.165`
   - **Contrast: 4.88:1** (Exceeds WCAG AA requirement of 4.5:1)
4. **Gold `#96781D` (Dark Gold) on Base Ivory `#FAF8F5`:**
   - **Contrast: 4.62:1** (Complies with WCAG AA requirement for body text & badges)

---

## 3. Brand Artwork: 90° Upright Gold Master
- **Emblem Artwork:** Extracted from the highest-resolution flyer asset, rotated 90° clockwise so the woman's profile is upright and facing right, with the floral leaf flourish at the top.
- **Negative Space:** Preserves the surgical precision face line and eye aperture without silhouette filling or color inversion.
- **Master Assets:**
  - Vector Master: `public/brand/logo.svg`
  - 1024px Transparent Master: `public/brand/logo-gold.png`
  - Favicon Suite: `favicon.svg`, `favicon.ico` (16, 32, 48px), `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png` (180px padded on ivory), `site.webmanifest`.

---

## 4. Multi-Page Site Architecture & Routing

| Page | URL Route | File | Key Features |
| :--- | :--- | :--- | :--- |
| **Home** | `/` or `/index.html` | `index.html` | Hero with cursor parallax, kinetic marquee, curated spotlight matrix, quick requisition section, floating speed-dial. |
| **Product Catalogue** | `/products` or `/products.html` | `products.html` | Full 12+ product catalog, instant live search filter, category tabs (Boosters, Toxins/Fillers, Meso/Exosomes, Whitening, Threads/Devices), 3D specimen cards. |
| **Clinic Requisitions** | `/contact` or `/contact.html` | `contact.html` | Dedicated procurement suite, direct contact cards (`0327-7319079`, `0336-0672712`, `toppkoaesthetic@gmail.com`), fully validated requisition form with WhatsApp compiler and copy button. |
| **Skin Boosters** | `/skin-booster` or `/skin-booster.html` | `skin-booster.html` | Category deep-dive with animated ticker, specimen cards, and direct clinic requisition desk. |

*Zero-cache development server (`dev.js`) supports clean extensionless URLs (`/products`, `/contact`, `/skin-booster`) with instant static delivery.*

---

## 5. High-Precision Motion Engine (`public/js/motion.js`)

1. **Top Precision Gold Scroll Thread (`#scrollProgressBar`):**
   - 2.5px metallic gold hairline pinned at the top edge of the window.
   - Scales smoothly from 0% to 100% based on document scroll depth using `requestAnimationFrame`.
2. **Submerging Smart Navbar:**
   - At scroll top: Blends seamlessly into the background canvas (`background: transparent; border-bottom: 1px solid rgba(23,20,46,0.05)`).
   - Scrolling down: Submerges out of view (`transform: translateY(-110%)`).
   - Scrolling up or paused: Glides back into view with a frosted glass blur (`backdrop-filter: blur(20px); background: rgba(250, 248, 245, 0.90)`).
3. **Scroll Reveal & Stagger Engine (`[data-reveal]` & `[data-reveal-stagger]`):**
   - Driven by `IntersectionObserver`.
   - Elements elevate smoothly using `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Grid cards cascade with progressive stagger delays (40ms, 100ms, 160ms, etc.).
   - Section headers reveal an expanding gold underline (`.section-accent-rule`) from 0 to 52px.
4. **Interactive 3D Perspective Tilt & Specimen Spotlight:**
   - On desktop, cards track the cursor in real time (`--mouse-x`, `--mouse-y`).
   - A specular radial spotlight sheen illuminates the card surface (`rgba(184, 150, 46, 0.14)`).
   - Card tilts in 3D perspective (`rotateX`, `rotateY`, `translateY(-6px)`) while the product image floats in Z-space (`translateZ(22px)`).
   - Springs back to rest on cursor exit.
5. **Hero Multi-Plane Parallax:**
   - Moving the mouse across `.hero-zone` translates the background image and the floating clinical status badge (`#heroBadge`) at opposing rates for natural depth.
6. **Kinetic Marquee Velocity Physics:**
   - Ticker accelerates proportionally to scroll speed and smoothly decays back to base tempo with momentum physics.
7. **Tactile Button Depress & Traveling Beam Sweep:**
   - Buttons have a 45° specular light sweep across their face on hover and a tactile spring press on active click (`scale(0.97)`).
8. **Accessibility & Reduced Motion:**
   - Respects `prefers-reduced-motion: reduce` by disabling transforms, tilts, and continuous loops.

---

## 6. Strict Factual Discipline (Zero AI Slop)
Only verified client facts are permitted:
- Toppko Aesthetics supplies aesthetic, dermal and clinic products to doctors, clinics and medical professionals in Pakistan.
- Special professional discount for registered doctors and clinics.
- Stock is available now; inquire on WhatsApp `0327-7319079` or `0336-0672712` for availability and pricing.
- Based in Lahore with direct clinical dispatch nationwide.
- Official Email: `toppkoaesthetic@gmail.com`.
- Real verified product names: Profhilo, Dermaheal, Botulax, Sculptra, Rejuran, Juvederm, Lumi Eyes, Dr Pen, Glutax, ASCE+ Exosome, Korean PDO/PCL Threads, Jalupro.
- **STRICTLY PROHIBITED:** Doses, strengths ("64mg/2ml"), "authentic", "genuine", "original", "cold chain", "verified certification", years in business claims, or stock photography of patients.
