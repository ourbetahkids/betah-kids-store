import { supabase } from './db.js';

// ============================================================
// BETAH KIDS — LIVE STOREFRONT DATA ENGINE (index.html)
// Handles:
// 1. Live hero slider override (Supabase hero_slides table)
// 2. Live "Shop by Category" tile counts
// 3. Live Featured Products section (is_featured = true)
// 4. Live Trending / New Arrivals section (is_trending = true)
// NOTE: window.addToCart lives in cart.js only (single source of truth).
// ============================================================

const CATEGORIES = [
  { name: 'Accessories', link: 'accessories.html', icon: 'fa-bag-shopping' },
  { name: 'Baby Essentials', link: 'baby-essentials.html', icon: 'fa-baby-carriage' },
  { name: 'Clothing', link: 'clothing.html', icon: 'fa-shirt' },
  { name: 'Maternity', link: 'maternity.html', icon: 'fa-person-pregnant' },
  { name: 'School', link: 'school.html', icon: 'fa-graduation-cap' },
  { name: 'Shoes', link: 'shoes.html', icon: 'fa-shoe-prints' },
  { name: 'Toys', link: 'toys.html', icon: 'fa-shapes' }
];

document.addEventListener('DOMContentLoaded', () => {
  loadLiveHeroSlides().finally(function () { var h = document.querySelector('.hero-slider-section'); if (!h) return; if (h.querySelector('.hero-swiper .swiper-slide')) { h.classList.add('hero-ready'); } else { h.classList.add('hero-empty'); } });
  loadCategoryTiles();
  loadFeaturedProducts().then(bkFeaturedArrows).catch(function () {});
  loadTrendingProducts().then(bkViewMoreInit).catch(function () {});
});

