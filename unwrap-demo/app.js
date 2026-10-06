/* =============================================
   UNWRAP — Global App JS
   ============================================= */

// Nav scroll effect
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// Notification system
function showNotif(title, text, type = '') {
  const notif = document.getElementById('notification');
  const notifTitle = document.getElementById('notifTitle');
  const notifText = document.getElementById('notifText');
  if (!notif) return;
  notifTitle.textContent = title;
  notifText.textContent = text;
  notif.className = `notification show ${type}`;
  setTimeout(() => { notif.classList.remove('show'); }, 3800);
}

// Close modals on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// Hero entrance animation
window.addEventListener('DOMContentLoaded', () => {
  const heroElements = document.querySelectorAll('.hero-badge, .hero-title, .hero-sub, .hero-ctas, .hero-stats');
  heroElements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.7s ease ${i * 0.12}s, transform 0.7s ease ${i * 0.12}s`;
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 100);
  });

  // Intersection Observer for section cards
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.step-card, .mp-card, .bulk-card, .gi-item').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.6s ease ${(i % 4) * 0.08}s, transform 0.6s ease ${(i % 4) * 0.08}s, border-color 0.25s ease, box-shadow 0.25s ease`;
    observer.observe(el);
  });
});


// ─── WALLET MODAL GLOBAL INJECTION ────────────
function injectWalletModal() {
  if (document.getElementById('walletGlobalModal')) return;
  const modalHTML = `
    <div class="modal-overlay" id="walletGlobalModal">
      <div class="modal" style="max-width:400px;text-align:center">
        <div class="modal-header" style="justify-content:center;position:relative">
          <h3 style="margin:0">Il tuo Wallet</h3>
          <button class="modal-close" style="position:absolute;right:0;top:-5px" onclick="document.getElementById('walletGlobalModal').classList.remove('open')">✕</button>
        </div>
        <div class="modal-body" style="padding-top:1rem">
          <div style="font-size:3rem;margin-bottom:10px">💳</div>
          <div style="font-size:0.9rem;color:var(--text-secondary)">Saldo Disponibile</div>
          <div style="font-weight:900;font-size:2.5rem;color:var(--green);margin-bottom:1.5rem" class="wallet-amount">€${(window.unwrapWallet || 0).toFixed(2)}</div>
          
          <div style="display:flex;flex-direction:column;gap:10px">
            <button class="btn btn-primary" style="justify-content:center;padding:12px" onclick="addFundsPrompt()">➕ Aggiungi Fondi</button>
            <button class="btn btn-outline" style="justify-content:center;padding:12px" onclick="withdrawPrompt()">💸 Preleva Liquidità (0% Comm.)</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openWalletModal() {
  injectWalletModal();
  document.getElementById('walletGlobalModal').classList.add('open');
}

function addFundsPrompt() {
  const amt = parseFloat(prompt('Quanto vuoi depositare? (€)'));
  if (amt && amt > 0) {
    window.unwrapWallet += amt;
    if(typeof updateWalletUI === 'function') updateWalletUI();
    showNotif('Fondi Aggiunti', `Hai ricaricato €${amt.toFixed(2)}`, 'success');
  }
}

function withdrawPrompt() {
  const amt = parseFloat(prompt(`Quanto vuoi prelevare? (Disponibile: €${window.unwrapWallet.toFixed(2)})`));
  if (amt && amt > 0) {
    if (amt > window.unwrapWallet) {
      showNotif('Errore', 'Fondi insufficienti', '');
      return;
    }
    window.unwrapWallet -= amt;
    if(typeof updateWalletUI === 'function') updateWalletUI();
    showNotif('Prelievo in Corso', `€${amt.toFixed(2)} inviati al tuo conto senza commissioni.`, 'success');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  injectWalletModal();
  document.querySelectorAll('.wallet-badge').forEach(btn => {
    btn.onclick = openWalletModal;
  });
});
