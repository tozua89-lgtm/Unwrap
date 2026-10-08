/* =============================================
   UNWRAP - Marketplace JS v9 (Clean Rewrite)
   ============================================= */

// ─── DATA ─────────────────────────────────────────────────────────────────────
const LISTING_TYPES = ['sale','sale','sale','trade','mixed'];

// Only cards explicitly listed by me appear as mine
const MARKET_LISTINGS = [];

// Load user's personal listings from localStorage (cards they explicitly listed)
try {
  const myListings = JSON.parse(localStorage.getItem('unwrap_my_listings') || '[]');
  myListings.forEach(function(l) {
    if (!MARKET_LISTINGS.find(function(m) { return String(m.id) === String(l.id); })) {
      MARKET_LISTINGS.push(Object.assign({}, l, { seller: 'me' }));
    }
  });
} catch(e) {}

// Other vaults
OTHER_VAULTS.forEach(function(v) {
  v.cards.forEach(function(c) {
    MARKET_LISTINGS.push(Object.assign({}, c, {
      seller: v.user,
      proof: true,
      listingType: LISTING_TYPES[Math.floor(Math.random() * LISTING_TYPES.length)]
    }));
  });
});

// Extra test listings - mix of sale, trade-only, mixed
const EXTRA_LISTINGS = [
  { id: 901, name: 'Mew ex (Full Art)',        set: 'Scarlet & Violet 151', rarity: 'secret', price: 85,  seller: 'NovaColezioni', listingType: 'sale',  proof: true, bg: '#1a0a2e', img: 'https://images.pokemontcg.io/sv3pt5/205_hires.png' },
  { id: 902, name: 'Mewtwo ex (Full Art)',      set: 'Scarlet & Violet 151', rarity: 'ultra',  price: 68,  seller: 'TradersRoma',   listingType: 'trade', proof: true, bg: '#0a1a2e', img: 'https://images.pokemontcg.io/sv3pt5/206_hires.png' },
  { id: 903, name: 'Charizard ex (SIR)',        set: 'Paldean Fates',        rarity: 'secret', price: 340, seller: 'VaultMilano',   listingType: 'sale',  proof: true, bg: '#2e0a00', img: 'https://images.pokemontcg.io/sv4pt5/234_hires.png' },
  { id: 904, name: 'Pikachu VMAX (Rainbow)',    set: 'Vivid Voltage',        rarity: 'secret', price: 210, seller: 'PokeMaster99',  listingType: 'mixed', proof: true, bg: '#2e2a00', img: 'https://images.pokemontcg.io/swsh4/188_hires.png' },
  { id: 905, name: 'Gardevoir ex (SAR)',        set: 'Scarlet & Violet',     rarity: 'ultra',  price: 55,  seller: 'CharizardFan',  listingType: 'trade', proof: true, bg: '#1a0a2e', img: 'https://images.pokemontcg.io/sv1/230_hires.png' },
  { id: 906, name: 'Lugia VSTAR (Alt Art)',     set: 'Silver Tempest',       rarity: 'secret', price: 195, seller: 'RomaTCG',      listingType: 'trade', proof: true, bg: '#0a1a3e', img: 'https://images.pokemontcg.io/swsh12/211_hires.png' },
  { id: 907, name: 'Umbreon VMAX (Alt Art)',    set: 'Evolving Skies',       rarity: 'secret', price: 265, seller: 'NovaColezioni', listingType: 'mixed', proof: true, bg: '#0a0a1e', img: 'https://images.pokemontcg.io/swsh7/215_hires.png' },
  { id: 908, name: 'Rayquaza VMAX (Alt Art)',   set: 'Evolving Skies',       rarity: 'ultra',  price: 290, seller: 'Collector99',   listingType: 'sale',  proof: true, bg: '#001a0a', img: 'https://images.pokemontcg.io/swsh7/217_hires.png' },
  { id: 909, name: 'Giratina VSTAR (Alt Art)',  set: 'Lost Origin',          rarity: 'secret', price: 390, seller: 'TradersMilano', listingType: 'trade', proof: true, bg: '#0a001a', img: 'https://images.pokemontcg.io/swsh11/201_hires.png' },
  { id: 910, name: 'Eevee Heroes (Box Set)',    set: 'SWSH Collection',      rarity: 'ultra',  price: 125, seller: 'OnePieceFan',   listingType: 'mixed', proof: true, bg: '#1a0a10', img: 'https://images.pokemontcg.io/swsh7/182_hires.png' },
  { id: 911, name: 'Arceus VSTAR (Gold)',       set: 'Brilliant Stars',      rarity: 'secret', price: 88,  seller: 'RiftLord',      listingType: 'trade', proof: true, bg: '#1a1500', img: 'https://images.pokemontcg.io/swsh9/184_hires.png' },
  { id: 912, name: 'Darkrai VSTAR (Alt Art)',   set: 'Astral Radiance',      rarity: 'ultra',  price: 72,  seller: 'VaultMilano',   listingType: 'sale',  proof: true, bg: '#0a0015', img: 'https://images.pokemontcg.io/swsh10/98_hires.png' }
];
EXTRA_LISTINGS.forEach(function(l) {
  if (!MARKET_LISTINGS.find(function(m) { return m.id === l.id; })) MARKET_LISTINGS.push(l);
});

