# Глобальный рейтинг Moryaka Jump

## Можно ли на GitHub Pages?

**Нет, напрямую нельзя.** GitHub Pages — это статический хостинг: он отдаёт файлы, но не хранит данные и не принимает запросы на запись. Глобальная таблица результатов требует **внешнего хранилища**.

Клиент в игре уже готов: `LB_CONFIG.endpoint` в `index.html` + кнопка «Рейтинг» → вкладка ГЛОБАЛЬНО. Пока endpoint пуст — показывается локальный топ-5.

Как только вы укажете URL бэкенда — отправка и загрузка рейтинга заработают сами.

## Варианты бэкенда

| Вариант | Бесплатно | Сложность | Комментарий |
|---|---|---|---|
| **Cloudflare Workers + KV** | да (щедрый лимит) | низкая | готовый файл `leaderboard-worker.js` в репозитории |
| Supabase (Postgres + REST) | да (free tier) | низкая | публичный anon-key + RLS-политика |
| Firebase Firestore | да (Spark) | средняя | правила безопасности обязательны |
| Upstash Redis + API | да (free) | средняя | REST, простой storage |

## Быстрый старт (Cloudflare Worker)

1. Установи `wrangler`: `npm i -g wrangler` и `wrangler login`.
2. Создай проект и KV: `wrangler kv namespace create LB`.
3. В `wrangler.toml` привяжи namespace:
   ```toml
   name = "moryaka-leaderboard"
   main = "leaderboard-worker.js"
   compatibility_date = "2024-01-01"
   [[kv_namespaces]]
   binding = "LB"
   id = "<ID из шага 2>"
   ```
4. `wrangler deploy` — получишь URL вида `https://moryaka-leaderboard.<аккаунт>.workers.dev`.
5. В `index.html` укажи:
   ```js
   var LB_CONFIG = { endpoint: "https://...workers.dev", game: "moryaka-jump" };
   ```
6. Открой игру → «Рейтинг» → ГЛОБАЛЬНО. Сыграй забег — результат уйдёт автоматически.

## Безопасность (важно)

- Любой публичный клиентский рейтинг **можно подделать** (игра — один JS-файл). Полной защиты без серверной валидации забега нет.
- Минимальные меры: проверка score на сервере (диапазон), лимит длины имени, лимит записей, rate-limit по IP (Cloudflare WAF / Turnstile), подпись/секрет для продвинутого варианта.
- Не храните в репозитории приватные ключи. Ключ Supabase anon — публичный, но с включённой RLS-политикой «только insert на scores».

## Локальный рейтинг

Хранится в `localStorage["morjakaTopScores"]` (топ-20, показываются топ-5). Работает офлайн и без бэкенда.
