import { supabase } from './db.js';

const root = document.getElementById('invRoot');
const WA = '2348033016335';

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function money(n) {
  return '\u20A6' + Number(n || 0).toLocaleString('en-NG');
}
function fail(msg) {
  document.title = 'Invoice not found | Betah Kids Beauty World';
  root.innerHTML =
    '<div class="inv-card inv-fail"><h1>Invoice not found</h1><p>' + esc(msg) + '</p>' +
    '<a class="inv-btn inv-btn-line" href="index.html">Back to store</a></div>';
}

function render(d) {
  const items = Array.isArray(d.items) ? d.items : [];
  const st = String(d.payment_status || '').trim();
  const pickup = d.delivery_method === 'pickup';
  const total = Number(d.total || 0);

  let kind = 'INVOICE';
  let stamp = 'AWAITING PAYMENT';
  let cls = 'wait';
  if (/cancel/i.test(st)) { stamp = 'CANCELLED'; cls = 'x'; }
  else if (/^(paid|delivered)$/i.test(st)) { kind = 'RECEIPT'; stamp = 'PAID'; cls = 'ok'; }
  else if (/pay on delivery/i.test(st)) { stamp = 'PAY ON DELIVERY'; cls = 'pod'; }
  const isBank = /bank transfer/i.test(st);

  let dateTxt = '';
  try {
    dateTxt = new Date(d.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) { dateTxt = ''; }

  document.title = kind.charAt(0) + kind.slice(1).toLowerCase() + ' ' + d.order_no + ' | Betah Kids Beauty World';

  const rows = items.map(function (it) {
    const name = it.title || it.name || it.product_name || 'Item';
    const qty = Number(it.qty || it.quantity || 1);
    const price = Number(it.price || 0);
    const code = it.product_code ? '<span class="inv-code">' + esc(it.product_code) + '</span>' : '';
    return '<div class="inv-row"><div class="inv-name"><b>' + esc(name) + '</b>' + code + '</div>' +
      '<div class="inv-q">' + qty + ' &times; ' + money(price) + '</div>' +
      '<div class="inv-amt">' + money(price * qty) + '</div></div>';
  }).join('');

  const where = pickup
    ? 'Pickup. We will send the pickup address and time on WhatsApp.'
    : esc(d.address) + (d.city ? ', ' + esc(d.city) : '');

  let extra = '';
  if (cls === 'wait' && isBank) {
    extra = '<div class="inv-box"><b>How to pay:</b> transfer <b>' + money(total) + '</b> to <b>Moniepoint, Olayinka Akintelu, 8033016335</b>. ' +
      'Use <b>' + esc(d.order_no) + '</b> as the reference, then send us your proof of payment on WhatsApp.</div>';
  } else if (cls === 'pod') {
    extra = '<div class="inv-box"><b>Pay on ' + (pickup ? 'pickup' : 'delivery') + ':</b> ' + money(total) + ' for the goods is payable when you ' + (pickup ? 'collect' : 'receive') + ' your order.</div>';
  } else if (cls === 'ok') {
    extra = '<div class="inv-box"><b>Payment received.</b> Thank you. This receipt confirms we have received your payment for the order above.</div>';
  }
  const feeNote = pickup ? '' : '<p class="inv-note">Delivery fee is not included. We confirm it with you on WhatsApp before dispatch.</p>';

  const waText = 'Hello Betah Kids Beauty World, I am writing about ' + kind.toLowerCase() + ' ' + d.order_no + '.';

  root.innerHTML =
    '<div class="inv-card">' +
      '<div class="inv-top">' +
        '<img class="inv-logo" src="images/logo.png" alt="Betah Kids Beauty World">' +
        '<div class="inv-title"><h1>' + kind + '</h1><span class="inv-no">' + esc(d.order_no) + '</span></div>' +
      '</div>' +
      '<div class="inv-stamp ' + cls + '">' + stamp + '</div>' +
      '<div class="inv-meta">' +
        '<div><h3>From</h3><p><b>Betah Kids Beauty World LTD</b><br>Abuja, Nigeria<br>WhatsApp: 0803 301 6335<br>betahkids.com</p></div>' +
        '<div><h3>Billed to</h3><p><b>' + esc(d.customer_name) + '</b><br>' + esc(d.phone) + '</p></div>' +
        '<div><h3>Date</h3><p>' + esc(dateTxt) + '</p></div>' +
        '<div><h3>' + (pickup ? 'Collection' : 'Deliver to') + '</h3><p>' + where + '</p></div>' +
      '</div>' +
      '<div class="inv-head"><span>Item</span><span>Qty &times; Price</span><span>Amount</span></div>' +
      rows +
      '<div class="inv-total"><span>Total</span><span>' + money(total) + '</span></div>' +
      feeNote + extra +
      '<p class="inv-thanks">Thank you for shopping with Betah Kids Beauty World.</p>' +
    '</div>' +
    '<div class="inv-actions">' +
      '<button type="button" class="inv-btn inv-btn-main" id="invPrint">Print / Save as PDF</button>' +
      '<a class="inv-btn inv-btn-wa" target="_blank" rel="noopener" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(waText) + '">WhatsApp us</a>' +
      '<a class="inv-btn inv-btn-line" href="index.html">Back to store</a>' +
    '</div>';

  const pb = document.getElementById('invPrint');
  if (pb) pb.addEventListener('click', function () { window.print(); });
}

async function load() {
  const q = new URLSearchParams(window.location.search);
  const no = (q.get('o') || '').trim();
  const key = (q.get('k') || '').trim();
  if (!no || !key) {
    fail('This link is incomplete. Please use the full link we gave you, or contact us on WhatsApp.');
    return;
  }
  try {
    const { data, error } = await supabase.rpc('get_invoice', { p_order_no: no, p_token: key });
    if (error) throw error;
    if (!data) {
      fail('We could not find an order for this link. Please check the link, or contact us on WhatsApp.');
      return;
    }
    render(data);
  } catch (e) {
    fail('We could not load this right now. Please try again, or contact us on WhatsApp.');
  }
}

load();
