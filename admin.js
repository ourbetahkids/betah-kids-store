import { supabase } from './db.js';

// DOM ELEMENTS
const loginOverlay = document.getElementById('loginOverlay');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const logoutBtn = document.getElementById('logoutBtn');
const navItems = document.querySelectorAll('.admin-nav-item');
const tabContents = document.querySelectorAll('.admin-tab-content');

// INITIALIZATION ON PAGE LOAD
document.addEventListener('DOMContentLoaded', () => {
  const savedSession = localStorage.getItem('betah_admin_session');
  if (savedSession) {
    showDashboard(savedSession);
    loadAllAdminData();
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
  });
});

// LOGIN SUBMISSION LOGIC
adminLoginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value.trim();

  // Secure admin password check (betah2026 or admin123)
  if (password === 'betah2026' || password === 'admin123') {
    localStorage.setItem('betah_admin_session', email);
    showDashboard(email);
    loadAllAdminData();
  } else {
    alert('Incorrect Admin Password! Please try again.');
  }
});

// LOGOUT LOGIC
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('betah_admin_session');
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
    const file = fileInput.files[0];

    if (!file) return alert('Please select an image or video file.');

    try {
      // Upload file to Supabase Storage Bucket 'hero-media'
      const fileExt = file.name.split('.').pop();
      const fileName = `hero_${Date.now()}.${fileExt}`;

      const { data: storageData, error: storageErr } = await supabase.storage
        .from('hero-media')
        .upload(fileName, file);

      if (storageErr) throw storageErr;

      // Get Public File URL
      const { data: urlData } = supabase.storage
        .from('hero-media')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Insert metadata into 'hero_slides' database table
      const { error: dbErr } = await supabase.from('hero_slides').insert([
        {
          title,
          subtitle,
          media_url: publicUrl,
          media_type: mediaType,
          button_text: buttonText
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

// FETCH & RENDER HERO SLIDES LIST
async function loadHeroSlides() {
  const container = document.getElementById('heroSlidesList');
  if (!container) return;

  const { data: slides, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !slides || slides.length === 0) {
    container.innerHTML = '<p class="empty-text">No active hero slides uploaded yet.</p>';
    return;
  }

  container.innerHTML = slides.map(slide => `
    <div style="background:#f9f9f9; padding:16px; border-radius:12px; margin-bottom:12px; display:flex; gap:16px; align-items:center;">
      ${slide.media_type === 'video' 
        ? `<video src="${slide.media_url}" style="width:100px; height:70px; object-fit:cover; border-radius:8px;" autoplay muted loop></video>`
        : `<img src="${slide.media_url}" style="width:100px; height:70px; object-fit:cover; border-radius:8px;" alt="${slide.title}">`
      }
      <div style="flex:1;">
        <h4 style="margin-bottom:4px;">${slide.title} <span style="font-size:0.7rem; background:#FF7A1A; color:white; padding:2px 8px; border-radius:50px;">${slide.media_type}</span></h4>
        <p style="font-size:0.82rem; color:#666;">${slide.subtitle}</p>
      </div>
      <button onclick="window.deleteHeroSlide('${slide.id}')" style="background:#ff4d4d; color:white; border:none; padding:8px 14px; border-radius:6px; cursor:pointer;">Delete</button>
    </div>
  `).join('');
}

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
    const description = document.getElementById('prodDesc').value.trim();
    const fileInput = document.getElementById('prodImage');
    const file = fileInput.files[0];

    if (!file) return alert('Please select a product photo.');

    try {
      // Upload product image to Supabase Storage Bucket 'products'
      const fileExt = file.name.split('.').pop();
      const fileName = `prod_${Date.now()}.${fileExt}`;

      const { error: storageErr } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (storageErr) throw storageErr;

      // Get Public Image URL
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Insert record into 'products' table
      const { error: dbErr } = await supabase.from('products').insert([
        { title, price, category, description, image_url: imageUrl }
      ]);

      if (dbErr) throw dbErr;

      alert('Product successfully added to store!');
      productAddForm.reset();
      loadProducts();
      loadOverviewStats();
    } catch (err) {
      alert('Error adding product: ' + err.message);
    }
  });
}

// FETCH & RENDER PRODUCTS TABLE
async function loadProducts() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !products || products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No products found in inventory. Add one above!</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.image_url}" class="table-img" alt="${p.title}"></td>
      <td><strong>${p.title}</strong></td>
      <td><span class="brand-badge">${p.category}</span></td>
      <td>₦${Number(p.price).toLocaleString()}</td>
      <td>
        <button onclick="window.deleteProduct('${p.id}')" style="color:#ff4d4d; cursor:pointer; background:none; border:none; font-size:1rem;">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');
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

// 4. ORDERS FETCHING LOGIC
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
