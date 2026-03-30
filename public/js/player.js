// ===== PLAYER SYSTEM =====
const Player = {
  x: 10 * 32 + 16,
  y: 10 * 32 + 16,
  width: 36,
  height: 48,
  speed: 2.5,
  baseSpeed: 2.5,
  direction: 'down',
  frame: 0,
  frameTimer: 0,
  moving: false,

  // Stats
  level: 1,
  xp: 0,
  xpToLevel: 100,
  hp: 100,
  maxHp: 100,
  attack: 5,
  baseAttack: 5,
  defense: 2,
  gold: 0,

  // Combat
  attackCooldown: 0,
  attackRange: 50,
  attackSpeed: 0.5, // seconds between attacks
  isAttacking: false,
  attackTimer: 0,

  // Buffs
  buffs: [],

  // Equipment
  weapon: null,

  init() {
    this.x = 10 * 32 + 16;
    this.y = 10 * 32 + 16;
    this.hp = this.maxHp;
    this.level = 1;
    this.xp = 0;
    this.xpToLevel = 100;
    this.attack = this.baseAttack;
    this.gold = 0;
    this.buffs = [];
    this.weapon = null;
  },

  update(dt, inputDir) {
    // Movement
    this.moving = false;
    if (inputDir.x !== 0 || inputDir.y !== 0) {
      this.moving = true;

      // Normalize diagonal movement
      let dx = inputDir.x;
      let dy = inputDir.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        dx /= len;
        dy /= len;
      }

      const newX = this.x + dx * this.speed * 60 * dt;
      const newY = this.y + dy * this.speed * 60 * dt;

      // Direction
      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.direction = dy > 0 ? 'down' : 'up';
      }

      // Collision check
      const halfW = this.width / 2 - 4;
      const halfH = this.height / 2 - 4;

      // Check X
      const tx1 = World.worldToTile(newX - halfW, this.y - halfH);
      const tx2 = World.worldToTile(newX + halfW, this.y + halfH);
      let canMoveX = true;
      for (let ty = tx1.y; ty <= tx2.y; ty++) {
        for (let tx = tx1.x; tx <= tx2.x; tx++) {
          if (World.isBlocked(tx, ty)) canMoveX = false;
        }
      }
      if (canMoveX) this.x = newX;

      // Check Y
      const ty1 = World.worldToTile(this.x - halfW, newY - halfH);
      const ty2 = World.worldToTile(this.x + halfW, newY + halfH);
      let canMoveY = true;
      for (let ty = ty1.y; ty <= ty2.y; ty++) {
        for (let tx = ty1.x; tx <= ty2.x; tx++) {
          if (World.isBlocked(tx, ty)) canMoveY = false;
        }
      }
      if (canMoveY) this.y = newY;
    }

    // Animation
    this.frameTimer += dt;
    if (this.frameTimer > 0.2) {
      this.frameTimer = 0;
      this.frame = (this.frame + 1) % 4;
    }

    // Attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }
    if (this.attackTimer > 0) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) this.isAttacking = false;
    }

    // Update buffs
    this.updateBuffs(dt);
  },

  tryAttack() {
    if (this.attackCooldown > 0) return null;
    this.attackCooldown = this.attackSpeed;
    this.isAttacking = true;
    this.attackTimer = 0.15;

    // Find attack direction
    let ax = 0, ay = 0;
    switch (this.direction) {
      case 'up': ay = -1; break;
      case 'down': ay = 1; break;
      case 'left': ax = -1; break;
      case 'right': ax = 1; break;
    }

    return {
      x: this.x + ax * this.attackRange,
      y: this.y + ay * this.attackRange,
      range: this.attackRange,
      damage: this.getAttackDamage()
    };
  },

  getAttackDamage() {
    let atk = this.baseAttack;
    if (this.weapon) atk += this.weapon.attack || 0;
    // Add buff attack
    this.buffs.forEach(b => { if (b.tempAttack) atk += b.tempAttack; });
    // Slight randomness
    return Math.max(1, atk + Utils.rand(-1, 2));
  },

  takeDamage(amount) {
    const reduced = Math.max(1, amount - this.defense);
    this.hp -= reduced;
    if (this.hp <= 0) {
      this.hp = 0;
      return { dead: true, damage: reduced };
    }
    return { dead: false, damage: reduced };
  },

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  },

  addXp(amount) {
    this.xp += amount;
    if (this.xp >= this.xpToLevel) {
      return this.levelUp();
    }
    return null;
  },

  levelUp() {
    this.level++;
    this.xp -= this.xpToLevel;
    this.xpToLevel = Math.floor(this.xpToLevel * 1.3);

    // Stat increases
    const hpGain = Utils.rand(8, 15);
    const atkGain = Utils.rand(1, 3);
    const defGain = Utils.rand(0, 1);

    this.maxHp += hpGain;
    this.hp = this.maxHp;
    this.baseAttack += atkGain;
    this.defense += defGain;

    return {
      level: this.level,
      hpGain,
      atkGain,
      defGain
    };
  },

  addBuff(buff) {
    this.buffs.push({ ...buff, timer: buff.duration });
    if (buff.tempSpeed) this.speed = this.baseSpeed * buff.tempSpeed;
  },

  updateBuffs(dt) {
    let speedMultiplier = 1;
    this.buffs = this.buffs.filter(b => {
      b.timer -= dt;
      if (b.timer <= 0) return false;
      if (b.tempSpeed) speedMultiplier = Math.max(speedMultiplier, b.tempSpeed);
      return true;
    });
    this.speed = this.baseSpeed * speedMultiplier;
  },

  equipWeapon(item) {
    const old = this.weapon;
    this.weapon = item;
    return old;
  },

  render(ctx) {
    const screenX = this.x - World.camera.x;
    const screenY = this.y - World.camera.y;

    const sprite = Sprites.getPlayerSprite(this.direction, this.frame);

    // Draw shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + this.height / 2 - 2, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw sprite
    ctx.drawImage(
      sprite,
      screenX - this.width / 2,
      screenY - this.height / 2,
      this.width,
      this.height
    );

    // Attack visual
    if (this.isAttacking) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      let ax = screenX, ay = screenY;
      switch (this.direction) {
        case 'up': ay -= 25; break;
        case 'down': ay += 25; break;
        case 'left': ax -= 25; break;
        case 'right': ax += 25; break;
      }
      ctx.beginPath();
      ctx.arc(ax, ay, 15, 0, Math.PI * 2);
      ctx.stroke();
    }

    // HP bar above player
    const barW = 30;
    const barH = 4;
    const barX = screenX - barW / 2;
    const barY = screenY - this.height / 2 - 8;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = this.hp / this.maxHp > 0.3 ? '#2ecc71' : '#e74c3c';
    ctx.fillRect(barX, barY, barW * (this.hp / this.maxHp), barH);
  }
};
