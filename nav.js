import { supabase } from './db.js';

// ============================================================
// BETAH KIDS — SHARED NAVIGATION / MOBILE MENU / SEARCH SCRIPT
// Used on every public page. Handles:
// 1. Mobile hamburger menu open/close
// 2. Mobile category accordions (7 independent, tap to expand)
// 3. Live product search (debounced, queries Supabase as user types)
// 4. Search form submit (redirects to search-results.html?q=...)
// 5. Click-outside-to-close behavior
//
// TIMING: On pages that load the header from header-partial.inc,
// everything below waits for the "partialsLoaded" event (fired by
// partials.js). On pages that still have the header written directly
// in the HTML, it runs as soon as the page is ready.
// ============================================================

let navInitialized = false;

function initNav() {
  if (navInitialized) return;
  navInitialized = true;

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const searchInput = document.getElementById('searchInput');
  const searchForm = document.getElementById('searchForm');
  const searchSuggestions = document.getElementById('searchSuggestions');

  // ---------- 1. HAMBURGER MENU TOGGLE ----------
  if (hamburgerBtn && mobileMenuOverlay) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileMenuOverlay.classList.toggle('open');
      hamburgerBtn.classList.toggle('active', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // close mobile menu automatically if window resized to desktop width
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 900 && mobileMenuOverlay && mobileMenuOverlay.classList.contains('open')) {
      mobileMenuOverlay.classList.remove('open');
      if (hamburgerBtn) hamburgerBtn.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // ---------- 2. MOBILE CATEGORY ACCORDIONS (7 independent) ----------
  const accordionToggles = document.querySelectorAll('.mobile-accordion-toggle');
  accordionToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const panel = toggle.nextElementSibling;
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';

      // close all other accordions first (single-open behavior)
      accordionToggles.forEach(otherToggle => {
        if (otherToggle !== toggle) {
          otherToggle.setAttribute('aria-expanded', 'false');
          otherToggle.classList.remove('active');
          const otherPanel = otherToggle.nextElementSibling;
          if (otherPanel) otherPanel.classList.remove('open');
        }
      });

      // toggle this one
      toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      toggle.classList.toggle('active', !isOpen);
      if (panel) panel.classList.toggle('open', !isOpen);
    });
  });

  // ---------- 3. LIVE SEARCH (debounced) ----------
  let searchDebounce = null;

  if (searchInput && searchSuggestions) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      clearTimeout(searchDebounce);

      if (query.length < 2) {
        searchSuggestions.innerHTML = '';
        searchSuggestions.classList.remove('active');
        return;
      }

      searchDebounce = setTimeout(async () => {
        const { data, error } = await supabase
          .from('products')
          .select('id, title, price, image_url, category')
          .ilike('title', `%${query}%`)
          .limit(6);

        if (error || !data || data.length === 0) {
          searchSuggestions.innerHTML = '<div class="search-no-results">No products found</div>';
          searchSuggestions.classList.add('active');
          return;
        }

        searchSuggestions.innerHTML = data.map(p => `
          <a href="product.html?id=${p.id}" class="search-suggestion-item">
            <img src="${p.image_url}" alt="${p.title}" class="search-suggestion-img">
            <div class="search-suggestion-info">
              <span class="search-suggestion-title">${p.title}</span>
              <span class="search-suggestion-category">${p.category}</span>
            </div>
            <span class="search-suggestion-price">\u20A6${Number(p.price).toLocaleString()}</span>
          </a>
        `).join('');
        searchSuggestions.classList.add('active');
      }, 300);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-bar-row')) {
        searchSuggestions.classList.remove('active');
      }
    });
  }

  // ---------- 4. SEARCH FORM SUBMIT (redirect to search-results.html) ----------
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput ? searchInput.value.trim() : '';
      if (!query) return;
      window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
    });
  }
}

// Migrated pages: wait for partials.js to finish injecting the header
document.addEventListener('partialsLoaded', initNav);

// Not-yet-migrated pages: header is already in the HTML, start right away
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('header-placeholder')) initNav();
});
