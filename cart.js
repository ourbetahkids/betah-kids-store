import { supabase } from './db.js';

// LOCAL CART STATE
let cart = JSON.parse(localStorage.getItem('betah_cart')) || [];

// Page is ready: build the cart drawer + checkout modal, bind header icons (if header already exists)
document.addEventListener('DOMContentLoaded', () => {
  initCartDOM();
  updateCartBadge();
  renderCartDrawer();
});

// Pages that load the header from header-partial.inc: the header only exists AFTER this event,
// so cart icons must be bound and the badge refreshed at that point.
document.addEventListener('partialsLoaded', () => {
  bindCartTriggers();
  updateCartBadge();
});

// Named handler: attaching the same function twice is ignored by the browser, so no double-open.
function handleCartTriggerClick(e) {
  e.preventDefault();
  openCartDrawer();
}

function bindCartTriggers() {
  const cartTriggers = document.querySelectorAll('#cartBtn, .cart-icon-link');
  cartTriggers.forEach(btn => btn.addEventListener('click', handleCartTriggerClick));
}

// INITIALIZE CART DOM ELEMENTS & OVERLAYS
function initCartDOM() {
  // Inject Cart Drawer HTML into body if missing
  if (!document.getElementById('cartDrawer')) {
    const cartHTML = `
      <div class="cart-overlay" id="cartOverlay"></div>
      <div class="cart-drawer" id="cartDrawer">
        <div class="cart-drawer-header">
          <h3><i class="fa-solid fa-bag-shopping"></i> Shopping Bag</h3>
          <button class="close-cart-btn" id="closeCartBtn">&times;</button>
        </div>
        <div class="cart-drawer-body" id="cartDrawerBody">
          <!-- Items render dynamically -->
        </div>
        <div class="cart-drawer-footer">
          <div class="cart-subtotal-row">
            <span>Subtotal:</span>
            <span class="cart-subtotal-amount" id="cartSubtotal">\u20A60</span>
          </div>
          <div class="delivery-note">
            <i class="fa-solid fa-truck-fast"></i> Fast doorstep delivery in Abuja &amp; nationwide
          </div>
          <button class="checkout-btn" id="proceedCheckoutBtn">
            Proceed to Checkout <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- CHECKOUT MODAL -->
      <div class="checkout-modal-overlay" id="checkoutModalOverlay">
        <div class="checkout-modal-card">
          <button class="close-modal-btn" id="closeModalBtn">&times;</button>
          <h2>Order <em>Checkout</em></h2>
          <p>Complete your delivery details below to finalize your order.</p>

          <form id="checkoutForm" class="checkout-form">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="custName" placeholder="e.g. Mrs. Amina Bello" required>
            </div>
            <div class="form-group">
              <label>Phone Number (WhatsApp preferred)</label>
              <input type="tel" id="custPhone" placeholder="08012345678" required>
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="custEmail" placeholder="amina@gmail.com" required>
            </div>
            <div class="form-group">
              <label>Delivery Address</label>
              <textarea id="custAddress" rows="2" placeholder="House number, street, area, town..." required></textarea>
            </div>
            <div class="form-group">
              <label>State</label>
              <select id="custCity" required>
<option value="Abuja (FCT)">Abuja (FCT)</option>
<option value="Abia">Abia</option>
<option value="Adamawa">Adamawa</option>
<option value="Akwa Ibom">Akwa Ibom</option>
<option value="Anambra">Anambra</option>
<option value="Bauchi">Bauchi</option>
<option value="Bayelsa">Bayelsa</option>
<option value="Benue">Benue</option>
<option value="Borno">Borno</option>
<option value="Cross River">Cross River</option>
<option value="Delta">Delta</option>
<option value="Ebonyi">Ebonyi</option>
<option value="Edo">Edo</option>
<option value="Ekiti">Ekiti</option>
<option value="Enugu">Enugu</option>
<option value="Gombe">Gombe</option>
<option value="Imo">Imo</option>
<option value="Jigawa">Jigawa</option>
<option value="Kaduna">Kaduna</option>
<option value="Kano">Kano</option>
<option value="Katsina">Katsina</option>
<option value="Kebbi">Kebbi</option>
<option value="Kogi">Kogi</option>
<option value="Kwara">Kwara</option>
<option value="Lagos">Lagos</option>
<option value="Nasarawa">Nasarawa</option>
<option value="Niger">Niger</option>
<option value="Ogun">Ogun</option>
<option value="Ondo">Ondo</option>
<option value="Osun">Osun</option>
<option value="Oyo">Oyo</option>
<option value="Plateau">Plateau</option>
<option value="Rivers">Rivers</option>
<option value="Sokoto">Sokoto</option>
<option value="Taraba">Taraba</option>
<option value="Yobe">Yobe</option>
<option value="Zamfara">Zamfara</option>
</select>
            </div>

            <label style="display:block; font-size:0.72rem; text-transform:uppercase; letter-spacing:1.5px; font-weight:700; color:#555; margin-bottom:8px;">Select Payment Method</label>
            <div class="payment-methods-grid">
              <div class="payment-option selected" id="optTransfer">
                <i class="fa-solid fa-building-columns"></i>
                <span>Bank Transfer</span>
              </div>
              <div class="payment-option" id="optPOD">
                <i class="fa-solid fa-hand-holding-dollar"></i>
                <span>Pay on Delivery (Abuja)</span>
              </div>
            </div>

            <div class="bank-transfer-details" id="bankTransferDetails">
              <p class="bank-transfer-title"><i class="fa-solid fa-circle-info"></i> Transfer the exact amount below, then click "I Have Made Payment"</p>
              <div class="bank-detail-row">
                <span class="bank-detail-label">Bank Name</span>
                <span class="bank-detail-value">Moniepoint</span>
              </div>
              <div class="bank-detail-row">
                <span class="bank-detail-label">Account Name</span>
                <span class="bank-detail-value">Olayinka Akintelu</span>
              </div>
              <div class="bank-detail-row">
                <span class="bank-detail-label">Account Number</span>
                <span class="bank-detail-value" id="bankAccountNumber">8033016335</span>
                <button type="button" class="copy-account-btn" id="copyAccountBtn">Copy</button>
              </div>
              <div class="bank-detail-row">
                <span class="bank-detail-label">Amount to Transfer</span>
                <span class="bank-detail-value" id="bankTransferAmount">\u20A60</span>
              </div>
            </div>

            <button type="submit" class="pay-submit-btn" id="paySubmitBtn">
              <i class="fa-solid fa-circle-check"></i> I Have Made Payment
            </button>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', cartHTML);
  }

  // EVENT LISTENERS
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const proceedCheckoutBtn = document.getElementById('proceedCheckoutBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
  const optTransfer = document.getElementById('optTransfer');
  const optPOD = document.getElementById('optPOD');
  const copyAccountBtn = document.getElementById('copyAccountBtn');
  /* ===== DELIVERY CHOICE ===== */
  (function () {
    const addr = document.getElementById('custAddress');
    const cityEl = document.getElementById('custCity');
    const podBtn = document.getElementById('optPOD');
    const trBtn = document.getElementById('optTransfer');
    if (!addr || !cityEl || !podBtn || !trBtn || document.getElementById('bkOptDelivery')) return;
    const addrGroup = addr.closest('.form-group');
    const cityGroup = cityEl.closest('.form-group');
    if (!addrGroup || !cityGroup) return;
    window.bkDelivery = 'delivery';

    const wrap = document.createElement('div');
    wrap.style.marginBottom = '14px';
    wrap.innerHTML =
      '<label style="display:block;font-size:0.72rem;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;color:#555;margin-bottom:8px;">Delivery or Pickup</label>' +
      '<div class="payment-methods-grid">' +
        '<div class="payment-option selected" id="bkOptDelivery"><i class="fa-solid fa-truck"></i><span>Delivery</span></div>' +
        '<div class="payment-option" id="bkOptPickup"><i class="fa-solid fa-store"></i><span>Pickup</span></div>' +
      '</div>' +
      '<p id="bkRecvNote" style="margin:8px 0 0;font-size:.78rem;line-height:1.45;color:#6b5f52;"></p>' +
      '<p id="bkRecvWarn" style="display:none;margin:6px 0 0;font-size:.78rem;line-height:1.45;color:#c0392b;font-weight:600;"></p>';
    addrGroup.parentNode.insertBefore(wrap, addrGroup);

    const dBtn = document.getElementById('bkOptDelivery');
    const pBtn = document.getElementById('bkOptPickup');
    const note = document.getElementById('bkRecvNote');
    const warn = document.getElementById('bkRecvWarn');
    const subBtn = document.getElementById('paySubmitBtn');

    function outside() {
      return window.bkDelivery !== 'pickup' && !/^abuja/i.test(cityEl.value);
    }
    function syncPod() {
      const pk = window.bkDelivery === 'pickup';
      const span = podBtn.querySelector('span');
      if (span) span.textContent = pk ? 'Pay on Pickup' : 'Pay on Delivery (Abuja)';
      if (subBtn && podBtn.classList.contains('selected')) {
        subBtn.innerHTML = pk
          ? '<i class="fa-solid fa-store"></i> Confirm Pay on Pickup'
          : '<i class="fa-solid fa-truck-ramp-box"></i> Confirm Pay on Delivery';
      }
    }
    function guard() {
      if (outside() && podBtn.classList.contains('selected')) {
        trBtn.click();
        warn.textContent = 'Pay on Delivery is for Abuja only, so we switched you to Bank Transfer.';
        warn.style.display = 'block';
      } else if (!outside()) {
        warn.style.display = 'none';
      }
    }
    function setMode(m) {
      window.bkDelivery = m;
      const pk = m === 'pickup';
      dBtn.classList.toggle('selected', !pk);
      pBtn.classList.toggle('selected', pk);
      addrGroup.style.display = pk ? 'none' : '';
      cityGroup.style.display = pk ? 'none' : '';
      addr.required = !pk;
      cityEl.required = !pk;
      note.textContent = pk
        ? 'No delivery fee. We will send you the pickup address and time on WhatsApp once your order is ready.'
        : 'We deliver nationwide. The delivery fee is not included in the amount to transfer. We confirm it with you on WhatsApp before dispatch.';
      syncPod();
      guard();
    }

    dBtn.addEventListener('click', function () { setMode('delivery'); });
    pBtn.addEventListener('click', function () { setMode('pickup'); });
    cityEl.addEventListener('change', guard);
    podBtn.addEventListener('click', function () { setTimeout(function () { guard(); syncPod(); }, 0); });
    setMode('delivery');
  })();
  /* ===== STATE PICKER ===== */
  (function () {
    const sel = document.getElementById('custCity');
    if (!sel || document.getElementById('bkStateBtn')) return;

    if (!document.getElementById('bkSpStyle')) {
      const css = [
        '.bksp-ov{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(20,15,10,.55);z-index:100002;display:flex;align-items:flex-end;justify-content:center}',
        '.bksp-box{background:#fff;width:100%;max-width:440px;max-height:70vh;max-height:70dvh;border-radius:18px 18px 0 0;display:flex;flex-direction:column;box-shadow:0 -10px 40px rgba(0,0,0,.3)}',
        '.bksp-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px 10px 18px;border-bottom:1px solid #f0e6da;font-weight:700;color:#2a2118;font-size:1rem;flex:0 0 auto}',
        '.bksp-x{border:1px solid #d9cfc2;background:#fff;color:#4a3f33;border-radius:999px;padding:5px 12px;font-size:.8rem;font-weight:700;cursor:pointer}',
        '.bksp-list{overflow-y:auto;-webkit-overflow-scrolling:touch;flex:1 1 auto}',
        '.bksp-opt{display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left;background:#fff;border:0;border-bottom:1px solid #f4ede4;padding:13px 18px;font-size:.95rem;color:#2a2118;cursor:pointer;font-family:inherit}',
        '.bksp-opt.on{background:#fff3e8;color:#E56510;font-weight:700}'
      ].join('');
      const st = document.createElement('style');
      st.id = 'bkSpStyle';
      st.textContent = css;
      document.head.appendChild(st);
    }

    const cs = window.getComputedStyle(sel);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'bkStateBtn';
    btn.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;box-sizing:border-box;text-align:left;cursor:pointer;background:#fff;color:#2a2118;';
    btn.style.padding = cs.padding || '12px 14px';
    btn.style.border = cs.border || '1px solid #ddd';
    if (!btn.style.border) btn.style.border = '1px solid #ddd';
    if (!btn.style.padding) btn.style.padding = '12px 14px';
    btn.style.borderRadius = cs.borderRadius || '8px';
    btn.style.fontSize = cs.fontSize || '1rem';
    btn.style.fontFamily = cs.fontFamily || 'inherit';
    sel.style.display = 'none';
    sel.parentNode.insertBefore(btn, sel.nextSibling);

    function label() {
      btn.innerHTML = '<span></span><i class="fa-solid fa-chevron-down" style="font-size:.75rem;color:#888"></i>';
      btn.firstChild.textContent = sel.value;
    }
    label();

    function openPicker() {
      const ov = document.createElement('div');
      ov.className = 'bksp-ov';
      const box = document.createElement('div');
      box.className = 'bksp-box';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');

      const head = document.createElement('div');
      head.className = 'bksp-head';
      const h = document.createElement('span');
      h.textContent = 'Select your state';
      const x = document.createElement('button');
      x.type = 'button';
      x.className = 'bksp-x';
      x.innerHTML = 'Close &times;';
      head.appendChild(h);
      head.appendChild(x);

      const list = document.createElement('div');
      list.className = 'bksp-list';
      let current = null;

      function closePicker() {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = prevOverflow;
        ov.remove();
      }
      function onKey(e) { if (e.key === 'Escape') closePicker(); }

      Array.prototype.forEach.call(sel.options, function (o) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'bksp-opt' + (o.value === sel.value ? ' on' : '');
        const name = document.createElement('span');
        name.textContent = o.value;
        b.appendChild(name);
        if (o.value === sel.value) {
          const tick = document.createElement('span');
          tick.textContent = '\u2713';
          b.appendChild(tick);
          current = b;
        }
        b.addEventListener('click', function () {
          sel.value = o.value;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          label();
          closePicker();
        });
        list.appendChild(b);
      });

      box.appendChild(head);
      box.appendChild(list);
      ov.appendChild(box);
      ov.addEventListener('click', function (e) { if (e.target === ov) closePicker(); });
      x.addEventListener('click', closePicker);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKey);
      document.body.appendChild(ov);
      if (current) list.scrollTop = Math.max(0, current.offsetTop - 60);
    }
    btn.addEventListener('click', openPicker);
  })();

  // Header cart icons (works immediately on pages that still have the header written in the HTML)
  bindCartTriggers();

  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (proceedCheckoutBtn) proceedCheckoutBtn.addEventListener('click', openCheckoutModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeCheckoutModal);

  let selectedPayment = 'transfer';

  if (optTransfer && optPOD) {
    optTransfer.addEventListener('click', () => {
      optTransfer.classList.add('selected');
      optPOD.classList.remove('selected');
      selectedPayment = 'transfer';
      document.getElementById('bankTransferDetails').style.display = 'block';
      document.getElementById('paySubmitBtn').innerHTML = `<i class="fa-solid fa-circle-check"></i> I Have Made Payment`;
    });

    optPOD.addEventListener('click', () => {
      optPOD.classList.add('selected');
      optTransfer.classList.remove('selected');
      selectedPayment = 'pod';
      document.getElementById('bankTransferDetails').style.display = 'none';
      document.getElementById('paySubmitBtn').innerHTML = `<i class="fa-solid fa-truck-ramp-box"></i> Confirm Pay on Delivery`;
    });
  }

  if (copyAccountBtn) {
    copyAccountBtn.addEventListener('click', () => {
      const accountNumber = document.getElementById('bankAccountNumber').textContent;
      navigator.clipboard.writeText(accountNumber).then(() => {
        copyAccountBtn.textContent = 'Copied!';
        setTimeout(() => { copyAccountBtn.textContent = 'Copy'; }, 2000);
      });
    });
  }

  // CHECKOUT SUBMISSION LOGIC
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (cart.length === 0) return alert('Your shopping cart is empty.');

      const customer_name = document.getElementById('custName').value.trim();
      const phone = document.getElementById('custPhone').value.trim();
      const customer_email = document.getElementById('custEmail').value.trim();
      const address = document.getElementById('custAddress').value.trim();
      const city = document.getElementById('custCity').value;
      const total_amount = calculateSubtotal();

      if (selectedPayment === 'transfer') {
        processDirectOrder({ customer_name, customer_email, phone, address, city, total_amount, payment_status: 'Pending Payment Confirmation - Bank Transfer' });
      } else {
        processDirectOrder({ customer_name, customer_email, phone, address, city, total_amount, payment_status: 'Pay on Delivery' });
      }
    });
  }
}

// CART DRAWER TOGGLES
function openCartDrawer() {
  document.getElementById('cartOverlay')?.classList.add('active');
  document.getElementById('cartDrawer')?.classList.add('active');
}

function closeCartDrawer() {
  document.getElementById('cartOverlay')?.classList.remove('active');
  document.getElementById('cartDrawer')?.classList.remove('active');
}

function openCheckoutModal() {
  if (cart.length === 0) return alert('Your cart is empty! Add items first.');
  closeCartDrawer();
  const subtotal = calculateSubtotal();
  document.getElementById('checkoutTotalBtnAmount') && (document.getElementById('checkoutTotalBtnAmount').textContent = subtotal.toLocaleString());
  const bankAmountEl = document.getElementById('bankTransferAmount');
  if (bankAmountEl) bankAmountEl.textContent = '\u20A6' + subtotal.toLocaleString();
  document.getElementById('bankTransferDetails').style.display = 'block';
  document.getElementById('checkoutModalOverlay')?.classList.add('active');
}

function closeCheckoutModal() {
  document.getElementById('checkoutModalOverlay')?.classList.remove('active');
}

// GLOBAL ADD TO CART FUNCTION
window.addToCart = (id, title, price, image, qty = 1) => {
  const addQty = Math.max(1, parseInt(qty, 10) || 1);
  const existingIndex = cart.findIndex(item => item.id === id);
  if (existingIndex > -1) {
    cart[existingIndex].qty += addQty;
  } else {
    cart.push({ id, title, price: Number(price), image, qty: addQty });
  }

  saveCart();
  updateCartBadge();
  renderCartDrawer();
  openCartDrawer();
};

window.updateCartQty = (id, change) => {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += change;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  saveCart();
  updateCartBadge();
  renderCartDrawer();
};

window.removeFromCart = (id) => {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
};

function saveCart() {
  localStorage.setItem('betah_cart', JSON.stringify(cart));
}

function calculateSubtotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function updateCartBadge() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const badges = document.querySelectorAll('#cartCount, .cart-badge');
  badges.forEach(badge => { badge.textContent = totalQty; });
}

// RENDER CART ITEMS INSIDE DRAWER
function renderCartDrawer() {
  const container = document.getElementById('cartDrawerBody');
  const subtotalEl = document.getElementById('cartSubtotal');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-msg">
        <i class="fa-solid fa-basket-shopping"></i>
        <p>Your shopping bag is empty.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '\u20A60';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item-row">
      <img src="${item.image}" class="cart-item-img" alt="${item.title}">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">\u20A6${(item.price * item.qty).toLocaleString()}</div>
        <div class="cart-qty-controls">
          <button class="qty-btn" onclick="window.updateCartQty('${item.id}', -1)">-</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="window.updateCartQty('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="remove-cart-item" onclick="window.removeFromCart('${item.id}')">&times;</button>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = `\u20A6${calculateSubtotal().toLocaleString()}`;
}

// SAVE ORDER TO SUPABASE DATABASE
/* ===== ORDER CONFIRMATION ===== */
let bkOrderBusy = false;

function bkOcEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function bkOcMoney(n) {
  return '\u20A6' + Number(n || 0).toLocaleString('en-NG');
}

function bkOcStyle() {
  if (document.getElementById('bkOcStyle')) return;
  const css = [
    '.bkoc-ov{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(20,15,10,.62);z-index:100000;display:flex;align-items:center;justify-content:center;padding:12px}',
    '.bkoc-box{background:#fff;border-radius:18px;width:100%;max-width:480px;max-height:92vh;overflow-y:auto;box-shadow:0 20px 50px rgba(0,0,0,.35)}',
    '.bkoc-head{text-align:center;padding:20px 16px 14px;border-bottom:1px solid #f0e6da}',
    '.bkoc-tick{width:46px;height:46px;border-radius:50%;background:#e7f7ec;color:#1a9b4b;font-size:24px;line-height:46px;margin:0 auto 8px;font-weight:700}',
    '.bkoc-head h2{margin:0 0 4px;font-size:1.25rem;color:#2a2118}',
    '.bkoc-head p{margin:0;font-size:.85rem;color:#6b5f52}',
    '.bkoc-no{display:inline-block;margin-top:10px;padding:6px 16px;border-radius:999px;background:#fff3e8;color:#E56510;font-weight:800;font-size:1.1rem;letter-spacing:.5px;border:1px solid #ffd2ad}',
    '.bkoc-body{padding:10px 16px 4px}',
    '.bkoc-item{display:flex;gap:10px;align-items:flex-start;justify-content:space-between;padding:9px 0;border-bottom:1px dashed #eadfd2;font-size:.9rem;color:#2a2118}',
    '.bkoc-ititle{flex:1;min-width:0;line-height:1.35}',
    '.bkoc-code{display:inline-block;margin-top:3px;font-family:monospace;font-size:.75rem;background:#fff3e8;color:#E56510;padding:2px 7px;border-radius:6px;font-weight:700}',
    '.bkoc-qty{font-size:.8rem;color:#6b5f52;margin-left:4px}',
    '.bkoc-iprice{font-weight:700;white-space:nowrap}',
    '.bkoc-total{display:flex;justify-content:space-between;font-weight:800;font-size:1.05rem;padding:12px 0 6px;color:#2a2118}',
    '.bkoc-fee{font-size:.78rem;color:#6b5f52;text-align:right;margin:0 0 8px}',
    '.bkoc-recv{font-size:.86rem;color:#2a2118;line-height:1.5;margin:6px 0 8px}',
    '.bkoc-next{background:#faf6f0;border-radius:10px;padding:10px 12px 8px;margin:4px 0 6px}',
    '.bkoc-next h3{margin:0 0 6px;font-size:.78rem;text-transform:uppercase;letter-spacing:1.2px;color:#E56510}',
    '.bkoc-next ol{margin:0;padding-left:18px;font-size:.85rem;line-height:1.55;color:#4a3f33}',
    '.bkoc-next li{margin-bottom:4px}',
    '.bkoc-foot{padding:8px 16px 18px;display:flex;flex-direction:column;gap:8px}',
    '.bkoc-inv{display:block;text-align:center;background:#fff7ef;border:1.5px solid #FF7A1A;color:#E56510;text-decoration:none;font-weight:700;padding:12px;border-radius:12px;font-size:.95rem}', '.bkoc-wa{display:block;text-align:center;background:#25D366;color:#fff;text-decoration:none;font-weight:700;padding:13px;border-radius:12px;font-size:.95rem}',
    '.bkoc-close{background:#fff;border:1px solid #d9cfc2;border-radius:12px;padding:11px;font-weight:600;cursor:pointer;font-size:.9rem;color:#4a3f33}'
  ].join('');
  const st = document.createElement('style');
  st.id = 'bkOcStyle';
  st.textContent = css;
  document.head.appendChild(st);
}

function bkOcShow(res, orderData, isTransfer, pickup) {
  bkOcStyle();
  const items = Array.isArray(res.items) ? res.items : [];
  const total = Number(res.total || 0);
  const no = res.order_no || '';
  const where = orderData.address + (orderData.city ? ', ' + orderData.city : '');

  const lines = items.map(function (it) {
    return '- ' + (it.product_code ? it.product_code + ' ' : '') + it.title + ' x' + it.qty + ' (' + bkOcMoney(Number(it.price) * Number(it.qty)) + ')';
  });
  let msg = 'Hello Betah Kids Beauty World, I have placed order ' + no + '.\n\n' + lines.join('\n') +
    '\n\nTotal: ' + bkOcMoney(total) + (pickup ? '' : ' (goods only, delivery fee to be confirmed)') +
    '\nPayment: ' + (isTransfer ? 'Bank transfer' : (pickup ? 'Pay on Pickup' : 'Pay on Delivery')) +
    '\nName: ' + orderData.customer_name +
    '\nPhone: ' + orderData.phone +
    (pickup ? '\nCollection: Pickup. Please send me the pickup address and time.' : '\nDeliver to: ' + where);
  if (isTransfer) msg += '\n\nI have made the transfer and will send my proof of payment here.';
  const waUrl = 'https://wa.me/2348033016335?text=' + encodeURIComponent(msg);

  const itemHtml = items.map(function (it) {
    return '<div class="bkoc-item"><div class="bkoc-ititle"><b>' + bkOcEsc(it.title) + '</b><br>' +
      (it.product_code ? '<span class="bkoc-code">' + bkOcEsc(it.product_code) + '</span>' : '') +
      '<span class="bkoc-qty">\u00D7 ' + bkOcEsc(it.qty) + '</span></div>' +
      '<div class="bkoc-iprice">' + bkOcMoney(Number(it.price) * Number(it.qty)) + '</div></div>';
  }).join('');

  const steps = [];
  if (isTransfer) {
    steps.push('Send your proof of payment to us on WhatsApp (green button below), quoting <b>' + bkOcEsc(no) + '</b>.');
    steps.push('We confirm the payment in our account.');
  } else {
    steps.push('We will call or message you on <b>' + bkOcEsc(orderData.phone) + '</b> to confirm your order.');
  }
  if (pickup) {
    steps.push('We message you the pickup address and time when your order is ready.');
    steps.push(isTransfer ? 'Collect your order. Please bring your order number.' : 'Collect your order and pay on pickup. Please bring your order number.');
  } else {
    steps.push('We confirm your delivery fee and delivery time with you on WhatsApp.');
    steps.push(isTransfer ? 'Your order is delivered to you.' : 'Your order arrives and you pay on delivery.');
  }
  const stepsHtml = steps.map(function (t) { return '<li>' + t + '</li>'; }).join('');

  const recvHtml = pickup
    ? '<b>Pickup:</b> we will send you the pickup address and time on WhatsApp.'
    : '<b>Deliver to:</b> ' + bkOcEsc(where);

  const old = document.querySelector('.bkoc-ov');
  if (old) old.remove();

  const ov = document.createElement('div');
  ov.className = 'bkoc-ov';
  ov.innerHTML =
    '<div class="bkoc-box" role="dialog" aria-modal="true">' +
      '<div class="bkoc-head"><div class="bkoc-tick">&#10003;</div>' +
        '<h2>Order placed</h2>' +
        '<p>Thank you, ' + bkOcEsc(orderData.customer_name) + '. Your order number is:</p>' +
        '<div class="bkoc-no">' + bkOcEsc(no) + '</div></div>' +
      '<div class="bkoc-body">' + itemHtml +
        '<div class="bkoc-total"><span>Total</span><span>' + bkOcMoney(total) + '</span></div>' +
        (pickup ? '' : '<div class="bkoc-fee">Delivery fee not included. We confirm it with you on WhatsApp.</div>') +
        '<div class="bkoc-recv">' + recvHtml + '</div>' +
        '<div class="bkoc-next"><h3>What happens next</h3><ol>' + stepsHtml + '</ol></div></div>' +
      '<div class="bkoc-foot">' +
        '<a class="bkoc-inv" href="invoice.html?o=' + encodeURIComponent(res.order_no) + '&amp;k=' + encodeURIComponent(res.invoice_token) + '" target="_blank" rel="noopener">View invoice</a>' +
      '<a class="bkoc-wa" href="' + waUrl + '" target="_blank" rel="noopener">Send order on WhatsApp</a>' +
        '<button type="button" class="bkoc-close">Close</button></div>' +
    '</div>';
  ov.addEventListener('click', function (e) {
    if (e.target === ov || (e.target.classList && e.target.classList.contains('bkoc-close'))) ov.remove();
  });
  document.body.appendChild(ov);
}

async function processDirectOrder(orderData) {
  if (bkOrderBusy) return;
  bkOrderBusy = true;
  try {
    if (!cart || !cart.length) throw new Error('Your cart is empty.');
    const isTransfer = /bank transfer/i.test(String(orderData.payment_status || ''));
    const pickup = window.bkDelivery === 'pickup';

    const { data, error } = await supabase.rpc('place_order', {
      p_name: orderData.customer_name,
      p_email: orderData.customer_email,
      p_phone: orderData.phone,
      p_address: pickup ? '' : orderData.address,
      p_city: pickup ? '' : orderData.city,
      p_payment: isTransfer ? 'transfer' : 'pod',
      p_items: cart.map(function (i) { return { id: String(i.id), qty: Number(i.qty) || 1 }; }),
      p_delivery: pickup ? 'pickup' : 'delivery'
    });

    if (error) throw error;
    if (!data || !data.order_no) throw new Error('The order could not be confirmed. Please try again or contact us on WhatsApp.');

    // Clear Cart
    cart = [];
    saveCart();
    updateCartBadge();
    renderCartDrawer();
    closeCheckoutModal();

    bkOcShow(data, orderData, isTransfer, pickup);
  } catch (err) {
    alert('Error submitting order: ' + (err && err.message ? err.message : err));
  } finally {
    bkOrderBusy = false;
  }
}
