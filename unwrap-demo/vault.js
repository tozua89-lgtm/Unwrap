/* =============================================
   UNWRAP — Vault JS v9
   Fix Modal height, Offerte, Bulk info, Private vs Listed
   ============================================= */

let activeFilter = 'all';
let vaultCards = [];
let currentCashOfferCardId = null;

function syncGrading() {
  try {
    const graded = JSON.parse(localStorage.getItem('unwrap_graded') || '{}');
    CARD_DB.forEach(card => {
      if (graded[card.id]) {
        card.grade = graded[card.id].grade;
        card.gradeData = graded[card.id];
      }
    });
  } catch(e) {}
  
  vaultCards = [...CARD_DB.filter(c => c.owner === 'me')];
  
  try {
    const pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
    vaultCards = [...pulled, ...vaultCards];
  } catch(e) {}
}

function syncBulk() {
  try {
    const PRICE_PER_G = 0.01;
    const bulk = JSON.parse(localStorage.getItem('unwrap_bulk') || '{"count":415,"weight":747}');
    const count  = bulk.count;
    const weight = bulk.weight;
    const value  = (weight * PRICE_PER_G).toFixed(2);

    // Statistiche nella sidebar
    const elCount  = document.getElementById('statBulk');
    const elWeight = document.getElementById('statBulkWeight');
    if (elCount)  elCount.textContent  = count;
    if (elWeight) elWeight.textContent = weight + ' g';

    // Titolo nel pannello Bulk
    const elTitle = document.getElementById('bulkTitle');
    if (elTitle) {
      elTitle.innerHTML = `Il Tuo Bulk: ${count} Carte (${weight} Grammi) <span style="font-size:1rem;font-weight:400;color:var(--text-muted)">(Valutazione attuale: €0.01 / grammo)</span>`;
    }

    // Valore vendita
    const elSell = document.getElementById('bulkSellValue');
    if (elSell) elSell.textContent = '€' + value;
  } catch(e) {}
}


const INCOMING_OFFERS = [
  { id: 1, cardId: 3,  cardName: 'Umbreon VMAX (Alt Art)',  offer: 780.00, buyer: 'UmbreonCollector' },
  { id: 2, cardId: 6,  cardName: 'Charizard Holo (1999)',   offer: 420.00, buyer: 'NostalgicTrader'  },
  { id: 3, cardId: 22, cardName: 'Portgas D. Ace (SR)',      offer:  68.00, buyer: 'OnePieceFan_IT'   }
];

const SWAP_BOARD = [
  { id: 'sb1', ...OTHER_VAULTS[0].cards[0], owner: OTHER_VAULTS[0].user, seeking: 'Lugia VSTAR' },
  { id: 'sb2', ...OTHER_VAULTS[1].cards[0], owner: OTHER_VAULTS[1].user, seeking: 'Charizard Holo' }
];

function setVaultTab(tab) {
  ['cards','bulk','offers','swapboard'].forEach(t => {
    document.getElementById(`tab-${t}`)?.classList.toggle('active', tab === t);
    const p = document.getElementById(`panel-${t}`);
    if(p) p.style.display = tab === t ? 'block' : 'none';
  });
  if(tab === 'offers') renderOffers();
  if(tab === 'swapboard') renderSwapBoard();
}

