import { supabase } from './db.js';

// CATEGORY TO SUBCATEGORY MAPPING (7 locked categories)
const subcategoryMap = {
  'Accessories': ['Baby Accessories', 'Boys Accessories', 'Girls Accessories', 'Socks', 'Hats & Sunglasses', 'Headbands & Hair Clips', 'Bibs & Muslins', 'Rain Gear', 'Ballet Attire'],
  'Baby Essentials': ['Diapering & Bath', 'Feeding & Nursing', 'Bedding & Furniture', 'Travel, Health & Safety'],
  'Clothing': ['Baby Boy Clothing', 'Baby Girl Clothing', 'Boys Clothing', 'Girls Clothing', 'Boys Underwear', 'Girls Underwear'],
  'Maternity': ['Maternity Dresses', 'Maternity Trousers', 'Maternity Sleepwear'],
  'School': ['Uniforms', 'Bags & Backpacks', 'Lunch Boxes & Bottles', 'Stationery & Supplies', 'Books'],
  'Shoes': ['Baby Shoes', 'Boys Shoes', 'Girls Shoes', 'School Shoes'],
  'Toys': ['Babies & Preschoolers (0-2)', 'Toddlers (2+)', 'Kids (4+)', 'Big Kids (7+)', 'Playmats & Activity', 'Costumes & Dress-Up', 'Bicycles, Scooters & Ride-Ons', 'Outdoor & Garden Play', 'Swimming & Beach', 'Party & Balloons']
};

function populateSubcategorySelect(selectEl, category, selectedValue) {
  if (!selectEl) return;
  const subs = subcategoryMap[category] || [];

  if (subs.length === 0) {
    selectEl.innerHTML = '<option value="">N/A — No Subcategories</option>';
    selectEl.removeAttribute('required');
    return;
  }

  selectEl.setAttribute('required', 'required');
  selectEl.innerHTML = '<option value="">-- Select Subcategory --</option>' +
    subs.map(sub => `<option value="${sub}" ${sub === selectedValue ? 'selected' : ''}>${sub}</option>`).join('');
}

// DOM ELEMENTS
const loginOverlay = document.getElementById('loginOverlay');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const logoutBtn = document.getElementById('logoutBtn');
const navItems = document.querySelectorAll('.admin-nav-item');
const tabContents = document.querySelectorAll('.admin-tab-content');

// ADD PRODUCT: subcategory dropdown wiring
const prodCategorySelect = document.getElementById('prodCategory');
const prodSubcategorySelect = document.getElementById('prodSubcategory');
if (prodCategorySelect) {
  prodCategorySelect.addEventListener('change', () => {
    populateSubcategorySelect(prodSubcategorySelect, prodCategorySelect.value, '');
  });
}

// EDIT PRODUCT: subcategory dropdown wiring
const editProdCategorySelect = document.getElementById('editProdCategory');
const editProdSubcategorySelect = document.getElementById('editProdSubcategory');
if (editProdCategorySelect) {
  editProdCategorySelect.addEventListener('change', () => {
    populateSubcategorySelect(editProdSubcategorySelect, editProdCategorySelect.value, '');
  });
}

// INITIALIZATION ON PAGE LOAD
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session && session.user) {
    showDashboard(session.user.email);
    loadAllAdminData();
  }
});

// LISTEN FOR AUTH STATE CHANGES (handles session expiry automatically)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (adminDashboard) adminDashboard.style.display = 'none';
  }
});

// TAB SWITCHING LOGIC
navItems.forEach(button => {
  button.addEventListener('click', () => {
    const targetTabId = button.getAttribute('data-tab');

    navItems.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(tab => tab.classList.remove('active'));

    button.classList.add('active');
    const targetSection = document.getElementById(targetTabId);
    if (targetSection) targetSection.classList.add('active');
    if (targetTabId === 'tab-hero') loadHeroSlides();
  });
});

// LOGIN SUBMISSION LOGIC (Real Supabase Authentication)
adminLoginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value.trim();
  const loginBtn = document.getElementById('loginBtn');

  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  loginBtn.disabled = false;
  loginBtn.textContent = 'Login to Control Panel';

  if (error) {
    alert('Login Failed: ' + error.message);
    return;
  }

  if (data && data.user) {
    showDashboard(data.user.email);
    loadAllAdminData();
  }
});

// LOGOUT LOGIC (Real Supabase Sign Out)
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.reload();
});

function showDashboard(email) {
  if (loginOverlay) loginOverlay.style.display = 'none';
  if (adminDashboard) adminDashboard.style.display = 'flex';
  const emailDisplay = document.getElementById('currentUserEmail');
  if (emailDisplay) emailDisplay.textContent = email;
}

