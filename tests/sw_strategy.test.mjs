import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

/**
 * tests/sw_strategy.test.mjs — Estrategia de caché del Service Worker.
 *
 * Carga el sw.js REAL (el mismo archivo que se despliega a producción) en un
 * sandbox aislado (node:vm) con stubs mínimos de la API de Service Workers y
 * verifica el contrato de caché que protege la experiencia de los visitantes:
 *
 *   1. `.json` (variants.json) → Network-First: si la red cambia, el cliente
 *      recibe el dato fresco (el caso del 27-sep: un variants.json viejo
 *      persistente en navegantes recurrentes).
 *   2. `.json` offline → fallback a la copia cacheada (PWA offline intacta).
 *   3. Navegación HTML → Network-First sin regresiones.
 *   4. Instalación limpia: las cachés de versiones anteriores se eliminan.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const SW_PATH = join(__dirname, '..', 'sw.js');
const SW_SRC = readFileSync(SW_PATH, 'utf8');

/**
 * Ejecuta el fuente real del SW en un sandbox fresco y devuelve los handles
 * para registrar peticiones, manipular la "red" y leer la "caché".
 */
function loadServiceWorker({ initialCache = new Map() } = {}) {
  const listeners = {};
  const cacheStore = initialCache; // pathname -> body (string)
  const state = { networkBody: 'BODY', online: true };

  const makeResponse = (body) => ({
    ok: true,
    status: 200,
    clone() { return makeResponse(body); },
    text: async () => body,
  });

  const asPath = (req) => (typeof req === 'string' ? new URL(req, 'http://test.local').pathname : new URL(req.url).pathname);

  const cacheObj = {
    put: async (req, res) => { cacheStore.set(asPath(req), await res.clone().text()); },
    match: async (req) => {
      const path = asPath(req);
      return cacheStore.has(path) ? makeResponse(cacheStore.get(path)) : undefined;
    },
    addAll: async () => {},
  };

  const selfStub = {
    location: { origin: 'http://test.local' },
    addEventListener: (type, fn) => { listeners[type] = fn; },
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  };
  const cachesStub = {
    open: async () => cacheObj,
    match: async (req) => cacheObj.match(req),
    keys: async () => [...cacheStore.keys()],
    delete: async (name) => true,
  };

  // URL y console se inyectan porque no son intrínsecos de un contexto vm;
  // Promise/Date/Math y demás built-ins de ECMAScript sí existen por defecto.
  const sandbox = {
    self: selfStub,
    caches: cachesStub,
    fetch: async () => {
      if (!state.online) throw new Error('offline');
      return makeResponse(state.networkBody);
    },
    URL, console,
  };
  vm.createContext(sandbox);
  vm.runInContext(SW_SRC, sandbox, { filename: 'sw.js' });

  return {
    listeners,
    cacheStore,
    cachesStub,
    FakeEvent: class {
      constructor(type) {
        this.type = type;
        this.waitUntilPromises = [];
      }
      waitUntil(p) { this.waitUntilPromises.push(p); }
      respondWith(promise) { this.__responded = promise; }
    },
    setNetworkBody: (body) => { state.networkBody = body; },
    goOffline: () => { state.online = false; },
  };
}

/** Ejecuta el handler fetch con un request GET y devuelve la Response del respondWith. */
async function serve(sw, path, { mode } = {}) {
  const ev = new sw.FakeEvent('fetch');
  ev.request = { url: new URL(path, 'http://test.local').href, method: 'GET', ...(mode ? { mode } : {}) };
  await sw.listeners.fetch(ev);
  assert.ok(ev.__responded, `el handler debió responder para ${path}`);
  const res = await Promise.resolve(ev.__responded);
  assert.ok(res, `respondWith debió devolver una respuesta para ${path}`);
  return res;
}

test('sw.js: declara la estrategia Network-First para .js y .json', () => {
  assert.match(SW_SRC, /CACHE_NAME\s*=\s*'yosoy222-v\d+'/);
  assert.match(SW_SRC, /endsWith\('\.js'\) \|\| url\.pathname\.endsWith\('\.json'\)/, 'el handler Network-First debe cubrir .js y .json');
  assert.match(SW_SRC, /mode === 'navigate'/);
});

test('json en red actualizada: responde fresco y refresca la caché (nunca queda viejo)', async () => {
  const sw = loadServiceWorker();
  sw.setNetworkBody('{"orden":"VIEJO"}');
  const p1 = await serve(sw, '/js/variants.json?v=14');
  assert.equal(await p1.text(), '{"orden":"VIEJO"}');

  // La red ahora tiene el contenido nuevo: Network-First debe entregarlo
  sw.setNetworkBody('{"orden":"NUEVO"}');
  const p2 = await serve(sw, '/js/variants.json?v=14');
  assert.equal(await p2.text(), '{"orden":"NUEVO"}', 'con red disponible debe servir el dato fresco');
  assert.equal(sw.cacheStore.get('/js/variants.json'), '{"orden":"NUEVO"}', 'la caché debe refrescarse');
});

test('json offline: fallback a la copia cacheada (PWA offline intacta)', async () => {
  const initialCache = new Map([['/js/variants.json', '{"orden":"CACHEADO"}']]);
  const sw = loadServiceWorker({ initialCache });
  sw.goOffline();
  const res = await serve(sw, '/js/variants.json?v=999');
  assert.equal(await res.text(), '{"orden":"CACHEADO"}');
});

test('navegacion: Network-First sin regresion', async () => {
  const sw = loadServiceWorker();
  sw.setNetworkBody('HTML_VIEJO');
  const p1 = await serve(sw, '/', { mode: 'navigate' });
  assert.equal(await p1.text(), 'HTML_VIEJO');
  sw.setNetworkBody('HTML_FRESH');
  const p2 = await serve(sw, '/', { mode: 'navigate' });
  assert.equal(await p2.text(), 'HTML_FRESH');
});

test('activate: limpia cachés de versiones anteriores', async () => {
  const sw = loadServiceWorker();
  const borradas = [];
  sw.cachesStub.keys = async () => ['yosoy222-v44', 'yosoy222-v45'];
  sw.cachesStub.delete = async (name) => { borradas.push(name); return true; };

  const ev = new sw.FakeEvent('activate');
  sw.listeners.activate(ev);
  await Promise.all(ev.waitUntilPromises);
  assert.deepEqual(borradas, ['yosoy222-v44'], 'debe borrar solo las cachés que no coinciden con CACHE_NAME');
});
