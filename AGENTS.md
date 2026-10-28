# Moryaka Jump — инструкции для агентов

Зимний бесконечный платформер на Canvas 2D. Живёт в одном HTML-файле: без сборки,
сервера и интернета. UI и комментарии — по-русски.

## Главное правило: `index.html` — собранный артефакт

`index.html` (≈19 тыс. строк, 727 КБ) — **не исходник, а сборка** из `src/`.
Большая часть кода уже живёт в `src/game/*.ts` (модули) и `src/chunks/*.js`
(куски в общей области видимости); остальное — оболочка страницы. Внутри
`index.html` сохранились маркеры исходных модулей:

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

Исторически `src/` в репозитории не было: архив тега `v1.0.33` содержит только
бандл. Каталог восстановлен уже в этой работе — см. разделы ниже. Правки делаются
в файлах `src/`, затем `node tools/build-src.js && node tools/build-chunks.js`.

## Что нельзя делать с бандлом

- **Не запускать автоформаттеры** (prettier, eslint --fix): переформатируют 18 тыс.
  строк и уничтожат историю правок.
- **Не менять переводы строк**: в репозитории LF; git настроен на автоконверсию,
  иначе получите диффы на весь файл.
- **Не переименовывать** функции и переменные «для красоты»: на них завязаны
  глобальные ссылки внутри IIFE и тестовые сборки.
- Код — одна IIFE (`(() => { "use strict"; … })()`), 494 функции в общей области
  видимости. Новая функция видна всем, но наружу ничего не экспортируется.

## Модули в src/

Часть кода вынесена из бандла в TypeScript и вставляется в `index.html` сборкой:

```
node tools/build-src.js           # пересобрать вставку
node tools/build-src.js --check   # сверить (это делает и check.js)
npm test                          # тесты модулей
npx tsc --noEmit                  # типы
```

Внутри `index.html` вставка обрамлена маркерами «src: начало вставки» и
«src: конец вставки» — править между ними нельзя, перезапишется. Бандл остаётся
единственным артефактом: exe, варианты и инструменты про `src/` не знают.
| Модуль | Что внутри |
|---|---|
| `src/game/frames.ts` | каталог рамок: базовые, три набора дополнений, итоговый список |
| `src/game/content.ts` | биомы, птицы, задания, редкости и 48 перков |
| `src/game/perk-icons.ts` | иконки перков и глиф щита |
| `src/game/platform-skins.ts` | типы платформ, подписи и 66 скинов |
| `src/game/field-layout.ts` | геометрия магнитного поля |
| `src/game/spikes-layout.ts` | раскладка шипов |
| `src/game/daily-date.ts` | ключ даты и хеш ежедневки |
| `src/game/winter.ts` | палитра зимы |
| `src/game/hud-colors.ts` | цвета HUD |
| `src/game/color.ts` | hex → rgba |
| `src/game/format.ts` | форматирование чисел |

В бандле кода почти не осталось: всё, что не вынесено в модули, лежит кусками в
`src/chunks/` и вставляется в `index.html` дословно — см. следующий раздел.
`fx` попал именно туда: вокруг него в бандле осталась `__export`-обёртка старого
сборщика, поэтому в модуль он не переносится, а в кусок — спокойно.

Порядок выноса очередного модуля — в `src/README.md`.

## Крупные куски в src/chunks/

Ядро и дуэли боссов вынесены из бандла файлами, которые вставляются **дословно**,
без отдельной области видимости:

```
node tools/build-chunks.js           # пересобрать куски в index.html
node tools/build-chunks.js --check   # сверить (это делает и check.js)
```

| Файл | Что внутри |
|---|---|
| `src/chunks/fx.js` | эффекты рамок: таблица, цвет, отрисовка |
| `src/chunks/boss-duel/*.js` | 8 частей: логика дуэли, арены, по файлу на босса, отрисовка |
| `src/chunks/game/*.js` | 5 частей: канвас и фон, ежедневка, ветер и перки, звук, события |

В `index.html` каждый кусок обрамлён маркерами «chunk NAME: начало» и «конец».
Править между маркерами бессмысленно — перезапишется сборкой; правьте файл куска.

Отличие от `src/game/*.ts`: там настоящие модули со своей областью видимости и
типами, сюда же код попадает как есть, поэтому глобальные `ctx`, `player`,
`bossState` продолжают работать.

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
поэтому GUI здесь не запускается — если нужен настоящий canvas, откройте
`sim.html` в браузере и вызывайте `__simInit` / `__simChunk` из консоли.

## Скриншоты интерфейса

```
node tools/shot.js --tabs=avatars,shop,platforms
node tools/shot.js --tabs=profile,train --scale=1   # тяжёлые оверлеи только при scale=1
```

Снимает экраны в headless Chrome/Edge в `tools/shot-out/` (каталог в .gitignore).
Работает на копии `index.html` во временной папке, игра не меняется. В песочнице
DSH Chrome требует доступа к именованным каналам — без него падает на mojo.

### Варианты HUD

```
node tools/shot.js --tabs=hud --hud=2 --label=v2 --scale=2   # версия 1..4
```

Кадр фиксирует счёт 1 919 и рекорд 83 747, чтобы версии сравнивались один к одному.
Сами версии лежат в `tools/hud-variants.js` (только предпросмотр, игра их не видит).

