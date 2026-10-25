# Graph Report - src  (2026-10-25)

## Corpus Check
- 1 files · ~73,655 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 439 nodes · 1294 edges · 32 communities (23 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- HUD и индикаторы
- Забег: перки и награды
- Ядро и диалоги
- Арена и тела боссов
- Отображение объектов
- Дуэль: запуск и тренировка
- Рендер-цикл
- Биомы и фон
- Меню и жесты
- Дуэль: атаки боссов
- Звуки и эффекты
- Магазин платформ
- Гача и табы меню
- Ветер
- Арены дуэли
- Экран поражения
- Перки-таймеры
- Ник персонажа
- Современный FX
- Импорт прогресса
- События забега
- Экспорт прогресса
- Настройка чувствительности
- Счётчик перков
- Реролл перков
- Ежедневные задания
- Рамки аватаров
- Иконки перков
- Тилт-управление
- Карточки перков
- Настройки управления
- Звук интерфейса

## God Nodes (most connected - your core abstractions)
1. `roundedRect()` - 41 edges
2. `setFont()` - 38 edges
3. `trackedText()` - 38 edges
4. `update()` - 38 edges
5. `saveProgress()` - 22 edges
6. `draw()` - 22 edges
7. `drawHud()` - 19 edges
8. `trackedWidth()` - 18 edges
9. `duelDrawGlow()` - 17 edges
10. `drawPauseMenu()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `drawExtrasFront()` --calls--> `drawModernFx()`  [EXTRACTED]
  moryaka.js → moryaka.js  _Bridges community 18 → community 0_
- `resetAllProgress()` --calls--> `baseSkinId()`  [EXTRACTED]
  moryaka.js → moryaka.js  _Bridges community 4 → community 1_
- `drawPlatformShop()` --calls--> `platformSkinsOf()`  [EXTRACTED]
  moryaka.js → moryaka.js  _Bridges community 11 → community 0_
- `drawPerkIcon()` --calls--> `drawPerkIconShape()`  [EXTRACTED]
  moryaka.js → moryaka.js  _Bridges community 27 → community 0_
- `rerollPerks()` --calls--> `fmt()`  [EXTRACTED]
  moryaka.js → moryaka.js  _Bridges community 0 → community 1_

## Import Cycles
- None detected.

## Communities (32 total, 9 thin omitted)

### Community 0 - "HUD и индикаторы"
Cohesion: 0.10
Nodes (73): avatarName(), avatarUnlockLabel(), charWidth(), drawActivePerks(), drawAvatarCircle(), drawAvatarPlaceholder(), drawBoss(), drawBossTrain() (+65 more)

### Community 1 - "Забег: перки и награды"
Cohesion: 0.07
Nodes (57): applyPerk(), birdGrowth(), bossGravityScale(), bossHurtPlayer(), bossWin(), choosePerk(), closeResetDialog(), coinsPerLife() (+49 more)

### Community 2 - "Ядро и диалоги"
Cohesion: 0.05
Nodes (18): bossTrainBackRect(), bossTrainRows(), clipOutsideAvatar(), coinsWord(), drawGachaPanelGlow(), drawImageCircle(), drawPauseScrim(), eventTimerLabel() (+10 more)

### Community 3 - "Арена и тела боссов"
Cohesion: 0.10
Nodes (41): duelAuroraCloud(), duelAvalancheArmor(), duelBossBody(), duelBossBodyPath(), duelBossCracks(), duelBossCrown(), duelBossEye(), duelBossKind() (+33 more)

### Community 4 - "Отображение объектов"
Cohesion: 0.13
Nodes (30): baseSkinId(), cachedLinear(), cachedRadial(), darkenSkinHex(), drawBird(), drawCoin(), drawGroundShadow(), drawIcePlatform() (+22 more)

### Community 5 - "Дуэль: запуск и тренировка"
Cohesion: 0.08
Nodes (30): clearTouchInput(), duelBossDef(), duelCancel(), duelPerkShields(), duelStart(), exitTraining(), itemChanceScale(), makePlatform() (+22 more)

### Community 6 - "Рендер-цикл"
Cohesion: 0.13
Nodes (20): draw(), drawDangerVignette(), drawDarkness(), drawFpsDebug(), drawSnow(), drawWalls(), drawWindStreaks(), eventActive() (+12 more)

### Community 7 - "Биомы и фон"
Cohesion: 0.16
Nodes (17): biomeBlend(), biomeIndexForScore(), buildBiomeScene(), buildShareCard(), buildWinterBackground(), drawAurora(), drawBackground(), drawBackgroundVeil() (+9 more)

### Community 8 - "Меню и жесты"
Cohesion: 0.22
Nodes (16): canvasPoint(), cardAtPoint(), clampScroll(), drawMenuGrid(), finishMenuPointer(), gridHeight(), gridLeft(), gridRowH() (+8 more)

### Community 9 - "Дуэль: атаки боссов"
Cohesion: 0.18
Nodes (16): duelBossIndexClamp(), duelBossStyle(), duelBurst(), duelCheckHits(), duelCooldownMul(), duelFinish(), duelFireAttack(), duelPatterns() (+8 more)

### Community 10 - "Звуки и эффекты"
Cohesion: 0.14
Nodes (15): click(), coin(), crack(), fall(), hit(), initSound(), jump(), land() (+7 more)

### Community 11 - "Магазин платформ"
Cohesion: 0.17
Nodes (13): pickFrameOfTier(), platformChipRects(), platformCurrentType(), platformEquipSkin(), platformRectHit(), platformShopSelectType(), platformShopSpin(), platformShopTap() (+5 more)

### Community 12 - "Гача и табы меню"
Cohesion: 0.22
Nodes (10): clampGachaPicker(), finishMenuSwipe(), gachaOwnedList(), gachaPickerIndexAt(), gachaPickerMaxScroll(), gachaPickerRevealSelected(), menuSwipeTarget(), menuTabIndex() (+2 more)

### Community 13 - "Ветер"
Cohesion: 0.43
Nodes (7): applyWind(), updateWind(), windGustFrames(), windProgress(), windRestFrames(), windStrength(), windWarnFrames()

### Community 14 - "Арены дуэли"
Cohesion: 0.29
Nodes (7): duelBackdropFor(), duelBuildBackdrop(), duelFloe(), duelHazeBand(), duelRidgeFill(), duelRidgeRim(), duelShelfTop()

### Community 15 - "Экран поражения"
Cohesion: 0.40
Nodes (5): drawGameOver(), ensureGameOverCache(), gameOverCacheKey(), gameOverScrim(), makeScrimGradient()

### Community 16 - "Перки-таймеры"
Cohesion: 0.50
Nodes (4): activePerksWithRemaining(), drawEventTimer(), eventTimerY(), perkStackTop()

### Community 17 - "Ник персонажа"
Cohesion: 0.50
Nodes (4): closeNickDialog(), confirmNick(), normalizeNick(), saveNick()

### Community 18 - "Современный FX"
Cohesion: 0.67
Nodes (3): colorOf(), drawModernFx(), rnd()

### Community 19 - "Импорт прогресса"
Cohesion: 0.67
Nodes (3): decodeProgressCode(), importProgressCode(), saveDecode()

### Community 20 - "События забега"
Cohesion: 0.67
Nodes (3): eventDurationFor(), eventPowerFor(), spawnEvent()

### Community 21 - "Экспорт прогресса"
Cohesion: 0.67
Nodes (3): exportProgressCode(), openSaveDialog(), saveEncode()

### Community 22 - "Настройка чувствительности"
Cohesion: 0.67
Nodes (3): sensHitTest(), sensMinusZone(), sensPlusZone()

## Knowledge Gaps
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `roundedRect()` connect `HUD и индикаторы` to `Меню и жесты`, `Ядро и диалоги`, `Отображение объектов`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Should `HUD и индикаторы` be split into smaller, more focused modules?**
  _Cohesion score 0.0974124809741248 - nodes in this community are weakly interconnected._
- **Why does `update()` connect `Забег: перки и награды` to `Ядро и диалоги`, `Дуэль: запуск и тренировка`, `Рендер-цикл`, `Дуэль: атаки боссов`, `Ветер`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Should `Забег: перки и награды` be split into smaller, more focused modules?**
  _Cohesion score 0.07330827067669173 - nodes in this community are weakly interconnected._
- **Why does `setFont()` connect `HUD и индикаторы` to `Ядро и диалоги`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Should `Ядро и диалоги` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._
- **Should `Арена и тела боссов` be split into smaller, more focused modules?**
  _Cohesion score 0.0975609756097561 - nodes in this community are weakly interconnected._