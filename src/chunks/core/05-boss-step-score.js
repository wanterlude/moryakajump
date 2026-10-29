  var BOSS_STEP_SCORE = 3e4;
  var BOSS_TOP = 300;
  var BOSS_H = 60;
  var BOSS_W = 120;
  var BOSS_WARN_MS = 2400;
  var BOSS_ROCK_MS = 1600;
  var BOSS_CHARGE_MS = 5200;
  var BOSS_WINDUP_MS = 800;
  var BOSS_CHARGE_TIME_MS = 1100;
  var BOSS_HURT_COOLDOWN_MS = 900;
  var BOSS_WIN_PAUSE_MS = 1800;
  var BOSS_ROCK_WARN_MS = 700;
  var BOSS_STUN_MS = 900;
  var BOSS_PHASE_2 = 0.5;
  var BOSS_PHASE_3 = 0.25;
  var bossState = {
    phase: "idle",
    timer: 0,
    index: 0,
    x: 0,
    dir: 1,
    hp: 0,
    maxHp: 0,
    reward: 0,
    rockTimer: 0,
    chargeTimer: 0,
    windup: 0,
    charging: 0,
    hurtCd: 0,
    flash: 0,
    prevFeet: 0,
    nextScore: BOSS_STEP_SCORE,
    rocks: [],
    pending: [],
    stunMs: 0,
    level: 0,
    rewardPerk: false
  };
  function resetBoss() {
    duelCancel();
    bossState.phase = "idle";
    bossState.timer = 0;
    bossState.index = 0;
    bossState.x = 0;
    bossState.dir = 1;
    bossState.hp = 0;
    bossState.maxHp = 0;
    bossState.reward = 0;
    bossState.rockTimer = 0;
    bossState.chargeTimer = 0;
    bossState.windup = 0;
    bossState.charging = 0;
    bossState.hurtCd = 0;
    bossState.flash = 0;
    bossState.prevFeet = 0;
    bossState.nextScore = BOSS_STEP_SCORE;
    bossState.rocks = [];
    bossState.pending = [];
    bossState.stunMs = 0;
    bossState.level = 0;
    bossState.rewardPerk = false;
  }
  function bossHurtPlayer(reason) {
    if (invulnerableActive()) return;
    startScreenShake(3.5, 16);
    sfx.fall();
    vibrate(40);
    hudPop(player.x + 15, 430, reason, "#ff4d6d");
    if (lives > 0) {
      lives--;
      player.dy = -30;
      refillJumps();
    } else {
      player.y = WORLD_H + 1;
    }
  }
  var BOSS_FIGHT_GRAVITY = 1.12;
  function bossGravityScale() {
    return bossState.phase === "fight" || bossState.phase === "warn" ? BOSS_FIGHT_GRAVITY : 1;
  }
  function drawBossTint(c) {
    if (bossState.phase === "idle" || bossState.phase === "won") return;
    c.save();
    c.fillStyle = "rgba(120,20,40,0.22)";
    c.fillRect(0, 0, WORLD_W, WORLD_H);
    c.restore();
  }
  /**
   * Перед боем с боссом снимаем всё, что тикает во времени: события мира,
   * вступление, шипы, скольжение, лавину и ветер. Иначе темнота или метель
   * висят на экране весь бой, а босс становится нечитаемым.
   */
  function clearTemporaryEffects() {
    if (typeof activeEvents !== "undefined") activeEvents = [];
    if (typeof introKind !== "undefined") introKind = "";
    if (typeof eventIntroMs !== "undefined") eventIntroMs = 0;
    if (typeof eventCountdownMs !== "undefined") eventCountdownMs = 0;
    if (typeof spikyBudget !== "undefined") spikyBudget = 0;
    if (typeof spikeSerial !== "undefined") spikeSerial++;
    if (typeof slidingPlatforms !== "undefined") slidingPlatforms.clear();
    if (typeof avalancheTimer !== "undefined") avalancheTimer = 0;
    if (typeof wind !== "undefined" && wind) wind.active = false;
    for (const p of platforms) {
      p.hole = false;
      p.slippery = false;
    }
  }

  function startBossWarning() {
    clearTemporaryEffects();
    const index = Math.round(bossState.nextScore / BOSS_STEP_SCORE) - 1;
    bossState.index = index;
    bossState.maxHp = 4 + index * 2;
    bossState.hp = bossState.maxHp;
    bossState.reward = 60 + index * 40;
    bossState.x = (WORLD_W - BOSS_W) / 2;
    bossState.dir = Math.random() < 0.5 ? -1 : 1;
    bossState.rocks = [];
    bossState.pending = [];
    bossState.stunMs = 0;
    bossState.level = 0;
    bossState.windup = 0;
    bossState.charging = 0;
    bossState.phase = "warn";
    bossState.timer = BOSS_WARN_MS;
    if (lives <= 0) {
      lives = 1;
      hudPop(WORLD_W / 2, 262, "СТРАХОВКА: +1 ЖИЗНЬ", "#0f8a76");
    }
    stats.bossTries[index] = (stats.bossTries[index] || 0) + 1;
    saveStats();
    startScreenShake(2.5, 14);
    hudPop(WORLD_W / 2, 230, "\u041C\u0415\u0413\u0410-\u0411\u041E\u0421\u0421!", "#ff4d6d");
  }
  function bossWin() {
    bossState.phase = "won";
    bossState.timer = BOSS_WIN_PAUSE_MS;
    bossState.pending = [];
    bossState.stunMs = 0;
    bossState.rocks = [];
    bossState.windup = 0;
    bossState.charging = 0;
    bossState.nextScore += BOSS_STEP_SCORE;
    bossState.rewardPerk = true;
    perkState.lastOfferScore = Math.max(perkState.lastOfferScore, Math.floor(player.score / PERK_SCORE_STEP) * PERK_SCORE_STEP);
    bankCoins += bossState.reward;
    stats.bossWins[bossState.index] = (stats.bossWins[bossState.index] || 0) + 1;
    dailyAdd("boss", 1);
    checkAchievements();
    saveProgress();
    startScreenShake(3, 18);
    hudPop(WORLD_W / 2, 230, "\u041F\u041E\u0411\u0415\u0414\u0410! +" + bossState.reward, HUD_COLORS.green);
  }
  function finishDuel(end) {
    if (trainingState.active) {
      const won = end.won;
      trainingState.active = false;
      bossState.phase = "idle";
      duelCancel();
      currentState = STATE.MENU;
      bossTrainOpen = true;
      lastFrameTime = 0;
      if (won) {
        stats.trainWins[trainingState.index] = (stats.trainWins[trainingState.index] || 0) + 1;
        checkAchievements();
        saveStats();
      }
      setMenuMessage("ТРЕНИРОВКА", won ? "БОСС ПОВЕРЖЕН" : "ПОРАЖЕНИЕ");
      return;
    }
    lives = end.livesLeft;
    player.x = duelPlayerX();
    player.vx = 0;
    player.y = 500;
    player.dy = -15;
    refillJumps();
    if (end.won) {
      bossWin();
      return;
    }
    // Поражение в дуэли обнуляет забег: возврата в игру с потерей одной жизни нет.
    bossState.phase = "idle";
    lives = 0;
    hudPop(WORLD_W / 2, 230, "\u041F\u041E\u0420\u0410\u0416\u0415\u041D\u0418\u0415", "#ff4d6d");
    endRun();
  }
  function finishRunStats() {
    if (stats.runCounted) return;
    stats.runCounted = true;
    stats.runs++;
    stats.playMs += Math.max(0, performance.now() - runStartedAt);
    const key = String(selectedAvatar);
    stats.characterRuns[key] = (stats.characterRuns[key] || 0) + 1;
    runStartedAt = 0;
    dailyAdd("runs", 1);
    saveStats();
    checkAchievements();
  }
  function endRun() {
    // \u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u0435 \u0437\u0430\u0431\u0435\u0433\u0430 \u043F\u043E\u0441\u043B\u0435 \u043F\u043E\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0432 \u0434\u0443\u044D\u043B\u0438: \u0442\u043E\u0442 \u0436\u0435 \u0444\u0438\u043D\u0430\u043B, \u0447\u0442\u043E \u0438 \u043F\u0440\u0438 \u043F\u0430\u0434\u0435\u043D\u0438\u0438.
    currentState = STATE.GAMEOVER;
    const finalScore = Math.floor(player.score);
    gameOverState.openedAt = performance.now();
    lbSubmitRun(finalScore);
    pauseState.hover = null;
    gameOverState.newRecord = finalScore > 0 && finalScore > highScore;
    if (finalScore > highScore) {
      highScore = finalScore;
      unlockedAvatars = getUnlockedAvatars(highScore);
      if (!unlockedAvatars.includes(selectedAvatar)) selectedAvatar = 0;
      saveProgress();
    }
    finishRunStats();
  }
  function updateBoss() {
    const b = bossState;
    if (b.phase !== "fight") b.prevFeet = player.y + 35;
    if (b.phase === "idle") {
      if (player.score >= b.nextScore) startBossWarning();
      return;
    }
    if (b.phase === "won") {
      b.timer -= SIM_STEP_MS;
      if (b.timer <= 0) {
        if (b.rewardPerk && perkState.offering) return;
        b.phase = "idle";
        if (b.rewardPerk) {
          b.rewardPerk = false;
          offerBossReward();
        }
      }
      return;
    }
    if (b.phase === "warn") {
      b.timer -= SIM_STEP_MS;
      if (b.timer <= 0) {
        duelStart(b.index, lives, player.x);
        b.phase = "fight";
        return;
      }
      return;
    }
    b.flash = Math.max(0, b.flash - 1);
    b.hurtCd = Math.max(0, b.hurtCd - SIM_STEP_MS);
    const speedUp = b.index * 0.25;
    const centerX = b.x + BOSS_W / 2;
    const hpRatio = b.maxHp > 0 ? b.hp / b.maxHp : 0;
    const level = hpRatio > BOSS_PHASE_2 ? 0 : hpRatio > BOSS_PHASE_3 ? 1 : 2;
    if (level > b.level) {
      b.level = level;
      startScreenShake(3, 14);
      hudPop(WORLD_W / 2, 230, "\u0424\u0410\u0417\u0410 " + (level + 1), "#ffb020");
    }
    const stunned = b.stunMs > 0;
    b.stunMs = Math.max(0, b.stunMs - SIM_STEP_MS);
    if (stunned) {
    } else if (b.windup > 0) {
      b.windup -= SIM_STEP_MS;
      if (b.windup <= 0) b.charging = BOSS_CHARGE_TIME_MS;
    } else if (b.charging > 0) {
      b.charging -= SIM_STEP_MS;
      b.dir = Math.sign(player.x + 15 - centerX) || b.dir;
      b.x += b.dir * 5;
    } else {
      b.x += b.dir * (1.2 + speedUp);
      b.chargeTimer += SIM_STEP_MS;
      if (b.chargeTimer >= BOSS_CHARGE_MS - b.index * 400) {
        b.chargeTimer = 0;
        b.windup = BOSS_WINDUP_MS * (b.level >= 2 ? 0.75 : 1);
      }
    }
    if (b.x < 8) {
      b.x = 8;
      b.dir = 1;
    }
    if (b.x > WORLD_W - 8 - BOSS_W) {
      b.x = WORLD_W - 8 - BOSS_W;
      b.dir = -1;
    }
    b.rockTimer += SIM_STEP_MS;
    const rockInterval = (BOSS_ROCK_MS - b.index * 200) * (b.level >= 1 ? 0.75 : 1);
    if (!stunned && b.rockTimer >= rockInterval) {
      b.rockTimer = 0;
      b.pending.push({ x: 20 + Math.random() * (WORLD_W - 40), t: BOSS_ROCK_WARN_MS });
    }
    for (let i = b.pending.length - 1; i >= 0; i--) {
      const p = b.pending[i];
      p.t -= SIM_STEP_MS;
      if (p.t <= 0) {
        b.pending.splice(i, 1);
        b.rocks.push({ x: p.x, y: -10, vy: 0.5 });
      }
    }
    for (let i = b.rocks.length - 1; i >= 0; i--) {
      const r = b.rocks[i];
      r.vy = Math.min(6, r.vy + 0.25);
      r.y += r.vy;
      if (r.y > WORLD_H + 20) {
        b.rocks.splice(i, 1);
        continue;
      }
      if (r.x >= player.x - 6 && r.x <= player.x + 36 && r.y + 6 >= player.y && r.y - 6 <= player.y + 35) {
        b.rocks.splice(i, 1);
        if (b.hurtCd <= 0) {
          bossHurtPlayer("\u041A\u0410\u041C\u0415\u041D\u042C");
          b.hurtCd = BOSS_HURT_COOLDOWN_MS;
        }
      }
    }
    const px = player.x;
    const py = player.y;
    const feet = py + 35;
    const overlapX = px + 30 > b.x + 4 && px < b.x + BOSS_W - 4;
    const crossedTop = b.prevFeet < BOSS_TOP + 4 && feet >= BOSS_TOP - 2 && player.dy > 0;
    b.prevFeet = feet;
    if (overlapX && crossedTop) {
      b.hp--;
      b.flash = 8;
      b.stunMs = BOSS_STUN_MS;
      player.dy = -28;
      player.y = BOSS_TOP - 36;
      refillJumps();
      startScreenShake(2, 10);
      hudPop(centerX, BOSS_TOP - 24, "-1", "#7ef7ff");
      if (b.hp <= 0) bossWin();
    } else if (overlapX && py < BOSS_TOP + BOSS_H && feet > BOSS_TOP + 4 && b.hurtCd <= 0) {
      bossHurtPlayer("\u0411\u041E\u0421\u0421!");
      b.hurtCd = BOSS_HURT_COOLDOWN_MS;
      player.dy = Math.max(player.dy, 10);
    }
  }