/**
 * ICEMASTER TECHNOLOGIES — ALL SECTIONS INTERACTION CONTROLLERS
 */

/* Apply saved theme IMMEDIATELY (before DOM ready) to prevent white flash */
(function() {
  const saved = localStorage.getItem('im-theme');
  if (saved === 'light') document.documentElement.classList.add('light-mode');
})();

document.addEventListener('DOMContentLoaded', () => {
  syncLiveSiteWithAdminData();
  initThemeToggle();
  initHomepagePillNavbar();
  initMobileHamburger();
  initStatsCounter();
  initSlideshowControls();
  initWWCScrollController();
  initCategoriesController();
  initGetBuildController();
  initProductsCategoryNav();
  initProductDetailPage();
  initDownloadsPageController();
  initContactPageController();
});

/* ==========================================================================
   00a. LIVE SITE SYNC WITH ADMIN PANEL DATA (localStorage / Supabase cache)
   ========================================================================== */
function syncLiveSiteWithAdminData() {
  try {
    // 1. Sync Hero Section (index.html)
    const storedHero = JSON.parse(localStorage.getItem('im_wm_hero_banners_data'));
    if (Array.isArray(storedHero) && storedHero.length > 0) {
      const slides = document.querySelectorAll('.im-hero-slide');
      storedHero.forEach((slide, idx) => {
        let slideEl = slides[idx];
        if (slideEl) {
          const bg = slideEl.querySelector('.im-hero-bg-img');
          if (bg && slide.bg) bg.src = slide.bg;

          const eyebrow = slideEl.querySelector('.im-hero-eyebrow-text');
          if (eyebrow && slide.eyebrow) eyebrow.textContent = slide.eyebrow;

          const title = slideEl.querySelector('.im-hero-title');
          if (title && slide.title) title.innerHTML = slide.title;

          const tagline = slideEl.querySelector('.im-hero-tagline');
          if (tagline && slide.tagline) tagline.textContent = slide.tagline;

          const desc = slideEl.querySelector('.im-hero-desc');
          if (desc && slide.desc) desc.innerHTML = slide.desc.replace(/\n/g, '<br>');

          const cta = slideEl.querySelector('.im-hero-cta-wrap a');
          if (cta) {
            if (slide.btnLink) cta.href = slide.btnLink;
            const span = cta.querySelector('span');
            if (span && slide.btnText) span.textContent = slide.btnText;
          }
        }
      });
    }

    // 2. Sync Sub-Hero Headset Section (index.html)
    const storedSubHero = JSON.parse(localStorage.getItem('im_wm_sub_hero_data'));
    if (storedSubHero) {
      const headsetSec = document.getElementById('headset-spotlight');
      if (headsetSec) {
        const bg = headsetSec.querySelector('.im-headset-bg-img');
        if (bg && storedSubHero.bg) bg.src = storedSubHero.bg;

        const eyebrow = headsetSec.querySelector('.im-headset-eyebrow-text');
        if (eyebrow && storedSubHero.eyebrow) eyebrow.textContent = storedSubHero.eyebrow;

        const title = headsetSec.querySelector('.im-headset-title');
        if (title && storedSubHero.title) title.innerHTML = storedSubHero.title;

        const desc = headsetSec.querySelector('.im-headset-desc');
        if (desc && storedSubHero.desc) desc.innerHTML = storedSubHero.desc.replace(/\n/g, '<br>');

        const link = headsetSec.querySelector('.im-headset-stage-link');
        if (link && storedSubHero.btnLink) link.href = storedSubHero.btnLink;
      }
    }

    // 3. Sync Categories Tiles (all-products.html)
    const storedCats = JSON.parse(localStorage.getItem('im_wm_categories'));
    const tilesRow = document.querySelector('.ap-cat-tiles-row');
    if (tilesRow && Array.isArray(storedCats) && storedCats.length > 0) {
      storedCats.forEach(c => {
        let existingTile = tilesRow.querySelector(`.ap-cat-tile[data-cat-key="${c.key}"]`);
        if (!existingTile) {
          const tileBtn = document.createElement('button');
          tileBtn.type = 'button';
          tileBtn.className = 'ap-cat-tile';
          tileBtn.setAttribute('role', 'tab');
          tileBtn.setAttribute('aria-selected', 'false');
          tileBtn.setAttribute('data-cat-key', c.key);
          tileBtn.setAttribute('aria-controls', 'ap-products-grid');
          tileBtn.innerHTML = `
            <div class="ap-tile-icon-wrap">
              <img src="${c.thumb || 'assets/images/homepage/im_official_emblem.png'}" alt="${c.name}" style="width: 24px; height: 24px; object-fit: contain;">
            </div>
            <span class="ap-tile-label">${c.name}</span>
            <span class="ap-tile-dot" aria-hidden="true"></span>
          `;
          tilesRow.appendChild(tileBtn);
        } else {
          const label = existingTile.querySelector('.ap-tile-label');
          if (label && c.name) label.textContent = c.name;
        }
      });

      // Remove tiles of categories that were deleted in admin
      const activeKeys = new Set(storedCats.map(c => c.key));
      tilesRow.querySelectorAll('.ap-cat-tile').forEach(t => {
        const k = t.getAttribute('data-cat-key');
        if (k && !activeKeys.has(k)) {
          t.remove();
        }
      });
    }

    // 4. Sync Products Grid (all-products.html)
    const storedProds = JSON.parse(localStorage.getItem('im_wm_products'));
    const prodGrid = document.getElementById('ap-products-grid');
    if (prodGrid && Array.isArray(storedProds) && storedProds.length > 0) {
      const activeProdIds = new Set(storedProds.map(p => String(p.id)));

      // Remove products deleted in admin
      prodGrid.querySelectorAll('.im-prod-card').forEach(card => {
        const link = card.querySelector('a[href*="product="]');
        if (link) {
          const href = link.getAttribute('href');
          const match = href.match(/product=([^&#]+)/);
          if (match && match[1]) {
            const pId = match[1];
            if (!activeProdIds.has(pId)) {
              card.remove();
            }
          }
        }
      });

      // Upsert products
      storedProds.forEach(p => {
        let existingCard = prodGrid.querySelector(`a[href*="${p.id}"]`);
        if (!existingCard) {
          const card = document.createElement('article');
          card.className = 'im-prod-card product-card';
          card.setAttribute('data-category', p.cat);
          card.innerHTML = `
            <a href="product-detail.html?product=${p.id}" class="im-prod-card-link" aria-label="View ${p.name} Details">
              <div class="im-prod-media">
                <img src="${p.img || 'assets/images/homepage/im_official_emblem.png'}" alt="${p.name}" class="im-prod-img" loading="lazy">
              </div>
              <h3 class="im-prod-title">${p.name}</h3>
              ${p.desc ? `<p class="im-prod-desc">${p.desc}</p>` : ''}
              <div class="im-prod-btn-hitarea" aria-hidden="true"></div>
            </a>
          `;
          prodGrid.prepend(card);
        } else {
          const card = existingCard.closest('.im-prod-card');
          if (card) {
            card.setAttribute('data-category', p.cat);
            const img = card.querySelector('.im-prod-img');
            if (img && p.img) img.src = p.img;
            const title = card.querySelector('.im-prod-title');
            if (title && p.name) title.textContent = p.name;
            let desc = card.querySelector('.im-prod-desc');
            if (p.desc) {
              if (!desc) {
                desc = document.createElement('p');
                desc.className = 'im-prod-desc';
                title.insertAdjacentElement('afterend', desc);
              }
              desc.textContent = p.desc;
            }
          }
        }
      });
    }
  } catch (err) {
    console.warn('Ice Master Live Sync Note:', err);
  }
}

/* ==========================================================================
   THEME TOGGLE — Dark / Light Mode with localStorage persistence
   ========================================================================== */
function initThemeToggle() {
  const toggleBtn = document.getElementById('im-theme-toggle');
  if (!toggleBtn) return;

  const html = document.documentElement;
  const isLight = () => html.classList.contains('light-mode');

  const sunSVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const moonSVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  const updateIcon = () => {
    // In light mode → show moon (to switch back to dark)
    // In dark mode → show sun (to switch to light)
    toggleBtn.innerHTML = isLight() ? moonSVG : sunSVG;
    toggleBtn.setAttribute('title', isLight() ? 'Switch to Dark Mode' : 'Switch to Light Mode');
    toggleBtn.setAttribute('aria-label', isLight() ? 'Switch to Dark Mode' : 'Switch to Light Mode');
  };

  updateIcon();

  toggleBtn.addEventListener('click', () => {
    html.classList.toggle('light-mode');
    localStorage.setItem('im-theme', isLight() ? 'light' : 'dark');
    updateIcon();
  });
}


/* ==========================================================================
   00b. MOBILE HAMBURGER NAVIGATION DRAWER
   ========================================================================== */
function initMobileHamburger() {
  const hamburger = document.getElementById('im-hamburger-btn');
  const drawer = document.getElementById('im-mobile-nav-drawer');
  const closeBtn = document.getElementById('im-drawer-close');

  if (!hamburger || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    document.body.classList.add('im-menu-open');
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    document.body.classList.remove('im-menu-open');
  };

  hamburger.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Close when a nav link is clicked
  drawer.querySelectorAll('.im-mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}


/* ==========================================================================
   00. HOMEPAGE FLOATING PILL NAVBAR CONTROLLER (Sticky on Scroll & Search)
   ========================================================================== */
function initHomepagePillNavbar() {
  const header = document.querySelector('.im-floating-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  const searchToggle = document.getElementById('im-search-toggle');
  const searchDropdown = document.getElementById('im-search-dropdown');
  const searchInput = document.getElementById('im-quick-search-input');
  const pillNavbar = document.querySelector('.im-pill-navbar');

  if (searchToggle && searchDropdown && searchInput) {
    searchToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = searchDropdown.classList.toggle('open');
      if (isOpen) {
        if (pillNavbar) {
          pillNavbar.scrollTop = 0;
          pillNavbar.scrollLeft = 0;
        }
        searchInput.focus({ preventScroll: true });
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `all-products.html?search=${encodeURIComponent(query)}`;
        }
      } else if (e.key === 'Escape') {
        searchDropdown.classList.remove('open');
      }
    });

    document.addEventListener('click', (e) => {
      if (!searchDropdown.contains(e.target) && e.target !== searchToggle) {
        searchDropdown.classList.remove('open');
      }
    });
  }
}

/* ==========================================================================
   01. ANIMATED NUMBER COUNTERS (HERO SECTION)
   ========================================================================== */
function initStatsCounter() {
  const statElements = document.querySelectorAll('.stat-metric-value');
  if (!statElements.length) return;

  const statsData = [
    { target: 50, suffix: 'K+', isFloat: false },
    { target: 99.9, suffix: '%', isFloat: true },
    { target: 100, suffix: '+', isFloat: false },
    { target: 4.5, suffix: '', isFloat: true }
  ];

  statElements.forEach((el, index) => {
    const data = statsData[index];
    if (!data) return;

    let start = 0;
    const duration = 1600;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = start + (data.target - start) * easeOut;

      if (data.isFloat) {
        el.textContent = currentVal.toFixed(1) + data.suffix;
      } else {
        el.textContent = Math.floor(currentVal) + data.suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = (data.isFloat ? data.target.toFixed(1) : data.target) + data.suffix;
      }
    }

    requestAnimationFrame(updateCounter);
  });
}

/* ==========================================================================
   02. SLIDESHOW & ARROW CONTROLS (HERO SECTION)
   ========================================================================== */
let currentSlideIndex = 0;
let autoSlideTimer = null;

function setHeroSlide(index) {
  const slides = document.querySelectorAll('.im-hero-slide, .hero-exact-slide, .hero-slide-item');
  if (!slides.length) return;

  const totalSlides = slides.length;
  currentSlideIndex = ((index % totalSlides) + totalSlides) % totalSlides;

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === currentSlideIndex);
  });

  const dots = document.querySelectorAll('.im-hero-dot, .hero-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlideIndex);
  });

  const currentNumEl = document.getElementById('hero-current-num');
  if (currentNumEl) {
    currentNumEl.textContent = String(currentSlideIndex + 1).padStart(2, '0');
  }

  const stageCounter = document.getElementById('stage-num-text');
  if (stageCounter) {
    const slideDisplay = String(currentSlideIndex + 1).padStart(2, '0');
    stageCounter.innerHTML = `<span>${slideDisplay}</span><span class="stage-dim-text"> / 02</span>`;
  }

  resetAutoPlay();
}

