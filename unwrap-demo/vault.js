/* =============================================
   UNWRAP - Vault JS v10 (Clean Rewrite)
   ============================================= */

// ─── UTILITY ──────────────────────────────────────────────────────────────────
function formatWeight(w) {
  if (w >= 1000) return (w / 1000).toFixed(1) + 'kg';
  return w + 'g';
}

// ─── BULK SYNC ────────────────────────────────────────────────────────────────
function syncBulk() {
  try {
    const PRICE_PER_G = 0.01;
    const bulk   = JSON.parse(localStorage.getItem('unwrap_bulk') || '{"count":415,"weight":747}');
    const count  = bulk.count;
    const weight = bulk.weight;
    const value  = (weight * PRICE_PER_G).toFixed(2);

    const elCount  = document.getElementById('statBulk');
    const elWeight = document.getElementById('statBulkWeight');
    if (elCount)  elCount.textContent  = count;
    if (elWeight) elWeight.textContent = formatWeight(weight);

    const elTitle = document.getElementById('bulkTitle');
    if (elTitle) {
      elTitle.innerHTML = 'Il Tuo Bulk: ' + count + ' Carte (' + formatWeight(weight) + ') '
        + '<span style="font-size:1rem;font-weight:400;color:var(--text-muted)">'
        + '(Valutazione attuale: &euro;0.01 / grammo)</span>';
    }

    const elSellVal = document.getElementById('bulkSellValue');
    if (elSellVal) elSellVal.textContent = '\u20AC' + value;
  } catch(e) { console.error('syncBulk error', e); }
}

// ─── INCOMING OFFERS ──────────────────────────────────────────────────────────
const INCOMING_OFFERS = [
  { id: 1, cardId: 3,  cardName: 'Umbreon VMAX (Alt Art)',  offer: 780.00, buyer: 'UmbreonCollector' },
  { id: 2, cardId: 6,  cardName: 'Charizard Holo (1999)',   offer: 420.00, buyer: 'NostalgicTrader'  },
  { id: 3, cardId: 22, cardName: 'Portgas D. Ace (SR)',      offer:  68.00, buyer: 'OnePieceFan_IT'   }
];

// ─── SWAP BOARD ───────────────────────────────────────────────────────────────
const SWAP_BOARD = [
  { id: 'sb1', ...OTHER_VAULTS[0].cards[0], owner: OTHER_VAULTS[0].user, seeking: 'Lugia VSTAR' },
  { id: 'sb2', ...OTHER_VAULTS[1].cards[0], owner: OTHER_VAULTS[1].user, seeking: 'Charizard Holo' }
];

// ─── TAB NAVIGATION ───────────────────────────────────────────────────────────
function setVaultTab(tab) {
  ['cards', 'bulk', 'offers', 'swapboard'].forEach(function(t) {
    var tabEl  = document.getElementById('tab-' + t);
    var panelEl = document.getElementById('panel-' + t);
    if (tabEl)  tabEl.classList.toggle('active', tab === t);
    if (panelEl) panelEl.style.display = tab === t ? 'block' : 'none';
  });
  if (tab === 'offers')    renderOffers();
  if (tab === 'swapboard') renderSwapBoard();
  if (tab === 'bulk')      syncBulk();
}

// ─── CARDS GRID ───────────────────────────────────────────────────────────────
var activeFilter = 'all';

function getVaultCards() {
  var base = CARD_DB.filter(function(c) { return c.owner === 'me'; });
  try {
    var pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
    // merge without duplicates
    pulled.forEach(function(p) {
      if (!base.find(function(b) { return String(b.id) === String(p.id); })) {
        base.unshift(p);
      }
    });
  } catch(e) {}
  return base;
}

