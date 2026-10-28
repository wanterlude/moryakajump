  var DUEL_W = 400;
  var DUEL_H = 600;
  var DUEL_PLAYER_Y = DUEL_H - 90;
  var DUEL_PLAYER_HALF = 15;
  var DUEL_PAUSE_ZONE = { x: 354, y: 17, w: 24, h: 24 };
  var DUEL_PLAYER_SPEED = 5;
  // Скорострельность игрока намеренно снижена: залп раз в 18 кадров (~3.3 в секунду).
  var DUEL_FIRE_FRAMES = 18;
  var DUEL_PLAYER_SHOT_SPEED = -9;
  var DUEL_INVULN_FRAMES = 90;
  var DUEL_HIT_RADIUS = 9;
  var DUEL_BOSS_HALF = 46;
  var DUEL_BOSS_Y = 158;
  var DUEL_END_FRAMES = 96;
  // У каждого босса — свой набор приёмов, включая сигнатурную атаку.
  var DUEL_PATTERNS_KRAKEN = [
    ["aim", "ring", "tentacle", "lob"],
    ["ring", "sweep", "tentacle", "spiral", "aim"],
    ["tentacle", "sweep", "cross", "ring", "geyser", "spiral"]
  ];
  var DUEL_PATTERNS_YETI = [
    ["lob", "geyser", "icewall"],
    ["icewall", "hail", "ring", "lob"],
    ["hail", "cross", "icewall", "spiral", "geyser", "lob"]
  ];
  var DUEL_PATTERNS_STORM = [
    ["aim", "ring", "bolt", "shards"],
    ["ring", "spiral", "cross", "bolt", "aim"],
    ["bolt", "cross", "spiral", "geyser", "hail", "ring", "seeker"]
  ];
  var DUEL_PATTERNS_AVALANCHE = [
    ["lob", "geyser", "rockslide"],
    ["rockslide", "hail", "ring", "lob"],
    ["hail", "rockslide", "cross", "geyser", "spiral", "seeker"]
  ];
  var DUEL_PATTERNS_LEVIATHAN = [
    ["shards", "aim", "tide", "lob"],
    ["tide", "sweep", "cross", "hail", "spiral"],
    ["tide", "spiral", "cross", "hail", "geyser", "seeker", "sweep"]
  ];
  var DUEL_PATTERNS = DUEL_PATTERNS_KRAKEN;
  // Сигнатурные атаки переиспользуют телеграф «родственного» типа.
  var DUEL_TELEGRAPH_VIEW = {
    tentacle: "aim",
    icewall: "sweep",
    bolt: "shards",
    rockslide: "hail",
    tide: "sweep"
  };
  var DUEL_TELEGRAPH_FRAMES = {
    aim: 40, ring: 53, sweep: 62,
    shards: 46, lob: 51, spiral: 59, cross: 48, hail: 57, geyser: 46, seeker: 53,
    tentacle: 55, icewall: 53, bolt: 42, rockslide: 59, tide: 55
  };
  var DUEL_ATTACK_COLORS = {
    aim: "#8ad8ff", ring: "#b9a8ff", sweep: "#7ef7ff",
    shards: "#9fe8ff", lob: "#e6f7ff", spiral: "#9dffd8",
    cross: "#c7b3ff", hail: "#c3ecff", geyser: "#a4f0ff", seeker: "#d8c9ff",
    tentacle: "#7fd8f0", icewall: "#9fe8ff", bolt: "#c3ecff",
    rockslide: "#ffd28a", tide: "#7ef7ff"
  };
  var DUEL_COOLDOWN_FRAMES = [100, 76, 58];
  // Сложность боссов смягчена (~20–25%): снаряды медленнее, паузы между
  // атаками длиннее, телеграфы дают больше времени на реакцию.
  var DUEL_SPEED_BY_BOSS = [2.34, 2.79, 3.06, 3.42, 3.78];
  var DUEL_COOL_BY_BOSS = [0.264, 0.231, 0.209, 0.187, 0.165];
  function duelBossIndexClamp(index, len) {
    return Math.min(index, len - 1);
  }
  function duelSpeedMul(index) {
    return DUEL_SPEED_BY_BOSS[duelBossIndexClamp(index, DUEL_SPEED_BY_BOSS.length)];
  }
  function duelCooldownMul(index) {
    return DUEL_COOL_BY_BOSS[duelBossIndexClamp(index, DUEL_COOL_BY_BOSS.length)];
  }
  // Индивидуальный стиль боя: характер движения босса по арене.
  var DUEL_BOSS_STYLE = [
    { swayAmp: 84, swaySpd: 96, bobAmp: 6, bobSpd: 56 },   // кракен — вальяжные волны
    { swayAmp: 54, swaySpd: 124, bobAmp: 16, bobSpd: 70 }, // йети — тяжёлые подскоки
    { swayAmp: 118, swaySpd: 46, bobAmp: 10, bobSpd: 36 }, // спрут — быстрые рывки
    { swayAmp: 38, swaySpd: 150, bobAmp: 7, bobSpd: 88 },  // хранитель — почти статичен
    { swayAmp: 96, swaySpd: 62, bobAmp: 12, bobSpd: 44 }   // левиафан — плавные широкие
  ];
  function duelBossStyle() {
    return DUEL_BOSS_STYLE[duelBossIndexClamp(duelState.index, DUEL_BOSS_STYLE.length)];
  }
  var DUEL_BULLET_SPEED = [2.7, 3.1, 3.5];
  var DUEL_RING_COUNT = [12, 16, 20];
  var DUEL_PHASE_COLORS = ["#4fc3f7", "#ffc247", "#ff5c7a"];
  var duelState = {
    active: false,
    frame: 0,
    px: 185,
    lives: 0,
    invuln: 0,
    fireCd: 0,
    bx: DUEL_W / 2,
    by: DUEL_BOSS_Y,
    bhp: 0,
    bmax: 0,
    index: 0,
    level: 0,
    bossKind: "kraken",
    arena: "shore",
    cooldown: 0,
    attackCount: 0,
    telegraph: null,
    bullets: [],
    particles: [],
    events: [],
    flash: 0,
    over: false,
    overLeft: 0,
    won: false
  };
  function duelClamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }
  function duelIsActive() {
    return duelState.active;
  }
  function duelCancel() {
    duelState.active = false;
    duelState.telegraph = null;
    duelState.bullets = [];
    duelState.particles = [];
    duelState.events = [];
    duelState.over = false;
  }
  function duelPlayerX() {
    return duelState.px;
  }
  /**
   * Перки забега в дуэли: «СФЕРА» (invuln) и «СТРАХОВКА» (guard) дают
   * по одному щиту — попадание тратит щит, а не жизнь.
   */
  function duelPerkShields() {
    if (typeof perkValue !== "function") return 0;
    return (perkValue("invuln") > 0 ? 1 : 0) + (perkValue("guard") > 0 ? 1 : 0);
  }
  function duelDrainEvents() {
    const out = duelState.events;
    duelState.events = [];
    return out;
  }
  function duelStart(index, lives2, px) {
    duelState.active = true;
    duelState.frame = 0;
    duelState.px = duelClamp(px - DUEL_PLAYER_HALF, 0, DUEL_W - DUEL_PLAYER_HALF * 2);
    duelState.lives = lives2;
    duelState.shield = duelPerkShields();
    duelState.invuln = 0;
    duelState.fireCd = 0;
    duelState.bx = DUEL_W / 2;
    duelState.by = DUEL_BOSS_Y;
    duelState.index = index;
    const def = duelBossDef(index);
    duelState.bossKind = def.kind;
    duelState.arena = def.arena;
    duelState.bmax = 40 + index * 15;
    duelState.bhp = duelState.bmax;
    duelState.level = 0;
    duelState.cooldown = 120;
    duelState.attackCount = 0;
    duelState.telegraph = null;
    duelState.bullets = [];
    duelState.particles = [];
    duelState.events = [];
    duelState.flash = 0;
    duelState.over = false;
    duelState.overLeft = 0;
    duelState.won = false;
  }
  function duelUpdate(dt, input) {
    if (!duelState.active) return null;
    const f = Math.min(Math.max(dt, 0), 2);
    duelState.frame += f;
    duelState.flash = Math.max(0, duelState.flash - f);
    duelStepParticles(f);
    if (duelState.over) {
      duelState.overLeft -= f;
      if (duelState.overLeft <= 0) {
        duelState.active = false;
        return { won: duelState.won, livesLeft: Math.max(0, duelState.lives) };
      }
      return null;
    }
    duelMovePlayer(f, input);
    if (duelState.invuln > 0) duelState.invuln = Math.max(0, duelState.invuln - f);
    const style = duelBossStyle();
    duelState.bx = DUEL_W / 2 + Math.sin(duelState.frame / style.swaySpd) * style.swayAmp;
    duelState.by = DUEL_BOSS_Y + Math.sin(duelState.frame / style.bobSpd) * style.bobAmp;
    duelUpdateLevel();
    duelState.fireCd -= f;
    if (duelState.fireCd <= 0) {
      duelState.fireCd = DUEL_FIRE_FRAMES;
      duelState.bullets.push({
        x: duelState.px + DUEL_PLAYER_HALF,
        y: DUEL_PLAYER_Y - 14,
        vx: 0,
        vy: DUEL_PLAYER_SHOT_SPEED,
        r: 3,
        own: true,
        kind: "bolt",
        age: 0,
        delay: 0
      });
    }
    duelUpdateAttacks(f);
    duelStepBullets(f);
    duelCheckHits();
    if (duelState.bhp <= 0) duelFinish(true);
    else if (duelState.lives <= 0) duelFinish(false);
    return null;
  }
  function duelMovePlayer(f, input) {
    if (input.left !== input.right) {
      duelState.px += (input.left ? -1 : 1) * DUEL_PLAYER_SPEED * f;
    } else if (input.targetX !== null) {
      const error = input.targetX - (duelState.px + DUEL_PLAYER_HALF);
      duelState.px += duelClamp(error * 0.2 * f, -DUEL_PLAYER_SPEED * 1.5 * f, DUEL_PLAYER_SPEED * 1.5 * f);
    }
    duelState.px = duelClamp(duelState.px, 0, DUEL_W - DUEL_PLAYER_HALF * 2);
  }
  function duelUpdateLevel() {
    const ratio = duelState.bhp / duelState.bmax;
    const next = ratio > 0.66 ? 0 : ratio > 0.33 ? 1 : 2;
    if (next > duelState.level) {
      duelState.level = next;
      duelState.flash = 14;
      duelState.events.push("\u0424\u0410\u0417\u0410 " + (next + 1));
      duelBurst(duelState.bx, duelState.by, DUEL_PHASE_COLORS[next], 26, 4);
    }
  }
  function duelUpdateAttacks(f) {
    const t = duelState.telegraph;
    if (t) {
      t.left -= f;
      t.tick = (t.tick || 0) + f;
      if (t.left <= 0) {
        duelState.telegraph = null;
        duelFireAttack(t);
        duelState.cooldown = DUEL_COOLDOWN_FRAMES[duelState.level] * duelCooldownMul(duelState.index);
      }
      return;
    }
    duelState.cooldown -= f;
    if (duelState.cooldown <= 0) {
      const pattern = duelPatterns()[duelState.level] || duelPatterns()[0];
      const attack = pattern[duelState.attackCount % pattern.length];
      duelState.attackCount++;
      const frames = DUEL_TELEGRAPH_FRAMES[attack] || 46;
      duelState.telegraph = {
        kind: DUEL_TELEGRAPH_VIEW[attack] || attack,
        attack,
        left: frames,
        total: frames,
        tick: 0,
        gapX: 50 + Math.random() * (DUEL_W - 100),
        gap: Math.random() * Math.PI * 2,
        aimX: duelClamp(duelState.px + DUEL_PLAYER_HALF, 38, DUEL_W - 38),
        cols: [
          duelClamp(duelState.px + DUEL_PLAYER_HALF + (Math.random() - 0.5) * 54, 30, DUEL_W - 30),
          34 + Math.random() * (DUEL_W - 68),
          34 + Math.random() * (DUEL_W - 68)
        ],
        side: Math.random() < 0.5 ? -1 : 1
      };
    }
  }
  function duelFireAttack(t) {
    const speed = DUEL_BULLET_SPEED[duelState.level] * duelSpeedMul(duelState.index);
    const bx = duelState.bx;
    const by = duelState.by;
    const px = duelState.px + DUEL_PLAYER_HALF;
    const kind = t.attack || t.kind;
    if (kind === "aim") {
      const base = Math.atan2(DUEL_PLAYER_Y - by, t.aimX - bx);
      for (const k of [-1, 0, 1]) {
        const a = base + k * 0.19;
        duelPushEnemy(bx, by + 4, Math.cos(a) * speed, Math.sin(a) * speed, "shard", { r: 5.4, spinRate: 0.12 });
      }
    } else if (kind === "ring") {
      const n = DUEL_RING_COUNT[duelState.level];
      const gap = Math.random() * Math.PI * 2;
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2;
        if (Math.abs(duelWrapAngle(a - gap)) < 0.34) continue;
        duelPushEnemy(bx, by, Math.cos(a) * speed, Math.sin(a) * speed, "snowflake", {
          r: 6,
          spinRate: 0.09 + (i % 3) * 0.03,
          spin: i * 0.7
        });
      }
    } else if (kind === "sweep") {
      const y = by + DUEL_BOSS_HALF + 16;
      for (let x = 12; x < DUEL_W; x += 26) {
        if (Math.abs(x - t.gapX) < 38) continue;
        duelPushEnemy(x, y, 0, speed * 1.12, "shard", { r: 5, spin: Math.PI, spinRate: 0.05 });
      }
    } else if (kind === "shards") {
      const cols = [t.aimX, t.cols[1], t.cols[2], (t.aimX + t.cols[1]) % DUEL_W];
      for (let i = 0; i < cols.length; i++) {
        duelPushEnemy(duelClamp(cols[i], 22, DUEL_W - 22), -18, 0, speed * 1.55, "shard", {
          r: 6,
          delay: 2 + i * 5,
          spin: Math.PI,
          spinRate: 0.06,
          shatter: 2
        });
      }
    } else if (kind === "lob") {
      const flight = 42;
      const targetY = DUEL_PLAYER_Y + 8;
      for (let k = 0; k < 2; k++) {
        const tx = duelClamp(t.aimX + (k === 0 ? -34 : 34), 30, DUEL_W - 30);
        const vx = (tx - bx) / flight;
        const vy = (targetY - by) / flight - 0.5 * 0.4 * flight;
        duelPushEnemy(bx, by + 34, vx, vy, "snowball", {
          r: 8.5,
          grav: 0.4,
          wobble: 1 + k * 0.4,
          burst: 3,
          delay: k * 7
        });
      }
    } else if (kind === "spiral") {
      const waves = 4;
      const arms = 9;
      const base = Math.random() * Math.PI * 2;
      for (let w = 0; w < waves; w++) {
        for (let i = 0; i < arms; i++) {
          const a = base + w * 0.32 + i / arms * Math.PI * 2;
          duelPushEnemy(bx, by, Math.cos(a) * speed * 0.94, Math.sin(a) * speed * 0.94, "shard", {
            r: 5,
            delay: w * 10,
            spin: a,
            spinRate: 0.05
          });
        }
      }
    } else if (kind === "cross") {
      const angles = [0.72, 2.42, 3.86, 5.56, 1.57, 4.71];
      for (let i = 0; i < angles.length; i++) {
        const a = angles[i];
        duelPushEnemy(bx, by, Math.cos(a) * speed * 1.05, Math.sin(a) * speed * 1.05, "shard", {
          r: 5.2,
          spin: a,
          spinRate: 0.04,
          delay: i % 2 === 0 ? 0 : 4
        });
      }
    } else if (kind === "hail") {
      const gapX = t.gapX;
      for (let i = 0, x = 16; x < DUEL_W; x += 23, i++) {
        if (Math.abs(x - gapX) < 42) continue;
        duelPushEnemy(x, -16, (x - DUEL_W / 2) * 0.004, speed * 1.28, "hail", {
          r: 4.6,
          delay: (i * 5) % 20,
          spin: Math.PI,
          spinRate: 0.08
        });
      }
    } else if (kind === "geyser") {
      const cols = [
        duelClamp(px + (t.side < 0 ? -46 : 46), 32, DUEL_W - 32),
        t.cols[1],
        t.cols[2]
      ];
      for (let i = 0; i < cols.length; i++) {
        const x = duelClamp(cols[i], 30, DUEL_W - 30);
        duelPushEnemy(x, DUEL_PLAYER_Y + 34, 0, -speed * 1.6, "spike", {
          r: 7,
          delay: 3 + i * 7,
          life: 90
        });
        duelBurst(x, DUEL_PLAYER_Y + 34, "#c9f4ff", 6, 1.6);
      }
    } else if (kind === "tentacle") {
      const base = Math.atan2(DUEL_PLAYER_Y - by, px - bx);
      const n = 9;
      for (let i = 0; i < n; i++) {
        const an = base - 0.62 + (i / (n - 1)) * 1.24;
        duelPushEnemy(bx, by + 18, Math.cos(an) * speed * 1.02, Math.sin(an) * speed * 1.02, "shard", {
          r: 5.6, delay: i * 1.5, spin: an, spinRate: 0.05
        });
      }
    } else if (kind === "icewall") {
      for (let i = 0, x = 22; x < DUEL_W; x += 30, i++) {
        if (Math.abs(x - t.gapX) < 46) continue;
        duelPushEnemy(x, DUEL_PLAYER_Y + 34, 0, -speed * 1.72, "spike", {
          r: 7.4, delay: (i % 3) * 4, life: 84
        });
      }
    } else if (kind === "bolt") {
      const cols = [t.aimX, t.cols[1], t.cols[2]];
      for (let i = 0; i < cols.length; i++) {
        const x = duelClamp(cols[i], 24, DUEL_W - 24);
        for (let y = -12; y < DUEL_PLAYER_Y - 40; y += 30) {
          duelPushEnemy(x, y, 0, speed * 2.3, "hail", {
            r: 4.4, delay: Math.max(0, (y + 12) * 0.02), spin: Math.PI, spinRate: 0.1
          });
        }
      }
    } else if (kind === "rockslide") {
      for (let i = 0, x = 26; x < DUEL_W; x += 46, i++) {
        if (Math.abs(x - t.gapX) < 52) continue;
        duelPushEnemy(x, -22, (x - DUEL_W / 2) * 0.003, speed * 1.12, "snowball", {
          r: 11, grav: 0.14, burst: 2, wobble: 0.6, delay: (i % 3) * 8
        });
      }
    } else if (kind === "tide") {
      const y0 = by + DUEL_BOSS_HALF + 8;
      for (let w = 0; w < 2; w++) {
        for (let x = 10; x < DUEL_W; x += 22) {
          if (Math.abs(x - t.gapX) < 42) continue;
          duelPushEnemy(x, y0 + w * 30, 0, speed * 1.25, "shard", {
            r: 5.6, delay: w * 8 + (x % 2), spin: Math.PI, spinRate: 0.05
          });
        }
      }
    } else {
      for (let k = 0; k < 2; k++) {
        duelPushEnemy(bx + (k === 0 ? -30 : 30), by + 20, (k === 0 ? -0.7 : 0.7), 1.15, "seeker", {
          r: 7.5,
          homing: 0.05,
          life: 320,
          wobble: k
        });
      }
    }
  }
  function duelPushEnemy(x, y, vx, vy, kind, extra) {
    duelState.bullets.push(Object.assign({
      x, y, vx, vy, r: 5, own: false, kind: kind || "shard", age: 0, delay: 0
    }, extra || {}));
  }
  function duelWrapAngle(a) {
    let v = a % (Math.PI * 2);
    if (v > Math.PI) v -= Math.PI * 2;
    if (v < -Math.PI) v += Math.PI * 2;
    return v;
  }
  function duelStepBullets(f) {
    const list = duelState.bullets;
    const cx = duelState.px + DUEL_PLAYER_HALF;
    const cy = DUEL_PLAYER_Y + 4;
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      b.age = (b.age || 0) + f;
      if (b.delay > 0) {
        b.delay -= f;
        continue;
      }
      if (b.grav) b.vy += b.grav * f;
      if (b.homing) {
        const dx = cx - b.x;
        const dy = cy - b.y;
        const d = Math.hypot(dx, dy) || 1;
        const sp = Math.hypot(b.vx, b.vy) || 1;
        b.vx += (dx / d * sp - b.vx) * b.homing * f;
        b.vy += (dy / d * sp - b.vy) * b.homing * f;
      }
      b.x += b.vx * f;
      b.y += b.vy * f;
      if (b.wobble && b.kind === "snowball") {
        b.x += Math.sin((b.age + b.wobble * 20) / 7) * 0.3 * f;
      }
      b.spin = (b.spin || 0) + (b.spinRate || 0) * f;
      if (b.kind === "snowball" && b.y > DUEL_PLAYER_Y + 42) {
        duelBurst(b.x, DUEL_PLAYER_Y + 40, "#eafaff", 9, 2.4);
        const n = b.burst || 0;
        for (let k = 0; k < n; k++) {
          const a = Math.PI + (k - (n - 1) / 2) * 0.55;
          duelPushEnemy(b.x, DUEL_PLAYER_Y + 36, Math.cos(a) * 2.4, Math.sin(a) * 2.4, "shard", {
            r: 4,
            grav: 0.16,
            life: 70
          });
        }
        list.splice(i, 1);
        continue;
      }
      if (b.life != null) {
        b.life -= f;
        if (b.life <= 0) {
          list.splice(i, 1);
          continue;
        }
      }
      if (b.y < -70 || b.y > DUEL_H + 40 || b.x < -50 || b.x > DUEL_W + 50) list.splice(i, 1);
    }
  }
  function duelCheckHits() {
    const list = duelState.bullets;
    const cx = duelState.px + DUEL_PLAYER_HALF;
    const cy = DUEL_PLAYER_Y + 4;
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      if (b.delay > 0) continue;
      if (b.own) {
        if (Math.abs(b.x - duelState.bx) < DUEL_BOSS_HALF && Math.abs(b.y - duelState.by) < DUEL_BOSS_HALF * 0.8) {
          list.splice(i, 1);
          duelState.bhp -= 1;
          duelState.flash = 5;
          duelBurst(b.x, b.y, "#a9f0ff", 6, 2.4);
          if (duelState.bhp <= 0) return;
        }
        continue;
      }
      if (duelState.invuln > 0) continue;
      const dx = b.x - cx;
      const dy = b.y - cy;
      if (dx * dx + dy * dy < (b.r + DUEL_HIT_RADIUS) * (b.r + DUEL_HIT_RADIUS)) {
        const kind = b.kind;
        list.splice(i, 1);
        duelState.invuln = DUEL_INVULN_FRAMES;
        if (duelState.shield > 0) {
          duelState.shield -= 1;
          duelState.events.push("\u0429\u0418\u0422");
          duelBurst(cx, cy, "#a9f0ff", 16, 3.4);
          continue;
        }
        duelState.lives -= 1;
        duelState.events.push("-1 \u0416\u0418\u0417\u041D\u042C");
        duelBurst(cx, cy, kind === "snowball" ? "#eafaff" : "#ff6b81", 18, 3.6);
        if (duelState.lives <= 0) return;
      }
    }
  }
  function duelFinish(won) {
    duelState.over = true;
    duelState.won = won;
    duelState.overLeft = DUEL_END_FRAMES;
    duelState.telegraph = null;
    duelState.bullets = [];
    if (won) {
      duelState.events.push("\u041F\u041E\u0411\u0415\u0414\u0410");
      duelBurst(duelState.bx, duelState.by, "#ffd166", 48, 6);
    } else {
      duelState.events.push("\u041F\u041E\u0420\u0410\u0416\u0415\u041D\u0418\u0415");
      duelBurst(duelState.px + DUEL_PLAYER_HALF, DUEL_PLAYER_Y, "#ff4d6d", 36, 5);
    }
  }
  function duelBurst(x, y, color, count, speed) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.4 + Math.random() * 0.8);
      const life = 18 + Math.random() * 18;
      duelState.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life, max: life, color });
    }
  }
  function duelStepParticles(f) {
    const list = duelState.particles;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx * f;
      p.y += p.vy * f;
      p.vx *= Math.pow(0.94, f);
      p.vy *= Math.pow(0.94, f);
      p.life -= f;
      if (p.life <= 0) list.splice(i, 1);
    }
  }
  var DUEL_BOSS_DEFS = [
    { name: "ЛЕДЯНОЙ КРАКЕН", kind: "kraken", arena: "shore", subtitle: "ХРАНИТЕЛЬ ПОЛЫНЬИ", accent: "#4fc3f7" },
    { name: "СНЕЖНЫЙ ЙЕТИ", kind: "yeti", arena: "canyon", subtitle: "ХОЗЯИН ЛЕДЯНОГО КАНЬОНА", accent: "#7fd8f0" },
    { name: "ШТОРМОВОЙ СПРУТ", kind: "storm", arena: "storm", subtitle: "ПОВЕЛИТЕЛЬ ШТОРМА", accent: "#8f7dff" },
    { name: "ХРАНИТЕЛЬ ЛАВИН", kind: "avalanche", arena: "avalanche", subtitle: "ГОЛОС ЛАВИНЫ", accent: "#ffc247" },
    { name: "ЛЕДЯНОЙ ЛЕВИАФАН", kind: "leviathan", arena: "abyss", subtitle: "ЦАРЬ ГЛУБИН", accent: "#5ce8ff" }
  ];
  var DUEL_BOSS_NAMES = DUEL_BOSS_DEFS.map((d) => d.name);
  function duelBossDef(index) {
    return DUEL_BOSS_DEFS[Math.min(Math.max(index | 0, 0), DUEL_BOSS_DEFS.length - 1)];
  }
  function duelBossKind() {
    return duelState.bossKind || "kraken";
  }
  function duelPatterns() {
    const kind = duelBossKind();
    if (kind === "yeti") return DUEL_PATTERNS_YETI;
    if (kind === "storm") return DUEL_PATTERNS_STORM;
    if (kind === "avalanche") return DUEL_PATTERNS_AVALANCHE;
    if (kind === "leviathan") return DUEL_PATTERNS_LEVIATHAN;
    return DUEL_PATTERNS_KRAKEN;
  }
  var DUEL_PHASE_TINTS = [
    "rgba(79,195,247,0.00)",
    "rgba(255,194,71,0.055)",
    "rgba(255,92,122,0.075)"
  ];
  var duelBackdropCanvas = null;
  var duelGlowSprites = /* @__PURE__ */ new Map();
  var DUEL_SNOWFLAKES = [];
  for (let i = 0; i < 34; i++) {
    DUEL_SNOWFLAKES.push({
      x: (i * 73.7) % DUEL_W,
      y: (i * 131.3) % DUEL_H,
      r: 0.9 + (i % 4) * 0.55,
      speed: 0.55 + (i % 5) * 0.18,
      drift: 0.25 + (i % 3) * 0.16,
      phase: i * 0.7
    });
  }
  function duelRoundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.roundRect(x, y, w, h, Math.max(0, Math.min(r, Math.min(w, h) / 2)));
  }
  function duelText(c, text, x, y, size, color, align = "left", tracking = 0, weight = "bold") {
    const chars = [...text];
    c.save();
    c.font = `${weight} ${size}px ${FONT_STACK}`;
    c.fillStyle = color;
    c.textBaseline = "middle";
    if (tracking <= 0) {
      c.textAlign = align;
      c.fillText(text, x, y);
      c.restore();
      return c.measureText(text).width;
    }
    const widths = chars.map((ch) => c.measureText(ch).width);
    const total = widths.reduce((sum, w) => sum + w, 0) + tracking * Math.max(0, chars.length - 1);
    let cursor = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
    c.textAlign = "left";
    for (let i = 0; i < chars.length; i++) {
      c.fillText(chars[i], cursor, y);
      cursor += widths[i] + tracking;
    }
    c.restore();
    return total;
  }
  function duelHexToRgba(hex, alpha) {
    const h = String(hex).replace("#", "");
    const n = h.length === 3 ? [...h].map((ch) => ch + ch).join("") : h;
    const r = parseInt(n.slice(0, 2), 16) || 0;
    const g = parseInt(n.slice(2, 4), 16) || 0;
    const b = parseInt(n.slice(4, 6), 16) || 0;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  function duelGlowSprite(color) {
    let sprite = duelGlowSprites.get(color);
    if (sprite) return sprite;
    const size = 64;
    const cv = document.createElement("canvas");
    cv.width = size;
    cv.height = size;
    const g = cv.getContext("2d");
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,0.95)");
    grad.addColorStop(0.18, duelHexToRgba(color, 0.85));
    grad.addColorStop(0.5, duelHexToRgba(color, 0.28));
    grad.addColorStop(1, duelHexToRgba(color, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    duelGlowSprites.set(color, cv);
    return cv;
  }
  function duelDrawGlow(c, x, y, radius, color) {
    const sprite = duelGlowSprite(color);
    c.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
  }
  var DUEL_HORIZON = 356;
  var DUEL_SHELF_TOP = 535;
  var DUEL_ARENA_SPARKLES = [];
  for (let i = 0; i < 18; i++) {
    DUEL_ARENA_SPARKLES.push({
      x: 20 + (i * 101.3) % (DUEL_W - 40),
      y: 552 + (i * 43.7) % 36,
      r: 0.6 + (i % 3) * 0.45,
      phase: i * 1.37,
      speed: 0.5 + (i % 4) * 0.2
    });
  }
  DUEL_SNOWFLAKES.length = 0;
  for (let i = 0; i < 66; i++) {
    const depth = i % 3;
    DUEL_SNOWFLAKES.push({
      x: (i * 61.7) % DUEL_W,
      y: (i * 149.3) % DUEL_H,
      r: depth === 0 ? 0.5 + (i % 3) * 0.25 : depth === 1 ? 1.0 + (i % 3) * 0.3 : 2.2 + (i % 4) * 0.45,
      speed: depth === 0 ? 0.3 + (i % 4) * 0.07 : depth === 1 ? 0.62 + (i % 4) * 0.1 : 1.05 + (i % 3) * 0.18,
      drift: depth === 0 ? 0.12 : depth === 1 ? 0.3 : 0.5,
      phase: i * 0.63,
      depth
    });
  }
  function duelShelfTop(x) {
    return DUEL_SHELF_TOP + Math.sin(x / 74) * 1.5 + Math.sin(x / 23) * 0.6;
  }
  function duelRidgeFill(c, pts, baseY, fill, fill2) {
    c.beginPath();
    c.moveTo(pts[0][0], baseY);
    for (const p of pts) c.lineTo(p[0], p[1]);
    c.lineTo(pts[pts.length - 1][0], baseY);
    c.closePath();
    if (fill2) {
      let minY = baseY;
      for (const p of pts) if (p[1] < minY) minY = p[1];
      const g = c.createLinearGradient(0, minY, 0, baseY);
      g.addColorStop(0, fill);
      g.addColorStop(1, fill2);
      c.fillStyle = g;
    } else {
      c.fillStyle = fill;
    }
    c.fill();
  }
  function duelRidgeRim(c, pts, fromX, toX, color, alpha, width) {
    c.save();
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = color;
    c.globalAlpha = alpha;
    c.lineWidth = width;
    c.beginPath();
    let started = false;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (p[0] < fromX || p[0] > toX) continue;
      if (!started) {
        c.moveTo(p[0], p[1]);
        started = true;
      } else {
        c.lineTo(p[0], p[1]);
      }
    }
    c.stroke();
    c.restore();
  }
  function duelHazeBand(c, y, h, alpha) {
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, "rgba(226,248,255,0)");
    g.addColorStop(0.5, `rgba(226,248,255,${alpha})`);
    g.addColorStop(1, "rgba(226,248,255,0)");
    c.fillStyle = g;
    c.fillRect(0, y, DUEL_W, h);
  }
  function duelFloe(c, x, y, w, h, alpha, light) {
    c.save();
    c.globalAlpha = alpha;
    // Мягкая тень-отражение под льдиной
    const sh = c.createRadialGradient(x + w * 0.5, y + h * 0.8, 1, x + w * 0.5, y + h * 0.8, w * 0.55);
    sh.addColorStop(0, "rgba(6,34,50,0.16)");
    sh.addColorStop(1, "rgba(6,34,50,0)");
    c.fillStyle = sh;
    c.beginPath();
    c.ellipse(x + w * 0.5, y + h * 0.8, w * 0.55, h * 0.5, 0, 0, Math.PI * 2);
    c.fill();
    // Плоская льдина
    c.beginPath();
    c.moveTo(x + w * 0.02, y + h * 0.46);
    c.lineTo(x + w * 0.17, y + h * 0.14);
    c.lineTo(x + w * 0.45, y + h * 0.02);
    c.lineTo(x + w * 0.78, y + h * 0.08);
    c.lineTo(x + w * 0.98, y + h * 0.46);
    c.lineTo(x + w * 0.8, y + h * 0.9);
    c.lineTo(x + w * 0.42, y + h);
    c.lineTo(x + w * 0.12, y + h * 0.84);
    c.closePath();
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, light ? "#f2fdff" : "#dcf3fc");
    g.addColorStop(0.5, "#aad7e8");
    g.addColorStop(1, "#6ba5bf");
    c.fillStyle = g;
    c.fill();
    // Светлая кромка сверху
    c.strokeStyle = "rgba(255,255,255,0.7)";
    c.lineWidth = 0.9;
    c.beginPath();
    c.moveTo(x + w * 0.17, y + h * 0.14);
    c.lineTo(x + w * 0.45, y + h * 0.02);
    c.lineTo(x + w * 0.78, y + h * 0.08);
    c.stroke();
    c.restore();
  }
  function duelAuroraCloud(c, t, seed, colorA, colorB, strength) {
    c.save();
    c.globalCompositeOperation = "lighter";
    for (let pass = 0; pass < 2; pass++) {
      const color = pass === 0 ? colorA : colorB;
      const baseY = 74 + seed * 0.5 + pass * 54;
      for (let i = 0; i < 13; i++) {
        const x = -26 + i * 36 + Math.sin(t / 190 + i * 0.85 + seed) * 18;
        const y = baseY + Math.sin(i * 0.72 + t / 150 + seed) * 21 + Math.sin(i * 1.9 + seed) * 7;
        const rr = 46 + Math.sin(i * 1.3 + seed) * 12;
        c.globalAlpha = (pass === 0 ? 0.09 : 0.06) * strength;
        duelDrawGlow(c, x, y, rr, color);
      }
    }
    // Вертикальные «столбы» сияния
    c.save();
    c.translate(0, 96 + seed * 0.4);
    c.scale(0.42, 1.5);
    for (let i = 0; i < 5; i++) {
      const x = (24 + i * 96) / 0.42 + Math.sin(t / 210 + i + seed) * 22;
      c.globalAlpha = 0.045 * strength;
      duelDrawGlow(c, x, 0, 82, colorB);
    }
    c.restore();
    // Яркая дуга-гребень
    c.lineCap = "round";
    c.lineJoin = "round";
    for (let k = 0; k < 3; k++) {
      c.globalAlpha = (0.05 - k * 0.012) * strength;
      c.strokeStyle = colorA;
      c.lineWidth = 26 - k * 7;
      c.beginPath();
      for (let x = -20; x <= DUEL_W + 20; x += 14) {
        const y = 128 + seed * 0.5 + Math.sin(x / 96 + t / 150 + seed) * 20 + Math.sin(x / 34 - t / 190) * 6;
        if (x === -20) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.stroke();
    }
    c.restore();
  }
  function duelBuildBackdrop() {
    const cv = document.createElement("canvas");
    cv.width = DUEL_W;
    cv.height = DUEL_H;
    const c = cv.getContext("2d");

    // ---------- НЕБО: синий час ----------
    const sky = c.createLinearGradient(0, 0, 0, 380);
    sky.addColorStop(0, "#0e2c40");
    sky.addColorStop(0.16, "#153d57");
    sky.addColorStop(0.34, "#1d5472");
    sky.addColorStop(0.5, "#2c6c8b");
    sky.addColorStop(0.66, "#5190ab");
    sky.addColorStop(0.8, "#8db9c9");
    sky.addColorStop(0.92, "#d3e0da");
    sky.addColorStop(1, "#f5e5d6");
    c.fillStyle = sky;
    c.fillRect(0, 0, DUEL_W, 380);

    // Звёзды
    for (let i = 0; i < 60; i++) {
      const sx = (i * 79.3 + 9) % DUEL_W;
      const sy = 4 + Math.pow((i * 41.7) % 170, 0.82);
      const a = 0.08 + ((i * 29) % 17) / 110;
      c.fillStyle = `rgba(230,248,255,${a})`;
      c.beginPath();
      c.arc(sx, sy, 0.45 + (i % 4) * 0.22, 0, Math.PI * 2);
      c.fill();
    }

    // Тонкие перистые полосы у горизонта
    c.save();
    for (let i = 0; i < 4; i++) {
      const y = 240 + i * 20;
      const g = c.createLinearGradient(0, y, 0, y + 7);
      g.addColorStop(0, "rgba(255,240,226,0)");
      g.addColorStop(0.5, `rgba(255,236,220,${0.14 - i * 0.024})`);
      g.addColorStop(1, "rgba(255,240,226,0)");
      c.fillStyle = g;
      c.fillRect(0, y, DUEL_W, 7);
    }
    c.restore();

    // Закатное свечение за хребтом
    const glow = c.createRadialGradient(286, 340, 6, 286, 340, 180);
    glow.addColorStop(0, "rgba(255,243,219,0.7)");
    glow.addColorStop(0.34, "rgba(255,224,203,0.3)");
    glow.addColorStop(0.7, "rgba(255,208,196,0.09)");
    glow.addColorStop(1, "rgba(255,208,196,0)");
    c.fillStyle = glow;
    c.fillRect(96, 150, 340, 210);

    // ---------- ГОРЫ ----------
    const far = [
      [-24, 356], [6, 330], [26, 338], [48, 312], [70, 328], [88, 306],
      [108, 326], [126, 316], [146, 334], [160, 300], [172, 288], [188, 318],
      [206, 312], [228, 330], [250, 318], [268, 336], [288, 304], [306, 322],
      [324, 316], [344, 334], [362, 320], [382, 334], [402, 326], [424, 344]
    ];
    duelRidgeFill(c, far, 360, "#a3c6d5", "#7aa6bb");
    duelRidgeRim(c, far, 210, 424, "#ffe9d4", 0.55, 1.6);
    duelRidgeRim(c, far, -24, 210, "#d9eef7", 0.35, 1.2);
    duelHazeBand(c, 320, 42, 0.22);

    const mid = [
      [-24, 358], [10, 340], [32, 346], [58, 324], [82, 340], [104, 330],
      [126, 348], [148, 328], [172, 342], [194, 322], [218, 340], [240, 334],
      [262, 350], [284, 330], [306, 344], [330, 332], [352, 348], [376, 336],
      [398, 350], [424, 342]
    ];
    duelRidgeFill(c, mid, 362, "#5c90a8", "#3c6b84");
    duelRidgeRim(c, mid, 180, 424, "#ffdec7", 0.5, 1.4);
    duelRidgeRim(c, mid, -24, 180, "#cfe9f5", 0.28, 1.1);
    duelHazeBand(c, 338, 34, 0.18);

    const nearL = [
      [-24, 366], [-24, 330], [0, 336], [16, 316], [34, 330], [52, 318],
      [70, 338], [92, 332], [110, 348], [132, 342], [150, 358], [168, 366]
    ];
    const nearR = [
      [424, 366], [424, 326], [400, 332], [382, 312], [362, 328], [344, 316],
      [324, 334], [302, 328], [284, 342], [262, 336], [242, 352], [226, 366]
    ];
    duelRidgeFill(c, nearL, 368, "#2b5a75", "#132f42");
    duelRidgeFill(c, nearR, 368, "#2f5f79", "#152f44");
    duelRidgeRim(c, nearL, -24, 168, "#ffe2d0", 0.3, 1.2);
    duelRidgeRim(c, nearR, 226, 424, "#ffe2d0", 0.28, 1.2);
    duelHazeBand(c, 350, 26, 0.14);

    // ---------- МОРЕ ----------
    const sea = c.createLinearGradient(0, DUEL_HORIZON, 0, DUEL_SHELF_TOP - 6);
    sea.addColorStop(0, "#3c86a4");
    sea.addColorStop(0.1, "#256c8b");
    sea.addColorStop(0.42, "#14506c");
    sea.addColorStop(0.76, "#0e3d54");
    sea.addColorStop(1, "#0c3a4f");
    c.fillStyle = sea;
    c.fillRect(0, DUEL_HORIZON, DUEL_W, DUEL_SHELF_TOP - 6 - DUEL_HORIZON);

    // Тонкая линия горизонта
    c.save();
    c.globalAlpha = 0.5;
    c.strokeStyle = "rgba(236,252,255,0.8)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, DUEL_HORIZON + 0.5);
    c.lineTo(DUEL_W, DUEL_HORIZON + 0.5);
    c.stroke();
    c.restore();
    duelHazeBand(c, 352, 44, 0.1);

    // Отражение хребта в воде
    c.save();
    c.beginPath();
    c.rect(0, DUEL_HORIZON, DUEL_W, 150);
    c.clip();
    c.translate(0, DUEL_HORIZON * 2);
    c.scale(1, -1);
    duelRidgeFill(c, mid, 362, "rgba(9,40,58,0.08)");
    c.restore();
    const reflectFade = c.createLinearGradient(0, DUEL_HORIZON, 0, DUEL_HORIZON + 130);
    reflectFade.addColorStop(0, "rgba(24,88,116,0)");
    reflectFade.addColorStop(0.35, "rgba(24,88,116,0.12)");
    reflectFade.addColorStop(1, "rgba(18,70,94,0.5)");
    c.fillStyle = reflectFade;
    c.fillRect(0, DUEL_HORIZON, DUEL_W, 130);

    // Отражение заката на воде (мягкое)
    c.save();
    c.globalCompositeOperation = "lighter";
    c.translate(290, DUEL_HORIZON);
    c.scale(1, 1.5);
    const refl = c.createRadialGradient(0, 0, 4, 0, 0, 74);
    refl.addColorStop(0, "rgba(255,226,200,0.26)");
    refl.addColorStop(0.4, "rgba(255,214,196,0.1)");
    refl.addColorStop(1, "rgba(255,214,196,0)");
    c.fillStyle = refl;
    c.beginPath();
    c.arc(0, 0, 74, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Рябь: ряды с перспективой
    c.save();
    c.lineCap = "round";
    for (let row = 0; row < 16; row++) {
      const k0 = row / 15;
      const y = DUEL_HORIZON + 4 + Math.pow(k0, 1.75) * (DUEL_SHELF_TOP - DUEL_HORIZON - 16);
      const count = 2 + Math.floor(k0 * 4);
      for (let k = 0; k < count; k++) {
        const w = 16 + k0 * 54 + ((row * 7 + k * 13) % 22);
        const x = ((row * 53 + k * 97 + 11) % (DUEL_W + 40)) - 30;
        const a = (0.3 - k0 * 0.16) * (k % 2 === 0 ? 1 : 0.6);
        c.globalAlpha = Math.max(0.03, a);
        c.strokeStyle = k % 3 === 0 ? "rgba(238,253,255,0.9)" : "rgba(200,240,255,0.6)";
        c.lineWidth = 0.7 + k0 * 0.9;
        c.beginPath();
        c.moveTo(x, y);
        c.quadraticCurveTo(x + w / 2, y - 0.8 - k0 * 1.4, x + w, y);
        c.stroke();
      }
    }
    c.restore();

    // Солнечные дорожки на воде
    c.save();
    c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 9; i++) {
      const y = DUEL_HORIZON + 7 + i * 9 + (i % 3) * 4;
      const x = 214 + Math.sin(i * 1.7) * 58 - i * 5;
      const w = 28 + i * 9;
      c.globalAlpha = 0.07 - i * 0.004;
      const g = c.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, "rgba(255,244,226,0)");
      g.addColorStop(0.5, "rgba(255,246,230,0.7)");
      g.addColorStop(1, "rgba(255,244,226,0)");
      c.fillStyle = g;
      c.fillRect(x, y, w, 1.5);
    }
    c.restore();

    // Кромка ледяного поля у горизонта
    c.save();
    c.globalAlpha = 0.34;
    const field = c.createLinearGradient(0, 362, 0, 382);
    field.addColorStop(0, "rgba(232,252,255,0.9)");
    field.addColorStop(1, "rgba(160,214,232,0)");
    c.fillStyle = field;
    c.beginPath();
    c.moveTo(0, 372);
    for (let x = 0; x <= DUEL_W; x += 16) {
      c.lineTo(x, 369 + Math.sin(x / 37) * 2 + Math.sin(x / 13) * 1.1);
    }
    c.lineTo(DUEL_W, 382);
    c.lineTo(0, 382);
    c.closePath();
    c.fill();
    c.restore();

    // Длинные линии ледяных полей
    c.save();
    c.globalAlpha = 0.08;
    c.strokeStyle = "rgba(212,244,255,0.9)";
    c.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const y = 384 + i * 24;
      c.beginPath();
      c.moveTo(-10 + (i % 3) * 30, y);
      c.lineTo(120 + (i % 4) * 60, y - 2 + (i % 2));
      c.moveTo(230 + (i % 3) * 26, y + 6);
      c.lineTo(DUEL_W + 10, y + 4);
      c.stroke();
    }
    c.restore();

    // Дальние льдины (перспектива: чем ниже, тем крупнее)
    duelFloe(c, 12, 366, 30, 5, 0.5, true);
    duelFloe(c, 120, 364, 26, 4, 0.42, true);
    duelFloe(c, 268, 366, 34, 6, 0.46, true);
    duelFloe(c, 344, 371, 36, 7, 0.4, true);
    duelFloe(c, 62, 375, 40, 7, 0.3, false);
    duelFloe(c, 190, 379, 44, 8, 0.27, false);
    duelFloe(c, 262, 391, 56, 10, 0.21, false);
    duelFloe(c, 34, 405, 66, 12, 0.17, false);
    duelFloe(c, 316, 419, 78, 14, 0.14, false);
    duelFloe(c, 158, 436, 92, 16, 0.11, false);

    // Объём волн: широкие мягкие полосы
    c.save();
    for (let i = 0; i < 5; i++) {
      const y = 430 + i * 20;
      const g = c.createLinearGradient(0, y, 0, y + 14);
      g.addColorStop(0, "rgba(6,32,46,0)");
      g.addColorStop(0.5, "rgba(6,32,46,0.07)");
      g.addColorStop(1, "rgba(6,32,46,0)");
      c.fillStyle = g;
      c.fillRect(0, y, DUEL_W, 14);
    }
    c.restore();

    // Световые полосы в толще воды
    c.save();
    c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 6; i++) {
      const y = 444 + i * 13;
      const x = i % 2 === 0 ? -20 : 190;
      const w = 150 + (i % 4) * 58;
      c.globalAlpha = 0.018 + (i % 3) * 0.006;
      const g = c.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, "rgba(190,238,255,0)");
      g.addColorStop(0.5, "rgba(200,242,255,0.6)");
      g.addColorStop(1, "rgba(190,238,255,0)");
      c.fillStyle = g;
      c.fillRect(x, y, w, 2 + (i % 2));
    }
    c.restore();

    // Трещины
    duelFloe(c, 190, 444, 66, 14, 0.13, false);
    c.save();
    c.globalAlpha = 0.22;
    c.strokeStyle = "rgba(170,232,250,0.7)";
    c.lineWidth = 1.3;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-8, 424);
    c.lineTo(30, 430);
    c.lineTo(58, 422);
    c.lineTo(92, 431);
    c.lineTo(124, 424);
    c.moveTo(274, 440);
    c.lineTo(306, 447);
    c.lineTo(336, 438);
    c.lineTo(370, 448);
    c.stroke();
    c.restore();

    // Ледяные образования (низкие, широкие)
    const berg = (x, baseY, w, h, alpha) => {
      c.save();
      c.globalAlpha = alpha;
      // Подводная часть
      c.beginPath();
      c.moveTo(x + w * 0.04, baseY);
      c.lineTo(x + w * 0.22, baseY + h * 0.5);
      c.lineTo(x + w * 0.52, baseY + h * 0.62);
      c.lineTo(x + w * 0.82, baseY + h * 0.42);
      c.lineTo(x + w * 0.96, baseY);
      c.closePath();
      c.fillStyle = "rgba(10,48,68,0.26)";
      c.fill();
      // Надводная часть
      c.beginPath();
      c.moveTo(x, baseY);
      c.lineTo(x + w * 0.07, baseY - h * 0.44);
      c.lineTo(x + w * 0.2, baseY - h * 0.68);
      c.lineTo(x + w * 0.34, baseY - h * 0.52);
      c.lineTo(x + w * 0.5, baseY - h * 0.92);
      c.lineTo(x + w * 0.63, baseY - h * 0.56);
      c.lineTo(x + w * 0.79, baseY - h * 0.7);
      c.lineTo(x + w * 0.9, baseY - h * 0.3);
      c.lineTo(x + w, baseY);
      c.closePath();
      const g = c.createLinearGradient(0, baseY - h, 0, baseY);
      g.addColorStop(0, "#eaf9ff");
      g.addColorStop(0.35, "#bfe2ef");
      g.addColorStop(0.75, "#7cb3ca");
      g.addColorStop(1, "#4d86a2");
      c.fillStyle = g;
      c.fill();
      // Светлая кромка
      c.strokeStyle = "rgba(255,255,255,0.55)";
      c.lineWidth = 1;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(x + w * 0.2, baseY - h * 0.68);
      c.lineTo(x + w * 0.34, baseY - h * 0.52);
      c.lineTo(x + w * 0.5, baseY - h * 0.92);
      c.lineTo(x + w * 0.63, baseY - h * 0.56);
      c.lineTo(x + w * 0.79, baseY - h * 0.7);
      c.stroke();
      // Тень на правой грани
      c.beginPath();
      c.moveTo(x + w * 0.5, baseY - h * 0.92);
      c.lineTo(x + w * 0.63, baseY - h * 0.56);
      c.lineTo(x + w * 0.9, baseY - h * 0.3);
      c.lineTo(x + w, baseY);
      c.lineTo(x + w * 0.62, baseY);
      c.lineTo(x + w * 0.54, baseY - h * 0.2);
      c.closePath();
      c.fillStyle = "rgba(18,72,98,0.14)";
      c.fill();
      c.restore();
    };
    berg(-26, 486, 150, 34, 0.7);
    berg(298, 496, 142, 30, 0.7);
    berg(150, 461, 54, 13, 0.32);

    // ---------- ЛЕДЯНАЯ ПОЛКА ----------
    c.beginPath();
    c.moveTo(-12, duelShelfTop(-12));
    for (let x = 0; x <= DUEL_W + 12; x += 8) c.lineTo(x, duelShelfTop(x));
    c.lineTo(DUEL_W + 12, DUEL_H);
    c.lineTo(-12, DUEL_H);
    c.closePath();
    const shelf = c.createLinearGradient(0, DUEL_SHELF_TOP - 4, 0, DUEL_H);
    shelf.addColorStop(0, "#e8f8fd");
    shelf.addColorStop(0.07, "#c9e9f5");
    shelf.addColorStop(0.2, "#93c9df");
    shelf.addColorStop(0.44, "#5c9eba");
    shelf.addColorStop(0.72, "#33748f");
    shelf.addColorStop(1, "#20506a");
    c.fillStyle = shelf;
    c.fill();

    // Тень на стыке снега и льда
    c.save();
    c.beginPath();
    c.moveTo(-12, duelShelfTop(-12));
    for (let x = 0; x <= DUEL_W + 12; x += 8) c.lineTo(x, duelShelfTop(x));
    c.lineTo(DUEL_W + 12, DUEL_SHELF_TOP + 6);
    for (let x = DUEL_W + 12; x >= -12; x -= 8) c.lineTo(x, duelShelfTop(x) + 6);
    c.closePath();
    c.fillStyle = "rgba(20,74,100,0.14)";
    c.fill();
    c.restore();

    // Грани льда в толще полки (мягкие)
    const facets = [
      [[-10, 552], [36, 542], [64, 566], [18, 584]],
      [[58, 546], [104, 540], [128, 574], [82, 592]],
      [[118, 550], [160, 544], [186, 578], [142, 596]],
      [[176, 544], [222, 540], [250, 570], [206, 594]],
      [[240, 546], [286, 542], [312, 576], [268, 598]],
      [[304, 548], [350, 542], [386, 574], [340, 598]],
      [[360, 546], [412, 542], [424, 590], [392, 600]]
    ];
    let fi = 0;
    for (const f of facets) {
      c.beginPath();
      c.moveTo(f[0][0], f[0][1]);
      for (let k = 1; k < f.length; k++) c.lineTo(f[k][0], f[k][1]);
      c.closePath();
      c.fillStyle = fi % 2 === 0 ? "rgba(255,255,255,0.035)" : "rgba(16,74,102,0.045)";
      c.fill();
      fi++;
    }

    // Снежная шапка полки: неровная кромка
    const drifts = [
      [-16, 26, 8], [34, 34, 5], [80, 26, 4], [126, 38, 6],
      [172, 28, 4], [214, 34, 6], [256, 24, 4], [298, 34, 5],
      [342, 26, 4], [388, 34, 7]
    ];
    c.save();
    c.beginPath();
    c.moveTo(-12, duelShelfTop(-12) + 30);
    c.lineTo(-12, duelShelfTop(-12));
    for (const d of drifts) {
      const [dx, dw, dh] = d;
      c.quadraticCurveTo(dx - dw * 0.2, duelShelfTop(dx) - dh, dx + dw * 0.5, duelShelfTop(dx + dw * 0.5));
    }
    c.lineTo(DUEL_W + 12, duelShelfTop(DUEL_W + 12) + 30);
    c.closePath();
    const snowCap = c.createLinearGradient(0, DUEL_SHELF_TOP - 10, 0, DUEL_SHELF_TOP + 14);
    snowCap.addColorStop(0, "rgba(255,255,255,0.96)");
    snowCap.addColorStop(0.45, "rgba(240,252,255,0.8)");
    snowCap.addColorStop(1, "rgba(218,242,252,0)");
    c.fillStyle = snowCap;
    c.fill();
    c.restore();

    // Контровой свет по кромке (тёплый, от заката)
    c.save();
    c.globalCompositeOperation = "lighter";
    c.lineCap = "round";
    const rim = c.createLinearGradient(0, 0, DUEL_W, 0);
    rim.addColorStop(0, "rgba(255,236,214,0.1)");
    rim.addColorStop(0.55, "rgba(255,246,228,0.34)");
    rim.addColorStop(1, "rgba(255,236,214,0.14)");
    c.strokeStyle = rim;
    c.lineWidth = 1.8;
    c.beginPath();
    for (let x = 0; x <= DUEL_W; x += 8) {
      const y = duelShelfTop(x) - 1;
      if (x === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
    c.restore();

    // Вертикальные прожилки в толще
    c.save();
    c.globalAlpha = 0.1;
    for (let i = 0; i < 12; i++) {
      const x = 20 + i * 32;
      c.strokeStyle = i % 2 === 0 ? "rgba(255,255,255,0.85)" : "rgba(16,64,88,0.8)";
      c.lineWidth = i % 2 === 0 ? 1.2 : 0.9;
      c.beginPath();
      c.moveTo(x, DUEL_SHELF_TOP + 14 + (i % 3) * 5);
      c.lineTo(x - 6 + (i % 5) * 3, DUEL_H);
      c.stroke();
    }
    c.restore();

    // Осколки льда на полке
    duelFloe(c, 34, 550, 46, 11, 0.32, false);
    duelFloe(c, 318, 556, 52, 12, 0.28, false);

    // Дымка над кромкой: смягчает переход воды и льда
    const lipMist = c.createLinearGradient(0, 505, 0, 545);
    lipMist.addColorStop(0, "rgba(214,242,255,0)");
    lipMist.addColorStop(0.72, "rgba(214,242,255,0.14)");
    lipMist.addColorStop(1, "rgba(214,242,255,0)");
    c.fillStyle = lipMist;
    c.fillRect(0, 505, DUEL_W, 40);

    // Световое пятно на снегу под игроком
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.1;
    const pool = c.createRadialGradient(DUEL_W / 2, 556, 8, DUEL_W / 2, 556, 120);
    pool.addColorStop(0, "rgba(255,252,240,0.8)");
    pool.addColorStop(1, "rgba(255,252,240,0)");
    c.fillStyle = pool;
    c.beginPath();
    c.ellipse(DUEL_W / 2, 556, 130, 30, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // ---------- ПЕРЕДНИЙ ПЛАН: ледяные глыбы ----------
    const chunk = (cx, baseY, w, h) => {
      c.save();
      c.beginPath();
      c.moveTo(cx - w * 0.5, baseY);
      c.lineTo(cx - w * 0.46, baseY - h * 0.42);
      c.lineTo(cx - w * 0.24, baseY - h * 0.72);
      c.lineTo(cx - w * 0.02, baseY - h * 0.6);
      c.lineTo(cx + w * 0.16, baseY - h * 0.86);
      c.lineTo(cx + w * 0.38, baseY - h * 0.5);
      c.lineTo(cx + w * 0.5, baseY - h * 0.18);
      c.lineTo(cx + w * 0.34, baseY);
      c.closePath();
      const g = c.createLinearGradient(cx - w * 0.3, baseY - h, cx + w * 0.3, baseY);
      g.addColorStop(0, "#dbedf7");
      g.addColorStop(0.3, "#b6d9e9");
      g.addColorStop(0.64, "#6ba1b9");
      g.addColorStop(1, "#3f7691");
      c.fillStyle = g;
      c.fill();
      c.beginPath();
      c.moveTo(cx - w * 0.02, baseY - h * 0.6);
      c.lineTo(cx + w * 0.16, baseY - h * 0.86);
      c.lineTo(cx + w * 0.38, baseY - h * 0.5);
      c.lineTo(cx + w * 0.1, baseY - h * 0.38);
      c.closePath();
      c.fillStyle = "rgba(255,255,255,0.24)";
      c.fill();
      c.beginPath();
      c.moveTo(cx + w * 0.38, baseY - h * 0.5);
      c.lineTo(cx + w * 0.5, baseY - h * 0.18);
      c.lineTo(cx + w * 0.34, baseY);
      c.lineTo(cx + w * 0.12, baseY - h * 0.3);
      c.closePath();
      c.fillStyle = "rgba(14,60,86,0.2)";
      c.fill();
      c.strokeStyle = "rgba(255,238,220,0.32)";
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(cx - w * 0.46, baseY - h * 0.42);
      c.lineTo(cx - w * 0.24, baseY - h * 0.72);
      c.lineTo(cx - w * 0.02, baseY - h * 0.6);
      c.lineTo(cx + w * 0.16, baseY - h * 0.86);
      c.stroke();
      c.restore();
    };
    chunk(6, 606, 150, 70);
    chunk(398, 610, 158, 74);
    chunk(96, 618, 96, 44);

    // Затемнение у нижней кромки, чтобы передний план не «светился»
    const foot = c.createLinearGradient(0, 556, 0, DUEL_H);
    foot.addColorStop(0, "rgba(10,40,58,0)");
    foot.addColorStop(1, "rgba(8,32,48,0.28)");
    c.fillStyle = foot;
    c.fillRect(0, 556, DUEL_W, DUEL_H - 556);

    // Зерно
    c.save();
    for (let i = 0; i < 1800; i++) {
      const gx = (i * 79.13 + 13) % DUEL_W;
      const gy = (i * 131.71 + 7) % DUEL_H;
      c.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.045)" : "rgba(8,34,50,0.05)";
      c.fillRect(gx, gy, 1, 1);
    }
    c.restore();
    return cv;
  }
  // --- Арены боссов 2 и 4: многослойная живопись вместо плоских заливок ---
  function duelArenaRand(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  function duelArenaMountain(c, cx, apexY, halfW, baseY, body, snow, shade) {
    const h = baseY - apexY;
    c.beginPath();
    c.moveTo(cx - halfW, baseY);
    c.lineTo(cx - halfW * 0.62, baseY - h * 0.38);
    c.lineTo(cx - halfW * 0.34, baseY - h * 0.52);
    c.lineTo(cx - halfW * 0.12, apexY + h * 0.22);
    c.lineTo(cx, apexY);
    c.lineTo(cx + halfW * 0.18, apexY + h * 0.3);
    c.lineTo(cx + halfW * 0.42, apexY + h * 0.44);
    c.lineTo(cx + halfW * 0.7, baseY - h * 0.2);
    c.lineTo(cx + halfW, baseY);
    c.closePath();
    c.fillStyle = body;
    c.fill();
    c.beginPath();
    c.moveTo(cx, apexY);
    c.lineTo(cx + halfW * 0.18, apexY + h * 0.3);
    c.lineTo(cx + halfW * 0.42, apexY + h * 0.44);
    c.lineTo(cx + halfW * 0.7, baseY - h * 0.2);
    c.lineTo(cx + halfW, baseY);
    c.lineTo(cx + halfW * 0.1, baseY);
    c.closePath();
    c.fillStyle = shade;
    c.fill();
    c.beginPath();
    c.moveTo(cx, apexY);
    c.lineTo(cx - halfW * 0.12, apexY + h * 0.22);
    c.lineTo(cx - halfW * 0.2, apexY + h * 0.3);
    c.lineTo(cx - halfW * 0.14, apexY + h * 0.28);
    c.lineTo(cx - halfW * 0.08, apexY + h * 0.36);
    c.lineTo(cx - halfW * 0.02, apexY + h * 0.3);
    c.lineTo(cx + halfW * 0.06, apexY + h * 0.38);
    c.lineTo(cx + halfW * 0.12, apexY + h * 0.3);
    c.lineTo(cx + halfW * 0.18, apexY + h * 0.3);
    c.closePath();
    c.fillStyle = snow;
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.32)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(cx - halfW * 0.62, baseY - h * 0.38);
    c.lineTo(cx - halfW * 0.12, apexY + h * 0.22);
    c.lineTo(cx, apexY);
    c.stroke();
  }
  function duelArenaCanyon(c) {
    const W = DUEL_W, H = DUEL_H;
    const rand = duelArenaRand(0x51ca11);
    c.save();

    // Закатный каньон: тёплый свет на снегу, синие тени.
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#5f9fcf");
    sky.addColorStop(0.3, "#8fc0dd");
    sky.addColorStop(0.52, "#cfdfe9");
    sky.addColorStop(0.72, "#f6dcc2");
    sky.addColorStop(0.9, "#ffe8cf");
    sky.addColorStop(1, "#fff4e4");
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);
    // Прохладная полоса за боссом: белая шерсть не сливается с небом.
    const coolBand = c.createLinearGradient(0, 76, 0, 300);
    coolBand.addColorStop(0, "rgba(38,110,150,0)");
    coolBand.addColorStop(0.45, "rgba(38,110,150,.18)");
    coolBand.addColorStop(1, "rgba(38,110,150,0)");
    c.fillStyle = coolBand;
    c.fillRect(0, 76, W, 224);

    const sun = c.createRadialGradient(270, 200, 4, 270, 200, 168);
    sun.addColorStop(0, "rgba(255,252,236,1)");
    sun.addColorStop(0.12, "rgba(255,238,198,.9)");
    sun.addColorStop(0.38, "rgba(255,202,142,.3)");
    sun.addColorStop(1, "rgba(255,186,120,0)");
    c.fillStyle = sun;
    c.fillRect(40, 20, 360, 380);
    c.fillStyle = "rgba(255,250,236,.95)";
    c.beginPath();
    c.arc(270, 200, 20, 0, Math.PI * 2);
    c.fill();

    // Дальние и средние горы — как в основном фоне.
    const far = [
      [-24, 210, 96, 358],
      [44, 168, 88, 358],
      [112, 216, 84, 358],
      [180, 152, 98, 358],
      [250, 198, 90, 358],
      [320, 164, 94, 358],
      [392, 212, 92, 358]
    ];
    for (const p of far) duelArenaMountain(c, p[0], p[1], p[2], p[3], "#789ab4", "#e2f4fc", "#6b8ca6");
    const mid = [
      [-10, 292, 104, 432],
      [66, 240, 96, 432],
      [146, 288, 98, 432],
      [228, 232, 102, 432],
      [310, 276, 96, 432],
      [390, 244, 98, 432]
    ];
    for (const p of mid) duelArenaMountain(c, p[0], p[1], p[2], p[3], "#92b3c9", "#f4fcff", "#7ea0b8");
    // Ближний хребет за водопадом: средний тон, чтобы босс не терялся.
    const nearFar = [
      [120, 296, 72, 400],
      [204, 258, 82, 400],
      [290, 292, 70, 400]
    ];
    for (const p of nearFar) duelArenaMountain(c, p[0], p[1], p[2], p[3], "#6487a4", "#dceef8", "#557a97");
    const haze = c.createLinearGradient(0, 300, 0, 440);
    haze.addColorStop(0, "rgba(240,250,255,0)");
    haze.addColorStop(0.55, "rgba(240,250,255,.28)");
    haze.addColorStop(1, "rgba(245,252,255,.6)");
    c.fillStyle = haze;
    c.fillRect(0, 300, W, 140);
    const warm = c.createLinearGradient(0, 300, 0, 450);
    warm.addColorStop(0, "rgba(255,206,150,0)");
    warm.addColorStop(0.5, "rgba(255,206,150,.04)");
    warm.addColorStop(1, "rgba(255,224,184,.08)");
    c.fillStyle = warm;
    c.fillRect(0, 300, W, 150);
    for (let i = 0; i < 5; i++) {
      const baseY = 430 + i * 34;
      const hill = c.createLinearGradient(0, baseY - 26, 0, baseY + 22);
      hill.addColorStop(0, "#f7fdff");
      hill.addColorStop(1, "#cfe6f2");
      c.fillStyle = hill;
      c.beginPath();
      c.ellipse(200 + (i % 2 ? 40 : -40), baseY, 260, 26, 0, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = 0; i < 6; i++) {
      const y = 372 + i * 26;
      c.strokeStyle = `rgba(84,152,180,${0.12 + (i % 3) * 0.05})`;
      c.lineWidth = 1.2 + (i % 2) * 0.7;
      c.beginPath();
      c.moveTo(160, y);
      c.bezierCurveTo(200, y + 7, 248, y - 5, 292, y + 3);
      c.stroke();
    }

    // Замёрзший водопад в глубине — цветовой акцент арены.
    const wfPath = () => {
      c.beginPath();
      c.moveTo(236, 252);
      c.bezierCurveTo(262, 286, 244, 330, 264, 366);
      c.bezierCurveTo(280, 396, 260, 442, 272, 486);
      c.lineTo(248, 492);
      c.bezierCurveTo(240, 448, 258, 404, 242, 372);
      c.bezierCurveTo(226, 336, 246, 292, 222, 260);
      c.closePath();
    };
    c.save();
    const wfGlow = c.createRadialGradient(252, 370, 6, 252, 380, 140);
    wfGlow.addColorStop(0, "rgba(150,226,246,.28)");
    wfGlow.addColorStop(1, "rgba(150,226,246,0)");
    c.fillStyle = wfGlow;
    c.fillRect(120, 240, 280, 300);
    wfPath();
    const wfGrad = c.createLinearGradient(222, 250, 274, 492);
    wfGrad.addColorStop(0, "#eefdff");
    wfGrad.addColorStop(0.3, "#c3ecf8");
    wfGrad.addColorStop(0.68, "#8ed0e6");
    wfGrad.addColorStop(1, "#5fb0ce");
    c.fillStyle = wfGrad;
    c.fill();
    c.save();
    wfPath();
    c.clip();
    for (let i = 0; i < 8; i++) {
      const x = 228 + i * 5.4;
      c.strokeStyle = i % 2 ? "rgba(255,255,255,.5)" : "rgba(66,150,180,.26)";
      c.lineWidth = 0.8 + rand() * 1.6;
      c.beginPath();
      c.moveTo(x, 258);
      c.bezierCurveTo(x + 12, 310, x - 6, 370, x + 12, 430);
      c.bezierCurveTo(x + 18, 460, x + 4, 478, x + 2, 492);
      c.stroke();
    }
    c.restore();
    // Снежный карниз и сосульки на гребне водопада.
    c.beginPath();
    c.moveTo(212, 262);
    c.lineTo(222, 250);
    c.lineTo(231, 256);
    c.lineTo(240, 248);
    c.lineTo(250, 257);
    c.lineTo(244, 263);
    c.lineTo(232, 260);
    c.lineTo(220, 264);
    c.closePath();
    c.fillStyle = "#ffffff";
    c.fill();
    c.strokeStyle = "rgba(178,228,242,.6)";
    c.lineWidth = 1;
    c.stroke();
    for (let i = 0; i < 6; i++) {
      const x = 222 + i * 4.6;
      const len = 7 + ((i * 9) % 15);
      c.fillStyle = "rgba(226,250,255,.9)";
      c.beginPath();
      c.moveTo(x - 2, 256);
      c.lineTo(x + 2, 256);
      c.lineTo(x + 0.3, 256 + len);
      c.closePath();
      c.fill();
    }
    // Мист и бирюзовая полынья у подножия.
    c.beginPath();
    c.ellipse(260, 536, 66, 16, 0, 0, Math.PI * 2);
    const pool = c.createLinearGradient(196, 526, 324, 552);
    pool.addColorStop(0, "#bfeef8");
    pool.addColorStop(0.45, "#7fd0e5");
    pool.addColorStop(1, "#4ca6c9");
    c.fillStyle = pool;
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.8)";
    c.lineWidth = 1.6;
    c.stroke();
    for (let i = 0; i < 3; i++) {
      c.strokeStyle = "rgba(255,255,255,.45)";
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(258, 536, 22 + i * 15, 4 + i * 3.4, 0, 0, Math.PI * 2);
      c.stroke();
    }
    const wfMist = c.createRadialGradient(262, 516, 4, 262, 516, 84);
    wfMist.addColorStop(0, "rgba(238,253,255,.4)");
    wfMist.addColorStop(1, "rgba(238,253,255,0)");
    c.fillStyle = wfMist;
    c.beginPath();
    c.ellipse(262, 516, 84, 24, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Минимальная рамка: только мягкая тень и сосульки по краям.
    c.save();
    const edgeL = c.createLinearGradient(0, 0, 54, 0);
    edgeL.addColorStop(0, "rgba(32,96,130,.28)");
    edgeL.addColorStop(1, "rgba(32,96,130,0)");
    c.fillStyle = edgeL;
    c.fillRect(0, 0, 54, H);
    const edgeR = c.createLinearGradient(W, 0, W - 54, 0);
    edgeR.addColorStop(0, "rgba(32,96,130,.28)");
    edgeR.addColorStop(1, "rgba(32,96,130,0)");
    c.fillStyle = edgeR;
    c.fillRect(W - 54, 0, 54, H);
    c.fillStyle = "rgba(232,250,255,.38)";
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(7, 0);
    c.lineTo(3, H);
    c.lineTo(0, H);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(W, 0);
    c.lineTo(W - 7, 0);
    c.lineTo(W - 3, H);
    c.lineTo(W, H);
    c.closePath();
    c.fill();
    const topIcicle = (x, len, w, a) => {
      c.fillStyle = `rgba(214,246,255,${a})`;
      c.beginPath();
      c.moveTo(x - w, 0);
      c.lineTo(x + w, 0);
      c.lineTo(x + 0.4, len);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,255,255,.5)";
      c.lineWidth = 0.7;
      c.stroke();
    };
    topIcicle(16, 26, 3, 0.7);
    topIcicle(32, 15, 2.4, 0.55);
    topIcicle(54, 9, 2, 0.4);
    topIcicle(346, 10, 2, 0.4);
    topIcicle(366, 19, 2.6, 0.55);
    topIcicle(386, 28, 3, 0.7);
    c.restore();

    // Тёмные ели у подножия — ценностный якорь и родная палитра игры.
    const canyonPine = (x, baseY, h, lean) => {
      c.save();
      c.translate(x, baseY);
      c.rotate(lean);
      c.fillStyle = "#173f53";
      c.fillRect(-1.4, -h * 0.92, 2.8, h * 0.92);
      for (let i = 0; i < 4; i++) {
        const y = -h * (0.18 + i * 0.19);
        const half = h * (0.32 - i * 0.055);
        c.beginPath();
        c.moveTo(0, y - h * 0.17);
        c.lineTo(-half, y + h * 0.05);
        c.lineTo(-half * 0.45, y + h * 0.02);
        c.lineTo(0, y + h * 0.07);
        c.lineTo(half * 0.45, y + h * 0.02);
        c.lineTo(half, y + h * 0.05);
        c.closePath();
        c.fill();
        c.strokeStyle = "rgba(220,244,252,.6)";
        c.lineWidth = 1.1;
        c.beginPath();
        c.moveTo(-half, y + h * 0.04);
        c.lineTo(-half * 0.35, y + h * 0.015);
        c.stroke();
        c.beginPath();
        c.moveTo(half, y + h * 0.04);
        c.lineTo(half * 0.35, y + h * 0.015);
        c.stroke();
      }
      c.strokeStyle = "rgba(120,180,200,.26)";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-1.4, -h * 0.9);
      c.lineTo(-1.4, -h * 0.1);
      c.stroke();
      c.restore();
    };
    const treeRow = [
      [20, 112, 0.02], [54, 84, -0.03], [88, 126, 0.01], [122, 72, 0.04],
      [156, 102, -0.02], [308, 96, 0.03], [342, 118, -0.02], [376, 86, 0.01]
    ];
    for (const t of treeRow) canyonPine(t[0], 542, t[1], t[2]);

    // Снежная полка, на которой стоит Моряка.
    const floorTop = (x) => 535 + Math.sin(x * 0.047) * 2.4 + Math.sin(x * 0.15 + 1.2) * 1.2;
    c.beginPath();
    c.moveTo(0, H);
    c.lineTo(0, floorTop(0));
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x));
    c.lineTo(W, H);
    c.closePath();
    const fg = c.createLinearGradient(0, 526, 0, H);
    fg.addColorStop(0, "#fffaf0");
    fg.addColorStop(0.2, "#f2e3cf");
    fg.addColorStop(0.58, "#a8c5d6");
    fg.addColorStop(1, "#5f8ca6");
    c.fillStyle = fg;
    c.fill();

    c.save();
    c.lineCap = "round";
    c.strokeStyle = "rgba(255,248,232,.98)";
    c.lineWidth = 3.6;
    c.beginPath();
    c.moveTo(0, floorTop(0));
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x));
    c.stroke();
    c.strokeStyle = "rgba(102,186,210,.34)";
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(0, floorTop(0) + 4);
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x) + 4);
    c.stroke();
    c.strokeStyle = "rgba(55,120,146,.22)";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, floorTop(0) + 9);
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x) + 9);
    c.stroke();
    c.restore();

    for (let i = 0; i < 10; i++) {
      const x0 = 20 + rand() * 360;
      const y0 = 552 + rand() * 16;
      c.strokeStyle = "rgba(64,126,150,.22)";
      c.lineWidth = 1 + rand() * 1.2;
      c.beginPath();
      c.moveTo(x0, y0);
      let x = x0, y = y0;
      for (let k = 0; k < 3; k++) {
        x += (rand() - 0.5) * 20;
        y += 9 + rand() * 13;
        c.lineTo(x, y);
      }
      c.stroke();
    }
    for (let i = 0; i < 26; i++) {
      const x = 10 + rand() * 380;
      const y = floorTop(x) - 1 + rand() * 4;
      c.fillStyle = `rgba(255,255,255,${0.3 + rand() * 0.5})`;
      c.beginPath();
      c.ellipse(x, y, 2 + rand() * 8, 1 + rand() * 2.4, 0, 0, Math.PI * 2);
      c.fill();
    }

    // Снежные валуны в переднем плане.
    const snowRock = (x, y, rx, ry, flip) => {
      c.save();
      c.beginPath();
      c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      const rg = c.createLinearGradient(x - rx, y - ry, x + rx, y + ry);
      rg.addColorStop(0, "#f4fdff");
      rg.addColorStop(0.5, "#cbe8f3");
      rg.addColorStop(1, "#77aec6");
      c.fillStyle = rg;
      c.fill();
      c.strokeStyle = "rgba(255,255,255,.7)";
      c.lineWidth = 1.2;
      c.stroke();
      c.beginPath();
      c.ellipse(x - flip * rx * 0.2, y - ry * 0.45, rx * 0.72, ry * 0.5, 0, Math.PI, Math.PI * 2);
      c.fillStyle = "rgba(255,255,255,.9)";
      c.fill();
      c.restore();
    };
    snowRock(22, 564, 30, 20, 1);
    snowRock(374, 570, 34, 22, -1);
    snowRock(62, 588, 20, 13, 1);

    // Холодная дымка и мягкая виньетка.
    for (let i = 0; i < 6; i++) {
      const mx = 30 + rand() * 340;
      const my = 340 + rand() * 190;
      const mr = 60 + rand() * 90;
      const mg = c.createRadialGradient(mx, my, 4, mx, my, mr);
      mg.addColorStop(0, "rgba(240,253,255,.22)");
      mg.addColorStop(1, "rgba(240,253,255,0)");
      c.fillStyle = mg;
      c.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
    }

    c.save();
    const edge = c.createRadialGradient(200, 300, 150, 200, 300, 400);
    edge.addColorStop(0, "rgba(28,86,120,0)");
    edge.addColorStop(0.7, "rgba(28,86,120,.05)");
    edge.addColorStop(1, "rgba(28,86,120,.2)");
    c.fillStyle = edge;
    c.fillRect(0, 0, W, H);
    const bottom = c.createLinearGradient(0, 500, 0, H);
    bottom.addColorStop(0, "rgba(30,90,120,0)");
    bottom.addColorStop(1, "rgba(30,90,120,.14)");
    c.fillStyle = bottom;
    c.fillRect(0, 500, W, H - 500);
    c.restore();

    for (let i = 0; i < 1000; i++) {
      c.fillStyle = "rgba(255,255,255,.05)";
      c.fillRect((i * 97.13 + 11) % W, (i * 57.71 + 5) % H, 1, 1);
      c.fillStyle = "rgba(40,96,124,.035)";
      c.fillRect((i * 61.7 + 23) % W, (i * 89.3 + 17) % H, 1, 1);
    }

    c.restore();
  }
  function duelArenaAvalanche(c) {
    const W = DUEL_W, H = DUEL_H;
    const rand = duelArenaRand(0xbadc0de);
    c.save();

    // 1. Ночная буря.
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#050f1d");
    sky.addColorStop(0.24, "#0a2237");
    sky.addColorStop(0.5, "#10354e");
    sky.addColorStop(0.74, "#174a63");
    sky.addColorStop(1, "#1f5d75");
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);

    // Луна ниже HUD, чтобы её было видно.
    const moonX = 72, moonY = 168;
    const halo = c.createRadialGradient(moonX, moonY, 4, moonX, moonY, 96);
    halo.addColorStop(0, "rgba(226,248,255,.85)");
    halo.addColorStop(0.16, "rgba(200,238,255,.4)");
    halo.addColorStop(0.55, "rgba(150,205,230,.12)");
    halo.addColorStop(1, "rgba(140,196,226,0)");
    c.fillStyle = halo;
    c.fillRect(moonX - 96, moonY - 96, 192, 192);
    c.fillStyle = "rgba(238,251,255,.9)";
    c.beginPath();
    c.arc(moonX, moonY, 11, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(158,198,220,.32)";
    c.beginPath();
    c.arc(moonX - 3.5, moonY - 2, 3, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(moonX + 4, moonY + 4, 2, 0, Math.PI * 2);
    c.fill();

    // 2. Тучи.
    for (let i = 0; i < 12; i++) {
      const x = -24 + rand() * 448;
      const y = 28 + rand() * 170;
      const rx = 56 + rand() * 86;
      const ry = 14 + rand() * 26;
      const cg = c.createRadialGradient(x, y - ry * 0.3, 2, x, y, rx);
      cg.addColorStop(0, `rgba(94,136,162,${0.12 + rand() * 0.14})`);
      cg.addColorStop(0.55, "rgba(20,48,70,.34)");
      cg.addColorStop(1, "rgba(10,30,48,0)");
      c.fillStyle = cg;
      c.beginPath();
      c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = 0; i < 8; i++) {
      const x = 10 + rand() * 380;
      const y = 52 + rand() * 150;
      const rx = 42 + rand() * 60;
      c.strokeStyle = `rgba(178,220,240,${0.08 + rand() * 0.1})`;
      c.lineWidth = 1.2 + rand() * 1.6;
      c.beginPath();
      c.ellipse(x, y, rx, 10 + rand() * 10, 0, Math.PI * 1.05, Math.PI * 1.9);
      c.stroke();
    }

    // 3. Горные хребты — мягкие планы с дымкой.
    const far = [
      [-10, 240, 124, 382],
      [78, 198, 114, 382],
      [168, 252, 114, 382],
      [256, 190, 122, 382],
      [348, 236, 112, 382]
    ];
    for (const p of far) duelArenaMountain(c, p[0], p[1], p[2], p[3], "#2c5b74", "#a9d1e2", "#234a61");
    const mid = [
      [0, 320, 126, 432],
      [112, 266, 118, 432],
      [224, 328, 122, 432],
      [338, 276, 118, 432]
    ];
    for (const p of mid) duelArenaMountain(c, p[0], p[1], p[2], p[3], "#1d465e", "#c3e4f0", "#173a50");
    const haze = c.createLinearGradient(0, 300, 0, 450);
    haze.addColorStop(0, "rgba(8,28,44,0)");
    haze.addColorStop(0.55, "rgba(8,28,44,.34)");
    haze.addColorStop(1, "rgba(8,28,44,.62)");
    c.fillStyle = haze;
    c.fillRect(0, 300, W, 150);
    const midBand = c.createLinearGradient(0, 380, 0, 536);
    midBand.addColorStop(0, "rgba(10,34,50,.3)");
    midBand.addColorStop(1, "rgba(8,26,40,.92)");
    c.fillStyle = midBand;
    c.fillRect(0, 380, W, 156);

    // 4. Лавинная волна: нависающий гребень и крупные клубы.
    c.save();
    c.translate(132, 0);
    const plumeEdge = () => {
      c.beginPath();
      c.moveTo(W + 8, 48);
      c.bezierCurveTo(352, 56, 318, 88, 326, 124);
      c.bezierCurveTo(300, 138, 286, 170, 296, 200);
      c.bezierCurveTo(266, 220, 254, 258, 268, 288);
      c.bezierCurveTo(240, 310, 236, 352, 254, 382);
      c.bezierCurveTo(240, 408, 238, 446, 258, 474);
      c.bezierCurveTo(270, 500, 266, 530, 284, 556);
      c.lineTo(300, 610);
    };
    const plumeFill = () => {
      plumeEdge();
      c.lineTo(W + 8, H + 8);
      c.closePath();
    };
    plumeFill();
    const plumeGrad = c.createLinearGradient(300, 40, 392, 560);
    plumeGrad.addColorStop(0, "#ffffff");
    plumeGrad.addColorStop(0.22, "#f2fbff");
    plumeGrad.addColorStop(0.48, "#d3ebf6");
    plumeGrad.addColorStop(0.74, "#a8c9da");
    plumeGrad.addColorStop(1, "#7da4ba");
    c.fillStyle = plumeGrad;
    c.fill();

    const edgePts = [
      [400, 48], [352, 56], [318, 88], [326, 124], [300, 138], [286, 170],
      [296, 200], [266, 220], [254, 258], [268, 288], [240, 310], [236, 352],
      [254, 382], [240, 408], [238, 446], [258, 474], [270, 500], [266, 530],
      [284, 556], [300, 610]
    ];
    c.save();
    plumeFill();
    c.clip();
    // Глубокие холодные впадины.
    for (let i = 0; i < 30; i++) {
      const p = edgePts[Math.floor((i / 30) * (edgePts.length - 1))];
      const x = Math.min(W - 4, p[0] + 26 + rand() * 58);
      const y = p[1] + (rand() - 0.5) * 40;
      const r = 28 + rand() * 44;
      const sg = c.createRadialGradient(x, y, 2, x, y, r);
      sg.addColorStop(0, "rgba(80,126,150,.58)");
      sg.addColorStop(0.55, "rgba(105,150,172,.26)");
      sg.addColorStop(1, "rgba(112,156,178,0)");
      c.fillStyle = sg;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
    // Большая внутренняя тень — объём.
    const cav = c.createRadialGradient(348, 330, 8, 348, 330, 110);
    cav.addColorStop(0, "rgba(80,124,148,.44)");
    cav.addColorStop(1, "rgba(86,130,154,0)");
    c.fillStyle = cav;
    c.fillRect(230, 210, 180, 250);
    // Светлые клубы.
    for (let i = 0; i < 40; i++) {
      const p = edgePts[Math.floor((i / 40) * (edgePts.length - 1))];
      const x = Math.min(W + 4, p[0] + 4 + rand() * 52);
      const y = p[1] + (rand() - 0.5) * 34;
      const r = 22 + rand() * 40;
      const hg = c.createRadialGradient(x - r * 0.24, y - r * 0.28, 1, x, y, r);
      hg.addColorStop(0, "rgba(255,255,255,.95)");
      hg.addColorStop(0.45, "rgba(248,253,255,.5)");
      hg.addColorStop(1, "rgba(235,250,255,0)");
      c.fillStyle = hg;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
    // Потоки движения внутри.
    for (let i = 0; i < 12; i++) {
      const y = 78 + i * 42 + rand() * 16;
      c.strokeStyle = i % 2 ? "rgba(255,255,255,.26)" : "rgba(88,134,158,.26)";
      c.lineWidth = 1 + rand() * 2.4;
      c.beginPath();
      c.moveTo(268 + rand() * 16, y);
      c.bezierCurveTo(306, y + 16, 334, y + 36, 378, y + 50);
      c.stroke();
    }
    c.restore();

    // Светлая кромка гребня.
    c.save();
    plumeEdge();
    c.strokeStyle = "rgba(255,255,255,.6)";
    c.lineWidth = 2.4;
    c.shadowColor = "rgba(222,246,255,.95)";
    c.shadowBlur = 14;
    c.stroke();
    c.restore();

    // Нависающие клубы пыли: ломают вертикальную стену, дают объём.
    const puff = (x, y, r, a) => {
      const pg = c.createRadialGradient(x - r * 0.22, y - r * 0.26, 1, x, y, r);
      pg.addColorStop(0, `rgba(255,255,255,${a})`);
      pg.addColorStop(0.5, `rgba(245,252,255,${a * 0.62})`);
      pg.addColorStop(1, "rgba(230,248,255,0)");
      c.fillStyle = pg;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    };
    puff(318, 152, 52, 0.8);
    puff(296, 214, 44, 0.65);
    puff(286, 302, 48, 0.7);
    puff(272, 388, 42, 0.62);
    puff(276, 470, 46, 0.66);
    puff(290, 540, 50, 0.7);
    for (let i = 0; i < 60; i++) {
      const a = rand() * Math.PI * 2;
      const rr = 20 + rand() * 60;
      const px = 286 + Math.cos(a) * rr;
      const py = 300 + Math.sin(a) * rr * 2.2;
      if (px > 330) continue;
      c.globalAlpha = 0.12 + rand() * 0.4;
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(px, py, 0.6 + rand() * 1.5, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;

    // Снежная пыль, летящая влево от кромки.
    for (let i = 0; i < 170; i++) {
      const p = edgePts[Math.floor(rand() * edgePts.length)];
      const sx = p[0] - 46 + rand() * 74;
      const sy = p[1] + (rand() - 0.5) * 36;
      c.globalAlpha = 0.1 + rand() * 0.45;
      c.fillStyle = i % 4 ? "#ffffff" : "#d8f2ff";
      c.beginPath();
      c.arc(sx, sy, 0.6 + rand() * 1.7, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    for (let i = 0; i < 14; i++) {
      const p = edgePts[Math.floor(rand() * edgePts.length)];
      const y = p[1] + (rand() - 0.5) * 26;
      const x = p[0] - 10 - rand() * 40;
      c.strokeStyle = `rgba(230,248,255,${0.08 + rand() * 0.14})`;
      c.lineWidth = 1 + rand() * 1.8;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x - 14 - rand() * 22, y + 3 + rand() * 8);
      c.stroke();
    }


    c.restore();

    // 5. Берег, ели и снежная полка.
    const pine = (x, baseY, h, lean) => {
      c.save();
      c.translate(x, baseY);
      c.rotate(lean);
      c.fillStyle = "#071b28";
      c.fillRect(-1.5, -h * 0.92, 3, h * 0.92);
      for (let i = 0; i < 4; i++) {
        const y = -h * (0.16 + i * 0.19);
        const half = h * (0.34 - i * 0.06);
        c.beginPath();
        c.moveTo(0, y - h * 0.17);
        c.lineTo(-half, y + h * 0.05);
        c.lineTo(-half * 0.45, y + h * 0.02);
        c.lineTo(0, y + h * 0.07);
        c.lineTo(half * 0.45, y + h * 0.02);
        c.lineTo(half, y + h * 0.05);
        c.closePath();
        c.fill();
        c.strokeStyle = "rgba(196,230,242,.5)";
        c.lineWidth = 1.1;
        c.beginPath();
        c.moveTo(-half, y + h * 0.045);
        c.lineTo(-half * 0.35, y + h * 0.02);
        c.stroke();
      }
      c.strokeStyle = "rgba(210,240,250,.2)";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-1.5, -h * 0.9);
      c.lineTo(-1.5, -h * 0.1);
      c.stroke();
      c.restore();
    };
    pine(34, 536, 128, -0.04);
    pine(66, 548, 96, 0.05);
    pine(96, 540, 74, -0.02);

    const floorTop = (x) => 536 + Math.sin(x * 0.05) * 2.6 + Math.sin(x * 0.17 + 0.8) * 1.3;
    c.beginPath();
    c.moveTo(0, H);
    c.lineTo(0, floorTop(0));
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x));
    c.lineTo(W, H);
    c.closePath();
    const fg = c.createLinearGradient(0, 526, 0, H);
    fg.addColorStop(0, "#f8feff");
    fg.addColorStop(0.16, "#e2f4fb");
    fg.addColorStop(0.55, "#b6d6e4");
    fg.addColorStop(1, "#739cb0");
    c.fillStyle = fg;
    c.fill();

    c.save();
    c.lineCap = "round";
    c.strokeStyle = "rgba(255,255,255,.95)";
    c.lineWidth = 3.6;
    c.beginPath();
    c.moveTo(0, floorTop(0));
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x));
    c.stroke();
    c.strokeStyle = "rgba(44,100,128,.28)";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, floorTop(0) + 4);
    for (let x = 4; x <= W; x += 4) c.lineTo(x, floorTop(x) + 4);
    c.stroke();
    c.restore();

    for (let i = 0; i < 9; i++) {
      const y = 548 + rand() * 34;
      const x = 20 + rand() * 340;
      const w = 34 + rand() * 90;
      c.strokeStyle = `rgba(226,246,253,${0.12 + rand() * 0.2})`;
      c.lineWidth = 1 + rand() * 2;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + w, y + (rand() - 0.5) * 6);
      c.stroke();
    }
    for (let i = 0; i < 34; i++) {
      const x = 8 + rand() * 384;
      const y = floorTop(x) - 1 + rand() * 4;
      c.fillStyle = `rgba(255,255,255,${0.2 + rand() * 0.6})`;
      c.beginPath();
      c.ellipse(x, y, 2 + rand() * 8, 1 + rand() * 2.6, 0, 0, Math.PI * 2);
      c.fill();
    }

    // Снежный язык лавины на полке.
    c.beginPath();
    c.moveTo(258, 600);
    c.bezierCurveTo(268, 566, 304, 548, 340, 552);
    c.bezierCurveTo(370, 556, 388, 576, 400, 600);
    c.closePath();
    const spill = c.createLinearGradient(300, 548, 340, 600);
    spill.addColorStop(0, "#ffffff");
    spill.addColorStop(0.5, "#e6f7fd");
    spill.addColorStop(1, "#b9dbe9");
    c.fillStyle = spill;
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.6)";
    c.lineWidth = 1.2;
    c.stroke();

    // Тёмные передние камни.
    const cornerRock = (side) => {
      const pts = side < 0
        ? [[0, 600], [0, 540], [10, 528], [24, 536], [36, 556], [56, 564], [64, 584], [72, 600]]
        : [[400, 600], [400, 536], [390, 524], [376, 534], [364, 554], [344, 562], [336, 582], [328, 600]];
      c.beginPath();
      c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
      c.closePath();
      const rg = c.createLinearGradient(side < 0 ? 0 : W, 520, side < 0 ? 74 : W - 74, 600);
      rg.addColorStop(0, "#081f2e");
      rg.addColorStop(0.55, "#123548");
      rg.addColorStop(1, "#1d4a60");
      c.fillStyle = rg;
      c.fill();
      c.strokeStyle = "rgba(220,245,255,.4)";
      c.lineWidth = 1.4;
      c.stroke();
      c.fillStyle = "rgba(240,253,255,.8)";
      c.beginPath();
      c.ellipse(side < 0 ? 16 : 384, 532, 10, 2.6, 0, 0, Math.PI * 2);
      c.fill();
    };
    cornerRock(-1);
    cornerRock(1);

    // 6. Позёмка, штрихи бури, лунный свет.
    for (let i = 0; i < 8; i++) {
      const y = 420 + rand() * 100;
      const x = 20 + rand() * 320;
      const w = 40 + rand() * 90;
      const wg = c.createLinearGradient(x - w, y, x + w, y);
      wg.addColorStop(0, "rgba(220,242,252,0)");
      wg.addColorStop(0.5, `rgba(220,242,252,${0.08 + rand() * 0.07})`);
      wg.addColorStop(1, "rgba(220,242,252,0)");
      c.fillStyle = wg;
      c.beginPath();
      c.ellipse(x, y, w, 2 + rand() * 3, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.strokeStyle = "rgba(212,240,252,.1)";
    c.lineWidth = 1;
    for (let i = 0; i < 52; i++) {
      const sx = (i * 57.3 + 11) % W;
      const sy = (i * 97.1) % H;
      c.beginPath();
      c.moveTo(sx, sy);
      c.lineTo(sx - 12, sy + 24);
      c.stroke();
    }
    c.save();
    c.globalCompositeOperation = "lighter";
    const moonBeam = c.createLinearGradient(moonX, moonY, 170, 560);
    moonBeam.addColorStop(0, "rgba(200,238,255,.14)");
    moonBeam.addColorStop(0.55, "rgba(170,220,245,.04)");
    moonBeam.addColorStop(1, "rgba(150,205,235,0)");
    c.fillStyle = moonBeam;
    c.beginPath();
    c.moveTo(moonX - 26, moonY);
    c.lineTo(moonX + 26, moonY);
    c.lineTo(300, 600);
    c.lineTo(170, 600);
    c.closePath();
    c.fill();
    c.restore();

    // 7. Виньетка и зерно.
    c.save();
    const vig = c.createRadialGradient(200, 300, 120, 200, 300, 430);
    vig.addColorStop(0, "rgba(2,10,20,0)");
    vig.addColorStop(0.62, "rgba(2,10,20,.12)");
    vig.addColorStop(1, "rgba(2,10,20,.5)");
    c.fillStyle = vig;
    c.fillRect(0, 0, W, H);
    const bottom = c.createLinearGradient(0, 500, 0, H);
    bottom.addColorStop(0, "rgba(2,12,22,0)");
    bottom.addColorStop(1, "rgba(2,12,22,.3)");
    c.fillStyle = bottom;
    c.fillRect(0, 500, W, H - 500);
    c.restore();

    for (let i = 0; i < 1200; i++) {
      c.fillStyle = "rgba(255,255,255,.04)";
      c.fillRect((i * 89.31 + 7) % W, (i * 53.17 + 19) % H, 1, 1);
      c.fillStyle = "rgba(2,14,26,.06)";
      c.fillRect((i * 67.9 + 29) % W, (i * 101.3 + 3) % H, 1, 1);
    }

    c.restore();
  }

  var duelBackdropCache = {};
  function duelBackdropFor(arena) {
    const key = arena || "shore";
    if (duelBackdropCache[key]) return duelBackdropCache[key];
    if (!duelBackdropCanvas) duelBackdropCanvas = duelBuildBackdrop();
    const cv = document.createElement("canvas");
    cv.width = DUEL_W;
    cv.height = DUEL_H;
    const c = cv.getContext("2d");
    c.drawImage(duelBackdropCanvas, 0, 0);
    if (key === "canyon") {
      duelArenaCanyon(c);
    } else if (key === "storm") {
      c.save();
      c.fillStyle = "rgba(8,22,48,0.46)";
      c.fillRect(0, 0, DUEL_W, DUEL_H);
      const stormSky = c.createLinearGradient(0, 0, 0, 340);
      stormSky.addColorStop(0, "rgba(6,16,38,0.92)");
      stormSky.addColorStop(0.55, "rgba(12,34,64,0.55)");
      stormSky.addColorStop(1, "rgba(12,34,64,0)");
      c.fillStyle = stormSky;
      c.fillRect(0, 0, DUEL_W, 340);
      // Клубящиеся тучи
      for (let i = 0; i < 5; i++) {
        const cx2 = 30 + i * 92;
        const cy2 = 52 + (i % 2) * 26;
        const cg = c.createRadialGradient(cx2, cy2, 4, cx2, cy2, 74);
        cg.addColorStop(0, "rgba(40,70,110,0.55)");
        cg.addColorStop(1, "rgba(16,36,64,0)");
        c.fillStyle = cg;
        c.beginPath();
        c.ellipse(cx2, cy2, 88, 42, 0, 0, Math.PI * 2);
        c.fill();
      }
      // Молнии
      const bolt = (x0, y0, len, seed) => {
        c.save();
        c.strokeStyle = "rgba(198,240,255,0.85)";
        c.lineWidth = 1.6;
        c.shadowColor = "rgba(150,220,255,0.9)";
        c.shadowBlur = 10;
        c.beginPath();
        let x = x0;
        let y = y0;
        c.moveTo(x, y);
        for (let i = 1; i <= 7; i++) {
          x += Math.sin(seed + i * 2.1) * 9;
          y += len / 7;
          c.lineTo(x, y);
        }
        c.stroke();
        c.restore();
      };
      bolt(46, 40, 190, 1.3);
      bolt(352, 24, 140, 4.7);
      // Наклонные полосы снега
      c.save();
      c.strokeStyle = "rgba(220,244,255,0.16)";
      c.lineWidth = 1;
      for (let i = 0; i < 60; i++) {
        const sx = (i * 67.3 + 11) % DUEL_W;
        const sy = (i * 113.7) % DUEL_H;
        c.beginPath();
        c.moveTo(sx, sy);
        c.lineTo(sx - 7, sy + 18);
        c.stroke();
      }
      c.restore();
      c.restore();
    } else if (key === "avalanche") {
      duelArenaAvalanche(c);
    } else if (key === "abyss") {
      c.save();
      // Глубина: от светлой воды вверху к чёрной бездне внизу.
      const depth = c.createLinearGradient(0, 0, 0, DUEL_H);
      depth.addColorStop(0, "rgba(10,54,78,0.9)");
      depth.addColorStop(0.25, "rgba(8,40,64,0.92)");
      depth.addColorStop(0.6, "rgba(5,24,44,0.96)");
      depth.addColorStop(1, "rgba(2,10,22,0.98)");
      c.fillStyle = depth;
      c.fillRect(0, 0, DUEL_W, DUEL_H);
      // Лучи света сверху.
      c.save();
      c.globalCompositeOperation = "lighter";
      for (let i = 0; i < 5; i++) {
        const x = 40 + i * 78;
        const g = c.createLinearGradient(x, 0, x + 30, 400);
        g.addColorStop(0, "rgba(150,230,255,0.16)");
        g.addColorStop(1, "rgba(150,230,255,0)");
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(x - 16, 0);
        c.lineTo(x + 16, 0);
        c.lineTo(x + 52, 400);
        c.lineTo(x + 12, 400);
        c.closePath();
        c.fill();
      }
      c.restore();
      // Дальнее свечение глубин.
      const glow = c.createRadialGradient(200, 420, 20, 200, 420, 220);
      glow.addColorStop(0, "rgba(60,220,230,0.12)");
      glow.addColorStop(1, "rgba(60,220,230,0)");
      c.fillStyle = glow;
      c.beginPath();
      c.ellipse(200, 420, 220, 150, 0, 0, Math.PI * 2);
      c.fill();
      // Силуэты скал и водорослей.
      c.fillStyle = "rgba(3,16,30,0.8)";
      for (const p of [[0, 520, 60, 120], [400, 540, 70, 140], [60, 300, 14, 120], [340, 260, 12, 140]]) {
        c.beginPath();
        c.ellipse(p[0], p[1], p[2], p[3], 0, 0, Math.PI * 2);
        c.fill();
      }
      // Пузыри.
      c.fillStyle = "rgba(200,245,255,0.35)";
      for (let i = 0; i < 40; i++) {
        const x = (i * 71.3 + 9) % DUEL_W;
        const y = (i * 127.9) % DUEL_H;
        c.beginPath();
        c.arc(x, y, 1 + (i % 4) * 0.7, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }
    duelBackdropCache[key] = cv;
    return cv;
  }
  function duelDrawBackdrop(c) {
    c.drawImage(duelBackdropFor(duelState.arena), 0, 0);
    const t = duelState.frame;

    // Каньон и лавина — дневные арены: аврора им не идёт.
    if (duelState.arena !== "canyon" && duelState.arena !== "avalanche") {
      duelAuroraCloud(c, t, 0, "#6ff0c4", "#9de8ff", 1.25);
      duelAuroraCloud(c, t, 42, "#9d9bff", "#b6eaff", 0.85);
    }

    const tint = DUEL_PHASE_TINTS[duelState.level] || DUEL_PHASE_TINTS[0];
    if (tint !== DUEL_PHASE_TINTS[0]) {
      c.fillStyle = tint;
      c.fillRect(0, 0, DUEL_W, DUEL_H);
    }

    // Мягкий свет за боссом (на светлых аренах он только «съедает» силуэт).
    if (duelState.arena !== "canyon" && duelState.arena !== "avalanche") {
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.07 + 0.025 * Math.sin(t / 80);
      const spot = c.createRadialGradient(DUEL_W / 2, 200, 30, DUEL_W / 2, 200, 170);
      spot.addColorStop(0, "rgba(198,240,255,0.55)");
      spot.addColorStop(1, "rgba(198,240,255,0)");
      c.fillStyle = spot;
      c.fillRect(0, 30, DUEL_W, 360);
      c.restore();
    }

    // Живая атмосфера арен: свет в каньоне и позёмка у лавины.
    if (duelState.arena === "canyon") {
      c.save();
      c.globalCompositeOperation = "lighter";
      const pulse = 0.035 + 0.02 * Math.sin(t / 120) + 0.01 * Math.sin(t / 31);
      const shaft = c.createLinearGradient(300, 70, 170, 560);
      shaft.addColorStop(0, `rgba(255,246,214,${pulse * 2.2})`);
      shaft.addColorStop(0.55, `rgba(255,242,210,${pulse})`);
      shaft.addColorStop(1, "rgba(240,252,255,0)");
      c.fillStyle = shaft;
      c.beginPath();
      c.moveTo(278, 58);
      c.lineTo(318, 58);
      c.lineTo(258, 560);
      c.lineTo(104, 560);
      c.closePath();
      c.fill();
      for (let i = 0; i < 12; i++) {
        const p = (i * 0.081 + t * 0.00003) % 1;
        const px = 292 - p * 150 + Math.sin(i * 2.3 + t / 140) * 18;
        const py = 70 + p * 460;
        c.globalAlpha = 0.08 + 0.08 * Math.sin(t / 55 + i * 1.7);
        c.fillStyle = "#fff6dc";
        c.beginPath();
        c.arc(px, py, 0.7 + (i % 3) * 0.5, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    } else if (duelState.arena === "avalanche") {
      c.save();
      for (let i = 0; i < 6; i++) {
        const px = 288 + Math.sin(t / 150 + i * 1.7) * 16 + (i % 2) * 20;
        const py = 140 + i * 72 + Math.cos(t / 180 + i) * 12;
        const pr = 26 + (i % 3) * 12;
        const pg = c.createRadialGradient(px, py, 2, px, py, pr);
        pg.addColorStop(0, "rgba(235,250,255,.12)");
        pg.addColorStop(1, "rgba(235,250,255,0)");
        c.fillStyle = pg;
        c.beginPath();
        c.arc(px, py, pr, 0, Math.PI * 2);
        c.fill();
      }
      c.strokeStyle = "rgba(214,240,252,.16)";
      c.lineWidth = 1;
      for (let i = 0; i < 26; i++) {
        const sx = (i * 43.7 + t * (3.2 + (i % 3))) % (DUEL_W + 60) - 30;
        const sy = (i * 71.3) % DUEL_H;
        c.beginPath();
        c.moveTo(sx, sy);
        c.lineTo(sx - 16, sy + 30);
        c.stroke();
      }
      c.restore();
    }

    // Снегопад
    c.save();
    for (const f of DUEL_SNOWFLAKES) {
      const y = (f.y + t * f.speed) % (DUEL_H + 30) - 15;
      const x = (f.x + Math.sin(t / 90 + f.phase) * (5 + f.depth * 7) + t * f.drift * 0.4) % (DUEL_W + 24) - 12;
      if (f.depth === 2) {
        c.globalAlpha = 0.1 + 0.07 * Math.sin(f.phase + t / 50);
        duelDrawGlow(c, x, y, f.r * 4.4, "#ffffff");
      } else {
        c.globalAlpha = (f.depth === 0 ? 0.22 : 0.34) + 0.14 * Math.sin(f.phase + t / 60);
        c.fillStyle = "#ffffff";
        c.beginPath();
        c.arc(x, y, f.r, 0, Math.PI * 2);
        c.fill();
      }
    }
    c.restore();

    // Позёмка у полки
    c.save();
    c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 2; i++) {
      const my = DUEL_SHELF_TOP - 4 + i * 16;
      const mx = DUEL_W / 2 + Math.sin(t / 150 + i * 2) * 46;
      const mg = c.createRadialGradient(mx, my, 6, mx, my, 156);
      mg.addColorStop(0, `rgba(226,250,255,${0.05 - i * 0.015})`);
      mg.addColorStop(1, "rgba(226,250,255,0)");
      c.fillStyle = mg;
      c.beginPath();
      c.ellipse(mx, my, 176, 12 + i * 3, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();

    // Блики на льду
    c.save();
    for (const s of DUEL_ARENA_SPARKLES) {
      const k = Math.abs(Math.sin(s.phase + t / (54 / s.speed)));
      if (k < 0.62) continue;
      const a = (k - 0.62) / 0.38;
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = a * 0.6;
      duelDrawGlow(c, s.x, s.y, s.r * 4.6, "#ffffff");
      c.globalAlpha = a * 0.85;
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
  function duelDraw(c) {
    if (!duelState.active) return;
    duelDrawBackdrop(c);
    duelDrawBossBody(c);
    // Телеграфы атак рисуются ПОВЕРХ тела босса: кольца, спирали и подписи
    // атак не должны прятаться за корпусом (их центр рождается в боссе).
    duelDrawTelegraph(c);
    duelDrawBullets(c);
    duelDrawPlayer(c);
    duelDrawParticles(c);
    duelDrawHud(c);
    duelDrawBanner(c);
  }
  var DUEL_ATTACK_LABELS = {
    aim: "ПРИЦЕЛ", ring: "КРУГ", sweep: "ВОЛНА", shards: "ОСКОЛКИ",
    lob: "СНЕЖКИ", spiral: "СПИРАЛЬ", cross: "КРЕСТ", hail: "ГРАД",
    geyser: "ГЕЙЗЕР", seeker: "ПОГОНЯ",
    tentacle: "ТЕНТАКЛИ", icewall: "ЛЕДЯНАЯ СТЕНА", bolt: "МОЛНИЯ",
    rockslide: "КАМНЕПАД", tide: "ПРИЛИВ"
  };
  function duelDashLine(c, x1, y1, x2, y2, color, width, dash, offset) {
    c.save();
    c.strokeStyle = color;
    c.lineWidth = width;
    c.setLineDash(dash || [5, 7]);
    c.lineDashOffset = offset || 0;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
    c.restore();
  }
  function duelWarnRing(c, x, y, r, color, alpha) {
    c.save();
    c.globalAlpha = alpha;
    c.strokeStyle = color;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = duelHexToRgba(color, 0.12);
    c.fill();
    c.restore();
  }
  function duelDrawTelegraph(c) {
    const t = duelState.telegraph;
    if (!t) return;
    const frame = duelState.frame;
    const pulse = 0.5 + 0.5 * Math.sin(frame / 3.4);
    const progress = duelClamp(1 - t.left / Math.max(1, t.total), 0, 1);
    const attackKind = t.attack || t.kind;
    const accent = DUEL_ATTACK_COLORS[attackKind] || "#8ad8ff";
    const bx = duelState.bx;
    const by = duelState.by;
    const py = DUEL_PLAYER_Y;
    const cols = t.cols || [bx, bx - 60, bx + 60];
    const aimX = t.aimX ?? duelState.px + DUEL_PLAYER_HALF;

    c.save();

    // Общая аура заряда у босса
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.14 + pulse * 0.14;
    duelDrawGlow(c, bx, by, 76 + progress * 18, accent);
    c.restore();

    c.save();
    c.translate(bx, by);
    c.rotate(frame / 90);
    c.strokeStyle = duelHexToRgba(accent, 0.32 + 0.26 * pulse);
    c.lineWidth = 1.4;
    c.setLineDash([5, 9]);
    c.beginPath();
    c.arc(0, 0, 58 + progress * 12, 0, Math.PI * 2);
    c.stroke();
    c.restore();

    // Линия времени атаки под кольцом
    c.save();
    c.strokeStyle = "rgba(234,250,255,0.16)";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(bx, by, 65, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    c.stroke();
    c.restore();

    if (t.kind === "aim") {
      duelDashLine(c, bx, by + 10, aimX, py, duelHexToRgba(accent, 0.75), 1.6, [7, 7], -frame * 1.2);
      c.save();
      c.globalAlpha = 0.45 + pulse * 0.35;
      c.strokeStyle = accent;
      c.lineWidth = 1.6;
      c.beginPath();
      c.ellipse(aimX, py + 6, 3.4 + progress * 17, (3.4 + progress * 17) * 0.42, 0, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.ellipse(aimX, py + 6, 5.4 + progress * 21, (5.4 + progress * 21) * 0.42, 0, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    } else if (t.kind === "ring") {
      c.save();
      c.globalAlpha = 0.34 + pulse * 0.3;
      c.strokeStyle = accent;
      c.lineWidth = 2.2;
      c.setLineDash([9, 8]);
      c.lineDashOffset = -frame * 0.8;
      c.beginPath();
      c.arc(bx, by, 52 + progress * 30, 0, Math.PI * 2);
      c.stroke();
      c.restore();
      const gap = t.gap ?? 0;
      c.save();
      c.globalAlpha = 0.8;
      c.strokeStyle = "#eafaff";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(bx, by, 52 + progress * 30, gap - 0.34, gap + 0.34);
      c.stroke();
      c.restore();
    } else if (t.kind === "sweep") {
      const y = by + DUEL_BOSS_HALF + 16;
      c.save();
      c.globalAlpha = 0.4 + pulse * 0.35;
      const lane = c.createLinearGradient(0, y - 10, 0, y + 10);
      lane.addColorStop(0, duelHexToRgba(accent, 0));
      lane.addColorStop(0.5, duelHexToRgba(accent, 0.25));
      lane.addColorStop(1, duelHexToRgba(accent, 0));
      c.fillStyle = lane;
      c.fillRect(0, y - 10, DUEL_W, 20);
      c.fillStyle = "rgba(8,30,48,0.55)";
      c.fillRect(t.gapX - 36, y - 11, 72, 22);
      c.strokeStyle = "rgba(234,250,255,0.85)";
      c.lineWidth = 1.4;
      c.strokeRect(t.gapX - 36, y - 11, 72, 22);
      c.restore();
      for (let x = 18; x < DUEL_W; x += 46) {
        if (Math.abs(x - t.gapX) < 44) continue;
        c.save();
        c.globalAlpha = 0.35 + pulse * 0.3;
        c.strokeStyle = accent;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(x, y - 8);
        c.lineTo(x + 5, y);
        c.lineTo(x, y + 8);
        c.stroke();
        c.restore();
      }
    } else if (t.kind === "shards") {
      for (let i = 0; i < cols.length; i++) {
        const x = duelClamp(cols[i], 22, DUEL_W - 22);
        duelDashLine(c, x, 72, x, 540, duelHexToRgba(accent, 0.34 + 0.2 * pulse), 1.2, [4, 10], -frame * 1.6);
        const drop = ((frame * 5 + i * 90) % 460);
        c.save();
        c.globalAlpha = 0.45;
        c.fillStyle = accent;
        c.beginPath();
        c.moveTo(x, 80 + drop);
        c.lineTo(x + 3.4, 92 + drop);
        c.lineTo(x - 3.4, 92 + drop);
        c.closePath();
        c.fill();
        c.restore();
        duelWarnRing(c, x, py + 8, 10 + progress * 10, accent, 0.28 + pulse * 0.24);
      }
    } else if (t.kind === "lob") {
      for (let k = 0; k < 2; k++) {
        const tx = duelClamp(aimX + (k === 0 ? -34 : 34), 30, DUEL_W - 30);
        c.save();
        c.strokeStyle = duelHexToRgba(accent, 0.42 + 0.2 * pulse);
        c.lineWidth = 1.3;
        c.setLineDash([3, 7]);
        c.lineDashOffset = -frame * 1.2 - k * 12;
        c.beginPath();
        for (let i = 0; i <= 20; i++) {
          const q = i / 20;
          const x = bx + (tx - bx) * q;
          const y = by + 30 + (py - by - 30) * q - Math.sin(Math.PI * q) * 110;
          if (i === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.stroke();
        c.restore();
        duelWarnRing(c, tx, py + 8, 12 + progress * 12, accent, 0.3 + pulse * 0.22);
      }
    } else if (t.kind === "spiral") {
      c.save();
      c.translate(bx, by);
      c.strokeStyle = duelHexToRgba(accent, 0.4 + 0.24 * pulse);
      c.lineWidth = 1.4;
      c.setLineDash([6, 8]);
      for (let arm = 0; arm < 4; arm++) {
        const off = arm * Math.PI / 2 + frame / 44;
        c.beginPath();
        for (let i = 0; i <= 22; i++) {
          const q = i / 22;
          const r = 18 + q * (78 + progress * 24);
          const a = off + q * 2.1;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          if (i === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.stroke();
      }
      c.restore();
    } else if (t.kind === "cross") {
      const angles = [0.72, 2.42, 3.86, 5.56, 1.57, 4.71];
      for (const a of angles) {
        const len = 190 + progress * 40;
        const ex = bx + Math.cos(a) * len;
        const ey = by + Math.sin(a) * len;
        duelDashLine(c, bx + Math.cos(a) * 44, by + Math.sin(a) * 40, ex, ey, duelHexToRgba(accent, 0.45), 1.4, [5, 8], -frame);
        c.save();
        c.globalAlpha = 0.7;
        c.fillStyle = accent;
        c.translate(ex, ey);
        c.rotate(a);
        c.beginPath();
        c.moveTo(7, 0);
        c.lineTo(-3, 4);
        c.lineTo(-3, -4);
        c.closePath();
        c.fill();
        c.restore();
      }
    } else if (t.kind === "hail") {
      for (let i = 0, x = 16; x < DUEL_W; x += 23, i++) {
        if (Math.abs(x - t.gapX) < 42) continue;
        c.save();
        c.globalAlpha = 0.2 + 0.16 * Math.sin(frame / 7 + i);
        c.strokeStyle = accent;
        c.lineWidth = 1;
        c.setLineDash([3, 9]);
        c.beginPath();
        c.moveTo(x, 66);
        c.lineTo(x, py);
        c.stroke();
        c.restore();
      }
      c.save();
      c.fillStyle = "rgba(8,30,48,0.42)";
      c.fillRect(t.gapX - 42, py - 26, 84, 40);
      c.strokeStyle = "rgba(234,250,255,0.75)";
      c.lineWidth = 1.3;
      c.setLineDash([4, 4]);
      c.strokeRect(t.gapX - 42, py - 26, 84, 40);
      c.restore();
    } else if (t.kind === "geyser") {
      for (let i = 0; i < 3; i++) {
        const x = duelClamp(cols[i] ?? (34 + i * 120), 30, DUEL_W - 30);
        c.save();
        c.globalAlpha = 0.28 + pulse * 0.3;
        c.strokeStyle = accent;
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(x, py + 20, 16 + progress * 6, 5 + progress * 2, 0, 0, Math.PI * 2);
        c.stroke();
        c.beginPath();
        c.ellipse(x, py + 20, 26 + progress * 10, 8 + progress * 3, 0, 0, Math.PI * 2);
        c.stroke();
        c.setLineDash([3, 8]);
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(x, py + 12);
        c.lineTo(x, 330);
        c.stroke();
        c.restore();
      }
    } else if (t.kind === "seeker") {
      for (let k = 0; k < 2; k++) {
        const ox = bx + (k === 0 ? -30 : 30);
        const oy = by + 20;
        c.save();
        c.strokeStyle = duelHexToRgba(accent, 0.36 + 0.24 * pulse);
        c.lineWidth = 1.2;
        c.setLineDash([4, 6]);
        c.lineDashOffset = -frame * 1.4;
        c.beginPath();
        for (let i = 0; i <= 24; i++) {
          const q = i / 24;
          const x = ox + (aimX - ox) * q + Math.sin(q * 7 + frame / 16 + k) * 12 * Math.sin(q * Math.PI);
          const y = oy + (py - oy) * q;
          if (i === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.stroke();
        c.restore();
        c.save();
        c.globalAlpha = 0.55 + pulse * 0.35;
        c.translate(ox, oy + Math.sin(frame / 18 + k * 2) * 6);
        c.rotate(frame / 26 + k);
        c.fillStyle = accent;
        c.beginPath();
        c.moveTo(0, -8);
        c.lineTo(6, 0);
        c.lineTo(0, 8);
        c.lineTo(-6, 0);
        c.closePath();
        c.fill();
        c.strokeStyle = "#ffffff";
        c.lineWidth = 0.9;
        c.stroke();
        c.restore();
      }
    }

    // Подпись атаки под боссом
    const label = DUEL_ATTACK_LABELS[attackKind] || "";
    if (label) {
      c.save();
      const pillW = Math.max(56, label.length * 6.4 + 20);
      duelRoundRect(c, DUEL_W / 2 - pillW / 2, by + 83, pillW, 18, 9);
      c.fillStyle = "rgba(8,30,48,.62)";
      c.fill();
      c.strokeStyle = "rgba(255,255,255,.18)";
      c.lineWidth = 1;
      c.stroke();
      c.globalAlpha = 0.72 + pulse * 0.28;
      duelText(c, label, DUEL_W / 2, by + 92, 9.5, accent, "center", 2.6);
      c.restore();
    }

    c.restore();
  }
  function duelLerpColor(a, b, t) {
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const ar = pa >> 16 & 255, ag = pa >> 8 & 255, ab = pa & 255;
    const br = pb >> 16 & 255, bg = pb >> 8 & 255, bb = pb & 255;
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${bl})`;
  }
  function duelTelegraphTension() {
    const t = duelState.telegraph;
    if (!t) return 0;
    return duelClamp(1 - t.left / Math.max(1, t.total), 0, 1);
  }
  function duelTentacle(c, x0, y0, spread, len, width, sway, topColor, bottomColor, suckers) {
    const N = 12;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const curl = t > 0.7 ? Math.pow((t - 0.7) / 0.3, 2) * len * 0.3 : 0;
      const x = x0 + spread * (t * t * 30 + t * 12) + sway * t * t;
      const y = y0 + len * t - curl;
      pts.push({ x, y, w: Math.max(2.3, width * (1 - 0.78 * t)), t });
    }
    c.lineCap = "round";
    c.lineJoin = "round";
    // Тёмная подложка: держит силуэт щупальца на светлом фоне
    c.strokeStyle = "rgba(18,70,96,0.3)";
    for (let i = 0; i < N; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      c.lineWidth = (p.w + q.w) * 0.5 + 2.4;
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(q.x, q.y);
      c.stroke();
    }
    for (let i = 0; i < N; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      c.strokeStyle = duelLerpColor(topColor, bottomColor, i / N);
      c.lineWidth = (p.w + q.w) * 0.5;
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(q.x, q.y);
      c.stroke();
    }
    c.strokeStyle = "rgba(255,255,255,0.38)";
    c.lineWidth = 1.35;
    c.beginPath();
    for (let i = 0; i <= N; i++) {
      const p = pts[i];
      const x = p.x - p.w * 0.28;
      if (i === 0) c.moveTo(x, p.y);
      else c.lineTo(x, p.y);
    }
    c.stroke();
    c.strokeStyle = "rgba(16,72,100,0.16)";
    c.lineWidth = 1;
    c.beginPath();
    for (let i = 0; i <= N; i++) {
      const p = pts[i];
      const x = p.x + p.w * 0.3;
      if (i === 0) c.moveTo(x, p.y);
      else c.lineTo(x, p.y);
    }
    c.stroke();
    if (suckers) {
      c.fillStyle = "rgba(226,250,255,0.55)";
      for (const i of [4, 6, 8]) {
        const p = pts[i];
        c.beginPath();
        c.ellipse(p.x + p.w * 0.08, p.y, p.w * 0.22, p.w * 0.15, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = "rgba(24,96,130,0.22)";
      for (const i of [4, 6, 8]) {
        const p = pts[i];
        c.beginPath();
        c.ellipse(p.x + p.w * 0.08, p.y, p.w * 0.1, p.w * 0.07, 0, 0, Math.PI * 2);
        c.fill();
      }
    }
  }
  function duelBossBodyPath(c) {
    c.beginPath();
    c.moveTo(-49, 6);
    c.bezierCurveTo(-49, -26, -30, -47, 0, -47);
    c.bezierCurveTo(30, -47, 49, -26, 49, 6);
    c.bezierCurveTo(49, 26, 38, 38, 22, 41);
    c.bezierCurveTo(12, 43, 6, 38, 0, 39);
    c.bezierCurveTo(-7, 40, -14, 44, -24, 40);
    c.bezierCurveTo(-40, 34, -49, 24, -49, 6);
    c.closePath();
  }
  function duelBossCracks(c, level, t) {
    const lines = [
      [
        [43, -18], [35, -10], [40, -1], [33, 8], [37, 18], [30, 29]
      ],
      [
        [-42, -26], [-34, -17], [-39, -7], [-32, 3], [-36, 14], [-29, 25]
      ],
      [
        [0, -45], [-6, -37], [1, -31], [-4, -25]
      ]
    ];
    const count = [0, 1, 2][level] || 0;
    c.save();
    c.lineCap = "round";
    c.lineJoin = "round";
    for (let i = 0; i < count; i++) {
      const path = lines[i];
      c.strokeStyle = "rgba(12,52,74,0.5)";
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(path[0][0], path[0][1]);
      for (let k = 1; k < path.length; k++) c.lineTo(path[k][0], path[k][1]);
      c.stroke();
      c.strokeStyle = "rgba(230,252,255,0.65)";
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(path[0][0] + 1, path[0][1] - 1);
      for (let k = 1; k < path.length; k++) c.lineTo(path[k][0] + 1, path[k][1] - 1);
      c.stroke();
    }
    c.restore();
  }
  function duelBossEye(c, x, y, look, blink, angry, accent) {
    c.save();
    c.translate(x, y);
    c.fillStyle = "rgba(18,66,92,0.18)";
    c.beginPath();
    c.ellipse(0, 1, 12.6, 13.4, 0, 0, Math.PI * 2);
    c.fill();
    if (blink) {
      c.strokeStyle = "rgba(18,66,92,0.75)";
      c.lineWidth = 2.4;
      c.beginPath();
      c.moveTo(-9, -1);
      c.quadraticCurveTo(0, 3.2, 9, -1);
      c.stroke();
      c.restore();
      return;
    }
    c.save();
    c.beginPath();
    c.ellipse(0, 0, 10.6, 11.8, 0, 0, Math.PI * 2);
    c.clip();
    const sclera = c.createLinearGradient(0, -12, 0, 12);
    sclera.addColorStop(0, "#ffffff");
    sclera.addColorStop(1, "#cfeeff");
    c.fillStyle = sclera;
    c.fillRect(-12, -13, 24, 26);
    const iris = c.createLinearGradient(0, -6, 0, 7);
    iris.addColorStop(0, "#0d5a7d");
    iris.addColorStop(0.55, "#1e8fb4");
    iris.addColorStop(1, "#7fe4f7");
    c.fillStyle = iris;
    c.beginPath();
    c.arc(look, 1, 6, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#062a3c";
    c.beginPath();
    c.arc(look, 1.4, 3.1, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.95)";
    c.beginPath();
    c.arc(look - 2.6, -2.4, 1.7, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.55)";
    c.beginPath();
    c.arc(look + 2.2, 3, 0.9, 0, Math.PI * 2);
    c.fill();
    const lid = c.createLinearGradient(0, -13, 0, 0);
    lid.addColorStop(0, "rgba(20,74,102,0.34)");
    lid.addColorStop(1, "rgba(20,74,102,0)");
    c.fillStyle = lid;
    c.fillRect(-12, -13, 24, 9);
    c.restore();
    c.strokeStyle = "rgba(26,86,116,0.5)";
    c.lineWidth = 1.5;
    c.beginPath();
    c.ellipse(0, 0, 10.6, 11.8, 0, 0, Math.PI * 2);
    c.stroke();
    c.save();
    c.translate(0, -13.5);
    c.rotate(angry * (x < 0 ? 0.28 : -0.28));
    const brow = c.createLinearGradient(0, -5.5, 0, 5);
    brow.addColorStop(0, "#e8fbff");
    brow.addColorStop(0.42, "#7ed2ec");
    brow.addColorStop(1, "#2c84a9");
    c.fillStyle = brow;
    c.beginPath();
    c.moveTo(-12.5, 2.6);
    c.quadraticCurveTo(0, -5.4, 12.5, -1.6);
    c.quadraticCurveTo(0, 0.6, -12.5, 5.4);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(20,68,94,0.32)";
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(-12.5, 5.2);
    c.quadraticCurveTo(0, 0.8, 12.5, -1.4);
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.65)";
    c.lineWidth = 0.9;
    c.beginPath();
    c.moveTo(-11.5, 2.2);
    c.quadraticCurveTo(0, -4.8, 11.5, -1.4);
    c.stroke();
    c.restore();
    c.restore();
  }
  function duelBossCrown(c, t, tension, accent) {
    const shards = [
      { x: -30, h: 24, w: 13, lean: -5 },
      { x: -16, h: 34, w: 16, lean: -2 },
      { x: 0, h: 44, w: 19, lean: 0 },
      { x: 16, h: 30, w: 15, lean: 3 },
      { x: 29, h: 22, w: 12, lean: 6 }
    ];
    const topY = -40;
    c.save();
    c.lineJoin = "round";
    for (let i = 0; i < shards.length; i++) {
      const s = shards[i];
      const tipX = s.x + s.lean;
      const tipY = topY - s.h;
      const grad = c.createLinearGradient(s.x, tipY, s.x + s.w * 0.4, topY + 8);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.34, "#c9f2ff");
      grad.addColorStop(0.72, "#71c9e6");
      grad.addColorStop(1, "#3a97bb");
      c.beginPath();
      c.moveTo(s.x - s.w / 2, topY + 9);
      c.lineTo(tipX, tipY);
      c.lineTo(s.x + s.w / 2, topY + 9);
      c.quadraticCurveTo(s.x, topY + 3, s.x - s.w / 2, topY + 9);
      c.closePath();
      c.fillStyle = grad;
      c.fill();
      c.beginPath();
      c.moveTo(tipX, tipY);
      c.lineTo(s.x + s.w / 2, topY + 9);
      c.lineTo(s.x + s.w * 0.12, topY + 4);
      c.closePath();
      c.fillStyle = "rgba(255,255,255,0.3)";
      c.fill();
      c.strokeStyle = "rgba(18,74,102,0.3)";
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(s.x + s.w / 2, topY + 9);
      c.lineTo(tipX, tipY);
      c.stroke();
      c.strokeStyle = "rgba(255,255,255,0.75)";
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(s.x - s.w / 2, topY + 9);
      c.lineTo(tipX, tipY);
      c.stroke();
    }
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.16 + tension * 0.34;
    duelDrawGlow(c, 0, topY - 16, 32 + tension * 10, "#bfefff");
    c.restore();
    c.save();
    c.translate(0, topY - 12);
    const gemGrad = c.createLinearGradient(0, -9, 0, 9);
    gemGrad.addColorStop(0, "#ffffff");
    gemGrad.addColorStop(0.5, duelHexToRgba(accent, 0.95));
    gemGrad.addColorStop(1, "rgba(255,255,255,0.9)");
    c.fillStyle = gemGrad;
    c.beginPath();
    c.moveTo(0, -10);
    c.lineTo(7.5, 0);
    c.lineTo(0, 10);
    c.lineTo(-7.5, 0);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.85)";
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = "rgba(255,255,255,0.9)";
    c.beginPath();
    c.moveTo(-1.5, -7);
    c.lineTo(2.5, -2);
    c.lineTo(-1.5, 2);
    c.closePath();
    c.fill();
    c.restore();
    for (let i = 0; i < 3; i++) {
      const a = t / 70 + i * 2.1;
      const sx = Math.cos(a) * (48 + i * 9);
      const sy = -58 + Math.sin(a * 1.3) * 12 - i * 8;
      const alpha = 0.35 + 0.35 * Math.abs(Math.sin(t / 40 + i));
      c.save();
      c.translate(sx, sy);
      c.rotate(a);
      c.fillStyle = `rgba(255,255,255,${alpha})`;
      c.beginPath();
      c.moveTo(0, -5);
      c.lineTo(1.6, 0);
      c.lineTo(0, 5);
      c.lineTo(-1.6, 0);
      c.closePath();
      c.fill();
      c.restore();
    }
    c.restore();
  }
  function duelBossBody(c) {
    const t = duelState.frame;
    const tension = duelTelegraphTension();
    const accent = DUEL_PHASE_COLORS[duelState.level] || DUEL_PHASE_COLORS[0];
    const breathe = 1 + Math.sin(t / 52) * 0.018;
    const defeated = duelState.over && duelState.won;
    c.save();
    c.translate(duelState.bx, duelState.by + (defeated ? 10 : 0));
    if (defeated) c.rotate(0.08);
    c.scale(breathe, breathe);

    // Аура и морозный ореол
    const shade = c.createRadialGradient(0, 34, 12, 0, 44, 122);
    shade.addColorStop(0, "rgba(12,58,86,0.13)");
    shade.addColorStop(0.65, "rgba(12,58,86,0.05)");
    shade.addColorStop(1, "rgba(12,58,86,0)");
    c.fillStyle = shade;
    c.beginPath();
    c.ellipse(0, 48, 118, 96, 0, 0, Math.PI * 2);
    c.fill();
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.18 + tension * 0.14;
    duelDrawGlow(c, 0, 8, 100, "#9fe3ff");
    c.globalAlpha = 0.12;
    duelDrawGlow(c, 0, 74, 66, accent);
    c.restore();
    c.save();
    c.strokeStyle = "rgba(214,246,255,0.28)";
    c.lineWidth = 1.2;
    c.setLineDash([10, 14]);
    c.lineDashOffset = -t * 0.5;
    c.beginPath();
    c.ellipse(0, 16, 74, 62, 0, 0, Math.PI * 2);
    c.stroke();
    c.restore();

    // Задний слой щупалец
    for (let i = 0; i < 3; i++) {
      const spread = (i - 1) * 1.15;
      const sway = Math.sin(t / 42 + i * 1.7) * 7;
      duelTentacle(c, spread * 18, 20, spread, 88 + i * 8, 14 - i * 2, sway, "#2f7f9f", "#14587a", false);
    }

    // Крона (позади купола, как ледяная корона)
    duelBossCrown(c, t, tension, accent);

    // Тело
    c.save();
    const bodyGrad = c.createRadialGradient(-16, -22, 8, 2, 6, 78);
    bodyGrad.addColorStop(0, "#ffffff");
    bodyGrad.addColorStop(0.2, "#e8fbff");
    bodyGrad.addColorStop(0.46, "#b3e6f7");
    bodyGrad.addColorStop(0.7, "#74c6e2");
    bodyGrad.addColorStop(0.88, "#3a92b7");
    bodyGrad.addColorStop(1, "#256f8e");
    c.fillStyle = bodyGrad;
    duelBossBodyPath(c);
    c.fill();
    c.strokeStyle = "rgba(20,76,102,0.22)";
    c.lineWidth = 1.2;
    duelBossBodyPath(c);
    c.stroke();

    c.save();
    duelBossBodyPath(c);
    c.clip();

    const bottomShade = c.createLinearGradient(0, -8, 0, 42);
    bottomShade.addColorStop(0, "rgba(14,72,102,0)");
    bottomShade.addColorStop(1, "rgba(12,64,92,0.34)");
    c.fillStyle = bottomShade;
    c.fillRect(-50, -8, 100, 52);

    // Фасетные ледяные пластины
    c.fillStyle = "rgba(255,255,255,0.2)";
    c.beginPath();
    c.moveTo(-46, 4);
    c.lineTo(-24, -34);
    c.lineTo(-2, -16);
    c.lineTo(-14, 22);
    c.closePath();
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.13)";
    c.beginPath();
    c.moveTo(4, -18);
    c.lineTo(28, -36);
    c.lineTo(44, -6);
    c.lineTo(26, 20);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.34)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-24, -34);
    c.lineTo(-2, -16);
    c.lineTo(-14, 22);
    c.moveTo(-2, -16);
    c.lineTo(26, 20);
    c.moveTo(28, -36);
    c.lineTo(4, -18);
    c.stroke();

    // Тёплое свечение из-под мантии
    const corePulse = 0.55 + 0.45 * Math.sin(t / 24) + tension * 0.25;
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = Math.min(1, 0.12 + corePulse * 0.12);
    duelDrawGlow(c, 0, 34, 44, accent);
    c.restore();

    // Бликовая полоса
    const sheen = c.createRadialGradient(-22, -28, 3, -22, -28, 30);
    sheen.addColorStop(0, "rgba(255,255,255,0.72)");
    sheen.addColorStop(0.55, "rgba(255,255,255,0.16)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = sheen;
    c.beginPath();
    c.ellipse(-22, -28, 26, 18, -0.4, 0, Math.PI * 2);
    c.fill();

    duelBossCracks(c, duelState.level, t);
    c.restore();

    const rim = c.createLinearGradient(-44, -44, 22, 34);
    rim.addColorStop(0, "rgba(255,255,255,0.95)");
    rim.addColorStop(0.42, "rgba(255,255,255,0.3)");
    rim.addColorStop(1, "rgba(140,225,255,0)");
    c.strokeStyle = rim;
    c.lineWidth = 2.4;
    duelBossBodyPath(c);
    c.stroke();
    c.restore();

    // Мягкая тень под куполом, где выходят щупальца
    c.save();
    const rootShade = c.createRadialGradient(0, 38, 4, 0, 38, 62);
    rootShade.addColorStop(0, "rgba(10,60,88,0.2)");
    rootShade.addColorStop(0.6, "rgba(10,60,88,0.08)");
    rootShade.addColorStop(1, "rgba(10,60,88,0)");
    c.fillStyle = rootShade;
    c.beginPath();
    c.ellipse(0, 39, 58, 19, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Лицо
    const look = duelClamp((duelState.px + DUEL_PLAYER_HALF - duelState.bx) / 150, -1, 1) * 4;
    const blink = !defeated && t % 230 < 8;
    if (defeated) {
      c.strokeStyle = "#0d3c56";
      c.lineWidth = 2.6;
      c.lineCap = "round";
      for (const ex of [-18, 18]) {
        c.beginPath();
        c.moveTo(ex - 7, -12);
        c.lineTo(ex + 7, 0);
        c.moveTo(ex + 7, -12);
        c.lineTo(ex - 7, 0);
        c.stroke();
      }
    } else {
      duelBossEye(c, -18, -8, look, blink, 1, accent);
      duelBossEye(c, 18, -8, look, blink, 1, accent);
    }

    // Пасть
    const my = 20.5;
    if (defeated) {
      c.fillStyle = "#0b344c";
      c.beginPath();
      c.ellipse(0, my + 2, 7, 8, 0, 0, Math.PI * 2);
      c.fill();
    } else {
      const open = 2.2 + tension * 10;
      if (tension <= 0.02) {
        c.strokeStyle = "rgba(14,60,82,0.8)";
        c.lineWidth = 2.6;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(-7.5, my);
        c.quadraticCurveTo(0, my + 5.5, 7.5, my);
        c.stroke();
      } else {
        const maw = c.createLinearGradient(0, my - open, 0, my + open);
        maw.addColorStop(0, "#123f58");
        maw.addColorStop(0.55, "#0a2b3e");
        maw.addColorStop(1, "#17536f");
        c.fillStyle = maw;
        c.beginPath();
        c.ellipse(0, my, 13, open, 0, 0, Math.PI * 2);
        c.fill();
        c.save();
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.25 + tension * 0.5;
        duelDrawGlow(c, 0, my + 2, 22 + tension * 10, accent);
        c.restore();
        c.fillStyle = "#f4feff";
        for (const fx of [-8, 0, 8]) {
          c.beginPath();
          c.moveTo(fx - 3, my - open + 0.5);
          c.lineTo(fx, my - open + 6.5);
          c.lineTo(fx + 3, my - open + 0.5);
          c.closePath();
          c.fill();
        }
        for (const fx of [-4, 5]) {
          c.beginPath();
          c.moveTo(fx - 3, my + open - 0.5);
          c.lineTo(fx, my + open - 6);
          c.lineTo(fx + 3, my + open - 0.5);
          c.closePath();
          c.fill();
        }
        c.strokeStyle = "rgba(255,255,255,0.35)";
        c.lineWidth = 1.1;
        c.beginPath();
        c.ellipse(0, my, 13, open, 0, 0, Math.PI * 2);
        c.stroke();
      }
    }

    // Передний слой щупалец
    for (let i = 0; i < 5; i++) {
      const spread = (i - 2) / 2;
      const sway = Math.sin(t / 36 + i * 1.3) * 9 + spread * 3;
      duelTentacle(
        c,
        spread * 26,
        39,
        spread * 0.95,
        96 + (i % 3) * 12,
        17 - Math.abs(spread) * 4,
        sway,
        "#8fdcf2",
        "#2f7fa4",
        i === 1 || i === 3
      );
    }

    // Морозный туман под щупальцами
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.1 + 0.04 * Math.sin(t / 30);
    const mist = c.createRadialGradient(0, 140, 4, 0, 140, 92);
    mist.addColorStop(0, "rgba(255,255,255,0.9)");
    mist.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = mist;
    c.beginPath();
    c.ellipse(0, 140, 92, 24, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Снежинки-осколки на орбите
    c.save();
    for (let i = 0; i < 6; i++) {
      const a = t / 180 + i * 1.05;
      const r = 78 + Math.sin(t / 46 + i) * 5;
      const sx = Math.cos(a) * r;
      const sy = Math.sin(a) * r * 0.62 + 6;
      const alpha = 0.22 + 0.28 * Math.abs(Math.sin(t / 44 + i * 1.7));
      c.save();
      c.translate(sx, sy);
      c.rotate(a * 1.6);
      c.fillStyle = `rgba(236,252,255,${alpha})`;
      c.beginPath();
      c.moveTo(0, -3.6);
      c.lineTo(1.3, 0);
      c.lineTo(0, 3.6);
      c.lineTo(-1.3, 0);
      c.closePath();
      c.fill();
      c.restore();
    }
    c.restore();

    if (duelState.flash > 0) {
      const flash = duelState.flash / 18;
      c.save();
      c.globalAlpha = Math.min(0.5, flash * 0.42);
      c.fillStyle = "#ffffff";
      duelBossBodyPath(c);
      c.fill();
      c.restore();
      if (duelState.flash > 8) {
        c.save();
        c.globalAlpha = Math.min(0.55, (duelState.flash - 8) / 12);
        c.strokeStyle = accent;
        c.lineWidth = 2.6;
        c.beginPath();
        c.arc(0, 0, 58 + (18 - duelState.flash) * 4.5, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
    }
    c.restore();
  }
  function duelYetiFur(c, x, y, scale, seed, color) {
    c.save();
    c.fillStyle = color;
    for (let i = 0; i < 7; i++) {
      const a = seed + i / 7 * Math.PI;
      const len = (5 + (i % 3) * 3) * scale;
      const bx2 = x + Math.cos(a) * 17 * scale;
      const by2 = y + Math.sin(a) * 15 * scale;
      c.beginPath();
      c.moveTo(bx2 - 3 * scale, by2);
      c.lineTo(bx2 + Math.cos(a) * len, by2 + Math.sin(a) * len);
      c.lineTo(bx2 + 3 * scale, by2);
      c.closePath();
      c.fill();
    }
    c.restore();
  }
  function duelAvalancheArmor(c, t, tension, defeated) {
    const pulse = 0.5 + 0.5 * Math.sin(t / 22) + tension * 0.5;
    const level = duelState.level;
    c.save();
    // Снежная мантия за плечами.
    c.save();
    const cape = c.createLinearGradient(0, -34, 0, 26);
    cape.addColorStop(0, "rgba(250,254,255,.92)");
    cape.addColorStop(0.55, "rgba(214,241,250,.75)");
    cape.addColorStop(1, "rgba(150,200,220,.25)");
    c.fillStyle = cape;
    c.beginPath();
    c.moveTo(-48, -8);
    c.quadraticCurveTo(0, -40, 48, -8);
    c.lineTo(38, 22);
    c.quadraticCurveTo(0, 8, -38, 22);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.7)";
    c.lineWidth = 1;
    c.stroke();
    c.restore();
    if (level >= 2 && !defeated) {
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.08 + level * 0.035;
      duelDrawGlow(c, 0, 8, 96, "#ffc247");
      c.restore();
    }
    // Каменные наплечники со снежными шапками.
    for (const dir of [-1, 1]) {
      c.save();
      c.translate(dir * 40, -18);
      c.rotate(dir * 0.16);
      const rock = c.createLinearGradient(0, -12, 0, 18);
      rock.addColorStop(0, "#7b8d99");
      rock.addColorStop(0.55, "#556873");
      rock.addColorStop(1, "#33434e");
      c.fillStyle = rock;
      c.beginPath();
      c.moveTo(-16, -8);
      c.lineTo(-6, -16);
      c.lineTo(12, -12);
      c.lineTo(17, 2);
      c.lineTo(8, 16);
      c.lineTo(-10, 13);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(18,38,52,0.55)";
      c.lineWidth = 1.4;
      c.stroke();
      c.fillStyle = "rgba(245,253,255,.9)";
      c.beginPath();
      c.moveTo(-15, -8);
      c.quadraticCurveTo(-2, -17, 14, -10);
      c.quadraticCurveTo(2, -7, -15, -8);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,194,71,.85)";
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(-6, -2);
      c.lineTo(2, 5);
      c.lineTo(-3, 11);
      c.stroke();
      c.restore();
    }
    // Нагрудная пластина с руной.
    c.save();
    const plate = c.createLinearGradient(0, -6, 0, 36);
    plate.addColorStop(0, "#7b8d99");
    plate.addColorStop(0.5, "#536672");
    plate.addColorStop(1, "#33434e");
    c.fillStyle = plate;
    c.beginPath();
    c.moveTo(-22, -6);
    c.lineTo(-14, 26);
    c.lineTo(0, 36);
    c.lineTo(14, 26);
    c.lineTo(22, -6);
    c.quadraticCurveTo(0, 2, -22, -6);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(18,38,52,0.55)";
    c.lineWidth = 1.5;
    c.stroke();
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.22 + pulse * 0.24;
    duelDrawGlow(c, 0, 16, 26, "#ffc247");
    c.restore();
    c.strokeStyle = `rgba(255,194,71,${0.65 + pulse * 0.3})`;
    c.lineWidth = 1.7 + level * 0.3;
    c.beginPath();
    c.moveTo(0, 5);
    c.lineTo(0, 27);
    c.moveTo(-11, 15);
    c.lineTo(11, 15);
    c.moveTo(-6, 10);
    c.lineTo(6, 20);
    c.stroke();
    if (level >= 1) {
      c.strokeStyle = "rgba(10,28,42,.55)";
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(-18, 4);
      c.lineTo(-10, 12);
      c.lineTo(-15, 20);
      c.lineTo(-7, 28);
      c.stroke();
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.4;
      c.strokeStyle = "#ffc247";
      c.lineWidth = 1;
      c.stroke();
      c.restore();
    }
    if (level >= 2) {
      c.strokeStyle = "rgba(10,28,42,.55)";
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(18, 2);
      c.lineTo(12, 10);
      c.lineTo(18, 18);
      c.lineTo(10, 26);
      c.stroke();
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.4;
      c.strokeStyle = "#ffc247";
      c.lineWidth = 1;
      c.stroke();
      c.restore();
    }
    c.restore();
    // Каменная корона поверх головы.
    for (let i = 0; i < 5; i++) {
      const x = -26 + i * 13;
      const h = 18 + (i % 3) * 7;
      c.save();
      c.translate(x, -72);
      c.rotate((i - 2) * 0.12);
      const g = c.createLinearGradient(0, -h, 0, 8);
      g.addColorStop(0, "#f2fbff");
      g.addColorStop(0.45, "#a7d8e8");
      g.addColorStop(1, "#4f6270");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(-6, 8);
      c.lineTo(-2, -h);
      c.lineTo(2, -h * 0.55);
      c.lineTo(4, -h);
      c.lineTo(7, 8);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(24,64,86,.36)";
      c.lineWidth = 1;
      c.stroke();
      c.restore();
    }
    // Тяжёлые каменные брови.
    c.strokeStyle = "rgba(34,54,68,.6)";
    c.lineWidth = 2.2;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-23, -60);
    c.lineTo(-8, -56);
    c.moveTo(23, -60);
    c.lineTo(8, -56);
    c.stroke();
    // Парящие каменные осколки.
    for (let i = 0; i < 5; i++) {
      const a = t / 120 + i * 1.4;
      const r = 58 + Math.sin(t / 40 + i) * 7;
      const sx = Math.cos(a) * r;
      const sy = 4 + Math.sin(a * 1.3) * 42;
      c.save();
      c.translate(sx, sy);
      c.rotate(a * 1.7);
      c.fillStyle = "rgba(63,79,92,.72)";
      c.beginPath();
      c.moveTo(0, -5);
      c.lineTo(4, -1);
      c.lineTo(2, 5);
      c.lineTo(-4, 3);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,194,71,.4)";
      c.lineWidth = 0.8;
      c.stroke();
      c.restore();
    }
    c.restore();
  }
  function duelYetiBody(c) {
    const t = duelState.frame;
    const tension = duelTelegraphTension();
    const accent = DUEL_PHASE_COLORS[duelState.level] || DUEL_PHASE_COLORS[0];
    const avalanche = duelBossKind() === "avalanche";
    const eyeAccent = avalanche ? "#ffc247" : accent;
    const defeated = duelState.over && duelState.won;
    const breathe = 1 + Math.sin(t / 46) * 0.02;
    const look = duelClamp((duelState.px + DUEL_PLAYER_HALF - duelState.bx) / 150, -1, 1);
    c.save();
    c.translate(duelState.bx, duelState.by + (defeated ? 14 : 0));
    if (defeated) c.rotate(-0.1);
    c.scale(breathe, breathe);

    // Холодная подложка: отделяет белую шерсть от светлой арены.
    const silhouette = c.createRadialGradient(0, 0, 18, 0, 2, 108);
    silhouette.addColorStop(0, "rgba(8,32,50,0.36)");
    silhouette.addColorStop(0.62, "rgba(8,32,50,0.18)");
    silhouette.addColorStop(1, "rgba(8,32,50,0)");
    c.fillStyle = silhouette;
    c.beginPath();
    c.arc(0, 2, 108, 0, Math.PI * 2);
    c.fill();

    // Тень и морозная аура
    const shade = c.createRadialGradient(0, 54, 8, 0, 58, 92);
    shade.addColorStop(0, "rgba(8,34,54,0.3)");
    shade.addColorStop(0.7, "rgba(8,34,54,0.1)");
    shade.addColorStop(1, "rgba(8,34,54,0)");
    c.fillStyle = shade;
    c.beginPath();
    c.ellipse(0, 58, 82, 22, 0, 0, Math.PI * 2);
    c.fill();
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.08 + tension * 0.08;
    duelDrawGlow(c, 0, 0, 82, "#9fe3ff");
    c.globalAlpha = 0.06;
    duelDrawGlow(c, 0, 40, 54, accent);
    c.restore();

    // Задние руки
    const armSway = Math.sin(t / 38) * 4;
    for (const dir of [-1, 1]) {
      c.save();
      c.translate(dir * 40, -6);
      c.rotate(dir * (0.5 + armSway * 0.01 + tension * 0.16));
      const armG = c.createLinearGradient(0, 0, dir * 16, 58);
      armG.addColorStop(0, "#dff6ff");
      armG.addColorStop(0.55, "#a8d9ea");
      armG.addColorStop(1, "#6ba7c1");
      c.fillStyle = armG;
      c.beginPath();
      c.ellipse(dir * 6, 26, 15, 30, dir * 0.18, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(18,62,86,0.32)";
      c.lineWidth = 1.6;
      c.stroke();
      c.fillStyle = "#eafaff";
      c.beginPath();
      c.arc(dir * 9, 52, 11, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(18,62,86,0.26)";
      c.lineWidth = 1.3;
      c.stroke();
      c.fillStyle = "#f4feff";
      for (let k = 0; k < 3; k++) {
        c.beginPath();
        c.moveTo(dir * (3 + k * 5), 58);
        c.lineTo(dir * (5 + k * 5), 68);
        c.lineTo(dir * (8 + k * 5), 58);
        c.closePath();
        c.fill();
      }
      c.restore();
    }

    // Ноги
    for (const dir of [-1, 1]) {
      c.save();
      const legG = c.createLinearGradient(dir * 18, 30, dir * 24, 62);
      legG.addColorStop(0, "#c7e9f5");
      legG.addColorStop(1, "#5d95b0");
      c.fillStyle = legG;
      c.beginPath();
      c.ellipse(dir * 22, 44, 16, 18, dir * 0.1, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(18,62,86,0.3)";
      c.lineWidth = 1.5;
      c.stroke();
      c.restore();
    }

    // Торс: белая шерсть
    const torso = c.createRadialGradient(-16, -30, 6, 0, 0, 66);
    torso.addColorStop(0, "#ffffff");
    torso.addColorStop(0.42, "#eefaff");
    torso.addColorStop(0.68, "#b8dfee");
    torso.addColorStop(1, "#6fa6be");
    c.fillStyle = torso;
    c.beginPath();
    c.ellipse(0, 2, 45, 50, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "rgba(18,64,88,0.52)";
    c.lineWidth = 2.2;
    c.stroke();

    // Клочья шерсти по силуэту
    for (let i = 0; i < 14; i++) {
      const a = -Math.PI * 0.92 + (i / 13) * Math.PI * 1.84;
      const rx = 44;
      const ry = 49;
      const x = Math.cos(a) * rx;
      const y = 2 + Math.sin(a) * ry;
      const len = 6 + (i % 3) * 3 + Math.sin(t / 22 + i) * 1.4;
      c.fillStyle = i % 2 ? "rgba(240,252,255,0.95)" : "rgba(205,236,246,0.95)";
      c.beginPath();
      c.moveTo(x - 3, y);
      c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      c.lineTo(x + 3, y);
      c.closePath();
      c.fill();
    }

    // Светлый живот
    const belly = c.createRadialGradient(-6, 14, 4, 0, 18, 34);
    belly.addColorStop(0, "rgba(255,255,255,0.95)");
    belly.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = belly;
    c.beginPath();
    c.ellipse(0, 16, 26, 30, 0, 0, Math.PI * 2);
    c.fill();

    // Голова
    const headY = -46;
    const head = c.createRadialGradient(-12, headY - 8, 4, 0, headY, 40);
    head.addColorStop(0, "#ffffff");
    head.addColorStop(0.55, "#e6f8ff");
    head.addColorStop(1, "#8fc3d6");
    c.fillStyle = head;
    c.beginPath();
    c.ellipse(0, headY, 34, 30, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "rgba(18,64,88,0.5)";
    c.lineWidth = 1.9;
    c.stroke();

    // Ледяные рога
    for (const dir of [-1, 1]) {
      c.save();
      c.translate(dir * 24, headY - 18);
      c.rotate(dir * 0.5);
      const horn = c.createLinearGradient(0, 0, dir * 10, -34);
      horn.addColorStop(0, "#c9f2ff");
      horn.addColorStop(0.5, "#8fd8ee");
      horn.addColorStop(1, "#eafaff");
      c.fillStyle = horn;
      c.beginPath();
      c.moveTo(-6, 6);
      c.quadraticCurveTo(dir * 16, -16, dir * 22, -30);
      c.quadraticCurveTo(dir * 4, -18, 6, 4);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,255,255,0.75)";
      c.lineWidth = 1;
      c.stroke();
      c.strokeStyle = "rgba(96,168,196,0.5)";
      c.lineWidth = 0.8;
      for (let i = 1; i <= 3; i++) {
        c.beginPath();
        c.moveTo(dir * i * 5, -i * 7);
        c.lineTo(dir * (i * 5 + 5), -i * 7 + 2);
        c.stroke();
      }
      c.restore();
    }

    // Брови и глаза
    c.fillStyle = "rgba(120,190,212,0.55)";
    c.beginPath();
    c.ellipse(0, headY - 12, 22, 8, 0, 0, Math.PI * 2);
    c.fill();
    const blink = !defeated && t % 210 < 8;
    for (const dir of [-1, 1]) {
      const ex = dir * 13;
      const ey = headY - 4;
      if (defeated) {
        c.strokeStyle = "#2a6e8c";
        c.lineWidth = 2.4;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(ex - 5, ey - 3);
        c.lineTo(ex + 5, ey + 3);
        c.moveTo(ex + 5, ey - 3);
        c.lineTo(ex - 5, ey + 3);
        c.stroke();
        continue;
      }
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.6 + tension * 0.2;
      duelDrawGlow(c, ex, ey, 17, eyeAccent);
      c.restore();
      c.fillStyle = blink ? "#7fb8cc" : "#eaffff";
      c.beginPath();
      c.ellipse(ex, ey, 8.4, blink ? 2 : 6.4, 0, 0, Math.PI * 2);
      c.fill();
      if (!blink) {
        c.fillStyle = eyeAccent;
        c.beginPath();
        c.arc(ex + look * 2.6, ey + 0.6, 3.6, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#0b2a3c";
        c.beginPath();
        c.arc(ex + look * 3.4, ey + 0.6, 2.1, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "rgba(255,255,255,0.9)";
        c.beginPath();
        c.arc(ex + look * 2.4 - 1.2, ey - 1.6, 1.1, 0, Math.PI * 2);
        c.fill();
      }
    }

    // Нос
    c.fillStyle = "rgba(96,150,172,0.55)";
    c.beginPath();
    c.ellipse(0, headY + 9, 5.5, 4, 0, 0, Math.PI * 2);
    c.fill();

    // Пасть с клыками
    const open = 4 + tension * 5 + (defeated ? -2 : 0);
    c.fillStyle = "#123c54";
    c.beginPath();
    c.ellipse(0, headY + 20, 13, Math.max(2, open), 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#f2feff";
    for (const fx of [-8, 0, 8]) {
      c.beginPath();
      c.moveTo(fx - 2.6, headY + 20 - open);
      c.lineTo(fx, headY + 20 - open + 6);
      c.lineTo(fx + 2.6, headY + 20 - open);
      c.closePath();
      c.fill();
    }
    for (const fx of [-4, 5]) {
      c.beginPath();
      c.moveTo(fx - 2.2, headY + 20 + open);
      c.lineTo(fx, headY + 20 + open - 5.4);
      c.lineTo(fx + 2.2, headY + 20 + open);
      c.closePath();
      c.fill();
    }

    // Пар из пасти
    if (!defeated) {
      c.save();
      c.globalCompositeOperation = "lighter";
      for (let i = 0; i < 3; i++) {
        const q = (t / 80 + i / 3) % 1;
        c.globalAlpha = (1 - q) * 0.16;
        duelDrawGlow(c, 10 + q * 18, headY + 22 + q * 12, 7 + q * 9, "#dff7ff");
      }
      c.restore();
    }

    // Ледяные пластины на плечах
    for (const dir of [-1, 1]) {
      c.save();
      c.translate(dir * 32, -26);
      c.rotate(dir * 0.4);
      c.fillStyle = "rgba(198,240,255,0.8)";
      c.beginPath();
      c.moveTo(0, -12);
      c.lineTo(7, -2);
      c.lineTo(3, 10);
      c.lineTo(-5, 4);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,255,255,0.8)";
      c.lineWidth = 0.9;
      c.stroke();
      c.restore();
    }

    // Передний слой шерсти на груди
    for (let i = 0; i < 9; i++) {
      const x = -30 + i * 7.5;
      const y = 30 + Math.sin(i * 1.7) * 4;
      const len = 7 + Math.sin(t / 26 + i) * 1.6 + (i % 3) * 2;
      c.fillStyle = i % 2 ? "rgba(255,255,255,0.9)" : "rgba(222,244,250,0.9)";
      c.beginPath();
      c.moveTo(x - 2.6, y - 6);
      c.lineTo(x, y + len);
      c.lineTo(x + 2.6, y - 6);
      c.closePath();
      c.fill();
    }

    if (avalanche) duelAvalancheArmor(c, t, tension, defeated);

    // Вспышка при попадании
    if (duelState.flash > 0) {
      c.save();
      c.globalAlpha = Math.min(0.6, duelState.flash / 18 * 0.5);
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.ellipse(0, 10, 50, 56, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
      if (duelState.flash > 8) {
        c.save();
        c.globalAlpha = Math.min(0.55, (duelState.flash - 8) / 12);
        c.strokeStyle = accent;
        c.lineWidth = 2.6;
        c.beginPath();
        c.arc(0, 0, 58 + (18 - duelState.flash) * 4.5, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
    }
    c.restore();
  }
  function duelStormCrown(c, t, tension, accent) {
    const topY = -44;
    const spikes = [
      { x: -30, h: 32, w: 13, lean: -6 },
      { x: -16, h: 46, w: 16, lean: -3 },
      { x: 0, h: 58, w: 18, lean: 0 },
      { x: 16, h: 42, w: 15, lean: 3 },
      { x: 29, h: 30, w: 12, lean: 7 }
    ];
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.16 + tension * 0.18;
    duelDrawGlow(c, 0, topY - 18, 48 + tension * 12, "#8fb8ff");
    c.restore();
    for (const s of spikes) {
      const tipX = s.x + s.lean;
      const tipY = topY - s.h;
      const g = c.createLinearGradient(s.x, tipY, s.x, topY + 8);
      g.addColorStop(0, "#f4fbff");
      g.addColorStop(0.35, "#9fd8ff");
      g.addColorStop(0.7, "#6f8fff");
      g.addColorStop(1, "#3a4f9c");
      c.beginPath();
      c.moveTo(s.x - s.w / 2, topY + 8);
      c.lineTo(s.x + s.lean * 0.35, topY - s.h * 0.55);
      c.lineTo(tipX, tipY);
      c.lineTo(s.x + s.lean * 0.15, topY - s.h * 0.45);
      c.lineTo(s.x + s.w / 2, topY + 8);
      c.closePath();
      c.fillStyle = g;
      c.fill();
      c.strokeStyle = "rgba(170,235,255,.65)";
      c.lineWidth = 1;
      c.stroke();
    }
    const pulse = 0.6 + 0.4 * Math.sin(t / 18) + tension * 0.3;
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.32 + pulse * 0.24;
    duelDrawGlow(c, 0, topY - 12, 20 + pulse * 4, "#b6a8ff");
    c.restore();
    const gem = c.createRadialGradient(-2, topY - 14, 1, 0, topY - 12, 8);
    gem.addColorStop(0, "#ffffff");
    gem.addColorStop(0.45, "#c9b8ff");
    gem.addColorStop(1, duelHexToRgba(accent, 0.9));
    c.fillStyle = gem;
    c.beginPath();
    c.arc(0, topY - 12, 6.5, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.85)";
    c.lineWidth = 1;
    c.stroke();
    c.save();
    c.strokeStyle = "rgba(190,230,255,.6)";
    c.lineWidth = 1.1;
    for (let i = 0; i < 2; i++) {
      const a = t / 90 + i * 2.6;
      c.beginPath();
      c.moveTo(Math.cos(a) * 12, topY - 12 + Math.sin(a) * 6);
      c.lineTo(Math.cos(a) * 12 + Math.cos(a + 1.2) * 8, topY - 12 + Math.sin(a) * 6 + Math.sin(a + 1.2) * 8);
      c.stroke();
    }
    c.restore();
  }

  function duelStormBody(c) {
    const t = duelState.frame;
    const tension = duelTelegraphTension();
    const accent = DUEL_PHASE_COLORS[duelState.level] || DUEL_PHASE_COLORS[0];
    const defeated = duelState.over && duelState.won;
    const breathe = 1 + Math.sin(t / 50) * 0.02;
    const look = duelClamp((duelState.px + DUEL_PLAYER_HALF - duelState.bx) / 150, -1, 1) * 4;
    const blink = !defeated && t % 220 < 8;
    c.save();
    c.translate(duelState.bx, duelState.by + (defeated ? 12 : 0));
    if (defeated) c.rotate(0.06);
    c.scale(breathe, breathe);

    const shade = c.createRadialGradient(0, 34, 12, 0, 44, 124);
    shade.addColorStop(0, "rgba(18,44,86,0.18)");
    shade.addColorStop(0.65, "rgba(18,44,86,0.07)");
    shade.addColorStop(1, "rgba(18,44,86,0)");
    c.fillStyle = shade;
    c.beginPath();
    c.ellipse(0, 48, 120, 98, 0, 0, Math.PI * 2);
    c.fill();
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.16 + tension * 0.14;
    duelDrawGlow(c, 0, 6, 104, "#7f8fff");
    c.globalAlpha = 0.1;
    duelDrawGlow(c, 0, 72, 68, "#5ce8ff");
    c.restore();

    // Дождь и косые струи.
    c.save();
    c.strokeStyle = "rgba(170,225,255,.16)";
    c.lineWidth = 1;
    for (let i = 0; i < 18; i++) {
      const x = -92 + ((i * 37 + t * 1.4) % 184);
      const y = -26 + ((i * 53 + t * 2.6) % 166);
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x - 6, y + 18);
      c.stroke();
    }
    c.restore();

    // Задний слой щупалец.
    for (let i = 0; i < 4; i++) {
      const spread = (i - 1.5) * 0.9;
      const sway = Math.sin(t / 40 + i * 1.6) * 8;
      duelTentacle(c, spread * 18, 20, spread, 82 + (i % 3) * 9, 13, sway, "#2f6f92", "#123a58", false);
    }

    duelStormCrown(c, t, tension, accent);

    // Тёмная грозовая мантия: держит силуэт на светлом фоне.
    c.save();
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2 + t / 320;
      const cx = Math.cos(a) * 42;
      const cy = -18 + Math.sin(a) * 18;
      const rr = 38 + (i % 3) * 9;
      const g = c.createRadialGradient(cx, cy, 2, cx, cy, rr);
      g.addColorStop(0, "rgba(18,34,66,.36)");
      g.addColorStop(0.62, "rgba(18,34,66,.18)");
      g.addColorStop(1, "rgba(18,34,66,0)");
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(cx, cy, rr, rr * 0.72, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
    c.save();
    c.globalCompositeOperation = "lighter";
    c.strokeStyle = "rgba(170,225,255,.45)";
    c.lineWidth = 1.1;
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * Math.PI * 2 + t / 320;
      const x1 = Math.cos(a) * 34;
      const y1 = -18 + Math.sin(a) * 16;
      const x2 = Math.cos(a + 0.6) * 48;
      const y2 = -18 + Math.sin(a + 0.6) * 22;
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo((x1 + x2) / 2 + Math.cos(a + 1.4) * 7, (y1 + y2) / 2 + Math.sin(a + 1.4) * 7);
      c.lineTo(x2, y2);
      c.stroke();
    }
    c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2 + t / 320;
      const cx = Math.cos(a) * 40;
      const cy = -18 + Math.sin(a) * 18;
      const rr = 34 + (i % 3) * 8;
      const g = c.createRadialGradient(cx, cy, 2, cx, cy, rr);
      g.addColorStop(0, "rgba(92,120,190,.24)");
      g.addColorStop(0.6, "rgba(40,70,120,.13)");
      g.addColorStop(1, "rgba(20,40,80,0)");
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(cx, cy, rr, rr * 0.72, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();

    // Купол.
    c.save();
    const bodyGrad = c.createRadialGradient(-16, -24, 8, 2, 6, 78);
    bodyGrad.addColorStop(0, "#cdeeff");
    bodyGrad.addColorStop(0.24, "#8fd2ea");
    bodyGrad.addColorStop(0.5, "#4f9fbd");
    bodyGrad.addColorStop(0.78, "#2b6f92");
    bodyGrad.addColorStop(1, "#123a58");
    c.fillStyle = bodyGrad;
    duelBossBodyPath(c);
    c.fill();
    c.strokeStyle = "rgba(10,44,68,0.35)";
    c.lineWidth = 1.3;
    duelBossBodyPath(c);
    c.stroke();
    c.save();
    duelBossBodyPath(c);
    c.clip();
    const bottomShade = c.createLinearGradient(0, -8, 0, 42);
    bottomShade.addColorStop(0, "rgba(10,50,80,0)");
    bottomShade.addColorStop(1, "rgba(8,38,60,0.4)");
    c.fillStyle = bottomShade;
    c.fillRect(-50, -8, 100, 52);
    const sheen = c.createRadialGradient(-22, -28, 3, -22, -28, 30);
    sheen.addColorStop(0, "rgba(255,255,255,0.55)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = sheen;
    c.beginPath();
    c.ellipse(-22, -28, 26, 18, -0.4, 0, Math.PI * 2);
    c.fill();
    // Спираль на лбу.
    c.strokeStyle = "rgba(198,242,255,.42)";
    c.lineWidth = 1.5;
    for (let k = 0; k < 2; k++) {
      c.beginPath();
      c.arc(0, -17, 7 + k * 7, 0.4, 3.3);
      c.stroke();
    }
    // Электрические прожилки по фазам.
    const veins = [
      [[-40, -10], [-28, -2], [-34, 8], [-22, 16]],
      [[34, -20], [24, -8], [30, 3], [20, 14]],
      [[0, -44], [-6, -34], [2, -26], [-2, -18]]
    ];
    const count = [0, 1, 2][duelState.level] || 0;
    c.lineCap = "round";
    for (let i = 0; i < count; i++) {
      const path = veins[i];
      c.strokeStyle = "rgba(10,40,70,.42)";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(path[0][0], path[0][1]);
      for (let k = 1; k < path.length; k++) c.lineTo(path[k][0], path[k][1]);
      c.stroke();
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.5 + tension * 0.3;
      c.strokeStyle = "#8fe8ff";
      c.lineWidth = 1;
      c.stroke();
      c.restore();
    }
    c.restore();
    const rim = c.createLinearGradient(-44, -44, 22, 34);
    rim.addColorStop(0, "rgba(220,250,255,.9)");
    rim.addColorStop(0.42, "rgba(150,220,255,.3)");
    rim.addColorStop(1, "rgba(120,160,255,0)");
    c.strokeStyle = rim;
    c.lineWidth = 2.2;
    duelBossBodyPath(c);
    c.stroke();
    c.restore();

    // Лицо.
    if (defeated) {
      c.strokeStyle = "#0d3450";
      c.lineWidth = 2.6;
      c.lineCap = "round";
      for (const ex of [-18, 18]) {
        c.beginPath();
        c.moveTo(ex - 7, -12);
        c.lineTo(ex + 7, 0);
        c.moveTo(ex + 7, -12);
        c.lineTo(ex - 7, 0);
        c.stroke();
      }
    } else {
      duelBossEye(c, -18, -8, look, blink, 1, accent);
      duelBossEye(c, 18, -8, look, blink, 1, accent);
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.24 + tension * 0.24;
      c.strokeStyle = "#b6eaff";
      c.lineWidth = 1;
      for (const ex of [-18, 18]) {
        c.beginPath();
        c.moveTo(ex + 11, -20);
        c.lineTo(ex + 16, -15);
        c.lineTo(ex + 12, -9);
        c.stroke();
      }
      c.restore();
    }

    // Пасть.
    const my = 20.5;
    if (defeated) {
      c.fillStyle = "#0b344c";
      c.beginPath();
      c.ellipse(0, my + 2, 7, 8, 0, 0, Math.PI * 2);
      c.fill();
    } else {
      const open = 2.2 + tension * 10;
      if (tension <= 0.02) {
        c.strokeStyle = "rgba(10,48,76,0.85)";
        c.lineWidth = 2.6;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(-7.5, my);
        c.quadraticCurveTo(0, my + 5.5, 7.5, my);
        c.stroke();
      } else {
        const maw = c.createLinearGradient(0, my - open, 0, my + open);
        maw.addColorStop(0, "#102a4a");
        maw.addColorStop(0.55, "#081a30");
        maw.addColorStop(1, "#174b70");
        c.fillStyle = maw;
        c.beginPath();
        c.ellipse(0, my, 13, open, 0, 0, Math.PI * 2);
        c.fill();
        c.save();
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.28 + tension * 0.5;
        duelDrawGlow(c, 0, my + 2, 22 + tension * 10, "#8fe8ff");
        c.restore();
        c.fillStyle = "#eafaff";
        for (const fx of [-8, 0, 8]) {
          c.beginPath();
          c.moveTo(fx - 3, my - open + 0.5);
          c.lineTo(fx, my - open + 6.5);
          c.lineTo(fx + 3, my - open + 0.5);
          c.closePath();
          c.fill();
        }
        c.strokeStyle = "rgba(190,240,255,0.45)";
        c.lineWidth = 1.1;
        c.beginPath();
        c.ellipse(0, my, 13, open, 0, 0, Math.PI * 2);
        c.stroke();
      }
    }

    // Передний слой щупалец.
    for (let i = 0; i < 4; i++) {
      const spread = (i - 1.5) / 1.6;
      const sway = Math.sin(t / 34 + i * 1.4) * 9;
      duelTentacle(
        c,
        spread * 24,
        38,
        spread * 0.95,
        94 + (i % 2) * 12,
        16 - Math.abs(spread) * 4,
        sway,
        "#4f9fbd",
        "#1b4f70",
        i === 1 || i === 2
      );
    }

    // Электрические дуги между щупальцами.
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.22 + 0.22 * Math.abs(Math.sin(t / 26));
    c.strokeStyle = "#b6eaff";
    c.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const x1 = -24 + i * 16;
      const y1 = 112 + (i % 2) * 10;
      const x2 = x1 + 16;
      const y2 = y1 + 8;
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo((x1 + x2) / 2 + 3, (y1 + y2) / 2 - 4);
      c.lineTo(x2, y2);
      c.stroke();
    }
    c.restore();

    // Туман и орбитальные осколки.
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.1 + 0.04 * Math.sin(t / 30);
    duelDrawGlow(c, 0, 132, 84, "#9fdcff");
    c.restore();
    for (let i = 0; i < 6; i++) {
      const a = t / 170 + i * 1.05;
      const r = 80 + Math.sin(t / 46 + i) * 6;
      c.save();
      c.translate(Math.cos(a) * r, Math.sin(a) * r * 0.6 + 8);
      c.rotate(a * 1.7);
      c.fillStyle = "rgba(198,240,255,.45)";
      c.beginPath();
      c.moveTo(0, -4);
      c.lineTo(1.4, 0);
      c.lineTo(0, 4);
      c.lineTo(-1.4, 0);
      c.closePath();
      c.fill();
      c.restore();
    }

    if (duelState.flash > 0) {
      const flash = duelState.flash / 18;
      c.save();
      c.globalAlpha = Math.min(0.5, flash * 0.42);
      c.fillStyle = "#ffffff";
      duelBossBodyPath(c);
      c.fill();
      c.restore();
      if (duelState.flash > 8) {
        c.save();
        c.globalAlpha = Math.min(0.55, (duelState.flash - 8) / 12);
        c.strokeStyle = accent;
        c.lineWidth = 2.6;
        c.beginPath();
        c.arc(0, 0, 58 + (18 - duelState.flash) * 4.5, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
    }
    c.restore();
  }

  function duelLerpWidth(widths, u) {
    const m = widths.length - 1;
    const pos = Math.max(0, Math.min(m, u * m));
    const i = Math.floor(pos);
    const f = pos - i;
    const a = widths[i];
    const b = widths[Math.min(m, i + 1)];
    return a + (b - a) * f;
  }
  function duelSmoothPath(pts, per) {
    const out = [];
    const n = pts.length;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(n - 1, i + 2)];
      for (let k = 0; k < per; k++) {
        const u = k / per;
        const u2 = u * u;
        const u3 = u2 * u;
        out.push([
          0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)
        ]);
      }
    }
    if (n > 1) out.push([pts[n - 1][0], pts[n - 1][1]]);
    return out;
  }
  function duelFinWeb(c, x, y, ang, span, len, color, alpha, rays, sway) {
    c.save();
    c.translate(x, y);
    c.rotate(ang + sway);
    const g = c.createLinearGradient(0, 0, 0, len);
    g.addColorStop(0, duelHexToRgba(color, alpha));
    g.addColorStop(0.62, duelHexToRgba(color, alpha * 0.45));
    g.addColorStop(1, duelHexToRgba(color, 0.04));
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(span * 0.9, len * 0.45, span * 0.8, len);
    c.quadraticCurveTo(0, len * 0.78, -span * 0.8, len);
    c.quadraticCurveTo(-span * 0.9, len * 0.45, 0, 0);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.5)";
    c.lineWidth = 1;
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.38)";
    c.lineWidth = 0.8;
    const n = Math.max(2, rays);
    for (let r = 0; r < n; r++) {
      const f = r / (n - 1);
      const fr = -0.85 + f * 1.7;
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(fr * span, len * 0.42, fr * span * 0.8, len);
      c.stroke();
    }
    c.restore();
  }
  function duelLeviathanCrystal(c, x, y, h, w, lean, tint) {
    c.save();
    c.translate(x, y);
    c.rotate(lean);
    const tipY = -h;
    const grad = c.createLinearGradient(0, tipY, w * 0.5, 0);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.4, "#d6f6ff");
    grad.addColorStop(0.78, "#8ecfe8");
    grad.addColorStop(1, "#4d93b4");
    c.fillStyle = grad;
    c.beginPath();
    c.moveTo(-w / 2, 0);
    c.lineTo(0, tipY);
    c.lineTo(w / 2, 0);
    c.quadraticCurveTo(0, -3, -w / 2, 0);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.85)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-w * 0.42, 0);
    c.lineTo(0, tipY);
    c.stroke();
    c.strokeStyle = "rgba(22,72,100,0.4)";
    c.lineWidth = 0.9;
    c.beginPath();
    c.moveTo(w * 0.42, 0);
    c.lineTo(0, tipY);
    c.stroke();
    if (tint) {
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.5;
      duelDrawGlow(c, 0, tipY, 3.4, tint);
      c.restore();
    }
    c.restore();
  }
  function duelLeviathanBackdrop(c, t, tension, accent) {
    c.save();
    const pulse = 1 + Math.sin(t / 52) * 0.02;
    const core = c.createRadialGradient(0, -8, 8, 0, -8, 112 * pulse);
    core.addColorStop(0, "rgba(4,15,29,0.34)");
    core.addColorStop(0.42, "rgba(6,24,43,0.2)");
    core.addColorStop(0.78, "rgba(8,30,52,0.06)");
    core.addColorStop(1, "rgba(8,30,52,0)");
    c.fillStyle = core;
    c.beginPath();
    c.ellipse(0, -12, 112 * pulse, 90 * pulse, 0, 0, Math.PI * 2);
    c.fill();
    // Лёгкое свечение вокруг силуэта.
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.08 + 0.03 * Math.sin(t / 46);
    const rim = c.createRadialGradient(0, 16, 26, 0, 16, 96 * pulse);
    rim.addColorStop(0, "rgba(120,222,255,0)");
    rim.addColorStop(0.72, "rgba(120,222,255,0)");
    rim.addColorStop(0.9, "rgba(140,228,255,0.16)");
    rim.addColorStop(1, "rgba(120,222,255,0)");
    c.fillStyle = rim;
    c.beginPath();
    c.ellipse(0, 12, 98 * pulse, 78 * pulse, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
    c.restore();
    // Холодные лучи за короной.
    c.save();
    c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i++) {
      const a = -2.4 + i * 0.22 + Math.sin(t / 90 + i) * 0.03;
      const len = 120 + i * 26 + tension * 18;
      const grad = c.createLinearGradient(0, -46, Math.cos(a) * len, -46 + Math.sin(a) * len);
      grad.addColorStop(0, "rgba(190,240,255,0.22)");
      grad.addColorStop(1, "rgba(190,240,255,0)");
      c.strokeStyle = grad;
      c.lineWidth = 16 - i * 4;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(0, -46);
      c.lineTo(Math.cos(a) * len, -46 + Math.sin(a) * len);
      c.stroke();
    }
    c.restore();
  }
  function duelLeviathanSplash(c, t, x, wl, accent) {
    c.save();
    c.globalAlpha = 0.85;
    // Тёмное мокрое пятно на воде.
    const wet = c.createRadialGradient(x, wl + 4, 4, x, wl + 4, 26);
    wet.addColorStop(0, "rgba(8,32,54,0.32)");
    wet.addColorStop(1, "rgba(8,32,54,0)");
    c.fillStyle = wet;
    c.beginPath();
    c.ellipse(x, wl + 4, 26, 8, 0, 0, Math.PI * 2);
    c.fill();
    // Отражённый холодный свет.
    c.save();
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.5;
    duelDrawGlow(c, x, wl, 38, "#bfeeff");
    c.restore();
    // Пенные дуги-волны вокруг змея.
    for (let i = 0; i < 3; i++) {
      const rr = 13 + i * 11;
      const a0 = t / 34 + i * 1.4;
      c.strokeStyle = "rgba(240,252,255,0.72)";
      c.lineWidth = 3.2 - i * 0.7;
      c.lineCap = "round";
      c.beginPath();
      c.ellipse(x, wl - 2 + Math.sin(a0) * 1.6, rr, rr * 0.42, 0, Math.PI * 0.12, Math.PI * 0.88);
      c.stroke();
      c.beginPath();
      c.ellipse(x, wl - 2 - Math.sin(a0) * 1.6, rr, rr * 0.42, 0, Math.PI * 1.12, Math.PI * 1.88);
      c.stroke();
    }
    // Брызги.
    c.fillStyle = "rgba(255,255,255,0.9)";
    for (let i = 0; i < 7; i++) {
      const ph = t / 16 + i * 1.9;
      const dx = x + Math.cos(ph) * (16 + (i % 3) * 8);
      const dy = wl - Math.abs(Math.sin(ph)) * 13 - 3;
      c.beginPath();
      c.arc(dx, dy, 1.5 + (i % 2), 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
  function duelLeviathanHead(c, t, tension, accent, look, blink, defeated) {
    const level = duelState.level || 0;
    const open = defeated ? 1 : duelClamp(tension * 1.45, 0, 1);
    const breath = 1 + Math.sin(t / 54) * 0.015;
    const tint = level >= 1 ? accent : null;
    const jawDrop = open * 15;
    c.save();
    c.scale(breath, breath);

    // ---- Жабры-перепонки за головой ----
    const flap = Math.sin(t / 26) * 0.1;
    for (const dir of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const gy = -8 + i * 10;
        duelFinWeb(c, dir * (26 + i * 2), gy, dir * (0.55 + i * 0.16) + flap, 11, 22 - i * 3, "#8fd6ee", 0.5, 3, 0);
      }
    }

    // ---- Большие загнутые рога ----
    for (const dir of [-1, 1]) {
      c.save();
      c.beginPath();
      c.moveTo(dir * 16, -26);
      c.quadraticCurveTo(dir * 30, -40, dir * 43, -45);
      c.quadraticCurveTo(dir * 39, -56, dir * 29, -60);
      c.quadraticCurveTo(dir * 23, -45, dir * 12, -29);
      c.closePath();
      const hg = c.createLinearGradient(dir * 14, -28, dir * 40, -58);
      hg.addColorStop(0, "#eafaff");
      hg.addColorStop(0.5, "#9fd8ec");
      hg.addColorStop(1, "#4d93b4");
      c.fillStyle = hg;
      c.fill();
      c.strokeStyle = "rgba(12,48,72,0.5)";
      c.lineWidth = 1.2;
      c.stroke();
      c.strokeStyle = "rgba(255,255,255,0.75)";
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(dir * 18, -28);
      c.quadraticCurveTo(dir * 30, -42, dir * 40, -46);
      c.stroke();
      c.restore();
      if (tint) {
        c.save();
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.4;
        duelDrawGlow(c, dir * 38, -50, 4, tint);
        c.restore();
      }
      // Малый рог ближе к центру.
      duelLeviathanCrystal(c, dir * 9, -37, 20, 8, dir * 0.2, tint);
    }
    // Кристалл на лбу.
    duelLeviathanCrystal(c, 0, -40, 16, 9, 0, tint);

    // ---- Череп и длинное рыло (верхняя челюсть) ----
    const skull = c.createLinearGradient(0, -44, 0, 42);
    skull.addColorStop(0, "#ffffff");
    skull.addColorStop(0.34, "#e8f9fd");
    skull.addColorStop(0.68, "#9ad3e6");
    skull.addColorStop(1, "#4f95b5");
    c.fillStyle = skull;
    c.beginPath();
    c.moveTo(-22, -34);
    c.bezierCurveTo(-29, -20, -30, -8, -26, 0);
    c.lineTo(-19, 5);
    c.bezierCurveTo(-13, 20, -4, 34, 0, 42);
    c.bezierCurveTo(4, 34, 13, 20, 19, 5);
    c.lineTo(26, 0);
    c.bezierCurveTo(30, -8, 29, -20, 22, -34);
    c.quadraticCurveTo(0, -46, -22, -34);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(10,44,68,0.62)";
    c.lineWidth = 2;
    c.stroke();

    // Ледяные пластины-надбровья вдоль рыла.
    c.fillStyle = "rgba(255,255,255,0.42)";
    c.beginPath();
    c.moveTo(-8, -6);
    c.lineTo(0, -20);
    c.lineTo(8, -6);
    c.lineTo(4, 8);
    c.lineTo(-4, 8);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(-13, 16);
    c.lineTo(-6, 8);
    c.lineTo(-8, 25);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(13, 16);
    c.lineTo(6, 8);
    c.lineTo(8, 25);
    c.closePath();
    c.fill();
    // Тёмный гребень по центру рыла.
    c.strokeStyle = "rgba(10,44,68,0.32)";
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(0, -22);
    c.lineTo(0, 33);
    c.stroke();

    // ---- Тяжёлые брови-навесы ----
    for (const dir of [-1, 1]) {
      c.save();
      c.beginPath();
      c.moveTo(dir * 6, -22);
      c.lineTo(dir * 30, -35);
      c.lineTo(dir * 28, -14);
      c.quadraticCurveTo(dir * 16, -10, dir * 6, -13);
      c.closePath();
      const bg = c.createLinearGradient(0, -35, 0, -12);
      bg.addColorStop(0, "#ffffff");
      bg.addColorStop(0.5, "#c4ecf9");
      bg.addColorStop(1, "#5fa8c6");
      c.fillStyle = bg;
      c.fill();
      c.strokeStyle = "rgba(10,44,68,0.5)";
      c.lineWidth = 1.2;
      c.stroke();
      c.restore();
    }

    // ---- Зев: тёмная полоса между челюстями ----
    if (open > 0.04 || defeated) {
      c.fillStyle = "#05202e";
      c.beginPath();
      c.moveTo(-19, 5);
      c.bezierCurveTo(-13, 20, -4, 34, 0, 42);
      c.bezierCurveTo(4, 34, 13, 20, 19, 5);
      c.lineTo(19, 5 + jawDrop);
      c.bezierCurveTo(13, 20 + jawDrop, 4, 34 + jawDrop, 0, 42 + jawDrop);
      c.bezierCurveTo(-4, 34 + jawDrop, -13, 20 + jawDrop, -19, 5 + jawDrop);
      c.closePath();
      c.fill();
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.2 + tension * 0.5;
      duelDrawGlow(c, 0, 22 + jawDrop * 0.6, 15 + tension * 14, accent);
      c.restore();
    }

    // ---- Нижняя челюсть ----
    c.save();
    c.translate(0, jawDrop);
    const jaw = c.createLinearGradient(0, 8, 0, 48);
    jaw.addColorStop(0, "#dff7ff");
    jaw.addColorStop(1, "#2f7fa4");
    c.fillStyle = jaw;
    c.beginPath();
    c.moveTo(-19, 5);
    c.bezierCurveTo(-13, 20, -4, 34, 0, 42);
    c.bezierCurveTo(4, 34, 13, 20, 19, 5);
    c.lineTo(19, 11);
    c.bezierCurveTo(13, 26, 4, 40, 0, 48);
    c.bezierCurveTo(-4, 40, -13, 26, -19, 11);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(14,54,78,0.55)";
    c.lineWidth = 1.3;
    c.stroke();
    // Зубы нижней челюсти (смотрят вверх).
    c.fillStyle = "#ffffff";
    const lowerTeeth = [
      [-15, 12, 2.6], [-10, 20, 2.6], [-6, 27, 2.5], [-2, 34, 2.3],
      [3, 32, 2.4], [8, 25, 2.6], [12, 18, 2.6], [17, 11, 2.6]
    ];
    for (const [tx, ty, tw] of lowerTeeth) {
      c.beginPath();
      c.moveTo(tx - tw, ty);
      c.lineTo(tx, ty - 6.5);
      c.lineTo(tx + tw, ty);
      c.closePath();
      c.fill();
    }
    c.restore();

    // ---- Зубы верхней челюсти (смотрят вниз) ----
    c.fillStyle = "#ffffff";
    const upperTeeth = [
      [-16, 10, 2.6], [-12, 17, 2.6], [-8, 24, 2.5], [-4, 31, 2.3],
      [1, 30, 2.4], [5, 23, 2.5], [9, 16, 2.6], [13, 9, 2.6]
    ];
    for (const [tx, ty, tw] of upperTeeth) {
      c.beginPath();
      c.moveTo(tx - tw, ty);
      c.lineTo(tx, ty + 6.5);
      c.lineTo(tx + tw, ty);
      c.closePath();
      c.fill();
    }

    // ---- Ноздри у кончика рыла ----
    c.fillStyle = "rgba(16,58,82,0.55)";
    for (const dir of [-1, 1]) {
      c.beginPath();
      c.ellipse(dir * 4, 36, 1.8, 2.6, dir * 0.3, 0, Math.PI * 2);
      c.fill();
    }

    // ---- Щёчные шипы ----
    for (const dir of [-1, 1]) {
      for (let i = 0; i < 2; i++) {
        duelLeviathanCrystal(c, dir * (25 - i * 3), -4 + i * 8, 10 + i, 5, dir * (0.8 + i * 0.15), tint);
      }
    }

    // ---- Глаза ----
    if (defeated) {
      c.strokeStyle = "#0d3450";
      c.lineWidth = 2.6;
      c.lineCap = "round";
      for (const ex of [-15, 15]) {
        c.beginPath();
        c.moveTo(ex - 5.5, -22);
        c.lineTo(ex + 5.5, -12);
        c.moveTo(ex + 5.5, -22);
        c.lineTo(ex - 5.5, -12);
        c.stroke();
      }
    } else {
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.16 + tension * 0.26;
      duelDrawGlow(c, -15, -17, 18, accent);
      duelDrawGlow(c, 15, -17, 18, accent);
      c.restore();
      duelBossEye(c, -15, -17, look, blink, 1, accent);
      duelBossEye(c, 15, -17, look, blink, 1, accent);
    }

    // ---- Усы-щупальца из углов пасти ----
    for (const dir of [-1, 1]) {
      const wl2 = Math.sin(t / 22 + (dir > 0 ? 1 : 0)) * 3;
      c.save();
      c.translate(dir * 17, 8);
      c.rotate(dir * 0.5 + wl2 * 0.02);
      const bar = c.createLinearGradient(0, 0, dir * 10, 34);
      bar.addColorStop(0, "rgba(235,250,255,0.95)");
      bar.addColorStop(0.5, "rgba(150,220,240,0.6)");
      bar.addColorStop(1, "rgba(150,220,240,0.05)");
      c.fillStyle = bar;
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(dir * 10, 14, dir * 12, 32 - wl2);
      c.quadraticCurveTo(0, 24, -dir * 2, 9);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,255,255,0.5)";
      c.lineWidth = 0.9;
      c.stroke();
      c.restore();
    }

    // ---- Кристаллы фазы 2 у висков ----
    if (level >= 2) {
      for (const dir of [-1, 1]) {
        duelLeviathanCrystal(c, dir * 27, -22, 16, 7, dir * 0.55, accent);
      }
    }

    // ---- Свечение трещин по фазам ----
    const crackCount = [1, 2, 3][level] || 1;
    for (let i = 0; i < crackCount; i++) {
      const a = t / 46 + i * 2.1;
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.3 + 0.2 * Math.sin(a * 2);
      c.fillStyle = accent;
      const cxp = -5 + i * 6;
      const cyp = -6 + Math.sin(a) * 2;
      c.beginPath();
      c.moveTo(cxp, cyp);
      c.lineTo(cxp + 4, cyp + 8);
      c.lineTo(cxp + 2, cyp + 15);
      c.lineTo(cxp - 3, cyp + 10);
      c.closePath();
      c.fill();
      c.restore();
    }
    c.restore();
  }
  function duelLeviathanBody(c) {
    const t = duelState.frame;
    const tension = duelTelegraphTension();
    const accent = DUEL_PHASE_COLORS[duelState.level] || DUEL_PHASE_COLORS[0];
    const level = duelState.level || 0;
    const defeated = duelState.over && duelState.won;
    const breathe = 1 + Math.sin(t / 38) * 0.032;
    const look = duelClamp((duelState.px + DUEL_PLAYER_HALF - duelState.bx) / 150, -1, 1) * 4;
    const blink = !defeated && t % 240 < 8;
    c.save();
    c.translate(duelState.bx, duelState.by + (defeated ? 16 : 0) + Math.sin(t / 34) * 2.5);
    if (defeated) c.rotate(-0.07 + Math.sin(t / 40) * 0.01);
    c.scale(breathe, breathe);

    const wl = DUEL_HORIZON - duelState.by;

    // Контрастная подложка: тёмная полынья и холодные лучи за короной.
    duelLeviathanBackdrop(c, t, tension, accent);

    // ---- Сегментированное тело-змей, восходящее из моря ----
    const sway = Math.sin(t / 55) * 3 + (defeated ? 5 : 0);
    const ptsC = [
      [-3, 8],
      [-20, 24],
      [-38, 42],
      [-52, 66],
      [-54, 92],
      [-40, 116],
      [-16, 134],
      [10, 150],
      [36, 168],
      [58, 190],
      [72, 212],
      [84, 234]
    ];
    const widths = [22, 24, 27, 30, 31, 30, 28, 26, 23, 19, 16, 13];
    // Живая змеиная волна: фаза бежит по телу, амплитуда растёт к хвосту.
    for (let i = 0; i < ptsC.length; i++) {
      const k = i / (ptsC.length - 1);
      const ph = t / 24 - i * 0.62;
      ptsC[i][0] += Math.sin(ph) * (2.2 + k * 6.5);
      ptsC[i][1] += Math.cos(ph) * (1.2 + k * 2.6) + sway * k;
    }
    const path = duelSmoothPath(ptsC, 4);
    const segs = [];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const u = i / Math.max(1, path.length - 2);
      segs.push({ x: a[0], y: a[1], ang, w: duelLerpWidth(widths, u) });
    }
    // Хвост (глубоко под водой) → шея (ближе к зрителю).
    for (let s = segs.length - 1; s >= 0; s--) {
      const q = segs[s];
      const under = Math.max(0, (q.y - wl) / 56);
      const fade = under <= 0 ? 1 : Math.max(0.22, 0.85 - under * 0.55);
      c.save();
      c.translate(q.x, q.y);
      c.rotate(q.ang + Math.PI / 2);
      c.globalAlpha = fade;
      const len = q.w * 1.5;
      const bgrad = c.createLinearGradient(-q.w / 2, 0, q.w / 2, 0);
      bgrad.addColorStop(0, "#e6fbff");
      bgrad.addColorStop(0.26, "#a5daec");
      bgrad.addColorStop(0.62, "#66b1cf");
      bgrad.addColorStop(1, "#2e789e");
      c.fillStyle = bgrad;
      c.beginPath();
      c.ellipse(0, 0, q.w / 2, len / 2, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(10,44,68,0.5)";
      c.lineWidth = 1.2;
      c.stroke();
      // Верхняя световая кромка сегмента.
      c.strokeStyle = "rgba(255,255,255,0.72)";
      c.lineWidth = 1.2;
      c.beginPath();
      c.ellipse(0, -len * 0.1, q.w * 0.26, len * 0.36, 0, Math.PI * 0.1, Math.PI * 0.9);
      c.stroke();
      // Шипы-пластины по спине.
      if (s % 3 === 1 && q.y < wl) {
        const sp = q.w * 0.52;
        c.fillStyle = "rgba(226,250,255,0.85)";
        c.beginPath();
        c.moveTo(-q.w / 2 - sp * 0.3, -sp * 0.2);
        c.lineTo(-q.w / 2 - sp * 0.7, -sp * 0.9);
        c.lineTo(-q.w / 2 - sp * 0.15, -sp * 0.7);
        c.lineTo(-q.w / 2 + sp * 0.2, 0);
        c.closePath();
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.55)";
        c.lineWidth = 0.8;
        c.stroke();
      }
      c.restore();
    }
    // Светящийся брюшной шов вдоль всего тела.
    c.save();
    c.globalCompositeOperation = "lighter";
    c.strokeStyle = accent;
    c.globalAlpha = (defeated ? 0.12 : 0.3 + tension * 0.42);
    c.lineWidth = 2.4;
    c.lineCap = "round";
    c.beginPath();
    for (let i = 0; i < segs.length; i++) {
      const q = segs[i];
      const nx = -Math.sin(q.ang) * q.w * 0.22;
      const ny = Math.cos(q.ang) * q.w * 0.22;
      if (i === 0) c.moveTo(q.x + nx, q.y + ny - 8);
      else c.lineTo(q.x + nx, q.y + ny);
    }
    c.stroke();
    c.restore();
    // Тонкий тёмный подшёрсток снизу для объёма.
    c.save();
    c.strokeStyle = "rgba(8,34,54,0.35)";
    c.lineWidth = 2.6;
    c.beginPath();
    for (let i = 0; i < segs.length; i++) {
      const q = segs[i];
      const nx = Math.sin(q.ang) * q.w * 0.3;
      const ny = -Math.cos(q.ang) * q.w * 0.3;
      if (i === 0) c.moveTo(q.x + nx, q.y + ny + 9);
      else c.lineTo(q.x + nx, q.y + ny);
    }
    c.stroke();
    c.restore();

    // ---- Всплеск на линии воды ----
    let entry = null;
    for (let i = 0; i < segs.length; i++) {
      if (segs[i].y >= wl - 6) { entry = segs[i]; break; }
    }
    if (entry) duelLeviathanSplash(c, t, entry.x, wl, accent);

    // ---- Гирька ледяной фазы: кристаллы на теле ----
    for (let i = 0; i < level; i++) {
      const q = segs[Math.min(segs.length - 1, 6 + i * 5)];
      if (!q) continue;
      duelLeviathanCrystal(c, q.x + Math.sin(q.ang) * q.w * 0.4, q.y + Math.cos(q.ang) * q.w * 0.4, 13 + i * 4, 6, Math.sin(q.ang) * 0.3, accent);
    }

    // ---- Голова (покачивается независимо от тела) ----
    c.save();
    c.translate(Math.sin(t / 39) * 2.6, Math.sin(t / 31) * 3.2);
    c.rotate(Math.sin(t / 47) * 0.035);
    duelLeviathanHead(c, t, tension, accent, look, blink, defeated);
    c.restore();

    // ---- Орбитальные осколки и пузырьки ----
    for (let i = 0; i < 7; i++) {
      const a = t / 130 + i * 0.9;
      const r = 88 + Math.sin(t / 46 + i) * 9;
      c.save();
      c.translate(Math.cos(a) * r, Math.sin(a) * r * 0.5 + 10);
      c.rotate(a * 1.5);
      c.fillStyle = "rgba(226,250,255,0.34)";
      c.beginPath();
      c.moveTo(0, -4.8);
      c.lineTo(1.6, 0);
      c.lineTo(0, 4.8);
      c.lineTo(-1.6, 0);
      c.closePath();
      c.fill();
      c.restore();
    }
    for (let i = 0; i < 5; i++) {
      const a = t / 24 + i * 1.3;
      const r = 60 + (i % 3) * 14;
      const bx = Math.cos(a * 0.7) * r;
      const by = -70 + Math.abs(Math.sin(a)) * 22 + i * 6;
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.5;
      duelDrawGlow(c, bx, by, 3, "#dffcff");
      c.globalAlpha = 0.9;
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(bx, by, 1.6, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // ---- Вспышка при попадании ----
    if (duelState.flash > 0) {
      const flash = duelState.flash / 18;
      c.save();
      c.globalAlpha = Math.min(0.55, flash * 0.45);
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.ellipse(0, -18, 46, 40, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
      if (duelState.flash > 8) {
        c.save();
        c.globalAlpha = Math.min(0.55, (duelState.flash - 8) / 12);
        c.strokeStyle = accent;
        c.lineWidth = 2.6;
        c.beginPath();
        c.arc(0, -14, 60 + (18 - duelState.flash) * 4.5, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
    }
    c.restore();
  }
  function duelDrawBossBody(c) {
    const kind = duelBossKind();
    if (kind === "yeti" || kind === "avalanche") duelYetiBody(c);
    else if (kind === "storm") duelStormBody(c);
    else if (kind === "leviathan") duelLeviathanBody(c);
    else duelBossBody(c);
  }
  function duelShardShape(c, len, wid, fill, edge) {
    c.beginPath();
    c.moveTo(len, 0);
    c.lineTo(wid * 0.35, -wid);
    c.lineTo(-len * 0.65, -wid * 0.72);
    c.lineTo(-len * 0.95, 0);
    c.lineTo(-len * 0.65, wid * 0.72);
    c.lineTo(wid * 0.35, wid);
    c.closePath();
    c.fillStyle = fill;
    c.fill();
    if (edge) {
      c.strokeStyle = edge;
      c.lineWidth = 0.8;
      c.stroke();
    }
  }
  function duelDrawBullets(c) {
    c.save();
    c.shadowColor = "rgba(6,30,48,.45)";
    c.shadowBlur = 3;
    c.shadowOffsetY = 1;
    for (const b of duelState.bullets) {
      if (b.delay > 0) continue;
      const kind = b.kind || "shard";
      const ang = Math.atan2(b.vy, b.vx);
      c.save();
      c.translate(b.x, b.y);
      if (b.own) {
        c.rotate(ang + Math.PI / 2);
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.45;
        const trail = c.createLinearGradient(0, 0, 0, 26);
        trail.addColorStop(0, "rgba(168,244,255,0.85)");
        trail.addColorStop(1, "rgba(168,244,255,0)");
        c.fillStyle = trail;
        c.beginPath();
        c.moveTo(-2.6, 2);
        c.lineTo(0, 26);
        c.lineTo(2.6, 2);
        c.closePath();
        c.fill();
        duelDrawGlow(c, 0, 0, 13, "#8ef0ff");
        c.globalAlpha = 1;
        c.globalCompositeOperation = "source-over";
        const grad = c.createLinearGradient(0, -10, 0, 6);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.45, "#c9f8ff");
        grad.addColorStop(1, "#5fc8e8");
        c.beginPath();
        c.moveTo(0, -10);
        c.lineTo(3.4, -1);
        c.lineTo(0, 6.5);
        c.lineTo(-3.4, -1);
        c.closePath();
        c.fillStyle = grad;
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.85)";
        c.lineWidth = 0.8;
        c.stroke();
        c.fillStyle = "rgba(255,255,255,0.95)";
        c.beginPath();
        c.moveTo(0, -8);
        c.lineTo(1.2, -1);
        c.lineTo(0, 2);
        c.lineTo(-1.2, -1);
        c.closePath();
        c.fill();
        c.restore();
        continue;
      }
      if (kind === "snowball") {
        const squash = 1 + Math.sin((b.age || 0) / 5) * 0.06;
        for (let k = 3; k >= 1; k--) {
          c.globalAlpha = 0.1 * (4 - k);
          c.fillStyle = "#eafaff";
          c.beginPath();
          c.arc(-b.vx * k * 0.9, -b.vy * k * 0.9, b.r * (0.9 - k * 0.14), 0, Math.PI * 2);
          c.fill();
        }
        c.globalAlpha = 1;
        const g = c.createRadialGradient(-b.r * 0.35, -b.r * 0.4, b.r * 0.15, 0, 0, b.r * 1.15);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.55, "#e2f6ff");
        g.addColorStop(0.85, "#a7d9ee");
        g.addColorStop(1, "#79b7d4");
        c.fillStyle = g;
        c.beginPath();
        c.ellipse(0, 0, b.r * squash, b.r / squash, 0, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.7)";
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = "rgba(255,255,255,0.55)";
        c.beginPath();
        c.arc(-b.r * 0.3, -b.r * 0.35, b.r * 0.24, 0, Math.PI * 2);
        c.fill();
        c.restore();
        continue;
      }
      if (kind === "snowflake") {
        c.rotate(b.spin || 0);
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.8;
        duelDrawGlow(c, 0, 0, b.r * 3.4, "#c9b8ff");
        c.globalAlpha = 1;
        c.strokeStyle = "#e6faff";
        c.lineWidth = 1.6;
        c.lineCap = "round";
        for (let k = 0; k < 6; k++) {
          const a = k / 6 * Math.PI * 2;
          const ex = Math.cos(a) * b.r * 1.9;
          const ey = Math.sin(a) * b.r * 1.9;
          c.beginPath();
          c.moveTo(0, 0);
          c.lineTo(ex, ey);
          c.stroke();
          c.beginPath();
          c.moveTo(ex * 0.55, ey * 0.55);
          c.lineTo(ex * 0.8 + Math.cos(a + 1.1) * 3, ey * 0.8 + Math.sin(a + 1.1) * 3);
          c.moveTo(ex * 0.55, ey * 0.55);
          c.lineTo(ex * 0.8 + Math.cos(a - 1.1) * 3, ey * 0.8 + Math.sin(a - 1.1) * 3);
          c.stroke();
        }
        c.fillStyle = "#ffffff";
        c.beginPath();
        c.arc(0, 0, 2.2, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "rgba(180,160,255,0.55)";
        c.lineWidth = 1;
        c.beginPath();
        c.arc(0, 0, b.r * 2.2, 0, Math.PI * 2);
        c.stroke();
        c.restore();
        continue;
      }
      if (kind === "spike") {
        const fade = b.life != null ? Math.min(1, b.life / 24) : 1;
        c.globalAlpha = fade * 0.5;
        c.globalCompositeOperation = "lighter";
        duelDrawGlow(c, 0, -10, 26, "#9fe8ff");
        c.globalAlpha = fade;
        c.globalCompositeOperation = "source-over";
        const g = c.createLinearGradient(0, -34, 0, 4);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.4, "#c8f4ff");
        g.addColorStop(1, "#4b9cc0");
        c.beginPath();
        c.moveTo(0, -34);
        c.lineTo(b.r * 0.95, -6);
        c.lineTo(b.r * 0.6, 3);
        c.lineTo(-b.r * 0.6, 3);
        c.lineTo(-b.r * 0.95, -6);
        c.closePath();
        c.fillStyle = g;
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.8)";
        c.lineWidth = 0.9;
        c.stroke();
        c.fillStyle = "rgba(255,255,255,0.45)";
        c.beginPath();
        c.moveTo(0, -32);
        c.lineTo(2.2, -6);
        c.lineTo(-1, 1);
        c.closePath();
        c.fill();
        c.restore();
        continue;
      }
      if (kind === "seeker") {
        const pulse = 0.85 + 0.15 * Math.sin((b.age || 0) / 6);
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = 0.75;
        duelDrawGlow(c, 0, 0, b.r * 4.2 * pulse, "#c9b0ff");
        c.globalAlpha = 1;
        c.globalCompositeOperation = "source-over";
        const g = c.createRadialGradient(-2, -2, 1, 0, 0, b.r * pulse);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.42, "#e4d8ff");
        g.addColorStop(0.8, "#9d7ff0");
        g.addColorStop(1, "#5b3fb0");
        c.fillStyle = g;
        c.beginPath();
        c.arc(0, 0, b.r * pulse, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "rgba(255,255,255,0.75)";
        c.lineWidth = 1;
        c.stroke();
        c.strokeStyle = "rgba(214,196,255,0.75)";
        c.lineWidth = 1.4;
        c.beginPath();
        c.arc(0, 0, b.r + 3.4, (b.age || 0) / 18, (b.age || 0) / 18 + Math.PI * 1.25);
        c.stroke();
        for (let k = 0; k < 2; k++) {
          const a = (b.age || 0) / 14 + k * Math.PI;
          const ox = Math.cos(a) * (b.r + 4.5);
          const oy = Math.sin(a) * (b.r + 4.5);
          c.fillStyle = "#d9c9ff";
          c.beginPath();
          c.moveTo(ox, oy - 2.4);
          c.lineTo(ox + 1.7, oy);
          c.lineTo(ox, oy + 2.4);
          c.lineTo(ox - 1.7, oy);
          c.closePath();
          c.fill();
        }
        c.restore();
        continue;
      }
      c.rotate(ang);
      const len = kind === "hail" ? b.r * 1.7 : b.r * 1.95;
      const wid = kind === "hail" ? b.r * 0.66 : b.r * 0.8;
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.5;
      const trail = c.createLinearGradient(-len * 2.6, 0, len, 0);
      trail.addColorStop(0, "rgba(150,225,255,0)");
      trail.addColorStop(1, "rgba(190,240,255,0.75)");
      c.fillStyle = trail;
      c.beginPath();
      c.moveTo(-len * 2.6, 0);
      c.lineTo(-len * 0.6, -wid * 1.1);
      c.lineTo(-len * 0.6, wid * 1.1);
      c.closePath();
      c.fill();
      c.globalAlpha = 0.7;
      duelDrawGlow(c, 0, 0, b.r * 2.6, "#9fe8ff");
      c.globalAlpha = 1;
      c.globalCompositeOperation = "source-over";
      const g = c.createLinearGradient(-len, 0, len, 0);
      g.addColorStop(0, "#6fb6d6");
      g.addColorStop(0.45, "#d9f7ff");
      g.addColorStop(0.78, "#ffffff");
      g.addColorStop(1, "#bfeeff");
      duelShardShape(c, len, wid, g, "rgba(255,255,255,0.85)");
      c.strokeStyle = "rgba(78,150,188,0.55)";
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(-len * 0.6, 0);
      c.lineTo(len * 0.9, 0);
      c.stroke();
      c.restore();
    }
    c.restore();
  }
  function duelDrawPlayer(c) {
    if (duelState.invuln > 0 && Math.floor(duelState.frame / 4) % 2 === 0) return;
    const t = duelState.frame;
    const x = duelState.px + DUEL_PLAYER_HALF;
    const cy = DUEL_PLAYER_Y + 4;
    const bob = Math.sin(t / 24) * 1.1;
    const ay = cy + bob * 0.4;
    const feetY = DUEL_PLAYER_Y + 26 + bob;
    const r = 14;
    const sway = Math.sin(t / 38) * 1.6;
    c.save();

    // Тень на снегу
    c.save();
    c.globalAlpha = 0.32;
    c.fillStyle = "#08202f";
    c.beginPath();
    c.ellipse(x, feetY + 1.5, 13, 3.6, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Шарф: развевающийся хвост за спиной
    c.save();
    c.strokeStyle = "#6ff0c4";
    c.lineWidth = 3.2;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(x - 6, ay + 2);
    c.quadraticCurveTo(x - 14 - sway, ay + 6, x - 16 - sway * 1.4, ay + 14 + Math.sin(t / 18) * 2.5);
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.55)";
    c.lineWidth = 0.9;
    c.stroke();
    c.restore();

    // Выбранный персонаж — тот же аватар, что и в забеге.
    const img = avatarImages[selectedAvatar];
    c.save();
    c.beginPath();
    c.arc(x, ay, r, 0, Math.PI * 2);
    c.fillStyle = "rgba(14,38,60,.92)";
    c.fill();
    c.save();
    c.beginPath();
    c.arc(x, ay, r - 2.5, 0, Math.PI * 2);
    c.clip();
    if (img && img.complete && img.naturalWidth > 0) {
      c.drawImage(img, x - r + 2.5, ay - r + 2.5, (r - 2.5) * 2, (r - 2.5) * 2);
    } else {
      const fallback = c.createLinearGradient(x - r, ay - r, x + r, ay + r);
      fallback.addColorStop(0, "#ffd98a");
      fallback.addColorStop(1, "#e0575f");
      c.fillStyle = fallback;
      c.fillRect(x - r + 2.5, ay - r + 2.5, (r - 2.5) * 2, (r - 2.5) * 2);
    }
    const shine = c.createLinearGradient(0, ay - r + 2, 0, ay + r * 0.6);
    shine.addColorStop(0, "rgba(255,255,255,.34)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = shine;
    c.fillRect(x - r + 2.5, ay - r + 2.5, (r - 2.5) * 2, r * 1.6);
    c.restore();
    c.beginPath();
    c.arc(x, ay, r - 1.4, Math.PI * 1.12, Math.PI * 1.88);
    c.strokeStyle = "rgba(255,255,255,.72)";
    c.lineWidth = 1.6;
    c.lineCap = "round";
    c.stroke();
    c.beginPath();
    c.arc(x, ay, r - 0.75, 0, Math.PI * 2);
    c.strokeStyle = "rgba(6,22,40,.9)";
    c.lineWidth = 1.6;
    c.stroke();
    // drawFrame рисует через общий ctx: на игровом полотне это тот же контекст.
    drawFrame(x, ay, r - 1, selectedFrame);
    c.restore();

    // Рука с ледяным бластером
    c.save();
    c.translate(x + 12, cy + 1.5);
    c.rotate(-0.14);
    const gun = c.createLinearGradient(0, -3, 0, 3);
    gun.addColorStop(0, "#dff7ff");
    gun.addColorStop(0.45, "#8fd2e8");
    gun.addColorStop(1, "#2f7694");
    c.fillStyle = gun;
    c.beginPath();
    c.roundRect(-1.6, -8, 5.2, 9.4, 1.6);
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.8)";
    c.lineWidth = 0.8;
    c.stroke();
    c.fillStyle = "#6ff0c4";
    c.beginPath();
    c.arc(1, -6.4, 1.5, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#bfefff";
    c.beginPath();
    c.roundRect(0.2, -11.4, 1.6, 4.4, 0.8);
    c.fill();
    if (duelState.fireCd > DUEL_FIRE_FRAMES - 4) {
      const k = (duelState.fireCd - (DUEL_FIRE_FRAMES - 4)) / 4;
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.6 * k;
      duelDrawGlow(c, 1, -13, 14 + k * 6, "#8ef0ff");
      c.restore();
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.moveTo(1, -20 - k * 4);
      c.lineTo(3.4, -12);
      c.lineTo(1, -9.6);
      c.lineTo(-1.4, -12);
      c.closePath();
      c.fill();
    }
    c.restore();

    // Аура невосприимчивости
    if (duelState.invuln > 0) {
      c.save();
      c.globalAlpha = 0.16 + 0.1 * Math.sin(t / 5);
      c.strokeStyle = "#8ef7ff";
      c.lineWidth = 1.6;
      c.setLineDash([4, 6]);
      c.lineDashOffset = -t * 0.8;
      c.beginPath();
      c.arc(x, ay, r + 5, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }
    c.restore();
  }
  function duelDrawParticles(c) {
    for (const p of duelState.particles) {
      c.globalAlpha = Math.max(0, p.life / p.max);
      c.fillStyle = p.color;
      c.beginPath();
      c.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  }
  function duelDrawHud(c) {
    const x = 14;
    const y = 12;
    const w = DUEL_W - 28;
    const h = 44;
    c.save();
    // Мягкая тень и светлое стекло в стиле остального HUD.
    c.save();
    c.shadowColor = "rgba(10,40,62,.18)";
    c.shadowBlur = 18;
    c.shadowOffsetY = 6;
    duelRoundRect(c, x, y, w, h, 12);
    c.fillStyle = "rgba(255,255,255,.92)";
    c.fill();
    c.restore();
    duelRoundRect(c, x, y, w, h, 12);
    const panel = c.createLinearGradient(0, y, 0, y + h);
    panel.addColorStop(0, "rgba(255,255,255,.97)");
    panel.addColorStop(1, "rgba(236,248,255,.88)");
    c.fillStyle = panel;
    c.fill();
    c.save();
    duelRoundRect(c, x + 1, y + 1, w - 2, h * 0.52, 11);
    c.clip();
    const shine = c.createLinearGradient(0, y, 0, y + h * 0.5);
    shine.addColorStop(0, "rgba(255,255,255,.82)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = shine;
    c.fillRect(x, y, w, h * 0.5);
    c.restore();
    duelRoundRect(c, x + 0.75, y + 0.75, w - 1.5, h - 1.5, 11.5);
    c.strokeStyle = "rgba(255,255,255,.98)";
    c.lineWidth = 1.4;
    c.stroke();
    const name = DUEL_BOSS_NAMES[Math.min(duelState.index, DUEL_BOSS_NAMES.length - 1)];
    duelText(c, name, x + 14, y + 13, 8.5, "#0f3d5c", "left", 1.2);
    duelText(c, "БОСС " + (duelState.index + 1), x + w - 42, y + 13, 7, "rgba(18,58,92,.52)", "right", 1);
    const pipY = y + 38;
    for (let i = 0; i < 3; i++) {
      const px = x + 15 + i * 13;
      c.beginPath();
      c.moveTo(px, pipY - 3.4);
      c.lineTo(px + 3.4, pipY);
      c.lineTo(px, pipY + 3.4);
      c.lineTo(px - 3.4, pipY);
      c.closePath();
      c.fillStyle = i <= duelState.level ? DUEL_PHASE_COLORS[i] : "rgba(18,58,92,.15)";
      c.fill();
    }
    const barX = x + 60;
    const barY = y + 31;
    const barW = w - 104;
    const barH = 7;
    const frac = duelClamp(duelState.bhp / duelState.bmax, 0, 1);
    duelRoundRect(c, barX, barY, barW, barH, 4.5);
    c.fillStyle = "rgba(21,85,118,.12)";
    c.fill();
    if (frac > 0) {
      c.save();
      duelRoundRect(c, barX, barY, Math.max(6, barW * frac), barH, 4.5);
      c.clip();
      const fill = c.createLinearGradient(barX, barY, barX, barY + barH);
      const accent = DUEL_PHASE_COLORS[duelState.level] || DUEL_PHASE_COLORS[0];
      fill.addColorStop(0, duelHexToRgba(accent, 0.95));
      fill.addColorStop(1, duelHexToRgba(accent, 0.62));
      c.fillStyle = fill;
      c.fillRect(barX, barY, barW * frac, barH);
      c.fillStyle = "rgba(255,255,255,.42)";
      c.fillRect(barX, barY, barW * frac, barH * 0.42);
      c.restore();
    }
    c.save();
    const segments = 20;
    c.strokeStyle = "rgba(18,58,92,.18)";
    c.lineWidth = 1;
    for (let i = 1; i < segments; i++) {
      const sx = barX + barW * (i / segments);
      c.beginPath();
      c.moveTo(sx, barY + 1);
      c.lineTo(sx, barY + barH - 1);
      c.stroke();
    }
    c.restore();
    duelRoundRect(c, barX, barY, barW, barH, 4.5);
    c.strokeStyle = "rgba(18,58,92,.18)";
    c.lineWidth = 1;
    c.stroke();
    const bottom = DUEL_H - 26;
    const shownHearts = Math.min(duelState.lives, 5);
    for (let i = 0; i < shownHearts; i++) {
      const hx = 26 + i * 19;
      c.save();
      c.translate(hx, bottom - 4);
      c.beginPath();
      c.moveTo(0, 7);
      c.bezierCurveTo(-10, -2, -5, -10, 0, -4.4);
      c.bezierCurveTo(5, -10, 10, -2, 0, 7);
      c.closePath();
      c.fillStyle = "#ff6b81";
      c.fill();
      c.strokeStyle = "rgba(90,16,38,0.55)";
      c.lineWidth = 1.1;
      c.stroke();
      c.restore();
    }
    if (duelState.lives > 5) {
      duelText(c, "+" + (duelState.lives - 5), 26 + 5 * 19 + 2, bottom - 1, 9, "#b3202a", "left");
    }
    if (duelState.shield > 0) {
      const sx = DUEL_W - 30;
      c.save();
      c.translate(sx, bottom - 4);
      c.beginPath();
      c.moveTo(0, -8);
      c.lineTo(8, -4);
      c.lineTo(8, 4);
      c.lineTo(0, 8);
      c.lineTo(-8, 4);
      c.lineTo(-8, -4);
      c.closePath();
      c.fillStyle = "#7ef7ff";
      c.fill();
      c.strokeStyle = "rgba(8,44,64,0.7)";
      c.lineWidth = 1.2;
      c.stroke();
      duelText(c, String(duelState.shield), 0, 0.5, 8.5, "#053247", "center");
      c.restore();
      duelText(c, "ЩИТ", sx - 16, bottom - 1, 7.5, "rgba(18,58,92,.62)", "right", 0.8);
    }
    if (duelState.frame < 320) {
      c.globalAlpha = Math.min(1, (320 - duelState.frame) / 80) * 0.75;
      const hint = isCoarsePointer()
        ? "ТАП СЛЕВА/СПРАВА · ОГОНЬ САМ"
        : "A/D ИЛИ МЫШЬ · ОГОНЬ САМ";
      duelRoundRect(c, DUEL_W / 2 - 116, DUEL_H - 54, 232, 16, 8);
      c.fillStyle = "rgba(255,255,255,.68)";
      c.fill();
      duelText(c, hint, DUEL_W / 2, DUEL_H - 46, 7.4, "rgba(18,58,92,.68)", "center", 0.9, "normal");
      c.globalAlpha = 1;
    }
    // Пауза доступна и в дуэли: HUD забега здесь скрыт, поэтому кнопка своя.
    const pz = DUEL_PAUSE_ZONE;
    duelRoundRect(c, pz.x, pz.y, pz.w, pz.h, 7);
    c.fillStyle = "rgba(21,85,118,.08)";
    c.fill();
    c.strokeStyle = "rgba(18,58,92,.18)";
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = "rgba(18,58,92,.78)";
    c.fillRect(pz.x + pz.w / 2 - 3.2, pz.y + 8, 2.2, 8);
    c.fillRect(pz.x + pz.w / 2 + 1, pz.y + 8, 2.2, 8);
    c.restore();
  }
  function duelDrawBanner(c) {
    if (!duelState.over) return;
    const k = 1 - Math.max(0, duelState.overLeft) / DUEL_END_FRAMES;
    const alpha = Math.min(1, k * 3);
    const accent = duelState.won ? "#c28000" : "#b3202a";
    const w = 292;
    const h = 106;
    const x = (DUEL_W - w) / 2;
    const y = DUEL_H / 2 - h / 2;
    c.save();
    c.globalAlpha = alpha;
    c.save();
    c.shadowColor = "rgba(10,40,62,.22)";
    c.shadowBlur = 24;
    c.shadowOffsetY = 9;
    duelRoundRect(c, x, y, w, h, 16);
    c.fillStyle = "rgba(255,255,255,.96)";
    c.fill();
    c.restore();
    duelRoundRect(c, x, y, w, h, 16);
    const panel = c.createLinearGradient(0, y, 0, y + h);
    panel.addColorStop(0, "rgba(255,255,255,.98)");
    panel.addColorStop(1, "rgba(236,248,255,.9)");
    c.fillStyle = panel;
    c.fill();
    duelRoundRect(c, x + 0.75, y + 0.75, w - 1.5, h - 1.5, 15.5);
    c.strokeStyle = duelHexToRgba(accent, 0.38);
    c.lineWidth = 1.4;
    c.stroke();
    c.globalAlpha = alpha * 0.9;
    c.fillStyle = accent;
    c.fillRect(x + 30, y + 1.5, w - 60, 2);
    c.globalAlpha = alpha;
    duelText(c, duelState.won ? "ПОБЕДА" : "ПОРАЖЕНИЕ", DUEL_W / 2, y + 42, 26, accent, "center", 4);
    let subtitle = duelState.won ? "БОСС ПОВЕРЖЕН" : "ЗАБЕГ ОКОНЧЕН";
    if (duelState.won && typeof bossState !== "undefined" && bossState.reward) subtitle = "+" + bossState.reward + " МОНЕТ";
    duelText(c, subtitle, DUEL_W / 2, y + 74, 10, "rgba(18,58,92,.62)", "center", 1.6, "normal");
    c.restore();
  }

