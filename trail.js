// ============================================================
// BETAH KIDS - VISITOR TRAIL (trail.js)
// Remembers the path a visitor took (saved in this browser tab only)
// and draws it as small tappable steps: Home > Toys > Teddy Bear
// ============================================================
(function () {
  var KEY = 'bk_trail';
  var MAX = 6;
  var HOME = { l: 'Home', u: 'index.html' };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // "toys.html?x=1" and "toys?x=1" count as the same page
  function norm(u) {
    return String(u || '').replace(/^\.?\//, '').replace(/\.html(?=$|\?)/, '');
  }

  function load() {
    try {
      var a = JSON.parse(sessionStorage.getItem(KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }

  function save(a) {
    try { sessionStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {}
  }

  function cameFromSite() {
    try {
      return !!document.referrer && new URL(document.referrer).origin === location.origin;
    } catch (e) { return false; }
  }

  function reset() { save([HOME]); }

  // label = what this page is called, url = how to get back to it
  // opts.level1   = this page starts a fresh trail (category pages, search)
  // opts.fallback = steps to show when the visitor arrived by a direct link
  function visit(label, url, opts) {
    opts = opts || {};
    var a = load();
    if (a.length === 0 || !cameFromSite()) {
      a = [HOME].concat(opts.fallback || []);
    } else if (opts.level1) {
      a = [HOME];
    }
    var key = norm(url);
    for (var k = 0; k < a.length; k++) {
      if (norm(a[k].u) === key) { a = a.slice(0, k); break; }
    }
    a.push({ l: label, u: url });
    while (a.length > MAX) a.splice(1, 1);
    save(a);
  }

  function render(el) {
    if (!el) return;
    var a = load();
    if (!a.length) return;
    var h = '';
    for (var i = 0; i < a.length; i++) {
      if (i > 0) h += '<span class="bk-sep" aria-hidden="true">&rsaquo;</span>';
      if (i < a.length - 1) {
        h += '<a href="' + esc(a[i].u) + '">' + esc(a[i].l) + '</a>';
      } else {
        h += '<span class="bk-cur" aria-current="page">' + esc(a[i].l) + '</span>';
      }
    }
    el.classList.add('bk-trail');
    el.innerHTML = h;
    el.scrollLeft = el.scrollWidth;
  }

  // The homepage always starts a fresh trail
  if (/^\/?(index(\.html)?)?$/.test(location.pathname)) reset();

  // Look: injected here so no other file needs CSS changes
  var S = 'html body .bk-trail.bk-trail.bk-trail';
  var css =
    S + '{display:flex;flex-wrap:nowrap;align-items:center;gap:2px;overflow-x:auto;overflow-y:hidden;white-space:nowrap;scrollbar-width:none;-webkit-overflow-scrolling:touch;width:auto;max-width:100%;margin:0 0 14px;padding:2px 0;background:none;border:0;box-shadow:none;font-size:.78rem;line-height:1.4;color:#555555;}' +
    S + '::-webkit-scrollbar{display:none;}' +
    S + ' a{flex:0 0 auto;display:inline-block;max-width:42vw;overflow:hidden;text-overflow:ellipsis;margin:0;padding:6px 11px;border-radius:999px;background:rgba(255,122,26,.10);color:#E56510;font-weight:600;text-decoration:none;transition:background .2s ease,color .2s ease;}' +
    S + ' a:hover{background:#FF6A00;color:#FFFFFF;text-decoration:none;}' +
    S + ' .bk-sep{flex:0 0 auto;color:#BBBBBB;font-size:1rem;margin:0 1px;}' +
    S + ' .bk-cur{flex:0 0 auto;max-width:60vw;overflow:hidden;text-overflow:ellipsis;padding:6px 4px;color:#2A2A2A;font-weight:600;}' +
    '@media (min-width:900px){' + S + '{font-size:.85rem;margin-bottom:18px;}' + S + ' a,' + S + ' .bk-cur{max-width:320px;}}';
  var st = document.createElement('style');
  st.setAttribute('data-bk-trail', '1');
  st.textContent = css;
  document.head.appendChild(st);

  window.bkTrail = { visit: visit, render: render, reset: reset };
})();