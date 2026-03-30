// ===== MONSTER SYSTEM =====
const MonsterManager = {
  monsters: [],
  maxMonsters: 15,
  spawnTimer: 0,
  spawnInterval: 2,

  monsterDefs: {
    slime:    { hp: 20,  attack: 3,  speed: 0.8, xpValue: 10, aggro: 120 },
    bat:      { hp: 15,  attack: 4,  speed: 1.5, xpValue: 12, aggro: 150 },
    skeleton: { hp: 40,  attack: 6,  speed: 1.0, xpValue: 25, aggro: 130 },
    goblin:   { hp: 35,  attack: 8,  speed: 1.2, xpValue: 30, aggro: 140 },
    demon:    { hp: 80,  attack: 12, speed: 1.0, xpValue: 60, aggro: 160 },
    dragon:   { hp: 150, attack: 20, speed: 0.8, xpValue: 120, aggro: 200 }
  },

  init() {
    this.monsters = [];
    this.spawnTimer = 0;
  },

  createMonster(type, x, y, level) {
    const def = this.monsterDefs[type];
    if (!def) return null;

    const levelMult = 1 + (level - 1) * 0.15;

    return {
      id: Utils.uid(),
      type,
      x,
      y,
      width: type === 'dragon' ? 48 : (type === 'bat' ? 42 : 36),
      height: type === 'dragon' ? 48 : (type === 'bat' ? 30 : type === 'slime' ? 24 : 48),
      hp: Math.floor(def.hp * levelMult),
      maxHp: Math.floor(def.hp * levelMult),
      attack: Math.floor(def.attack * levelMult),
      speed: def.speed,
      level,
      aggroRange: def.aggro,
      attackCooldown: 0,
      attackSpeed: type === 'dragon' ? 1.5 : 1.0,
      attackRange: type === 'dragon' ? 50 : 35,
      frame: 0,
      frameTimer: 0,
      state: 'idle', // idle, chase, attack
      idleDir: { x: 0, y: 0 },
      idleTimer: 0,
      hitFlash: 0,
      dead: false,
      deathTimer: 0
    };
  },

  update(dt) {
    // Spawn timer
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval && this.monsters.length < this.maxMonsters) {
      this.spawnTimer = 0;
      this.trySpawn();
    }

    // Update each monster
    this.monsters.forEach(m => {
      if (m.dead) {
        m.deathTimer += dt;
        return;
      }

      // Animation
      m.frameTimer += dt;
      if (m.frameTimer > 0.3) {
        m.frameTimer = 0;
        m.frame = (m.frame + 1) % 2;
      }

      // Hit flash
      if (m.hitFlash > 0) m.hitFlash -= dt;

      // AI
      const dist = Utils.distance(m.x, m.y, Player.x, Player.y);

      if (dist < m.aggroRange) {
        m.state = 'chase';
        // Move toward player
        const dx = Player.x - m.x;
        const dy = Player.y - m.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0 && dist > m.attackRange) {
          m.x += (dx / len) * m.speed * 60 * dt;
          m.y += (dy / len) * m.speed * 60 * dt;
        }

        // Attack
        if (dist <= m.attackRange) {
          m.state = 'attack';
          m.attackCooldown -= dt;
          if (m.attackCooldown <= 0) {
            m.attackCooldown = m.attackSpeed;
            return { type: 'monster_attack', monster: m, damage: m.attack + Utils.rand(-1, 2) };
          }
        }
      } else {
        m.state = 'idle';
        // Random wander
        m.idleTimer -= dt;
        if (m.idleTimer <= 0) {
          m.idleTimer = Utils.randFloat(1, 3);
          m.idleDir = {
            x: Utils.randFloat(-1, 1),
            y: Utils.randFloat(-1, 1)
          };
        }
        const newX = m.x + m.idleDir.x * m.speed * 30 * dt;
        const newY = m.y + m.idleDir.y * m.speed * 30 * dt;
        const tile = World.worldToTile(newX, newY);
        if (!World.isBlocked(tile.x, tile.y)) {
          m.x = newX;
          m.y = newY;
        }
      }

      return null;
    });

    // Remove fully dead monsters
    this.monsters = this.monsters.filter(m => !(m.dead && m.deathTimer > 0.5));
  },

  trySpawn() {
    // Spawn near player but off-screen
    const angle = Math.random() * Math.PI * 2;
    const dist = Utils.rand(250, 400);
    const sx = Player.x + Math.cos(angle) * dist;
    const sy = Player.y + Math.sin(angle) * dist;

    // Check valid tile
    const tile = World.worldToTile(sx, sy);
    if (tile.x < 0 || tile.y < 0 || tile.x >= World.mapWidth || tile.y >= World.mapHeight) return;
    if (World.isBlocked(tile.x, tile.y)) return;

    const zone = World.getZoneAt(tile.x, tile.y);
    if (!zone) return;

    const type = zone.monsters[Utils.rand(0, zone.monsters.length - 1)];
    const level = Utils.rand(zone.level[0], zone.level[1]);
    const monster = this.createMonster(type, sx, sy, level);
    if (monster) this.monsters.push(monster);
  },

  damageMonster(monsterId, damage) {
    const m = this.monsters.find(m => m.id === monsterId);
    if (!m || m.dead) return null;

    m.hp -= damage;
    m.hitFlash = 0.15;

    if (m.hp <= 0) {
      m.hp = 0;
      m.dead = true;
      m.deathTimer = 0;
      return { killed: true, monster: m };
    }
    return { killed: false, monster: m };
  },

  findMonstersInRange(x, y, range) {
    return this.monsters.filter(m =>
      !m.dead && Utils.distance(x, y, m.x, m.y) <= range
    );
  },

  render(ctx) {
    this.monsters.forEach(m => {
      const screenX = m.x - World.camera.x;
      const screenY = m.y - World.camera.y;

      // Skip if off screen
      if (screenX < -60 || screenX > ctx.canvas.width + 60 ||
          screenY < -60 || screenY > ctx.canvas.height + 60) return;

      if (m.dead) {
        // Death animation (fade out)
        ctx.globalAlpha = Math.max(0, 1 - m.deathTimer * 2);
      }

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + m.height / 2 - 2, m.width / 3, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sprite
      const sprite = Sprites.getMonsterSprite(m.type, m.frame);
      if (m.hitFlash > 0) {
        ctx.filter = 'brightness(3)';
      }
      ctx.drawImage(
        sprite,
        screenX - m.width / 2,
        screenY - m.height / 2,
        m.width,
        m.height
      );
      ctx.filter = 'none';

      if (!m.dead) {
        // HP bar
        const barW = m.width;
        const barH = 4;
        const barX = screenX - barW / 2;
        const barY = screenY - m.height / 2 - 10;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(barX, barY, barW * (m.hp / m.maxHp), barH);

        // Level & name
        ctx.fillStyle = '#fff';
        ctx.font = '10px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('Lv.' + m.level + ' ' + m.type.charAt(0).toUpperCase() + m.type.slice(1), screenX, barY - 3);
        ctx.textAlign = 'left';
      }

      ctx.globalAlpha = 1;
    });
  }
};