function nextSlide() {
  setHeroSlide(currentSlideIndex + 1);
}

function prevSlide() {
  setHeroSlide(currentSlideIndex - 1);
}

function initSlideshowControls() {
  const btnPrev = document.getElementById('im-hero-prev') || document.getElementById('btn-hero-prev') || document.getElementById('btn-slide-prev');
  const btnNext = document.getElementById('im-hero-next') || document.getElementById('btn-hero-next') || document.getElementById('btn-slide-next');

  if (btnPrev) btnPrev.addEventListener('click', prevSlide);
  if (btnNext) btnNext.addEventListener('click', nextSlide);

  const dots = document.querySelectorAll('.im-hero-dot, .hero-dot');
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => setHeroSlide(i));
  });

  const heroStage = document.getElementById('hero-slider') || document.getElementById('home-hero');
  if (heroStage) {
    heroStage.addEventListener('mouseenter', stopAutoPlay);
    heroStage.addEventListener('mouseleave', startAutoPlay);
  }

  startAutoPlay();
}

function startAutoPlay() {
  stopAutoPlay();
  autoSlideTimer = setInterval(nextSlide, 5500);
}

function stopAutoPlay() {
  if (autoSlideTimer) clearInterval(autoSlideTimer);
}

function resetAutoPlay() {
  stopAutoPlay();
  startAutoPlay();
}

/* ==========================================================================
   03. PHASE 2 — WHAT WE CREATE (4-STAGE SCROLL-DRIVEN PARALLAX CONTROLLER)
   ========================================================================== */
