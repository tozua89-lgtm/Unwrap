/* =============================================
   UNWRAP — Live Opening JS v5
   Game Filtering per coerenza sbustamento
   ============================================= */

let isOpening = false;
let packCount = 0;
let currentPulls = [];
let currentGame = 'Pokémon TCG'; // Default

function confirmBooking() {
  showNotif('📅 Prenotazione Confermata!', 'Email di conferma inviata.', 'success');
}

function startLiveSession() {
  document.getElementById('bookingSection').style.display = 'none';
  document.getElementById('liveSection').style.display = 'block';
  showNotif('🔴 Live Avviata', `Apertura prodotti di: ${currentGame}`, 'success');
}

function renderPullLog(pulls) {
  const log = document.getElementById('pullLog');
  if (!log) return;
  if (pulls.length === 0) {
    log.innerHTML = `<div style="padding:1rem;text-align:center;color:var(--text-muted);font-size:0.85rem">Nessuna carta sbustata ancora.</div>`;
    return;
  }
  log.innerHTML = pulls.map((card, i) => `
    <div class="pull-item pull-${card.rarity}" style="animation:resultAppear 0.35s ease ${i*0.04}s both;cursor:pointer" onclick='${card.rarity!=='common' ? `openProofVideo(${JSON.stringify(card).replace(/"/g,'&quot;')})` : ''}'>
      <div style="width:40px;height:56px;border-radius:4px;overflow:hidden;flex-shrink:0;background:${card.bg};padding:2px">
        <img src="${card.img}" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none';" />
      </div>
      <div style="flex:1;min-width:0">
        <div class="pull-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${card.name}</div>
        <div class="pull-grade">${card.rarity.toUpperCase()} ${card.rarity!=='common' ? '· ▶ Proof' : '(Bulk)'}</div>
      </div>
      ${card.price ? `<div class="pull-value">€${card.price.toFixed(2)}</div>` : ''}
    </div>
  `).join('');
}

async function openPack() {
  if (isOpening) return;
  isOpening = true;
  packCount++;

  const packVisual = document.getElementById('packVisual');
  const openBtn = document.getElementById('openBtn');
  const openResult = document.getElementById('openResult');
  const resultCard = document.getElementById('resultCard');
  const cashWidget = document.getElementById('cashOfferWidget');
  if (cashWidget) cashWidget.style.display = 'none';
  openResult.classList.remove('visible');
  openResult.style.display = 'none';

  packVisual.classList.add('opening');
  packVisual.style.pointerEvents = 'none';
  openBtn.disabled = true;
  openBtn.textContent = '⏳ Strappo pacchetto...';

  // Seleziona dal database SOLO le carte corrispondenti al gioco comprato
  const gameCards = CARD_DB.filter(c => c.game === currentGame && (c.rarity === 'secret' || c.rarity === 'ultra'));
  const fallbackCards = CARD_DB.filter(c => c.rarity === 'secret' || c.rarity === 'ultra');
  const pool = gameCards.length > 0 ? gameCards : fallbackCards;
  const highlight = pool[Math.floor(Math.random() * pool.length)];

  // Filtra carte comuni per lo stesso gioco
  const gameCommons = COMMON_CARDS.filter(c => c.game === currentGame);
  const commonPool = gameCommons.length > 0 ? gameCommons : COMMON_CARDS;

  await new Promise(r => setTimeout(r, 1500));
  packVisual.classList.remove('opening');

  const sequenceLength = 4;
  for(let i=0; i<sequenceLength; i++) {
    const commonCard = commonPool[Math.floor(Math.random() * commonPool.length)];
    packVisual.style.fontSize = '3rem';
    packVisual.innerHTML = `<img src="${commonCard.img}" style="height:100px;object-fit:contain;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5))">`;
    packVisual.style.background = commonCard.bg;
    packVisual.style.boxShadow = 'none';
    openBtn.textContent = `🃏 Carta ${i+1}/${sequenceLength+1} (Comune)`;
    
    currentPulls = [commonCard, ...currentPulls];
    renderPullLog(currentPulls.slice(0, 14));
    await new Promise(r => setTimeout(r, 800));
  }

  // ── Aggiorna contatore Bulk nel localStorage ──
  const CARD_WEIGHT_G = 1.8; // grammi per carta
  const PRICE_PER_G  = 0.01;
  try {
    let bulk = JSON.parse(localStorage.getItem('unwrap_bulk') || '{"count":415,"weight":747}');
    bulk.count  += sequenceLength;
    bulk.weight  = Math.round(bulk.count * CARD_WEIGHT_G);
    bulk.value   = (bulk.weight * PRICE_PER_G).toFixed(2);
    localStorage.setItem('unwrap_bulk', JSON.stringify(bulk));
  } catch(e) {}

  // RIVELAZIONE DELLA HIT
  openBtn.textContent = `✨ RIVELAZIONE HIT!`;
  packVisual.innerHTML = `<img src="${highlight.img}" style="height:120px;object-fit:contain;filter:drop-shadow(0 0 20px rgba(255,215,0,0.8))">`;
  packVisual.style.background = highlight.bg;
  packVisual.style.boxShadow = `0 0 40px rgba(124,58,237,0.7)`;

  const rarityLabels = { secret: '🏆 SECRET RARE', ultra: '💎 ULTRA RARE', rare: '⭐ RARE', common: '📄 COMMON' };
  const rarityColors = { secret: '#ef4444', ultra: '#f59e0b', rare: '#a855f7', common: '#6060a0' };
  const col = rarityColors[highlight.rarity];

  resultCard.innerHTML = `
    <div style="height:250px;background:${highlight.bg};border-radius:var(--radius);overflow:hidden;margin-bottom:1rem;position:relative;padding:1rem;display:flex;justify-content:center">
      <img src="${highlight.img}" style="height:100%;object-fit:contain" onerror="this.style.display='none'" />
      <div style="position:absolute;top:8px;right:8px;padding:3px 8px;border-radius:4px;background:rgba(0,0,0,0.8);border:1px solid ${col};color:${col};font-size:0.65rem;font-weight:800">${rarityLabels[highlight.rarity]}</div>
    </div>
    <div class="result-name">${highlight.name}</div>
    <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.5rem">${highlight.game}</div>
    <div class="result-value" style="margin-bottom:0.75rem">Valore mercato stimato: <strong>€${highlight.price.toFixed(2)}</strong></div>
    <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:1rem">Aggiunta al Vault con Proof of Pull 4K notarizzata in blockchain.<br><em>Le carte comuni sono state aggiunte alla sezione Bulk del Vault.</em></div>
    <div style="display:flex;gap:0.5rem">
      <button class="btn btn-primary" style="flex:1;justify-content:center;font-size:0.8rem;padding:6px" onclick='openProofVideo(${JSON.stringify(highlight).replace(/"/g,'&quot;')})'>▶ Guarda Proof Video</button>
      <button class="btn btn-outline" style="flex:1;justify-content:center;font-size:0.8rem;padding:6px;border-color:var(--gold);color:var(--gold)" onclick='instantSellLive(${JSON.stringify(highlight).replace(/"/g,'&quot;')})'>⚡ Vendi a Unwrap (€${(highlight.price * 0.85).toFixed(2)})</button>
    </div>
  `;

  openResult.style.display = 'block';
  setTimeout(() => openResult.classList.add('visible'), 50);

  currentPulls = [highlight, ...currentPulls];
  renderPullLog(currentPulls.slice(0, 14));

  if(highlight.price > 20) {
    setTimeout(() => triggerCashOffer(highlight), 800);
  }

  setTimeout(() => {
    packVisual.innerHTML = '📦';
    packVisual.style.fontSize = '2rem';
    packVisual.style.background = 'linear-gradient(135deg, #1e3a5f, #7c3aed)';
    packVisual.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
    packVisual.style.pointerEvents = 'auto';
    openBtn.disabled = false;
    openBtn.textContent = `▶ Apri Prossimo Pack`;
    isOpening = false;
  }, 5000);
}

// ─── INSTANT SELL ─────────────────────────────────
function instantSellLive(cardObj) {
  const offer = Math.round(cardObj.price * 0.85);
  window.unwrapWallet += parseFloat(offer);
  if(typeof updateWalletUI === 'function') updateWalletUI();
  
  // Rimuovi dal log e nascondi widget
  currentPulls = currentPulls.filter(c => c.id !== cardObj.id);
  renderPullLog(currentPulls.slice(0, 14));
  
  const cashWidget = document.getElementById('cashOfferWidget');
  if (cashWidget) cashWidget.style.display = 'none';
  
  document.getElementById('openResult').style.display = 'none';
  
  showNotif('✅ Rivendita Istantanea', `Hai venduto la carta per €${offer.toFixed(2)}. Il saldo è stato aggiornato.`, 'success');
}

// ─── CASH OFFER ───────────────────────────────
let cashOfferTimer = null;
function triggerCashOffer(card) {
  const offer = Math.round(card.price * 0.85); 
  const widget = document.getElementById('cashOfferWidget');
  if (!widget) return;
  if (cashOfferTimer) clearInterval(cashOfferTimer);
  document.getElementById('cashOfferCard').innerHTML = `<span style="font-weight:700">${card.name}</span>`;
  document.getElementById('cashOfferAmount').textContent = `€${offer}`;
  widget.style.display = 'block';

  let secs = 172800;
  cashOfferTimer = setInterval(() => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const tel = document.getElementById('cashOfferTimer');
    if(tel) tel.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if (secs <= 0) { clearInterval(cashOfferTimer); widget.style.display = 'none'; }
    secs--;
  }, 1000);
}

function acceptCashOffer() {
  if (cashOfferTimer) clearInterval(cashOfferTimer);
  document.getElementById('cashOfferWidget').style.display = 'none';
  window.unwrapWallet += parseInt(document.getElementById('cashOfferAmount').textContent.replace('€',''));
  updateWalletUI();
  showNotif('✅ Cash Offer Accettata!', 'Il credito è stato aggiunto al tuo Wallet istantaneamente.', 'success');
}

function declineCashOffer() {
  if (cashOfferTimer) clearInterval(cashOfferTimer);
  document.getElementById('cashOfferWidget').style.display = 'none';
  showNotif('Offerta Declinata', 'La carta è al sicuro nel tuo Vault assieme al bulk.', '');
}

window.addEventListener('DOMContentLoaded', () => {
  if (typeof updateWalletUI === 'function') updateWalletUI();
  
  const urlParams = new URLSearchParams(window.location.search);
  if(urlParams.get('game')) {
    currentGame = urlParams.get('game');
  }
  
  if(urlParams.get('packReady') === 'true') {
    startLiveSession();
  }
});
