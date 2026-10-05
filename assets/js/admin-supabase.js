/**
 * ICEMASTER TECHNOLOGIES — ADMIN SUPABASE DATA BRIDGE
 * Real-time synchronization between Admin Panel and Supabase Cloud Database & Storage
 */

const ADMIN_PIN = "9311"; // Master PIN for Admin Panel (changeable)

// Verify admin authentication
function checkAdminAuth() {
  const isAuth = sessionStorage.getItem("im_admin_auth") || localStorage.getItem("im_admin_auth");
  const lockScreen = document.getElementById("adminPinModal") || document.getElementById("adminLockScreen");
  if (isAuth === "true") {
    if (lockScreen) lockScreen.style.display = "none";
    return true;
  } else {
    if (lockScreen) lockScreen.style.display = "flex";
    return false;
  }
}

function verifyAdminPin(e) {
  if (e) e.preventDefault();
  const pinInput = document.getElementById("pinField") || document.getElementById("adminPinInput");
  const errEl = document.getElementById("pinErrMsg") || document.getElementById("adminPinError");
  if (!pinInput) return;

  if (pinInput.value.trim() === ADMIN_PIN) {
    sessionStorage.setItem("im_admin_auth", "true");
    localStorage.setItem("im_admin_auth", "true");
    const lockScreen = document.getElementById("adminPinModal") || document.getElementById("adminLockScreen");
    if (lockScreen) lockScreen.style.display = "none";
    if (typeof showToast === 'function') showToast("✓ Welcome to Ice Master Admin!");
  } else {
    if (errEl) {
      errEl.textContent = "Incorrect PIN. Please try again.";
      errEl.style.display = "block";
    }
    pinInput.value = "";
    pinInput.focus();
  }
}

// Update cloud connection badge in header
function updateCloudStatusBadge(isConnected, msg = "") {
  let badge = document.getElementById("cloudStatusBadge");
  if (!badge) {
    const headerRight = document.querySelector(".im-topbar-right");
    if (headerRight) {
      badge = document.createElement("div");
      badge.id = "cloudStatusBadge";
      badge.className = "im-cloud-badge";
      headerRight.prepend(badge);
    }
  }
  if (badge) {
    if (isConnected) {
      badge.innerHTML = `<span class="badge-dot green"></span> Live Cloud Sync Active`;
      badge.title = "Connected to Supabase (Real-Time Cloud Database)";
      badge.style.color = "#10B981";
      badge.style.display = "inline-flex";
    } else {
      badge.innerHTML = `<span class="badge-dot yellow"></span> Local Cache Mode ${msg ? '(' + msg + ')' : ''}`;
      badge.title = "Operating from local cache. Connect to cloud for live multi-user sync.";
      badge.style.color = "#F59E0B";
      badge.style.display = "inline-flex";
    }
  }
}

