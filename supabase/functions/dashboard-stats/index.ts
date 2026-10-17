// ============================================================
// YoSoy222 — Edge Function: dashboard-stats
//
// Lectura autenticada de agregados de analítica para el panel
// privado. Reemplaza el SELECT directo con la clave anon (que
// requería exponer la tabla) por validación de credenciales
// SERVER-SIDE + service_role.
//
// Seguridad:
// - Valida usuario+contraseña contra hash SHA-256 salted guardado
//   en el secret DASH_AUTH_HASH (formato usuario:contraseña:salt,
//   igual que computeHash() en js/dashboard.js).
// - Nunca usa la clave anon para leer: usa SERVICE_ROLE, que NO
//   se envía al cliente jamás.
// - Rate limiting anti fuerza bruta en memoria por IP
//   (5 intentos / 15 min — se resetea al redeploy; el límite duro
//   real lo pone la imposibilidad de crackear offline).
// - CORS restringido al dominio de producción (y localhost para
//   desarrollo vía env ALLOWED_ORIGINS opcional).
// - Sesión efímera: devuelve un token HMAC firmado (sin estado,
//   expira en 2h) para las lecturas siguientes.
// ============================================================

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";

const CORS = (() => {
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const base = ["https://yosoy222.com", "https://www.yosoy222.com"];
  return { allowed: [...base, ...allowed] };
})();

