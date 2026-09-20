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
const attempts = new Map<string, { n: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

function isLocked(ip: string): number {
  const a = attempts.get(ip);
  if (!a) return 0;
  if (a.until > Date.now()) return a.until;
  if (a.until && a.until <= Date.now()) attempts.delete(ip);
  return 0;
}

function recordFail(ip: string): number {
  const a = attempts.get(ip) ?? { n: 0, until: 0 };
  a.n += 1;
  if (a.n >= MAX_ATTEMPTS) a.until = Date.now() + LOCK_MS;
  attempts.set(ip, a);
  return a.until;
}

function clearFails(ip: string): void {
  attempts.delete(ip);
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
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "desconocida"
  );
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

  let body: { action?: string; user?: string; pass?: string; token?: string; limit?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400, origin);
  }

  // ---------- ACCIÓN: login ----------
  if (body.action === "login") {
    const lockedUntil = isLocked(ip);
    if (lockedUntil) {
      return json(
        { error: "locked", minutes: Math.ceil((lockedUntil - Date.now()) / 60000) },
        429,
        origin,
      );
    }

    const user = (body.user ?? "").trim().toLowerCase();
    const pass = body.pass ?? "";
    if (!user || !pass) {
      return json({ error: "missing_credentials" }, 400, origin);
    }

    const salt = Deno.env.get("DASH_AUTH_SALT") ?? "";
    const candidate = sha256hex(`${user}:${pass}:${salt}`);
    if (!safeEqualHex(candidate, authHash)) {
      const until = recordFail(ip);
      if (until) {
        return json(
          { error: "locked", minutes: Math.ceil((until - Date.now()) / 60000) },
          429,
          origin,
        );
      }
      return json({ error: "bad_credentials" }, 401, origin);
    }

    clearFails(ip);
    const token = mintToken(user, Date.now(), sessionSecret);
    return json({ ok: true, token, expiresInMs: SESSION_TTL_MS }, 200, origin);
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