function initWWCScrollController() {
  const wwcSection = document.getElementById('what-we-create');
  if (!wwcSection) return;

  const visualLayers = document.querySelectorAll('.wwc-visual-layer');
  const navItems = document.querySelectorAll('.wwc-nav-item');
  const featureCards = document.querySelectorAll('.wwc-feature-card');
  const ghostNum = document.getElementById('wwc-ghost-num');
  const eyebrowNum = document.getElementById('wwc-eyebrow-num');
  const counterCurrent = document.getElementById('wwc-counter-current');
  const btnPrev = document.getElementById('wwc-btn-prev');
  const btnNext = document.getElementById('wwc-btn-next');

  let currentStage = 1;
  const totalStages = 4;
  let isTransitioning = false;
  let transitionTimeout = null;
  let isTicking = false;

  function setWWCStage(stage) {
    if (stage < 1) stage = 1;
    if (stage > totalStages) stage = totalStages;

    currentStage = stage;
    const stageStr = String(stage).padStart(2, '0');

    // Update 3D Product Visual Layers with Depth Classes
    visualLayers.forEach(layer => {
      const layerStage = parseInt(layer.getAttribute('data-stage'), 10);
      layer.classList.toggle('active', layerStage === stage);
      layer.classList.toggle('prev-stage', layerStage < stage);
    });

    // Update Left Nav Items
    navItems.forEach(item => {
      const itemStage = parseInt(item.getAttribute('data-stage'), 10);
      const isActive = itemStage === stage;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Update Right Feature Cards
    featureCards.forEach(card => {
      const cardStage = parseInt(card.getAttribute('data-stage'), 10);
      card.classList.toggle('active', cardStage === stage);
    });

    // Update Indicators with slight animation trigger
    if (ghostNum) {
      ghostNum.style.opacity = '0';
      ghostNum.style.transform = 'translate(50%, -50%) scale(1.08)';
      setTimeout(() => {
        ghostNum.textContent = stageStr;
        ghostNum.style.opacity = '1';
        ghostNum.style.transform = 'translate(50%, -50%) scale(1)';
      }, 150);
    }

    if (eyebrowNum) eyebrowNum.textContent = stageStr;
    if (counterCurrent) counterCurrent.textContent = stageStr;

    // Update Arrow Glows
    if (btnPrev) {
      btnPrev.classList.toggle('active-glow', stage > 1);
    }
    if (btnNext) {
      btnNext.classList.toggle('active-glow', true);
    }
  }

  // Smooth Scroll sync helper
  function scrollToStage(targetStage, smooth = true) {
    if (targetStage < 1) targetStage = 1;
    if (targetStage > totalStages) targetStage = totalStages;

    const totalScrollable = wwcSection.offsetHeight - window.innerHeight;
    const progress = (targetStage - 1) / (totalStages - 1);
    const targetY = wwcSection.offsetTop + progress * totalScrollable;

    window.scrollTo({
      top: targetY,
      behavior: smooth ? 'smooth' : 'auto'
    });

    setWWCStage(targetStage);
  }

  // Intercept Wheel inside WWC Stage for Instant & Smooth Stage Progression
  window.addEventListener('wheel', (e) => {
    const rect = wwcSection.getBoundingClientRect();
    // Check if WWC is currently locked in sticky viewport
    const isInStickyView = rect.top <= 20 && rect.bottom >= window.innerHeight - 20;

    if (!isInStickyView) return;

    if (e.deltaY > 20) {
      // User is scrolling DOWN
      if (currentStage < totalStages) {
        e.preventDefault();
        if (!isTransitioning) {
          isTransitioning = true;
          scrollToStage(currentStage + 1);
          clearTimeout(transitionTimeout);
          transitionTimeout = setTimeout(() => { isTransitioning = false; }, 550);
        }
      }
      // If at Stage 4, let natural scroll continue down past section!
    } else if (e.deltaY < -20) {
      // User is scrolling UP
      if (currentStage > 1) {
        e.preventDefault();
        if (!isTransitioning) {
          isTransitioning = true;
          scrollToStage(currentStage - 1);
          clearTimeout(transitionTimeout);
          transitionTimeout = setTimeout(() => { isTransitioning = false; }, 550);
        }
      }
      // If at Stage 1, let natural scroll continue back up to Hero!
    }
  }, { passive: false });

  // Touch Swipe Gesture Support for Trackpads & Touch Devices
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    const rect = wwcSection.getBoundingClientRect();
    const isInStickyView = rect.top <= 20 && rect.bottom >= window.innerHeight - 20;
    if (!isInStickyView) return;

    const touchY = e.touches[0].clientY;
    const diff = touchStartY - touchY;

    if (diff > 45) { // Swipe Up (Scroll Down)
      if (currentStage < totalStages) {
        e.preventDefault();
        if (!isTransitioning) {
          isTransitioning = true;
          touchStartY = touchY;
          scrollToStage(currentStage + 1);
          clearTimeout(transitionTimeout);
          transitionTimeout = setTimeout(() => { isTransitioning = false; }, 550);
        }
      }
    } else if (diff < -45) { // Swipe Down (Scroll Up)
      if (currentStage > 1) {
        e.preventDefault();
        if (!isTransitioning) {
          isTransitioning = true;
          touchStartY = touchY;
          scrollToStage(currentStage - 1);
          clearTimeout(transitionTimeout);
          transitionTimeout = setTimeout(() => { isTransitioning = false; }, 550);
        }
      }
    }
  }, { passive: false });

  // Keyboard Arrow Navigation
  window.addEventListener('keydown', (e) => {
    const rect = wwcSection.getBoundingClientRect();
    const isInStickyView = rect.top <= 50 && rect.bottom >= window.innerHeight - 50;
    if (!isInStickyView) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
      if (currentStage < totalStages) {
        e.preventDefault();
        scrollToStage(currentStage + 1);
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (currentStage > 1) {
        e.preventDefault();
        scrollToStage(currentStage - 1);
      }
    }
  });

  // Passive Scroll Sync for Native Scrollbar Dragging
  function onScroll() {
    if (!isTicking) {
      requestAnimationFrame(() => {
        const rect = wwcSection.getBoundingClientRect();
        const totalScrollable = wwcSection.offsetHeight - window.innerHeight;

        if (totalScrollable > 0 && rect.top <= 0 && rect.bottom >= window.innerHeight) {
          const progress = Math.max(0, Math.min(1, -rect.top / totalScrollable));
          
          let targetStage = 1;
          if (progress < 0.20) targetStage = 1;
          else if (progress < 0.50) targetStage = 2;
          else if (progress < 0.80) targetStage = 3;
          else targetStage = 4;

          if (targetStage !== currentStage && !isTransitioning) {
            setWWCStage(targetStage);
          }
        } else if (rect.top > 0 && currentStage !== 1) {
          setWWCStage(1);
        } else if (rect.bottom < window.innerHeight && currentStage !== 4) {
          setWWCStage(4);
        }

        isTicking = false;
      });
      isTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Click on Left 4-Stage List Items
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const stage = parseInt(item.getAttribute('data-stage'), 10);
      if (stage) scrollToStage(stage);
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const stage = parseInt(item.getAttribute('data-stage'), 10);
        if (stage) scrollToStage(stage);
      }
    });
  });

  // Click on Right Navigation Arrows
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      let next = currentStage + 1;
      if (next > totalStages) next = 1;
      scrollToStage(next);
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      let prev = currentStage - 1;
      if (prev < 1) prev = totalStages;
      scrollToStage(prev);
    });
  }

  // Set Initial Stage
  setWWCStage(1);
}

/* ==========================================================================
   04. PHASE 3 — PRODUCT CATEGORIES CONTROLLER
   ========================================================================== */
