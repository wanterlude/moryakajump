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