// ─── BADGE MAP ────────────────────────────────────────────────────────────────
const BADGE_MAP = {
  sale:  '<div class="listing-badge badge-sale">💰 Solo Vendita</div>',
  trade: '<div class="listing-badge badge-trade">🔄 Solo Scambio</div>',
  mixed: '<div class="listing-badge badge-mixed">🤝 Scambio + Conguaglio</div>'
};

// ─── TABS ─────────────────────────────────────────────────────────────────────
function setMarketTab(tab) {
  ['store','singles','bulk'].forEach(function(t) {
    var tabEl = document.getElementById('tab-' + t);
    var panelEl = document.getElementById('panel-' + t);
    if (tabEl) tabEl.classList.toggle('active', t === tab);
    if (panelEl) panelEl.style.display = t === tab ? 'block' : 'none';
  });
  if (tab === 'bulk' && typeof renderBulkGrid === 'function') renderBulkGrid();
}

// ─── STORE (SEALED) ───────────────────────────────────────────────────────────
function renderStoreGrid(products) {
  var grid = document.getElementById('storeGrid');
  if (!grid) return;
  grid.innerHTML = products.map(function(p) {
    return '<div class="mp-listing" style="border:1px solid var(--border)">'
      + '  <div class="mp-listing-img" style="background:' + (p.bg||'#0f0f1a') + ';padding:10px;height:240px;display:flex;align-items:center;justify-content:center">'
      + '    <img src="' + p.img + '" style="max-height:100%;max-width:100%;object-fit:contain;filter:drop-shadow(0 10px 15px rgba(0,0,0,0.5))" onerror="this.style.display=\'none\'">'
      + '  </div>'
      + '  <div class="mp-listing-body">'
      + '    <div class="mp-listing-name">' + p.name + '</div>'
      + '    <div class="mp-listing-set">' + p.game + '</div>'
      + '    <div class="mp-listing-footer" style="margin-top:8px"><div class="mp-price">&euro;' + p.price.toFixed(2) + '</div></div>'
      + '    <div class="mp-listing-actions">'
      + '      <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="buySealed(\'' + p.id + '\')">🛒 Acquista e Sbusta</button>'
      + '    </div>'
      + '  </div>'
      + '</div>';
  }).join('');
}

function filterStore() {
  var q    = (document.getElementById('storeSearch') ? document.getElementById('storeSearch').value : '').toLowerCase();
  var game = document.getElementById('storeGame') ? document.getElementById('storeGame').value : '';
  var filtered = SEALED_PRODUCTS.filter(function(p) {
    return p.name.toLowerCase().includes(q) && (game === '' || p.game.includes(game));
  });
  renderStoreGrid(filtered);
}