function renderCards(cards) {
  const grid = document.getElementById('cardsGrid');
  if (!grid) return;
  if (cards.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)">Nessuna carta trovata</div>`;
    return;
  }

  // Dividi le carte in due gruppi
  const listedCards  = cards.filter(c => c.isListed);
  const privateCards = cards.filter(c => !c.isListed);

  function cardHTML(card) {
    let imgHTML;
    if (card.grade) {
      imgHTML = `
        <div class="mini-slab-wrapper" style="height:100%;border:1px solid #7c3aed">
          <div class="mini-slab-label" style="background:linear-gradient(to bottom, #4c1d95, #7c3aed);color:white;border-color:#5b21b6">
            <div style="font-size:0.55rem;font-weight:700;line-height:1;max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${card.name}</div>
            <div class="mini-slab-score" style="background:var(--gold);color:black">${card.grade}</div>
          </div>
          <div style="height:calc(100% - 40px);background:#000;display:flex;align-items:center;justify-content:center;border-radius:4px;padding:4px">
            <img src="${card.img}" style="height:100%;object-fit:contain" onerror="this.style.display='none'">
          </div>
          <div class="mini-slab-brand">UNWRAP CERTIFIED · QR → PROOF</div>
        </div>`;
    } else {
      imgHTML = `<img src="${card.img}" alt="${card.name}" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none'" loading="lazy" />`;
    }

    return `
    <div class="card-item" style="${card.isFresh ? 'border:1px solid var(--gold);box-shadow:0 0 15px rgba(245,158,11,0.2)' : ''}">
      <div class="card-item-img" style="background:${card.grade ? 'transparent' : (card.bg||'#0f0f1a')};position:relative;overflow:hidden;cursor:pointer;padding:${card.grade?'0':'8px'}" onclick="openCardDetail('${card.id}')">
        ${imgHTML}
        ${!card.grade && card.rarity ? `<div class="card-item-rarity rarity-${card.rarity}" style="position:absolute;top:4px;right:4px">${card.rarity.toUpperCase()}</div>` : ''}
        ${card.proof && !card.grade ? `<div class="proof-badge" style="cursor:pointer;z-index:2;bottom:${card.isFresh?'18px':'4px'}" onclick="event.stopPropagation();openProofVideo(${JSON.stringify(card).replace(/"/g,'&quot;')})">▶ PROOF</div>` : ''}
        ${card.isFresh ? `<div style="position:absolute;bottom:0;left:0;right:0;background:var(--gold);color:#000;font-size:0.6rem;text-align:center;font-weight:800;padding:2px;z-index:3">SBUSTATA < 48h</div>` : ''}
      </div>
      <div class="card-item-info">
        <div class="card-item-name">${card.name}</div>
        <div class="card-item-set">${card.set || ''} ${card.game ? '· '+card.game : ''}</div>
        <div class="card-item-footer">
          <div class="card-item-price">€${card.price.toFixed(2)}</div>
        </div>
        <div style="display:flex;gap:4px;margin-top:8px">
          <button class="btn" style="flex:1;padding:5px;font-size:0.65rem;background:rgba(16,185,129,0.1);color:var(--green);border:1px solid var(--green);border-radius:4px;justify-content:center" onclick="openSellModal('${card.id}')">${card.isListed ? '✏️ Modifica Ins.' : '📢 Pubblica'}</button>
          <button class="btn" style="flex:1;padding:5px;font-size:0.65rem;background:rgba(124,58,237,0.1);color:var(--accent-light);border:1px solid var(--accent);border-radius:4px;justify-content:center" onclick="openCardDetail('${card.id}')">📦 Spedisci</button>
        </div>
        ${card.isFresh ? `<button class="btn btn-gold" style="width:100%;margin-top:4px;padding:5px;font-size:0.7rem;justify-content:center;animation:pulse 2s infinite" onclick="openCashOfferModal('${card.id}')">⚡ Cash Offer 85%</button>` : ''}
        ${!card.grade ? `<a href="grading.html" class="btn" style="width:100%;margin-top:4px;padding:5px;font-size:0.65rem;justify-content:center;background:rgba(245,158,11,0.1);color:var(--gold);border:1px solid var(--gold);border-radius:4px;text-decoration:none">🤖 Grada (€20)</a>` : ''}
      </div>
    </div>`;
  }

  // Sezione IN VENDITA / SCAMBIO
  let html = '';

  if (listedCards.length > 0) {
    html += `
      <div style="grid-column:1/-1;display:flex;align-items:center;gap:1rem;margin-top:1rem;margin-bottom:0.5rem">
        <div style="width:12px;height:12px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green)"></div>
        <h3 style="margin:0;font-size:1rem;font-weight:800;color:var(--green)">Nel Marketplace — Visibili a tutti (${listedCards.length})</h3>
        <div style="flex:1;height:1px;background:linear-gradient(to right, rgba(16,185,129,0.4), transparent)"></div>
      </div>
      ${listedCards.map(cardHTML).join('')}
    `;
  }

  // Sezione PRIVATE
  if (privateCards.length > 0) {
    html += `
      <div style="grid-column:1/-1;display:flex;align-items:center;gap:1rem;margin-top:${listedCards.length > 0 ? '2rem' : '1rem'};margin-bottom:0.5rem">
        <div style="width:12px;height:12px;border-radius:50%;background:var(--border);border:2px solid var(--text-muted)"></div>
        <h3 style="margin:0;font-size:1rem;font-weight:800;color:var(--text-secondary)">🔒 Private — Solo nel tuo Vault (${privateCards.length})</h3>
        <div style="flex:1;height:1px;background:linear-gradient(to right, rgba(255,255,255,0.1), transparent)"></div>
      </div>
      ${privateCards.map(cardHTML).join('')}
    `;
  }

  grid.innerHTML = html;
}

function filterCards() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
  let filtered = vaultCards.filter(c => c.name.toLowerCase().includes(q) || (c.set||'').toLowerCase().includes(q));
  
  if (activeFilter === 'rare') filtered = filtered.filter(c => ['secret','ultra','rare'].includes(c.rarity));
  if (activeFilter === 'graded') filtered = filtered.filter(c => c.grade != null);
  
  renderCards(filtered);
}

function setFilter(filter, btn) {
  activeFilter = filter;
  document.querySelectorAll('#filterTabs .filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  filterCards();
}

function renderOffers() {
  const list = document.getElementById('offersList');
  if(!list) return;
  if (!INCOMING_OFFERS.length) {
    list.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-muted)">Nessuna offerta in sospeso.</div>`;
    return;
  }
  list.innerHTML = INCOMING_OFFERS.map(o => {
    // Trova la carta corrispondente nel vault per mostrare la miniatura
    const card = vaultCards.find(c => c.id === o.cardId);
    const cardImg = card ? card.img : '';
    const cardBg  = card ? (card.bg || '#0f0f1a') : '#0f0f1a';
    const cardSet  = card ? card.set : '';
    const cardGame = card ? card.game : '';

    return `
    <div class="offer-item" style="gap:1.5rem;align-items:center">
      <!-- MINIATURA CARTA -->
      <div style="flex-shrink:0;width:60px;height:84px;background:${cardBg};border-radius:6px;overflow:hidden;padding:4px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border)">
        ${cardImg
          ? `<img src="${cardImg}" style="width:100%;height:100%;object-fit:contain" onerror="this.parentElement.innerHTML='🃏'">`
          : `<span style="font-size:2rem">🃏</span>`
        }
      </div>

      <!-- INFO CARTA E OFFERENTE -->
      <div style="flex:1;min-width:0">
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:2px">
          @<strong style="color:white">${o.buyer}</strong> offre per:
        </div>
        <div style="font-weight:800;font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${o.cardName}</div>
        ${cardSet ? `<div style="font-size:0.72rem;color:var(--text-secondary);margin-top:2px">${cardSet} · ${cardGame}</div>` : ''}
        <div style="margin-top:6px;font-size:0.75rem;color:var(--text-muted)">Offerta di acquisto diretto — commissione 4% su Unwrap</div>
      </div>

      <!-- IMPORTO E AZIONI -->
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">
        <div style="font-size:1.6rem;font-weight:900;color:var(--green)">€${parseFloat(o.offer).toFixed(2)}</div>
        <button class="btn btn-primary" style="padding:6px 14px;font-size:0.8rem;justify-content:center;width:100%" onclick="acceptOffer(${o.id})">✓ Accetta</button>
        <button class="btn btn-outline" style="padding:6px 14px;font-size:0.8rem;justify-content:center;width:100%" onclick="declineOffer(${o.id})">✕ Rifiuta</button>
      </div>
    </div>`;
  }).join('');
}

