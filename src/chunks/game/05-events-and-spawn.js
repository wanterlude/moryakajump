  var EVENT_COUNTDOWN_MS = 3e3;
  var eventIntroMs = 0;
  var eventCountdownMs = 0;
  var SIM_STEP_MS = 1e3 / 60;
  var MAX_FRAME_MS = 100;
  var MAX_SIM_STEPS_PER_FRAME = 6;
  var simAccumMs = 0;
  var lastRealTs = 0;
  var EVENT_INFO = {
    darkness: { title: "\u0422\u0415\u041C\u041D\u041E\u0422\u0410", text: "\u041C\u0438\u0440 \u043F\u043E\u0433\u0440\u0443\u0436\u0451\u043D \u0432\u043E \u043C\u0440\u0430\u043A. \u0412\u0438\u0434\u043D\u043E \u0442\u043E\u043B\u044C\u043A\u043E \u043E\u0431\u043B\u0430\u0441\u0442\u044C \u0432\u043E\u043A\u0440\u0443\u0433 \u0438\u0433\u0440\u043E\u043A\u0430." },
    slide: { title: "\u0421\u041A\u041E\u041B\u042C\u0417\u041A\u0418\u0419 \u041F\u041E\u041B", text: "\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B, \u043D\u0430 \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0442\u044B \u043F\u0440\u0438\u0437\u0435\u043C\u043B\u0438\u043B\u0441\u044F, \u043D\u0430\u0447\u0438\u043D\u0430\u044E\u0442 \u0443\u0435\u0437\u0436\u0430\u0442\u044C \u0432\u0431\u043E\u043A." },
    avalanche: { title: "\u041B\u0410\u0412\u0418\u041D\u0410", text: "\u0421\u0432\u0435\u0440\u0445\u0443 \u043F\u0430\u0434\u0430\u044E\u0442 \u043A\u0430\u043C\u043D\u0438. \u041E\u043D\u0438 \u0442\u043E\u043B\u043A\u0430\u044E\u0442 \u0438\u0433\u0440\u043E\u043A\u0430, \u043D\u043E \u0436\u0438\u0437\u043D\u044C \u043D\u0435 \u043E\u0442\u043D\u0438\u043C\u0430\u044E\u0442." },
    walls: { title: "\u0421\u0422\u0415\u041D\u042B", text: "\u041F\u043E \u043A\u0440\u0430\u044F\u043C \u0432\u044B\u0440\u0430\u0441\u0442\u0430\u044E\u0442 \u043B\u0435\u0434\u044F\u043D\u044B\u0435 \u0441\u0442\u0435\u043D\u044B. \u0414\u0435\u0440\u0436\u0438\u0441\u044C \u0431\u043B\u0438\u0436\u0435 \u043A \u0446\u0435\u043D\u0442\u0440\u0443." },
    spikes: { title: "\u0428\u0418\u041F\u042B", text: "\u0427\u0430\u0441\u0442\u044C \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C \u043F\u043E\u043A\u0440\u044B\u0442\u0430 \u0448\u0438\u043F\u0430\u043C\u0438. \u041A\u0430\u0441\u0430\u043D\u0438\u0435 \u0448\u0438\u043F\u0430 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043A\u0430\u043A \u043F\u0430\u0434\u0435\u043D\u0438\u0435." },
    blizzard: { title: "\u041C\u0415\u0422\u0415\u041B\u042C", text: "\u0421\u043D\u0435\u0433 \u0437\u0430\u0441\u0442\u0438\u043B\u0430\u0435\u0442 \u044D\u043A\u0440\u0430\u043D, \u0430 \u0432\u0435\u0442\u0435\u0440 \u0441\u0431\u0438\u0432\u0430\u0435\u0442 \u0441 \u043A\u0443\u0440\u0441\u0430. \u0414\u0435\u0440\u0436\u0438\u0441\u044C \u0446\u0435\u043D\u0442\u0440\u0430." },
    magnetStorm: { title: "\u041C\u0410\u0413\u041D\u0418\u0422\u041D\u0410\u042F \u0411\u0423\u0420\u042F", text: "\u041C\u043E\u043D\u0435\u0442\u044B \u0441\u043E \u0432\u0441\u0435\u0445 \u0441\u0442\u043E\u0440\u043E\u043D \u0441\u0442\u044F\u0433\u0438\u0432\u0430\u0435\u0442 \u043A \u0442\u0435\u0431\u0435. \u0423\u0441\u043F\u0435\u0432\u0430\u0439 \u043B\u043E\u0432\u0438\u0442\u044C." }
  };
  var EVENT_ACCENTS = {
    darkness: "#3f6fa8",
    slide: "#2f9dbd",
    avalanche: "#6b8fa8",
    walls: "#4b8fd1",
    spikes: "#e0575f",
    blizzard: "#8fc9e8",
    magnetStorm: "#ffb300"
  };
  var EVENT_DURATION_MS = 1e4;
  var EVENT_DURATION_GROWTH_MS = 5e3;
  var EVENT_DURATION_MAX_MS = 3e4;
  var EVENT_POWER_PER_SCORE = 1 / 4e4;
  var EVENT_POWER_MAX = 2.5;
  function eventDurationFor(score) {
    const steps = Math.max(0, Math.floor((score - EVENT_FIRST_SCORE) / EVENT_STEP));
    return Math.min(EVENT_DURATION_MAX_MS, EVENT_DURATION_MS + steps * EVENT_DURATION_GROWTH_MS);
  }
  function eventPowerFor(score) {
    return Math.min(EVENT_POWER_MAX, 1 + Math.max(0, score - EVENT_FIRST_SCORE) * EVENT_POWER_PER_SCORE);
  }
  var SPIKE_CYCLE_MS = 5e3;
  var SPIKE_ON_MS = 3e3;
  var WALLS_GROW_MS = 4e3;
  var WALLS_MAX_PX = 60;
  var AVALANCHE_EVERY_MS = 750;
  var SLIDE_PX_PER_MS = 4.2 * 60 / 1e3;
  var HUNTER_STILL_MS = HUNTER_STILL_FRAMES * 1e3 / 60;
  var HUNTER_CHASE_MS = HUNTER_CHASE_FRAMES * 1e3 / 60;
  var EVENT_BOUNCE_LIMIT = 4;
  // Магнитная буря тянет уже лежащие на экране монеты, поэтому идёт вдвое дольше
  // обычного события: иначе собирать было бы нечего.
  var MAGNET_STORM_DURATION_MULT = 2;
  var MAGNET_STORM_DURATION_MAX_MS = 6e4;
  var activeEvents = [];
  var nextEventScore = EVENT_FIRST_SCORE;
  var introKind = "";
  var lastLandedPlatform = null;
  var frameSinceLanding = 0;
  function resetRandomEvent() {
    eventIntroMs = 0;
    eventCountdownMs = 0;
    slidingPlatforms.clear();
    avalancheTimer = 0;
    activeEvents = [];
    nextEventScore = EVENT_FIRST_SCORE;
    introKind = "";
    spikyBudget = 0;
    lastLandedPlatform = null;
    frameSinceLanding = 0;
  }
  function isSpiky(p) {
    if (spikySerial.get(p) !== spikeSerial) {
      const on = spikyBudget > 0 && p.y < 440 && Math.random() < SPIKY_CHANCE;
      if (on) spikyBudget--;
      spikyPlatforms.set(p, on);
      spikySerial.set(p, spikeSerial);
    }
    return spikyPlatforms.get(p) === true;
  }
  function eventOf(kind) {
    return activeEvents.find((ev) => ev.kind === kind);
  }
  function eventActive(kind) {
    return activeEvents.some((ev) => ev.kind === kind);
  }
  function eventPowerOf(kind) {
    return eventOf(kind)?.power ?? 1;
  }
  function spikesActiveNow() {
    return activeEvents.some((ev) => ev.kind === "spikes" && (ev.total - ev.left) % SPIKE_CYCLE_MS < SPIKE_ON_MS);
  }
  function wallsInset() {
    const w = eventOf("walls");
    if (!w) return 0;
    const max = WALLS_MAX_PX;
    return Math.min(max, (w.total - w.left) / WALLS_GROW_MS * max);
  }
  function updateStormCoins() {
    const cx = player.x + 15;
    const cy = player.y + 15;
    const k = SIM_STEP_MS / (1e3 / 60);
    for (const coin of coins) {
      const dx = cx - (coin.x + 9);
      const dy = cy - (coin.y + 9);
      const d = Math.hypot(dx, dy) || 1;
      const speed = 5 + Math.min(10, d * 0.03);
      coin.x += dx / d * speed * k;
      coin.y += dy / d * speed * k;
    }
  }
  function updateEventWorld(dt) {
    if (eventActive("magnetStorm")) updateStormCoins();
    if (eventActive("slide")) {
      const power = eventPowerOf("slide");
      for (const [p, dir] of slidingPlatforms) {
        if (!platforms.includes(p)) {
          slidingPlatforms.delete(p);
          continue;
        }
        p.x += dir * SLIDE_PX_PER_MS * power * SIM_STEP_MS;
        if (p.x <= 0 || p.x + p.w >= WORLD_W) {
          p.x = Math.max(0, Math.min(WORLD_W - p.w, p.x));
          slidingPlatforms.set(p, -dir);
        }
      }
    }
    const av = eventOf("avalanche");
    if (av) {
      avalancheTimer -= SIM_STEP_MS;
      if (avalancheTimer <= 0) {
        avalancheTimer = AVALANCHE_EVERY_MS / av.power;
        const rock = {
          kind: "raven",
          color: "#8b97a6",
          accent: "#dfe6ee",
          x: 20 + Math.random() * (WORLD_W - 40),
          y: -30,
          vx: 0,
          dir: 1,
          baseY: -30,
          wave: 0,
          waveSpeed: 0,
          phase: 0,
          size: 1.1,
          flap: Math.random() * Math.PI * 2,
          flapSpeed: 0.025 + Math.random() * 0.035,
          hitCooldown: 0
        };
        birds.push(rock);
        avalancheRocks.add(rock);
      }
    }
  }
  function tickEvents(dt) {
    for (let i = activeEvents.length - 1; i >= 0; i--) {
      const ev = activeEvents[i];
      ev.left -= dt;
      if (ev.left <= 0) {
        activeEvents.splice(i, 1);
        if (ev.kind === "slide") slidingPlatforms.clear();
      }
    }
  }
  function pickEventKind() {
    if (PLATFORM_TIMER_ENABLED && Math.random() < 0.2 && !eventActive("platformTimer")) return "platformTimer";
    const free = EVENT_POOL.filter((k) => !eventActive(k));
    if (!free.length) return null;
    return free[Math.floor(Math.random() * free.length)];
  }
  function spawnEvent(kind) {
    const score = player.score;
    const base = eventDurationFor(score);
    const total = kind === "magnetStorm"
      ? Math.min(MAGNET_STORM_DURATION_MAX_MS, base * MAGNET_STORM_DURATION_MULT)
      : base;
    activeEvents.push({
      kind,
      left: total,
      total,
      power: eventPowerFor(score),
      standOn: null,
      standFrames: 0
    });
    if (kind === "avalanche") avalancheTimer = 0;
    if (kind === "spikes") {
      spikeSerial++;
      spikyBudget = SPIKY_MAX_PER_EVENT;
    }
    introKind = kind;
    eventIntroMs = 0;
    eventCountdownMs = EVENT_COUNTDOWN_MS;
    dailyAdd("events", 1);
  }
  function updateRandomEvent() {
    const landed = lastLandedPlatform;
    lastLandedPlatform = null;
    if (landed && eventActive("slide") && !slidingPlatforms.has(landed)) {
      slidingPlatforms.set(landed, Math.random() < 0.5 ? -1 : 1);
    }
    const bossBlocks = bossState.phase !== "idle" || player.score >= bossState.nextScore;
    if (player.score >= nextEventScore && !bossBlocks) {
      const kind = pickEventKind();
      if (kind) spawnEvent(kind);
      nextEventScore += EVENT_STEP;
    }
    tickEvents(SIM_STEP_MS);
    const pt = eventOf("platformTimer");
    if (pt) {
      if (landed) {
        frameSinceLanding = 0;
        if (landed === pt.standOn) pt.standFrames += 1;
        else {
          pt.standOn = landed;
          pt.standFrames = 1;
        }
      } else {
        frameSinceLanding += SIM_STEP_MS;
        if (frameSinceLanding > 4e3) {
          pt.standOn = null;
          pt.standFrames = 0;
        }
      }
      const on = pt.standOn;
      if (on && !on.falling && pt.standFrames >= EVENT_BOUNCE_LIMIT) {
        on.falling = true;
        on.vy = 0;
        fallingPlatforms.push(on);
        on.removeAfterBounce = true;
        pt.standOn = null;
        pt.standFrames = 0;
        hudPop(player.x + 15, 430, "\u041E\u0411\u0420\u0423\u0428\u0418\u041B\u041E\u0421\u042C!", "#e63946");
      }
    }
  }
  var PLATFORM_HINTS = {
    broken: { text: "\u0425\u0420\u0423\u041F\u041A\u041E", color: "#c98a4b" },
    moving: { text: "\u0414\u0412\u0418\u0416\u0415\u0422\u0421\u042F", color: "#5ac8fa" },
    ice: { text: "\u0421\u041A\u041E\u041B\u042C\u0417\u041A\u041E", color: "#8fe3ff" },
    spring: { text: "\u041F\u0420\u0423\u0416\u0418\u041D\u0410", color: "#ffd23f" },
    vanish: { text: "\u0418\u0421\u0427\u0415\u0417\u0410\u0415\u0422", color: "#ff8fa3" },
    sticky: { text: "\u041B\u0418\u041F\u041D\u0415\u0422 \xB7 2 \u041F\u0420\u042B\u0416\u041A\u0410", color: "#7bc96f" }
  };
  var seenPlatformTypes = /* @__PURE__ */ new Set();
  var runCoins = 0;
  // Серия приземлений убрана полностью: не влияет на коины и больше не загружает HUD.
  function comboMultiplier() {
    return 1;
  }
  function registerComboLanding() {
    stats.platforms++;
    dailyAdd("platforms", 1);
  }
  var keys = {};
  // Геймпад: опрос идёт каждый кадр, но флаги поднимаются только если он реально
  // подключён — без пада управление ведёт себя ровно как раньше.
  var padInput = { left: false, right: false, axis: 0, connected: false };
  var padPrev = { jump: false, start: false };
  var PAD_DEADZONE = 0.35;
  function padJumpPressed() {
    if (currentState === STATE.PLAYING) {
      if (perkState.offering) return;
      doDoubleJump();
      return;
    }
    if (currentState === STATE.MENU) startGame();
    else if (currentState === STATE.GAMEOVER) startGame();
  }
  function padStartPressed() {
    if (currentState === STATE.PLAYING) pauseGame();
    else if (currentState === STATE.PAUSE) resumeGame();
    else if (currentState === STATE.MENU) startGame();
    else if (currentState === STATE.GAMEOVER) startGame();
  }
  function pollGamepad() {
    padInput.left = false;
    padInput.right = false;
    padInput.axis = 0;
    padInput.connected = false;
    if (!navigator.getGamepads) return;
    var pads = navigator.getGamepads();
    var pad = null;
    for (var i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i].connected) { pad = pads[i]; break; }
    }
    if (!pad) {
      padPrev.jump = false;
      padPrev.start = false;
      return;
    }
    padInput.connected = true;
    var axis = pad.axes && pad.axes.length ? pad.axes[0] : 0;
    var magnitude = Math.abs(axis);
    // Мёртвая зона настраивается: ниже неё стик считается отпущенным.
    const deadZone = controls.padZone;
    padInput.axis = magnitude > deadZone
      ? Math.sign(axis) * (magnitude - deadZone) / (1 - deadZone)
      : 0;
    var dLeft = pad.buttons[14] && pad.buttons[14].pressed;
    var dRight = pad.buttons[15] && pad.buttons[15].pressed;
    padInput.left = axis < -PAD_DEADZONE || dLeft;
    padInput.right = axis > PAD_DEADZONE || dRight;
    // A, B и правый курок — прыжок; Start — пауза/продолжить.
    var jump = !!(pad.buttons[0] && pad.buttons[0].pressed) ||
      !!(pad.buttons[1] && pad.buttons[1].pressed) ||
      !!(pad.buttons[7] && pad.buttons[7].value > 0.5);
    var start = !!(pad.buttons[9] && pad.buttons[9].pressed);
    if (jump && !padPrev.jump) padJumpPressed();
    if (start && !padPrev.start) padStartPressed();
    padPrev.jump = jump;
    padPrev.start = start;
  }
  window.addEventListener("gamepadconnected", () => {
    setMenuMessage("Геймпад подключён", "A — прыжок, START — пауза");
  });
  function resetGame() {
    player = { x: 185, y: WORLD_H - 100, vx: 0, dy: 0, score: 0 };
    platforms = [makePlatform({ x: 120, y: WORLD_H - 50, w: 160, h: 15, type: "static" })];
    fallingPlatforms = [];
    verticalPlatforms = [];
    springs = [];
    coins = [];
    lifePickups = [];
    jetpickups = [];
    birds = [];
    lives = 1;
    jumpCharges = 0;
    stickyStuck = null;
    seenPlatformTypes = /* @__PURE__ */ new Set();
    resetBoss();
    resetRandomEvent();
    hunterBird = null;
    hunterLeft = 0;
    stillFrames = 0;
    stillRefY = 0;
    dryRowsLeft = 0;
    runCoins = 0;
    stats.runCounted = false;
    resetPerks();
    resetWind();
    resetQuests();
    fallCooldown = 0;
    squash = 0;
    runStartedAt = performance.now();
    clearTouchInput();
    for (let i = 0; i < 7; i++) {
      const y = WORLD_H - 100 - i * 100;
      const step = spawnTerrainStep(y);
      for (const p of step.platforms) platforms.push(p);
      for (const v of step.verticals) verticalPlatforms.push(v);
    }
  }