// MASTER DATA LOAD FUNCTION
function loadAllAdminData() {
  loadOverviewStats();
  loadHeroSlides();
  loadProducts();
  loadOrders();
}

// 1. OVERVIEW STATS
async function loadOverviewStats() {
  try {
    const { data: products } = await supabase.from('products').select('id');
    const { data: orders } = await supabase.from('orders').select('id, total_amount');

    const totalProdEl = document.getElementById('statTotalProducts');
    const totalOrdEl = document.getElementById('statTotalOrders');
    const totalRevEl = document.getElementById('statTotalRevenue');

    if (totalProdEl && products) totalProdEl.textContent = products.length;
    if (totalOrdEl && orders) totalOrdEl.textContent = orders.length;
    if (totalRevEl && orders) {
      const revenue = orders.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
      totalRevEl.textContent = `₦${revenue.toLocaleString()}`;
    }
  } catch (err) {
    console.error('Error loading overview stats:', err);
  }
}

// 2. HERO SLIDE UPLOAD LOGIC
const heroUploadForm = document.getElementById('heroUploadForm');
if (heroUploadForm) {
  heroUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const mediaType = document.getElementById('slideMediaType').value;
    const title = document.getElementById('slideTitle').value.trim();
    const subtitle = document.getElementById('slideSubtitle').value.trim();
    const buttonText = document.getElementById('slideButtonText').value.trim() || 'Shop Collection';
    const fileInput = document.getElementById('slideFile');
    const slideLink = document.getElementById('slideLink') ? document.getElementById('slideLink').value : '';
    const file = fileInput.files[0];

    if (!file) return alert('Please select an image or video file.');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero_${Date.now()}.${fileExt}`;

      const { data: storageData, error: storageErr } = await supabase.storage
        .from('hero-media')
        .upload(fileName, file);

      if (storageErr) throw storageErr;

      const { data: urlData } = supabase.storage
        .from('hero-media')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Optional phone version of a banner
      let mobileExtra = {};
      const mobileInput = document.getElementById('slideFileMobile');
      const mobileFile = mobileInput && mobileInput.files ? mobileInput.files[0] : null;
      if (mobileFile) {
        const mobileExt = mobileFile.name.split('.').pop();
        const mobileName = `hero_${Date.now()}_phone.${mobileExt}`;
        const { error: mobileErr } = await supabase.storage.from('hero-media').upload(mobileName, mobileFile);
        if (mobileErr) throw mobileErr;
        const { data: mobileUrlData } = supabase.storage.from('hero-media').getPublicUrl(mobileName);
        mobileExtra = { mobile_media_url: mobileUrlData.publicUrl };
      }

      const { error: dbErr } = await supabase.from('hero_slides').insert([
        {
          title,
          subtitle,
          media_url: publicUrl,
          media_type: mediaType,
          button_text: buttonText,
          button_link: slideLink, ...mobileExtra
        }
      ]);

      if (dbErr) throw dbErr;

      alert('New Hero Slide published successfully!');
      heroUploadForm.reset();
      loadHeroSlides();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  });
}

// FETCH & RENDER HERO SLIDES LIST (with link picker per slide)
const HERO_CATEGORY_LINKS = [
  ['Accessories', 'accessories.html'],
  ['Baby Essentials', 'baby-essentials.html'],
  ['Clothing', 'clothing.html'],
  ['Maternity', 'maternity.html'],
  ['School', 'school.html'],
  ['Shoes', 'shoes.html'],
  ['Toys', 'toys.html']
];

function adminEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildLinkOptions(products, selectedValue, noneLabel) {
  const sel = selectedValue || '';
  let html = '<option value="">' + adminEsc(noneLabel) + '</option>';
  html += '<optgroup label="Category pages">';
  HERO_CATEGORY_LINKS.forEach(function (c) {
    html += '<option value="' + c[1] + '"' + (c[1] === sel ? ' selected' : '') + '>' + adminEsc(c[0]) + ' (whole category)</option>';
  });
  html += '</optgroup>';
  if (products.length > 0) {
    html += '<optgroup label="Single products">';
    products.forEach(function (p) {
      const link = 'product.html?id=' + p.id;
      html += '<option value="' + link + '"' + (link === sel ? ' selected' : '') + '>' + adminEsc(p.title) + ' (' + adminEsc(p.category) + ')</option>';
    });
    html += '</optgroup>';
  }
  return html;
}

function describeLink(link, products) {
  if (!link) return 'No link (no button shown)';
  const cat = HERO_CATEGORY_LINKS.find(function (c) { return c[1] === link; });
  if (cat) return 'Opens: ' + cat[0] + ' page';
  const m = link.match(/^product\.html\?id=(.+)$/);
  if (m) {
    const prod = products.find(function (p) { return String(p.id) === m[1]; });
    return prod ? 'Opens product: ' + prod.title : 'Link points to a product that no longer exists';
  }
  return 'Old link (' + link + ') is not used. Pick a new link below.';
}

async function loadHeroSlides() {
  const container = document.getElementById('heroSlidesList');
  if (!container) return;

  const { data: prodData } = await supabase
    .from('products')
    .select('id, title, category')
    .order('title', { ascending: true });
  const products = prodData || [];

  const formLink = document.getElementById('slideLink');
  if (formLink) {
    const keep = formLink.value;
    formLink.innerHTML = buildLinkOptions(products, keep, '-- No link (slide shows no button) --');
  }

  const { data: slides, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !slides || slides.length === 0) {
    container.innerHTML = '<p class="empty-text">No active hero slides uploaded yet.</p>';
    return;
  }

  container.innerHTML = slides.map(slide => `
    <div style="background:#f9f9f9; padding:16px; border-radius:12px; margin-bottom:12px; display:flex; gap:16px; align-items:flex-start;">
      ${slide.media_type === 'video'
        ? `<video src="${slide.media_url}" style="width:100px; height:70px; object-fit:cover; border-radius:8px;" autoplay muted loop></video>`
        : `<img src="${slide.media_url}" style="width:100px; height:70px; object-fit:cover; border-radius:8px;" alt="${adminEsc(slide.title)}">`
      }
      <div style="flex:1;">
        <h4 style="margin-bottom:4px;">${slide.title} <span style="font-size:0.7rem; background:#FF7A1A; color:white; padding:2px 8px; border-radius:50px;">${slide.media_type}</span></h4>
        <p style="font-size:0.82rem; color:#666;">${slide.subtitle}</p>
        <p style="font-size:0.78rem; color:#2A6EBB; margin-top:6px;"><i class="fa-solid fa-link"></i> ${adminEsc(describeLink(slide.button_link, products))}</p>
        <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
          <select id="heroLink_${slide.id}" style="flex:1; min-width:200px; padding:8px; border-radius:6px; border:1px solid #ddd;">${buildLinkOptions(products, slide.button_link, '-- No link --')}</select>
          <button type="button" onclick="window.saveHeroLink('${slide.id}')" style="background:#2A6EBB; color:white; border:none; padding:8px 14px; border-radius:6px; cursor:pointer;">Save link</button>
        </div>
      </div>
      <button onclick="window.deleteHeroSlide('${slide.id}')" style="background:#ff4d4d; color:white; border:none; padding:8px 14px; border-radius:6px; cursor:pointer;">Delete</button>
    </div>
  `).join('');
}

// SAVE THE LINK OF AN EXISTING HERO SLIDE
window.saveHeroLink = async (id) => {
  const select = document.getElementById('heroLink_' + id);
  if (!select) return;
  const { data, error } = await supabase
    .from('hero_slides')
    .update({ button_link: select.value })
    .eq('id', id)
    .select();
  if (error) return alert('Could not save link: ' + error.message);
  if (!data || data.length === 0) {
    return alert('Link was NOT saved: the database refused the change (permission). Tell your assistant and it will give you the one-line fix.');
  }
  alert('Link saved. Refresh the homepage to see it.');
  loadHeroSlides();
};

// GLOBAL HERO DELETE FUNCTION
window.deleteHeroSlide = async (id) => {
  if (!confirm('Are you sure you want to delete this hero slide?')) return;
  const { error } = await supabase.from('hero_slides').delete().eq('id', id);
  if (error) alert('Error deleting: ' + error.message);
  else loadHeroSlides();
};

// 3. PRODUCT CATALOG ADDITION
const productAddForm = document.getElementById('productAddForm');
if (productAddForm) {
  productAddForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('prodTitle').value.trim();
    const price = Number(document.getElementById('prodPrice').value);
    const category = document.getElementById('prodCategory').value;
    const subcategory = document.getElementById('prodSubcategory').value;
    const stockQuantity = Number(document.getElementById('prodStock').value) || 0;
    const isFeatured = document.getElementById('prodFeatured').checked;
    const isTrending = document.getElementById('prodTrending').checked;
    const description = document.getElementById('prodDesc').value.trim();
    const fileInput = document.getElementById('prodImage');
    const files = Array.from(fileInput.files).slice(0, 5); const file = files[0];

    if (!file) return alert('Please select a product photo.');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `prod_${Date.now()}.${fileExt}`;

      const { error: storageErr } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (storageErr) throw storageErr;

      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl; const extraUrls = await window.bkUploadExtras(files.slice(1));

      const { error: dbErr } = await supabase.from('products').insert([
        {
          title,
          price,
          category,
          subcategory,
          description,
          image_url: imageUrl, gallery_images: extraUrls,
          stock_quantity: stockQuantity,
          in_stock: stockQuantity > 0,
          is_featured: isFeatured,
          is_trending: isTrending
        }
      ]);

      if (dbErr) throw dbErr;

      alert('Product successfully added to store!');
      productAddForm.reset();
      prodSubcategorySelect.innerHTML = '<option value="">-- Select Main Category First --</option>';
      loadProducts();
      loadOverviewStats();
    } catch (err) {
      alert('Error adding product: ' + err.message);
    }
  });
}

// FETCH & RENDER PRODUCTS TABLE
let cachedProducts = [];

async function loadProducts() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !products || products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">No products found in inventory. Add one above!</td></tr>';
    cachedProducts = [];
    return;
  }

  cachedProducts = products;

  tbody.innerHTML = products.map(p => {
    const qty = Number(p.stock_quantity ?? 0);
    const inStock = p.in_stock !== false && qty > 0;
    let statusBadge;
    if (!inStock) {
      statusBadge = '<span style="background:#fdeaea; color:#E62E3B; padding:4px 10px; border-radius:50px; font-weight:700; font-size:0.72rem;">Sold Out</span>';
    } else if (qty <= 3) {
      statusBadge = '<span style="background:#fff6e5; color:#E56510; padding:4px 10px; border-radius:50px; font-weight:700; font-size:0.72rem;">Low Stock</span>';
    } else {
      statusBadge = '<span style="background:#e8f8ee; color:#27AE60; padding:4px 10px; border-radius:50px; font-weight:700; font-size:0.72rem;">In Stock</span>';
    }

    return `
    <tr>
      <td><img src="${p.image_url}" class="table-img" alt="${p.title}"></td>
      <td><strong>${p.title}</strong>${p.is_featured ? ' <i class="fa-solid fa-star" style="color:#FFC107;" title="Featured"></i>' : ''}${p.is_trending ? ' <i class="fa-solid fa-fire" style="color:#E56510;" title="Trending"></i>' : ''}</td>
      <td><span class="brand-badge">${p.category}</span></td>
      <td>${p.subcategory || '-'}</td>
      <td>₦${Number(p.price).toLocaleString()}</td>
      <td>${qty}</td>
      <td>${statusBadge}</td>
      <td>
        <button onclick="window.editProduct('${p.id}')" style="color:#2A6EBB; cursor:pointer; background:none; border:none; font-size:1rem; margin-right:10px;">
          <i class="fa-solid fa-pen"></i> Edit
        </button>
        <button onclick="window.deleteProduct('${p.id}')" style="color:#ff4d4d; cursor:pointer; background:none; border:none; font-size:1rem;">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </td>
    </tr>
  `;
  }).join('');
}

// GLOBAL PRODUCT DELETE FUNCTION
window.deleteProduct = async (id) => {
  if (!confirm('Are you sure you want to delete this product?')) return;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) alert('Error deleting product: ' + error.message);
  else {
    loadProducts();
    loadOverviewStats();
  }
};

// 4. EDIT PRODUCT LOGIC
const editProductOverlay = document.getElementById('editProductOverlay');
const editProductForm = document.getElementById('editProductForm');
const closeEditModalBtn = document.getElementById('closeEditModalBtn');
let currentEditImageUrl = '';

window.editProduct = (id) => {
  const product = cachedProducts.find(p => p.id === id);
  if (!product) return alert('Product not found. Please refresh and try again.');

  document.getElementById('editProdId').value = product.id;
  document.getElementById('editProdTitle').value = product.title;
  document.getElementById('editProdPrice').value = product.price;
  document.getElementById('editProdCategory').value = product.category;
  populateSubcategorySelect(editProdSubcategorySelect, product.category, product.subcategory);
  document.getElementById('editProdStock').value = product.stock_quantity ?? 0;
  document.getElementById('editProdFeatured').checked = !!product.is_featured;
  document.getElementById('editProdTrending').checked = !!product.is_trending;
  document.getElementById('editProdDesc').value = product.description || '';
  currentEditImageUrl = product.image_url; window.bkEditOpen(product);

  if (editProductOverlay) editProductOverlay.style.display = 'flex';
};

if (closeEditModalBtn) {
  closeEditModalBtn.addEventListener('click', () => {
    if (editProductOverlay) editProductOverlay.style.display = 'none';
    if (editProductForm) editProductForm.reset();
  });
}

if (editProductOverlay) {
  editProductOverlay.addEventListener('click', (e) => {
    if (e.target === editProductOverlay) {
      editProductOverlay.style.display = 'none';
      if (editProductForm) editProductForm.reset();
    }
  });
}

if (editProductForm) {
  editProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editProdId').value;
    const title = document.getElementById('editProdTitle').value.trim();
    const price = Number(document.getElementById('editProdPrice').value);
    const category = document.getElementById('editProdCategory').value;
    const subcategory = document.getElementById('editProdSubcategory').value;
    const stockQuantity = Number(document.getElementById('editProdStock').value) || 0;
    const isFeatured = document.getElementById('editProdFeatured').checked;
    const isTrending = document.getElementById('editProdTrending').checked;
    const description = document.getElementById('editProdDesc').value.trim();
    const fileInput = document.getElementById('editProdImage');
    const newFile = null;

    const submitBtn = editProductForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      const bkList = await window.bkEditCollect(fileInput.files); let imageUrl = bkList[0]; let extraUrls = bkList.slice(1);

      if (newFile) {
        const fileExt = newFile.name.split('.').pop();
        const fileName = `prod_${Date.now()}.${fileExt}`;

        const { error: storageErr } = await supabase.storage
          .from('products')
          .upload(fileName, newFile);

        if (storageErr) throw storageErr;

        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      const { error: dbErr } = await supabase
        .from('products')
        .update({
          title,
          price,
          category,
          subcategory,
          description,
          image_url: imageUrl, gallery_images: extraUrls,
          stock_quantity: stockQuantity,
          in_stock: stockQuantity > 0,
          is_featured: isFeatured,
          is_trending: isTrending
        })
        .eq('id', id);

      if (dbErr) throw dbErr;

      alert('Product updated successfully!');
      editProductOverlay.style.display = 'none';
      editProductForm.reset();
      loadProducts();
      loadOverviewStats();
    } catch (err) {
      alert('Error updating product: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  });
}

// 5. ORDERS FETCHING LOGIC
async function loadOrders() {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No orders recorded yet.</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><code>${o.id.substring(0, 8)}</code></td>
      <td><strong>${o.customer_name}</strong><br><small>${o.customer_email}</small></td>
      <td>${o.phone}</td>
      <td>${o.address}, ${o.city}</td>
      <td>₦${Number(o.total_amount).toLocaleString()}</td>
      <td><span style="background:#e8f8ee; color:#27ae60; padding:4px 10px; border-radius:50px; font-weight:700; font-size:0.75rem;">${o.payment_status}</span></td>
    </tr>
  `).join('');
}

