/* =============================================
   UNWRAP — Central Data Store v12 FINAL
   SOLO sorgenti pubbliche garantite (no hotlink block)
   - Carte Pokémon: images.pokemontcg.io  (CDN pubblico ufficiale)
   - Box/Pack: Wikimedia Commons  (nessuna restrizione)
   - One Piece: placeholder con carte Pokémon rare finché
     non esiste un'API pubblica stabile per quel TCG
   ============================================= */

window.unwrapWallet = 540.00;
window.bulkPoints = 0;

function updateWalletUI() {
  document.querySelectorAll('.wallet-amount').forEach(el => {
    el.textContent = `€${parseFloat(window.unwrapWallet).toFixed(2)}`;
  });
}

// ─── LE TUE CARTE NEL VAULT ──────────────────
const CARD_DB = [

  /* ═══════ POKÉMON TCG ═══════ */
  {
    id: 1, owner: 'me', game: 'Pokémon TCG',
    name: 'Charizard ex (SIR)', set: 'Paldean Fates', rarity: 'secret',
    price: 115.00, proof: true, isFresh: true, isListed: false, grade: null,
    img: 'https://images.pokemontcg.io/sv4pt5/234_hires.png', bg: '#1a0a00'
  },
  {
    id: 2, owner: 'me', game: 'Pokémon TCG',
    name: 'Pikachu VMAX (Rainbow Rare)', set: 'Vivid Voltage', rarity: 'secret',
    price: 125.00, proof: true, isFresh: false, isListed: true, listingType: 'mixed', grade: '9.5',
    gradeData: { cent: '9.5', surf: '9.7', edge: '9.3', corn: '9.5', tag: 'GEM MINT', cert: 'UNW2024A1' },
    img: 'https://images.pokemontcg.io/swsh4/188_hires.png', bg: '#1a1200'
  },
  {
    id: 3, owner: 'me', game: 'Pokémon TCG',
    name: 'Umbreon VMAX (Alt Art)', set: 'Evolving Skies', rarity: 'secret',
    price: 850.00, proof: true, isFresh: false, isListed: false, grade: null,
    img: 'https://images.pokemontcg.io/swsh7/215_hires.png', bg: '#0a0a1a'
  },
  {
    id: 4, owner: 'me', game: 'Pokémon TCG',
    name: 'Rayquaza VMAX (Alt Art)', set: 'Evolving Skies', rarity: 'secret',
    price: 360.00, proof: true, isFresh: false, isListed: true, listingType: 'sale', grade: null,
    img: 'https://images.pokemontcg.io/swsh7/218_hires.png', bg: '#001a0a'
  },
  {
    id: 5, owner: 'me', game: 'Pokémon TCG',
    name: 'Lugia VSTAR (Secret Rare)', set: 'Silver Tempest', rarity: 'secret',
    price: 22.00, proof: true, isFresh: true, isListed: false, grade: null,
    img: 'https://images.pokemontcg.io/swsh12/186_hires.png', bg: '#0a1020'
  },
  {
    id: 6, owner: 'me', game: 'Pokémon TCG',
    name: 'Charizard Holo (1999)', set: 'Base Set', rarity: 'rare',
    price: 450.00, proof: true, isFresh: false, isListed: true, listingType: 'trade', grade: null,
    img: 'https://images.pokemontcg.io/base1/4_hires.png', bg: '#1a0800'
  },
  {
    id: 7, owner: 'me', game: 'Pokémon TCG',
    name: 'Espeon VMAX (Alt Art)', set: 'Evolving Skies', rarity: 'secret',
    price: 215.00, proof: true, isFresh: false, isListed: false, grade: null,
    img: 'https://images.pokemontcg.io/swsh7/216_hires.png', bg: '#1a0a1a'
  },
  {
    id: 8, owner: 'me', game: 'Pokémon TCG',
    name: 'Mewtwo VSTAR (SIR)', set: 'Pokémon GO', rarity: 'secret',
    price: 95.00, proof: true, isFresh: false, isListed: false, grade: null,
    img: 'https://images.pokemontcg.io/pgo/71_hires.png', bg: '#0d0d1a'
  },

  /* ═══════ ONE PIECE TCG ═══════
     Nota: non esiste un CDN pubblico ufficiale. Usiamo carte
     Pokémon forti visivamente come placeholder riconoscibili,
     in attesa di un'API One Piece pubblica stabile. */
  {
    id: 20, owner: 'me', game: 'One Piece TCG',
    name: 'Monkey D. Luffy (Manga Rare)', set: 'OP-05 Awakening', rarity: 'secret',
    price: 950.00, proof: true, isFresh: false, isListed: false, grade: null,
    img: 'https://images.pokemontcg.io/swsh9/182_hires.png', bg: '#1a0a05'
  },
  {
    id: 21, owner: 'me', game: 'One Piece TCG',
    name: 'Roronoa Zoro (Alt Art)', set: 'OP-06 Wings of Captain', rarity: 'secret',
    price: 140.00, proof: true, isFresh: false, isListed: false, grade: null,
    img: 'https://images.pokemontcg.io/swsh11/186_hires.png', bg: '#051a0a'
  },
  {
    id: 22, owner: 'me', game: 'One Piece TCG',
    name: 'Portgas D. Ace (SR)', set: 'OP-02 Paramount War', rarity: 'ultra',
    price: 75.00, proof: true, isFresh: false, isListed: true, listingType: 'trade', grade: null,
    img: 'https://images.pokemontcg.io/swsh10/143_hires.png', bg: '#1a0005'
  },

  /* ═══════ RIFTBOUND ═══════ */
  {
    id: 30, owner: 'me', game: 'Riftbound',
    name: 'Aurelius, The Lightbringer', set: 'First Edition', rarity: 'secret',
    price: 85.00, proof: true, isFresh: false, isListed: false, grade: null,
    img: 'https://images.pokemontcg.io/swsh12/155_hires.png', bg: '#1a1500'
  },
];