function acceptOffer(id) {
  const off = INCOMING_OFFERS.find(o => o.id === id);
  if(!off) return;
  vaultCards = vaultCards.filter(c => c.id !== off.cardId);
  window.unwrapWallet += parseFloat(off.offer); // Fix bug sommatore stringa
  if(typeof updateWalletUI === 'function') updateWalletUI();
  INCOMING_OFFERS.splice(INCOMING_OFFERS.findIndex(o => o.id === id), 1);
  renderOffers(); filterCards();
  document.getElementById('statCards').textContent = vaultCards.length;
  showNotif('Offerta Accettata!', `€${parseFloat(off.offer).toFixed(2)} accreditati nel Wallet.`, 'success');
}

function declineOffer(id) {
  INCOMING_OFFERS.splice(INCOMING_OFFERS.findIndex(o => o.id === id), 1);
  renderOffers();
  showNotif('Offerta Rifiutata', '', '');
}

function renderSwapBoard() {
  const grid = document.getElementById('swapBoardGrid');
  if (!grid) return;
  grid.innerHTML = SWAP_BOARD.map(item => {
    const iHaveIt = vaultCards.find(c => c.name.includes(item.seeking));
    return `
    <div class="card-item" style="border:1px solid ${iHaveIt ? 'var(--accent)' : 'var(--border)'}">
      <div class="card-item-img" style="background:${item.bg||'#0f0f1a'};position:relative;overflow:hidden;padding:8px;height:140px">
        <img src="${item.img}" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'" />
        <div class="proof-badge" style="background:#f59e0b;color:#000;border:none">🔄 @${item.owner}</div>
      </div>
      <div class="card-item-info">
        <div class="card-item-name">${item.name}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">Valore: €${item.price.toFixed(2)}</div>
        <div style="padding:6px;background:rgba(124,58,237,0.1);border:1px solid var(--accent);border-radius:6px;font-size:0.7rem;margin:6px 0">
          Cerca: <span style="color:var(--accent-light);font-weight:700">${item.seeking}</span>
        </div>
        ${iHaveIt
          ? `<button class="btn btn-primary" style="width:100%;justify-content:center;font-size:0.8rem" onclick="instantSwap('${item.id}', ${iHaveIt.id})">✓ Accetta Swap</button>
             <div style="font-size:0.6rem;color:var(--green);text-align:center;margin-top:2px">Hai la carta!</div>`
          : `<button class="btn" style="width:100%;justify-content:center;font-size:0.8rem;color:var(--text-muted);border:1px solid var(--border)" disabled>Non hai la carta</button>`
        }
      </div>
    </div>`;
  }).join('');
}

