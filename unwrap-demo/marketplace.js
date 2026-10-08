/* =============================================
   UNWRAP - Marketplace JS v8
   Interactive Swap Modal & Game Parameters
   ============================================= */

const LISTING_TYPES = ['sale','sale','sale','trade','mixed'];
const MARKET_LISTINGS = CARD_DB.filter(c => c.owner === 'me').map(c => ({
  ...c,
  seller: ['VaultMilano','PokeMaster99','CharizardFan','RomaTCG','Collector99','OnePieceFan','RiftLord'][Math.floor(Math.random()*7)],
  listingType: LISTING_TYPES[Math.floor(Math.random()*LISTING_TYPES.length)],
  proof: true
}));

OTHER_VAULTS.forEach(v => v.cards.forEach(c => {
  MARKET_LISTINGS.push({
    ...c, seller: v.user, proof: true,
    listingType: LISTING_TYPES[Math.floor(Math.random()*LISTING_TYPES.length)]
  });
}));

function setMarketTab(tab) {
  ['store','singles','bulk'].forEach(t => {
    document.getElementById(`tab-${t}`)?.classList.toggle('active', t === tab);
    document.getElementById(`panel-${t}`).style.display = t === tab ? 'block' : 'none';
  });
}

// 📦 STORE (SEALED) 📦
function renderStoreGrid(products) {
  const grid = document.getElementById('storeGrid');
  if (!grid) return;
  grid.innerHTML = products.map(p => `
    <div class="mp-listing" style="border:1px solid var(--border)">
      <div class="mp-listing-img" style="background:${p.bg||'#0f0f1a'};padding:10px;height:240px;display:flex;align-items:center;justify-content:center">
        <img src="${p.img}" style="max-height:100%;max-width:100%;object-fit:contain;filter:drop-shadow(0 10px 15px rgba(0,0,0,0.5))" onerror="this.outerHTML='<div style=\\'color:white\\'>Immagine non trovata</div>'">
      </div>
      <div class="mp-listing-body">
        <div class="mp-listing-name">${p.name}</div>
        <div class="mp-listing-set">${p.game}</div>
        <div class="mp-listing-footer" style="margin-top:8px">
          <div class="mp-price">€${p.price.toFixed(2)}</div>
        </div>
        <div class="mp-listing-actions">
          <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="buySealed('${p.id}')">🛒 Acquista e Sbusta</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterStore() {
  const q = (document.getElementById('storeSearch')?.value || '').toLowerCase();
  const game = document.getElementById('storeGame')?.value || '';
  let filtered = SEALED_PRODUCTS.filter(p => p.name.toLowerCase().includes(q) && (game === '' || p.game.includes(game)));
  renderStoreGrid(filtered);
}

function buySealed(id) {
  const prod = SEALED_PRODUCTS.find(p => p.id === id);
  if(!prod) return;
  document.getElementById('purchaseTitle').textContent = 'Conferma Acquisto Sigillato';
  document.getElementById('purchaseBody').innerHTML = `
    <div style="height:200px;margin-bottom:1.5rem;border-radius:12px;overflow:hidden;background:${prod.bg||'#0f0f1a'};display:flex;align-items:center;justify-content:center;padding:10px">
      <img src="${prod.img}" style="max-height:100%;object-fit:contain">
    </div>
    <div class="vs-row" style="margin-bottom:8px"><span>Prodotto</span><span style="font-weight:700">${prod.name}</span></div>
    <div class="vs-row" style="margin-bottom:8px"><span>Gioco</span><span>${prod.game}</span></div>
    <div class="vs-row" style="margin-bottom:16px"><span>Costo</span><span style="font-weight:900;font-size:1.2rem;color:var(--gold)">€${prod.price.toFixed(2)}</span></div>
    <div class="vs-row" style="margin-bottom:16px"><span>Saldo Wallet</span><span class="wallet-amount" style="color:var(--green)">€${window.unwrapWallet.toFixed(2)}</span></div>

    <div style="background:rgba(16,185,129,0.1);border:1px solid var(--green);border-radius:8px;padding:1rem;font-size:0.85rem;color:var(--text-secondary);margin-bottom:1.5rem">
      <strong style="color:var(--green)">Come funziona:</strong><br>
      Il prodotto viene inviato direttamente alla <strong>Live Opening</strong> per lo sbustamento 1:1, creando la Proof of Pull.
    </div>

    <button class="btn btn-primary" style="width:100%;justify-content:center;font-size:1.05rem;padding:12px" onclick="completePurchaseSealed('${prod.id}')">
      ✅ Paga e Vai alla Live
    </button>
  `;
  document.getElementById('purchaseModal').classList.add('open');
}

function completePurchaseSealed(id) {
  const prod = SEALED_PRODUCTS.find(p => p.id === id);
  if(!prod) return;
  if (window.unwrapWallet < prod.price) {
    showNotif('❌ Fondi Insufficienti', 'Ricarica il tuo Wallet.', '');
    return;
  }
  window.unwrapWallet -= prod.price;
  if(typeof updateWalletUI === 'function') updateWalletUI();
  document.getElementById('purchaseModal').classList.remove('open');
  showNotif('📦 Ordine Completato!', `${prod.name} in caricamento...`, 'success');
  
  setTimeout(() => { 
    window.location.href = `live.html?packReady=true&game=${encodeURIComponent(prod.game)}`; 
  }, 1500);
}

// 🃏 SINGLES E SWAP 🃏
const BADGE_MAP = {
  sale:  '<div class="listing-badge badge-sale">💰 Solo Vendita</div>',
  trade: '<div class="listing-badge badge-trade">🔄 Valuta Scambio</div>',
  mixed: '<div class="listing-badge badge-mixed">🤝 Scambio + Conguaglio</div>'
};

function renderMarketGrid(listings) {
  const grid = document.getElementById('mpGrid');
  if (!grid) return;
  grid.innerHTML = listings.map(card => `
    <div class="mp-listing">
      <div class="mp-listing-img" style="background:${card.bg||'#0f0f1a'};position:relative;overflow:hidden;cursor:pointer;padding:8px" onclick="openPurchaseModal(${card.id})">
        <img src="${card.img}" alt="${card.name}" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'" loading="lazy" />
        ${card.rarity ? `<div class="card-item-rarity rarity-${card.rarity}" style="position:absolute;top:4px;right:4px">${card.rarity.toUpperCase()}</div>` : ''}
        ${card.grade ? `<div class="card-item-grade" style="position:absolute;top:4px;left:4px">💎 ${card.grade}</div>` : ''}
        ${card.proof ? `<div class="proof-badge" style="cursor:pointer;z-index:2" onclick="event.stopPropagation();openProofVideo(${JSON.stringify(card).replace(/"/g,'&quot;')})">🎥 PROOF</div>` : ''}
      </div>
      <div class="mp-listing-body">
        ${BADGE_MAP[card.listingType] || BADGE_MAP.sale}
        <div class="mp-listing-name">${card.name}</div>
        <div class="mp-listing-set">${card.set || ''} • ${card.game || ''}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">Venditore: @${card.seller}</div>
        <div class="mp-listing-footer">
          <div class="mp-price">€${card.price.toFixed(2)}</div>
        </div>
        <div class="mp-listing-actions">
          ${card.listingType !== 'sale' 
            ? `<button class="btn btn-outline" style="flex:1;justify-content:center;padding:8px" onclick="openSwapModal(${card.id}, '${card.listingType}')">🤝 Proponi</button>`
            : ''
          }
          <button class="btn btn-primary" style="flex:1;justify-content:center;padding:8px" onclick="openPurchaseModal(${card.id})">🛒 Acquista</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterMarket() {
  const q = (document.getElementById('mpSearch')?.value || '').toLowerCase();
  const set = document.getElementById('mpSet')?.value || '';
  const sort = document.getElementById('mpSort')?.value || '';
  const listingType = document.getElementById('mpListingType')?.value || '';
  
  let filtered = MARKET_LISTINGS.filter(c => {
    if (c.owner === 'me' && !c.isListed) return false;
    
    const matchQ = !q || c.name.toLowerCase().includes(q) || (c.set||'').toLowerCase().includes(q);
    const matchSet = !set || (c.set||'').includes(set);
    const matchType = !listingType || c.listingType === listingType;
    return matchQ && matchSet && matchType;
  });
  
  if (sort.includes('Decrescente')) filtered.sort((a,b) => b.price - a.price);
  else filtered.sort((a,b) => a.price - b.price);
  renderMarketGrid(filtered);
}

function openPurchaseModal(id) {
  const card = MARKET_LISTINGS.find(c => c.id === id);
  if (!card) return;
  const comm = card.price * 0.05;
  document.getElementById('purchaseTitle').textContent = 'Dettaglio Inserzione';
  document.getElementById('purchaseBody').innerHTML = `
    <div style="height:260px;background:${card.bg||'#0f0f1a'};border-radius:var(--radius);overflow:hidden;margin-bottom:1.5rem;padding:1rem;display:flex;justify-content:center">
      <img src="${card.img}" style="height:100%;object-fit:contain" onerror="this.style.display='none'" />
    </div>
    <div style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1.5rem">
      <div class="vs-row"><span>Carta</span><span style="font-weight:700">${card.name}</span></div>
      <div class="vs-row"><span>Venditore</span><span>@${card.seller}</span></div>
      <div class="vs-row"><span>Proof of Pull</span><span style="color:var(--accent-light);cursor:pointer" onclick='openProofVideo(${JSON.stringify(card).replace(/"/g,"&apos;")})'>🎥 Guarda Video 4K</span></div>
      ${card.grade ? `<div class="vs-row"><span>Grading</span><span style="color:var(--gold)">💎 ${card.grade}</span></div>` : ''}
      <div class="vs-row"><span>Prezzo</span><span style="font-size:1.2rem;font-weight:900;color:var(--green)">€${card.price.toFixed(2)}</span></div>
      <div class="vs-row"><span>Commissione Unwrap (5%)</span><span style="color:var(--text-muted)">€${comm.toFixed(2)}</span></div>
    </div>
    <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="completePurchaseCard(${card.id})">✅ Paga e Trasferisci al tuo Vault</button>
  `;
  document.getElementById('purchaseModal').classList.add('open');
}

function completePurchaseCard(id) {
  const card = MARKET_LISTINGS.find(c => c.id === id);
  if(!card) return;
  const total = card.price * 1.05;
  if (window.unwrapWallet < total) {
    showNotif('❌ Fondi Insufficienti', 'Ricarica il tuo Wallet.', ''); return;
  }
  window.unwrapWallet -= total;
  if(typeof updateWalletUI === 'function') updateWalletUI();
  document.getElementById('purchaseModal').classList.remove('open');
  showNotif('✅ Transazione Completata!', `${card.name} è ora nel tuo Vault.`, 'success');
}

// 🔄 SWAP PROPOSAL LOGIC 🔄
let currentSwapTarget = null;
let currentSwapSelectedMyCard = null;

function openSwapModal(id, type) {
  const card = MARKET_LISTINGS.find(c => c.id === id);
  if (!card) return;
  currentSwapTarget = card;
  currentSwapSelectedMyCard = null;

  document.getElementById('swapTargetInfo').innerHTML = `
    <img src="${card.img}" style="width:40px;height:56px;object-fit:contain;background:${card.bg}">
    <div>
      <div style="font-weight:700;line-height:1.2">${card.name}</div>
      <div style="font-size:0.75rem;color:var(--text-muted)">Valore richiesto: €${card.price.toFixed(2)}</div>
    </div>
  `;

  document.getElementById('swapCashInputDiv').style.display = type === 'mixed' ? 'block' : 'none';

  const grid = document.getElementById('swapVaultGrid');
  let myVault = CARD_DB.filter(c => c.owner === 'me');
  try {
    const pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
    myVault = [...pulled, ...myVault];
  } catch(e) {}
  
  if(myVault.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:1rem">Non hai carte nel Vault da offrire.</div>`;
  } else {
    grid.innerHTML = myVault.map(c => `
      <div class="card-item swap-selectable" id="swapMyCard-${c.id}" onclick="selectMyCardForSwap('${c.id}')">
        <div style="background:${c.bg||'#0f0f1a'}">
          <img src="${c.img}" onerror="this.style.opacity=0.3">
        </div>
        <div>${c.name}${c.price ? `<br><span style="font-size:0.75rem;color:var(--green);font-weight:400">€${c.price.toFixed(2)}</span>` : ''}</div>
      </div>
    `).join('');
  }

  document.getElementById('swapProposalModal').classList.add('open');
}

function selectMyCardForSwap(id) {
  currentSwapSelectedMyCard = id;
  document.querySelectorAll('.swap-selectable').forEach(el => el.style.borderColor = 'transparent');
  document.getElementById(`swapMyCard-${id}`).style.borderColor = 'var(--accent)';
}

function confirmSwapProposal() {
  if(!currentSwapSelectedMyCard) {
    showNotif('Attenzione', 'Devi selezionare una carta dal tuo Vault da proporre.', '');
    return;
  }
  document.getElementById('swapProposalModal').classList.remove('open');
  showNotif('✅ Proposta Inviata', `La tua proposta di scambio è stata inviata a @${currentSwapTarget.seller}. Riceverai una notifica se accetta.`, 'success');
}

// --- INIT ---
window.addEventListener('DOMContentLoaded', () => {
  if(typeof updateWalletUI === 'function') updateWalletUI();
  renderStoreGrid(SEALED_PRODUCTS);
  renderMarketGrid(MARKET_LISTINGS);
  if(typeof renderBulkGrid === 'function') renderBulkGrid();
});

function renderBulkGrid() {
  const grid = document.getElementById('bulkGrid');
  if (!grid) return;
  
  let listings = [];
  try {
    listings = JSON.parse(localStorage.getItem('unwrap_bulk_listings') || '[]');
  } catch(e) {}
  
  const fakeLots = [
    { id: 'fake_1', count: 1250, weight: 2250, price: 22.50, seller: 'PokeMaster99' },
    { id: 'fake_2', count: 500, weight: 900, price: 9.00, seller: 'CharizardFan' }
  ];
  
  const allListings = [...listings, ...fakeLots];
  
  grid.innerHTML = allListings.map(lot => `
      <div class="mp-listing">
        <div class="mp-listing-img" style="background:#1a1a2e;display:flex;align-items:center;justify-content:center;font-size:3rem;padding:20px">
          📦
        </div>
        <div class="mp-listing-body">
          <div style="font-size:0.6rem;background:rgba(16,185,129,0.1);color:var(--green);border:1px solid rgba(16,185,129,0.3);padding:2px 6px;border-radius:4px;display:inline-block;margin-bottom:8px;font-weight:700">VENDITA LOTTO</div>
          <div class="mp-listing-name">Lotto Bulk (${lot.count} Carte)</div>
          <div class="mp-listing-set">Peso: ${lot.weight}g</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">Venditore: @${lot.seller}</div>
          <div class="mp-listing-footer">
            <div class="mp-price">€${parseFloat(lot.price).toFixed(2)}</div>
          </div>
          <div class="mp-listing-actions">
            <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="buyBulkLot('${lot.id}', ${lot.price})">🛒 Acquista</button>
          </div>
        </div>
      </div>
  `).join('');
}

function buyBulkLot(id, price) {
  showNotif('Acquisto effettuato!', 'Lotto Bulk acquistato per €' + parseFloat(price).toFixed(2), 'success');
  
  if (id.startsWith('bulk_')) {
    try {
      let listings = JSON.parse(localStorage.getItem('unwrap_bulk_listings') || '[]');
      listings = listings.filter(l => l.id !== id);
      localStorage.setItem('unwrap_bulk_listings', JSON.stringify(listings));
      renderBulkGrid();
    } catch(e) {}
  }
}
