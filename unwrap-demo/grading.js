/* =============================================
   UNWRAP — Grading JS v4 (PSA/BGS options + Purple Slab)
   ============================================= */

let selectedService = null;
let selectedCardToGrade = null;

const GRADING_COST = 20.00;

function selectService(svc) {
  selectedService = svc;
  document.getElementById('stepService').style.display = 'none';

  if (svc === 'psa' || svc === 'bgs') {
    const label = svc === 'psa' ? 'PSA' : 'BGS / Beckett';
    document.getElementById('selectionTitle').textContent = `Invia a ${label}`;
    document.getElementById('selectionSubtitle').textContent = `Seleziona la carta dal tuo Vault da spedire fisicamente a ${label}.`;
    renderCardSelection(true); 
    document.getElementById('stepSelection').style.display = 'block';
    return;
  }

  // Unwrap AI
  document.getElementById('selectionTitle').textContent = 'Seleziona carta per AI Grading';
  document.getElementById('selectionSubtitle').textContent = `Costo: €${GRADING_COST.toFixed(2)} per carta. Il voto apparirà nel tuo Vault.`;
  renderCardSelection(false);
  document.getElementById('stepSelection').style.display = 'block';
}

function renderCardSelection(isRouting) {
  const grid = document.getElementById('vaultSelectGrid');
  if(!grid) return;
  const ungraded = CARD_DB.filter(c => c.owner === 'me' && !c.grade);
  if (ungraded.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-muted)">Tutte le carte del tuo Vault sono già gradate!</div>`;
    return;
  }
  grid.innerHTML = ungraded.map(card => `
    <div class="card-item" style="cursor:pointer;border:2px solid transparent;transition:all 0.2s"
      onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='transparent'"
      onclick="${isRouting ? `openRoutingOptions(${card.id})` : `startGrading(${card.id})`}">
      <div class="card-item-img" style="background:${card.bg||'#0f0f1a'};height:180px;padding:10px">
        <img src="${card.img}" style="width:100%;height:100%;object-fit:contain" onerror="this.style.display='none'">
      </div>
      <div class="card-item-info" style="text-align:center">
        <div class="card-item-name" style="font-size:0.8rem">${card.name}</div>
        <div style="font-size:0.7rem;color:var(--text-muted)">${card.game || ''}</div>
        <button class="btn btn-outline" style="width:100%;margin-top:10px;font-size:0.75rem;justify-content:center">
          ${isRouting ? '📦 Opzioni Invio' : '🤖 Grada (€20)'}
        </button>
      </div>
    </div>
  `).join('');
}

function openRoutingOptions(cardId) {
  const card = CARD_DB.find(c => c.id === cardId);
  const label = selectedService === 'psa' ? 'PSA' : 'BGS';
  
  // Apriamo la modale di routing options (che creiamo in grading.html o iniettiamo dinamicamente qui)
  const modalHTML = `
    <div class="modal-overlay open" id="routingModal">
      <div class="modal" style="max-width:500px">
        <div class="modal-header">
          <h3>Spedizione a ${label}</h3>
          <button class="modal-close" onclick="document.getElementById('routingModal').remove()">✕</button>
        </div>
        <div class="modal-body">
          <div style="display:flex;gap:1rem;margin-bottom:1rem;background:var(--bg-secondary);padding:10px;border-radius:8px">
            <img src="${card.img}" style="width:50px;height:70px;object-fit:contain;background:${card.bg}">
            <div><div style="font-weight:700">${card.name}</div><div style="font-size:0.8rem;color:var(--text-muted)">Seleziona la velocità di gradazione:</div></div>
          </div>
          
          <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem">
            
            <label style="border:1px solid var(--border);padding:1rem;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:15px;background:rgba(255,255,255,0.02)" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
              <input type="radio" name="routeOpt" value="standard" checked>
              <div style="flex:1">
                <div style="font-weight:700;margin-bottom:4px">Standard (Value)</div>
                <div style="font-size:0.8rem;color:var(--text-secondary)">Ritorno stimato in 45-60 giorni lavorativi.</div>
              </div>
              <div style="font-weight:900;font-size:1.1rem">€35</div>
            </label>
            
            <label style="border:1px solid var(--border);padding:1rem;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:15px;background:rgba(255,255,255,0.02)" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
              <input type="radio" name="routeOpt" value="express">
              <div style="flex:1">
                <div style="font-weight:700;margin-bottom:4px;color:var(--accent-light)">Express / Priority</div>
                <div style="font-size:0.8rem;color:var(--text-secondary)">Ritorno stimato in 15-20 giorni lavorativi.</div>
              </div>
              <div style="font-weight:900;font-size:1.1rem;color:var(--accent-light)">€75</div>
            </label>
          </div>
          
          <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:1.5rem">
            Il costo verrà detratto dal Wallet al momento della partenza della carta dal caveau (circa 48h). Include assicurazione e QR code Unwrap inserito nel database PSA/BGS.
          </div>
          
          <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="confirmRouting('${label}', ${card.id})">Conferma Invio e Paga</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function confirmRouting(label, cardId) {
  const opt = document.querySelector('input[name="routeOpt"]:checked').value;
  const cost = opt === 'standard' ? 35 : 75;
  
  if (window.unwrapWallet < cost) {
    showNotif('❌ Fondi Insufficienti', `Ricarica il tuo Wallet.`, '');
    return;
  }
  window.unwrapWallet -= cost;
  if(typeof updateWalletUI === 'function') updateWalletUI();
  
  document.getElementById('routingModal').remove();
  showNotif(`📦 Spedizione a ${label} Iniziata`, `L'opzione ${opt} è confermata. Riceverai il tracking.`, 'success');
  resetGrading();
}

