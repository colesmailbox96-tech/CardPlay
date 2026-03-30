// ===== COMBAT SYSTEM =====
const Combat = {
  damageNumbers: [],

  init() {
    this.damageNumbers = [];
  },

  // Player attacks
  playerAttack() {
    const atk = Player.tryAttack();
    if (!atk) return;

    // Find monsters in attack range
    const targets = MonsterManager.findMonstersInRange(atk.x, atk.y, atk.range);

    targets.forEach(monster => {
      const isCrit = Math.random() < 0.15;
      let damage = atk.damage;
      if (isCrit) damage = Math.floor(damage * 2);

      const result = MonsterManager.damageMonster(monster.id, damage);
      if (!result) return;

      // Show damage number
      this.spawnDamageNumber(monster.x, monster.y - monster.height / 2, damage, isCrit ? 'crit' : 'player-damage');

      if (result.killed) {
        this.onMonsterKilled(result.monster);
      }
    });
  },

  // Monster attacks player
  monsterAttackPlayer(monster) {
    if (monster.dead) return;

    const dist = Utils.distance(monster.x, monster.y, Player.x, Player.y);
    if (dist > monster.attackRange) return;

    if (monster.attackCooldown > 0) return;
    monster.attackCooldown = monster.attackSpeed;

    const damage = monster.attack + Utils.rand(-1, 2);
    const result = Player.takeDamage(damage);

    this.spawnDamageNumber(Player.x, Player.y - Player.height / 2, result.damage, 'monster-damage');

    if (result.dead) {
      this.onPlayerDeath();
    }
  },

  onMonsterKilled(monster) {
    // Generate drops
    const drops = LootDB.generateDrops(monster.type);

    // Add gold
    Player.gold += drops.gold;
    if (drops.gold > 0) {
      UI.showNotification('+' + drops.gold + ' Gold', 'loot');
    }

    // Add XP
    const levelUp = Player.addXp(drops.xp);
    if (levelUp) {
      UI.showLevelUp(levelUp);
    }

    // Add direct item drops to inventory
    drops.items.forEach(item => {
      Inventory.addItem(item);
      UI.showNotification('Got ' + item.icon + ' ' + item.name + '!', 'loot');
    });

    // Add card pack drop
    if (drops.cardPack) {
      Inventory.addItem(drops.cardPack);
      UI.showNotification('Got ' + drops.cardPack.icon + ' ' + drops.cardPack.name + '!', 'pack');
    }
  },

  onPlayerDeath() {
    UI.showDeathScreen();
  },

  respawnPlayer() {
    Player.hp = Player.maxHp;
    Player.x = 10 * 32 + 16;
    Player.y = 10 * 32 + 16;
    // Lose some gold
    Player.gold = Math.floor(Player.gold * 0.8);
    UI.hideDeathScreen();
  },

  spawnDamageNumber(worldX, worldY, amount, type) {
    const screenX = worldX - World.camera.x;
    const screenY = worldY - World.camera.y;

    this.damageNumbers.push({
      x: screenX + Utils.rand(-15, 15),
      y: screenY,
      amount,
      type,
      timer: 1.0
    });
  },

  updateDamageNumbers(dt) {
    this.damageNumbers = this.damageNumbers.filter(d => {
      d.timer -= dt;
      d.y -= 40 * dt;
      return d.timer > 0;
    });
  },

  renderDamageNumbers(ctx) {
    this.damageNumbers.forEach(d => {
      ctx.globalAlpha = d.timer;
      ctx.font = d.type === 'crit' ? 'bold 22px "Courier New"' : 'bold 16px "Courier New"';
      ctx.textAlign = 'center';

      if (d.type === 'crit') {
        ctx.fillStyle = '#ffd700';
      } else if (d.type === 'player-damage') {
        ctx.fillStyle = '#ff6b6b';
      } else if (d.type === 'monster-damage') {
        ctx.fillStyle = '#e74c3c';
      } else if (d.type === 'heal') {
        ctx.fillStyle = '#2ecc71';
      }

      ctx.fillText(
        (d.type === 'heal' ? '+' : '-') + d.amount,
        d.x,
        d.y
      );
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    });
  },

  // Process all monster attacks in update loop
  processMonsterAttacks(dt) {
    MonsterManager.monsters.forEach(m => {
      if (m.dead) return;
      const dist = Utils.distance(m.x, m.y, Player.x, Player.y);
      if (dist <= m.attackRange && m.attackCooldown <= 0) {
        this.monsterAttackPlayer(m);
      }
      m.attackCooldown = Math.max(0, m.attackCooldown - dt);
    });
  }
};