// ============================================================================
// SUPABASE STORAGE: DIRECT FILE UPLOAD (Zero Base64, Zero LocalStorage Quota)
// ============================================================================
async function uploadFileToSupabaseStorage(file, folder = "products") {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase client not initialized");

  const ext = file.name.split('.').pop() || 'png';
  const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const filePath = `${folder}/${Date.now()}_${cleanName}.${ext}`;

  const { data, error } = await sb.storage
    .from(SUPABASE_CONFIG.mediaBucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw error;
  }

  const { data: publicUrlData } = sb.storage
    .from(SUPABASE_CONFIG.mediaBucket)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

// ============================================================================
// SUPABASE DATA SYNC: LOAD ALL DATA INTO ADMIN MEMORY
// ============================================================================
async function loadAdminDataFromSupabase() {
  const sb = getSupabase();
  if (!sb) {
    updateCloudStatusBadge(false, "No Client");
    return false;
  }

  try {
    updateCloudStatusBadge(true);

    // 1. Hero Slides
    const { data: slides, error: e1 } = await sb.from('hero_slides').select('*').order('slide_idx');
    if (!e1 && slides && slides.length > 0) {
      window.heroSlides = slides.map(s => ({
        bg: s.bg,
        eyebrow: s.eyebrow,
        title: s.title,
        tagline: s.tagline,
        desc: s.desc_text,
        btnText: s.btn_text,
        btnLink: s.btn_link
      }));
      if (typeof renderHero === 'function') renderHero();
      if (typeof renderSettings === 'function') renderSettings();
    }

    // 2. Sub Hero
    const { data: subHeroRows, error: e2 } = await sb.from('sub_hero').select('*').limit(1);
    if (!e2 && subHeroRows && subHeroRows.length > 0) {
      const sh = subHeroRows[0];
      window.subHeroData = {
        bg: sh.bg,
        eyebrow: sh.eyebrow,
        title: sh.title,
        desc: sh.desc_text,
        btnLink: sh.btn_link
      };
      if (typeof renderSubHero === 'function') renderSubHero();
      if (typeof renderSettings === 'function') renderSettings();
    }

    // 3. Categories
    const { data: catRows, error: e3 } = await sb.from('categories').select('*').order('sort_order');
    if (!e3 && catRows && catRows.length > 0) {
      window.categories = catRows.map(c => ({
        key: c.key,
        name: c.name,
        thumb: c.thumb
      }));
      if (typeof renderCategories === 'function') renderCategories();
    }

    // 4. Products
    const { data: prodRows, error: e4 } = await sb.from('products').select('*').order('sort_order');
    if (!e4 && prodRows && prodRows.length > 0) {
      window.products = prodRows.map(p => {
        let imagesObj = null;
        let cleanSpecs = p.specs;
        if (Array.isArray(p.specs)) {
          const imgEntry = p.specs.find(s => s && s.__imagesMap);
          if (imgEntry && imgEntry.images) {
            imagesObj = imgEntry.images;
          }
          cleanSpecs = p.specs.filter(s => s && !s.__imagesMap);
        }
        if (!imagesObj && typeof DEFAULT_PRODUCT_IMAGES !== 'undefined' && DEFAULT_PRODUCT_IMAGES[p.prod_id]) {
          imagesObj = DEFAULT_PRODUCT_IMAGES[p.prod_id];
        }
        return {
          id: p.prod_id,
          name: p.name,
          cat: p.cat,
          catName: p.cat_name,
          img: p.img,
          desc: p.desc_text,
          colors: p.colors || ['black'],
          specs: cleanSpecs || [],
          images: imagesObj || { black: [p.img || 'assets/images/homepage/im_official_emblem.png'] }
        };
      });
      if (typeof renderProducts === 'function') renderProducts();
    }

    // 5. Software Downloads
    const { data: softRows, error: e5 } = await sb.from('software').select('*').order('sort_order');
    if (!e5 && Array.isArray(softRows)) {
      window.softwareList = softRows.filter(s => s.is_active !== false).map(s => ({
        id: s.soft_id,
        title: s.title,
        size: s.size,
        fileName: s.file_name,
        url: s.file_url,
        content: ""
      }));
      if (typeof softwareList !== 'undefined') {
        softwareList = window.softwareList;
      }
      try {
        localStorage.setItem("im_wm_software", JSON.stringify(window.softwareList));
      } catch (e) {}
      if (typeof renderSoftware === 'function') renderSoftware();
    }

    // Cache locally as secondary backup
    try {
      if (window.heroSlides) localStorage.setItem("im_wm_hero_banners_data", JSON.stringify(window.heroSlides));
      if (window.subHeroData) localStorage.setItem("im_wm_sub_hero_data", JSON.stringify(window.subHeroData));
      if (window.categories) localStorage.setItem("im_wm_categories", JSON.stringify(window.categories));
      if (window.products) localStorage.setItem("im_wm_products", JSON.stringify(window.products));
      if (window.softwareList) localStorage.setItem("im_wm_software", JSON.stringify(window.softwareList));
    } catch (e) {}

    // Initialize real-time listeners across all open admin panels
    initAdminRealtimeSync();

    updateCloudStatusBadge(true);
    return true;
  } catch (err) {
    console.warn("Supabase fetch note:", err);
    updateCloudStatusBadge(false, "Offline");
    return false;
  }
}

// ============================================================================
// SUPABASE OPERATIONS: SAVE / DELETE HELPERS
// ============================================================================

async function dbSaveHeroSlide(idx, slideData) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('hero_slides').upsert({
      slide_idx: idx + 1,
      bg: slideData.bg,
      eyebrow: slideData.eyebrow,
      title: slideData.title,
      tagline: slideData.tagline,
      desc_text: slideData.desc,
      btn_text: slideData.btnText,
      btn_link: slideData.btnLink,
      updated_at: new Date().toISOString()
    }, { onConflict: 'slide_idx' });
    showToast("✓ Hero slide synced to cloud!");
  } catch (err) {
    console.error("dbSaveHeroSlide error:", err);
  }
}