// ---------- UPLOAD SPINNER ----------
// Any admin form button shows a spinner and is locked until the page reports a result (alert).
(function () {
  var busyBtn = null, busyHtml = '', busyTimer = null;
  function release() {
    if (busyBtn) {
      busyBtn.disabled = false;
      busyBtn.innerHTML = busyHtml;
      busyBtn.style.opacity = '';
      busyBtn.style.cursor = '';
      busyBtn = null;
    }
    if (busyTimer) { clearTimeout(busyTimer); busyTimer = null; }
  }
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.querySelector || form.id === 'adminLoginForm') return;
    var btn = form.querySelector('button[type="submit"]');
    if (!btn || busyBtn) return;
    busyBtn = btn;
    busyHtml = btn.innerHTML;
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.style.cursor = 'wait';
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Working... please wait';
    busyTimer = setTimeout(release, 120000);
  }, true);
  var nativeAlert = window.alert.bind(window);
  window.alert = function (msg) { release(); return nativeAlert(msg); };
})();
// ---------- SHOP BY CATEGORY PICTURES ----------
const CATEGORY_PIC_BUCKET = 'category-images';

async function loadCategoryPictures() {
  const box = document.getElementById('categoryPicsList');
  if (!box) return;
  const names = Object.keys(subcategoryMap);
  const map = {};
  try {
    const { data, error } = await supabase.from('category_images').select('category, image_url');
    if (error) throw error;
    (data || []).forEach(r => { map[r.category] = r.image_url; });
  } catch (err) {
    console.error('Could not load category pictures:', err);
  }
  box.innerHTML = names.map(name => {
    const url = map[name];
    const thumb = url
      ? '<img src="' + adminEsc(url) + '" alt="' + adminEsc(name) + '" style="width:64px;height:64px;border-radius:50%;object-fit:cover;display:block;">'
      : '<span style="width:64px;height:64px;border-radius:50%;background:#FFF1E3;display:flex;align-items:center;justify-content:center;color:#999;font-size:0.65rem;text-align:center;">No picture</span>';
    return '<div class="cat-pic-row" data-cat="' + adminEsc(name) + '" style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #eee;">'
      + '<div style="flex:0 0 64px;">' + thumb + '</div>'
      + '<strong style="flex:1 1 120px;min-width:110px;">' + adminEsc(name) + '</strong>'
      + '<input type="file" accept="image/*" style="flex:1 1 180px;max-width:100%;">'
      + '<button type="button" class="admin-btn btn-primary" data-act="upload">Upload</button>'
      + (url ? '<button type="button" class="admin-btn" data-act="remove" style="background:#E62E3B;color:#fff;">Remove</button>' : '')
      + '<span class="cat-pic-msg" style="flex:1 1 100%;font-size:0.85rem;"></span>'
      + '</div>';
  }).join('');
}