function corsHeaders(origin: string | null): Record<string, string> {
  const ok = origin && CORS.allowed.includes(origin) ? origin : CORS.allowed[0];
  return {
    "Access-Control-Allow-Origin": ok,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(body: unknown, status = 200, origin: string | null = null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

// --- Rate limiting en memoria (por instancia) ---
// El login se cuenta por DOS claves: IP real y usuario normalizado. Rotar la
// IP (o el header X-Forwarded-For) ya no resetea el contador.
const attempts = new Map<string, { n: number; until: number; ts: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000; // caducidad de los contadores sin bloqueo
const MAX_TRACKED = 1000;         // techo del mapa (evita crecimiento sin fin)

function pruneAttempts(now: number): void {
  if (attempts.size < MAX_TRACKED) return;
  for (const [k, v] of attempts) {
    if ((v.until && v.until <= now) || now - v.ts > WINDOW_MS) attempts.delete(k);
  }
  if (attempts.size < MAX_TRACKED) return;
  // Sigue lleno: se sueltan los contadores más antiguos para que el mapa no
  // crezca sin límite bajo un ataque de claves nuevas. Los bloqueos vigentes
  // se conservan mientras se pueda; si TODOS están bloqueados, se sacrifica el
  // más antiguo (válvula de presión: preferible a agotar memoria).
  const byAge = [...attempts.entries()].sort((a, b) => a[1].ts - b[1].ts);
  for (const [k, v] of byAge) {
    if (attempts.size <= MAX_TRACKED) break;
    if (v.until > now) continue; // no soltar un bloqueo vigente si hay otros
    attempts.delete(k);
  }
  // Si aun así sigue lleno (todos con bloqueo vigente), se sacrifica el más
  // antiguo: válvula de presión para no agotar memoria.
  for (const [k] of byAge) {
    if (attempts.size <= MAX_TRACKED) break;
    attempts.delete(k);
  }
}

function isLocked(key: string): number {
  const a = attempts.get(key);
  if (!a) return 0;
  const now = Date.now();
  if (a.until > now) return a.until;
  if (now - a.ts > WINDOW_MS) { attempts.delete(key); return 0; }
  return 0;
}

function recordFail(key: string): number {
  const now = Date.now();
  pruneAttempts(now);
  const a = attempts.get(key) ?? { n: 0, until: 0, ts: 0 };
  if (now - a.ts > WINDOW_MS) { a.n = 0; a.until = 0; }
  a.n += 1;
  a.ts = now;
  if (a.n >= MAX_ATTEMPTS) a.until = now + LOCK_MS;
  attempts.set(key, a);
  return a.until;
}

function clearFails(keys: string[]): void {
  for (const k of keys) attempts.delete(k);
}

// Claves de conteo del login. El usuario se normaliza igual que en la
// verificación (trim + lowercase) para que "Admin" y "admin" cuenten juntos.
function loginKeys(ip: string, user: string): string[] {
  // NOTA: el bloqueo por usuario permite a un atacante dejar la cuenta fuera
  // 15 min a propósito; se acepta el trade-off porque sin él basta rotar la IP
  // para tener intentos infinitos.
  return [`ip:${ip}`, `user:${user || "anon"}`];
}

function lockedUntilAny(keys: string[]): number {
  let max = 0;
  for (const k of keys) {
    const u = isLocked(k);
    if (u > max) max = u;
  }
  return max;
}

// Rate limit de ingesta (acción "track"): ventana fija por IP.
// Primario: RPC durable en Postgres (private.consume_rate_limit) — compartida
// entre isolates, atómica y con limpieza automática vía pg_cron. Fallback:
// mapa en memoria (por-isolate) solo si la RPC no está disponible.
const burst = new Map<string, { n: number; reset: number }>();
const BURST_MAX = 30;        // eventos
const BURST_WINDOW = 60_000; // por minuto

function allowEventMemory(ip: string): boolean {
  if (burst.size > 5000) {
    const now = Date.now();
    for (const [k, v] of burst) if (v.reset <= now) burst.delete(k);
  }
  const now = Date.now();
  const b = burst.get(ip);
  if (!b || now >= b.reset) {
    burst.set(ip, { n: 1, reset: now + BURST_WINDOW });
    return true;
  }
  if (b.n >= BURST_MAX) return false;
  b.n += 1;
  return true;
}

async function allowEvent(ip: string, supabaseUrl: string, serviceRole: string): Promise<boolean> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_rate_limit`, {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_key: `track:${ip}`,
        p_max: BURST_MAX,
        p_window_seconds: 60,
      }),
    });
    if (res.ok) return (await res.json()) === true;
    console.warn(`rate limit RPC ${res.status}; usando fallback en memoria`);
  } catch (err) {
    console.warn("rate limit RPC inaccesible; usando fallback en memoria", err);
  }
  return allowEventMemory(ip);
}

// Sanitización de la acción "track": whitelist de columnas, nunca raw.
function strOrNull(v: unknown, max = 160): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, max);
  return s || null;
}

function numOrNull(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// --- Utilidades criptográficas (formato idéntico al cliente) ---
function sha256hex(s: string): string {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

// Constantes que deben espejar js/dashboard.js
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

// Token de sesión sin estado: HMAC(exp, usuario) con SESSION_SECRET
function mintToken(user: string, now: number, secret: string): string {
  const exp = now + SESSION_TTL_MS;
  const sig = createHmac("sha256", secret).update(`${user}:${exp}`).digest("hex");
  return `${exp}.${sig}`;
}

function verifyToken(token: string, user: string, secret: string): boolean {
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || exp < Date.now()) return false;
  const expected = createHmac("sha256", secret).update(`${user}:${exp}`).digest("hex");
  return safeEqualHex(sig, expected);
}

function getClientIp(req: Request): string {
  // cf-connecting-ip la fija la plataforma (Cloudflare/Supabase) y el cliente
  // no puede falsificarla: es la fuente primaria.
  const cf = req.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  // X-Forwarded-For es una lista "cliente, proxy1, proxy2…": el PRIMER valor lo
  // controla quien hace la petición, así que rotándolo se reseteaba el rate
  // limit de login (spoofing trivial). El ÚLTIMO salto lo añade el proxy de
  // confianza, así que ese es el que vale.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const hops = xff.split(",").map(s => s.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return "desconocida";
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405, origin);
  }

  const ip = getClientIp(req);
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHash = Deno.env.get("DASH_AUTH_HASH"); // sha256 hex de "user:pass:salt"
  const sessionSecret = Deno.env.get("SESSION_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  if (!serviceRole || !authHash || !sessionSecret || !supabaseUrl) {
    return json({ error: "server_misconfigured" }, 500, origin);
  }

  let body: {
    action?: string;
    user?: string;
    pass?: string;
    token?: string;
    limit?: number;
    // Campos de la acción pública "track" (no-confiables: se sanitizan abajo)
    event_type?: unknown;
    session_id?: unknown;
    source?: unknown;
    device?: unknown;
    country?: unknown;
    city?: unknown;
    product_name?: unknown;
    product_price?: unknown;
    product_cat?: unknown;
    query?: unknown;
    total_amount?: unknown;
    items_count?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400, origin);
  }

  // ---------- ACCIÓN: login ----------
  if (body.action === "login") {
    const user = (body.user ?? "").trim().toLowerCase();
    const pass = body.pass ?? "";
    // Se comprueban ambas claves (IP real y usuario) antes de validar nada.
    const keys = loginKeys(ip, user);
    const lockedUntil = lockedUntilAny(keys);
    if (lockedUntil) {
      return json(
        { error: "locked", minutes: Math.ceil((lockedUntil - Date.now()) / 60000) },
        429,
        origin,
      );
    }

    if (!user || !pass) {
      return json({ error: "missing_credentials" }, 400, origin);
    }

    const salt = Deno.env.get("DASH_AUTH_SALT") ?? "";
    const candidate = sha256hex(`${user}:${pass}:${salt}`);
    if (!safeEqualHex(candidate, authHash)) {
      let until = 0;
      for (const k of keys) until = Math.max(until, recordFail(k));
      if (until) {
        return json(
          { error: "locked", minutes: Math.ceil((until - Date.now()) / 60000) },
          429,
          origin,
        );
      }
      return json({ error: "bad_credentials" }, 401, origin);
    }

    clearFails(keys);
    const token = mintToken(user, Date.now(), sessionSecret);
    return json({ ok: true, token, expiresInMs: SESSION_TTL_MS }, 200, origin);
  }

  // ---------- ACCIÓN: track (ingesta pública; reemplaza el INSERT con clave anon) ----------
  if (body.action === "track") {
    if (!(await allowEvent(ip, supabaseUrl, serviceRole))) {
      return json({ error: "rate_limited" }, 429, origin);
    }

    const eventType = strOrNull(body.event_type, 40);
    if (!eventType) return json({ error: "invalid_event" }, 400, origin);

    const row: Record<string, string | number | null> = {
      event_type: eventType,
      session_id: strOrNull(body.session_id, 64) ?? crypto.randomUUID(),
      source: strOrNull(body.source, 80),
      device: strOrNull(body.device, 40),
      country: strOrNull(body.country, 80) ?? "Venezuela",
      city: strOrNull(body.city, 80) ?? "Caracas",
      product_name: strOrNull(body.product_name),
      product_price: numOrNull(body.product_price),
      product_cat: strOrNull(body.product_cat, 80),
      query: strOrNull(body.query, 120),
      total_amount: numOrNull(body.total_amount),
      items_count: numOrNull(body.items_count),
    };

    const res = await fetch(`${supabaseUrl}/rest/v1/yosoy222_events`, {
      method: "POST",
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      return json({ error: "upstream_error", status: res.status }, 502, origin);
    }
    return json({ ok: true }, 200, origin);
  }

  // ---------- ACCIÓN: stats (requiere token) ----------
  if (body.action === "stats") {
    const user = (body.user ?? "").trim().toLowerCase();
    const token = body.token ?? "";
    if (!user || !verifyToken(token, user, sessionSecret)) {
      return json({ error: "unauthorized" }, 401, origin);
    }

    const limit = Math.min(Math.max(Number(body.limit) || 2500, 100), 5000);
    const res = await fetch(
      `${supabaseUrl}/rest/v1/yosoy222_events?select=*&order=created_at.desc&limit=${limit}`,
      {
        headers: {
          apikey: serviceRole,
          Authorization: `Bearer ${serviceRole}`,
        },
      },
    );
    if (!res.ok) {
      return json({ error: "upstream_error", status: res.status }, 502, origin);
    }
    const rows = await res.json();
    return json({ ok: true, rows }, 200, origin);
  }

  return json({ error: "unknown_action" }, 400, origin);
});