// ─── UNWRAP AI GRADING ────────────────────────
function startGrading(cardId) {
  selectedCardToGrade = CARD_DB.find(c => c.id === cardId);
  if(!selectedCardToGrade) return;

  if (window.unwrapWallet < GRADING_COST) {
    showNotif('❌ Fondi Insufficienti', `Servono €${GRADING_COST.toFixed(2)} per il grading AI.`, '');
    return;
  }

  window.unwrapWallet -= GRADING_COST;
  if(typeof updateWalletUI === 'function') updateWalletUI();

  document.getElementById('stepSelection').style.display = 'none';
  document.getElementById('gradingProgress').style.display = 'block';
  document.getElementById('progressSteps').innerHTML = '';

  const steps = [
    { txt: '> Collegamento alla Proof of Pull 4K in archivio...', delay: 400 },
    { txt: '> Estrazione frame ad alta risoluzione...', delay: 1200 },
    { txt: '> Analisi Centratura (CENTERING) ± 0.01mm...', delay: 2200 },
    { txt: '> Scansione Superficie (SURFACE) micro-graffi...', delay: 3500 },
    { txt: '> Analisi Bordi (EDGES) integrità perimetrale...', delay: 4800 },
    { txt: '> Ispezione Angoli (CORNERS) 4 punti cardinali...', delay: 6000 },
    { txt: '> Calcolo Score Finale...', delay: 7200 },
    { txt: '> Generazione QR → link al video Proof of Pull...', delay: 8000 },
    { txt: '> Scrittura certificato in blockchain ✓', delay: 8800 },
  ];

  steps.forEach(step => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.style.color = 'var(--accent-light)';
      div.style.animation = 'fadeIn 0.3s ease';
      div.textContent = step.txt;
      document.getElementById('progressSteps').appendChild(div);
    }, step.delay);
  });

  setTimeout(() => showResult(selectedCardToGrade), 9500);
}