function instantSwap(swapId, myCardId) {
  const sw = SWAP_BOARD.find(s => s.id === swapId);
  const my = vaultCards.find(c => c.id === myCardId);
  if(!sw || !my) return;
  
  vaultCards = vaultCards.filter(c => c.id !== myCardId);
  vaultCards.push({ id: Date.now(), name: sw.name, set: sw.set, rarity: sw.rarity, price: sw.price, img: sw.img, bg: sw.bg, owner: 'me', proof: true, isFresh: false, isListed: false });
  SWAP_BOARD.splice(SWAP_BOARD.findIndex(s => s.id === swapId), 1);
  document.getElementById('statCards').textContent = vaultCards.length;
  filterCards(); renderSwapBoard();
  showNotif('✅ Swap Completato!', `${sw.name} è nel tuo Vault.`, 'success');
}

function openCardDetail(id) {
  const card = vaultCards.find(c => String(c.id) === String(id));
  if (!card) return;
  document.getElementById('cardDetailTitle').textContent = card.name;

  let cardVisual;
  if (card.grade) {
    const gd = card.gradeData || {cent:'9.5', surf:'9.5', edge:'9.0', corn:'9.5', cert:'XXXXX'};
    
    // Il VERO QR CODE (Identico a grading.js)
    const qrSvg = `<svg viewBox="0 0 21 21" width="40" height="40" style="background:white;border-radius:2px;padding:2px"><rect fill="#000" x="0" y="0" width="7" height="7"/><rect fill="#fff" x="1" y="1" width="5" height="5"/><rect fill="#000" x="2" y="2" width="3" height="3"/><rect fill="#000" x="14" y="0" width="7" height="7"/><rect fill="#fff" x="15" y="1" width="5" height="5"/><rect fill="#000" x="16" y="2" width="3" height="3"/><rect fill="#000" x="0" y="14" width="7" height="7"/><rect fill="#fff" x="1" y="15" width="5" height="5"/><rect fill="#000" x="2" y="16" width="3" height="3"/><rect fill="#000" x="8" y="2" width="1" height="1"/><rect fill="#000" x="10" y="0" width="1" height="3"/><rect fill="#000" x="8" y="6" width="5" height="1"/><rect fill="#000" x="8" y="8" width="1" height="5"/><rect fill="#000" x="10" y="8" width="3" height="1"/><rect fill="#000" x="12" y="10" width="1" height="3"/><rect fill="#000" x="14" y="8" width="1" height="3"/><rect fill="#000" x="16" y="9" width="3" height="1"/><rect fill="#000" x="8" y="14" width="1" height="3"/><rect fill="#000" x="10" y="14" width="3" height="1"/><rect fill="#000" x="14" y="14" width="3" height="3"/><rect fill="#000" x="18" y="14" width="1" height="3"/><rect fill="#000" x="14" y="18" width="1" height="1"/><rect fill="#000" x="18" y="18" width="3" height="3"/></svg>`;

    cardVisual = `
      <div class="slab-premium-wrapper" style="transform:scale(0.85); transform-origin:center center; width:100%; display:flex; justify-content:center;">
        <div class="slab-premium" style="border-color:#7c3aed; box-shadow:0 0 20px rgba(124,58,237,0.3); margin: 0;">
          <div class="slab-label" style="background:linear-gradient(to bottom, #4c1d95, #7c3aed);color:white;border-color:#5b21b6">
            <div class="slab-label-info">
              <div class="slab-title">${card.name.toUpperCase()}</div>
              <div class="slab-set" style="color:rgba(255,255,255,0.7)">${card.game || 'SET'}</div>
              <div class="slab-brand-tag" style="color:white">UNWRAP CERTIFIED AI</div>
            </div>
            <div class="slab-grade-box" style="background:var(--gold);color:black">
              <div class="slab-grade-num">${card.grade}</div>
              <div class="slab-grade-text" style="color:black">${gd.tag || 'MINT'}</div>
            </div>
          </div>
          <div class="slab-subgrades">
            <div class="subgrade"><div class="sub-label">CENT</div><div class="sub-val">${gd.cent}</div></div>
            <div class="subgrade"><div class="sub-label">SURF</div><div class="sub-val">${gd.surf}</div></div>
            <div class="subgrade"><div class="sub-label">EDGE</div><div class="sub-val">${gd.edge}</div></div>
            <div class="subgrade"><div class="sub-label">CORN</div><div class="sub-val">${gd.corn}</div></div>
          </div>
          <div class="slab-card-container"><img src="${card.img}"></div>
          <div class="slab-footer">
            <div style="display:flex;align-items:center;gap:10px">
              <div title="Scansiona per il video Proof of Pull" style="cursor:pointer">${qrSvg}</div>
              <div style="font-size:0.65rem;color:rgba(255,255,255,0.5);line-height:1.3">
                <div>Scansiona il QR per vedere</div>
                <div style="color:var(--accent-light);font-weight:700">il video Proof of Pull 4K</div>
              </div>
            </div>
            <div class="slab-cert">CERT: ${gd.cert || '12345ABC'}</div>
          </div>
        </div>
      </div>`;
  } else {
    // Carta NON GRADATA: mostra la carta intera senza zoom eccessivo
    cardVisual = `<img src="${card.img}" style="max-height:100%;max-width:100%;object-fit:contain;" onerror="this.style.display='none'" />`;
  }

  document.getElementById('cardDetailBody').innerHTML = `
    <div style="
      height:${card.grade ? '520px' : '300px'};
      background:${card.grade ? 'transparent' : (card.bg || '#0f0f1a')};
      border-radius:var(--radius);
      display:flex;
      align-items:center;
      justify-content:center;
      margin-bottom:1.5rem;
      padding:${card.grade ? '0' : '20px'};
      overflow:visible;
    ">
      ${cardVisual}
    </div>
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.5rem">
      <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="document.getElementById('cardDetailModal').classList.remove('open');openProofVideo(${JSON.stringify(card).replace(/"/g,"'")})">▶ Proof of Pull Video</button>
      ${!card.grade ? `<a href="grading.html" class="btn btn-outline" style="flex:1;justify-content:center;text-decoration:none">🤖 Grada con AI (€20)</a>` : ''}
    </div>
    <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:1rem;border:1px solid var(--border)">
      <h4 style="margin-top:0;margin-bottom:10px">📦 Spedizione a Casa</h4>
      <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:10px">La carta è custodita nel caveau a temperatura controllata. Puoi richiedere la spedizione assicurata in qualsiasi momento.</p>
      <button class="btn btn-outline" style="width:100%;justify-content:center" onclick="shipCard('${card.id}')">Richiedi Spedizione Assicurata</button>
    </div>`;
  document.getElementById('cardDetailModal').classList.add('open');
}

