import { supabase } from './db.js';

document.addEventListener('DOMContentLoaded', () => {
  loadLiveHeroSlides();
  loadLiveProducts();
});

// 1. FETCH & RENDER LIVE HERO SLIDES FROM SUPABASE
async function loadLiveHeroSlides() {
  try {
    const { data: slides, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error || !slides || slides.length === 0) {
      console.log('No database hero slides found, displaying default static slides.');
      return; 
    }

    const swiperWrapper = document.querySelector('.hero-swiper .swiper-wrapper');
    if (!swiperWrapper) return;

    // Inject uploaded database hero slides
    swiperWrapper.innerHTML = slides.map((slide, index) => {
      const mediaHtml = slide.media_type === 'video'
        ? `<video class="slide-video" autoplay muted loop playsinline poster="images/product-01.jpg">
             <source src="${slide.media_url}" type="video/mp4">
           </video>`
        : `<div class="slide-bg" style="background-image: url('${slide.media_url}');"></div>`;

      return `
        <div class="swiper-slide hero-slide">
          ${mediaHtml}
          <div class="slide-overlay"></div>
          <div class="hero-text-lux">
            <span class="overline">Wuse Market, Abuja — Featured</span>
            <h1>${slide.title}</h1>
            <p class="subtitle">${slide.subtitle}</p>
            <div class="cta-group">
              <a href="${slide.button_link || 'retail.html'}" class="btn-luxury btn-primary-lux">${slide.button_text || 'Shop Collection'}</a>
              <a href="wholesale.html" class="btn-luxury btn-ghost-lux">Wholesale Enquiry</a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Refresh Swiper Carousel
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

// 2. FETCH & RENDER LIVE PRODUCTS FROM SUPABASE
async function loadLiveProducts() {
  try {
    const featuredGrid = document.getElementById('featuredGrid');
    if (!featuredGrid) return;

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !products || products.length === 0) {
      console.log('No database products found, displaying static defaults.');
      return; 
    }

    featuredGrid.innerHTML = products.map(prod => `
      <article class="product-card" data-id="${prod.id}">
        <div class="product-img">
          <img src="${prod.image_url}" alt="${prod.title}">
        </div>
        <div class="product-body">
          <span class="product-cat">${prod.category}</span>
          <h3>${prod.title}</h3>
          <p class="price">₦${Number(prod.price).toLocaleString()}</p>
          <button class="add-cart-btn" type="button" onclick="window.addToCart('${prod.id}', '${prod.title}', ${prod.price}, '${prod.image_url}')">Add to Cart</button>
        </div>
      </article>
    `).join('');

  } catch (err) {
    console.error('Error loading live products:', err);
  }
}

// CART ADD HELPER FUNCTION
window.addToCart = (id, title, price, image) => {
  const cartCountEl = document.getElementById('cartCount');
  if (cartCountEl) {
    let current = Number(cartCountEl.textContent || 0);
    cartCountEl.textContent = current + 1;
  }
  alert(`Added "${title}" (₦${Number(price).toLocaleString()}) to cart!`);
};