function showResult(card) {
  document.getElementById('gradingProgress').style.display = 'none';
  const resultDiv = document.getElementById('gradingResult');
  const container = document.getElementById('premiumSlabContainer');

  const sCent = (9 + Math.random()*1).toFixed(1);
  const sSurf = (9.5 + Math.random()*0.5).toFixed(1);
  const sEdge = (9 + Math.random()*1).toFixed(1);
  const sCorn = (9.5 + Math.random()*0.5).toFixed(1);
  const finalScore = ((parseFloat(sCent) + parseFloat(sSurf) + parseFloat(sEdge) + parseFloat(sCorn)) / 4).toFixed(1);

  let gradeTag = 'MINT';
  if (parseFloat(finalScore) >= 9.8) gradeTag = 'GEM MINT'; 
  if (finalScore === '10.0') gradeTag = 'PRISTINE'; 

  const certId = Math.random().toString(36).substring(2, 12).toUpperCase();
  card.grade = finalScore;
  card.gradeData = { cent: sCent, surf: sSurf, edge: sEdge, corn: sCorn, tag: gradeTag, cert: certId };

  try {
    const graded = JSON.parse(localStorage.getItem('unwrap_graded') || '{}');
    graded[card.id] = { grade: finalScore, ...card.gradeData };
    localStorage.setItem('unwrap_graded', JSON.stringify(graded));
  } catch(e) {}

  const qrSvg = `<svg viewBox="0 0 21 21" width="50" height="50" style="background:white;border-radius:2px;padding:2px"><rect fill="#000" x="0" y="0" width="7" height="7"/><rect fill="#fff" x="1" y="1" width="5" height="5"/><rect fill="#000" x="2" y="2" width="3" height="3"/><rect fill="#000" x="14" y="0" width="7" height="7"/><rect fill="#fff" x="15" y="1" width="5" height="5"/><rect fill="#000" x="16" y="2" width="3" height="3"/><rect fill="#000" x="0" y="14" width="7" height="7"/><rect fill="#fff" x="1" y="15" width="5" height="5"/><rect fill="#000" x="2" y="16" width="3" height="3"/><rect fill="#000" x="8" y="2" width="1" height="1"/><rect fill="#000" x="10" y="0" width="1" height="3"/><rect fill="#000" x="8" y="6" width="5" height="1"/><rect fill="#000" x="8" y="8" width="1" height="5"/><rect fill="#000" x="10" y="8" width="3" height="1"/><rect fill="#000" x="12" y="10" width="1" height="3"/><rect fill="#000" x="14" y="8" width="1" height="3"/><rect fill="#000" x="16" y="9" width="3" height="1"/><rect fill="#000" x="8" y="14" width="1" height="3"/><rect fill="#000" x="10" y="14" width="3" height="1"/><rect fill="#000" x="14" y="14" width="3" height="3"/><rect fill="#000" x="18" y="14" width="1" height="3"/><rect fill="#000" x="14" y="18" width="1" height="1"/><rect fill="#000" x="18" y="18" width="3" height="3"/></svg>`;

  container.innerHTML = `
    <div class="slab-premium-wrapper">
      <div class="slab-premium" style="border-color:#7c3aed;box-shadow:0 0 20px rgba(124,58,237,0.3)">
        
        <!-- VIOLACEA COME DA RICHIESTA -->
        <div class="slab-label" style="background:linear-gradient(to bottom, #4c1d95, #7c3aed);color:white;border-color:#5b21b6">
          <div class="slab-label-info">
            <div class="slab-title">${card.name.toUpperCase()}</div>
            <div class="slab-set" style="color:rgba(255,255,255,0.7)">${card.game || 'SET'}</div>
            <div class="slab-brand-tag" style="color:white">UNWRAP CERTIFIED AI GRADING</div>
          </div>
          <div class="slab-grade-box" style="background:var(--gold);color:black">
            <div class="slab-grade-num">${finalScore}</div>
            <div class="slab-grade-text" style="color:black">${gradeTag}</div>
          </div>
        </div>

        <div class="slab-subgrades">
          <div class="subgrade"><div class="sub-label">CENT</div><div class="sub-val ${parseFloat(sCent)>=10?'gold':''}">${sCent}</div></div>
          <div class="subgrade"><div class="sub-label">SURF</div><div class="sub-val ${parseFloat(sSurf)>=10?'gold':''}">${sSurf}</div></div>
          <div class="subgrade"><div class="sub-label">EDGE</div><div class="sub-val ${parseFloat(sEdge)>=10?'gold':''}">${sEdge}</div></div>
          <div class="subgrade"><div class="sub-label">CORN</div><div class="sub-val ${parseFloat(sCorn)>=10?'gold':''}">${sCorn}</div></div>
        </div>

        <div class="slab-card-container">
          <img src="${card.img}" onerror="this.style.display='none'">
        </div>

        <div class="slab-footer">
          <div style="display:flex;align-items:center;gap:10px">
            <div title="Scansiona per il video Proof of Pull" style="cursor:pointer">${qrSvg}</div>
            <div style="font-size:0.65rem;color:rgba(255,255,255,0.5);line-height:1.3">
              <div>Scansiona il QR per vedere</div>
              <div style="color:var(--accent-light);font-weight:700">il video Proof of Pull 4K</div>
            </div>
          </div>
          <div class="slab-cert">CERT: ${certId}</div>
        </div>
      </div>
    </div>
  `;

  resultDiv.style.display = 'block';
  showNotif('🏆 Grading Completato!', `${card.name} ha ottenuto un ${finalScore} (${gradeTag}).`, 'success');
}

function resetGrading() {
  selectedService = null;
  selectedCardToGrade = null;
  document.getElementById('gradingResult').style.display = 'none';
  document.getElementById('gradingProgress').style.display = 'none';
  document.getElementById('stepSelection').style.display = 'none';
  document.getElementById('stepService').style.display = 'block';
}

window.addEventListener('DOMContentLoaded', () => {
  if(typeof updateWalletUI === 'function') updateWalletUI();
});
