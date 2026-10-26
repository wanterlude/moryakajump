// Собирает sim.html: копию игры с тестовым хостом для массовых прогонов бота.
const fs = require("fs");

const path = require("path");

const root = path.resolve(__dirname, "..", "..");
let s = fs.readFileSync(path.join(root, "index.html"), "utf8");
const anchor = '  soundButton.addEventListener("click", () => toggleSound());';
if (!s.includes(anchor)) throw new Error("anchor not found");

const hook = String.raw`
  window.__TEST_BUILD = true;
  window.__sim = {
    stopRender() {
      try { if (typeof drawRafHandle !== "undefined" && drawRafHandle !== null) cancelAnimationFrame(drawRafHandle); } catch (e) {}
    },
    start() { startGame(); },
    step(dt) { update(dt == null ? 1 : dt); },
    jump() { return doDoubleJump(); },
    pickPerk(index) { try { perkState.offerReadyAt = 0; } catch (e) {} choosePerk(index || 0); },
    mouse(x) { mouseControl.inside = x != null; if (x != null) mouseControl.targetX = x; },
    state() {
      var shift = 0;
      try {
        if (wind.active) shift += wind.force * windStrength();
        if (eventActive("blizzard")) shift += Math.sin(performance.now() / 900) * 2.6;
      } catch (e) {}
      var inset = 0;
      try { inset = wallsInset(); } catch (e) {}
      return {
        state: currentState,
        score: player.score,
        lives: lives,
        px: player.x,
        py: player.y,
        vx: player.vx,
        dy: player.dy,
        jumps: jumpCharges,
        sticky: !!stickyStuck,
        offering: !!perkState.offering,
        cards: perkState.offerCards.map(function (c) { return { id: c.id, lives: c.lives || 0, rarity: c.rarity || "", mods: (c.mods || []).map(function (m) { return m[0]; }), coinMult: c.coins ? (c.coins.mult || 0) : 0 }; }),
        duel: typeof duelIsActive === "function" && duelIsActive(),
        duelLives: duelState.lives,
        duelShield: duelState.shield || 0,
        duelPx: duelState.px,
        duelInvuln: duelState.invuln,
        bossHp: duelState.bhp,
        bossMax: duelState.bmax,
        bossPhase: bossState.phase,
        bossIndex: bossState.index,
        telegraph: duelState.telegraph ? {
          attack: duelState.telegraph.attack || duelState.telegraph.kind,
          kind: duelState.telegraph.kind,
          left: duelState.telegraph.left,
          gapX: duelState.telegraph.gapX,
          aimX: duelState.telegraph.aimX,
          cols: duelState.telegraph.cols || [],
          side: duelState.telegraph.side
        } : null,
        bullets: duelState.bullets.map(function (b) { return { x: b.x, y: b.y, vx: b.vx || 0, vy: b.vy || 0, r: b.r, own: !!b.own, delay: b.delay || 0, grav: b.grav || 0, homing: b.homing || 0, life: b.life, kind: b.kind || "" }; }),
        platforms: platforms.map(function (p) { return { x: p.x, y: p.y, w: p.w, type: p.type, hole: !!p.hole, spiky: isSpiky(p) }; }),
        birds: birds.map(function (b) { return { x: b.x, y: b.y, vx: b.vx || 0, vy: b.vy || 0, r: b.size || 1, hitCd: b.hitCooldown || 0 }; }),
        pickups: lifePickups.map(function (l) { return { x: l.x, y: l.y }; }),
        coins: coins.map(function (c) { return { x: c.x, y: c.y }; }),
        runCoins: runCoins,
        spikes: spikesActiveNow(),
        eventKind: activeEvents.length ? activeEvents[0].kind : "",
        windActive: !!(typeof wind !== "undefined" && wind.active),
        windShift: shift,
        wallsInset: inset
      };
    }
  };

  function duelRisk(cx, bullets) {
    var risk = 0;
    for (var i = 0; i < bullets.length; i++) {
      var b = bullets[i];
      if (b.own) continue;
      if (b.delay > 24) continue;
      var delay = Math.max(0, b.delay || 0);
      var x = b.x, y = b.y, vx = b.vx, vy = b.vy;
      var sp = Math.hypot(vx, vy) || 1;
      for (var t = 0; t < 56; t++) {
        if (t < delay) continue;
        if (b.homing) {
          var dx = cx - x, dy = 514 - y;
          var d = Math.hypot(dx, dy) || 1;
          vx += (dx / d * sp - vx) * b.homing;
          vy += (dy / d * sp - vy) * b.homing;
        }
        if (b.grav) vy += b.grav;
        x += vx; y += vy;
        var px = cx, k = Math.min(1, (t + 1) * 7 / 60);
        var ddx = x - px, ddy = y - 514;
        if (ddx * ddx + ddy * ddy < (b.r + 12) * (b.r + 12)) {
          risk += (56 - t) + (delay ? 6 : 0);
          break;
        }
      }
    }
    return risk;
  }

  window.__simInit = function (runs, maxSteps) {
    window.__sim.stopRender();
    var m = {
      total: runs || 200,
      maxSteps: maxSteps || 200000,
      finished: 0,
      done: false,
      runs: [],
      run: null,
      lifeEvents: [],
      steps: 0,
      lastBirdStep: -9999,
      aimPrev: 200
    };
    var TYPES_PENALTY = { broken: 45, moving: 30, vanish: 34, ice: 14, sticky: 12, spring: -12 };

    m.newRun = function () {
      window.__sim.start();
      m.lifeEvents = [];
      m.steps = 0;
      m.lastBirdStep = -9999;
      m.run = { maxBoss: -1, maxScore: 0, birdHits: 0, events: new Set(), lastType: "", landings: 0, duelHits: [], shieldHits: 0, duelReached: false, bossMinHp: null, duelStartLives: null, coinsAtBoss: null };
    };

    m.bot = function () {
      var s = window.__sim.state();
      if (s.state === 3) return;
      if (s.offering) {
        var pick = 0, bestRank = -1;
        for (var ci = 0; ci < s.cards.length; ci++) {
          var c = s.cards[ci];
          var mods = c.mods || [];
          var rank = 5;
          if (c.id.indexOf("calm") === 0) rank = 40;
          if (c.id.indexOf("djump") === 0) rank = 55;
          if (c.id.indexOf("lifeDrop") === 0) rank = 70;
          if (mods.indexOf("guard") >= 0 || mods.indexOf("invuln") >= 0) rank = 60;
          if (c.id.indexOf("coinLife") === 0) rank = 80;
          if (c.mods.indexOf("magnet") >= 0) rank = 45;
          if (c.coinMult > 0) rank = 85;
          if (c.lives) rank = 100 + c.lives;
          if (rank > bestRank) { bestRank = rank; pick = ci; }
        }
        window.__sim.pickPerk(pick);
        return;
      }
      if (s.duel) {
        var cur = s.duelPx + 15;
        var planX = 200;
        var T = s.telegraph;
        if (T && T.left > 2) {
          var atk = T.attack || T.kind;
          if (atk === "sweep" || atk === "icewall" || atk === "hail" || atk === "rockslide" || atk === "tide") {
            planX = T.gapX;
          } else if (atk === "geyser" || atk === "shards" || atk === "bolt") {
            var cols = [T.aimX].concat(T.cols || []);
            var spots = [40, 90, 140, 190, 240, 290, 340, 370];
            var bestSpot = 200, bestD = -1;
            for (var sp = 0; sp < spots.length; sp++) {
              var md = 999;
              for (var cc = 0; cc < cols.length; cc++) md = Math.min(md, Math.abs(spots[sp] - cols[cc]));
              if (md > bestD) { bestD = md; bestSpot = spots[sp]; }
            }
            planX = bestSpot;
          } else if (atk === "lob" || atk === "aim" || atk === "tentacle") {
            planX = T.aimX < 200 ? T.aimX + 115 : T.aimX - 115;
          } else if (atk === "ring" || atk === "spiral" || atk === "cross") {
            planX = T.aimX < 200 ? T.aimX + 80 : T.aimX - 80;
          }
          planX = Math.max(20, Math.min(380, planX));
        }

        // MPC: откатываем состояние дуэли и проверяем, куда безопаснее идти.
        function snapDuel() {
          return {
            px: duelState.px, invuln: duelState.invuln, fireCd: duelState.fireCd,
            bx: duelState.bx, by: duelState.by, bhp: duelState.bhp, bmax: duelState.bmax,
            index: duelState.index, level: duelState.level, bossKind: duelState.bossKind,
            arena: duelState.arena, cooldown: duelState.cooldown, attackCount: duelState.attackCount,
            frame: duelState.frame, flash: duelState.flash, over: duelState.over,
            overLeft: duelState.overLeft, won: duelState.won,
            lives: duelState.lives, shield: duelState.shield || 0,
            telegraph: duelState.telegraph ? JSON.parse(JSON.stringify(duelState.telegraph)) : null,
            bullets: duelState.bullets.map(function (b) { return Object.assign({}, b); }),
            particles: duelState.particles.map(function (q) { return Object.assign({}, q); }),
            events: duelState.events.slice()
          };
        }
        function restoreDuel(sn) {
          duelState.px = sn.px; duelState.invuln = sn.invuln; duelState.fireCd = sn.fireCd;
          duelState.bx = sn.bx; duelState.by = sn.by; duelState.bhp = sn.bhp; duelState.bmax = sn.bmax;
          duelState.index = sn.index; duelState.level = sn.level; duelState.bossKind = sn.bossKind;
          duelState.arena = sn.arena; duelState.cooldown = sn.cooldown; duelState.attackCount = sn.attackCount;
          duelState.frame = sn.frame; duelState.flash = sn.flash; duelState.over = sn.over;
          duelState.overLeft = sn.overLeft; duelState.won = sn.won;
          duelState.lives = sn.lives; duelState.shield = sn.shield;
          duelState.telegraph = sn.telegraph ? JSON.parse(JSON.stringify(sn.telegraph)) : null;
          duelState.bullets = sn.bullets.map(function (b) { return Object.assign({}, b); });
          duelState.particles.length = 0;
          for (var pe = 0; pe < sn.particles.length; pe++) duelState.particles.push(Object.assign({}, sn.particles[pe]));
          duelState.events.length = 0;
          for (var ee = 0; ee < sn.events.length; ee++) duelState.events.push(sn.events[ee]);
        }
        var snapshot = snapDuel();
        var cands = [cur, cur - 30, cur + 30, cur - 70, cur + 70, cur - 120, cur + 120, cur - 180, cur + 180, 200, 60, 340, planX];
        var bestMove = null;
        for (var k2 = 0; k2 < cands.length; k2++) {
          var cx2 = Math.max(16, Math.min(384, cands[k2]));
          restoreDuel(snapshot);
          var hits = 0;
          for (var ft2 = 0; ft2 < 40; ft2++) {
            var lv0 = duelState.lives, sh0 = duelState.shield;
            duelUpdate(1, { left: false, right: false, targetX: cx2 });
            if (duelState.lives < lv0) hits += 3;
            else if (duelState.shield < sh0) hits += 1;
            if (duelState.over || duelState.lives <= 0) { hits += 60; break; }
          }
          var cost2 = hits * 100 + Math.abs(cx2 - cur) * 0.07 + Math.abs(cx2 - 200) * 0.01;
          if (Math.abs(cx2 - planX) <= 1) cost2 -= 18;
          if (!bestMove || cost2 < bestMove.cost) bestMove = { x: cx2, cost: cost2 };
        }
        restoreDuel(snapshot);
        m.aimPrev = bestMove.x;
        window.__sim.mouse(bestMove.x);
        return;
      }

      var ccx = s.px + 15, ccy = s.py + 15, avoid = 0;
      for (var j = 0; j < s.birds.length; j++) {
        var bb = s.birds[j];
        var bfx = bb.x + (bb.vx || 0) * 20, bfy = bb.y + (bb.vy || 0) * 20;
        var ddx = ccx - bfx, ddy = ccy - bfy;
        if (Math.abs(ddy) < 110 && Math.abs(ddx) < 95) avoid += Math.sign(ddx || 1) * (95 - Math.abs(ddx));
      }

      var aim = null;
      if (s.lives < 5 && s.coins.length) {
        var coinBest = null;
        for (var cq = 0; cq < s.coins.length; cq++) {
          var cqq = s.coins[cq];
          var cdy = s.py - cqq.y;
          if (cdy < -30 || cdy > 170) continue;
          var cdx = Math.abs(cqq.x - ccx);
          if (cdx > 150) continue;
          var ccost = cdx + Math.abs(cdy) * 0.5;
          if (!coinBest || ccost < coinBest.cost) coinBest = { x: cqq.x, cost: ccost };
        }
        if (coinBest) aim = coinBest.x;
      }
      if (aim == null && s.lives < 2 && s.pickups.length) {
        var bestPick = null;
        for (var pk = 0; pk < s.pickups.length; pk++) {
          var pu = s.pickups[pk];
          var puDy = s.py - pu.y;
          if (puDy < -30 || puDy > 260) continue;
          var puDx = Math.abs(pu.x + 10 - ccx);
          if (!bestPick || puDx + Math.abs(puDy) * 0.3 < bestPick.cost) bestPick = { x: pu.x + 10, cost: puDx + Math.abs(puDy) * 0.3 };
        }
        if (bestPick) aim = bestPick.x;
      }
      if (aim == null) {
        var bestPlat = null;
        for (var pi = 0; pi < s.platforms.length; pi++) {
          var p = s.platforms[pi];
          if (p.hole) continue;
          if (s.spikes && p.spiky) continue;
          var gap = s.py - p.y;
          if (gap < 6 || gap > 150) continue;
          var center = p.x + p.w / 2;
          var disc = 12.98 * 12.98 - 2 * 0.5464 * gap;
          if (disc < 0) continue;
          var upT = (12.98 - Math.sqrt(disc)) / 0.5464;
          var reach = 7 * upT + 30;
          var dxp = Math.abs(center - ccx);
          if (dxp > reach) continue;
          var riskMul = s.lives > 0 ? 1.8 : 1;
          var cost = gap * 0.42 + dxp * 0.7 + (TYPES_PENALTY[p.type] || 0) * riskMul;
          if (s.lives < 5 && s.coins.length) {
            var coinBonus = 0;
            for (var cn = 0; cn < s.coins.length; cn++) {
              var co = s.coins[cn];
              if (co.x > p.x - 10 && co.x < p.x + p.w + 10 && co.y < p.y + 10 && co.y > p.y - 90) coinBonus += 16;
            }
            cost -= Math.min(45, coinBonus);
          }
          if (!bestPlat || cost < bestPlat.cost) bestPlat = { x: center, cost: cost };
        }
        if (!bestPlat) {
          for (var m2 = 0; m2 < s.platforms.length; m2++) {
            var q = s.platforms[m2];
            if (q.hole || (s.spikes && q.spiky)) continue;
            if (q.y < s.py + 20) continue;
            var qc = q.x + q.w / 2;
            var qd = Math.abs(qc - ccx);
            if (!bestPlat || qd < bestPlat.cost) bestPlat = { x: qc, cost: qd };
          }
        }
        aim = bestPlat ? bestPlat.x : 200;
      }

      if (avoid) aim = ccx + Math.sign(avoid) * 120;
      aim -= (s.windShift || 0) * 26;
      var minX = 14 + (s.wallsInset || 0), maxX = 386 - (s.wallsInset || 0);
      window.__sim.mouse(Math.max(minX, Math.min(maxX, aim)));

      if (s.sticky) window.__sim.jump();
      else if (s.jumps > 0 && s.dy > 2) {
        var safeBelow = false;
        for (var bp = 0; bp < s.platforms.length; bp++) {
          var bpl = s.platforms[bp];
          if (bpl.hole || (s.spikes && bpl.spiky)) continue;
          if (bpl.y > s.py + 5 && bpl.y < s.py + 175 && ccx > bpl.x - 18 && ccx < bpl.x + bpl.w + 18) { safeBelow = true; break; }
        }
        if (!safeBelow || s.py > 470) window.__sim.jump();
      }
    };

    function attribute(before, after, birdHit) {
      if (after.duel || before.duel) return "duel";
      if (after.bossPhase === "fight" || before.bossPhase === "fight") return "boss";
      if (after.spikes) return "spikes";
      var nearX = before.px;
      var hole = after.platforms.some(function (p) { return p.hole && nearX + 25 > p.x && nearX + 10 < p.x + p.w; });
      if (hole) return "icehole";
      if (birdHit) return "birds";
      return "fall";
    }

    m.tick = function () {
      var before = window.__sim.state();
      var birdBefore = before.birds.some(function (b) { return b.hitCd > 40; });
      window.__sim.step(1);
      var after = window.__sim.state();
      m.steps++;
      if (after.score > m.run.maxScore) m.run.maxScore = after.score;
      if ((after.bossPhase === "warn" || after.bossPhase === "fight") && after.bossIndex > m.run.maxBoss) m.run.maxBoss = after.bossIndex;
      if (after.eventKind) m.run.events.add(after.eventKind);
      if (before.dy > 0 && after.dy < 0) {
        var feet = after.py + 35;
        for (var lp = 0; lp < after.platforms.length; lp++) {
          var pl = after.platforms[lp];
          if (Math.abs(pl.y - feet) <= 3 && after.px + 25 > pl.x && after.px + 10 < pl.x + pl.w) {
            m.run.lastType = pl.type || "normal";
            m.run.landings++;
            break;
          }
        }
      }
      var birdAfter = after.birds.some(function (b) { return b.hitCd > 40; });
      if (birdAfter && !birdBefore) { m.run.birdHits++; m.lastBirdStep = m.steps; }
      var birdRecent = (m.steps - m.lastBirdStep) < 110;
      if (after.lives < before.lives && !before.duel) m.lifeEvents.push(attribute(before, after, birdRecent));
      if (!before.duel && after.duel) { m.run.duelStartLives = after.duelLives; m.run.coinsAtBoss = before.runCoins; }
      if (before.duel) {
        m.run.duelReached = true;
        if (before.bossMax && (m.run.bossMinHp == null || before.bossHp < m.run.bossMinHp)) m.run.bossMinHp = before.bossHp;
        if (after.duelShield < before.duelShield) m.run.shieldHits++;
        if (after.duelLives < before.duelLives) {
          m.lifeEvents.push("duel");
          var nearKind = "?";
          var nd = 1e9;
          var pxc = before.duelPx + 15;
          for (var hb = 0; hb < before.bullets.length; hb++) {
            var hbu = before.bullets[hb];
            if (hbu.own) continue;
            var hd = Math.hypot(hbu.x - pxc, hbu.y - 514);
            if (hd < nd) { nd = hd; nearKind = hbu.kind; }
          }
          m.run.duelHits.push(nearKind);
        }
      }
      if (after.state === 3 || m.steps >= m.maxSteps) {
        var counts = {};
        for (var i = 0; i < m.lifeEvents.length; i++) counts[m.lifeEvents[i]] = (counts[m.lifeEvents[i]] || 0) + 1;
        var nearPlat = null;
        for (var ppi = 0; ppi < after.platforms.length; ppi++) {
          var pp = after.platforms[ppi];
          var gapY = Math.abs(before.py + 35 - pp.y);
          if (!nearPlat || gapY < nearPlat.gap) nearPlat = { gap: gapY, type: pp.type };
        }
        m.runs.push({
          score: Math.round(m.run.maxScore),
          cause: attribute(before, after, birdRecent),
          lifeCauses: counts,
          boss: m.run.maxBoss,
          steps: m.steps,
          livesLost: m.lifeEvents.length,
          birdHits: m.run.birdHits,
          events: Array.from(m.run.events),
          deathY: Math.round(before.py),
          lastType: m.run.lastType || "",
          landings: m.run.landings || 0,
          wind: !!before.windActive,
          platGap: Math.round(nearPlat ? nearPlat.gap : -1),
          duelReached: m.run.duelReached,
          duelHits: m.run.duelHits,
          shieldHits: m.run.shieldHits,
          bossMinHp: m.run.bossMinHp,
          duelStartLives: m.run.duelStartLives,
          coinsAtBoss: m.run.coinsAtBoss
        });
        m.finished++;
        m.run = null;
      }
    };

    m.newRun();
    window.__simMachine = m;
    return { total: m.total };
  };

  window.__simDuelTest = function (index, lives, maxSteps) {
    window.__sim.start();
    bossState.index = index;
    bossState.phase = "fight";
    duelStart(index, lives, 185);
    var m = window.__simMachine;
    var steps = 0, startHp = duelState.bhp, startLives = duelState.lives, hits = [];
    while (duelIsActive() && steps < (maxSteps || 5000)) {
      if (m && m.bot) m.bot(); else window.__sim.mouse(200);
      var before = { lives: duelState.lives, shield: duelState.shield, bullets: duelState.bullets.map(function (b) { return { x: b.x, y: b.y, r: b.r, kind: b.kind || "?" }; }), t: duelState.telegraph ? (duelState.telegraph.attack || duelState.telegraph.kind) : "" };
      window.__sim.step(1);
      steps++;
      if (duelState.lives < before.lives || duelState.shield < before.shield) {
        var bestK = "?", bestD = 1e9, px = duelState.px + 15;
        for (var i = 0; i < before.bullets.length; i++) {
          var bb = before.bullets[i];
          var d = Math.hypot(bb.x - px, bb.y - 514);
          if (d < bestD) { bestD = d; bestK = bb.kind; }
        }
        hits.push({ kind: bestK, atk: before.t, shield: before.shield > 0, t: steps });
      }
    }
    return { steps: steps, won: duelState.won, bossLeft: duelState.bhp, bossMax: duelState.bmax, livesLeft: duelState.lives, startLives: startLives, startHp: startHp, hits: hits };
  };

  window.__simChunk = function (budgetMs) {
    var m = window.__simMachine;
    if (!m) return { error: "not initialized" };
    var t0 = performance.now();
    while (!m.done && performance.now() - t0 < (budgetMs || 20000)) {
      if (m.finished >= m.total) { m.done = true; break; }
      if (!m.run) m.newRun();
      m.bot();
      m.tick();
    }
    return { finished: m.finished, total: m.total, done: m.done };
  };
`;

s = s.replace(anchor, hook + "\n" + anchor);
fs.writeFileSync(path.join(root, "sim.html"), s);
console.log("sim build written", s.length);
