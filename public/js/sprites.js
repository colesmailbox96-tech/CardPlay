// ===== PIXEL ART SPRITE SYSTEM =====
// Generates pixel art sprites programmatically using canvas

const Sprites = {
  cache: {},
  scale: 3, // pixel scale

  // Create a small canvas for drawing sprites
  createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  },

  // Draw a pixel grid onto a canvas. `pixels` is a 2D array of colors (null = transparent)
  drawPixels(canvas, pixels, scale) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < pixels.length; y++) {
      for (let x = 0; x < pixels[y].length; x++) {
        if (pixels[y][x]) {
          ctx.fillStyle = pixels[y][x];
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
    return canvas;
  },

  getPlayerSprite(direction, frame) {
    const key = `player_${direction}_${frame}`;
    if (this.cache[key]) return this.cache[key];

    const s = this.scale;
    const w = 12, h = 16;
    const c = this.createCanvas(w * s, h * s);

    // Simple pixel hero
    const skin = '#ffd5a0';
    const hair = '#8B4513';
    const shirt = '#4169E1';
    const pants = '#2c3e50';
    const boots = '#654321';
    const eye = '#222';

    const bounce = frame % 2 === 0 ? 0 : 1;

    const pixels = [];
    for (let y = 0; y < h; y++) pixels.push(new Array(w).fill(null));

    // Hair (row 0-2)
    for (let x = 3; x <= 8; x++) pixels[0][x] = hair;
    for (let x = 2; x <= 9; x++) pixels[1][x] = hair;
    for (let x = 2; x <= 9; x++) pixels[2][x] = hair;

    // Face (row 3-5)
    for (let x = 3; x <= 8; x++) pixels[3][x] = skin;
    for (let x = 3; x <= 8; x++) pixels[4][x] = skin;
    for (let x = 3; x <= 8; x++) pixels[5][x] = skin;

    // Eyes
    if (direction === 'left' || direction === 'up') {
      pixels[4][4] = eye;
      pixels[4][6] = eye;
    } else {
      pixels[4][5] = eye;
      pixels[4][7] = eye;
    }

    // Body / shirt (row 6-10)
    for (let y = 6; y <= 10; y++) {
      for (let x = 3; x <= 8; x++) pixels[y][x] = shirt;
    }
    // Arms
    pixels[7][2] = skin; pixels[7][9] = skin;
    pixels[8][2] = skin; pixels[8][9] = skin;
    if (bounce) {
      pixels[7][1] = skin; pixels[7][10] = skin;
    }

    // Pants (row 11-13)
    for (let y = 11; y <= 13; y++) {
      for (let x = 3; x <= 5; x++) pixels[y][x] = pants;
      for (let x = 6; x <= 8; x++) pixels[y][x] = pants;
    }

    // Boots (row 14-15)
    for (let x = 3; x <= 5; x++) { pixels[14][x] = boots; pixels[15][x] = boots; }
    for (let x = 6; x <= 8; x++) { pixels[14][x] = boots; pixels[15][x] = boots; }

    // Walk animation offset
    if (bounce) {
      pixels[15][3] = null; pixels[15][8] = null;
      pixels[15][2] = boots; pixels[15][9] = boots;
    }

    this.drawPixels(c, pixels, s);
    this.cache[key] = c;
    return c;
  },

  getMonsterSprite(type, frame) {
    const key = `monster_${type}_${frame}`;
    if (this.cache[key]) return this.cache[key];

    const s = this.scale;
    const configs = {
      slime: { w: 10, h: 8, color1: '#2ecc71', color2: '#27ae60', eyeColor: '#fff' },
      bat: { w: 14, h: 10, color1: '#8e44ad', color2: '#6c3483', eyeColor: '#e74c3c' },
      skeleton: { w: 12, h: 16, color1: '#ecf0f1', color2: '#bdc3c7', eyeColor: '#e74c3c' },
      goblin: { w: 12, h: 14, color1: '#27ae60', color2: '#1e8449', eyeColor: '#f1c40f' },
      demon: { w: 14, h: 16, color1: '#e74c3c', color2: '#c0392b', eyeColor: '#f39c12' },
      dragon: { w: 16, h: 16, color1: '#8e44ad', color2: '#6c3483', eyeColor: '#ffd700' }
    };

    const cfg = configs[type] || configs.slime;
    const c = this.createCanvas(cfg.w * s, cfg.h * s);
    const pixels = [];
    for (let y = 0; y < cfg.h; y++) pixels.push(new Array(cfg.w).fill(null));

    const bounce = frame % 2;

    if (type === 'slime') {
      const h = bounce ? 6 : 8;
      const startY = cfg.h - h;
      for (let y = startY; y < cfg.h; y++) {
        const row = y - startY;
        const halfW = Math.min(row + 2, Math.floor(cfg.w / 2));
        const cx = Math.floor(cfg.w / 2);
        for (let x = cx - halfW; x <= cx + halfW - 1; x++) {
          if (x >= 0 && x < cfg.w) {
            pixels[y][x] = row < 2 ? cfg.color2 : cfg.color1;
          }
        }
      }
      // Eyes
      const ey = startY + 2;
      pixels[ey][3] = cfg.eyeColor;
      pixels[ey][6] = cfg.eyeColor;
    } else if (type === 'bat') {
      // Body
      for (let x = 5; x <= 8; x++) {
        for (let y = 2; y <= 5; y++) pixels[y][x] = cfg.color1;
      }
      // Wings
      const wingY = bounce ? 1 : 3;
      for (let x = 0; x <= 4; x++) pixels[wingY][x] = cfg.color2;
      for (let x = 9; x <= 13; x++) pixels[wingY][x] = cfg.color2;
      for (let x = 1; x <= 4; x++) pixels[wingY + 1][x] = cfg.color2;
      for (let x = 9; x <= 12; x++) pixels[wingY + 1][x] = cfg.color2;
      // Eyes
      pixels[3][6] = cfg.eyeColor;
      pixels[3][7] = cfg.eyeColor;
    } else if (type === 'skeleton') {
      // Skull
      for (let x = 3; x <= 8; x++) { pixels[0][x] = cfg.color1; pixels[1][x] = cfg.color1; pixels[2][x] = cfg.color1; }
      pixels[1][4] = cfg.eyeColor; pixels[1][7] = cfg.eyeColor;
      // Spine
      for (let y = 3; y <= 10; y++) { pixels[y][5] = cfg.color2; pixels[y][6] = cfg.color2; }
      // Ribs
      for (let x = 3; x <= 8; x++) { pixels[5][x] = cfg.color2; pixels[7][x] = cfg.color2; }
      // Arms
      pixels[5][2] = cfg.color1; pixels[5][9] = cfg.color1;
      pixels[6][1] = cfg.color1; pixels[6][10] = cfg.color1;
      // Legs
      for (let y = 11; y <= 15; y++) {
        pixels[y][4] = cfg.color2;
        pixels[y][7] = cfg.color2;
      }
      if (bounce) { pixels[15][3] = cfg.color2; pixels[15][8] = cfg.color2; }
    } else if (type === 'goblin') {
      // Head
      for (let x = 3; x <= 8; x++) { pixels[0][x] = cfg.color1; pixels[1][x] = cfg.color1; pixels[2][x] = cfg.color1; }
      // Ears
      pixels[1][2] = cfg.color2; pixels[1][9] = cfg.color2;
      // Eyes
      pixels[1][4] = cfg.eyeColor; pixels[1][7] = cfg.eyeColor;
      // Body
      for (let y = 3; y <= 8; y++) for (let x = 3; x <= 8; x++) pixels[y][x] = cfg.color2;
      // Arms
      pixels[5][2] = cfg.color1; pixels[5][9] = cfg.color1;
      // Legs
      for (let y = 9; y <= 13; y++) {
        pixels[y][4] = cfg.color1; pixels[y][7] = cfg.color1;
      }
      if (bounce) { pixels[13][3] = cfg.color1; pixels[13][8] = cfg.color1; }
    } else if (type === 'demon') {
      // Horns
      pixels[0][3] = cfg.color2; pixels[0][10] = cfg.color2;
      pixels[1][3] = cfg.color2; pixels[1][10] = cfg.color2;
      // Head
      for (let x = 4; x <= 9; x++) { pixels[2][x] = cfg.color1; pixels[3][x] = cfg.color1; pixels[4][x] = cfg.color1; }
      pixels[3][5] = cfg.eyeColor; pixels[3][8] = cfg.eyeColor;
      // Body
      for (let y = 5; y <= 11; y++) for (let x = 3; x <= 10; x++) pixels[y][x] = cfg.color1;
      // Wings
      pixels[5][1] = cfg.color2; pixels[6][0] = cfg.color2; pixels[7][1] = cfg.color2;
      pixels[5][12] = cfg.color2; pixels[6][13] = cfg.color2; pixels[7][12] = cfg.color2;
      // Legs
      for (let y = 12; y <= 15; y++) { pixels[y][4] = cfg.color1; pixels[y][5] = cfg.color1; pixels[y][8] = cfg.color1; pixels[y][9] = cfg.color1; }
    } else if (type === 'dragon') {
      // Head
      for (let x = 5; x <= 10; x++) { pixels[0][x] = cfg.color1; pixels[1][x] = cfg.color1; pixels[2][x] = cfg.color1; }
      pixels[1][6] = cfg.eyeColor; pixels[1][9] = cfg.eyeColor;
      // Horns
      pixels[0][4] = '#ffd700'; pixels[0][11] = '#ffd700';
      // Neck
      for (let x = 6; x <= 9; x++) pixels[3][x] = cfg.color2;
      // Body (large)
      for (let y = 4; y <= 10; y++) for (let x = 3; x <= 12; x++) pixels[y][x] = cfg.color1;
      // Belly
      for (let y = 6; y <= 9; y++) for (let x = 5; x <= 10; x++) pixels[y][x] = '#f39c12';
      // Wings
      for (let y = 3; y <= 6; y++) { pixels[y][1] = cfg.color2; pixels[y][14] = cfg.color2; }
      pixels[4][0] = cfg.color2; pixels[4][15] = cfg.color2;
      // Legs
      for (let y = 11; y <= 14; y++) {
        pixels[y][4] = cfg.color1; pixels[y][5] = cfg.color1;
        pixels[y][10] = cfg.color1; pixels[y][11] = cfg.color1;
      }
      // Tail
      pixels[10][2] = cfg.color2; pixels[11][1] = cfg.color2; pixels[12][0] = cfg.color2;
    }

    this.drawPixels(c, pixels, s);
    this.cache[key] = c;
    return c;
  },

  getTileSprite(type) {
    const key = `tile_${type}`;
    if (this.cache[key]) return this.cache[key];

    const s = 2;
    const size = 16;
    const c = this.createCanvas(size * s, size * s);
    const pixels = [];
    for (let y = 0; y < size; y++) pixels.push(new Array(size).fill(null));

    const colors = {
      grass: ['#3a7d44', '#4a8c54', '#2d6b36', '#55a060'],
      dirt: ['#8B6914', '#9B7924', '#7B5904', '#A08934'],
      stone: ['#808080', '#909090', '#707070', '#888888'],
      water: ['#2980b9', '#3498db', '#2471a3', '#5dade2'],
      sand: ['#f0d78c', '#e8cf84', '#f5dc94', '#dcc07c'],
      wall: ['#555555', '#666666', '#4a4a4a', '#5a5a5a'],
      tree: ['#2d6b36', '#1a5c2a', '#3a7d44', '#145020'],
      flower: ['#3a7d44', '#e74c3c', '#f39c12', '#3498db']
    };

    const cols = colors[type] || colors.grass;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (type === 'water') {
          const wave = Math.sin((x + Date.now() / 500) * 0.5) > 0;
          pixels[y][x] = wave ? cols[0] : cols[1];
        } else if (type === 'tree') {
          // Trunk
          if (x >= 6 && x <= 9 && y >= 10) {
            pixels[y][x] = '#654321';
          }
          // Leaves
          else if (y < 12) {
            const cx = 8, cy = 5, r = 5;
            if (Utils.distance(x, y, cx, cy) < r) {
              pixels[y][x] = cols[Utils.rand(0, cols.length - 1)];
            }
          }
        } else if (type === 'flower') {
          pixels[y][x] = cols[0]; // grass base
          // Random flower pixels
          if (Utils.rand(0, 20) === 0) {
            pixels[y][x] = cols[Utils.rand(1, 3)];
          }
        } else {
          // Standard tile with slight variation
          pixels[y][x] = cols[(x + y) % cols.length];
          // Add noise
          if (Utils.rand(0, 5) === 0) {
            pixels[y][x] = cols[Utils.rand(0, cols.length - 1)];
          }
        }
      }
    }

    this.drawPixels(c, pixels, s);
    this.cache[key] = c;
    return c;
  },

  // Clear cache for animated tiles
  clearAnimatedCache() {
    Object.keys(this.cache).forEach(k => {
      if (k.startsWith('tile_water')) delete this.cache[k];
    });
  }
};