function buySealed(id) {
  var prod = SEALED_PRODUCTS.find(function(p) { return p.id === id; });
  if (!prod) return;
  document.getElementById('purchaseTitle').textContent = 'Conferma Acquisto Sigillato';
  document.getElementById('purchaseBody').innerHTML = ''
    + '<div style="height:200px;margin-bottom:1.5rem;border-radius:12px;overflow:hidden;background:' + (prod.bg||'#0f0f1a') + ';display:flex;align-items:center;justify-content:center;padding:10px">'
    + '  <img src="' + prod.img + '" style="max-height:100%;object-fit:contain">'
    + '</div>'
    + '<div class="vs-row" style="margin-bottom:8px"><span>Prodotto</span><span style="font-weight:700">' + prod.name + '</span></div>'
    + '<div class="vs-row" style="margin-bottom:8px"><span>Gioco</span><span>' + prod.game + '</span></div>'
    + '<div class="vs-row" style="margin-bottom:16px"><span>Costo</span><span style="font-weight:900;font-size:1.2rem;color:var(--gold)">&euro;' + prod.price.toFixed(2) + '</span></div>'
    + '<div style="background:rgba(16,185,129,0.1);border:1px solid var(--green);border-radius:8px;padding:1rem;font-size:0.85rem;color:var(--text-secondary);margin-bottom:1.5rem">'
    + '  <strong style="color:var(--green)">Come funziona:</strong><br>Il prodotto viene inviato alla <strong>Live Opening</strong> per lo sbustamento 1:1 con Proof of Pull.'
    + '</div>'
    + '<button class="btn btn-primary" style="width:100%;justify-content:center;font-size:1.05rem;padding:12px" onclick="completePurchaseSealed(\'' + prod.id + '\')">✅ Paga e Vai alla Live</button>';
  document.getElementById('purchaseModal').classList.add('open');
}

function completePurchaseSealed(id) {
  var prod = SEALED_PRODUCTS.find(function(p) { return p.id === id; });
  if (!prod) return;
  if (window.unwrapWallet < prod.price) { showNotif('❌ Fondi Insufficienti', 'Ricarica il tuo Wallet.', ''); return; }
  window.unwrapWallet -= prod.price;
  if (typeof updateWalletUI === 'function') updateWalletUI();
  document.getElementById('purchaseModal').classList.remove('open');
  showNotif('📦 Ordine Completato!', prod.name + ' in caricamento...', 'success');
  setTimeout(function() { window.location.href = 'live.html?packReady=true&game=' + encodeURIComponent(prod.game); }, 1500);
}

// ─── SINGLES GRID ─────────────────────────────────────────────────────────────
function renderMarketGrid(listings) {
  var grid = document.getElementById('mpGrid');
  if (!grid) return;
  grid.innerHTML = listings.map(function(card) {
    var isMine = card.seller === 'me';
    var highlightStyle = isMine ? 'border:2px solid var(--accent);box-shadow:0 0 15px rgba(124,58,237,0.3);' : '';

    var actions = '';
    if (isMine) {
      actions = '<div style="width:100%;text-align:center;padding:8px;font-size:0.8rem;color:var(--accent-light);border:1px solid var(--accent);border-radius:6px">La tua inserzione</div>';
    } else {
      if (card.listingType === 'trade') {
        // TRADE ONLY — no buy, only swap proposal
        actions = '<button class="btn btn-outline" style="width:100%;justify-content:center;padding:8px" onclick="openSwapModal(' + card.id + ', \'trade\')">🔄 Proponi Scambio</button>';
      } else if (card.listingType === 'mixed') {
        actions = '<button class="btn btn-outline" style="flex:1;justify-content:center;padding:8px" onclick="openSwapModal(' + card.id + ', \'mixed\')">🤝 Proponi</button>'
                + '<button class="btn btn-primary" style="flex:1;justify-content:center;padding:8px" onclick="openPurchaseModal(' + card.id + ')">🛒 Acquista</button>';
      } else {
        // SALE — buy or make offer
        actions = '<button class="btn btn-outline" style="flex:1;justify-content:center;padding:8px" onclick="openPriceOfferModal(' + card.id + ')">💬 Offerta</button>'
                + '<button class="btn btn-primary" style="flex:1;justify-content:center;padding:8px" onclick="openPurchaseModal(' + card.id + ')">🛒 Acquista</button>';
      }
    }

    return '<div class="mp-listing" style="' + highlightStyle + '">'
      + '  <div class="mp-listing-img" style="background:' + (card.bg||'#0f0f1a') + ';position:relative;overflow:hidden;cursor:pointer;padding:8px" onclick="openPurchaseModal(' + card.id + ')">'
      + '    <img src="' + card.img + '" alt="' + card.name + '" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display=\'none\'" loading="lazy" />'
      + (card.rarity ? '    <div class="card-item-rarity rarity-' + card.rarity + '" style="position:absolute;top:4px;right:4px">' + card.rarity.toUpperCase() + '</div>' : '')
      + (card.grade  ? '    <div class="card-item-grade" style="position:absolute;top:4px;left:4px">💎 ' + card.grade + '</div>' : '')
      + (card.proof  ? '    <div class="proof-badge" style="cursor:pointer;z-index:2" onclick="event.stopPropagation()">🎥 PROOF</div>' : '')
      + '  </div>'
      + '  <div class="mp-listing-body">'
      + '    ' + (BADGE_MAP[card.listingType] || BADGE_MAP.sale)
      + '    <div class="mp-listing-name">' + card.name + '</div>'
      + '    <div class="mp-listing-set">' + (card.set||'') + ' &bull; ' + (card.game||'') + '</div>'
      + '    <div style="font-size:0.75rem;color:var(--text-muted)">Venditore: @' + (isMine ? 'Tu' : card.seller) + '</div>'
      + '    <div class="mp-listing-footer"><div class="mp-price">&euro;' + card.price.toFixed(2) + '</div></div>'
      + (card.listingType === 'trade' ? '<div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px">Cerca: ' + (card.seeking || 'qualsiasi') + '</div>' : '')
      + '    <div class="mp-listing-actions">' + actions + '</div>'
      + '  </div>'
      + '</div>';
  }).join('');
}

