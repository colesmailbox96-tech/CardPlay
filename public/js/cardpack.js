// ===== CARD PACK SYSTEM =====
const CardPack = {
  isOpen: false,
  currentPack: null,
  revealedItems: [],
  stage: 'closed', // closed, shaking, opening, revealing, done
  shakeCount: 0,
  revealIndex: 0,
  revealTimer: 0,

  openPack(packItem) {
    this.currentPack = packItem;
    this.revealedItems = [];
    this.stage = 'closed';
    this.shakeCount = 0;
    this.revealIndex = 0;
    this.revealTimer = 0;
    this.isOpen = true;

    // Show the modal
    const modal = document.getElementById('card-pack-modal');
    modal.classList.remove('hidden');

    const openStage = document.getElementById('pack-opening-stage');
    const revealStage = document.getElementById('card-reveal-stage');
    openStage.classList.remove('hidden');
    revealStage.classList.add('hidden');

    // Set pack visual
    const packVisual = document.getElementById('card-pack-visual');
    packVisual.classList.remove('shaking', 'opening');
    packVisual.querySelector('.pack-image').textContent = packItem.icon;

    // Set glow color based on rarity
    const glow = packVisual.querySelector('.pack-glow');
    const glowColors = {
      common: 'rgba(150,150,150,0.3)',
      uncommon: 'rgba(46,204,113,0.3)',
      rare: 'rgba(52,152,219,0.4)',
      epic: 'rgba(155,89,182,0.5)',
      legendary: 'rgba(243,156,18,0.6)'
    };
    glow.style.boxShadow = '0 0 40px ' + (glowColors[packItem.rarity] || glowColors.common);

    // Set pack border color
    const borderColors = {
      common: '#888',
      uncommon: '#2ecc71',
      rare: '#3498db',
      epic: '#9b59b6',
      legendary: '#f39c12'
    };
    packVisual.style.borderColor = borderColors[packItem.rarity] || '#6c5ce7';

    document.getElementById('pack-instruction').textContent = 'Tap the pack to open!';

    // Bind tap handler
    packVisual.onclick = () => this.onPackTap();
  },

  onPackTap() {
    if (this.stage === 'closed') {
      this.stage = 'shaking';
      this.shakeCount = 0;
      this.doShake();
    }
  },

  doShake() {
    const packVisual = document.getElementById('card-pack-visual');
    this.shakeCount++;

    packVisual.classList.remove('shaking');
    // Force reflow
    void packVisual.offsetWidth;
    packVisual.classList.add('shaking');

    document.getElementById('pack-instruction').textContent = 'Opening...';

    if (this.shakeCount >= 3) {
      // Open after last shake
      setTimeout(() => this.doOpen(), 500);
    } else {
      setTimeout(() => this.doShake(), 600);
    }
  },

  doOpen() {
    const packVisual = document.getElementById('card-pack-visual');
    packVisual.classList.remove('shaking');
    packVisual.classList.add('opening');

    // Generate the items
    this.revealedItems = LootDB.openCardPack(this.currentPack.id);

    // Remove pack from inventory
    Inventory.removeItem(this.currentPack.uid, 1);

    // After animation, show cards
    setTimeout(() => this.showReveal(), 900);
  },

  showReveal() {
    const openStage = document.getElementById('pack-opening-stage');
    const revealStage = document.getElementById('card-reveal-stage');
    openStage.classList.add('hidden');
    revealStage.classList.remove('hidden');

    const container = document.getElementById('revealed-cards');
    container.innerHTML = '';

    // Sort items: common first, legendary last (for dramatic reveal)
    this.revealedItems.sort((a, b) => {
      return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
    });

    // Create card elements with staggered animation
    this.revealedItems.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'revealed-card rarity-' + item.rarity;
      card.style.animationDelay = (i * 0.3) + 's';

      card.innerHTML =
        '<div class="card-icon">' + item.icon + '</div>' +
        '<div class="card-name">' + item.name + '</div>' +
        '<div class="card-rarity-label">' + RARITIES[item.rarity].name + '</div>';

      container.appendChild(card);
    });

    // Show collect button
    document.getElementById('collect-cards-btn').onclick = () => this.collectAll();
  },

  collectAll() {
    // Add all revealed items to inventory
    this.revealedItems.forEach(item => {
      Inventory.addItem(item);
      UI.showNotification('Got ' + item.icon + ' ' + item.name, 'loot');
    });

    this.close();
  },

  close() {
    this.isOpen = false;
    this.currentPack = null;
    this.revealedItems = [];
    this.stage = 'closed';

    document.getElementById('card-pack-modal').classList.add('hidden');
  }
};
