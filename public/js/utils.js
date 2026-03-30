// ===== UTILITIES =====
const Utils = {
  rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randFloat(min, max) {
    return Math.random() * (max - min) + min;
  },

  distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  },

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  weightedRandom(weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) return i;
    }
    return weights.length - 1;
  },

  // Simple unique ID generator
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
};

// Rarity definitions
const RARITIES = {
  common:    { name: 'Common',    color: '#999',   weight: 60, borderColor: '#888' },
  uncommon:  { name: 'Uncommon',  color: '#2ecc71', weight: 25, borderColor: '#2ecc71' },
  rare:      { name: 'Rare',      color: '#3498db', weight: 10, borderColor: '#3498db' },
  epic:      { name: 'Epic',      color: '#9b59b6', weight: 4,  borderColor: '#9b59b6' },
  legendary: { name: 'Legendary', color: '#f39c12', weight: 1,  borderColor: '#f39c12' }
};

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

function rollRarity() {
  const weights = RARITY_ORDER.map(r => RARITIES[r].weight);
  const idx = Utils.weightedRandom(weights);
  return RARITY_ORDER[idx];
}
