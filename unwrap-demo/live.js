/* =============================================
   UNWRAP — Live Opening JS v6 (Clean Rewrite)
   ============================================= */

let isOpening = false;
let packCount = 0;
let currentPulls = [];
let currentGame = 'Pokémon TCG';

// ─── BOOKING MODAL ─────────────────────────────────
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
  showNotif('Sessione Prenotata!', 'Slot confermato per ' + day + ' alle ' + time + '.', 'success');
  setTimeout(startLiveSession, 800);
}

// ─── START LIVE SESSION ────────────────────────────
function startLiveSession() {
  document.getElementById('bookingSection').style.display = 'none';
  document.getElementById('liveSection').style.display = 'block';
  showNotif('Live Avviata', 'Apertura prodotti di: ' + currentGame, 'success');
}

// ─── PULL LOG ──────────────────────────────────────
function renderPullLog(pulls) {
  const log = document.getElementById('pullLog');
  if (!log) return;
  if (pulls.length === 0) {
    log.innerHTML = '<div style="padding:1rem;text-align:center;color:var(--text-muted);font-size:0.85rem">Nessuna carta sbustata ancora.</div>';
    return;
  }
  log.innerHTML = pulls.map(function(card, i) {
    var clickHandler = card.rarity !== 'common'
      ? 'onclick=\'openProofVideo(' + JSON.stringify(card).replace(/'/g, '&apos;') + ')\''
      : '';
    return '<div class="pull-item pull-' + card.rarity + '" style="animation:resultAppear 0.35s ease ' + (i*0.04) + 's both;cursor:pointer" ' + clickHandler + '>' +
      '<div style="width:40px;height:56px;border-radius:4px;overflow:hidden;flex-shrink:0;background:' + card.bg + ';padding:2px">' +
        '<img src="' + card.img + '" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display=\'none\'" />' +
      '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div class="pull-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + card.name + '</div>' +
        '<div class="pull-grade">' + card.rarity.toUpperCase() + (card.rarity !== 'common' ? ' · Proof' : ' (Bulk)') + '</div>' +
      '</div>' +
      (card.price ? '<div class="pull-value">€' + card.price.toFixed(2) + '</div>' : '') +
    '</div>';
  }).join('');
}