function filterMarket() {
  var q = (document.getElementById('mpSearch') ? document.getElementById('mpSearch').value : '').toLowerCase();
  var set = document.getElementById('mpSet') ? document.getElementById('mpSet').value : '';
  var sort = document.getElementById('mpSort') ? document.getElementById('mpSort').value : '';
  var listingType = document.getElementById('mpListingType') ? document.getElementById('mpListingType').value : '';

  var filtered = MARKET_LISTINGS.filter(function(c) {
    var matchQ = !q || c.name.toLowerCase().includes(q) || (c.set||'').toLowerCase().includes(q);
    var matchSet  = !set || (c.set||'').includes(set);
    var matchType = !listingType || c.listingType === listingType;
    return matchQ && matchSet && matchType;
  });

  if (sort.includes('Decrescente')) filtered.sort(function(a,b) { return b.price - a.price; });
  else filtered.sort(function(a,b) { return a.price - b.price; });
  renderMarketGrid(filtered);
}

// ─── PURCHASE MODAL ───────────────────────────────────────────────────────────
function openPurchaseModal(id) {
  var card = MARKET_LISTINGS.find(function(c) { return c.id === id; });
  if (!card || card.seller === 'me') return;
  var comm = card.price * 0.05;
  document.getElementById('purchaseTitle').textContent = 'Dettaglio Inserzione';
  document.getElementById('purchaseBody').innerHTML = ''
    + '<div style="height:240px;background:' + (card.bg||'#0f0f1a') + ';border-radius:var(--radius);overflow:hidden;margin-bottom:1.5rem;padding:1rem;display:flex;justify-content:center">'
    + '  <img src="' + card.img + '" style="height:100%;object-fit:contain" onerror="this.style.display=\'none\'" />'
    + '</div>'
    + '<div style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1.5rem">'
    + '  <div class="vs-row"><span>Carta</span><span style="font-weight:700">' + card.name + '</span></div>'
    + '  <div class="vs-row"><span>Venditore</span><span>@' + card.seller + '</span></div>'
    + (card.grade ? '<div class="vs-row"><span>Grading</span><span style="color:var(--gold)">💎 ' + card.grade + '</span></div>' : '')
    + '  <div class="vs-row"><span>Prezzo</span><span style="font-size:1.2rem;font-weight:900;color:var(--green)">&euro;' + card.price.toFixed(2) + '</span></div>'
    + '  <div class="vs-row"><span>Commissione Unwrap (5%)</span><span style="color:var(--text-muted)">&euro;' + comm.toFixed(2) + '</span></div>'
    + '</div>'
    + '<div style="display:flex;gap:8px">'
    + '  <button class="btn btn-outline" style="flex:1;justify-content:center" onclick="document.getElementById(\'purchaseModal\').classList.remove(\'open\');openPriceOfferModal(' + card.id + ')">💬 Fai un\'Offerta</button>'
    + '  <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="completePurchaseCard(' + card.id + ')">✅ Paga &euro;' + (card.price * 1.05).toFixed(2) + '</button>'
    + '</div>';
  document.getElementById('purchaseModal').classList.add('open');
}

