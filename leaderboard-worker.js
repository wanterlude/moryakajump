// Глобальный рейтинг Moryaka Jump — пример Cloudflare Worker (бесплатный тариф).
// Хранилище: Cloudflare KV (привязка с именем LB).
// Деплой: см. LEADERBOARD.md. После деплоя вставьте URL воркера в LB_CONFIG.endpoint в index.html.
//
// API:
//   GET  ?game=moryaka-jump&limit=5  -> { scores: [{name, score}] }
//   POST  { game, name, score }      -> { ok: true }

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const url = new URL(request.url);
    const game = String(url.searchParams.get("game") || "moryaka-jump").slice(0, 40);
    const key = "top:" + game;

    if (request.method === "GET") {
      const raw = await env.LB.get(key);
      const list = raw ? JSON.parse(raw) : [];
      const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit")) || 5));
      return new Response(JSON.stringify({ scores: list.slice(0, limit) }), { headers: cors });
    }

    if (request.method === "POST") {
      let body;
      try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: "bad json" }), { status: 400, headers: cors }); }
      const name = String(body.name || "Игрок").replace(/[<>]/g, "").slice(0, 20) || "Игрок";
      const score = Math.floor(Number(body.score));
      if (!Number.isFinite(score) || score <= 0 || score > 100000000) {
        return new Response(JSON.stringify({ error: "bad score" }), { status: 400, headers: cors });
      }
      const raw = await env.LB.get(key);
      const list = raw ? JSON.parse(raw) : [];
      list.push({ name, score, t: Date.now() });
      list.sort((a, b) => b.score - a.score);
      await env.LB.put(key, JSON.stringify(list.slice(0, 50)));
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405, headers: cors });
  }
};