// ─── OPEN PACK (MAIN) ──────────────────────────────
async function openPack() {
  if (isOpening) return;
  isOpening = true;
  packCount++;

  var packVisual = document.getElementById('packVisual');
  var openBtn    = document.getElementById('openBtn');
  var openResult = document.getElementById('openResult');
  var resultCard = document.getElementById('resultCard');
  var cashWidget = document.getElementById('cashOfferWidget');
  if (cashWidget) cashWidget.style.display = 'none';
  openResult.classList.remove('visible');
  openResult.style.display = 'none';

  packVisual.classList.add('opening');
  packVisual.style.pointerEvents = 'none';
  openBtn.disabled = true;
  openBtn.textContent = 'Strappo pacchetto...';

  var gameCards = CARD_DB.filter(function(c) {
    return c.game === currentGame && (c.rarity === 'secret' || c.rarity === 'ultra');
  });
  var fallbackCards = CARD_DB.filter(function(c) {
    return c.rarity === 'secret' || c.rarity === 'ultra';
  });
  var pool = gameCards.length > 0 ? gameCards : fallbackCards;
  var highlight = pool[Math.floor(Math.random() * pool.length)];

  var gameCommons = COMMON_CARDS.filter(function(c) { return c.game === currentGame; });
  var commonPool  = gameCommons.length > 0 ? gameCommons : COMMON_CARDS;

  await new Promise(function(r) { setTimeout(r, 1500); });
  packVisual.classList.remove('opening');

  var sequenceLength = 4;
  for (var i = 0; i < sequenceLength; i++) {
    var commonCard = commonPool[Math.floor(Math.random() * commonPool.length)];
    packVisual.style.fontSize = '3rem';
    packVisual.innerHTML = '<img src="' + commonCard.img + '" style="height:100px;object-fit:contain">';
    packVisual.style.background = commonCard.bg;
    packVisual.style.boxShadow  = 'none';
    openBtn.textContent = 'Carta ' + (i+1) + '/' + (sequenceLength+1) + ' (Comune)';
    currentPulls = [commonCard].concat(currentPulls);
    renderPullLog(currentPulls.slice(0, 14));
    await new Promise(function(r) { setTimeout(r, 800); });
  }

  // Aggiorna Bulk in localStorage
  try {
    var bulk = JSON.parse(localStorage.getItem('unwrap_bulk') || '{"count":415,"weight":747}');
    bulk.count  += sequenceLength;
    bulk.weight  = Math.round(bulk.count * 1.8);
    bulk.value   = (bulk.weight * 0.01).toFixed(2);
    localStorage.setItem('unwrap_bulk', JSON.stringify(bulk));
  } catch(e) {}

  // RIVELAZIONE HIT
  openBtn.textContent = 'RIVELAZIONE HIT!';
  packVisual.innerHTML = '<img src="' + highlight.img + '" style="height:120px;object-fit:contain;filter:drop-shadow(0 0 20px rgba(255,215,0,0.8))">';
  packVisual.style.background = highlight.bg;
  packVisual.style.boxShadow  = '0 0 40px rgba(124,58,237,0.7)';

  var rarityLabels = { secret: 'SECRET RARE', ultra: 'ULTRA RARE', rare: 'RARE', common: 'COMMON' };
  var rarityColors = { secret: '#ef4444', ultra: '#f59e0b', rare: '#a855f7', common: '#6060a0' };
  var col = rarityColors[highlight.rarity];

  // Salva in localStorage prima di costruire i bottoni (serve l'id aggiornato)
  try {
    var pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
    var newCard = JSON.parse(JSON.stringify(highlight));
    newCard.id      = 'pull_' + Date.now();
    newCard.isFresh = true;
    newCard.owner   = 'me';
    newCard.isListed = false;
    pulled.unshift(newCard);
    localStorage.setItem('unwrap_pulled_cards', JSON.stringify(pulled));
    highlight.id = newCard.id;
  } catch(e) {}

  var highlightJson = JSON.stringify(highlight).replace(/"/g, '&quot;');

  resultCard.innerHTML =
    '<button style="position:absolute;top:8px;right:8px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;width:32px;height:32px;border-radius:50%;font-size:1.4rem;cursor:pointer;z-index:20;display:flex;align-items:center;justify-content:center;line-height:1" onclick="closeOpenResult()">×</button>' +
    '<div class="card-img-container" style="background:' + highlight.bg + '">' +
      '<img src="' + highlight.img + '" onerror="this.style.display=\'none\'" />' +
      '<div style="position:absolute;bottom:8px;right:8px;padding:3px 8px;border-radius:4px;background:rgba(0,0,0,0.85);border:1px solid ' + col + ';color:' + col + ';font-size:0.65rem;font-weight:800">' + rarityLabels[highlight.rarity] + '</div>' +
    '</div>' +
    '<div class="result-name" style="font-size:clamp(1rem,4vw,1.3rem)">' + highlight.name + '</div>' +
    '<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.3rem">' + highlight.game + '</div>' +
    '<div class="result-value" style="margin-bottom:0.5rem">Valore: <strong style="color:var(--green)">€' + highlight.price.toFixed(2) + '</strong></div>' +
    '<div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.75rem;line-height:1.4">Aggiunta al Vault con Proof of Pull 4K notarizzata.<br><em>Le carte comuni sono state aggiunte al Bulk.</em></div>' +
    '<div style="display:flex;gap:0.5rem;flex-wrap:wrap">' +
      '<button class="btn btn-primary" style="flex:1;min-width:130px;justify-content:center;font-size:0.78rem;padding:8px" onclick="openProofVideo(' + highlightJson + ')">▶ Proof Video</button>' +
      '<button class="btn btn-outline" style="flex:1;min-width:130px;justify-content:center;font-size:0.78rem;padding:8px;border-color:var(--gold);color:var(--gold)" onclick="instantSellLive(' + highlightJson + ')">⚡ Vendi (€' + (highlight.price * 0.85).toFixed(2) + ')</button>' +
    '</div>';

  openResult.style.display = 'block';
  document.querySelector('.live-stream').classList.add('has-result');
  setTimeout(function() { openResult.classList.add('visible'); }, 50);

  currentPulls = [highlight].concat(currentPulls);
  renderPullLog(currentPulls.slice(0, 14));

  if (highlight.price > 20) {
    setTimeout(function() { triggerCashOffer(highlight); }, 800);
  }
}

// ─── INSTANT SELL ──────────────────────────────────
function instantSellLive(cardObj) {
  var offer = Math.round(cardObj.price * 0.85);
  window.unwrapWallet = (window.unwrapWallet || 0) + parseFloat(offer);
  if (typeof updateWalletUI === 'function') updateWalletUI();

  currentPulls = currentPulls.filter(function(c) { return c.id !== cardObj.id; });
  renderPullLog(currentPulls.slice(0, 14));

  try {
    var pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
    var idx = pulled.findIndex(function(c) { return c.id === cardObj.id; });
    if (idx !== -1) pulled.splice(idx, 1);
    localStorage.setItem('unwrap_pulled_cards', JSON.stringify(pulled));
  } catch(e) {}

  closeOpenResult();
  showNotif('Vendita Istantanea', 'Hai venduto la carta per €' + offer.toFixed(2) + '.', 'success');
}

// ─── CLOSE RESULT ──────────────────────────────────
function closeOpenResult() {
  document.getElementById('openResult').style.display = 'none';
  document.querySelector('.live-stream').classList.remove('has-result');
  var cashWidget = document.getElementById('cashOfferWidget');
  if (cashWidget) cashWidget.style.display = 'none';

  var packVisual = document.getElementById('packVisual');
  packVisual.innerHTML = '📦';
  packVisual.style.fontSize = '2rem';
  packVisual.style.background = 'linear-gradient(135deg, #1e3a5f, #7c3aed)';
  packVisual.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
  packVisual.style.pointerEvents = 'auto';

  var openBtn = document.getElementById('openBtn');
  openBtn.disabled = false;
  openBtn.textContent = '▶ Apri Prossimo Pack';
  isOpening = false;
}

// ─── CASH OFFER ────────────────────────────────────
var cashOfferTimer = null;
var currentCashOfferCardId = null;

function triggerCashOffer(card) {
  var offer  = Math.round(card.price * 0.85);
  var widget = document.getElementById('cashOfferWidget');
  if (!widget) return;
  if (cashOfferTimer) clearInterval(cashOfferTimer);
  document.getElementById('cashOfferCard').innerHTML = '<span style="font-weight:700">' + card.name + '</span>';
  document.getElementById('cashOfferAmount').textContent = '€' + offer;
  currentCashOfferCardId = card.id;
  widget.style.display = 'block';

  var secs = 172800;
  cashOfferTimer = setInterval(function() {
    var h = Math.floor(secs / 3600);
    var m = Math.floor((secs % 3600) / 60);
    var s = secs % 60;
    var tel = document.getElementById('cashOfferTimer');
    if (tel) tel.textContent = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    if (secs <= 0) { clearInterval(cashOfferTimer); widget.style.display = 'none'; }
    secs--;
  }, 1000);
}

function acceptCashOffer() {
  if (cashOfferTimer) clearInterval(cashOfferTimer);
  document.getElementById('cashOfferWidget').style.display = 'none';
  var amountStr = document.getElementById('cashOfferAmount').textContent.replace('€','');
  window.unwrapWallet = (window.unwrapWallet || 0) + parseInt(amountStr);
  if (typeof updateWalletUI === 'function') updateWalletUI();

  if (currentCashOfferCardId) {
    try {
      var pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
      var idx = pulled.findIndex(function(c) { return c.id === currentCashOfferCardId; });
      if (idx !== -1) pulled.splice(idx, 1);
      localStorage.setItem('unwrap_pulled_cards', JSON.stringify(pulled));
    } catch(e) {}
  }
  showNotif('Cash Offer Accettata!', 'Il credito è stato aggiunto al tuo Wallet istantaneamente.', 'success');
}

function declineCashOffer() {
  if (cashOfferTimer) clearInterval(cashOfferTimer);
  document.getElementById('cashOfferWidget').style.display = 'none';
  showNotif('Offerta Declinata', 'La carta è al sicuro nel tuo Vault assieme al bulk.', '');
}

// ─── INIT ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
  if (typeof updateWalletUI === 'function') updateWalletUI();
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('game')) currentGame = urlParams.get('game');
  if (urlParams.get('packReady') === 'true') startLiveSession();
});

