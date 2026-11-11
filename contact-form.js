import { supabase } from './db.js';

// CONTACT FORM SAVE: saves the Contact page enquiry into the Supabase table "enquiries".
// "Message Sent" is shown only if the save worked.
const form = document.getElementById('contactForm');

if (form) {
  const statusEl = document.getElementById('contactStatus');
  const submitBtn = form.querySelector('button[type="submit"]');
  const WA = 'https://wa.me/2348033016335';

  function showError(text) {
    statusEl.textContent = '';
    statusEl.appendChild(document.createTextNode(text + ' '));
    const a = document.createElement('a');
    a.href = WA;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'Message us on WhatsApp';
    statusEl.appendChild(a);
    statusEl.hidden = false;
  }

  function showSent() {
    form.innerHTML = '<div class="ct-sent"><h3>Message <em>Sent</em></h3><p>We will respond within 24 hours.</p></div>';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    statusEl.hidden = true;

    // Spam trap: real visitors never see this field. If it is filled in, pretend it worked and save nothing.
    const trap = document.getElementById('c-website');
    if (trap && trap.value.trim() !== '') { showSent(); return; }

    const row = {
      name: document.getElementById('c-name').value.trim(),
      email: document.getElementById('c-email').value.trim(),
      phone: document.getElementById('c-phone').value.trim(),
      interest: document.getElementById('c-interest').value,
      message: document.getElementById('c-message').value.trim()
    };

    if (!row.name || !row.email || !row.phone || !row.message) {
      showError('Please fill in every field.');
      return;
    }
    if (row.message.length > 2000) {
      showError('Your message is too long (2000 characters at most).');
      return;
    }

    submitBtn.disabled = true;
    const oldLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    try {
      const { error } = await supabase.from('enquiries').insert(row);
      if (error) throw error;
      showSent();
    } catch (err) {
      console.error('Enquiry not saved:', err);
      submitBtn.disabled = false;
      submitBtn.textContent = oldLabel;
      showError('Sorry, your message could not be sent. Please try again, or');
    }
  });
}