/* =============================================
   UNWRAP — Proof of Pull 4K Video Simulator v3
   Animazione Sequenziale (Pacchetto -> Comuni -> Rara)
   ============================================= */

// Aggiunge la modale e il Canvas se non esiste
window.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('proofVideoModal')) {
    const modalHTML = `
      <div class="modal-overlay" id="proofVideoModal" style="z-index:99999;backdrop-filter:blur(15px);background:rgba(0,0,0,0.95)">
        <div class="modal" style="max-width:90vw;width:800px;background:#000;border:1px solid #333;padding:0;overflow:hidden;box-shadow:0 0 50px rgba(124,58,237,0.2)">
          <div style="position:absolute;top:1rem;right:1rem;z-index:10;display:flex;gap:1rem;align-items:center">
            <div style="background:rgba(239,68,68,0.2);color:#ef4444;border:1px solid #ef4444;padding:4px 10px;border-radius:4px;font-size:0.75rem;font-weight:900;letter-spacing:1px;animation:pulse 2s infinite">REC 4K</div>
            <button class="modal-close" style="position:static" onclick="closeProofVideo()">✕</button>
          </div>
          
          <div style="position:relative;width:100%;padding-bottom:56.25%;background:#111">
            <canvas id="proofCanvas" style="position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle at center, #1a1a2e 0%, #000 100%)"></canvas>
            <div id="proofOverlayText" style="position:absolute;bottom:2rem;left:0;width:100%;text-align:center;font-size:1.5rem;font-weight:800;color:white;text-shadow:0 2px 10px rgba(0,0,0,0.8);pointer-events:none;opacity:0;transition:opacity 0.3s ease"></div>
          </div>
          
          <div style="padding:1rem;background:#0f0f1a;border-top:1px solid #222;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:700;font-size:1.1rem" id="proofCardName">Carta</div>
              <div style="font-size:0.8rem;color:var(--text-muted)">Proof of Pull Certificato • Hash SHA-256: <span style="font-family:monospace;color:var(--accent-light)">0x8f7a...3c21</span></div>
            </div>
            <div style="text-align:right">
              <div style="font-size:0.7rem;color:var(--text-secondary)">Data Sbustamento</div>
              <div style="font-weight:700">Oggi, ${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
});

let proofAnimId;
let proofCardObj = null;

function openProofVideo(cardObj) {
  proofCardObj = cardObj;
  document.getElementById('proofCardName').textContent = cardObj.name;
  document.getElementById('proofVideoModal').classList.add('open');
  startCanvasSequence(cardObj);
}

function closeProofVideo() {
  document.getElementById('proofVideoModal').classList.remove('open');
  if(proofAnimId) cancelAnimationFrame(proofAnimId);
}

function startCanvasSequence(card) {
  const canvas = document.getElementById('proofCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const w = canvas.width;
  const h = canvas.height;
  
  const textOverlay = document.getElementById('proofOverlayText');
  
  let startTime = performance.now();
  
  // Immagini necessarie
  const packImg = new Image();
  // Usa il pacchetto TCGPlayer Pokemon o OP a seconda del gioco
  packImg.src = card.game === 'One Piece TCG' 
    ? 'https://wsrv.nl/?url=https://product-images.tcgplayer.com/fit-in/437x610/528829.jpg' 
    : 'https://wsrv.nl/?url=https://product-images.tcgplayer.com/fit-in/437x610/242255.jpg';
    
  const cardImg = new Image();
  cardImg.src = card.img;

  // Usa l'immagine comune per lo "slide" (Rattata o Chopper)
  const commonImg = new Image();
  commonImg.src = card.game === 'One Piece TCG'
    ? 'https://wsrv.nl/?url=https://product-images.tcgplayer.com/fit-in/437x610/453472.jpg'
    : 'https://wsrv.nl/?url=https://product-images.tcgplayer.com/fit-in/437x610/42439.jpg';

  // Disegniamo lo stato in base al tempo trascorso
  function render(time) {
    const elapsed = time - startTime;
    ctx.clearRect(0, 0, w, h);
    
    // Griglia/Tappetino di sfondo
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    for(let i=0; i<w; i+=50) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
    for(let i=0; i<h; i+=50) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w,i); ctx.stroke(); }
    ctx.restore();

    // CENTRO DELLO SCHERMO
    const cx = w/2;
    const cy = h/2;
    const cardW = 300;
    const cardH = 420;

    // FASE 1: PACCHETTO CHIUSO (0 - 2000ms)
    if (elapsed < 2000) {
      textOverlay.textContent = 'INQUADRATURA PACCHETTO SIGILLATO...';
      textOverlay.style.opacity = 1;
      
      if(packImg.complete && packImg.naturalHeight !== 0) {
        ctx.save();
        ctx.translate(cx, cy);
        // Piccolo respiro float
        ctx.translate(0, Math.sin(elapsed/200) * 5);
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;
        ctx.drawImage(packImg, -cardW/2, -cardH/2, cardW, cardH);
        ctx.restore();
      }
    }
    
    // FASE 2: APERTURA BIANCA / FLASH (2000 - 2500ms)
    else if (elapsed >= 2000 && elapsed < 2500) {
      textOverlay.style.opacity = 0;
      const flashAlpha = 1 - ((elapsed - 2000) / 500);
      ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
      ctx.fillRect(0, 0, w, h);
    }
    
    // FASE 3: CARTE COMUNI SFILANO (2500 - 5500ms)
    else if (elapsed >= 2500 && elapsed < 5500) {
      textOverlay.textContent = 'SCORRIMENTO CARTE COMUNI (BULK)...';
      textOverlay.style.opacity = 1;

      if(commonImg.complete) {
        // Logica di slittamento verso destra e sparizione
        const phaseElapsed = elapsed - 2500;
        const cardCycle = 750; // ogni 750ms sfiliamo una carta
        const currentCardIndex = Math.floor(phaseElapsed / cardCycle);
        const cycleProgress = (phaseElapsed % cardCycle) / cardCycle; // 0.0 -> 1.0

        ctx.save();
        ctx.translate(cx, cy);
        
        // Carta che sta sfilando
        const slideX = cycleProgress * (w/2 + 200);
        ctx.globalAlpha = 1 - cycleProgress;
        ctx.drawImage(commonImg, -cardW/2 + slideX, -cardH/2, cardW, cardH);
        
        // Carta successiva (fissa sotto)
        ctx.globalAlpha = 1;
        ctx.drawImage(commonImg, -cardW/2, -cardH/2, cardW, cardH);
        ctx.restore();
      }
    }
    
    // FASE 4: RIVELAZIONE DELLA RARA! (5500 - 7000ms)
    else if (elapsed >= 5500 && elapsed < 7000) {
      textOverlay.textContent = 'RIVELAZIONE DELLA HIT!';
      textOverlay.style.color = 'var(--gold)';
      textOverlay.style.textShadow = '0 0 10px rgba(245,158,11,0.8)';
      
      const revealProgress = (elapsed - 5500) / 1500; // 0.0 -> 1.0
      
      if(cardImg.complete) {
        ctx.save();
        ctx.translate(cx, cy);
        
        // Glow Effect crescente
        ctx.shadowColor = card.rarity === 'secret' ? 'rgba(239,68,68,1)' : 'rgba(245,158,11,1)';
        ctx.shadowBlur = revealProgress * 50;
        
        // Slide up dal basso
        const yOffset = (1 - revealProgress) * 100;
        
        ctx.globalAlpha = revealProgress;
        ctx.drawImage(cardImg, -cardW/2, -cardH/2 + yOffset, cardW, cardH);
        ctx.restore();
      }
    }

    // FASE 5: LA CARTA FISSA IN CAM (7000ms in poi)
    else {
      textOverlay.textContent = 'SBALLAMENTO REGISTRATO IN BLOCKCHAIN';
      textOverlay.style.color = 'white';
      textOverlay.style.textShadow = 'none';

      if(cardImg.complete) {
        ctx.save();
        ctx.translate(cx, cy);
        
        // Effetto Holografico Tilt
        const tiltX = Math.sin(elapsed/500) * 5;
        const tiltY = Math.cos(elapsed/700) * 5;
        ctx.rotate(tiltX * Math.PI / 180);
        
        ctx.shadowColor = card.rarity === 'secret' ? 'rgba(239,68,68,0.8)' : 'rgba(245,158,11,0.8)';
        ctx.shadowBlur = 40;
        
        ctx.drawImage(cardImg, -cardW/2, -cardH/2 + tiltY, cardW, cardH);
        
        // Riflesso Luce (Shine) sulla carta
        ctx.globalCompositeOperation = 'overlay';
        const grad = ctx.createLinearGradient(-cardW/2, -cardH/2, cardW/2, cardH/2);
        const shinePos = ((elapsed/2000) % 2); // 0 -> 2
        grad.addColorStop(Math.max(0, shinePos-0.2), 'rgba(255,255,255,0)');
        grad.addColorStop(Math.min(1, Math.max(0, shinePos)), 'rgba(255,255,255,0.8)');
        grad.addColorStop(Math.min(1, shinePos+0.2), 'rgba(255,255,255,0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(-cardW/2, -cardH/2, cardW, cardH);
        ctx.restore();
      }
    }

    // Info overlay Camera fissa in alto a sinistra
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`ID: UNW-${Math.floor(elapsed)}`, 20, 30);
    ctx.fillText(`CAM 01 - 4K 60FPS`, 20, 50);

    proofAnimId = requestAnimationFrame(render);
  }

  proofAnimId = requestAnimationFrame(render);
}