async function handleCategoryPicClick(ev) {
  const btn = ev.target.closest('button[data-act]');
  if (!btn) return;
  const row = btn.closest('.cat-pic-row');
  const cat = row.getAttribute('data-cat');
  const msg = row.querySelector('.cat-pic-msg');
  const act = btn.getAttribute('data-act');
  const setMsg = (text, bad) => { msg.textContent = text; msg.style.color = bad ? '#E62E3B' : '#3BB84D'; };

  if (act === 'upload') {
    const input = row.querySelector('input[type=file]');
    const file = input.files[0];
    if (!file) return setMsg('Please choose a picture first.', true);
    if (!file.type.startsWith('image/')) return setMsg('That file is not a picture.', true);
    if (file.size > 3 * 1024 * 1024) return setMsg('Picture is too heavy. Keep it under 3 MB (best under 80 KB).', true);
    const oldHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
    try {
      const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const path = slug + '_' + Date.now() + '.' + ext;
      const up = await supabase.storage.from(CATEGORY_PIC_BUCKET).upload(path, file);
      if (up.error) throw up.error;
      const pub = supabase.storage.from(CATEGORY_PIC_BUCKET).getPublicUrl(path);
      const save = await supabase.from('category_images').upsert({ category: cat, image_url: pub.data.publicUrl, updated_at: new Date().toISOString() });
      if (save.error) throw save.error;
      await loadCategoryPictures();
      const again = document.querySelector('.cat-pic-row[data-cat="' + cat + '"] .cat-pic-msg');
      if (again) { again.textContent = 'Saved. The homepage now shows this picture.'; again.style.color = '#3BB84D'; }
      return;
    } catch (err) {
      console.error(err);
      setMsg('Upload failed: ' + (err.message || err), true);
    }
    btn.disabled = false;
    btn.innerHTML = oldHtml;
  }

  if (act === 'remove') {
    if (!confirm('Remove the ' + cat + ' picture? The homepage will show the icon instead.')) return;
    btn.disabled = true;
    try {
      const cur = await supabase.from('category_images').select('image_url').eq('category', cat).maybeSingle();
      const del = await supabase.from('category_images').delete().eq('category', cat);
      if (del.error) throw del.error;
      const u = cur.data && cur.data.image_url ? cur.data.image_url : '';
      const k = u.indexOf('/' + CATEGORY_PIC_BUCKET + '/');
      if (k >= 0) { await supabase.storage.from(CATEGORY_PIC_BUCKET).remove([decodeURIComponent(u.substring(k + CATEGORY_PIC_BUCKET.length + 2))]); }
      await loadCategoryPictures();
    } catch (err) {
      console.error(err);
      setMsg('Remove failed: ' + (err.message || err), true);
      btn.disabled = false;
    }
  }
}