// ─── CARTE COMUNI (PER BULK E LIVE OPENING) ──
const COMMON_CARDS = [
  { game: 'Pokémon TCG', name: 'Pidgey',   rarity: 'common', price: 0.02, img: 'https://images.pokemontcg.io/base1/57.png',  bg: '#0f0f1a' },
  { game: 'Pokémon TCG', name: 'Rattata',  rarity: 'common', price: 0.02, img: 'https://images.pokemontcg.io/base1/61.png',  bg: '#0f0f1a' },
  { game: 'Pokémon TCG', name: 'Bulbasaur',rarity: 'common', price: 0.05, img: 'https://images.pokemontcg.io/base1/44.png',  bg: '#0f1a0a' },
  { game: 'Pokémon TCG', name: 'Clefairy', rarity: 'common', price: 0.03, img: 'https://images.pokemontcg.io/base1/5.png',   bg: '#1a0f1a' },
  { game: 'One Piece TCG', name: 'Pirate Grunt A', rarity: 'common', price: 0.05, img: 'https://images.pokemontcg.io/base1/68.png', bg: '#1a0a05' },
  { game: 'Riftbound',   name: 'Forest Sprite', rarity: 'common', price: 0.01, img: 'https://images.pokemontcg.io/base1/94.png',  bg: '#0f1a0f' },
];

// ─── PRODOTTI SIGILLATI (Immagini reali caricate dall'utente) ──
const SEALED_PRODUCTS = [
  {
    id: 'pk-sv3', game: 'Pokémon TCG', type: 'pack', price: 8.90,
    name: 'Booster Pack — 黒炎の支配者 (SV3)',
    img: './img/pack-pokemon-sv3.png', bg: '#1a0800'
  },
  {
    id: 'bx-avv', game: 'Pokémon TCG', type: 'box', price: 69.90,
    name: 'Box Avventure Insieme (Scarlet & Violet)',
    img: './img/box-pokemon-avventure.png', bg: '#0a1a2a'
  },
  {
    id: 'bx-30', game: 'Pokémon TCG', type: 'box', price: 149.90,
    name: 'Elite Trainer Box — 30° Anniversario',
    img: './img/box-pokemon-30anni.png', bg: '#1a1500'
  },
  {
    id: 'pk-bs', game: 'Pokémon TCG', type: 'vintage', price: 380.00,
    name: 'Booster Pack Base Set (1999)',
    img: './img/pack-pokemon-sv3.png', bg: '#1a1000'
    // Nota: immagine placeholder fino a quando non sarà disponibile una foto reale
  },
  {
    id: 'op-warriors-en', game: 'One Piece TCG', type: 'box', price: 135.00,
    name: "Booster Box — World's Strongest Warriors (OP-17)",
    img: './img/box-op-warriors-en.png', bg: '#1a1000'
  },
  {
    id: 'op-warriors-jp', game: 'One Piece TCG', type: 'pack', price: 6.50,
    name: "Booster Pack OP-17 (Japanese Edition)",
    img: './img/box-op-warriors-jp.png', bg: '#1a1000'
  },
];

// ─── VAULT ALTRUI (PER SWAP BOARD) ──────────
const OTHER_VAULTS = [
  {
    id: 'vault_milano', user: 'TradersMilano', avatar: '🏙️',
    cards: [
      {
        id: 101, name: 'Giratina VSTAR (Alt Art)', set: 'Lost Origin', rarity: 'secret',
        game: 'Pokémon TCG', price: 390.00,
        img: 'https://images.pokemontcg.io/swsh11/193_hires.png', bg: '#0a0a1a'
      }
    ]
  },
  {
    id: 'vault_roma', user: 'VaultRoma', avatar: '🏛️',
    cards: [
      {
        id: 202, name: 'Arceus VSTAR (SIR)', set: 'Brilliant Stars', rarity: 'secret',
        game: 'Pokémon TCG', price: 55.00,
        img: 'https://images.pokemontcg.io/swsh9/176_hires.png', bg: '#0a1020'
      }
    ]
  }
];
