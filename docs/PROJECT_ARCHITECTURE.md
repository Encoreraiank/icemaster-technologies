# ICE MASTER TECHNOLOGIES — PROJECT ARCHITECTURE
> **Complete Technical Architecture, Directory Map & Controller Overview**

---

## 1. Tech Stack Overview
- **Core Stack**: Vanilla HTML5, CSS3, ES6+ JavaScript.
- **Styling Architecture**: Modern CSS Variables, CSS Grid, Flexbox, Glassmorphism (`backdrop-filter`), Responsive clamp typography.
- **Web Fonts**: Google Fonts — `Outfit` (Primary UI) & `Montserrat` (Headings).
- **Zero Build Step**: Native browser execution without bundlers; instantaneous reload and clean deployment.

---

## 2. Directory Tree
```text
E:/IceMaster_Project/
├── index.html                    # Homepage (Hero slider, Categories V2, WWC, Build, Headset, Footer)
├── all-products.html             # All Products catalog with category switcher & search
├── product-detail.html           # Dynamic product detail page (URL-driven from catalog object)
├── download.html                 # Official software & liquid cooler download showcase
├── contact.html                  # Official contact page with interactive Google Map
├── README.md                     # Project overview and quickstart guide
│
├── docs/                         # Project technical documentation
│   ├── PROJECT_RULES.md          # Technical rules, design system & coding standards
│   ├── PROJECT_ARCHITECTURE.md   # Architecture mapping and directory structure
│   └── TASKS.md                  # Milestone tracker, completed work & pending client items
│
├── assets/
│   ├── css/
│   │   └── style.css             # Main stylesheet (~3,600 lines clean modular CSS)
│   ├── js/
│   │   └── main.js               # Interaction controllers, catalog data, UI state managers
│   ├── images/
│   │   ├── homepage/             # Hero banners V2, categories_bg.png, emblem logos
│   │   ├── all-products/         # Banners & static assets for catalog page
│   │   └── products/             # High-res transparent product cutouts (coolers & cases)
│   │       ├── air-coolers/      # Fusion series cutouts
│   │       ├── cases/            # Dynamite, Frosty, Roar, Spark, Star, Torrent, etc.
│   │       └── liquid-coolers/   # Cool 240/360 ARGB & Digital series cutouts
│   │
│   └── site frame stuff/         # [PROTECTED] Client reference frames, mockups, Final_Z_Products
│       ├── All Product Page Assets/
│       │   └── product preview cards stuff/
│       │       └── Final_Z_Products/  # Live product photos source (Z_aircoolers, Z_cases, etc.)
│       ├── Contact Page Assets/       # Client contact reference layout
│       └── Home Page Assets/          # Client homepage reference layout
│
├── scripts/                      # Developer utility & build scripts
├── raw-assets/                   # Unprocessed client source media
└── _backup_unused_assets/        # Quarantined assets (100% reversible, zero permanent data loss)
```

---

## 3. Page Architecture & Component Mapping

### A. Homepage (`index.html`)
1. **Component 1: Floating Glass Pill Navbar (`#main-floating-header`)**
   - Official emblem logo, navigation items with soft spotlight on `HOME`, quick search button.
2. **Component 2: Hero Stage & Slider (`#hero-slider`)**
   - Slide 1: Dynamite X7 on high-tech light studio background (`hero_slide_1.pngV2.png`).
   - Slide 2: Cool Digital series on dark cavern background (`hero_slide_2.pngV2.png`).
   - Dot navigation and next/prev controls with auto-play interval.
3. **Component 3: Built for Every Setup (`#product-categories`)**
   - High-res composite stage (`categories_bg.png`) featuring V2 Liquid Coolers & Gaming Cabinets.
   - 4 interactive overlay cards with red laser hover accents.
4. **Component 4: What We Create (`#what-we-create`)**
   - 4-stage scroll-driven narrative parallax showcase.
5. **Component 5: Headset Showcase & Build Section (`#get-your-build`)**
6. **Component 6: Universal Footer (`.im-footer`)**
   - Company address, social channels, copyright notice.

### B. All Products Page (`all-products.html`)
1. **Hero Showcase**: 2172 × 724 px widescreen atmospheric banner.
2. **Vertical Category Navigation**:
   - Portrait tiles (`Air Coolers`, `Liquid Coolers`, `Gaming Cabinets`, `Gaming Headphones`, `Power Supply Units`).
   - Fits neatly above the fold on 1080p viewports; mobile horizontal swipe row.
3. **Dynamic Filter & Search**:
   - URL-driven: `?category=cases` or `?search=dynamite`.
   - Real product preview cards loaded with official transparent cutouts from `Final_Z_Products`.

### C. Product Detail Page (`product-detail.html`)
1. **Dynamic Catalog Controller**:
   - Reads URL parameter (e.g. `product-detail.html?product=fusion` or `?product=roar`).
   - Automatically injects title, category breadcrumb, color swatches (Black/White), and image gallery.
2. **Interactive Gallery**:
   - Main showcase viewport with multi-angle thumbnail strip and active state switching.

### D. Download Page (`download.html`)
1. **Cinematic Hero Stage**: 1933 × 813 px layout showcasing official Ice Master Liquid Coolers.
2. **Direct Software Actions**: Instant download trigger button, OS compatibility badge, feature pills.

### E. Contact Page (`contact.html`)
1. **Get in Touch Grid**:
   - Left: Contact information card (Address: New Delhi, Nehru Place; Phone; Email; Business Hours).
   - Right: Clean message form.
2. **Embedded Interactive Map**:
   - Native Google Maps iframe with interactive pan, zoom controls, and an "Open Google Maps" button.

---

## 4. JavaScript Controller Map (`assets/js/main.js`)
- `initHomepagePillNavbar()`: Header scroll state, safe focus search toggle (`preventScroll: true`).
- `initSlideshowControls()`: Homepage hero auto-slide, dot navigation, mouse pause.
- `initWWCScrollController()`: 4-stage parallax animation.
- `initCategoriesController()`: Homepage categories interaction.
- `initProductsCategoryNav()`: All-products category tab switcher & `?search=` filter.
- `initProductDetailPage()`: Dynamic 14-product catalog manager, color switcher & gallery thumbnails.
- `initContactPageController()`: Contact form validation and toast notifications.
