// ===== INPUT SYSTEM (Touch + Keyboard) =====
const Input = {
  direction: { x: 0, y: 0 },
  joystickActive: false,
  joystickStart: { x: 0, y: 0 },
  joystickCurrent: { x: 0, y: 0 },
  joystickTouchId: null,

  // Keyboard state
  keys: {},

  // Joystick visual elements
  joystickOuter: null,
  joystickInner: null,

  init() {
    this.setupJoystick();
    this.setupKeyboard();
    this.setupAttackButton();
    this.setupInventoryButton();
  },

  setupJoystick() {
    const zone = document.getElementById('joystick-zone');

    // Create visual joystick
    this.joystickOuter = document.createElement('div');
    this.joystickOuter.style.cssText = `
      width: 120px; height: 120px;
      border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.3);
      background: rgba(0,0,0,0.3);
      position: absolute;
      left: 10px; bottom: 10px;
      display: flex; align-items: center; justify-content: center;
    `;

    this.joystickInner = document.createElement('div');
    this.joystickInner.style.cssText = `
      width: 50px; height: 50px;
      border-radius: 50%;
      background: rgba(255,255,255,0.5);
      position: absolute;
      transition: none;
    `;

    this.joystickOuter.appendChild(this.joystickInner);
    zone.appendChild(this.joystickOuter);

    // Center the inner knob
    this.resetJoystickVisual();

    // Touch events
    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this.joystickTouchId = touch.identifier;
      const rect = this.joystickOuter.getBoundingClientRect();
      this.joystickStart.x = rect.left + rect.width / 2;
      this.joystickStart.y = rect.top + rect.height / 2;
      this.joystickActive = true;
    }, { passive: false });

    zone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.joystickTouchId) {
          this.updateJoystick(touch.clientX, touch.clientY);
        }
      }
    }, { passive: false });

    zone.addEventListener('touchend', (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.joystickTouchId) {
          this.joystickActive = false;
          this.joystickTouchId = null;
          this.direction.x = 0;
          this.direction.y = 0;
          this.resetJoystickVisual();
        }
      }
    });

    zone.addEventListener('touchcancel', () => {
      this.joystickActive = false;
      this.joystickTouchId = null;
      this.direction.x = 0;
      this.direction.y = 0;
      this.resetJoystickVisual();
    });
  },

  updateJoystick(touchX, touchY) {
    const dx = touchX - this.joystickStart.x;
    const dy = touchY - this.joystickStart.y;
    const maxDist = 50;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, maxDist);

    if (dist > 0) {
      this.direction.x = (dx / dist) * (clampedDist / maxDist);
      this.direction.y = (dy / dist) * (clampedDist / maxDist);
    }

    // Update visual
    const visualX = (dx / dist) * clampedDist;
    const visualY = (dy / dist) * clampedDist;
    this.joystickInner.style.transform = `translate(${visualX}px, ${visualY}px)`;
  },

  resetJoystickVisual() {
    if (this.joystickInner) {
      this.joystickInner.style.transform = 'translate(0px, 0px)';
    }
  },

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  },

  setupAttackButton() {
    const btn = document.getElementById('btn-attack');
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      Combat.playerAttack();
    }, { passive: false });
    btn.addEventListener('click', () => {
      Combat.playerAttack();
    });
  },

  setupInventoryButton() {
    const btn = document.getElementById('btn-inventory');
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      UI.toggleInventory();
    }, { passive: false });
    btn.addEventListener('click', () => {
      UI.toggleInventory();
    });
  },

  update() {
    // Keyboard movement (also active alongside joystick)
    if (!this.joystickActive) {
      let kx = 0, ky = 0;
      if (this.keys['w'] || this.keys['arrowup']) ky = -1;
      if (this.keys['s'] || this.keys['arrowdown']) ky = 1;
      if (this.keys['a'] || this.keys['arrowleft']) kx = -1;
      if (this.keys['d'] || this.keys['arrowright']) kx = 1;
      this.direction.x = kx;
      this.direction.y = ky;

      // Keyboard attack
      if (this.keys[' ']) {
        Combat.playerAttack();
        this.keys[' '] = false;
      }

      // Keyboard inventory
      if (this.keys['i'] || this.keys['e']) {
        UI.toggleInventory();
        this.keys['i'] = false;
        this.keys['e'] = false;
      }
    }
  }
};
