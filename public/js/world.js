// ===== WORLD / MAP SYSTEM =====
const World = {
  tileSize: 32,
  mapWidth: 60,
  mapHeight: 60,
  tiles: [],
  camera: { x: 0, y: 0 },

  // Tile types: 0=grass, 1=dirt, 2=stone, 3=water, 4=sand, 5=wall, 6=tree, 7=flower
  tileTypes: ['grass', 'dirt', 'stone', 'water', 'sand', 'wall', 'tree', 'flower'],

  // Collision map (true = blocked)
  collisionMap: [],

  // Monster spawn zones
  zones: [
    { name: 'Forest', x: 0, y: 0, w: 20, h: 20, monsters: ['slime', 'bat'], level: [1, 3], color: '#2d6b36' },
    { name: 'Plains', x: 20, y: 0, w: 20, h: 20, monsters: ['slime', 'goblin'], level: [2, 5], color: '#4a8c54' },
    { name: 'Graveyard', x: 40, y: 0, w: 20, h: 20, monsters: ['skeleton', 'bat'], level: [3, 6], color: '#555' },
    { name: 'Swamp', x: 0, y: 20, w: 20, h: 20, monsters: ['slime', 'goblin'], level: [4, 7], color: '#1a5c2a' },
    { name: 'Mountains', x: 20, y: 20, w: 20, h: 20, monsters: ['goblin', 'skeleton'], level: [5, 8], color: '#888' },
    { name: 'Dark Forest', x: 40, y: 20, w: 20, h: 20, monsters: ['demon', 'skeleton'], level: [6, 10], color: '#1a3a2a' },
    { name: 'Wasteland', x: 0, y: 40, w: 20, h: 20, monsters: ['demon', 'goblin'], level: [7, 12], color: '#8B6914' },
    { name: 'Volcano', x: 20, y: 40, w: 20, h: 20, monsters: ['demon', 'dragon'], level: [8, 15], color: '#c0392b' },
    { name: "Dragon's Lair", x: 40, y: 40, w: 20, h: 20, monsters: ['dragon', 'demon'], level: [10, 20], color: '#6c3483' }
  ],

  generate() {
    this.tiles = [];
    this.collisionMap = [];

    for (let y = 0; y < this.mapHeight; y++) {
      this.tiles[y] = [];
      this.collisionMap[y] = [];
      for (let x = 0; x < this.mapWidth; x++) {
        this.collisionMap[y][x] = false;
        const zone = this.getZoneAt(x, y);

        // Zone-based tile generation
        if (zone) {
          if (zone.name === 'Forest' || zone.name === 'Dark Forest') {
            if (Utils.rand(0, 10) === 0) {
              this.tiles[y][x] = 6; // tree
              this.collisionMap[y][x] = true;
            } else if (Utils.rand(0, 15) === 0) {
              this.tiles[y][x] = 7; // flower
            } else {
              this.tiles[y][x] = 0; // grass
            }
          } else if (zone.name === 'Graveyard') {
            this.tiles[y][x] = Utils.rand(0, 3) === 0 ? 2 : 1; // stone/dirt mix
            if (Utils.rand(0, 20) === 0) { this.tiles[y][x] = 5; this.collisionMap[y][x] = true; } // walls
          } else if (zone.name === 'Swamp') {
            this.tiles[y][x] = Utils.rand(0, 3) === 0 ? 3 : 0; // water/grass
            if (this.tiles[y][x] === 3) this.collisionMap[y][x] = true;
          } else if (zone.name === 'Mountains') {
            this.tiles[y][x] = Utils.rand(0, 2) === 0 ? 2 : 1;
            if (Utils.rand(0, 12) === 0) { this.tiles[y][x] = 5; this.collisionMap[y][x] = true; }
          } else if (zone.name === 'Wasteland') {
            this.tiles[y][x] = Utils.rand(0, 3) === 0 ? 4 : 1;
          } else if (zone.name === 'Volcano') {
            this.tiles[y][x] = Utils.rand(0, 4) === 0 ? 2 : 1;
            if (Utils.rand(0, 15) === 0) { this.tiles[y][x] = 5; this.collisionMap[y][x] = true; }
          } else if (zone.name === "Dragon's Lair") {
            this.tiles[y][x] = Utils.rand(0, 2) === 0 ? 2 : 1;
            if (Utils.rand(0, 10) === 0) { this.tiles[y][x] = 5; this.collisionMap[y][x] = true; }
          } else {
            // Plains default
            this.tiles[y][x] = Utils.rand(0, 8) === 0 ? 7 : 0;
          }
        } else {
          this.tiles[y][x] = 0;
        }

        // Border walls
        if (x === 0 || y === 0 || x === this.mapWidth - 1 || y === this.mapHeight - 1) {
          this.tiles[y][x] = 5;
          this.collisionMap[y][x] = true;
        }
      }
    }

    // Ensure spawn area is clear
    for (let y = 8; y <= 12; y++) {
      for (let x = 8; x <= 12; x++) {
        this.tiles[y][x] = 0;
        this.collisionMap[y][x] = false;
      }
    }
  },

  getZoneAt(tileX, tileY) {
    for (const zone of this.zones) {
      if (tileX >= zone.x && tileX < zone.x + zone.w &&
          tileY >= zone.y && tileY < zone.y + zone.h) {
        return zone;
      }
    }
    return null;
  },

  isBlocked(tileX, tileY) {
    if (tileX < 0 || tileY < 0 || tileX >= this.mapWidth || tileY >= this.mapHeight) return true;
    return this.collisionMap[tileY][tileX];
  },

  worldToTile(wx, wy) {
    return {
      x: Math.floor(wx / this.tileSize),
      y: Math.floor(wy / this.tileSize)
    };
  },

  updateCamera(playerX, playerY, canvasW, canvasH) {
    this.camera.x = playerX - canvasW / 2;
    this.camera.y = playerY - canvasH / 2;

    // Clamp camera
    const maxX = this.mapWidth * this.tileSize - canvasW;
    const maxY = this.mapHeight * this.tileSize - canvasH;
    this.camera.x = Utils.clamp(this.camera.x, 0, Math.max(0, maxX));
    this.camera.y = Utils.clamp(this.camera.y, 0, Math.max(0, maxY));
  },

  render(ctx, canvasW, canvasH) {
    const startTileX = Math.floor(this.camera.x / this.tileSize);
    const startTileY = Math.floor(this.camera.y / this.tileSize);
    const endTileX = Math.ceil((this.camera.x + canvasW) / this.tileSize);
    const endTileY = Math.ceil((this.camera.y + canvasH) / this.tileSize);

    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        if (ty < 0 || tx < 0 || ty >= this.mapHeight || tx >= this.mapWidth) continue;

        const tileType = this.tileTypes[this.tiles[ty][tx]];
        const screenX = tx * this.tileSize - this.camera.x;
        const screenY = ty * this.tileSize - this.camera.y;

        const sprite = Sprites.getTileSprite(tileType);
        ctx.drawImage(sprite, screenX, screenY, this.tileSize, this.tileSize);
      }
    }

    // Draw zone name
    const playerTile = this.worldToTile(
      this.camera.x + canvasW / 2,
      this.camera.y + canvasH / 2
    );
    const zone = this.getZoneAt(playerTile.x, playerTile.y);
    if (zone) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = '12px "Courier New"';
      ctx.textAlign = 'center';
      const text = zone.name + ' (Lv.' + zone.level[0] + '-' + zone.level[1] + ')';
      const textW = ctx.measureText(text).width;
      ctx.fillRect(canvasW / 2 - textW / 2 - 8, 4, textW + 16, 20);
      ctx.fillStyle = '#fff';
      ctx.fillText(text, canvasW / 2, 18);
      ctx.textAlign = 'left';
    }
  }
};