function shipCard(id) {
  document.getElementById('cardDetailModal').classList.remove('open');
  showNotif('📦 Spedizione Richiesta', 'Verrà spedita assicurata entro 24h.', 'success');
  vaultCards = vaultCards.filter(c => c.id !== id);
  filterCards();
  document.getElementById('statCards').textContent = vaultCards.length;
}

// ─── GESTIONE INSERZIONE (MARKETPLACE) ──────────────
function openSellModal(id) {
  const card = vaultCards.find(c => String(c.id) === String(id));
  if (!card) return;
  const types = card.listingTypes || (card.listingType ? [card.listingType] : []);

  document.getElementById('sellModalBody').innerHTML = `
    <!-- Anteprima carta -->
    <div style="display:flex;gap:1rem;margin-bottom:1.25rem;background:var(--bg-secondary);padding:0.85rem;border-radius:8px;align-items:center">
      <div style="width:52px;height:72px;background:${card.bg||'#0f0f1a'};padding:3px;border-radius:4px;flex-shrink:0">
        <img src="${card.img}" style="width:100%;height:100%;object-fit:contain;">
      </div>
      <div>
        <div style="font-weight:700;font-size:0.95rem">${card.name}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">${card.set} · ${card.game}</div>
        <div style="font-size:0.75rem;margin-top:4px">${card.isListed
          ? '<span style="color:var(--green)">✓ Già nel Marketplace</span>'
          : '<span style="color:var(--text-muted)">🔒 Privata (non visibile)</span>'
        }</div>
      </div>
    </div>

    <!-- Label istruzione -->
    <div style="font-size:0.8rem;font-weight:700;color:var(--text-secondary);margin-bottom:0.75rem;letter-spacing:0.05em">
      SCEGLI UNA O PIÙ MODALITÀ DI INSERZIONE
    </div>

    <!-- Checkbox: Vendita -->
    <label style="display:flex;align-items:flex-start;gap:10px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:0.85rem;margin-bottom:0.5rem;cursor:pointer" onclick="toggleListingSection('saleSection', this)">
      <input type="checkbox" id="chk-sale" ${types.includes('sale')?'checked':''} style="width:18px;height:18px;accent-color:var(--green);margin-top:1px;flex-shrink:0">
      <div>
        <div style="font-weight:700;color:var(--green)">💳 In Vendita</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">Acquisto diretto al prezzo che imposti</div>
      </div>
    </label>
    <div id="saleSection" style="padding:0 0.5rem 0.5rem;display:${types.includes('sale')?'block':'none'}">
      <label class="form-label">Prezzo di Vendita (€)</label>
      <input class="form-input" type="number" id="sellPrice" value="${card.price}" placeholder="es. 95.00" style="margin-bottom:0.5rem">
    </div>

    <!-- Checkbox: Scambio 1:1 -->
    <label style="display:flex;align-items:flex-start;gap:10px;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.3);border-radius:8px;padding:0.85rem;margin-bottom:0.5rem;cursor:pointer" onclick="toggleListingSection('tradeSection', this)">
      <input type="checkbox" id="chk-trade" ${types.includes('trade')?'checked':''} style="width:18px;height:18px;accent-color:var(--accent-light);margin-top:1px;flex-shrink:0">
      <div>
        <div style="font-weight:700;color:var(--accent-light)">🔄 Valuto Scambio 1:1</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">Scambio diretto con un'altra carta</div>
      </div>
    </label>
    <div id="tradeSection" style="padding:0 0.5rem 0.5rem;display:${types.includes('trade')?'block':'none'}">
      <label class="form-label">Cosa cerchi in cambio? (facoltativo)</label>
      <input class="form-input" type="text" id="tradeWant" value="${card.tradeWant||''}" placeholder="es. Charizard ex SIR, Umbreon VMAX..." style="margin-bottom:0.5rem">
    </div>

    <!-- Checkbox: Scambio + Conguaglio -->
    <label style="display:flex;align-items:flex-start;gap:10px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:0.85rem;margin-bottom:0.5rem;cursor:pointer" onclick="toggleListingSection('mixedSection', this)">
      <input type="checkbox" id="chk-mixed" ${types.includes('mixed')?'checked':''} style="width:18px;height:18px;accent-color:var(--gold);margin-top:1px;flex-shrink:0">
      <div>
        <div style="font-weight:700;color:var(--gold)">💰 Scambio con Conguaglio</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">Scambio + differenza in denaro</div>
      </div>
    </label>
    <div id="mixedSection" style="padding:0 0.5rem 0.5rem;display:${types.includes('mixed')?'block':'none'}">
      <label class="form-label">Conguaglio richiesto (€)</label>
      <input class="form-input" type="number" id="mixedAmount" value="${card.mixedAmount||''}" placeholder="es. 30.00" style="margin-bottom:0.5rem">
    </div>

    <!-- Nota visibilità -->
    <div style="font-size:0.72rem;color:var(--text-muted);background:rgba(255,255,255,0.04);border-radius:6px;padding:0.6rem;margin-top:0.25rem;margin-bottom:1rem">
      💡 Selezionando più opzioni, gli altri utenti vedranno tutte le modalità disponibili per questa carta e potranno scegliere come contattarti.
    </div>

    <!-- Bottoni azione -->
    <div style="display:flex;gap:10px">
      ${card.isListed ? `<button class="btn btn-outline" style="flex:1;justify-content:center;color:#ef4444;border-color:#ef4444;font-size:0.8rem" onclick="removeListing('${card.id}')">✕ Rimuovi</button>` : ''}
      <button class="btn btn-primary" style="flex:2;justify-content:center" onclick="confirmListing('${card.id}')">${card.isListed ? '✓ Aggiorna' : '🌐 Pubblica Inserzione'}</button>
    </div>
  `;
  document.getElementById('sellModal').classList.add('open');
}

