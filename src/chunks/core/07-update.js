  function update(dt) {
    if (currentState === STATE.PLAYING && (eventIntroMs > 0 || eventCountdownMs > 0)) {
      if (eventIntroMs > 0) eventIntroMs = Math.max(0, eventIntroMs - SIM_STEP_MS);
      else eventCountdownMs = Math.max(0, eventCountdownMs - SIM_STEP_MS);
      return;
    }
    if (currentState !== STATE.PLAYING) return;
    dt = Math.min(dt, 2);
    // Переход на арену босса: пока висит баннер, мир замирает. Раньше забег
    // продолжался под баннером, и можно было потерять жизнь от падения или
    // птицы ещё до начала боя — особенно на маленьком запасе жизней.
    if (bossState.phase === "warn") {
      updateBoss();
      return;
    }
    if (duelIsActive()) {
      const end = duelUpdate(dt, {
        left: !!(keys.ArrowLeft || keys.KeyA || touchInput.left || padInput.left || tiltEnabled && tiltDirection < 0),
        right: !!(keys.ArrowRight || keys.KeyD || touchInput.right || padInput.right || tiltEnabled && tiltDirection > 0),
        targetX: mouseControl.inside ? mouseControl.targetX : null
      });
      for (const text of duelDrainEvents()) {
        hudPop(WORLD_W / 2, 230, text, text.startsWith("-") ? "#ff4d6d" : "#ffb020");
      }
      if (end) finishDuel(end);
      return;
    }
    if (perkState.offering) {
      tickEvents(SIM_STEP_MS);
      return;
    }
    const keyboardOrTouchLeft = keys.ArrowLeft || keys.KeyA || touchInput.left || padInput.left;
    const keyboardOrTouchRight = keys.ArrowRight || keys.KeyD || touchInput.right || padInput.right;
    const tiltLeft = tiltEnabled && tiltDirection < 0;
    const tiltRight = tiltEnabled && tiltDirection > 0;
    if (jumpCharges > maxAirJumps()) jumpCharges = maxAirJumps();
    const keyAccel = 1.2 * controls.key * perkAccelScale();
    let push = 0;
    if (keyboardOrTouchLeft || tiltLeft) push -= 1;
    if (keyboardOrTouchRight || tiltRight) push += 1;
    // Стик важнее кнопок: он аналоговый и уже учитывает сенсу геймпада.
    if (padInput.axis !== 0) push = padInput.axis * controls.pad;
    if (push !== 0) {
      player.vx += push * keyAccel * dt;
    } else if (mouseControl.inside && mouseControl.targetX !== null) {
      const playerCenter = player.x + 15;
      const error = mouseControl.targetX - playerCenter;
      const deadZone = 8;
      const maxMouseSpeed = 7 * controls.mouse * perkAccelScale();
      if (Math.abs(error) <= deadZone) {
        player.vx *= Math.pow(0.65, dt);
      } else {
        const desiredSpeed = Math.sign(error) * maxMouseSpeed * Math.min(1, Math.abs(error) / 100);
        const response = 1 - Math.pow(0.62, dt);
        player.vx += (desiredSpeed - player.vx) * response;
      }
    }
    updateWind(dt);
    applyWind(dt);
    const standsOn = (type) => platforms.some(
      (p) => p.type === type && player.dy >= 0 && Math.abs(player.y + 35 - p.y) < 3 && player.x + 25 > p.x && player.x + 10 < p.x + p.w
    );
    const onIce = standsOn("ice");
    const onSticky = standsOn("sticky");
    const frictionBase = onIce ? 0.91 : onSticky ? 0.75 : 0.85;
    const friction = Math.pow(frictionBase, dt * perkFrictionScale());
    player.vx *= friction;
    player.x += player.vx * dt;
    const jetpack = perkValue("jetpack") > 0;
    if (jetpack) {
      player.dy -= JETPACK_THRUST * dt;
      if (player.dy < -JETPACK_MAX_RISE) player.dy = -JETPACK_MAX_RISE;
    } else {
      player.dy += 0.5464 * perkGravityScale() * bossGravityScale() * dt;
    }
    if (stickyStuck) {
      const sp = stickyStuck.platform;
      const stillOn = platforms.includes(sp) && player.x + 25 > sp.x && player.x + 10 < sp.x + sp.w;
      if (stillOn) {
        player.dy = 0;
        player.y = sp.y - 35;
      } else {
        stickyStuck = null;
      }
    }
    player.y += player.dy * dt;
    if (squash) {
      squash *= Math.pow(0.82, dt);
      if (Math.abs(squash) < 0.01) squash = 0;
    }
    if (fallCooldown > 0) fallCooldown = Math.max(0, fallCooldown - dt);
    if (eventActive("walls")) {
      const inset = wallsInset();
      player.x = Math.max(inset, Math.min(WORLD_W - inset - 30, player.x));
    } else {
      if (player.x < -30) player.x = WORLD_W;
      if (player.x > WORLD_W) player.x = -30;
    }
    const birdRate = (SPAWN.birdBaseRate + birdGrowth() * SPAWN.birdGrowthRate) * perkBirdScale();
    if (Math.random() < birdRate * dt) spawnBird();
    for (let i = birds.length - 1; i >= 0; i--) {
      const bird = birds[i];
      bird.x += bird.vx * dt;
      bird.flap += bird.flapSpeed * dt;
      bird.hitCooldown = Math.max(0, bird.hitCooldown - dt);
      if (bird === hunterBird) {
        const pull = Math.sign(player.x + 15 - bird.x) * 0.035 * dt;
        bird.vx = Math.max(-7, Math.min(7, bird.vx + pull));
        bird.baseY += (player.y - 20 - bird.baseY) * 0.012 * dt;
        bird.x = Math.max(-60, Math.min(460, bird.x));
        bird.baseY = Math.max(40, Math.min(560, bird.baseY));
      }
      if (avalancheRocks.has(bird)) bird.baseY += 4.2 * dt;
      bird.phase += bird.waveSpeed * dt;
      bird.y = bird.baseY + Math.sin(bird.phase) * bird.wave * 10;
      if (bird.x < -70 || bird.x > 470 || bird.baseY > 620) {
        birds.splice(i, 1);
        continue;
      }
      const playerCenterX = player.x + 15;
      const playerCenterY = player.y + 15;
      const hitHalfW = 20 + bird.size * 9;
      const hitHalfH = 17 + bird.size * 8;
      if (bird.hitCooldown <= 0 && !ghostActive() && !invulnerableActive() && Math.abs(playerCenterX - bird.x) < hitHalfW && Math.abs(playerCenterY - bird.y) < hitHalfH) {
        const pushDirection = playerCenterX < bird.x ? -1 : 1;
        const kind = BIRD_KINDS[bird.kind] || BIRD_KINDS.gull;
        const push = kind.push;
        const scaleBoost = 1 + (bird.size - 1) * 0.25;
        startScreenShake(2.5 + bird.size * 1.4, 12 + Math.round(bird.size * 3));
        player.vx = pushDirection * push * scaleBoost;
        player.dy = -8 - (push - 12) * 0.5;
        player.x += pushDirection * (push * 0.9);
        bird.hitCooldown = 45;
        questState.birdHit = true;
        sfx.hit();
        vibrate(28);
        hudPop(playerCenterX, playerCenterY - 26, "\u041E\u0419", "#e63946");
      }
    }
    for (const platform of verticalPlatforms) {
      platform.previousY = platform.y;
      platform.phase = (platform.phase ?? 0) + (platform.speed ?? 0) * dt;
      platform.y = (platform.baseY ?? platform.y) + Math.sin(platform.phase ?? 0) * 76;
    }
    for (const platform of platforms) {
      if (platform.type === "broken" && platform.breaking && player.dy < 0 && player.y + 35 <= platform.y) {
        platform.falling = true;
        platform.vy = 0;
        fallingPlatforms.push(platform);
        platform.removeAfterBounce = true;
      }
      if (spikesActiveNow() && isSpiky(platform) && player.dy > 0 && player.x + 25 > platform.x && player.x + 10 < platform.x + platform.w && player.y + 35 > platform.y && player.y + 35 < platform.y + platform.h + player.dy) {
        hudPop(player.x + 15, 430, "\u0428\u0418\u041F!", "#e63946");
        sfx.fall();
        player.y = WORLD_H + 1;
        player.dy = 0;
        break;
      }
      if (player.dy > 0 && !platform.breaking && player.x + 25 > platform.x && player.x + 10 < platform.x + platform.w && player.y + 35 > platform.y && player.y + 35 < platform.y + platform.h + player.dy) {
        player.y = platform.y - 35;
        // Пружинка действует по всей длине платформы, а не только в точке подбора.
        if (platform.spring) {
          player.dy = -24 * perkSpringScale();
          squash = -0.3;
          questState.springUsed = true;
          sfx.spring();
          hudPop(platform.x + platform.w / 2, platform.y - 16, "\u041F\u0420\u042B\u0416\u041E\u041A", "#f5a623");
        } else {
          player.dy = -12.98 * perkBounceScale();
          squash = 0.14;
          sfx.land();
        }
        refillJumps();
        registerComboLanding();
        lastLandedPlatform = platform;
        if (platform.type === "broken") {
          platform.breaking = true;
          sfx.crack();
        }
        if (platform.type === "vanish" && platform.vanishT === void 0) {
          platform.vanishT = 1200;
        }
        if (platform.type === "sticky") {
          sfx.stickyLand();
          stickyStuck = { platform, presses: 0 };
          player.dy = 0;
          player.y = platform.y - 35;
        }
        if (!seenPlatformTypes.has(platform.type)) {
          seenPlatformTypes.add(platform.type);
          const hint = PLATFORM_HINTS[platform.type];
          if (hint) hudPop(player.x + 15, 470, hint.text, hint.color);
        }
      }
      if (platform.type === "vanish" && platform.vanishT !== void 0) {
        platform.vanishT -= dt * 16;
        if (!platform.vanishWarned && platform.vanishT <= 500) {
          platform.vanishWarned = true;
          sfx.vanishWarn();
        }
        if (platform.vanishT <= 0) {
          platform.removeAfterBounce = true;
          sfx.vanishGone();
        }
      }
      if (platform.type === "moving") {
        platform.x += platform.dir * dt;
        if (platform.x <= 0 || platform.x + platform.w >= WORLD_W) {
          platform.x = Math.max(0, Math.min(WORLD_W - platform.w, platform.x));
          platform.dir *= -1;
        }
        for (const spring of springs) {
          if (spring.owner === platform) {
            spring.x = platform.x + (spring.offsetX ?? 0);
          }
        }
      }
    }
    const previousPlayerBottom = player.y + 35 - player.dy * dt;
    const currentPlayerBottom = player.y + 35;
    for (const platform of verticalPlatforms) {
      const platformTopBefore = platform.previousY;
      const platformTopNow = platform.y;
      const crossedPlatform = previousPlayerBottom <= (platformTopBefore ?? 0) + platform.h && currentPlayerBottom >= platformTopNow;
      const overlapsPlatform = player.x + 25 > platform.x && player.x + 10 < platform.x + platform.w;
      if (player.dy > 0 && crossedPlatform && overlapsPlatform) {
        player.y = platformTopNow - 35;
        player.dy = -12.98 * perkBounceScale();
        refillJumps();
        squash = 0.14;
        sfx.land();
        registerComboLanding();
        break;
      }
    }
    removeWhere(platforms, (platform) => Boolean(platform.removeAfterBounce));
    const fallingGravity = 0.55;
    for (let i = fallingPlatforms.length - 1; i >= 0; i--) {
      const platform = fallingPlatforms[i];
      platform.vy = (platform.vy ?? 0) + fallingGravity * dt;
      platform.y += (platform.vy ?? 0) * dt;
      if (platform.y > 640) fallingPlatforms.splice(i, 1);
    }
    for (const spring of springs) {
      if (player.dy > 0 && player.x + 25 > spring.x && player.x < spring.x + 20 && player.y + 35 > spring.y && player.y + 35 < spring.y + 20) {
        player.dy = -24 * perkSpringScale();
        refillJumps();
        squash = -0.3;
        questState.springUsed = true;
        sfx.spring();
        registerComboLanding();
        hudPop(spring.x + 10, spring.y - 14, "\u041F\u0420\u042B\u0416\u041E\u041A", "#f5a623");
      }
    }
    updateCoins(dt);
    updateQuests(dt);
    const perkThreshold = Math.floor(player.score / PERK_SCORE_STEP) * PERK_SCORE_STEP;
    if (perkThreshold > 0 && perkThreshold > perkState.lastOfferScore) {
      perkState.lastOfferScore = perkThreshold;
      offerPerk();
    }
    updateRandomEvent();
    updateEventWorld(dt);
    updateHunter(dt);
    updateLifePickups();
    if (player.y < 250) {
      const diff = 250 - player.y;
      player.score += diff;
      dailyMax("height", Math.floor(player.score));
      player.y = 250;
      platforms.forEach((platform) => platform.y += diff);
      verticalPlatforms.forEach((platform) => {
        platform.y += diff;
        platform.baseY = (platform.baseY ?? 0) + diff;
        platform.previousY = (platform.previousY ?? 0) + diff;
      });
      springs.forEach((spring) => spring.y += diff);
      coins.forEach((coin) => coin.y += diff);
      lifePickups.forEach((life) => life.y += diff);
      jetpickups.forEach((jet) => jet.y += diff);
      birds.forEach((bird) => {
        bird.baseY += diff;
        bird.y += diff;
      });
    }
    removeWhere(platforms, (platform) => platform.y >= 650);
    removeWhere(verticalPlatforms, (platform) => (platform.baseY ?? 0) >= 650);
    removeWhere(springs, (spring) => spring.y >= 650 || spring.owner !== void 0 && !platforms.includes(spring.owner));
    removeWhere(coins, (coin) => coin.y >= 650);
    removeWhere(lifePickups, (life) => life.y >= 650);
    removeWhere(jetpickups, (jet) => jet.y >= 650);
    while (platforms.length < 8) {
      let lastY = 550;
      if (platforms.length) {
        lastY = platforms[0].y;
        for (let k = 1; k < platforms.length; k++) {
          if (platforms[k].y < lastY) lastY = platforms[k].y;
        }
      }
      const y = lastY - platformStep();
      const step = spawnTerrainStep(y);
      for (const p of step.platforms) platforms.push(p);
      for (const v of step.verticals) verticalPlatforms.push(v);
    }
    updateBoss();
    if (handleFall()) return;
    if (player.y > WORLD_H && lives > 0) {
      startScreenShake(3.5, 16);
      sfx.fall();
      vibrate(40);
      lives--;
      player.y = 500;
      stickyStuck = null;
      player.dy = -42;
      refillJumps();
    } else if (player.y > WORLD_H) {
      currentState = STATE.GAMEOVER;
      const finalScore = Math.floor(player.score);
      gameOverState.openedAt = performance.now();
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
  }