function initCategoriesController() {
  const categoryItems = document.querySelectorAll('.category-floor-item');
  if (!categoryItems.length) return;

  categoryItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      categoryItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });

    item.addEventListener('mouseleave', () => {
      item.classList.remove('active');
    });

    item.addEventListener('click', () => {
      const category = item.getAttribute('data-category');
      categoryItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const category = item.getAttribute('data-category');
        categoryItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   05. PHASE 4 — GET YOUR BUILD JOURNEY CONTROLLER
   ========================================================================== */
function initGetBuildController() {
  const stepCols = document.querySelectorAll('.journey-step-col');
  if (!stepCols.length) return;

  stepCols.forEach(col => {
    col.addEventListener('mouseenter', () => {
      col.classList.add('focused');
    });

    col.addEventListener('mouseleave', () => {
      col.classList.remove('focused');
    });
  });
}

/* ==========================================================================
   06. ALL PRODUCTS CATEGORY NAVIGATION & FILTERING CONTROLLER
   ========================================================================== */
function initProductsCategoryNav() {
  const catTiles = document.querySelectorAll('.ap-cat-tile');
  const catCards = document.querySelectorAll('.im-prod-card');
  const emptyCards = document.querySelectorAll('.ap-empty-category-card');
  const headerTitle = document.getElementById('ap-active-cat-title');
  const headerTagline = document.getElementById('ap-active-cat-tagline');

  // Legacy elements support (if present)
  const legacyButtons = document.querySelectorAll('.filter-tab-btn, .cat-nav-btn');
  const legacyPanes = document.querySelectorAll('.category-tab-pane');

  const categoryMeta = {
    'air-coolers': {
      title: 'Air Coolers',
      tagline: 'Efficient Cooling. Reliable Performance.'
    },
    'liquid-coolers': {
      title: 'Liquid Coolers',
      tagline: 'Extreme Heat Dissipation. Whisper Quiet.'
    },
    'gaming-cabinets': {
      title: 'Gaming Cabinets',
      tagline: 'Superior Airflow. Engineered for Master Builds.'
    },
    'gaming-headphones': {
      title: 'Gaming Headphones',
      tagline: 'Immersive Acoustics. All-Day Comfort.'
    },
    'power-supply-units': {
      title: 'Power Supply Units',
      tagline: 'Ultra-Reliable Power. 80 Plus Efficiency.'
    }
  };

  const aliasMap = {
    'coolers': 'liquid-coolers',
    'liquid': 'liquid-coolers',
    'cooling': 'liquid-coolers',
    'cases': 'gaming-cabinets',
    'pc-cases': 'gaming-cabinets',
    'cabinets': 'gaming-cabinets',
    'headphones': 'gaming-headphones',
    'headsets': 'gaming-headphones',
    'accessories': 'gaming-headphones',
    'psu': 'power-supply-units',
    'power-supply': 'power-supply-units'
  };

  try {
    const storedCats = JSON.parse(localStorage.getItem('im_wm_categories'));
    if (Array.isArray(storedCats)) {
      storedCats.forEach(c => {
        if (!categoryMeta[c.key]) {
          categoryMeta[c.key] = {
            title: c.name,
            tagline: `${c.name} Engineered for Peak Performance.`
          };
        }
      });
    }
  } catch(e) {}

  function activateCategory(catKey, scrollToGrid = false, isImmediate = false) {
    if (!catKey) catKey = 'air-coolers';
    if (aliasMap[catKey]) catKey = aliasMap[catKey];
    if (!categoryMeta[catKey]) catKey = 'air-coolers';

    // 1. Update Category Selection Tiles
    catTiles.forEach(tile => {
      const tileKey = tile.getAttribute('data-cat-key');
      const isMatch = (tileKey === catKey || aliasMap[tileKey] === catKey);
      tile.classList.toggle('active', isMatch);
      tile.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    // 2. Update Dynamic Header Title & Tagline with smooth transition
    if (headerTitle && categoryMeta[catKey]) {
      headerTitle.style.opacity = '0';
      headerTitle.style.transform = 'translateY(6px)';
      if (headerTagline) headerTagline.style.opacity = '0';

      setTimeout(() => {
        headerTitle.textContent = categoryMeta[catKey].title;
        if (headerTagline) headerTagline.textContent = categoryMeta[catKey].tagline;
        headerTitle.style.opacity = '1';
        headerTitle.style.transform = 'translateY(0)';
        if (headerTagline) headerTagline.style.opacity = '1';
      }, 140);
    }

    // 3. Filter Product Cards (re-query cards so any dynamically synced products are included)
    const allProdCards = document.querySelectorAll('.im-prod-card');
    let visibleCount = 0;
    allProdCards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      const isVisible = (cardCat === catKey || aliasMap[cardCat] === catKey || (aliasMap[catKey] && aliasMap[catKey] === cardCat));
      if (isVisible) {
        visibleCount++;
        card.classList.remove('hidden');
        card.style.opacity = '0';
        card.style.transform = 'translateY(12px)';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 50);
      } else {
        card.classList.add('hidden');
      }
    });

    // 4. Handle Empty Category Cards
    let hasCustomEmpty = false;
    emptyCards.forEach(empty => {
      const emptyCat = empty.getAttribute('data-category');
      const isVisible = (emptyCat === catKey);
      if (isVisible) {
        hasCustomEmpty = true;
        empty.classList.remove('hidden');
        empty.style.opacity = '0';
        empty.style.transform = 'translateY(12px)';
        setTimeout(() => {
          empty.style.opacity = '1';
          empty.style.transform = 'translateY(0)';
        }, 50);
      } else {
        empty.classList.add('hidden');
      }
    });

    // If no products and no custom empty card exists, show a generic empty state
    let dynamicEmpty = document.getElementById('ap-dynamic-empty-card');
    if (visibleCount === 0 && !hasCustomEmpty) {
      if (!dynamicEmpty) {
        dynamicEmpty = document.createElement('div');
        dynamicEmpty.id = 'ap-dynamic-empty-card';
        dynamicEmpty.className = 'ap-empty-category-card';
        const grid = document.getElementById('ap-products-grid');
        if (grid) grid.appendChild(dynamicEmpty);
      }
      const catTitle = (categoryMeta[catKey] && categoryMeta[catKey].title) || catKey;
      dynamicEmpty.innerHTML = `
        <svg class="ap-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3 class="ap-empty-title">${catTitle} Lineup Coming Soon</h3>
        <p class="ap-empty-desc">New products for ${catTitle} are currently being prepared. Check back soon for official specifications!</p>
      `;
      dynamicEmpty.classList.remove('hidden');
    } else if (dynamicEmpty) {
      dynamicEmpty.classList.add('hidden');
    }

    // 5. Legacy Panes Support (if existing)
    if (legacyButtons.length) {
      legacyButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-category') === catKey));
    }
    if (legacyPanes.length) {
      legacyPanes.forEach(p => p.classList.toggle('active', p.id === `pane-${catKey}`));
    }

    // 6. Smooth Scroll if requested
    if (scrollToGrid) {
      const targetSec = document.getElementById('category-selection') || document.getElementById('products-catalog');
      if (targetSec) {
        const offset = 80;
        const top = targetSec.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }

  // Click handlers on Category Tiles
  catTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const key = tile.getAttribute('data-cat-key');
      activateCategory(key);
      if (history.pushState) {
        history.pushState(null, null, `?category=${encodeURIComponent(key)}`);
      }
    });
  });

  // Read URL Query Parameter & Hash
  const urlParams = new URLSearchParams(window.location.search);
  const hashCat = window.location.hash.replace('#', '');
  const searchQuery = (urlParams.get('search') || '').trim();
  const initialCat = urlParams.get('category') || urlParams.get('cat') || hashCat || 'air-coolers';

  if (searchQuery) {
    const qLower = searchQuery.toLowerCase();
    let matchCount = 0;
    let firstMatchedCat = null;

    catCards.forEach(card => {
      const text = (card.textContent || '').toLowerCase();
      const isMatch = text.includes(qLower);
      if (isMatch) {
        matchCount++;
        card.classList.remove('hidden');
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        if (!firstMatchedCat) firstMatchedCat = card.getAttribute('data-category');
      } else {
        card.classList.add('hidden');
      }
    });

    emptyCards.forEach(empty => empty.classList.add('hidden'));

    if (matchCount > 0) {
      if (headerTitle) headerTitle.textContent = `Search Results (${matchCount})`;
      if (headerTagline) headerTagline.textContent = `Showing all products matching "${searchQuery}"`;
      if (firstMatchedCat) {
        catTiles.forEach(tile => {
          tile.classList.toggle('active', tile.getAttribute('data-cat-key') === firstMatchedCat);
        });
      }
      setTimeout(() => {
        const targetSec = document.getElementById('category-selection') || document.getElementById('products-catalog');
        if (targetSec) {
          const offset = 80;
          const top = targetSec.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 200);
    } else {
      if (headerTitle) headerTitle.textContent = `No Products Found`;
      if (headerTagline) headerTagline.textContent = `No products found matching "${searchQuery}". Please try another keyword.`;
      activateCategory(initialCat, false, true);
    }
  } else {
    activateCategory(initialCat, false, true);
  }
}

/* ==========================================================================
   07. PRODUCT DETAIL PAGE CONTROLLER (DYNAMIC URL-DRIVEN FROM FINAL_Z_PRODUCTS)
   ========================================================================== */
function initProductDetailPage() {
  const pdStageImg = document.getElementById('pd-main-img');
  const thumbContainer = document.getElementById('pd-thumbnail-strip');
  if (!pdStageImg && !thumbContainer) return;

  // Complete Catalog of Official Products (31 Models)
  const catalog = {
    'fusion': {
      title: "Fusion CPU Air Cooler",
      subtitle: "High-performance CPU air cooler with 4 direct-touch copper heatpipes and dynamic hydraulic RGB fan.",
      eyebrow: "AIR COOLERS",
      categoryName: "Air Coolers",
      categoryUrl: 'all-products.html?category=air-coolers',
      breadcrumbTitle: "Fusion CPU Air Cooler",
      colors: ["black"],
      defaultColor: "black",
      images: {"black":["assets/images/products/air-coolers/fusion/fusion_aircooler_view_1.png"]},
      customSpecs: [{"label":"Cooler Dimensions","value":"140 x 110 x 170 mm"},{"label":"TDP Rating","value":"120W TDP"},{"label":"Heatpipe Structure","value":"4x 6mm Direct Touch Copper"},{"label":"Fan Specification","value":"1x 120mm Auto RGB (Hydraulic Bearing)"},{"label":"Fan Speed & Airflow","value":"800 - 2000 RPM (PWM) / 67.96 CFM"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM5/AM4"}]
    },

    'turbo': {
      title: "Turbo CPU Air Cooler",
      subtitle: "Compact tower CPU cooler with 2 copper heatpipes and ultra-quiet 24 dBA auto RGB fan.",
      eyebrow: "AIR COOLERS",
      categoryName: "Air Coolers",
      categoryUrl: 'all-products.html?category=air-coolers',
      breadcrumbTitle: "Turbo CPU Air Cooler",
      colors: ["black"],
      defaultColor: "black",
      images: {"black":["assets/images/products/air-coolers/turbo/turbo_aircooler_view_1.png"]},
      customSpecs: [{"label":"Cooler Dimensions","value":"130 x 85 x 145 mm"},{"label":"TDP Rating","value":"95W - 105W TDP"},{"label":"Heatpipe Structure","value":"2x Copper Heat Pipes (HDT Direct Touch)"},{"label":"Fan Specification","value":"1x 120mm Auto RGB (Hydraulic Bearing)"},{"label":"Fan Speed & Noise","value":"1900 RPM (+/-10%) / 38 CFM / 24 dBA"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM4/AM3/AM2"}]
    },

    'cool-240-argb': {
      title: "Cool 240 ARGB",
      subtitle: "240mm dual-chamber ARGB liquid CPU cooler engineered for high thermal efficiency and quiet acoustics.",
      eyebrow: "LIQUID COOLERS",
      categoryName: "Liquid Coolers",
      categoryUrl: 'all-products.html?category=liquid-coolers',
      breadcrumbTitle: "Cool 240 ARGB",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/liquid-coolers/cool-240-argb/Black/cool_240_argb_black.png"],"white":["assets/images/products/liquid-coolers/cool-240-argb/Black/cool_240_argb_black.png"]},
      customSpecs: [{"label":"Radiator Dimensions","value":"274 x 120 x 27 mm"},{"label":"TDP Rating","value":"250W TDP"},{"label":"Cold Plate Material","value":"Micro-Channel Pure Copper"},{"label":"Pump Speed & Bearing","value":"2800 RPM (+/-10%) / Ceramic (50K hrs)"},{"label":"Fans Included","value":"2x 120mm ARGB PWM (800-1800 RPM / 67.96 CFM)"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM5/AM4"}]
    },

    'cool-360-argb': {
      title: "Cool 360 ARGB",
      subtitle: "360mm extreme liquid CPU cooler with triple 120mm ARGB PWM fans for overclocked multi-core processors.",
      eyebrow: "LIQUID COOLERS",
      categoryName: "Liquid Coolers",
      categoryUrl: 'all-products.html?category=liquid-coolers',
      breadcrumbTitle: "Cool 360 ARGB",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/liquid-coolers/cool-360-argb/Black/cool_360_argb_black.png"],"white":["assets/images/products/liquid-coolers/cool-360-argb/Black/cool_360_argb_black.png"]},
      customSpecs: [{"label":"Radiator Dimensions","value":"394 x 120 x 27 mm"},{"label":"TDP Rating","value":"270W - 300W TDP"},{"label":"Cold Plate Material","value":"Micro-Channel Pure Copper"},{"label":"Pump Speed & Bearing","value":"2800 RPM (+/-10%) / Ceramic (50K hrs)"},{"label":"Fans Included","value":"3x 120mm ARGB PWM (800-1800 RPM / 67.96 CFM)"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM5/AM4"}]
    },

    'cool-240-digital-argb': {
      title: "Cool 240 Digital ARGB",
      subtitle: "240mm liquid cooler with real-time digital CPU temperature display embedded directly on the pump block.",
      eyebrow: "LIQUID COOLERS",
      categoryName: "Liquid Coolers",
      categoryUrl: 'all-products.html?category=liquid-coolers',
      breadcrumbTitle: "Cool 240 Digital ARGB",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/liquid-coolers/cool-240-digital-argb/Black/cool_240_digital_argb_black.png"],"white":["assets/images/products/liquid-coolers/cool-240-digital-argb/Black/cool_240_digital_argb_black.png"]},
      customSpecs: [{"label":"Display Feature","value":"Real-Time Digital Temperature HUD"},{"label":"Radiator Dimensions","value":"277 x 120 x 27 mm"},{"label":"TDP Rating","value":"Up to 250W TDP"},{"label":"Pump Speed","value":"2800 RPM (+/-10%)"},{"label":"Fans Included","value":"2x 120mm ARGB PWM"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM5/AM4"}]
    },

    'cool-360-digital-argb': {
      title: "Cool 360 Digital ARGB",
      subtitle: "360mm extreme performance liquid cooler with real-time digital status monitor on pump block.",
      eyebrow: "LIQUID COOLERS",
      categoryName: "Liquid Coolers",
      categoryUrl: 'all-products.html?category=liquid-coolers',
      breadcrumbTitle: "Cool 360 Digital ARGB",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/liquid-coolers/cool-360-digital-argb/Black/cool_360_digital_argb_black.png"],"white":["assets/images/products/liquid-coolers/cool-360-digital-argb/Black/cool_360_digital_argb_black.png"]},
      customSpecs: [{"label":"Display Feature","value":"Real-Time Digital Status HUD"},{"label":"Radiator Dimensions","value":"397 x 120 x 27 mm"},{"label":"TDP Rating","value":"Up to 320W TDP"},{"label":"Pump Speed","value":"2800 RPM (+/-10%)"},{"label":"Fans Included","value":"3x 120mm ARGB PWM"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM5/AM4"}]
    },

    'hurricane-240-argb': {
      title: "Hurricane GF-240 ARGB",
      subtitle: "240mm high-static pressure ARGB liquid cooler with copper base plate and low-noise 2700 RPM pump.",
      eyebrow: "LIQUID COOLERS",
      categoryName: "Liquid Coolers",
      categoryUrl: 'all-products.html?category=liquid-coolers',
      breadcrumbTitle: "Hurricane GF-240 ARGB",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/liquid-coolers/hurricane-240-argb/Black/hurricane_240_argb_black.png"],"white":["assets/images/products/liquid-coolers/hurricane-240-argb/Black/hurricane_240_argb_black.png"]},
      customSpecs: [{"label":"Radiator Dimensions","value":"272 x 120 x 27 mm"},{"label":"TDP Rating","value":"250W TDP"},{"label":"Materials","value":"Copper Base Plate + Aluminum Radiator"},{"label":"Pump Speed & Noise","value":"2700 RPM (+/-10%) / 26.9 dB Ultra Quiet"},{"label":"Fans Included","value":"2x 120mm ARGB (2700 RPM max / 58 CFM)"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM5/AM4"}]
    },

    'hurricane-360-argb': {
      title: "Hurricane GF-360 ARGB",
      subtitle: "360mm high-airflow liquid cooler with triple ARGB fans engineered for heavy multi-threaded workloads.",
      eyebrow: "LIQUID COOLERS",
      categoryName: "Liquid Coolers",
      categoryUrl: 'all-products.html?category=liquid-coolers',
      breadcrumbTitle: "Hurricane GF-360 ARGB",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/liquid-coolers/hurricane-360-argb/Black/hurricane_360_argb_black.png"],"white":["assets/images/products/liquid-coolers/hurricane-360-argb/Black/hurricane_360_argb_black.png"]},
      customSpecs: [{"label":"Radiator Dimensions","value":"397 x 120 x 27 mm (3 Fans)"},{"label":"TDP Rating","value":"250W - 320W TDP"},{"label":"Materials","value":"Copper Base Plate + Aluminum Radiator"},{"label":"Pump Speed & Noise","value":"2700 RPM (+/-10%) / 26.9 dB Ultra Quiet"},{"label":"Fans Included","value":"3x 120mm ARGB (2700 RPM max / 58 CFM)"},{"label":"Socket Compatibility","value":"Intel LGA 1700/1200/115X | AMD AM5/AM4"}]
    },

    'dynamite-xl-pro': {
      title: "Dynamite XL Pro",
      subtitle: "Dual-chamber panoramic showcase chassis with 270-degree tempered glass and vertical GPU mount ready.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Dynamite XL Pro",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/dynamite-xl-pro/Black/2001-b-4.png"],"white":["assets/images/products/cases/dynamite-xl-pro/Black/2001-b-4.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"E-ATX / ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"416.5 x 300 x 385 mm"},{"label":"Material & Thickness","value":"SPCC 0.90mm High-Grade Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 1x Type-C, 1x USB 1.0, HD Audio"},{"label":"Drive Bays","value":"1x 3.5\" HDD, 2x 2.5\" SSD"},{"label":"Expansion Slots","value":"7+3 Slots (Vertical GPU Ready)"},{"label":"Weight","value":"7.80 kg (NW) / 9.10 kg (GW)"}]
    },

    'frosty': {
      title: "Frosty",
      subtitle: "High airflow gaming chassis with full-mesh front ventilation and tempered glass side window.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Frosty",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/frosty/Black/02_frosty_view_1.png"],"white":["assets/images/products/cases/frosty/Black/02_frosty_view_1.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"E-ATX / ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"395 x 210 x 475 mm"},{"label":"Material & Thickness","value":"SPCC 0.55mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"2x 3.5\" HDD, 4x 2.5\" SSD"},{"label":"Expansion Slots","value":"7+2 Slots"},{"label":"Weight","value":"6.90 kg (NW) / 7.90 kg (GW)"}]
    },

    'spark': {
      title: "Spark",
      subtitle: "Compact Micro-ATX cube case engineered for space-efficient desks without sacrificing cooling.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Spark",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/spark/Black/8001-B-1.png"],"white":["assets/images/products/cases/spark/Black/8001-B-1.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"M-ATX / ITX"},{"label":"Chassis Dimensions","value":"325 x 270 x 315 mm"},{"label":"Material & Thickness","value":"SPCC 0.45mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 1x USB 1.0, Audio"},{"label":"Drive Bays","value":"1x 3.5\" HDD, 2x 2.5\" SSD"},{"label":"Expansion Slots","value":"4 Slots"},{"label":"Weight","value":"3.80 kg (NW) / 4.60 kg (GW)"}]
    },

    'star': {
      title: "Star",
      subtitle: "Sleek entry gaming chassis with custom geometric front air intake and compact footprint.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Star",
      colors: ["black"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/star/Black/T34-1.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"M-ATX / ITX"},{"label":"Chassis Dimensions","value":"265 x 165 x 350 mm"},{"label":"Material & Thickness","value":"SPCC 0.40mm Steel"},{"label":"Front I/O Ports","value":"2x USB 1.0, Audio"},{"label":"Drive Bays","value":"2x 3.5\" HDD, 2x 2.5\" SSD"},{"label":"Expansion Slots","value":"4 Slots"},{"label":"Weight","value":"2.40 kg (NW) / 2.80 kg (GW)"}]
    },

    'torrent': {
      title: "Torrent",
      subtitle: "Massive front intake ATX gaming tower optimized for high-power GPUs and continuous airflow.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Torrent",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/torrent/Black/05_torrent_black_view_1.png"],"white":["assets/images/products/cases/torrent/Black/05_torrent_black_view_1.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"ATX / Micro-ATX / ITX"},{"label":"Chassis Dimensions","value":"335 x 195 x 440 mm"},{"label":"Material & Thickness","value":"SPCC 0.45mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 1.0, Audio"},{"label":"Drive Bays","value":"2x 3.5\" HDD, 2x 2.5\" SSD"},{"label":"Expansion Slots","value":"7 Slots"},{"label":"Weight","value":"3.53 kg (NW) / 4.41 kg (GW)"}]
    },

    'dynamite-x5': {
      title: "Dynamite X5",
      subtitle: "Micro-ATX high airflow gaming case with full edge-to-edge transparent acrylic side panel.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Dynamite X5",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/dynamite-x5/Black/dynamite_x5_black_view_1.png"],"white":["assets/images/products/cases/dynamite-x5/Black/dynamite_x5_black_view_1.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"M-ATX / ITX"},{"label":"Chassis Dimensions","value":"350 x 210 x 380 mm"},{"label":"Material & Thickness","value":"SPCC 0.45mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 1.0, HD Audio"},{"label":"Drive Bays","value":"1x 3.5\" HDD, 1x 2.5\" SSD"},{"label":"Expansion Slots","value":"4 Slots"},{"label":"Weight","value":"4.43 kg (NW) / 5.30 kg (GW)"}]
    },

    'dynamite-x6': {
      title: "Dynamite X6",
      subtitle: "Premium ATX gaming chassis with Type-C front port, 0.60mm rigid steel chassis, and tempered glass.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Dynamite X6",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/dynamite-x6/Black/dynamite_x6_black_view_1.png"],"white":["assets/images/products/cases/dynamite-x6/Black/dynamite_x6_black_view_1.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"423 x 220 x 467 mm"},{"label":"Material & Thickness","value":"SPCC 0.60mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 1x Type-C, 1x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"1x 3.5\" HDD, 1x 2.5\" SSD"},{"label":"Expansion Slots","value":"7 Slots"},{"label":"Weight","value":"6.00 kg (NW) / 6.80 kg (GW)"}]
    },

    'dynamite-x7': {
      title: "Dynamite X7",
      subtitle: "Flagship E-ATX dual-tempered-glass cabinet with high thermal clearance and front Type-C high-speed IO.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Dynamite X7",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/dynamite-x7/Black/08_dynamite_x7_view_1.png"],"white":["assets/images/products/cases/dynamite-x7/Black/08_dynamite_x7_view_1.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"E-ATX / ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"430 x 225 x 480 mm"},{"label":"Material & Thickness","value":"SPCC 0.60mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 1x Type-C, 2x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"2x 3.5\" HDD, 2x 2.5\" SSD"},{"label":"Expansion Slots","value":"7 Slots"},{"label":"Weight","value":"7.24 kg (NW) / 8.36 kg (GW)"}]
    },

    'dynamite-base': {
      title: "Dynamite Base",
      subtitle: "Panoramic mini-tower showcase with curved seamless glass corner and clean dual-chamber cable management.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Dynamite Base",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/dynamite-base/Black/dynamite_black_view_1.png"],"white":["assets/images/products/cases/dynamite-base/Black/dynamite_black_view_1.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"M-ATX / ITX"},{"label":"Chassis Dimensions","value":"350 x 210 x 390 mm"},{"label":"Material & Thickness","value":"SPCC 0.60mm Steel + Tempered Glass"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"1x 3.5\" HDD, 2x 2.5\" SSD"},{"label":"Expansion Slots","value":"4 Slots"}]
    },

    'glacier': {
      title: "Glacier",
      subtitle: "Mid tower gaming case with frost-inspired front mesh grill and dedicated bottom PSU shroud.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Glacier",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/glacier/Black/glacier_black_view_1.png"],"white":["assets/images/products/cases/glacier/Black/glacier_black_view_1.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"358 x 200 x 460 mm"},{"label":"Material & Thickness","value":"SPCC 0.50mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"2x 3.5\" HDD, 2x 2.5\" SSD"},{"label":"Expansion Slots","value":"7 Slots"},{"label":"Weight","value":"3.90 kg (NW) / 4.90 kg (GW)"}]
    },

    'axle': {
      title: "Axle",
      subtitle: "Versatile ATX mid-tower case with solid chassis structure and optimal front-to-back straight airflow path.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Axle",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/axle/Black/axle_black_perspective.png"],"white":["assets/images/products/cases/axle/Black/axle_black_perspective.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"320 x 180 x 410 mm"},{"label":"Material & Thickness","value":"SPCC 0.50mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"1x 3.5\" HDD, 2x 2.5\" SSD"},{"label":"Expansion Slots","value":"7 Slots"},{"label":"Weight","value":"3.90 kg (NW) / 4.90 kg (GW)"}]
    },

    'shadow': {
      title: "Shadow",
      subtitle: "Stealth matte-black mid-tower cabinet with understated aesthetics and full cable management routing.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Shadow",
      colors: ["black"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/shadow/Black/L10-B-01.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"345 x 183 x 430 mm"},{"label":"Material & Thickness","value":"SPCC 0.45mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 1.0, HD Audio"},{"label":"Drive Bays","value":"2x 3.5\" HDD, 3x 2.5\" SSD"},{"label":"Expansion Slots","value":"7 Slots"},{"label":"Weight","value":"3.90 kg (NW) / 4.90 kg (GW)"}]
    },

    'roar': {
      title: "Roar",
      subtitle: "Aggressive compact gaming case with bold angular intake slots and lightweight sturdy frame.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Roar",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/roar/Black/roar_black_1.png"],"white":["assets/images/products/cases/roar/Black/roar_black_1.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"Micro-ATX / Mini-ITX"},{"label":"Chassis Dimensions","value":"290 x 190 x 375 mm"},{"label":"Material & Thickness","value":"SPCC 0.45mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"1x 3.5\" HDD, 1x 2.5\" SSD"},{"label":"Expansion Slots","value":"4 Slots"},{"label":"Weight","value":"2.25 kg (NW) / 2.85 kg (GW)"}]
    },

    'nexus-360': {
      title: "Nexus 360",
      subtitle: "Panoramic showcase case featuring dual tempered glass panels and full 360mm top radiator support.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Nexus 360",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/nexus-360/Black/nexus_360_black.png"],"white":["assets/images/products/cases/nexus-360/Black/nexus_360_black.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"455 x 210 x 485 mm"},{"label":"Material & Thickness","value":"SPCC 0.60mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 1x Type-C, 2x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"1x 3.5\" HDD, 2x 2.5\" SSD"},{"label":"Expansion Slots","value":"7 Slots"},{"label":"Weight","value":"3.90 kg (NW) / 4.90 kg (GW)"}]
    },

    'thunder': {
      title: "Thunder",
      subtitle: "Rugged industrial gaming tower with high-density mesh and multiple internal storage drive mounting options.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Thunder",
      colors: ["black"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/thunder/Black/i50-1.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"ATX / Micro-ATX / ITX"},{"label":"Chassis Dimensions","value":"326 x 190 x 433 mm"},{"label":"Material & Thickness","value":"SPCC 0.35mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 2x USB 1.0, Audio"},{"label":"Drive Bays","value":"2x HDD+1x SSD / 1x HDD+2x SSD / 3x SSD"},{"label":"Expansion Slots","value":"6 Slots"},{"label":"Weight","value":"3.95 kg (NW) / 4.70 kg (GW)"}]
    },

    'box-infinity': {
      title: "Box Infinity",
      subtitle: "Heavy-duty 1.0mm SPCC compact tower chassis with front Type-C port and versatile modular drive brackets.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Box Infinity",
      colors: ["black","white","yellow"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/box-infinity/box_infinity_view_1.png"],"white":["assets/images/products/cases/box-infinity/box_infinity_view_1.png"],"yellow":["assets/images/products/cases/box-infinity/box_infinity_view_1.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"M-ATX / ITX"},{"label":"Chassis Dimensions","value":"398 x 211 x 324 mm"},{"label":"Material & Thickness","value":"SPCC 1.0mm Heavy-Duty Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 1x Type-C, HD Audio"},{"label":"Drive Bays","value":"3x HDD + 2x SSD (or 1x HDD + 4x SSD)"},{"label":"Expansion Slots","value":"4 Slots"},{"label":"Weight","value":"4.90 kg (NW) / 5.80 kg (GW)"}]
    },

    'trendy': {
      title: "Trendy",
      subtitle: "Modern aesthetic E-ATX gaming cabinet with vertical GPU expansion slots and dual glass showcase design.",
      eyebrow: "GAMING CABINETS",
      categoryName: "Gaming Cabinets",
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: "Trendy",
      colors: ["black"],
      defaultColor: "black",
      images: {"black":["assets/images/products/cases/trendy/Black/trendy_m10_view_1.png"]},
      customSpecs: [{"label":"Motherboard Support","value":"E-ATX / ATX / M-ATX / ITX"},{"label":"Chassis Dimensions","value":"395 x 210 x 475 mm"},{"label":"Material & Thickness","value":"SPCC 0.55mm Steel"},{"label":"Front I/O Ports","value":"1x USB 3.0, 1x Type-C, 1x USB 2.0, HD Audio"},{"label":"Drive Bays","value":"2x 3.5\" HDD, 4x 2.5\" SSD"},{"label":"Expansion Slots","value":"7+2 Slots"},{"label":"Weight","value":"6.90 kg (NW) / 7.90 kg (GW)"}]
    },

    'gh-01': {
      title: "GH-01 Gaming Headset",
      subtitle: "Immersive gaming audio gear with 40mm dynamic drivers, omni-directional boom mic, and 2.0m durable braided cable.",
      eyebrow: "GAMING HEADPHONES",
      categoryName: "Gaming Headphones",
      categoryUrl: 'all-products.html?category=gaming-headphones',
      breadcrumbTitle: "GH-01 Gaming Headset",
      colors: ["black","white"],
      defaultColor: "black",
      images: {"black":["assets/images/products/gaming-headphones/gh-01/Black/gh01_black_view_1.png"],"white":["assets/images/products/gaming-headphones/gh-01/Black/gh01_black_view_1.png"]},
      customSpecs: [{"label":"Acoustic Driver","value":"ø40mm Dynamic Neodymium Driver"},{"label":"Frequency Response","value":"20 Hz - 20,000 Hz"},{"label":"Impedance & Sensitivity","value":"32 Ω / 110 dB +/- 5 dB"},{"label":"Rated Power","value":"20 mW (Max 30 mW)"},{"label":"Microphone Type","value":"Omni-directional (-42 dB +/- 2 dB, 2.2KΩ)"},{"label":"Connector Type","value":"3.5mm Stereo Plug + USB RGB"},{"label":"Cable Length","value":"~2.0 m Braided Heavy-Duty"},{"label":"Official Retail Price","value":"Rs. 2,499"}]
    },

    'high-current-450w': {
      title: "High Current 450W PSU",
      subtitle: "Reliable 450W continuous power supply with 80 Plus efficiency, active PFC, and silent 120mm cooling fan.",
      eyebrow: "POWER SUPPLY UNITS",
      categoryName: "Power Supply Units",
      categoryUrl: 'all-products.html?category=power-supply-units',
      breadcrumbTitle: "High Current 450W PSU",
      colors: ["black"],
      defaultColor: "black",
      images: {"black":["assets/images/products/power-supply-units/450w/450w_box_view_1.png"]},
      customSpecs: [{"label":"Continuous Output","value":"450 Watts Continuous"},{"label":"Efficiency Rating","value":"80 Plus Certified"},{"label":"Power Factor Correction","value":"Active PFC (>0.99 Typical)"},{"label":"Cooling Fan","value":"120mm Silent Hydraulic Bearing Fan"},{"label":"Protection Suite","value":"OVP / UVP / OPP / SCP Protections"},{"label":"AC Input Voltage","value":"100-240V AC Full Range"},{"label":"Cabling Type","value":"Flat Stealth Black Cables"}]
    },

    'high-current-550w': {
      title: "High Current 550W PSU",
      subtitle: "550W 80 Plus Bronze certified PSU with dual PCIe 8-pin power connectors for modern mid-range GPUs.",
      eyebrow: "POWER SUPPLY UNITS",
      categoryName: "Power Supply Units",
      categoryUrl: 'all-products.html?category=power-supply-units',
      breadcrumbTitle: "High Current 550W PSU",
      colors: ["black"],
      defaultColor: "black",
      images: {"black":["assets/images/products/power-supply-units/550w/550w_box_view_1.png"]},
      customSpecs: [{"label":"Continuous Output","value":"550 Watts Continuous"},{"label":"Efficiency Rating","value":"80 Plus Bronze Certified"},{"label":"Power Factor Correction","value":"Active PFC (>0.99 Typical)"},{"label":"Cooling Fan","value":"120mm Silent Hydraulic Bearing Fan"},{"label":"PCIe Connectors","value":"2x PCIe 8-pin (6+2)"},{"label":"Protection Suite","value":"OVP / UVP / OPP / SCP / OCP"},{"label":"AC Input Voltage","value":"100-240V AC Full Range"}]
    },

    'high-current-650w': {
      title: "High Current 650W PSU",
      subtitle: "650W high-efficiency power supply unit with dedicated single +12V rail and silent thermal fan curve.",
      eyebrow: "POWER SUPPLY UNITS",
      categoryName: "Power Supply Units",
      categoryUrl: 'all-products.html?category=power-supply-units',
      breadcrumbTitle: "High Current 650W PSU",
      colors: ["black"],
      defaultColor: "black",
      images: {"black":["assets/images/products/power-supply-units/650w/650w_box_view_1.png"]},
      customSpecs: [{"label":"Continuous Output","value":"650 Watts Continuous"},{"label":"Efficiency Rating","value":"80 Plus Bronze Certified"},{"label":"Power Factor Correction","value":"Active PFC (>0.99 Typical)"},{"label":"Cooling Fan","value":"120mm Silent Hydraulic Bearing Fan"},{"label":"PCIe Connectors","value":"2x PCIe 8-pin (6+2)"},{"label":"Protection Suite","value":"OVP / UVP / OPP / SCP / OCP"},{"label":"AC Input Voltage","value":"100-240V AC Full Range"}]
    },

    'high-current-750w': {
      title: "High Current 750W PSU",
      subtitle: "750W high-performance power supply unit engineered for gaming rigs with multi-fan ARGB setups and high-TDP GPUs.",
      eyebrow: "POWER SUPPLY UNITS",
      categoryName: "Power Supply Units",
      categoryUrl: 'all-products.html?category=power-supply-units',
      breadcrumbTitle: "High Current 750W PSU",
      colors: ["black"],
      defaultColor: "black",
      images: {"black":["assets/images/products/power-supply-units/750w/750w_box_view_1.png"]},
      customSpecs: [{"label":"Continuous Output","value":"750 Watts Continuous"},{"label":"Efficiency Rating","value":"80 Plus Bronze / Gold"},{"label":"Power Factor Correction","value":"Active PFC (>0.99 Typical)"},{"label":"Cooling Fan","value":"120mm Silent Hydraulic Bearing Fan"},{"label":"PCIe Connectors","value":"4x PCIe 8-pin (6+2)"},{"label":"Protection Suite","value":"Full Industrial Protections (OVP/UVP/OPP/SCP/OCP/OTP)"},{"label":"AC Input Voltage","value":"100-240V AC Full Range"}]
    },

    'high-current-850w': {
      title: "High Current 850W PSU",
      subtitle: "850W enthusiast-grade power supply featuring 80 Plus Gold efficiency and high-output +12V rail for flagship graphics cards.",
      eyebrow: "POWER SUPPLY UNITS",
      categoryName: "Power Supply Units",
      categoryUrl: 'all-products.html?category=power-supply-units',
      breadcrumbTitle: "High Current 850W PSU",
      colors: ["black"],
      defaultColor: "black",
      images: {"black":["assets/images/products/power-supply-units/850w/850w_box_view_1.png"]},
      customSpecs: [{"label":"Continuous Output","value":"850 Watts Continuous"},{"label":"Efficiency Rating","value":"80 Plus Gold High Efficiency"},{"label":"Power Factor Correction","value":"Active PFC (>0.99 Typical)"},{"label":"Cooling Fan","value":"120mm Silent Hydraulic Bearing Fan"},{"label":"PCIe Connectors","value":"4x PCIe 8-pin + 12VHPWR Ready"},{"label":"Protection Suite","value":"Full Industrial Protections (OVP/UVP/OPP/SCP/OCP/OTP)"},{"label":"AC Input Voltage","value":"100-240V AC Full Range"}]
    }
  };

  // Merge dynamic admin products from localStorage into catalog
  try {
    const storedProds = JSON.parse(localStorage.getItem('im_wm_products'));
    if (Array.isArray(storedProds)) {
      storedProds.forEach(p => {
        const pColors = (p.colors && p.colors.length) ? p.colors : ['black'];
        const pImages = {};
        pColors.forEach(c => {
          pImages[c] = [p.img || 'assets/images/homepage/im_official_emblem.png'];
        });
        catalog[p.id] = {
          title: p.name,
          subtitle: p.desc || p.name,
          eyebrow: (p.catName || p.cat || 'PC HARDWARE').toUpperCase(),
          categoryName: p.catName || p.cat || 'Products',
          categoryUrl: `all-products.html?category=${p.cat}`,
          breadcrumbTitle: p.name,
          colors: pColors,
          defaultColor: pColors[0],
          customSpecs: p.specs || '',
          images: pImages
        };
      });
    }
  } catch(e) {}

  // Load Product based on Query Param or default to 'dynamite-xl-pro'
  const urlParams = new URLSearchParams(window.location.search);
  const paramKey = urlParams.get('product') || 'dynamite-xl-pro';
  const prod = catalog[paramKey] || catalog['dynamite-xl-pro'];

  // Apply Product Info to DOM
  const bcCatLink = document.getElementById('pd-bc-cat-link');
  const bcTitle = document.getElementById('pd-bc-current-title');
  const eyebrowLabel = document.getElementById('pd-eyebrow-label');
  const prodTitle = document.getElementById('pd-title');
  const prodSubtitle = document.getElementById('pd-subtitle');
  const enquireLink = document.getElementById('pd-enquire-link');
  const specsContainer = document.getElementById('pd-specs-container');
  const colorSelector = document.getElementById('pd-color-selector');

  if (bcCatLink) {
    bcCatLink.textContent = prod.categoryName;
    bcCatLink.href = prod.categoryUrl;
  }
  if (bcTitle) bcTitle.textContent = prod.breadcrumbTitle;
  if (eyebrowLabel) eyebrowLabel.textContent = prod.eyebrow;
  if (prodTitle) prodTitle.textContent = prod.title;
  if (prodSubtitle) prodSubtitle.textContent = prod.subtitle;

  if (enquireLink) {
    const text = encodeURIComponent(`Hi Ice Master, I am interested in the ${prod.breadcrumbTitle}. Could you share pricing and availability?`);
    enquireLink.href = `https://wa.me/919876543210?text=${text}`;
    enquireLink.setAttribute('aria-label', `Enquire about ${prod.breadcrumbTitle} on WhatsApp`);
  }

  // Specifications section: Display custom specs if present, or pending placeholder
  if (specsContainer) {
    if (prod.customSpecs) {
      let specsHTML = '';
      if (Array.isArray(prod.customSpecs) && prod.customSpecs.length > 0) {
        specsHTML = `
          <div class="pd-specs-table-box" style="margin-top: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
            <div style="padding: 12px 18px; background: rgba(255,255,255,0.05); font-size: 12px; font-weight: 800; color: #E42F38; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.06);">
              Technical Parameters & Compatibility
            </div>
            <div style="display: flex; flex-direction: column;">
              ${prod.customSpecs.map((s, i) => `
                <div style="display: flex; justify-content: space-between; padding: 10px 18px; border-bottom: 1px solid rgba(255,255,255,0.04); background: ${i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}; font-size: 13px;">
                  <span style="color: #94A3B8; font-weight: 600; width: 44%;">${s.label}</span>
                  <span style="color: #F1F5F9; font-weight: 500; width: 54%; text-align: right; font-family: monospace;">${s.value}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        specsHTML = `
          <div class="pd-specs-custom-box" style="padding: 18px 20px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-top: 10px;">
            <div style="font-size: 13px; font-weight: 700; color: #E42F38; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Key Specifications</div>
            <p style="font-size: 13.5px; color: #E2E8F0; line-height: 1.6; margin: 0; font-family: monospace;">${prod.customSpecs}</p>
          </div>
        `;
      }
      specsContainer.innerHTML = specsHTML;
    } else {
      specsContainer.innerHTML = `
        <div class="pd-specs-pending-box">
          <div class="pd-specs-pending-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="pd-specs-pending-text">
            <strong>Official Specifications Pending Client Release</strong>
            <p>Technical parameters, clearance dimensions, and hardware compatibility for <em>${prod.breadcrumbTitle}</em> will be published here upon official release.</p>
          </div>
        </div>
      `;
    }
  }

  // Active color state
  const initialColorParam = urlParams.get('color') || urlParams.get('col');
  let currentColor = (initialColorParam && prod.colors.includes(initialColorParam.toLowerCase())) 
    ? initialColorParam.toLowerCase() 
    : (prod.defaultColor || 'black');

  // Function to render gallery thumbnails for current color
  function renderGallery(color) {
    const viewList = (prod.images && prod.images[color]) ? prod.images[color] : [];
    if (!viewList.length) return;

    if (thumbContainer) {
      thumbContainer.innerHTML = '';
      viewList.forEach((src, idx) => {
        const btn = document.createElement('button');
        btn.className = `pd-thumb-item ${idx === 0 ? 'active' : ''}`;
        btn.setAttribute('data-index', idx);
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
        btn.setAttribute('aria-label', `View ${idx + 1}`);
        btn.innerHTML = `<img src="${src}" alt="${prod.breadcrumbTitle} View ${idx + 1}" class="pd-thumb-pic">`;
        
        btn.addEventListener('click', () => {
          document.querySelectorAll('.pd-thumb-item').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');

          if (pdStageImg) {
            pdStageImg.style.opacity = '0';
            pdStageImg.style.transform = 'scale(0.97)';
            setTimeout(() => {
              pdStageImg.src = src;
              pdStageImg.style.opacity = '1';
              pdStageImg.style.transform = 'scale(1)';
            }, 120);
          }
        });

        thumbContainer.appendChild(btn);
      });
    }

    // Set initial main image
    if (pdStageImg && viewList[0]) {
      pdStageImg.style.opacity = '0';
      pdStageImg.style.transform = 'scale(0.97)';
      setTimeout(() => {
        pdStageImg.src = viewList[0];
        pdStageImg.alt = `${prod.breadcrumbTitle} - ${color.toUpperCase()}`;
        pdStageImg.style.opacity = '1';
        pdStageImg.style.transform = 'scale(1)';
      }, 80);
    }
  }

  // Initialize Color Switcher
  if (colorSelector) {
    const group = colorSelector.querySelector('.pd-color-group');
    if (group && prod.colors && prod.colors.length > 0) {
      group.innerHTML = prod.colors.map(col => `
        <button type="button" class="pd-color-btn ${col === currentColor ? 'active' : ''}" data-color="${col}" aria-label="Select ${col} Edition">
          <span class="pd-color-circle color-${col}"></span>
          <span class="pd-color-text" style="text-transform: capitalize;">${col}</span>
        </button>
      `).join('');
    }

    const colorBtns = colorSelector.querySelectorAll('.pd-color-btn');
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        if (color === currentColor) return;
        currentColor = color;
        colorBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-color') === currentColor));
        renderGallery(currentColor);
      });
    });
  }

  // Initial gallery render
  renderGallery(currentColor);
}