// ---------- HERO SLIDE LINKS ----------
// Only product pages and the 7 category pages are valid hero destinations.
// Anything else (empty, or legacy values like retail.html) = no button, no click.
const HERO_LINK_PATTERN = /^(product\.html\?id=[0-9a-zA-Z-]+|(accessories|baby-essentials|clothing|maternity|school|shoes|toys)\.html(\?[^\s"'<>]*)?)$/;

function getSafeHeroLink(slide) {
  const link = String(slide.button_link || '').trim();
  return HERO_LINK_PATTERN.test(link) ? link : '';
}

function heroSlideLinkHtml(slide) {
  const link = getSafeHeroLink(slide);
  if (!link) return '';
  return '<a class="slide-click" href="' + link + '" aria-hidden="true" tabindex="-1"></a>';
}

function heroButtonHtml(slide) {
  const link = getSafeHeroLink(slide);
  if (!link) return '';
  return '<a href="' + link + '" class="btn-luxury btn-primary-lux">' + (slide.button_text || 'Shop Collection') + '</a>';
}
// ---------- 1. LIVE HERO SLIDES ----------
async function loadLiveHeroSlides() {
  try {
    const { data: slides, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error || !slides || slides.length === 0) {
      console.log('No database hero slides found - displaying default static slides.');
      return;
    }

    const swiperWrapper = document.querySelector('.hero-swiper .swiper-wrapper');
    if (!swiperWrapper) return;

    // A slide with no title and no subtitle is a finished banner: picture only.
    const isBannerSlide = (s) => !String(s.title || '').trim() && !String(s.subtitle || '').trim();
    const allBanners = slides.every(s => isBannerSlide(s) && s.media_type !== 'video');

    swiperWrapper.innerHTML = slides.map(slide => {
      if (isBannerSlide(slide)) {
        const bannerMedia = slide.media_type === 'video'
          ? `<video class="banner-media" autoplay muted loop playsinline>
               <source src="${slide.media_url}" type="video/mp4">
             </video>`
          : `${slide.mobile_media_url ? '<picture><source media="(max-width: 560px)" srcset="' + slide.mobile_media_url + '"><img class="banner-media" src="' + slide.media_url + '" alt="Betah Kids banner"></picture>' : '<img class="banner-media" src="' + slide.media_url + '" alt="Betah Kids banner">'}`;
        return `
        <div class="swiper-slide hero-slide hero-banner">
          ${bannerMedia}
          ${heroSlideLinkHtml(slide)}
        </div>
      `;
      }

      const mediaHtml = slide.media_type === 'video'
        ? `<video class="slide-video" autoplay muted loop playsinline poster="images/product-01.jpg">
             <source src="${slide.media_url}" type="video/mp4">
           </video>`
        : `<div class="slide-bg" style="background-image: url('${slide.media_url}');"></div>`;

      return `
        <div class="swiper-slide hero-slide">
          ${mediaHtml}
          <div class="slide-overlay"></div>
          ${heroSlideLinkHtml(slide)}
          <div class="hero-text-lux">
            <span class="overline">Wuse Market, Abuja &mdash; Featured</span>
            <h1>${slide.title}</h1>
            <p class="subtitle">${slide.subtitle}</p>
            <div class="cta-group">
              ${heroButtonHtml(slide)}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const heroSection = document.querySelector('.hero-slider-section');
    if (heroSection) heroSection.classList.toggle('hero-all-banners', allBanners);
    if (heroSection) heroSection.classList.toggle('hero-banners-mobile', allBanners && slides.every(s => !!s.mobile_media_url));

    if (window.heroSwiper && typeof window.heroSwiper.destroy === 'function') {
      window.heroSwiper.destroy(true, true);
    }

    window.heroSwiper = new Swiper('.hero-swiper', {
      loop: true,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 1200,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
    });

  } catch (err) {
    console.error('Error loading live hero slides:', err);
  }
}

// ---------- 2. SHOP BY CATEGORY TILES (live counts) ----------
// Category cards: round picture from images/categories/<name>.png (or jpg / jpeg / webp).
// If no picture exists yet, the card shows the category icon instead.
window.bkCatImgFail = function (img) {
  const exts = ['png', 'jpg', 'jpeg', 'webp'];
  const i = exts.indexOf(img.dataset.ext);
  if (i < exts.length - 1) {
    img.dataset.ext = exts[i + 1];
    img.src = 'images/categories/' + img.dataset.slug + '.' + exts[i + 1];
    return;
  }
  img.outerHTML = '<span class="category-tile-fallback"><i class="fa-solid ' + img.dataset.icon + '"></i></span>';
};

async function loadCategoryTiles() {
  const container = document.getElementById('categoryTilesGrid');
  if (!container) return;

  // Pictures uploaded in admin (table category_images). If it cannot be read, use the folder files.
  const uploaded = {};
  try {
    const { data, error } = await supabase.from('category_images').select('category, image_url');
    if (error) throw error;
    (data || []).forEach(r => { uploaded[r.category] = r.image_url; });
  } catch (err) {
    console.error('Category pictures not loaded:', err);
  }

  container.innerHTML = CATEGORIES.map(cat => {
    const slug = String(cat.link).replace(/\?.*$/, '').replace(/^.*\//, '').replace(/\.html$/, '');
    const upUrl = uploaded[cat.name];
    const src = upUrl ? upUrl : 'images/categories/' + slug + '.png';
    const ext = upUrl ? '' : 'png';
    return `
      <a href="${cat.link}" class="category-tile">
        <img class="category-tile-pic" src="${src}" alt="${cat.name}" loading="lazy" data-slug="${slug}" data-ext="${ext}" data-icon="${cat.icon}" onerror="bkCatImgFail(this)">
        <span class="category-tile-name">${cat.name}</span>
      </a>`;
  }).join('');
}
// ---------- 3. FEATURED PRODUCTS (is_featured = true) ----------
async function loadFeaturedProducts() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!products || products.length === 0) {
      grid.innerHTML = `
        <div class="empty-state-msg">
          <i class="fa-solid fa-star"></i>
          <p>No featured products yet - check back soon!</p>
        </div>`;
      return;
    }

    grid.innerHTML = products.map(prod => renderProductCard(prod)).join('');

  } catch (err) {
    console.error('Error loading featured products:', err);
    grid.innerHTML = `<div class="empty-state-msg"><p>Unable to load products right now.</p></div>`;
  }
}

// ---------- 4. TRENDING / NEW ARRIVALS (is_trending = true) ----------
async function loadTrendingProducts() {
  const grid = document.getElementById('trendingGrid');
  if (!grid) return;

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_trending', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!products || products.length === 0) {
      grid.innerHTML = `
        <div class="empty-state-msg">
          <i class="fa-solid fa-fire"></i>
          <p>New arrivals coming soon - stay tuned!</p>
        </div>`;
      return;
    }

    grid.innerHTML = products.map(prod => renderProductCard(prod)).join('');

  } catch (err) {
    console.error('Error loading trending products:', err);
    grid.innerHTML = `<div class="empty-state-msg"><p>Unable to load products right now.</p></div>`;
  }
}

// ---------- SHARED PRODUCT CARD RENDERER ----------
function renderProductCard(prod) {
  const inStock = prod.in_stock && prod.stock_quantity > 0;
  const stockBadge = inStock ? '' : `<span class="sold-out-badge">Sold Out</span>`;
  const safeTitle = prod.title.replace(/'/g, "\\'");

  return `
    <article class="product-card" data-id="${prod.id}">
      <a href="product.html?id=${prod.id}" class="product-img-link">
        <div class="product-img">
          <img src="${prod.image_url}" alt="${prod.title}" loading="lazy">
          ${stockBadge}
        </div>
      </a>
      <div class="product-body">
        <span class="product-cat">${prod.category}</span>
        <h3><a href="product.html?id=${prod.id}">${prod.title}</a></h3>
        <p class="price">&#8358;${Number(prod.price).toLocaleString()}</p>
        <button class="add-cart-btn" type="button" ${inStock ? '' : 'disabled'}
          onclick="window.addToCart('${prod.id}', '${safeTitle}', ${prod.price}, '${prod.image_url}')">
          ${inStock ? 'Add to Cart' : 'Sold Out'}
        </button>
      </div>
    </article>
  `;
}

// HOME VIEW MORE (New Arrivals)
function bkViewMoreInit() {
  var grid = document.getElementById('trendingGrid');
  if (!grid || document.getElementById('bkMoreWrap')) return;
  var shown = grid.querySelectorAll('.product-card').length;
  var PAGE = 10;
  if (shown < PAGE) return;
  var wrap = document.createElement('div');
  wrap.className = 'bk-more-wrap';
  wrap.id = 'bkMoreWrap';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'bk-more-btn';
  btn.textContent = 'View More';
  wrap.appendChild(btn);
  grid.insertAdjacentElement('afterend', wrap);
  var busy = false;
  btn.addEventListener('click', async function () {
    if (busy) return;
    busy = true;
    btn.textContent = 'Loading...';
    try {
      var res = await supabase.from('products').select('*').eq('is_trending', true).order('created_at', { ascending: false }).range(shown, shown + PAGE - 1);
      if (res.error) throw res.error;
      var rows = res.data || [];
      if (rows.length) {
        grid.insertAdjacentHTML('beforeend', rows.map(function (p) { return renderProductCard(p); }).join(''));
        shown += rows.length;
      }
      if (rows.length < PAGE) { wrap.remove(); } else { btn.textContent = 'View More'; }
    } catch (e) {
      console.error('View More failed:', e);
      btn.textContent = 'View More';
    }
    busy = false;
  });
}

// HOME FEATURED ARROWS
function bkFeaturedArrows() {
  var grid = document.getElementById('featuredGrid');
  if (!grid || document.getElementById('bkFeatWrap')) return;
  var wrap = document.createElement('div');
  wrap.className = 'bk-row-wrap';
  wrap.id = 'bkFeatWrap';
  grid.parentNode.insertBefore(wrap, grid);
  wrap.appendChild(grid);
  var prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'bk-arrow bk-prev';
  prev.setAttribute('aria-label', 'Previous products');
  prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  var next = document.createElement('button');
  next.type = 'button';
  next.className = 'bk-arrow bk-next';
  next.setAttribute('aria-label', 'Next products');
  next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  wrap.appendChild(prev);
  wrap.appendChild(next);
  function step() {
    var gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
    return grid.clientWidth + gap;
  }
  function update() {
    var max = grid.scrollWidth - grid.clientWidth;
    prev.classList.toggle('bk-hide', grid.scrollLeft <= 4);
    next.classList.toggle('bk-hide', max <= 4 || grid.scrollLeft >= max - 4);
  }
  prev.addEventListener('click', function () { grid.scrollBy({ left: -step(), behavior: 'smooth' }); });
  next.addEventListener('click', function () { grid.scrollBy({ left: step(), behavior: 'smooth' }); });
  grid.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
  setTimeout(update, 600);
}
