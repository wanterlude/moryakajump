# Глобальный рейтинг Moryaka Jump

## Можно ли на GitHub Pages?

**Нет, напрямую нельзя.** GitHub Pages — это статический хостинг: он отдаёт файлы, но не хранит данные и не принимает запросы на запись. Глобальная таблица результатов требует **внешнего хранилища**.

Клиент в игре уже готов: `LB_CONFIG` в `index.html` (провайдеры `supabase` и `worker`) + кнопка «Рейтинг» → вкладка ГЛОБАЛЬНО. Пока ключи не заполнены — показывается подсказка и локальный топ-5.

Как только вы укажете URL бэкенда — отправка и загрузка рейтинга заработают сами.

## Вариант 1: Supabase (подключён)

Рейтинг уже работает на проекте `caguxojvubfpbrlxggek`. В `index.html` прописаны Project URL и **publishable** key (он публичный по дизайну Supabase). Секретный ключ (`sb_secret_…`) в репозитории не хранится и в клиент не попадает — он нужен только для администрирования.

Клиент поддерживает Supabase через `LB_CONFIG.provider = "supabase"`.

1. Создай проект на [supabase.com](https://supabase.com) (Free tier).
2. Открой **SQL Editor → New query**, вставь содержимое `supabase-schema.sql` и нажми **Run**.
3. Перейди в **Project Settings → API** и скопируй:
   - **Project URL** (например `https://abcd1234.supabase.co`);
   - **anon public** ключ.
4. В `index.html` заполни:
   ```js
   var LB_CONFIG = {
     provider: "supabase",
     url: "https://abcd1234.supabase.co",
     anonKey: "eyJhbGciOi...",
     endpoint: "",
     game: "moryaka-jump"
   };
   ```
5. Открой игру → «Рейтинг» → **ГЛОБАЛЬНО**. Сыграй забег — результат отправится автоматически.

CORS в Supabase включён по умолчанию для REST API. RLS-политики из скрипта разрешают анонимам только `select` и `insert` (без update/delete).

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