### Опасности и превью пружин

```
node tools/shot.js --tabs=play --hazard=spikes --label=spikes
node tools/shot.js --tabs=play --springs=1 --width=760 --height=1140 --scale=2
```

`--hazard=spikes` собирает сцену из четырёх платформ и включает шипы.

`--springs=1` рисует лист из десяти вариантов внешнего вида пружинных платформ
(`tools/spring-variants.js`) на отдельном canvas поверх страницы: игровой цикл его
не затирает. Сам лист в игру не попадает — это только превью для выбора.

### Golden-тесты отрисовки

```
node tools/golden.js            # сверить с эталонами
node tools/golden.js --update   # перезаписать эталоны
```

Грузит бандл в Node через `tools/sim/dom-shim.js` (без браузера), замораживает
`performance.now` и `Math.random`, подменяет контекст канваса записывающим и
сравнивает хеш списка вызовов в `tools/golden/calls.json`. Сдвиг подписи на 1 px
даёт другой хеш, поэтому визуальные регрессии видны без глаз.

Пиксельный хеш здесь намеренно не используется: в headless шрифты и масштаб
канваса дают разные пиксели для одной и той же разметки.

## Сборка приложения (WebView2)

```
node desktop-webview2/build.js     # нужен .NET SDK 8+
```

Своё окно без Chromium: `desktop-webview2/` — WinForms на **.NET Framework 4.8**
(он уже в Windows, игроку ничего доставлять не нужно), движок — системный
WebView2 Runtime. Сборка даёт **один самодостаточный exe** — рядом ничего не нужно:
`Moryaka-Jump.exe` ~2.25 МБ. Внутри: код, иконка, сборки WebView2 (грузятся из
памяти через `AssemblyResolve`), нативный `WebView2Loader.dll` (распаковывается
в `%LOCALAPPDATA%\MoryakaJump\bin` и подключается `SetLoaderDllFolderPath`) и
файлы игры (HTML в gzip, отдаются из памяти через `WebResourceRequested` на
виртуальный хост `https://game.local`).

При первом запуске `Program.Main` проверяет `CoreWebView2Environment.GetAvailableBrowserVersionString()`.
Если рантайма нет, открывается окно установки: прогресс скачивания официального
бутстраппера (≈1.9 МБ, `go.microsoft.com/fwlink/p/?LinkId=2124703`) с процентами
и объёмом, затем «Устанавливаю…» со счётчиком секунд (сам установщик прогресса не
отдаёт) и запрос UAC, затем итог с кнопкой «Запустить игру».
`Moryaka-Jump.exe --force-runtime-check` показывает это окно даже при готовом
рантайме — так проверяется интерфейс. Игра грузится с виртуального хоста
`https://game.local` — так localStorage с рекордами ведёт себя как на обычном
сайте, а не как на `file://`.

## Релиз

Единственная сборка — `desktop-webview2`.

1. Поднять `GAME_VERSION` в `index.html` (строка ~10196).
2. Добавить запись в `Changelog` сверху: `[Версия X.Y.Z]` и строки `> пункт`.
3. Обновить бейдж версии в `README.md`.
4. `node tools/build-variants.js` — синхронизировать варианты.
5. `node tools/check.js` — версии и парсинг.
6. `node desktop-webview2/build.js` — соберёт `desktop-webview2/build-out/Moryaka-Jump-<версия>.exe`.
7. `gh release create v<версия> <exe> --title "Moryaka Jump <версия>" --notes-file <(sed -n '/^\[Версия <версия>\]/,/^\[Версия /p' Changelog)`
   — заметки берутся из `Changelog`.

## Соглашения

- UTF-8 без BOM; в репозитории LF. Русские тексты — обычными символами
  (в бандле они уже частично как `\uXXXX` — это результат минификации, так и надо).
- localStorage-ключи: `morjakaStats`, `morjakaTopScores`, `morjakaSound`,
  `morjakaVolume`, `morjakaVib`, `morjakaKeySens`, `morjakaMouseSens`,
  `morjakaSchema`, `morjakaNick`, `morjakaSelectedFrame`, `morjakaTutorialDone`,
  `morjakaSideLbCollapsed`, `morjakaSideSetCollapsed`.
- Глобальный рейтинг: `LB_CONFIG` в `index.html` (~строка 17722), Firebase
  Realtime Database, ветка `/scores/moryaka-jump`.
- `1.jpg`–`27.jpg` — аватары, `fon.jpg` — фон. Они лежат рядом с игрой;
  `imageSource()` вернёт файл, а `share_avatar.jpg` вшит как data-URI.

## Перед коммитом

```
node tools/check.js
```

Проверяет три вещи: производные сборки совпадают с `index.html`, JS-блок парсится,
версия одинакова в `index.html`, `README.md` и `Changelog`.
Затем `node tools/golden.js` — сверка отрисовки с эталонами.
Дальше — ручная проверка в браузере: меню, забег, дуэль, мобильная раскладка.
При правках баланса — прогон симулятора и сравнение с `tools/sim/README.md`.

## Мусор, который не коммитим

`sim.html`, `tools/sim/last-run.*`, `graphify-out/`, `.dshwolf/`,
`desktop-webview2/bin/`, `desktop-webview2/obj/`, `desktop-webview2/build-out/`,
`desktop-webview2/staging/`.
