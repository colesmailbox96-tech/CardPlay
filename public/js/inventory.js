// ===== INVENTORY SYSTEM =====
const Inventory = {
  items: [], // { ...itemData, count: N, uid: string }
  maxSlots: 40,

  init() {
    this.items = [];
  },

  addItem(item) {
    // Stackable items: card packs, potions, materials
    if (item.type === 'cardpack' || item.type === 'potion' || item.type === 'material') {
      const existing = this.items.find(i => i.id === item.id);
      if (existing) {
        existing.count++;
        return true;
      }
    }

    if (this.items.length >= this.maxSlots) {
      UI.showNotification('Inventory full!', '');
      return false;
    }

    this.items.push({
      ...item,
      uid: Utils.uid(),
      count: item.count || 1
    });
    return true;
  },

  removeItem(uid, count) {
    const idx = this.items.findIndex(i => i.uid === uid);
    if (idx === -1) return false;

    const item = this.items[idx];
    if (count && item.count > count) {
      item.count -= count;
    } else {
      this.items.splice(idx, 1);
    }
    return true;
  },

  getItemByUid(uid) {
    return this.items.find(i => i.uid === uid);
  },

  useItem(uid) {
    const item = this.getItemByUid(uid);
    if (!item) return;

    if (item.type === 'potion') {
      if (item.heal) {
        Player.heal(item.heal);
        Combat.spawnDamageNumber(Player.x, Player.y - Player.height / 2, item.heal, 'heal');
        UI.showNotification('Used ' + item.icon + ' ' + item.name, '');
      }
      if (item.tempAttack || item.tempSpeed) {
        Player.addBuff(item);
        UI.showNotification('Buff active: ' + item.name, '');
      }
      this.removeItem(uid, 1);
    } else if (item.type === 'weapon') {
      const old = Player.equipWeapon(item);
      UI.showNotification('Equipped ' + item.icon + ' ' + item.name + ' (ATK +' + item.attack + ')', '');
      this.removeItem(uid);
      if (old) this.addItem(old);
    } else if (item.type === 'cardpack') {
      CardPack.openPack(item);
    }
  },

  getFilteredItems(filter) {
    if (filter === 'all') return this.items;
    if (filter === 'cards') return this.items.filter(i => i.type === 'cardpack');
    if (filter === 'weapons') return this.items.filter(i => i.type === 'weapon');
    if (filter === 'potions') return this.items.filter(i => i.type === 'potion');
    if (filter === 'materials') return this.items.filter(i => i.type === 'material');
    return this.items;
  }
};
