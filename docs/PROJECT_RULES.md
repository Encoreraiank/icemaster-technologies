# ICE MASTER TECHNOLOGIES — PROJECT RULES & CODING GUIDELINES
> **Permanent Agent & Developer Instructions**  
> This file defines the core technical rules, design system, and constraints for the Ice Master Technologies website. Every AI assistant or developer working on this project MUST adhere to these guidelines.

---

## 1. Brand Identity & Visual Language
- **Brand Aesthetic**: High-end industrial gaming hardware, futuristic cyberpunk chill, liquid cooling minimalism.
- **Typography**:
  - Primary Font: `'Outfit', sans-serif` (Weights 300 to 900)
  - Heading & Brand Accent: `'Montserrat', sans-serif` (Weights 600 to 900)
- **Official Color Palette**:
  - Deep Black: `#050505` / `#0A0E14` / `#111317`
  - Accent Crimson Red: `#E42F38` (Secondary: `#A52A30` / `#FF4754`)
  - Liquid Chill Ice Blue: `#38BDF8` / `#318CCB`
  - Silver & Ghost Whites: `#FFFFFF`, `#E2E8F0`, `#94A3B8`, `#64748B`

---

## 2. Global Navbar Rules (DO NOT BREAK)
1. **Frosted Glass Styling**:
   - The primary navigation is a floating glass capsule (`.im-floating-header .im-pill-navbar`).
   - Uses `backdrop-filter: blur(24px) saturate(180%)`, soft gradient glass background, and subtle top border highlight (`rgba(255, 255, 255, 0.32)`).
2. **Zero Red Glow on Navbar**:
   - Do NOT add red shadows, red borders, or red pills to the navbar.
   - The active tab MUST use the soft ambient spotlight capsule (`radial-gradient(...)` with subtle white luminous bottom beam).
3. **Scrollbar & Layout Shift Stability**:
   - `html { overflow-y: scroll; scrollbar-gutter: stable; }` MUST remain active.
   - This prevents the 17px Windows scrollbar shift between short and long pages (guaranteeing exact 0.00px horizontal jitter).
4. **Pill Overflow Rule (`overflow: visible`)**:
   - `.im-pill-navbar` MUST have `overflow: visible;`.
   - Never set `overflow: hidden;` on `.im-pill-navbar`, as browser focus algorithm will scroll navbar contents (`scrollTop`) when the search input receives focus.
5. **Search Input Focus**:
   - Always invoke `searchInput.focus({ preventScroll: true })`.

---

## 3. Product Catalog & Image Integrity
1. **Source of Truth**:
   - Real product images live in:
     - `assets/images/products/`
     - `assets/site frame stuff/All Product Page Assets/product preview cards stuff/Final_Z_Products/`
2. **Edge Quality (No White Fringe / Halo)**:
   - Any product cutouts rendered on dark backgrounds must be clean, transparent PNGs with alpha channel antialiasing. No white pixel outlines or ragged borders.
3. **Card Presentation**:
   - Category cards and product preview cards use `border-radius: 20px` (or pill rounded styling).
   - "Built for Every Setup" section uses composite background `categories_bg.png` with `01_liquid_coolers.png.V2` and `02_gaming_cabinets.png.V2`.

---

## 4. Protected Folders & Deletion Policy
- **NEVER delete or modify `assets/site frame stuff/` directly**: It houses client reference mockups, original designs, and the master `Final_Z_Products` folder.
- **Quarantine Policy**: When removing unreferenced or temporary files, always move them to `_backup_unused_assets/` instead of permanent unrecoverable deletion.
- **URLs & Navigation**: `download.html` is the primary and official download page. (Archived alias `downloads.html` is retained in `_backup_unused_assets/`).

---

## 5. Coding Standards & Performance
- Pure Vanilla HTML5, CSS3, and modern JavaScript (ES6+). Zero bulky external frameworks (no heavy React/Vue/Bootstrap wrappers).
- Semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- Passive event listeners on window scroll and touch events (`{ passive: true }`).
- Responsive breakpoints: Mobile (`< 768px`), Tablet (`768px – 1024px`), Desktop / 1080p (`> 1024px`).