async function dbSyncAllHeroSlides(slides) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    // Delete any slides whose slide_idx is beyond current length
    await sb.from('hero_slides').delete().gt('slide_idx', slides.length);

    // Upsert all current slides in order
    const rows = slides.map((s, idx) => ({
      slide_idx: idx + 1,
      bg: s.bg,
      eyebrow: s.eyebrow,
      title: s.title,
      tagline: s.tagline,
      desc_text: s.desc,
      btn_text: s.btnText,
      btn_link: s.btnLink,
      updated_at: new Date().toISOString()
    }));
    await sb.from('hero_slides').upsert(rows, { onConflict: 'slide_idx' });
    showToast("✓ Hero slides synced to cloud!");
  } catch (err) {
    console.error("dbSyncAllHeroSlides error:", err);
  }
}

async function dbDeleteHeroSlide(idx) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('hero_slides').delete().eq('slide_idx', idx + 1);
  } catch (err) {
    console.error("dbDeleteHeroSlide error:", err);
  }
}

async function dbSaveSubHero(subData) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('sub_hero').upsert({
      id: 1,
      bg: subData.bg,
      eyebrow: subData.eyebrow,
      title: subData.title,
      desc_text: subData.desc,
      btn_link: subData.btnLink,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    showToast("✓ Sub-hero synced to cloud!");
  } catch (err) {
    console.error("dbSaveSubHero error:", err);
  }
}

async function dbSaveProduct(prod) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    // Embed __imagesMap inside specs JSONB array
    const userSpecs = Array.isArray(prod.specs) ? prod.specs.filter(s => s && !s.__imagesMap) : [];
    const finalSpecs = [...userSpecs];
    if (prod.images && typeof prod.images === 'object') {
      finalSpecs.push({ __imagesMap: true, images: prod.images });
    }

    await sb.from('products').upsert({
      prod_id: prod.id,
      name: prod.name,
      cat: prod.cat,
      cat_name: prod.catName,
      img: prod.img,
      desc_text: prod.desc,
      colors: prod.colors || ['black'],
      specs: finalSpecs,
      is_active: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'prod_id' });
    showToast("✓ Product synced to cloud!");
  } catch (err) {
    console.error("dbSaveProduct error:", err);
  }
}

async function dbDeleteProduct(prodId) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('products').delete().eq('prod_id', prodId);
    showToast("✓ Product removed from cloud!");
  } catch (err) {
    console.error("dbDeleteProduct error:", err);
  }
}

async function dbSaveCategory(cat, sortOrder = 0) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('categories').upsert({
      key: cat.key,
      name: cat.name,
      thumb: cat.thumb || '',
      sort_order: sortOrder,
      is_active: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });
    showToast("✓ Category synced to cloud!");
  } catch (err) {
    console.error("dbSaveCategory error:", err);
  }
}

async function dbDeleteCategory(catKey) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('categories').delete().eq('key', catKey);
    showToast("✓ Category removed from cloud!");
  } catch (err) {
    console.error("dbDeleteCategory error:", err);
  }
}

async function dbSaveSoftware(soft) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('software').upsert({
      soft_id: soft.id,
      title: soft.title,
      size: soft.size,
      file_name: soft.fileName,
      file_url: soft.url || '',
      is_active: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'soft_id' });
    showToast("✓ Software synced to cloud!");
  } catch (err) {
    console.error("dbSaveSoftware error:", err);
  }
}