function completePurchaseCard(id) {
  var card = MARKET_LISTINGS.find(function(c) { return c.id === id; });
  if (!card) return;
  var total = card.price * 1.05;
  if (window.unwrapWallet < total) { showNotif('❌ Fondi Insufficienti', 'Ricarica il tuo Wallet.', ''); return; }
  window.unwrapWallet -= total;
  if (typeof updateWalletUI === 'function') updateWalletUI();

  // Add card to buyer's vault
  try {
    var pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
    pulled.unshift(Object.assign({}, card, { id: 'bought_' + Date.now(), owner: 'me', isListed: false, seller: 'me', isFresh: false }));
    localStorage.setItem('unwrap_pulled_cards', JSON.stringify(pulled));
  } catch(e) {}

  // Add bulk from purchased card (assume ~9 commons come with the deal)
  try {
    var bulk = JSON.parse(localStorage.getItem('unwrap_bulk') || '{"count":415,"weight":747}');
    bulk.count  += 1;
    bulk.weight  = Math.round(bulk.count * 1.8);
    bulk.value   = (bulk.weight * 0.01).toFixed(2);
    localStorage.setItem('unwrap_bulk', JSON.stringify(bulk));
  } catch(e) {}

  // Remove from listings array and localStorage
  var idx = MARKET_LISTINGS.findIndex(function(c) { return c.id === id; });
  if (idx !== -1) MARKET_LISTINGS.splice(idx, 1);
  try {
    var myL = JSON.parse(localStorage.getItem('unwrap_my_listings') || '[]');
    myL = myL.filter(function(l) { return String(l.id) !== String(id); });
    localStorage.setItem('unwrap_my_listings', JSON.stringify(myL));
  } catch(e) {}

  document.getElementById('purchaseModal').classList.remove('open');
  filterMarket();
  showNotif('✅ Acquisto Completato!', card.name + ' è ora nel tuo Vault.', 'success');
}

// ─── PRICE OFFER MODAL ────────────────────────────────────────────────────────
var currentOfferCardId = null;

function openPriceOfferModal(id) {
  var card = MARKET_LISTINGS.find(function(c) { return c.id === id; });
  if (!card || card.seller === 'me') return;
  currentOfferCardId = id;

  var infoEl = document.getElementById('priceOfferTargetInfo');
  if (infoEl) {
    infoEl.innerHTML = ''
      + '<div style="width:45px;height:63px;background:' + (card.bg||'#0f0f1a') + ';border-radius:4px;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">'
      + '  <img src="' + card.img + '" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display=\'none\'">'
      + '</div>'
      + '<div><div style="font-weight:700">' + card.name + '</div>'
      + '<div style="font-size:0.8rem;color:var(--text-muted)">Prezzo richiesto: <strong style="color:var(--green)">&euro;' + card.price.toFixed(2) + '</strong> &bull; @' + card.seller + '</div></div>';
  }

  var input = document.getElementById('priceOfferInput');
  if (input) input.value = Math.round(card.price * 0.9); // suggest 10% lower

  var hint = document.getElementById('priceOfferHint');
  if (hint) hint.textContent = 'Prezzo pieno: \u20AC' + card.price.toFixed(2) + ' \u2014 La tua offerta verrà notificata al venditore @' + card.seller;

  var modal = document.getElementById('priceOfferModal');
  if (modal) modal.classList.add('open');
}