function toggleListingSection(sectionId, labelEl) {
  // Non fare nulla qui — il click sul checkbox gestisce già il toggle nativo.
  // Usiamo un MutationObserver alternativo: leggiamo lo stato dopo il click.
  setTimeout(() => {
    const chk = labelEl.querySelector('input[type="checkbox"]');
    const section = document.getElementById(sectionId);
    if (section) section.style.display = chk && chk.checked ? 'block' : 'none';
  }, 0);
}

function confirmListing(id) {
  const card = vaultCards.find(c => String(c.id) === String(id));
  if (!card) return;

  const types = [];
  if (document.getElementById('chk-sale')?.checked)  types.push('sale');
  if (document.getElementById('chk-trade')?.checked) types.push('trade');
  if (document.getElementById('chk-mixed')?.checked) types.push('mixed');

  if (types.length === 0) {
    showNotif('⚠️ Nessuna modalità', 'Seleziona almeno una opzione di inserzione.', '');
    return;
  }

  card.isListed     = true;
  card.listingTypes = types;
  card.listingType  = types[0]; // retrocompatibilità
  card.price        = parseFloat(document.getElementById('sellPrice')?.value)  || card.price;
  card.tradeWant    = document.getElementById('tradeWant')?.value  || '';
  card.mixedAmount  = parseFloat(document.getElementById('mixedAmount')?.value) || 0;

  document.getElementById('sellModal').classList.remove('open');
  filterCards();
  const modeLabel = types.map(t => ({'sale':'Vendita','trade':'Scambio','mixed':'Scambio+Conguaglio'}[t])).join(' · ');
  showNotif('🌐 Inserzione Attiva', `Modalità: ${modeLabel}`, 'success');
}