/* ==========================================================================
   08. DOWNLOADS PAGE ICECOOLER CONTROLLER (360 BLACK / 240 WHITE & DOWNLOAD)
   ========================================================================== */
function initDownloadsPageController() {
  const modelPills = document.querySelectorAll('.dl-pill-btn, .dl-model-pill');
  const downloadBtns = document.querySelectorAll('#exactDownloadBtn, #dlDownloadBtn');

  modelPills.forEach(pill => {
    pill.addEventListener('click', () => {
      modelPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  downloadBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerSoftwareDownload(btn);
    });
  });

  const primaryCTA = document.getElementById('dl-primary-cta');
  if (primaryCTA) {
    primaryCTA.addEventListener('click', (e) => {
      e.preventDefault();
      triggerSoftwareDownload(primaryCTA);
    });
  }

  function triggerSoftwareDownload(buttonEl) {
    try {
      const storedSoft = JSON.parse(localStorage.getItem('im_wm_software'));
      if (Array.isArray(storedSoft) && storedSoft.length > 0) {
        const item = storedSoft[0];
        if (item.content) {
          const a = document.createElement('a');
          a.href = item.content;
          a.download = item.url || `${item.title}.zip`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          return;
        } else if (item.url && item.url !== '#') {
          window.open(item.url, '_blank');
          return;
        }
      }
    } catch(err) {}

    const textSpan = buttonEl.querySelector('.dl-btn-text, span');
    if (!textSpan) return;

    const originalText = textSpan.textContent;
    textSpan.textContent = 'Downloading...';
    buttonEl.style.opacity = '0.85';
    
    setTimeout(() => {
      textSpan.textContent = 'Download Started!';
      setTimeout(() => {
        textSpan.textContent = originalText;
        buttonEl.style.opacity = '1';
      }, 2200);
    }, 700);
  }
}