(function () {
  const box = document.getElementById('categoryPicsList');
  if (box) box.addEventListener('click', handleCategoryPicClick);
  loadCategoryPictures();
})();
// ---------- CATEGORY PICTURES TAB: page heading ----------
(function () {
  const navBtn = document.querySelector('.admin-nav-item[data-tab="tab-categories"]');
  if (!navBtn) return;
  navBtn.addEventListener('click', function () {
    setTimeout(function () {
      const t = document.getElementById('pageTitle');
      if (t) t.innerHTML = 'Category <em>Pictures</em>';
    }, 0);
  });
})();
/* ===== PRODUCT GALLERY HELPERS ===== */
(function () {
  var MAX_PHOTOS = 5;
  var editUrls = [];

  function uploadOne(file, tag) {
    var ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    var name = 'prod_' + Date.now() + '_' + tag + '.' + ext;
    return supabase.storage.from('products').upload(name, file).then(function (res) {
      if (res.error) throw res.error;
      return supabase.storage.from('products').getPublicUrl(name).data.publicUrl;
    });
  }

  async function uploadMany(files, tag) {
    var urls = [];
    for (var i = 0; i < files.length; i++) {
      urls.push(await uploadOne(files[i], tag + i));
    }
    return urls;
  }

  window.bkUploadExtras = function (files) {
    return uploadMany(files || [], 'x');
  };

  window.bkEditCollect = async function (fileList) {
    var files = Array.from(fileList || []);
    if (editUrls.length + files.length > MAX_PHOTOS) {
      throw new Error('A product can have at most ' + MAX_PHOTOS + ' photos. Remove some first.');
    }
    var added = await uploadMany(files, 'e');
    var all = editUrls.concat(added);
    if (all.length === 0) throw new Error('A product needs at least one photo.');
    return all;
  };

  function renderEdit() {
    var box = document.getElementById('editProdGallery');
    if (!box) return;
    var html = '';
    editUrls.forEach(function (u, i) {
      html += '<div class="photo-thumb">' +
        '<img src="' + u + '" alt="Photo ' + (i + 1) + '">' +
        (i === 0
          ? '<span class="photo-main-tag">Main</span>'
          : '<button type="button" class="photo-btn" data-act="main" data-i="' + i + '">Make main</button>') +
        '<button type="button" class="photo-x" data-act="remove" data-i="' + i + '" aria-label="Remove photo">&times;</button>' +
        '</div>';
    });
    var input = document.getElementById('editProdImage');
    var n = (input && input.files) ? input.files.length : 0;
    if (n) html += '<p class="photo-note">' + n + ' new photo(s) will be added when you press Save.</p>';
    box.innerHTML = html;
  }

  window.bkEditOpen = function (product) {
    var extra = Array.isArray(product.gallery_images) ? product.gallery_images : [];
    editUrls = [product.image_url].concat(extra).filter(Boolean);
    var input = document.getElementById('editProdImage');
    if (input) input.value = '';
    renderEdit();
  };

  function init() {
    var box = document.getElementById('editProdGallery');
    if (box) {
      box.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-act]');
        if (!b) return;
        var i = Number(b.dataset.i);
        if (b.dataset.act === 'remove') {
          editUrls.splice(i, 1);
        } else if (b.dataset.act === 'main') {
          var u = editUrls.splice(i, 1)[0];
          editUrls.unshift(u);
        }
        renderEdit();
      });
    }

    var editInput = document.getElementById('editProdImage');
    if (editInput) {
      editInput.addEventListener('change', function () {
        if (editUrls.length + editInput.files.length > MAX_PHOTOS) {
          alert('A product can have at most ' + MAX_PHOTOS + ' photos. Remove some current photos first, or pick fewer new ones.');
          editInput.value = '';
        }
        renderEdit();
      });
    }

    var addInput = document.getElementById('prodImage');
    var addBox = document.getElementById('prodPreview');
    if (addInput && addBox) {
      addInput.addEventListener('change', function () {
        var files = Array.from(addInput.files);
        if (files.length > MAX_PHOTOS) alert('Only the first ' + MAX_PHOTOS + ' photos will be used.');
        addBox.innerHTML = '';
        files.slice(0, MAX_PHOTOS).forEach(function (f, i) {
          var d = document.createElement('div');
          d.className = 'photo-thumb';
          var im = document.createElement('img');
          im.src = URL.createObjectURL(f);
          im.alt = 'Preview ' + (i + 1);
          d.appendChild(im);
          if (i === 0) {
            var s = document.createElement('span');
            s.className = 'photo-main-tag';
            s.textContent = 'Main';
            d.appendChild(s);
          }
          addBox.appendChild(d);
        });
      });
      if (addInput.form) {
        addInput.form.addEventListener('reset', function () { addBox.innerHTML = ''; });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ===== ABOUT PAGE VIDEO ===== */
(function () {
  var BUCKET = 'hero-media';
  var SLOT = 'about_video';
  var MAX_BYTES = 20 * 1024 * 1024;
  var SPIN = '<i class="fa-solid fa-spinner fa-spin"></i> Working... please wait';
  var preview = document.getElementById('aboutVideoPreview');
  var fileInput = document.getElementById('aboutVideoFile');
  var upBtn = document.getElementById('aboutVideoUpload');
  var rmBtn = document.getElementById('aboutVideoRemove');
  var msg = document.getElementById('aboutVideoMsg');
  if (!preview || !fileInput || !upBtn || !rmBtn || !msg) return;

  function setMsg(text, bad) {
    msg.textContent = text || '';
    msg.style.color = bad ? '#E62E3B' : '#3BB84D';
  }

  function pathFromUrl(u) {
    var s = String(u || '');
    var k = s.indexOf('/' + BUCKET + '/');
    if (k < 0) return '';
    return decodeURIComponent(s.substring(k + BUCKET.length + 2));
  }

  async function currentRow() {
    var res = await supabase.from('site_media').select('media_url, updated_at').eq('slot', SLOT).maybeSingle();
    if (res.error) throw res.error;
    return res.data;
  }

  async function dropOldFile(url) {
    var p = pathFromUrl(url);
    if (p && p.indexOf('about_') === 0) {
      try { await supabase.storage.from(BUCKET).remove([p]); } catch (e) { console.warn('Old About video file not removed:', e); }
    }
  }

  async function show() {
    try {
      var row = await currentRow();
      if (row && row.media_url) {
        preview.innerHTML = '<video src="' + adminEsc(row.media_url) + '" controls playsinline preload="metadata" style="width:200px;max-width:100%;aspect-ratio:9/16;background:#000;border-radius:16px;object-fit:cover;display:block;"></video>'
          + '<p style="font-size:0.82rem;color:#666;margin-top:8px;">This is the video saved for the About page.</p>';
        rmBtn.style.display = '';
      } else {
        preview.innerHTML = '<p class="empty-text">No video uploaded yet. The About page shows no video block.</p>';
        rmBtn.style.display = 'none';
      }
    } catch (err) {
      console.error(err);
      preview.innerHTML = '<p class="empty-text">Could not load the video: ' + adminEsc(err.message || err) + '</p>';
    }
  }

  upBtn.addEventListener('click', async function () {
    var file = fileInput.files[0];
    if (!file) return setMsg('Please choose an MP4 video first.', true);
    var isMp4 = file.type === 'video/mp4' || /\.mp4$/i.test(file.name);
    if (!isMp4) return setMsg('That file is not an MP4 video.', true);
    if (file.size > MAX_BYTES) return setMsg('Video is too heavy (' + (file.size / 1048576).toFixed(1) + ' MB). Keep it under 20 MB, best under 9 MB.', true);
    var oldHtml = upBtn.innerHTML;
    upBtn.disabled = true;
    upBtn.innerHTML = SPIN;
    setMsg('Uploading... please wait and do not close this page.', false);
    try {
      var old = await currentRow();
      var path = 'about_' + Date.now() + '.mp4';
      var up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: 'video/mp4' });
      if (up.error) throw up.error;
      var pub = supabase.storage.from(BUCKET).getPublicUrl(path);
      var save = await supabase.from('site_media').upsert({ slot: SLOT, media_url: pub.data.publicUrl, media_type: 'video', updated_at: new Date().toISOString() });
      if (save.error) throw save.error;
      if (old && old.media_url) await dropOldFile(old.media_url);
      fileInput.value = '';
      await show();
      setMsg('Saved. The About page will show this video.', false);
    } catch (err) {
      console.error(err);
      setMsg('Upload failed: ' + (err.message || err), true);
    }
    upBtn.disabled = false;
    upBtn.innerHTML = oldHtml;
  });

  rmBtn.addEventListener('click', async function () {
    if (!confirm('Remove the About page video? The About page will show no video block.')) return;
    var oldHtml = rmBtn.innerHTML;
    rmBtn.disabled = true;
    rmBtn.innerHTML = SPIN;
    try {
      var old = await currentRow();
      var del = await supabase.from('site_media').delete().eq('slot', SLOT);
      if (del.error) throw del.error;
      if (old && old.media_url) await dropOldFile(old.media_url);
      await show();
      setMsg('Video removed.', false);
    } catch (err) {
      console.error(err);
      setMsg('Remove failed: ' + (err.message || err), true);
    }
    rmBtn.disabled = false;
    rmBtn.innerHTML = oldHtml;
  });

  var navBtn = document.querySelector('.admin-nav-item[data-tab="tab-about"]');
  if (navBtn) navBtn.addEventListener('click', function () { show(); });
  show();
})();