function renderCards(cards) {
  var grid = document.getElementById('cardsGrid');
  if (!grid) return;

  if (!cards || cards.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)">Nessuna carta trovata</div>';
    return;
  }

  grid.innerHTML = cards.map(function(card) {
    var listedBadge = card.isListed
      ? '<div style="position:absolute;top:4px;left:4px;background:var(--green);color:#000;font-size:0.55rem;font-weight:800;padding:2px 6px;border-radius:4px">IN VENDITA</div>'
      : '';
    var img = card.img
      ? '<img src="' + card.img + '" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display=\'none\'">'
      : '<span style="font-size:3rem">' + (card.emoji || '🃏') + '</span>';

    return '<div class="card-item" onclick="openCardDetail(\'' + card.id + '\')">'
      + '  <div class="card-item-img" style="background:' + (card.bg || card.color || '#1a1a2e') + ';position:relative">'
      + '    ' + img
      + '    <div class="card-item-rarity rarity-' + card.rarity + '">' + card.rarity.toUpperCase() + '</div>'
      + (card.proof ? '<div class="proof-badge">🎥 PROOF</div>' : '')
      + listedBadge
      + '  </div>'
      + '  <div class="card-item-info">'
      + '    <div class="card-item-name">' + card.name + '</div>'
      + '    <div class="card-item-set">' + (card.set || '') + (card.number ? ' #' + card.number : '') + '</div>'
      + '    <div class="card-item-footer">'
      + '      <div class="card-item-price">&euro;' + (card.price || 0) + '</div>'
      + (card.grade ? '<div class="card-item-grade">💎 ' + card.grade + '</div>' : '')
      + '    </div>'
      + '    <div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap">'
      + '      <button class="btn btn-primary" style="flex:1;justify-content:center;font-size:0.7rem;padding:6px 8px" onclick="event.stopPropagation();openSellCardModal(\'' + card.id + '\')">'
      + (card.isListed ? '🚫 Ritira' : '🏷️ Vendi / Scambia')
      + '      </button>'
      + '    </div>'
      + '  </div>'
      + '</div>';
  }).join('');

  document.getElementById('statCards').textContent = cards.length;
}

function filterCards() {
  var q = (document.getElementById('searchInput') && document.getElementById('searchInput').value || '').toLowerCase();
  var cards = getVaultCards();
  var filtered = cards.filter(function(c) {
    var matchQ = !q || c.name.toLowerCase().includes(q) || (c.set || '').toLowerCase().includes(q) || (c.rarity || '').toLowerCase().includes(q);
    return matchQ;
  });
  if (activeFilter === 'rare')   filtered = filtered.filter(function(c) { return c.rarity === 'rare' || c.rarity === 'ultra' || c.rarity === 'secret'; });
  if (activeFilter === 'graded') filtered = filtered.filter(function(c) { return c.grade; });
  renderCards(filtered);
}

