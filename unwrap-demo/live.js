/* =============================================
   UNWRAP — Live Opening JS v5
   Game Filtering per coerenza sbustamento
   ============================================= */

let isOpening = false;
let packCount = 0;
let currentPulls = [];
let currentGame = 'Pokémon TCG'; // Default

// ─── BOOKING MODAL ─────────────────────────
function openBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.add('open');
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.remove('open');
}

function confirmSlotSelection() {
  const day = document.getElementById('bookingDay').value;
  const time = document.getElementById('bookingTime').value;
  closeBookingModal();
  showNotif('📅 Sessione Prenotata!', `Il tuo slot è confermato per ${day} alle ${time}.`, 'success');
  
  // Per simulazione, avvia comunque la live così l'utente può provare
  setTimeout(startLiveSession, 800);
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
    <!-- Pulsante Chiudi -->
    <button style="position:absolute;top:8px;right:8px;background:rgba(255,255,255,0.1);border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-size:1.2rem;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;line-height:1" onclick="closeOpenResult()">×</button>
    <!-- Immagine carta: altezza adattiva al viewport -->
    <div style="height:clamp(160px,30vw,240px);background:${highlight.bg};border-radius:var(--radius);overflow:hidden;margin-bottom:0.75rem;position:relative;padding:0.75rem;display:flex;justify-content:center;align-items:center;margin-top:10px">
      <img src="${highlight.img}" style="max-height:100%;max-width:100%;object-fit:contain" onerror="this.style.display='none'" />
      <div style="position:absolute;bottom:8px;right:8px;padding:3px 8px;border-radius:4px;background:rgba(0,0,0,0.85);border:1px solid ${col};color:${col};font-size:0.65rem;font-weight:800">${rarityLabels[highlight.rarity]}</div>
    </div>
    <!-- Info carta -->
    <div class="result-name" style="font-size:clamp(1rem,4vw,1.3rem)">${highlight.name}</div>
    <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.3rem">${highlight.game}</div>
    <div class="result-value" style="margin-bottom:0.5rem;font-size:clamp(0.9rem,3.5vw,1.1rem)">Valore: <strong style="color:var(--green)">€${highlight.price.toFixed(2)}</strong></div>
    <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.75rem;line-height:1.4">Aggiunta al Vault con Proof of Pull 4K notarizzata.<br><em>Le carte comuni sono state aggiunte al Bulk.</em></div>
    <!-- Bottoni sempre visibili -->
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
      <button class="btn btn-primary" style="flex:1;min-width:130px;justify-content:center;font-size:0.78rem;padding:8px" onclick='openProofVideo(${JSON.stringify(highlight).replace(/"/g,'&quot;')})'>▶ Proof Video</button>
      <button class="btn btn-outline" style="flex:1;min-width:130px;justify-content:center;font-size:0.78rem;padding:8px;border-color:var(--gold);color:var(--gold)" onclick='instantSellLive(${JSON.stringify(highlight).replace(/"/g,'&quot;')})'>⚡ Vendi (€${(highlight.price * 0.85).toFixed(2)})</button>
    </div>
  `;

  openResult.style.display = 'block';
  document.querySelector('.live-stream').classList.add('has-result');
  setTimeout(() => openResult.classList.add('visible'), 50);

  currentPulls = [highlight, ...currentPulls];
  renderPullLog(currentPulls.slice(0, 14));

  // ── Salva nel Vault locale ──
  try {
    let pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
    let newCard = JSON.parse(JSON.stringify(highlight));
    newCard.id = 'pull_' + Date.now();
    newCard.isFresh = true; // per attivare Cash Offer
    newCard.owner = 'me';
    newCard.isListed = false;
    pulled.unshift(newCard);
    localStorage.setItem('unwrap_pulled_cards', JSON.stringify(pulled));
    
    // Aggiorniamo l'oggetto highlight corrente per passarlo alle altre funzioni (come instantSellLive)
    highlight.id = newCard.id;
  } catch(e) {}

  if(highlight.price > 20) {
    setTimeout(() => triggerCashOffer(highlight), 800);
  }

  setTimeout(() => {
    document.querySelector('.live-stream').classList.remove('has-result');
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
  
  // Rimuovi dal log
  currentPulls = currentPulls.filter(c => c.id !== cardObj.id);
  renderPullLog(currentPulls.slice(0, 14));
  
  // Rimuovi dal Vault locale (se era appena stata aggiunta)
  try {
    let pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
    const idx = pulled.findIndex(c => c.id === cardObj.id);
    if (idx !== -1) pulled.splice(idx, 1);
    localStorage.setItem('unwrap_pulled_cards', JSON.stringify(pulled));
  } catch(e) {}
  
  const cashWidget = document.getElementById('cashOfferWidget');
  if (cashWidget) cashWidget.style.display = 'none';
  
  document.getElementById('openResult').style.display = 'none';
  document.querySelector('.live-stream').classList.remove('has-result');
  
  showNotif('✅ Rivendita Istantanea', `Hai venduto la carta per €${offer.toFixed(2)}. Il saldo è stato aggiornato.`, 'success');
}

// ─── CASH OFFER ───────────────────────────────
let cashOfferTimer = null;
let currentCashOfferCardId = null;

function triggerCashOffer(card) {
  const offer = Math.round(card.price * 0.85); 
  const widget = document.getElementById('cashOfferWidget');
  if (!widget) return;
  if (cashOfferTimer) clearInterval(cashOfferTimer);
  document.getElementById('cashOfferCard').innerHTML = `<span style="font-weight:700">${card.name}</span>`;
  document.getElementById('cashOfferAmount').textContent = `€${offer}`;
  currentCashOfferCardId = card.id;
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
  
  // Rimuovi dal Vault locale
  if (currentCashOfferCardId) {
    try {
      let pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
      const idx = pulled.findIndex(c => c.id === currentCashOfferCardId);
      if (idx !== -1) pulled.splice(idx, 1);
      localStorage.setItem('unwrap_pulled_cards', JSON.stringify(pulled));
    } catch(e) {}
  }
  
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