function removeListing(id) {
  const card = vaultCards.find(c => String(c.id) === String(id));
  if (!card) return;
  card.isListed = false;
  card.listingType = null;
  
  document.getElementById('sellModal').classList.remove('open');
  filterCards();
  showNotif('🔒 Carta Resa Privata', 'La carta è stata rimossa dal Marketplace ed è tornata privata.', '');
}

// ─── BULK ─────────────────────────────────────
function sellBulk() {
  window.unwrapWallet += 4.15;
  if(typeof updateWalletUI === 'function') updateWalletUI();
  document.getElementById('statBulk').textContent = '0';
  document.getElementById('statBulkWeight').textContent = '0 g';
  document.getElementById('bulkTitle').innerHTML = 'Il Tuo Bulk: 0 Carte <span style="font-size:1rem;font-weight:400;color:var(--text-muted)">(Valutazione attuale: €0.01 / grammo)</span>';
  showNotif('Bulk Venduto!', '€4.15 accreditati sul Wallet.', 'success');
}

// ─── CASH OFFER ───────────────────────────────
let vaultCoTimer = null;
function openCashOfferModal(id) {
  const card = vaultCards.find(c => String(c.id) === String(id));
  if (!card) return;
  currentCashOfferCardId = id;
  const offer = card.price * 0.85;
  document.getElementById('coCardName').textContent = card.name;
  document.getElementById('coMarketVal').textContent = card.price.toFixed(2);
  document.getElementById('coOfferVal').textContent = offer.toFixed(2);
  document.getElementById('cashOfferModal').classList.add('open');
  if(vaultCoTimer) clearInterval(vaultCoTimer);
  let s = 172500;
  vaultCoTimer = setInterval(() => {
    document.getElementById('coTimer').textContent = `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
    s--;
  }, 1000);
}

function acceptCashOfferFromVault() {
  if(vaultCoTimer) clearInterval(vaultCoTimer);
  document.getElementById('cashOfferModal').classList.remove('open');
  const card = vaultCards.find(c => String(c.id) === String(currentCashOfferCardId));
  if(!card) return;
  const offer = card.price * 0.85;
  window.unwrapWallet += offer;
  if(typeof updateWalletUI === 'function') updateWalletUI();
  
  vaultCards = vaultCards.filter(c => String(c.id) !== String(currentCashOfferCardId));
  
  try {
    let pulled = JSON.parse(localStorage.getItem('unwrap_pulled_cards') || '[]');
    pulled = pulled.filter(c => String(c.id) !== String(currentCashOfferCardId));
    localStorage.setItem('unwrap_pulled_cards', JSON.stringify(pulled));
  } catch(e) {}
  
  filterCards();
  document.getElementById('statCards').textContent = vaultCards.length;
  showNotif('? Cash Offer Accettata!', '�' + offer.toFixed(2) + ' accreditati nel Wallet.', 'success');
}

window.addEventListener('DOMContentLoaded', () => {
  syncGrading();
  syncBulk();
  if(typeof updateWalletUI === 'function') updateWalletUI();
  renderCards(vaultCards);
  document.getElementById('statCards').textContent = vaultCards.length;
});






