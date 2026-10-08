import { supabase } from './db.js';

// LOCAL CART STATE
let cart = JSON.parse(localStorage.getItem('betah_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
  initCartDOM();
  updateCartBadge();
  renderCartDrawer();
});

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
            <span class="cart-subtotal-amount" id="cartSubtotal">₦0</span>
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
              <textarea id="custAddress" rows="2" placeholder="House number, street name, district..." required></textarea>
            </div>
            <div class="form-group">
              <label>City / Location</label>
              <select id="custCity" required>
                <option value="Abuja - Central / Wuse / Maitama / Garki">Abuja - Central (Wuse, Maitama, Garki, Jabi)</option>
                <option value="Abuja - Gwarinpa / Utako / Lokogoma / Lugbe">Abuja - Suburbs (Gwarinpa, Lokogoma, Lugbe, Kubwa)</option>
                <option value="Outside Abuja - Nationwide Delivery">Outside Abuja - Nationwide Delivery</option>
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
                <span class="bank-detail-value" id="bankTransferAmount">₦0</span>
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
  const cartBtn = document.getElementById('cartBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const proceedCheckoutBtn = document.getElementById('proceedCheckoutBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
  const optTransfer = document.getElementById('optTransfer');
  const optPOD = document.getElementById('optPOD');
  const copyAccountBtn = document.getElementById('copyAccountBtn');

  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
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
  if (bankAmountEl) bankAmountEl.textContent = '₦' + subtotal.toLocaleString();
  document.getElementById('bankTransferDetails').style.display = 'block';
  document.getElementById('checkoutModalOverlay')?.classList.add('active');
}

function closeCheckoutModal() {
  document.getElementById('checkoutModalOverlay')?.classList.remove('active');
}

// GLOBAL ADD TO CART FUNCTION
window.addToCart = (id, title, price, image) => {
  const existingIndex = cart.findIndex(item => item.id === id);
  if (existingIndex > -1) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({ id, title, price: Number(price), image, qty: 1 });
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
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = totalQty;
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
    if (subtotalEl) subtotalEl.textContent = '₦0';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item-row">
      <img src="${item.image}" class="cart-item-img" alt="${item.title}">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">₦${(item.price * item.qty).toLocaleString()}</div>
        <div class="cart-qty-controls">
          <button class="qty-btn" onclick="window.updateCartQty('${item.id}', -1)">-</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="window.updateCartQty('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="remove-cart-item" onclick="window.removeFromCart('${item.id}')">&times;</button>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = `₦${calculateSubtotal().toLocaleString()}`;
}

// SAVE ORDER TO SUPABASE DATABASE
async function processDirectOrder(orderData) {
  try {
    const { error } = await supabase.from('orders').insert([
      {
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        phone: orderData.phone,
        address: orderData.address,
        city: orderData.city,
        items: cart,
        total_amount: orderData.total_amount,
        payment_status: orderData.payment_status
      }
    ]);

    if (error) throw error;

    alert(`Order Placed Successfully!\n\nThank you ${orderData.customer_name}, your order has been sent to Betah Kids Abuja. We will confirm your payment shortly.`);

    // Clear Cart
    cart = [];
    saveCart();
    updateCartBadge();
    renderCartDrawer();
    closeCheckoutModal();

  } catch (err) {
    alert('Error submitting order: ' + err.message);
  }
}


