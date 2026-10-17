import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

/**
 * tests/edge_rate_limit.test.mjs — Rate limit del login (Edge Function `dashboard-stats`).
 *
 * El código real vive en supabase/functions/dashboard-stats/index.ts (Deno). Aquí
 * se extraen las funciones puras de rate limit + getClientIp, se escriben a un
 * temporal .ts (Node 22 los importa con type-stripping) y se ejecutan de verdad,
 * sin depender de Deno ni de la red.
 *
 * Cubre el hallazgo REQUIRED del code review (2026-10-16): el rate limit de login
 * era esquivable rotando X-Forwarded-For, porque getClientIp tomaba el PRIMER
 * valor de la cabecera (controlado por el cliente).
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const EDGE_PATH = join(__dirname, '..', 'supabase', 'functions', 'dashboard-stats', 'index.ts');
const SRC = readFileSync(EDGE_PATH, 'utf8');

/** Trozo de fuente que va de `startMarker` hasta el cierre de `fnName`. */
function blockFrom(startMarker, fnName) {
  const b = SRC.indexOf(startMarker);
  assert.ok(b >= 0, `no se encontró el marcador "${startMarker}" en index.ts`);
  const i = SRC.indexOf(`function ${fnName}`, b);
  assert.ok(i >= 0, `no se encontró la función "${fnName}" en index.ts`);
  return SRC.slice(b, SRC.indexOf('\n}', i) + 2);
}

/** Función suelta `function nombre(...) { ... }` (desde su definición). */
function fnSource(fnName) {
  const i = SRC.indexOf(`function ${fnName}(`);
  assert.ok(i >= 0, `no se encontró la función "${fnName}" en index.ts`);
  return SRC.slice(i, SRC.indexOf('\n}', i) + 2);
}

let loadSeq = 0;

async function loadRateLimit() {
  const code = [
    blockFrom('// --- Rate limiting', 'lockedUntilAny'),
    fnSource('getClientIp'),
    'export { getClientIp, attempts, isLocked, recordFail, clearFails, loginKeys,',
    '  lockedUntilAny, MAX_ATTEMPTS, LOCK_MS, WINDOW_MS, MAX_TRACKED };',
  ].join('\n');
  const dir = mkdtempSync(join(tmpdir(), 'edge-rl-'));
  const file = join(dir, 'rate_limit.ts');
  writeFileSync(file, code);
  // Cada test recibe su propia instancia del módulo (mapa `attempts` limpio).
  return import(`${file}?t=${++loadSeq}`);
}

/** Request falso con solo .headers.get(), como lo usa getClientIp. */
const req = (headers) => ({ headers: { get: (k) => headers[k] ?? null } });

/** Simula un intento de login fallido con las claves que usa el handler real. */
function failLogin(mod, { ip, user }) {
  let until = 0;
  for (const k of mod.loginKeys(ip, user)) until = Math.max(until, mod.recordFail(k));
  return until;
}

test('getClientIp: prefiere cf-connecting-ip (que el cliente no puede falsificar)', async () => {
  const m = await loadRateLimit();
  assert.equal(
    m.getClientIp(req({ 'cf-connecting-ip': '7.7.7.7', 'x-forwarded-for': '1.2.3.4' })),
    '7.7.7.7',
  );
});

test('getClientIp: usa el ULTIMO salto de X-Forwarded-For, no el primero', async () => {
  const m = await loadRateLimit();
  assert.equal(m.getClientIp(req({ 'x-forwarded-for': '1.2.3.4, 9.9.9.9' })), '9.9.9.9');
  assert.equal(m.getClientIp(req({ 'x-forwarded-for': '1.2.3.4' })), '1.2.3.4');
  assert.equal(m.getClientIp(req({})), 'desconocida');
  // Guardia contra la regresión concreta: nunca volver al primer hop.
  assert.doesNotMatch(SRC, /x-forwarded-for"?\)?\s*\.split\([^)]*\)\[0\]/, 'no debe usar el PRIMER valor de XFF');
  assert.match(SRC, /cf-connecting-ip/);
});

test('rotar X-Forwarded-For NO resetea el rate limit de login (regresión del hallazgo)', async () => {
  const m = await loadRateLimit();
  // Misma IP real de la plataforma, XFF rotado en cada intento (el ataque original).
  for (let i = 1; i <= m.MAX_ATTEMPTS - 1; i++) {
    const ip = m.getClientIp(req({ 'cf-connecting-ip': '7.7.7.7', 'x-forwarded-for': `${i}.0.0.1` }));
    assert.equal(failLogin(m, { ip, user: 'admin' }), 0, `intento ${i} no debe bloquear todavía`);
  }
  const ip = m.getClientIp(req({ 'cf-connecting-ip': '7.7.7.7', 'x-forwarded-for': '99.0.0.1' }));
  const until = failLogin(m, { ip, user: 'admin' });
  assert.ok(until > 0, 'el intento 5 desde la misma IP real debe bloquear aunque el XFF cambie');
  assert.ok(m.lockedUntilAny(m.loginKeys(ip, 'admin')) > 0, 'lockedUntilAny debe ver el bloqueo');
});

test('rotar la IP (cf-connecting-ip) tampoco basta: cuenta el usuario', async () => {
  const m = await loadRateLimit();
  for (let i = 1; i <= m.MAX_ATTEMPTS - 1; i++) {
    failLogin(m, { ip: `10.0.0.${i}`, user: 'admin' });
  }
  const until = failLogin(m, { ip: '10.0.0.99', user: 'admin' });
  assert.ok(until > 0, 'cambiar de IP con el mismo usuario debe seguir bloqueando');
});

test('el usuario se cuenta normalizado (Admin == admin) y no bloquea a otro usuario', async () => {
  const m = await loadRateLimit();
  const lower = 'admin';
  assert.deepEqual(m.loginKeys('1.1.1.1', lower), ['ip:1.1.1.1', 'user:admin']);
  for (let i = 1; i <= m.MAX_ATTEMPTS; i++) failLogin(m, { ip: '1.1.1.1', user: lower });
  assert.ok(m.lockedUntilAny(m.loginKeys('1.1.1.1', lower)) > 0);
  // Otra cuenta desde otra IP no queda afectada.
  assert.equal(m.lockedUntilAny(m.loginKeys('2.2.2.2', 'editor')), 0);
});

test('login correcto limpia ambas claves (IP y usuario)', async () => {
  const m = await loadRateLimit();
  failLogin(m, { ip: '3.3.3.3', user: 'admin' });
  const keys = m.loginKeys('3.3.3.3', 'admin');
  assert.ok(keys.every((k) => m.attempts.has(k)), 'tras el fallo deben existir ambas claves');
  m.clearFails(keys);
  assert.ok(keys.every((k) => !m.attempts.has(k)), 'clearFails debe borrar IP y usuario');
  assert.equal(m.lockedUntilAny(keys), 0);
});

test('el mapa de intentos está acotado (no crece sin límite con claves nuevas)', async () => {
  const m = await loadRateLimit();
  for (let i = 0; i < m.MAX_TRACKED + 500; i++) {
    m.recordFail(`ip:${i}.${i}.${i}.${i}`);
  }
  assert.ok(
    m.attempts.size <= m.MAX_TRACKED + 1,
    `attempts debe podarse (${m.attempts.size} > ${m.MAX_TRACKED})`,
  );
});
