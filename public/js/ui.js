// ===== UI SYSTEM =====
const UI = {
  inventoryOpen: false,
  currentTab: 'all',
  selectedItem: null,

  init() {
    this.setupCloseButtons();
    this.setupTabs();
    this.setupRespawn();
    this.setupLevelUpOk();
  },

  setupCloseButtons() {
    document.getElementById('close-inventory').addEventListener('click', () => {
      this.closeInventory();
    });
  },

  setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        this.refreshInventory();
      });
    });
  },

  setupRespawn() {
    document.getElementById('respawn-btn').addEventListener('click', () => {
      Combat.respawnPlayer();
    });
  },

  setupLevelUpOk() {
    document.getElementById('level-up-ok').addEventListener('click', () => {
      document.getElementById('level-up-modal').classList.add('hidden');
    });
  },

  toggleInventory() {
    if (this.inventoryOpen) {
      this.closeInventory();
    } else {
      this.openInventory();
    }
  },

  openInventory() {
    this.inventoryOpen = true;
    this.selectedItem = null;
    document.getElementById('inventory-modal').classList.remove('hidden');
    document.getElementById('item-detail').classList.add('hidden');
    this.refreshInventory();
  },

  closeInventory() {
    this.inventoryOpen = false;
    this.selectedItem = null;
    document.getElementById('inventory-modal').classList.add('hidden');
  },

  refreshInventory() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';

    const items = Inventory.getFilteredItems(this.currentTab);

    items.forEach(item => {
      const slot = document.createElement('div');
      slot.className = 'inv-slot rarity-' + item.rarity;
      slot.innerHTML =
        '<div class="item-icon">' + item.icon + '</div>' +
        '<div class="item-name">' + item.name + '</div>' +
        (item.count > 1 ? '<div class="item-count">x' + item.count + '</div>' : '');

      slot.addEventListener('click', () => {
        this.selectItem(item);
      });

      grid.appendChild(slot);
    });

    // Fill empty slots
    const emptyCount = Math.max(0, 12 - items.length);
    for (let i = 0; i < emptyCount; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      slot.style.opacity = '0.3';
      grid.appendChild(slot);
    }
  },

  selectItem(item) {
    this.selectedItem = item;
    const detail = document.getElementById('item-detail');
    detail.classList.remove('hidden');

    let statsHtml = '';
    if (item.type === 'weapon') {
      statsHtml = 'ATK +' + item.attack;
    } else if (item.type === 'potion') {
      if (item.heal) statsHtml = 'Heals ' + item.heal + ' HP';
      if (item.tempAttack) statsHtml = '+' + item.tempAttack + ' ATK for ' + item.duration + 's';
      if (item.tempSpeed) statsHtml = '+' + Math.round((item.tempSpeed - 1) * 100) + '% Speed for ' + item.duration + 's';
    } else if (item.type === 'material') {
      statsHtml = 'Value: ' + (item.value || 0) + ' gold';
    } else if (item.type === 'cardpack') {
      statsHtml = 'Contains ' + (LootDB.cardPacks[item.id] ? LootDB.cardPacks[item.id].cardCount : '?') + ' cards';
    }

    let buttonsHtml = '';
    if (item.type === 'weapon') {
      buttonsHtml = '<button class="detail-btn use-btn" onclick="UI.useSelectedItem()">Equip</button>';
    } else if (item.type === 'potion') {
      buttonsHtml = '<button class="detail-btn use-btn" onclick="UI.useSelectedItem()">Use</button>';
    } else if (item.type === 'cardpack') {
      buttonsHtml = '<button class="detail-btn open-btn" onclick="UI.openSelectedPack()">Open Pack</button>';
    } else if (item.type === 'material') {
      buttonsHtml = '<button class="detail-btn" onclick="UI.sellSelectedItem()">Sell (' + (item.value || 1) + 'g)</button>';
    }

    detail.innerHTML =
      '<h3 style="color:' + RARITIES[item.rarity].color + '">' + item.icon + ' ' + item.name + '</h3>' +
      '<div class="item-desc">' + (item.desc || '') + '</div>' +
      (statsHtml ? '<div class="item-stats">' + statsHtml + '</div>' : '') +
      '<div class="item-detail-buttons">' + buttonsHtml + '</div>';
  },

  useSelectedItem() {
    if (!this.selectedItem) return;
    Inventory.useItem(this.selectedItem.uid);
    this.selectedItem = null;
    document.getElementById('item-detail').classList.add('hidden');
    this.refreshInventory();
  },

  openSelectedPack() {
    if (!this.selectedItem || this.selectedItem.type !== 'cardpack') return;
    const pack = this.selectedItem;
    this.closeInventory();
    Inventory.useItem(pack.uid);
  },

  sellSelectedItem() {
    if (!this.selectedItem) return;
    const value = this.selectedItem.value || 1;
    Player.gold += value;
    this.showNotification('Sold for ' + value + ' gold', 'loot');
    Inventory.removeItem(this.selectedItem.uid, 1);
    this.selectedItem = null;
    document.getElementById('item-detail').classList.add('hidden');
    this.refreshInventory();
  },

  // HUD update
  updateHUD() {
    document.getElementById('player-level').textContent = 'Lv.' + Player.level;
    document.getElementById('hp-bar').style.width = (Player.hp / Player.maxHp * 100) + '%';
    document.getElementById('hp-text').textContent = Player.hp + '/' + Player.maxHp;
    document.getElementById('xp-bar').style.width = (Player.xp / Player.xpToLevel * 100) + '%';
    document.getElementById('xp-text').textContent = Player.xp + '/' + Player.xpToLevel;
    document.getElementById('gold-amount').textContent = Player.gold;
  },

  showNotification(text, type) {
    const container = document.getElementById('notifications');
    const notif = document.createElement('div');
    notif.className = 'notification ' + (type || '');
    notif.textContent = text;
    container.appendChild(notif);
    setTimeout(() => {
      if (notif.parentNode) notif.parentNode.removeChild(notif);
    }, 2500);
  },

  showDeathScreen() {
    document.getElementById('death-screen').classList.remove('hidden');
  },

  hideDeathScreen() {
    document.getElementById('death-screen').classList.add('hidden');
  },

  showLevelUp(stats) {
    const modal = document.getElementById('level-up-modal');
    modal.classList.remove('hidden');
    document.getElementById('level-up-text').textContent = 'You reached level ' + stats.level + '!';
    document.getElementById('level-up-stats').innerHTML =
      'HP +' + stats.hpGain + '<br>' +
      'ATK +' + stats.atkGain + '<br>' +
      'DEF +' + stats.defGain;
  }
};
