  function playNoise(duration, volume = 1) {
    if (!sound.enabled) return;
    const ac = initSound();
    if (!ac) return;
    try {
      const frames = Math.floor(ac.sampleRate * duration);
      const buffer = ac.createBuffer(1, frames, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frames; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
      }
      const src = ac.createBufferSource();
      const gain = ac.createGain();
      const filter = ac.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1400;
      src.buffer = buffer;
      gain.gain.value = volume;
      src.connect(filter);
      filter.connect(gain);
      if (sound.master) {
        if (sound.master) gain.connect(sound.master);
      }
      src.start();
    } catch {
    }
  }
  function vibrate(pattern) {
    if (!sound.enabled || !vibrationEnabled) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
      }
    }
  }
  var sfx = {
    jump() {
      playTone(300, 520, 0.09, "sine", 0.7);
    },
    coin() {
      playTone(880, 1180, 0.07, "triangle", 0.8);
      setTimeout(() => playTone(1180, 1480, 0.07, "triangle", 0.6), 55);
    },
    spring() {
      playTone(220, 780, 0.16, "sine", 0.8);
    },
    land() {
      playTone(160, 110, 0.06, "sine", 0.4);
    },
    crack() {
      playNoise(0.14, 0.5);
    },
    fall() {
      playTone(300, 70, 0.34, "sine", 0.9);
    },
    life() {
      playTone(660, 990, 0.12, "triangle", 0.7);
    },
    hit() {
      playTone(190, 90, 0.12, "square", 0.55);
      playNoise(0.08, 0.35);
    },
    click() {
      playTone(520, 460, 0.04, "sine", 0.35);
    },
    /* новые типы платформ: у каждого свой характер */
    /** Исчезающая: короткий предупреждающий «вздох» вниз. */
    vanishWarn() {
      playTone(700, 420, 0.1, "triangle", 0.5);
    },
    /** Исчезающая пропала: тихий хлопок. */
    vanishGone() {
      playNoise(0.1, 0.3);
    },
    /** Облачная: мягкий, будто ватный, отскок. */
    /** Липкая: глухой звук прилипания. */
    stickyLand() {
      playTone(120, 90, 0.09, "square", 0.3);
    }
  };
  function loadSoundSetting() {
    try {
      if (localStorage.getItem("morjakaSound") === "0") sound.enabled = false;
    } catch {
    }
  }
  function syncSoundButton() {
    if (!soundButton) return;
    soundButton.classList.toggle("muted", !sound.enabled);
    soundButton.setAttribute("aria-label", sound.enabled ? "\u0412\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0437\u0432\u0443\u043A" : "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0437\u0432\u0443\u043A");
    soundButton.title = sound.enabled ? "\u0417\u0432\u0443\u043A \u0432\u043A\u043B\u044E\u0447\u0451\u043D" : "\u0417\u0432\u0443\u043A \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D";
  }
  function toggleSound() {
    sound.enabled = !sound.enabled;
    try {
      localStorage.setItem("morjakaSound", sound.enabled ? "1" : "0");
    } catch {
    }
    syncSoundButton();
    if (sound.enabled) sfx.click();
  }
  loadSoundSetting();
  var platforms = [];
  var fallingPlatforms = [];
  var verticalPlatforms = [];
  var springs = [];
  var coins = [];
  var lifePickups = [];
  var jetpickups = [];
  var birds = [];
  var lives = 0;
  var jumpCharges = 0;
  var stickyStuck = null;
  var HUNTER_FROM_SCORE = 15e3;
  var HUNTER_STILL_FRAMES = 240;
  var HUNTER_CHASE_FRAMES = 180;
  var hunterBird = null;
  var hunterLeft = 0;
  var stillFrames = 0;
  var stillRefY = 0;
  var DRY_FROM_SCORE = 15e3;
  var DRY_ROWS = 4;
  var dryRowsLeft = 0;
  var dryPlatforms = /* @__PURE__ */ new WeakSet();
  var EVENT_HINTS = {
    darkness: "\u0422\u0415\u041C\u041D\u041E\u0422\u0410",
    slide: "\u0421\u041A\u041E\u041B\u042C\u0417\u041A\u0418\u0419 \u041F\u041E\u041B",
    avalanche: "\u041B\u0410\u0412\u0418\u041D\u0410",
    platformTimer: "\u041D\u0415 \u0421\u0422\u041E\u0419 \u041D\u0410 \u041C\u0415\u0421\u0422\u0415",
    walls: "\u0421\u0422\u0415\u041D\u042B",
    spikes: "\u0428\u0418\u041F\u042B",
    blizzard: "\u041C\u0415\u0422\u0415\u041B\u042C"
  };
  var PLATFORM_TIMER_ENABLED = false;
  var EVENT_FIRST_SCORE = 15e3;
  var EVENT_POOL = ["darkness", "slide", "avalanche", "walls", "spikes", "blizzard"];
  var spikyPlatforms = /* @__PURE__ */ new WeakMap();
  var SPIKY_CHANCE = 0.15;
  var SPIKY_MAX_PER_EVENT = 3;
  var spikyBudget = 0;
  var spikeSerial = 0;
  var spikySerial = /* @__PURE__ */ new WeakMap();
  var slidingPlatforms = /* @__PURE__ */ new Map();
  var avalancheRocks = /* @__PURE__ */ new WeakSet();
  var avalancheTimer = 0;
  var EVENT_STEP = 1e4;
  var EVENT_INTRO_MS = 4e3;
  var EVENT_FADE_MS = 333;