function setFilter(filter, btn) {
  activeFilter = filter;
  document.querySelectorAll('#filterTabs .filter-tab').forEach(function(t) { t.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  filterCards();
}

// ─── CARD DETAIL MODAL ────────────────────────────────────────────────────────
var vaultCards = [];

function openCardDetail(id) {
  vaultCards = getVaultCards();
  var card = vaultCards.find(function(c) { return String(c.id) === String(id); });
  if (!card) return;

  var modalTitle = document.getElementById('cardDetailTitle');
  var modalBody  = document.getElementById('cardDetailBody');
  if (modalTitle) modalTitle.textContent = card.name;
  if (modalBody) {
    var imgHTML = card.img
      ? '<img src="' + card.img + '" style="height:100%;object-fit:contain" onerror="this.style.display=\'none\'">'
      : '<span style="font-size:5rem">' + (card.emoji || '🃏') + '</span>';

    modalBody.innerHTML = ''
      + '<div style="background:' + (card.bg || card.color || '#1a1a2e') + ';border-radius:var(--radius);height:200px;display:flex;align-items:center;justify-content:center;margin-bottom:1rem;overflow:hidden;padding:8px">'
      + imgHTML
      + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1.5rem">'
      + '<div class="vs-row"><span>Set</span><span>' + (card.set || '-') + '</span></div>'
      + '<div class="vs-row"><span>Rarit&agrave;</span><span class="card-item-rarity rarity-' + card.rarity + '">' + card.rarity.toUpperCase() + '</span></div>'
      + '<div class="vs-row"><span>Proof of Pull</span><span style="color:var(--accent-light)">🎥 4K Registrata</span></div>'
      + '<div class="vs-row"><span>Valore Stimato</span><span style="color:var(--green);font-weight:700">&euro;' + (card.price || 0) + '</span></div>'
      + (card.grade ? '<div class="vs-row"><span>Grading AI</span><span style="color:var(--gold);font-weight:800">💎 ' + card.grade + '</span></div>' : '')
      + '</div>'
      + '<div style="display:flex;gap:0.5rem;flex-wrap:wrap">'
      + '<button class="btn btn-primary" style="flex:1;min-width:45%;justify-content:center" onclick="showNotif(\'Proof of Pull\',\'Apertura video 4K in corso...\',\'\');document.getElementById(\'cardDetailModal\').classList.remove(\'open\')">🎥 Guarda Proof</button>'
      + '<button class="btn btn-outline" style="flex:1;min-width:45%;justify-content:center" onclick="document.getElementById(\'cardDetailModal\').classList.remove(\'open\');openSellCardModal(\'' + card.id + '\')">🏷️ Vendi / Scambia</button>'
      + '<button class="btn btn-outline" style="flex:1;min-width:45%;justify-content:center;color:var(--gold);border-color:var(--gold)" onclick="document.getElementById(\'cardDetailModal\').classList.remove(\'open\');openCashOfferModal(\'' + card.id + '\')">💸 Vendi a Unwrap (Cash ' + ((card.price||0)*0.85).toFixed(2) + '€)</button>'
      + (!card.grade ? '<button class="btn btn-gold" style="flex:1;min-width:45%;justify-content:center" onclick="showNotif(\'Grading richiesto!\',\'Analisi AI avviata\',\'success\');document.getElementById(\'cardDetailModal\').classList.remove(\'open\')">💎 Grading</button>' : '')
      + '</div>';
  }

  var modal = document.getElementById('cardDetailModal');
  if (modal) modal.classList.add('open');
}

// ─── SELL CARD MODAL ──────────────────────────────────────────────────────────
// --- SELL CARD MODAL ---
function openSellCardModal(id) {
  vaultCards = getVaultCards();
  var card = vaultCards.find(function(c) { return String(c.id) === String(id); });
  if (!card) return;

  if (card.isListed) { delistCard(id); return; }

  window._selectedListingTypes = ['sale'];
  window._listingCardId = id;

  var imgHTML = card.img ? '<img src="' + card.img + '" style="width:100%;height:100%;object-fit:contain">' : '<span>' + (card.emoji || String.fromCodePoint(0x1F0CF)) + '</span>';
  var cardBg  = card.bg || card.color || '#1a1a2e';
  var cardSet = card.set || '';
  var cardPrice = card.price || 0;

  var body = document.getElementById('sellModalBody');
  if (!body) return;
  body.innerHTML = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:1.5rem">'
    + '<div style="width:50px;height:70px;background:' + cardBg + ';border-radius:4px;overflow:hidden;display:flex;align-items:center;justify-content:center">' + imgHTML + '</div>'
    + '<div><div style="font-weight:700">' + card.name + '</div><div style="font-size:0.8rem;color:var(--text-muted)">' + cardSet + '</div></div>'
    + '</div>'
    + '<div style="margin-bottom:1.2rem">'
    + '<label style="font-size:0.85rem;color:var(--text-muted);display:block;margin-bottom:8px">Opzioni di inserzione (seleziona una o pi&ugrave;)</label>'
    + '<div style="display:flex;flex-direction:column;gap:6px;" id="ltypeBtns">'
    + '<button id="ltype-sale"  class="btn btn-primary" style="justify-content:center;font-size:0.85rem" onclick="toggleListingType(\'sale\')">💰 Solo Vendita</button>'
    + '<button id="ltype-trade" class="btn btn-outline" style="justify-content:center;font-size:0.85rem" onclick="toggleListingType(\'trade\')">🔄 Solo Scambio</button>'
    + '<button id="ltype-mixed" class="btn btn-outline" style="justify-content:center;font-size:0.85rem" onclick="toggleListingType(\'mixed\')">🤝 Scambio + Conguaglio</button>'
    + '</div></div>'
    + '<div id="priceInputDiv" style="margin-bottom:1rem">'
    + '<label style="font-size:0.85rem;color:var(--text-muted);display:block;margin-bottom:6px">Prezzo (€)</label>'
    + '<input type="number" id="sellPriceInput" value="' + cardPrice + '" min="1" step="0.50" style="width:100%;padding:10px;background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:8px;color:#fff;font-size:1.1rem">'
    + '</div>'
    + '<div id="seekingInputDiv" style="margin-bottom:1rem;display:none">'
    + '<label style="font-size:0.85rem;color:var(--text-muted);display:block;margin-bottom:6px">Cosa cerchi? (facoltativo)</label>'
    + '<input type="text" id="sellSeekingInput" placeholder="es. Charizard ex, Pikachu VMAX..." style="width:100%;padding:10px;background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:8px;color:#fff">'
    + '</div>'
    + '<div style="background:rgba(245,158,11,0.1);border:1px solid var(--gold);border-radius:8px;padding:10px;font-size:0.8rem;color:var(--text-secondary);margin-bottom:1rem">'
    + 'Unwrap trattiene il <strong>5%</strong> sulle transazioni monetarie tra privati.'
    + '</div>'
    + '<div style="display:flex;gap:8px">'
    + '<button class="btn btn-outline" style="flex:1;justify-content:center" onclick="document.getElementById(\'sellModal\').classList.remove(\'open\')">Annulla</button>'
    + '<button class="btn btn-primary" style="flex:1;justify-content:center" onclick="confirmListCard()">Inserisci</button>'
    + '</div>';

  document.getElementById('sellModal').classList.add('open');
}

function toggleListingType(type) {
  if (!window._selectedListingTypes) window._selectedListingTypes = ['sale'];
  
  var idx = window._selectedListingTypes.indexOf(type);
  if (idx > -1) {
    // Prevent unselecting the last option
    if (window._selectedListingTypes.length > 1) {
      window._selectedListingTypes.splice(idx, 1);
    }
  } else {
    window._selectedListingTypes.push(type);
  }

  ['sale','trade','mixed'].forEach(function(t) {
    var b = document.getElementById('ltype-' + t);
    if (b) b.className = window._selectedListingTypes.includes(t) ? 'btn btn-primary' : 'btn btn-outline';
  });

  var hasSale = window._selectedListingTypes.includes('sale') || window._selectedListingTypes.includes('mixed');
  var hasTrade = window._selectedListingTypes.includes('trade') || window._selectedListingTypes.includes('mixed');

  var pd = document.getElementById('priceInputDiv');
  var sd = document.getElementById('seekingInputDiv');
  if (pd) pd.style.display = hasSale ? 'block' : 'none';
  if (sd) sd.style.display = hasTrade ? 'block' : 'none';
}

function confirmListCard() {
  var id = window._listingCardId;
  if (!window._selectedListingTypes) window._selectedListingTypes = ['sale'];
  var hasSale = window._selectedListingTypes.includes('sale') || window._selectedListingTypes.includes('mixed');
  var hasTrade = window._selectedListingTypes.includes('trade') || window._selectedListingTypes.includes('mixed');
  
  var ltype = 'sale';
  if (hasSale && hasTrade) ltype = 'mixed';
  else if (hasTrade) ltype = 'trade';

  var price = parseFloat(document.getElementById('sellPriceInput') ? document.getElementById('sellPriceInput').value : 0) || 0;
  var seeking = document.getElementById('sellSeekingInput') ? document.getElementById('sellSeekingInput').value : '';

  if (hasSale && price <= 0) { showNotif('Errore', 'Inserisci un prezzo valido.', ''); return; }

  try {
    var listings = JSON.parse(localStorage.getItem('unwrap_my_listings') || '[]');
    listings = listings.filter(function(l) { return String(l.id) !== String(id); });
    vaultCards = getVaultCards();
    var card = vaultCards.find(function(c) { return String(c.id) === String(id); });
    if (card) {
      listings.push(Object.assign({}, card, { isListed: true, price: price, seller: 'me', listingType: ltype, seeking: seeking, proof: true }));
    }
    localStorage.setItem('unwrap_my_listings', JSON.stringify(listings));
    var pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
    var idx = pulled.findIndex(function(c) { return String(c.id) === String(id); });
    if (idx !== -1) { pulled[idx].isListed = true; pulled[idx].price = price; pulled[idx].listingType = ltype; localStorage.setItem('unwrap_pulled_cards', JSON.stringify(pulled)); }
  } catch(e) {}

  document.getElementById('sellModal').classList.remove('open');
  var lbl = { sale: 'Solo Vendita', trade: 'Solo Scambio', mixed: 'Scambio + Cash' };
  showNotif('Inserzione Pubblicata!', 'Visibile nel Marketplace - ' + (lbl[ltype] || ltype), 'success');
  filterCards();
}

function delistCard(id) {
  try {
    var listings = JSON.parse(localStorage.getItem('unwrap_my_listings') || '[]');
    listings = listings.filter(function(l) { return String(l.id) !== String(id); });
    localStorage.setItem('unwrap_my_listings', JSON.stringify(listings));

    try {
      var pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
      var idx = pulled.findIndex(function(c) { return String(c.id) === String(id); });
      if (idx !== -1) {
        pulled[idx].isListed = false;
        localStorage.setItem('unwrap_pulled_cards', JSON.stringify(pulled));
      }
    } catch(e2) {}
  } catch(e) {}

  showNotif('Rimosso dal Marketplace', 'La carta non è più in vendita.', 'success');
  filterCards();
}

// ─── OFFERS ───────────────────────────────────────────────────────────────────
function renderOffers() {
  var list = document.getElementById('offersList');
  if (!list) return;
  list.innerHTML = INCOMING_OFFERS.map(function(o) {
    return '<div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:1rem;margin-bottom:0.5rem">'
      + '<div><div style="font-weight:700">' + o.cardName + '</div>'
      + '<div style="font-size:0.8rem;color:var(--text-muted)">Offerta da @' + o.buyer + '</div></div>'
      + '<div style="text-align:right">'
      + '<div style="font-size:1.1rem;font-weight:900;color:var(--green)">&euro;' + o.offer.toFixed(2) + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:6px">'
      + '<button class="btn btn-outline" style="padding:4px 10px;font-size:0.75rem;justify-content:center" onclick="declineOffer(' + o.id + ')">Rifiuta</button>'
      + '<button class="btn btn-primary" style="padding:4px 10px;font-size:0.75rem;justify-content:center" onclick="acceptOffer(' + o.id + ')">Accetta</button>'
      + '</div></div>'
      + '</div>';
  }).join('');
}

function acceptOffer(id) {
  var offer = INCOMING_OFFERS.find(function(o) { return o.id === id; });
  if (!offer) return;
  window.unwrapWallet = (window.unwrapWallet || 0) + offer.offer;
  if (typeof updateWalletUI === 'function') updateWalletUI();

  // Remove the card from vault (pulled cards)
  try {
    var pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
    pulled = pulled.filter(function(c) { return String(c.id) !== String(offer.cardId); });
    localStorage.setItem('unwrap_pulled_cards', JSON.stringify(pulled));
  } catch(e) {}

  var idx = INCOMING_OFFERS.findIndex(function(o) { return o.id === id; });
  if (idx !== -1) INCOMING_OFFERS.splice(idx, 1);
  renderOffers();
  filterCards();
  showNotif('✅ Offerta Accettata!', 'Hai ricevuto &euro;' + offer.offer.toFixed(2) + ' nel wallet.', 'success');
}

function declineOffer(id) {
  var idx = INCOMING_OFFERS.findIndex(function(o) { return o.id === id; });
  if (idx !== -1) INCOMING_OFFERS.splice(idx, 1);
  renderOffers();
  showNotif('Offerta Rifiutata', 'La proposta è stata declinata.', '');
}

// ─── SWAP BOARD ───────────────────────────────────────────────────────────────
function renderSwapBoard() {
  var grid = document.getElementById('swapBoardGrid');
  if (!grid) return;
  grid.innerHTML = SWAP_BOARD.map(function(card) {
    var img = card.img
      ? '<img src="' + card.img + '" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display=\'none\'">'
      : '<span style="font-size:2rem">' + (card.emoji || '🃏') + '</span>';
    return '<div class="card-item">'
      + '  <div class="card-item-img" style="background:' + (card.bg || '#1a1a2e') + '">' + img + '<div class="card-item-rarity rarity-' + (card.rarity || 'rare') + '">' + (card.rarity || 'rare').toUpperCase() + '</div></div>'
      + '  <div class="card-item-info">'
      + '    <div class="card-item-name">' + card.name + '</div>'
      + '    <div class="card-item-set">Cerca: ' + (card.seeking || '?') + '</div>'
      + '    <div class="card-item-footer"><div class="card-item-price">&euro;' + (card.price || 0) + '</div></div>'
      + '    <button class="btn btn-outline" style="width:100%;justify-content:center;margin-top:8px;font-size:0.75rem" onclick="showNotif(\'Proposta Inviata!\',\'@' + card.owner + ' riceverà la tua proposta.\',\'success\')">🤝 Proponi Scambio</button>'
      + '  </div>'
      + '</div>';
  }).join('');
}

// ─── BULK SELL MODAL ──────────────────────────────────────────────────────────
function openSellBulkModal() {
  var bulk = {};
  try { bulk = JSON.parse(localStorage.getItem('unwrap_bulk') || '{"count":415,"weight":747}'); } catch(e) {}
  var maxCount = bulk.count || 0;

  var el = document.getElementById('sellBulkMaxCount');
  var input = document.getElementById('sellBulkInput');
  if (el) el.textContent = maxCount + ' Carte';
  if (input) { input.max = maxCount; input.value = Math.min(maxCount, 100); }
  updateSellBulkPreview();

  var modal = document.getElementById('sellBulkModal');
  if (modal) modal.classList.add('open');
}

function updateSellBulkPreview() {
  var input = document.getElementById('sellBulkInput');
  if (!input) return;
  var max = parseInt(input.max) || 0;
  var val = parseInt(input.value) || 0;
  if (val > max) { val = max; input.value = max; }
  if (val < 0)   { val = 0;   input.value = 0; }

  var weight = Math.round(val * 1.8);
  var price  = (weight * 0.01).toFixed(2);

  var pw = document.getElementById('sellBulkPreviewWeight');
  var pv = document.getElementById('sellBulkPreviewValue');
  if (pw) pw.textContent = formatWeight(weight);
  if (pv) pv.textContent = '\u20AC' + price;
}

function confirmSellBulk() {
  var input = document.getElementById('sellBulkInput');
  var val   = parseInt(input ? input.value : 0) || 0;
  if (val <= 0) { showNotif('Errore', 'Inserisci una quantità valida.', ''); return; }

  try {
    var bulk = JSON.parse(localStorage.getItem('unwrap_bulk') || '{"count":415,"weight":747}');
    if (val > bulk.count) return;
    bulk.count  -= val;
    bulk.weight  = Math.round(bulk.count * 1.8);
    bulk.value   = (bulk.weight * 0.01).toFixed(2);
    localStorage.setItem('unwrap_bulk', JSON.stringify(bulk));

    var listings = JSON.parse(localStorage.getItem('unwrap_bulk_listings') || '[]');
    listings.push({ id: 'bulk_' + Date.now(), count: val, weight: Math.round(val * 1.8), price: (Math.round(val * 1.8) * 0.01).toFixed(2), seller: 'me' });
    localStorage.setItem('unwrap_bulk_listings', JSON.stringify(listings));

    syncBulk();
  } catch(e) {}

  var modal = document.getElementById('sellBulkModal');
  if (modal) modal.classList.remove('open');
  showNotif('📦 In vendita!', 'Il tuo Bulk è ora visibile ai privati sul Marketplace!', 'success');
}

// ─── CASH OFFER FROM VAULT ────────────────────────────────────────────────────
var currentCashOfferCardId = null;
var vaultCoTimer = null;

function openCashOfferModal(id) {
  vaultCards = getVaultCards();
  var card = vaultCards.find(function(c) { return String(c.id) === String(id); });
  if (!card) return;
  currentCashOfferCardId = id;
  var offer = (card.price || 0) * 0.85;
  var nameEl  = document.getElementById('coCardName');
  var mktEl   = document.getElementById('coMarketVal');
  var offerEl = document.getElementById('coOfferVal');
  if (nameEl)  nameEl.textContent  = card.name;
  if (mktEl)   mktEl.textContent   = (card.price || 0).toFixed(2);
  if (offerEl) offerEl.textContent = offer.toFixed(2);

  var timerEl = document.getElementById('coTimer');
  var secs    = 47 * 3600 + 59 * 60 + 59;
  if (vaultCoTimer) clearInterval(vaultCoTimer);
  vaultCoTimer = setInterval(function() {
    secs--;
    if (secs <= 0) { clearInterval(vaultCoTimer); return; }
    var h = Math.floor(secs / 3600).toString().padStart(2, '0');
    var m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    var s = (secs % 60).toString().padStart(2, '0');
    if (timerEl) timerEl.textContent = h + ':' + m + ':' + s;
  }, 1000);

  var modal = document.getElementById('cashOfferModal');
  if (modal) modal.classList.add('open');
}

function acceptCashOfferFromVault() {
  vaultCards = getVaultCards();
  var card = vaultCards.find(function(c) { return String(c.id) === String(currentCashOfferCardId); });
  if (card) {
    var offer = (card.price || 0) * 0.85;
    window.unwrapWallet = (window.unwrapWallet || 0) + offer;
    if (typeof updateWalletUI === 'function') updateWalletUI();

    // Remove from pulled cards
    try {
      var pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
      pulled = pulled.filter(function(c) { return String(c.id) !== String(currentCashOfferCardId); });
      localStorage.setItem('unwrap_pulled_cards', JSON.stringify(pulled));
    } catch(e) {}
  }

  if (vaultCoTimer) clearInterval(vaultCoTimer);
  var modal = document.getElementById('cashOfferModal');
  if (modal) modal.classList.remove('open');
  showNotif('Cash Offer Accettata!', 'Il credito è stato aggiunto al tuo Wallet istantaneamente.', 'success');
  filterCards();
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
  if (typeof updateWalletUI === 'function') updateWalletUI();
  syncBulk();
  filterCards();
  document.getElementById('statCards').textContent = getVaultCards().length;
});











