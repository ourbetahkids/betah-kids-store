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
  loadLiveHeroSlides();
  loadCategoryTiles();
  loadFeaturedProducts();
  loadTrendingProducts();
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

    swiperWrapper.innerHTML = slides.map(slide => {
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
async function loadCategoryTiles() {
  const container = document.getElementById('categoryTilesGrid');
  if (!container) return;

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('category');

    if (error) throw error;

    const counts = {};
    (products || []).forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    container.innerHTML = CATEGORIES.map(cat => `
      <a href="${cat.link}" class="category-tile">
        <i class="fa-solid ${cat.icon}"></i>
        <span class="category-tile-name">${cat.name}</span>
        <span class="category-tile-count">${counts[cat.name] || 0} Products</span>
      </a>
    `).join('');

  } catch (err) {
    console.error('Error loading category counts:', err);
    container.innerHTML = CATEGORIES.map(cat => `
      <a href="${cat.link}" class="category-tile">
        <i class="fa-solid ${cat.icon}"></i>
        <span class="category-tile-name">${cat.name}</span>
      </a>
    `).join('');
  }
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
      .limit(8);

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
      .limit(8);

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
