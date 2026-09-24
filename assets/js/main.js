/**
 * ICEMASTER TECHNOLOGIES — ALL SECTIONS INTERACTION CONTROLLERS
 */

/* Apply saved theme IMMEDIATELY (before DOM ready) to prevent white flash */
(function() {
  const saved = localStorage.getItem('im-theme');
  if (saved === 'light') document.documentElement.classList.add('light-mode');
})();

document.addEventListener('DOMContentLoaded', () => {
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

  function activateCategory(catKey, scrollToGrid = false, isImmediate = false) {
    if (!catKey) catKey = 'air-coolers';
    if (aliasMap[catKey]) catKey = aliasMap[catKey];
    if (!categoryMeta[catKey]) catKey = 'air-coolers';

    // 1. Update Category Selection Tiles
    catTiles.forEach(tile => {
      const isMatch = tile.getAttribute('data-cat-key') === catKey;
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

    // 3. Filter Product Cards
    let visibleCount = 0;
    catCards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      const isVisible = (cardCat === catKey);
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
    emptyCards.forEach(empty => {
      const emptyCat = empty.getAttribute('data-category');
      const isVisible = (emptyCat === catKey);
      if (isVisible) {
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

  // Complete Catalog of 14 Real Products from Final_Z_Products
  const catalog = {
    // Air Coolers
    'fusion': {
      title: 'FUSION',
      subtitle: 'High-Performance CPU Air Cooler',
      eyebrow: 'CPU AIR COOLER',
      categoryName: 'Air Coolers',
      categoryUrl: 'all-products.html?category=air-coolers',
      breadcrumbTitle: 'Fusion CPU Air Cooler',
      colors: ['black'],
      defaultColor: 'black',
      images: {
        'black': [
          'assets/images/products/air-coolers/fusion/fusion_aircooler_view_1.png',
          'assets/images/products/air-coolers/fusion/fusion_aircooler_view_2.png',
          'assets/images/products/air-coolers/fusion/fusion_aircooler_view_3.png',
          'assets/images/products/air-coolers/fusion/fusion_aircooler_view_4.png',
          'assets/images/products/air-coolers/fusion/fusion_aircooler_view_5.png'
        ]
      }
    },

    // Liquid Coolers
    'cool-240-argb': {
      title: 'COOL 240 ARGB',
      subtitle: '240mm ARGB Liquid CPU Cooler',
      eyebrow: 'LIQUID CPU COOLER',
      categoryName: 'Liquid Coolers',
      categoryUrl: 'all-products.html?category=liquid-coolers',
      breadcrumbTitle: 'Cool 240 ARGB Liquid Cooler',
      colors: ['black', 'white'],
      defaultColor: 'black',
      images: {
        'black': ['assets/images/products/liquid-coolers/cool-240-argb/Black/cool_240_argb_black.png'],
        'white': ['assets/images/products/liquid-coolers/cool-240-argb/White/cool_240_argb_white.png']
      }
    },
    'cool-360-argb': {
      title: 'COOL 360 ARGB',
      subtitle: '360mm ARGB Liquid CPU Cooler',
      eyebrow: 'LIQUID CPU COOLER',
      categoryName: 'Liquid Coolers',
      categoryUrl: 'all-products.html?category=liquid-coolers',
      breadcrumbTitle: 'Cool 360 ARGB Liquid Cooler',
      colors: ['black', 'white'],
      defaultColor: 'black',
      images: {
        'black': ['assets/images/products/liquid-coolers/cool-360-argb/Black/cool_360_argb_black.png'],
        'white': ['assets/images/products/liquid-coolers/cool-360-argb/White/cool_360_argb_white.png']
      }
    },
    'cool-240-digital-argb': {
      title: 'COOL 240 DIGITAL ARGB',
      subtitle: '240mm Digital Display Liquid CPU Cooler',
      eyebrow: 'LIQUID CPU COOLER',
      categoryName: 'Liquid Coolers',
      categoryUrl: 'all-products.html?category=liquid-coolers',
      breadcrumbTitle: 'Cool 240 Digital ARGB Liquid Cooler',
      colors: ['black', 'white'],
      defaultColor: 'black',
      images: {
        'black': ['assets/images/products/liquid-coolers/cool-240-digital-argb/Black/cool_240_digital_argb_black.png'],
        'white': ['assets/images/products/liquid-coolers/cool-240-digital-argb/White/cool_240_digital_argb_white.png']
      }
    },
    'cool-360-digital-argb': {
      title: 'COOL 360 DIGITAL ARGB',
      subtitle: '360mm Digital Display Liquid CPU Cooler',
      eyebrow: 'LIQUID CPU COOLER',
      categoryName: 'Liquid Coolers',
      categoryUrl: 'all-products.html?category=liquid-coolers',
      breadcrumbTitle: 'Cool 360 Digital ARGB Liquid Cooler',
      colors: ['black', 'white'],
      defaultColor: 'black',
      images: {
        'black': ['assets/images/products/liquid-coolers/cool-360-digital-argb/Black/cool_360_digital_argb_black.png'],
        'white': ['assets/images/products/liquid-coolers/cool-360-digital-argb/White/cool_360_digital_argb_white.png']
      }
    },

    // Gaming Cabinets
    'dynamite-xl-pro': {
      title: 'DYNAMITE XL PRO',
      subtitle: 'Dual Chamber Premium Gaming Cabinet',
      eyebrow: 'PC GAMING CABINET',
      categoryName: 'Gaming Cabinets',
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: 'Dynamite XL Pro Gaming Cabinet',
      colors: ['black', 'white'],
      defaultColor: 'black',
      images: {
        'black': [
          'assets/images/products/cases/dynamite-xl-pro/Black/2001-b-4.png',
          'assets/images/products/cases/dynamite-xl-pro/Black/2001-b-5.png',
          'assets/images/products/cases/dynamite-xl-pro/Black/3c8a8cb83dc7aabfe00de8eaf8382e5.png',
          'assets/images/products/cases/dynamite-xl-pro/Black/ecae38b2e98f976ec42ad6997ac08de.png',
          'assets/images/products/cases/dynamite-xl-pro/Black/fd8e7cc46e9237e4a77a46972c8a2d9.png'
        ],
        'white': [
          'assets/images/products/cases/dynamite-xl-pro/White/2001-w-4.png',
          'assets/images/products/cases/dynamite-xl-pro/White/2001-w-5.png',
          'assets/images/products/cases/dynamite-xl-pro/White/6d5b254c74b7574e69e3b6f0bbd84a7.png',
          'assets/images/products/cases/dynamite-xl-pro/White/b4292f6039abee2018bff785e7ca063.png',
          'assets/images/products/cases/dynamite-xl-pro/White/d5174cabf6c433c391c146064ce2080.png'
        ]
      }
    },
    'frosty': {
      title: 'FROSTY',
      subtitle: 'High Airflow Micro-ATX / ATX Cabinet',
      eyebrow: 'PC GAMING CABINET',
      categoryName: 'Gaming Cabinets',
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: 'Frosty Gaming Cabinet',
      colors: ['black', 'white'],
      defaultColor: 'black',
      images: {
        'black': [
          'assets/images/products/cases/frosty/Black/02_frosty_view_1.png',
          'assets/images/products/cases/frosty/Black/02_frosty_view_2.png',
          'assets/images/products/cases/frosty/Black/02_frosty_view_3.png',
          'assets/images/products/cases/frosty/Black/02_frosty_view_4.png'
        ],
        'white': [
          'assets/images/products/cases/frosty/White/02_frosty_view_5.png',
          'assets/images/products/cases/frosty/White/02_frosty_view_6.png'
        ]
      }
    },
    'spark': {
      title: 'SPARK',
      subtitle: 'Compact High-Airflow Gaming Cabinet',
      eyebrow: 'PC GAMING CABINET',
      categoryName: 'Gaming Cabinets',
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: 'Spark Gaming Cabinet',
      colors: ['black', 'white'],
      defaultColor: 'black',
      images: {
        'black': [
          'assets/images/products/cases/spark/Black/8001-B-1.png',
          'assets/images/products/cases/spark/Black/8001-B-2.png',
          'assets/images/products/cases/spark/Black/8001-B-3.png',
          'assets/images/products/cases/spark/Black/8001-B-4.png',
          'assets/images/products/cases/spark/Black/8001-B-5.png'
        ],
        'white': [
          'assets/images/products/cases/spark/White/8001-W-1.png',
          'assets/images/products/cases/spark/White/8001-W-2.png',
          'assets/images/products/cases/spark/White/8001-W-3.png',
          'assets/images/products/cases/spark/White/8001-W-4.png',
          'assets/images/products/cases/spark/White/8001-W-5.png'
        ]
      }
    },
    'star': {
      title: 'STAR',
      subtitle: 'Geometric Mesh Flow Gaming Cabinet',
      eyebrow: 'PC GAMING CABINET',
      categoryName: 'Gaming Cabinets',
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: 'Star Gaming Cabinet',
      colors: ['black'],
      defaultColor: 'black',
      images: {
        'black': [
          'assets/images/products/cases/star/Black/T34-1.png',
          'assets/images/products/cases/star/Black/T34-02.png',
          'assets/images/products/cases/star/Black/T34-05.png',
          'assets/images/products/cases/star/Black/T34-3.png',
          'assets/images/products/cases/star/Black/T34-4.png',
          'assets/images/products/cases/star/Black/99fccebc7f97ab7b9fd0bc30385bfbd.png',
          'assets/images/products/cases/star/Black/d47814733135cc9b5cc7c1dfca5ebe3.png'
        ]
      }
    },
    'torrent': {
      title: 'TORRENT',
      subtitle: 'High-Velocity Performance Gaming Cabinet',
      eyebrow: 'PC GAMING CABINET',
      categoryName: 'Gaming Cabinets',
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: 'Torrent Gaming Cabinet',
      colors: ['black', 'white'],
      defaultColor: 'black',
      images: {
        'black': [
          'assets/images/products/cases/torrent/Black/05_torrent_black_view_1.png',
          'assets/images/products/cases/torrent/Black/05_torrent_black_view_2.png',
          'assets/images/products/cases/torrent/Black/05_torrent_black_view_3.png',
          'assets/images/products/cases/torrent/Black/05_torrent_black_view_4.png'
        ],
        'white': [
          'assets/images/products/cases/torrent/White/05_torrent_white_view_1.png',
          'assets/images/products/cases/torrent/White/05_torrent_white_view_2.png'
        ]
      }
    },
    'dynamite-x7': {
      title: 'DYNAMITE X7',
      subtitle: 'Panoramic Tempered Glass Gaming Cabinet',
      eyebrow: 'PC GAMING CABINET',
      categoryName: 'Gaming Cabinets',
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: 'Dynamite X7 Gaming Cabinet',
      colors: ['black', 'white'],
      defaultColor: 'black',
      images: {
        'black': [
          'assets/images/products/cases/dynamite-x7/Black/08_dynamite_x7_view_1.png',
          'assets/images/products/cases/dynamite-x7/Black/08_dynamite_x7_view_3.png',
          'assets/images/products/cases/dynamite-x7/Black/08_dynamite_x7_view_4.png'
        ],
        'white': [
          'assets/images/products/cases/dynamite-x7/White/08_dynamite_x7_view_2.png'
        ]
      }
    },
    'shadow': {
      title: 'SHADOW',
      subtitle: 'Modern Minimalist Gaming Cabinet',
      eyebrow: 'PC GAMING CABINET',
      categoryName: 'Gaming Cabinets',
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: 'Shadow Gaming Cabinet',
      colors: ['black'],
      defaultColor: 'black',
      images: {
        'black': [
          'assets/images/products/cases/shadow/Black/L10-B-01.png',
          'assets/images/products/cases/shadow/Black/L10-B-02.png',
          'assets/images/products/cases/shadow/Black/L10-B-03.png',
          'assets/images/products/cases/shadow/Black/L10-B-04.png',
          'assets/images/products/cases/shadow/Black/L10-B-05.png'
        ]
      }
    },
    'trendy': {
      title: 'TRENDY',
      subtitle: 'High Airflow Mid-Tower Gaming Cabinet',
      eyebrow: 'PC GAMING CABINET',
      categoryName: 'Gaming Cabinets',
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: 'Trendy Gaming Cabinet',
      colors: ['black'],
      defaultColor: 'black',
      images: {
        'black': [
          'assets/images/products/cases/trendy/Black/trendy_m10_view_1.png',
          'assets/images/products/cases/trendy/Black/trendy_m10_view_2.png',
          'assets/images/products/cases/trendy/Black/trendy_m10_view_3.png',
          'assets/images/products/cases/trendy/Black/trendy_m10_view_4.png',
          'assets/images/products/cases/trendy/Black/trendy_m10_view_5.png'
        ]
      }
    },
    'roar': {
      title: 'ROAR',
      subtitle: 'Extreme Airflow Aggressive Gaming Cabinet',
      eyebrow: 'PC GAMING CABINET',
      categoryName: 'Gaming Cabinets',
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: 'Roar Gaming Cabinet',
      colors: ['black', 'white'],
      defaultColor: 'black',
      images: {
        'black': [
          'assets/images/products/cases/roar/Black/roar_black_1.png',
          'assets/images/products/cases/roar/Black/roar_black_2.png',
          'assets/images/products/cases/roar/Black/roar_black_3.png'
        ],
        'white': [
          'assets/images/products/cases/roar/White/roar_white_1.png',
          'assets/images/products/cases/roar/White/roar_white_2.png',
          'assets/images/products/cases/roar/White/roar_white_3.png'
        ]
      }
    },
    'thunder': {
      title: 'THUNDER',
      subtitle: 'Bold Industrial Performance Cabinet',
      eyebrow: 'PC GAMING CABINET',
      categoryName: 'Gaming Cabinets',
      categoryUrl: 'all-products.html?category=gaming-cabinets',
      breadcrumbTitle: 'Thunder Gaming Cabinet',
      colors: ['black'],
      defaultColor: 'black',
      images: {
        'black': [
          'assets/images/products/cases/thunder/Black/i50-1.png',
          'assets/images/products/cases/thunder/Black/i50-2.png',
          'assets/images/products/cases/thunder/Black/i50-3.png',
          'assets/images/products/cases/thunder/Black/i50-4.png',
          'assets/images/products/cases/thunder/Black/i50-5.png'
        ]
      }
    }
  };

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

  // Specifications section: Pending Client Confirmation (no fake specs)
  if (specsContainer) {
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
    const hasWhite = prod.colors.includes('white');
    const hasBlack = prod.colors.includes('black');

    const blackBtn = colorSelector.querySelector('.pd-color-btn[data-color="black"]');
    const whiteBtn = colorSelector.querySelector('.pd-color-btn[data-color="white"]');

    if (blackBtn) blackBtn.style.display = hasBlack ? 'inline-flex' : 'none';
    if (whiteBtn) whiteBtn.style.display = hasWhite ? 'inline-flex' : 'none';

    if (!hasWhite) {
      // If only black is available, hide switcher or keep single black badge
      if (blackBtn) blackBtn.classList.add('active');
    }

    const colorBtns = colorSelector.querySelectorAll('.pd-color-btn');
    colorBtns.forEach(btn => {
      const c = btn.getAttribute('data-color');
      btn.classList.toggle('active', c === currentColor);

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
      const textSpan = btn.querySelector('span');
      if (!textSpan) return;

      const originalText = textSpan.textContent;
      textSpan.textContent = 'Downloading...';
      btn.style.opacity = '0.85';
      
      setTimeout(() => {
        textSpan.textContent = 'Download Started!';
        setTimeout(() => {
          textSpan.textContent = originalText;
          btn.style.opacity = '1';
        }, 2200);
      }, 700);
    });
  });
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
