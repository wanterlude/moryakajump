# Moryaka Jump — инструкции для агентов

Зимний бесконечный платформер на Canvas 2D. Живёт в одном HTML-файле: без сборки,
сервера и интернета. UI и комментарии — по-русски.

## Главное правило: `index.html` — источник правды

`index.html` (18 359 строк, 775 КБ) — **не исходник, а собранный бандл**. Внутри
остались маркеры модулей, по которым он собран:

| Строка | Модуль |
|---|---|
| 10–211 | CSS |
| 213–373 | разметка (боковые панели, тулбар, диалоги) |
| 374 | инлайн data-URI (`window.__INLINED_IMAGES`, только `share_avatar.jpg`) |
| 378 | `src/fx.ts` — эффекты рамок |
| 653 | `src/platform_skins.ts` |
| 763 | `src/icons.ts` |
| 1142 | `src/util.ts` |
| 1151 | `src/boss_duel.ts` — арены, тела боссов, дуэли (самый большой кусок после game) |
| 6805 | `src/frames_extra.ts` |
| 6869 | `src/frames_extra2.ts` |
| 6943 | `src/frames_extra3.ts` |
| 7007 | `src/content.ts` — палитра, рамки, перки, тосты |
| 7600–18357 | `src/game.ts` — цикл, физика, меню, HUD, рейтинг |

Каталога `src/` нет ни в репозитории, ни в истории (108 коммитов) — проверено.
Архив тега `v1.0.33` тоже содержит только бандл. Не ищите исходники: правки
делаются точечно прямо в `index.html`.

## Что нельзя делать с бандлом

- **Не запускать автоформаттеры** (prettier, eslint --fix): переформатируют 18 тыс.
  строк и уничтожат историю правок.
- **Не менять переводы строк**: в репозитории LF; git настроен на автоконверсию,
  иначе получите диффы на весь файл.
- **Не переименовывать** функции и переменные «для красоты»: на них завязаны
  глобальные ссылки внутри IIFE и тестовые сборки.
- Код — одна IIFE (`(() => { "use strict"; … })()`), 494 функции в общей области
  видимости. Новая функция видна всем, но наружу ничего не экспортируется.

## Производные сборки — только через скрипт

```
node tools/build-variants.js          # пересобрать варианты
node tools/build-variants.js --check  # проверить, что файлы не разъехались
```

| Файл | Отличие от `index.html` |
|---|---|
| `test-boss.html` | + панель выбора босса и числа жизней |
| `test-frames.html` | + галерея всех 211 рамок |
| `ui-preview.html` | версия `1.0.33-ui` (превью для UI-аудита) |

Блоки вставки лежат в `tools/variants/*.js.txt` и вставляются после строки
`setTimeout(maybeShowTutorial, 500);`. **Править варианты руками нельзя** — при
следующей сборке правка исчезнет. Меняйте `index.html` и пересобирайте.

## Симулятор забегов

```
node tools/sim/make_sim.js                        # собрать sim.html из index.html
node tools/sim/run-node.js --runs=500             # ~3,2 забега/с, 500 забегов ≈ 2,5 мин
node tools/sim/run-node.js --runs=5000 --steps=600000   # ~26 мин
node tools/sim/run-node.js --runs=300 --skill=0.7       # бот с человеческими ошибками
```

`--skill` (0…1) включает модель ошибок: реже пересматривает решение, дрожание
прицела, промахи по прыжку. На навыке 1.0 дуэли выглядят безобидно (97% без
попаданий) — баланс дуэлей мерить на 0.6–0.8.

`run-node.js` грузит игру в обычном Node через `tools/sim/dom-shim.js`
(минимальные заглушки DOM/canvas, без единой зависимости) и пишет
`tools/sim/last-run.json` + `last-run.md` со сводкой: перцентили, причины смерти,
события, дуэли, последняя платформа. В песочнице GUI-процессы не стартуют,
поэтому Electron здесь не используется — если нужен настоящий canvas, откройте
`sim.html` в браузере и вызывайте `__simInit` / `__simChunk` из консоли.

## Скриншоты интерфейса

```
node tools/shot.js --tabs=avatars,shop,platforms
node tools/shot.js --tabs=profile,train --scale=1   # тяжёлые оверлеи только при scale=1
```

Снимает экраны в headless Chrome/Edge в `tools/shot-out/` (каталог в .gitignore).
Работает на копии `index.html` во временной папке, игра не меняется. В песочнице
DSH Chrome требует доступа к именованным каналам — без него падает на mojo.

## Релиз

1. Поднять `GAME_VERSION` в `index.html` (строка ~10196).
2. Добавить запись в `Changelog` сверху: `[Версия X.Y.Z]` и строки `> пункт`.
3. Обновить бейдж версии в `README.md`.
4. `node tools/build-variants.js` — синхронизировать варианты.
5. `cd desktop && npm install && npm run release` — соберёт exe и опубликует
   релиз через `gh` (нужен авторизованный GitHub CLI). `prepare.js` сам
   подставит версию в `desktop/package.json`, `release.js` возьмёт заметки
   из `Changelog`.

Ручное редактирование `desktop/index.html` бессмысленно: `prepare.js` копирует
туда корневой `index.html`.

## Соглашения

- UTF-8 без BOM; в репозитории LF. Русские тексты — обычными символами
  (в бандле они уже частично как `\uXXXX` — это результат минификации, так и надо).
- localStorage-ключи: `morjakaStats`, `morjakaTopScores`, `morjakaSound`,
  `morjakaVolume`, `morjakaVib`, `morjakaKeySens`, `morjakaMouseSens`,
  `morjakaSchema`, `morjakaNick`, `morjakaSelectedFrame`, `morjakaTutorialDone`,
  `morjakaSideLbCollapsed`, `morjakaSideSetCollapsed`.
- Глобальный рейтинг: `LB_CONFIG` в `index.html` (~строка 17722), Firebase
  Realtime Database, ветка `/scores/moryaka-jump`. В Electron сеть ограничена
  именно этим доменом (`desktop/main.js`).
- `1.jpg`–`27.jpg` — аватары, `fon.jpg` — фон. Они лежат рядом с игрой;
  `imageSource()` вернёт файл, а `share_avatar.jpg` вшит как data-URI.

## Перед коммитом

```
node tools/check.js
```

Проверяет три вещи: производные сборки совпадают с `index.html`, JS-блок парсится,
версия одинакова в `index.html`, `README.md`, `desktop/package.json` и `Changelog`.
Дальше — ручная проверка в браузере: меню, забег, дуэль, мобильная раскладка.
При правках баланса — прогон симулятора и сравнение с `tools/sim/README.md`.

## Мусор, который не коммитим

`sim.html`, `tools/sim/last-run.*`, `graphify-out/`, `.dshwolf/`,
`desktop/node_modules/`, `desktop/dist/`, `desktop/build-out/`, `desktop/index.html`,
`desktop/*.jpg`.