function submitPriceOffer() {
  var card = MARKET_LISTINGS.find(function(c) { return c.id === currentOfferCardId; });
  if (!card) return;
  var input = document.getElementById('priceOfferInput');
  var offer = parseFloat(input ? input.value : 0);
  if (!offer || offer <= 0) { showNotif('Errore', 'Inserisci un\'offerta valida.', ''); return; }

  document.getElementById('priceOfferModal').classList.remove('open');

  var accepted = offer >= card.price * 0.85; // auto-accept if >= 85%
  if (accepted) {
    window.unwrapWallet -= offer * 1.05;
    if (typeof updateWalletUI === 'function') updateWalletUI();
    try {
      var pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
      pulled.unshift(Object.assign({}, card, { id: 'offer_' + Date.now(), owner: 'me', isListed: false, seller: 'me' }));
      localStorage.setItem('unwrap_pulled_cards', JSON.stringify(pulled));
    } catch(e) {}
    var idx = MARKET_LISTINGS.findIndex(function(c) { return c.id === currentOfferCardId; });
    if (idx !== -1) MARKET_LISTINGS.splice(idx, 1);
    filterMarket();
    showNotif('✅ Offerta Accettata!', '@' + card.seller + ' ha accettato \u20AC' + offer.toFixed(2) + '. La carta è nel tuo Vault.', 'success');
  } else {
    showNotif('📨 Offerta Inviata', 'La tua offerta di \u20AC' + offer.toFixed(2) + ' è stata inviata a @' + card.seller + '. Attendi risposta.', 'success');
  }
}

// ─── SWAP MODAL ───────────────────────────────────────────────────────────────
var currentSwapTarget = null;
var currentSwapSelectedMyCard = null;

function openSwapModal(id, type) {
  var card = MARKET_LISTINGS.find(function(c) { return c.id === id; });
  if (!card || card.seller === 'me') return;
  currentSwapTarget = card;
  currentSwapSelectedMyCard = null;

  var targetInfo = document.getElementById('swapTargetInfo');
  if (targetInfo) {
    targetInfo.innerHTML = ''
      + '<div style="width:40px;height:56px;background:' + (card.bg||'#0f0f1a') + ';border-radius:4px;flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center">'
      + '  <img src="' + card.img + '" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display=\'none\'">'
      + '</div>'
      + '<div><div style="font-weight:700">' + card.name + '</div>'
      + '<div style="font-size:0.75rem;color:var(--text-muted)">Valore: \u20AC' + card.price.toFixed(2) + ' &bull; @' + card.seller + '</div></div>';
  }

  var cashDiv = document.getElementById('swapCashInputDiv');
  if (cashDiv) cashDiv.style.display = type === 'mixed' ? 'block' : 'none';

  // Populate vault grid
  var grid = document.getElementById('swapVaultGrid');
  if (grid) {
    var myVault = CARD_DB.filter(function(c) { return c.owner === 'me'; });
    try {
      var pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
      pulled.forEach(function(p) {
        if (!myVault.find(function(c) { return String(c.id) === String(p.id); })) myVault.push(p);
      });
    } catch(e) {}

    if (myVault.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-muted)">Non hai carte nel Vault da offrire.</div>';
    } else {
            grid.innerHTML = myVault.map(function(c) {
        var img = c.img
          ? '<img src="' + c.img + '" style="width:100%;height:100%;object-fit:contain" onerror="this.style.opacity=0.3">'
          : '<span style="font-size:3rem">' + (c.emoji || '🃏') + '</span>';
        return '<div class="card-item swap-selectable" id="swapMyCard-' + c.id + '" onclick="selectMyCardForSwap(\'' + c.id + '\')">'
          + '  <div class="img-wrapper" style="background:' + (c.bg||c.color||'#0f0f1a') + ';border-radius:6px;">' + img + '</div>'
          + '  <div class="info-wrapper">' + c.name
          + (c.price ? '<div style="font-size:0.85rem;color:var(--green);margin-top:4px;font-weight:900">\u20AC' + c.price.toFixed(2) + '</div>' : '')
          + '  </div>'
          + '</div>';
      }).join('');
    }
  }

  document.getElementById('swapProposalModal').classList.add('open');
}

function selectMyCardForSwap(id) {
  currentSwapSelectedMyCard = id;
  document.querySelectorAll('.swap-selectable').forEach(function(el) { el.style.borderColor = 'transparent'; el.style.boxShadow = 'none'; });
  var el = document.getElementById('swapMyCard-' + id);
  if (el) { el.style.borderColor = 'var(--accent)'; el.style.boxShadow = '0 0 10px rgba(124,58,237,0.5)'; }
}