/* ==========================================================================
   09. CONTACT PAGE CONTROLLER (FORM VALIDATION, CHAR COUNTER & SUBMISSION)
   ========================================================================== */
function initContactPageController() {
  const contactForm = document.getElementById('iceContactForm');
  const messageInput = document.getElementById('contactMessage');
  const charCountEl = document.getElementById('charCount');
  const toastEl = document.getElementById('contactToast');
  const submitBtn = document.getElementById('contactSubmitBtn');

  // Character counter for textarea
  if (messageInput && charCountEl) {
    messageInput.addEventListener('input', () => {
      const length = messageInput.value.length;
      charCountEl.textContent = length;
      if (length >= 480) {
        charCountEl.style.color = '#ff1e27';
      } else {
        charCountEl.style.color = '#64748b';
      }
    });
  }

  // Form Submission
  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const btnText = submitBtn.querySelector('.btn-text');
      const originalText = btnText ? btnText.textContent : 'Send Message';

      if (btnText) btnText.textContent = 'Sending...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.8';

      setTimeout(() => {
        if (toastEl) {
          toastEl.className = 'contact-feedback-toast success';
          toastEl.textContent = '✓ Thank you! Your message has been sent successfully. We will reply within 24 hours.';
          toastEl.style.display = 'block';
        }

        contactForm.reset();
        if (charCountEl) charCountEl.textContent = '0';

        if (btnText) btnText.textContent = 'Message Sent!';

        setTimeout(() => {
          if (btnText) btnText.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          if (toastEl) {
            setTimeout(() => {
              toastEl.style.display = 'none';
            }, 4000);
          }
        }, 2000);
      }, 900);
    });
  }
}