async function dbDeleteSoftware(softId) {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from('software').delete().eq('soft_id', softId);
    if (error) {
      console.error("dbDeleteSoftware error:", error);
      showToast("⚠ Could not delete from cloud: " + error.message);
      return false;
    }
    // Re-query software to guarantee memory & localStorage match cloud perfectly
    const { data: refreshedRows } = await sb.from('software').select('*').order('sort_order');
    if (Array.isArray(refreshedRows)) {
      window.softwareList = refreshedRows.filter(s => s.is_active !== false).map(s => ({
        id: s.soft_id,
        title: s.title,
        size: s.size,
        fileName: s.file_name,
        url: s.file_url,
        content: ""
      }));
      if (typeof softwareList !== 'undefined') softwareList = window.softwareList;
      try { localStorage.setItem("im_wm_software", JSON.stringify(window.softwareList)); } catch(e){}
      if (typeof renderSoftware === 'function') renderSoftware();
    }
    showToast("✓ Software removed from cloud & website!");
    return true;
  } catch (err) {
    console.error("dbDeleteSoftware error:", err);
    return false;
  }
}

// Real-Time Multi-Admin Synchronization
let _adminRealtimeSubscribed = false;
function initAdminRealtimeSync() {
  if (_adminRealtimeSubscribed) return;
  const sb = getSupabase();
  if (!sb) return;

  try {
    _adminRealtimeSubscribed = true;
    sb.channel('im-admin-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'software' }, async (payload) => {
        console.log('[Realtime Admin] Software changed in cloud:', payload);
        const { data: softRows } = await sb.from('software').select('*').order('sort_order');
        if (Array.isArray(softRows)) {
          window.softwareList = softRows.filter(s => s.is_active !== false).map(s => ({
            id: s.soft_id,
            title: s.title,
            size: s.size,
            fileName: s.file_name,
            url: s.file_url,
            content: ""
          }));
          if (typeof softwareList !== 'undefined') softwareList = window.softwareList;
          try { localStorage.setItem("im_wm_software", JSON.stringify(window.softwareList)); } catch(e){}
          if (typeof renderSoftware === 'function') renderSoftware();
          if (typeof showToast === 'function') showToast("⚡ Cloud updated: Software list synchronized live!");
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
        const { data: prodRows } = await sb.from('products').select('*').order('sort_order');
        if (Array.isArray(prodRows)) {
          window.products = prodRows.map(p => {
            let imagesObj = null;
            let cleanSpecs = p.specs;
            if (Array.isArray(p.specs)) {
              const imgEntry = p.specs.find(s => s && s.__imagesMap);
              if (imgEntry && imgEntry.images) imagesObj = imgEntry.images;
              cleanSpecs = p.specs.filter(s => s && !s.__imagesMap);
            }
            if (!imagesObj && typeof DEFAULT_PRODUCT_IMAGES !== 'undefined' && DEFAULT_PRODUCT_IMAGES[p.prod_id]) {
              imagesObj = DEFAULT_PRODUCT_IMAGES[p.prod_id];
            }
            return {
              id: p.prod_id,
              name: p.name,
              cat: p.cat,
              catName: p.cat_name,
              img: p.img,
              desc: p.desc_text,
              colors: p.colors || ['black'],
              specs: cleanSpecs || [],
              images: imagesObj || { black: [p.img || 'assets/images/homepage/im_official_emblem.png'] }
            };
          });
          if (typeof products !== 'undefined') products = window.products;
          try { localStorage.setItem("im_wm_products", JSON.stringify(window.products)); } catch(e){}
          if (typeof renderProducts === 'function') renderProducts();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
        const { data: catRows } = await sb.from('categories').select('*').order('sort_order');
        if (Array.isArray(catRows)) {
          window.categories = catRows.map(c => ({ key: c.key, name: c.name, thumb: c.thumb }));
          if (typeof categories !== 'undefined') categories = window.categories;
          try { localStorage.setItem("im_wm_categories", JSON.stringify(window.categories)); } catch(e){}
          if (typeof renderCategories === 'function') renderCategories();
        }
      })
      .subscribe();
  } catch (err) {
    console.warn("Realtime sync initialization:", err);
  }
}