function confirmSwapProposal() {
  if (!currentSwapSelectedMyCard) { showNotif('Attenzione', 'Seleziona una carta dal tuo Vault.', ''); return; }
  var cashInput = document.getElementById('swapCashAmount');
  var cash = cashInput ? parseFloat(cashInput.value) || 0 : 0;
  var msg = 'La tua proposta di scambio è stata inviata a @' + currentSwapTarget.seller + '.';
  if (cash > 0) msg += ' Conguaglio: \u20AC' + cash.toFixed(2) + '.';
  document.getElementById('swapProposalModal').classList.remove('open');
  showNotif('✅ Proposta Inviata', msg, 'success');
}

// ─── BULK GRID ────────────────────────────────────────────────────────────────
function formatWeight(w) {
  return w >= 1000 ? (w / 1000).toFixed(1) + 'kg' : w + 'g';
}

function renderBulkGrid() {
  var grid = document.getElementById('bulkGrid');
  if (!grid) return;

  var listings = [];
  try { listings = JSON.parse(localStorage.getItem('unwrap_bulk_listings') || '[]'); } catch(e) {}

  var fakeLots = [
    { id: 'fake_1', count: 1250, weight: 2250, price: 22.50, seller: 'PokeMaster99' },
    { id: 'fake_2', count: 500,  weight: 900,  price: 9.00,  seller: 'CharizardFan' },
    { id: 'fake_3', count: 3000, weight: 5400, price: 54.00, seller: 'VaultMilano'  }
  ];

  var allListings = listings.concat(fakeLots);

  grid.innerHTML = allListings.map(function(lot) {
    var isMine = lot.seller === 'me';
    var highlightStyle = isMine ? 'border:2px solid var(--accent);box-shadow:0 0 15px rgba(124,58,237,0.3);' : '';
    var sellerName = isMine ? 'Tu' : lot.seller;
    return '<div class="mp-listing" style="' + highlightStyle + '">'
      + '  <div class="mp-listing-img" style="background:#1a1a2e;display:flex;align-items:center;justify-content:center;font-size:3rem;padding:20px">📦</div>'
      + '  <div class="mp-listing-body">'
      + '    <div style="font-size:0.6rem;background:rgba(16,185,129,0.1);color:var(--green);border:1px solid rgba(16,185,129,0.3);padding:2px 6px;border-radius:4px;display:inline-block;margin-bottom:8px;font-weight:700">VENDITA LOTTO</div>'
      + '    <div class="mp-listing-name">Lotto Bulk (' + lot.count + ' Carte)</div>'
      + '    <div class="mp-listing-set">Peso: ' + formatWeight(lot.weight) + '</div>'
      + '    <div style="font-size:0.75rem;color:var(--text-muted)">Venditore: @' + sellerName + '</div>'
      + '    <div class="mp-listing-footer"><div class="mp-price">&euro;' + parseFloat(lot.price).toFixed(2) + '</div></div>'
      + '    <div class="mp-listing-actions">'
      + (isMine
          ? '<div style="width:100%;text-align:center;padding:8px;font-size:0.8rem;color:var(--accent-light);border:1px solid var(--accent);border-radius:6px">La tua inserzione</div>'
          : '<button class="btn btn-primary" style="width:100%;justify-content:center" onclick="buyBulkLot(\'' + lot.id + '\',' + lot.price + ')">🛒 Acquista</button>')
      + '    </div>'
      + '  </div>'
      + '</div>';
  }).join('');
}

function buyBulkLot(id, price) {
  if (window.unwrapWallet < price * 1.05) { showNotif('❌ Fondi Insufficienti', 'Ricarica il tuo Wallet.', ''); return; }
  window.unwrapWallet -= price * 1.05;
  if (typeof updateWalletUI === 'function') updateWalletUI();
  showNotif('📦 Acquisto Lotto Bulk!', 'Il lotto è stato acquistato per \u20AC' + parseFloat(price).toFixed(2) + '.', 'success');
  if (id.startsWith('bulk_')) {
    try {
      var listings = JSON.parse(localStorage.getItem('unwrap_bulk_listings') || '[]');
      listings = listings.filter(function(l) { return l.id !== id; });
      localStorage.setItem('unwrap_bulk_listings', JSON.stringify(listings));
      renderBulkGrid();
    } catch(e) {}
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
  if (typeof updateWalletUI === 'function') updateWalletUI();
  renderStoreGrid(SEALED_PRODUCTS);
  renderMarketGrid(MARKET_LISTINGS);
  renderBulkGrid();
});




