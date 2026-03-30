// ===== MAIN GAME =====
const Game = {
  canvas: null,
  ctx: null,
  lastTime: 0,
  running: false,

  init() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Set canvas size
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Disable context menu
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Initialize all systems
    World.generate();
    Player.init();
    MonsterManager.init();
    Combat.init();
    Inventory.init();
    Input.init();
    UI.init();

    // Give player a starter weapon
    Inventory.addItem({ ...LootDB.items.wooden_sword, uid: Utils.uid(), count: 1 });
    // Give player some starter potions
    Inventory.addItem({ ...LootDB.items.health_potion, uid: Utils.uid(), count: 3 });

    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  },

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Keep pixelated rendering
    this.ctx.imageSmoothingEnabled = false;
  },

  loop(timestamp) {
    if (!this.running) return;

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap dt
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  },

  update(dt) {
    // Don't update game if modals are open
    if (CardPack.isOpen || UI.inventoryOpen) return;
    if (!document.getElementById('death-screen').classList.contains('hidden')) return;
    if (!document.getElementById('level-up-modal').classList.contains('hidden')) return;

    Input.update();
    Player.update(dt, Input.direction);
    MonsterManager.update(dt);
    Combat.processMonsterAttacks(dt);
    Combat.updateDamageNumbers(dt);

    // Update camera
    World.updateCamera(Player.x, Player.y, window.innerWidth, window.innerHeight);

    // Update HUD
    UI.updateHUD();
  },

  render() {
    const ctx = this.ctx;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // Render world
    World.render(ctx, w, h);

    // Render monsters
    MonsterManager.render(ctx);

    // Render player
    Player.render(ctx);

    // Render damage numbers
    Combat.renderDamageNumbers(ctx);
  }
};

// Start game when page loads
window.addEventListener('load', () => {
  Game.init();
});
