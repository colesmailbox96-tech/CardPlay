// ===== LOOT TABLES =====
const LootDB = {
  items: {
    // === WEAPONS ===
    wooden_sword: { id: 'wooden_sword', name: 'Wooden Sword', icon: '\u{1F5E1}\uFE0F', type: 'weapon', rarity: 'common', attack: 3, desc: 'A basic wooden training sword.' },
    iron_sword: { id: 'iron_sword', name: 'Iron Sword', icon: '\u2694\uFE0F', type: 'weapon', rarity: 'uncommon', attack: 7, desc: 'A sturdy iron blade.' },
    fire_blade: { id: 'fire_blade', name: 'Fire Blade', icon: '\u{1F525}', type: 'weapon', rarity: 'rare', attack: 12, desc: 'A blade infused with flames.' },
    shadow_dagger: { id: 'shadow_dagger', name: 'Shadow Dagger', icon: '\u{1F5E1}\uFE0F', type: 'weapon', rarity: 'epic', attack: 18, desc: 'A dagger forged in darkness.' },
    dragon_slayer: { id: 'dragon_slayer', name: 'Dragon Slayer', icon: '\u2694\uFE0F', type: 'weapon', rarity: 'legendary', attack: 30, desc: 'The legendary Dragon Slayer sword.' },
    bone_club: { id: 'bone_club', name: 'Bone Club', icon: '\u{1F9B4}', type: 'weapon', rarity: 'common', attack: 4, desc: 'A club made from monster bones.' },
    staff_of_light: { id: 'staff_of_light', name: 'Staff of Light', icon: '\u2728', type: 'weapon', rarity: 'rare', attack: 10, desc: 'A magical staff radiating light.' },
    doom_axe: { id: 'doom_axe', name: 'Doom Axe', icon: '\u{1FA93}', type: 'weapon', rarity: 'epic', attack: 22, desc: 'An axe that brings doom.' },

    // === POTIONS ===
    health_potion: { id: 'health_potion', name: 'Health Potion', icon: '\u2764\uFE0F', type: 'potion', rarity: 'common', heal: 30, desc: 'Restores 30 HP.' },
    greater_health: { id: 'greater_health', name: 'Greater Health Potion', icon: '\u{1F496}', type: 'potion', rarity: 'uncommon', heal: 60, desc: 'Restores 60 HP.' },
    mega_health: { id: 'mega_health', name: 'Mega Health Potion', icon: '\u{1F49D}', type: 'potion', rarity: 'rare', heal: 100, desc: 'Restores 100 HP.' },
    strength_potion: { id: 'strength_potion', name: 'Strength Potion', icon: '\u{1F4AA}', type: 'potion', rarity: 'uncommon', tempAttack: 5, duration: 30, desc: '+5 ATK for 30s.' },
    speed_potion: { id: 'speed_potion', name: 'Speed Potion', icon: '\u{1F4A8}', type: 'potion', rarity: 'uncommon', tempSpeed: 1.5, duration: 20, desc: '+50% speed for 20s.' },
    elixir: { id: 'elixir', name: 'Elixir of Life', icon: '\u{1F9EA}', type: 'potion', rarity: 'legendary', heal: 999, desc: 'Fully restores HP.' },

    // === MATERIALS ===
    slime_gel: { id: 'slime_gel', name: 'Slime Gel', icon: '\u{1F7E2}', type: 'material', rarity: 'common', desc: 'Gooey gel from a slime.', value: 5 },
    bat_wing: { id: 'bat_wing', name: 'Bat Wing', icon: '\u{1F987}', type: 'material', rarity: 'common', desc: 'A leathery bat wing.', value: 8 },
    bone_fragment: { id: 'bone_fragment', name: 'Bone Fragment', icon: '\u{1F9B4}', type: 'material', rarity: 'common', desc: 'A piece of ancient bone.', value: 10 },
    goblin_ear: { id: 'goblin_ear', name: 'Goblin Ear', icon: '\u{1F442}', type: 'material', rarity: 'uncommon', desc: 'A trophy from a goblin.', value: 15 },
    demon_horn: { id: 'demon_horn', name: 'Demon Horn', icon: '\u{1F534}', type: 'material', rarity: 'rare', desc: 'A fiery demon horn.', value: 30 },
    dragon_scale: { id: 'dragon_scale', name: 'Dragon Scale', icon: '\u{1F409}', type: 'material', rarity: 'epic', desc: 'A shimmering dragon scale.', value: 50 },
    magic_crystal: { id: 'magic_crystal', name: 'Magic Crystal', icon: '\u{1F48E}', type: 'material', rarity: 'rare', desc: 'A crystal humming with magic.', value: 25 },
    gold_nugget: { id: 'gold_nugget', name: 'Gold Nugget', icon: '\u{1FA99}', type: 'material', rarity: 'uncommon', desc: 'A shiny gold nugget.', value: 20 }
  },

  // Card pack definitions
  cardPacks: {
    basic_pack: {
      id: 'basic_pack',
      name: 'Basic Card Pack',
      icon: '\u{1F0CF}',
      type: 'cardpack',
      rarity: 'common',
      desc: 'Contains 3 random items.',
      cardCount: 3,
      stackable: true,
      // Weighted pool per rarity
      pool: {
        common: ['wooden_sword', 'bone_club', 'health_potion', 'slime_gel', 'bat_wing', 'bone_fragment'],
        uncommon: ['iron_sword', 'greater_health', 'strength_potion', 'speed_potion', 'goblin_ear', 'gold_nugget'],
        rare: ['fire_blade', 'staff_of_light', 'mega_health', 'magic_crystal', 'demon_horn'],
        epic: ['shadow_dagger', 'doom_axe', 'dragon_scale'],
        legendary: ['dragon_slayer', 'elixir']
      }
    },
    rare_pack: {
      id: 'rare_pack',
      name: 'Rare Card Pack',
      icon: '\u{1F3B4}',
      type: 'cardpack',
      rarity: 'rare',
      desc: 'Contains 4 items with better odds!',
      cardCount: 4,
      stackable: true,
      pool: {
        common: ['health_potion', 'bone_club'],
        uncommon: ['iron_sword', 'greater_health', 'strength_potion', 'speed_potion', 'gold_nugget'],
        rare: ['fire_blade', 'staff_of_light', 'mega_health', 'magic_crystal', 'demon_horn'],
        epic: ['shadow_dagger', 'doom_axe', 'dragon_scale'],
        legendary: ['dragon_slayer', 'elixir']
      },
      rarityOverride: { common: 30, uncommon: 35, rare: 20, epic: 10, legendary: 5 }
    },
    legendary_pack: {
      id: 'legendary_pack',
      name: 'Legendary Card Pack',
      icon: '\u{1F451}',
      type: 'cardpack',
      rarity: 'legendary',
      desc: 'Contains 5 items with amazing odds!',
      cardCount: 5,
      stackable: true,
      pool: {
        common: [],
        uncommon: ['iron_sword', 'greater_health', 'gold_nugget'],
        rare: ['fire_blade', 'staff_of_light', 'mega_health', 'magic_crystal', 'demon_horn'],
        epic: ['shadow_dagger', 'doom_axe', 'dragon_scale'],
        legendary: ['dragon_slayer', 'elixir']
      },
      rarityOverride: { common: 0, uncommon: 20, rare: 35, epic: 30, legendary: 15 }
    }
  },

  // Monster drop tables
  monsterDrops: {
    slime: {
      gold: [3, 8],
      xp: [10, 15],
      packChance: 0.4,
      packType: 'basic_pack',
      directDrops: [
        { id: 'slime_gel', chance: 0.5 },
        { id: 'health_potion', chance: 0.2 }
      ]
    },
    bat: {
      gold: [5, 12],
      xp: [15, 22],
      packChance: 0.45,
      packType: 'basic_pack',
      directDrops: [
        { id: 'bat_wing', chance: 0.5 },
        { id: 'health_potion', chance: 0.25 }
      ]
    },
    skeleton: {
      gold: [8, 18],
      xp: [20, 30],
      packChance: 0.5,
      packType: 'basic_pack',
      directDrops: [
        { id: 'bone_fragment', chance: 0.5 },
        { id: 'iron_sword', chance: 0.1 }
      ]
    },
    goblin: {
      gold: [12, 25],
      xp: [25, 40],
      packChance: 0.55,
      packType: 'rare_pack',
      directDrops: [
        { id: 'goblin_ear', chance: 0.4 },
        { id: 'gold_nugget', chance: 0.3 },
        { id: 'strength_potion', chance: 0.15 }
      ]
    },
    demon: {
      gold: [20, 40],
      xp: [40, 60],
      packChance: 0.65,
      packType: 'rare_pack',
      directDrops: [
        { id: 'demon_horn', chance: 0.4 },
        { id: 'magic_crystal', chance: 0.25 },
        { id: 'greater_health', chance: 0.2 }
      ]
    },
    dragon: {
      gold: [40, 80],
      xp: [80, 120],
      packChance: 0.85,
      packType: 'legendary_pack',
      directDrops: [
        { id: 'dragon_scale', chance: 0.5 },
        { id: 'mega_health', chance: 0.3 },
        { id: 'fire_blade', chance: 0.15 }
      ]
    }
  },

  // Generate drops for a defeated monster
  generateDrops(monsterType) {
    const table = this.monsterDrops[monsterType];
    if (!table) return { gold: 0, xp: 0, items: [], cardPack: null };

    const gold = Utils.rand(table.gold[0], table.gold[1]);
    const xp = Utils.rand(table.xp[0], table.xp[1]);
    const items = [];
    let cardPack = null;

    // Direct drops
    table.directDrops.forEach(drop => {
      if (Math.random() < drop.chance) {
        const item = this.items[drop.id];
        if (item) items.push({ ...item });
      }
    });

    // Card pack drop
    if (Math.random() < table.packChance) {
      const pack = this.cardPacks[table.packType];
      if (pack) cardPack = { ...pack };
    }

    return { gold, xp, items, cardPack };
  },

  // Open a card pack and return items
  openCardPack(packId) {
    const pack = this.cardPacks[packId];
    if (!pack) return [];

    const results = [];
    const weights = pack.rarityOverride || {
      common: RARITIES.common.weight,
      uncommon: RARITIES.uncommon.weight,
      rare: RARITIES.rare.weight,
      epic: RARITIES.epic.weight,
      legendary: RARITIES.legendary.weight
    };

    for (let i = 0; i < pack.cardCount; i++) {
      // Roll rarity
      const rarityKeys = RARITY_ORDER.filter(r => pack.pool[r] && pack.pool[r].length > 0);
      const rarityWeights = rarityKeys.map(r => weights[r] || 0);
      const rarityIdx = Utils.weightedRandom(rarityWeights);
      const rarity = rarityKeys[rarityIdx];

      // Pick random item from pool
      const pool = pack.pool[rarity];
      const itemId = pool[Utils.rand(0, pool.length - 1)];
      const item = this.items[itemId];
      if (item) {
        results.push({ ...item });
      }
    }

    return results;
  }
};
