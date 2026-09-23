// Pruebas del camino del staff del bot de WhatsApp: parser de comandos,
// toma/cierre de hilo y relay de la respuesta humana saliendo del número
// principal. Ejecuta los Code nodes del espejo del workflow con mocks de n8n
// (items, $env y this.helpers.httpRequest), encadenados como en el grafo real:
//   Comandos Staff -> Ejecutar Paso -> Salida Staff
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = JSON.parse(readFileSync('scripts/whatsapp-n8n-workflow.json', 'utf8'));
const codeDe = Object.fromEntries(
  workflow.nodes
    .filter((n) => n.type === 'n8n-nodes-base.code')
    .map((n) => [n.name, n.parameters.jsCode])
);

const ENV = {
  SUPABASE_FN_URL: 'https://fn.test/dashboard-stats',
  SUPABASE_BOT_KEY: 'test-key',
  EVOLUTION_API_KEY: 'test-key'
};
const AGENTE = '584129922399@s.whatsapp.net';
const CLIENTE = '584126481628@s.whatsapp.net';
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

/** Store de sesiones + registro de envíos + HTTP falso, en el formato de n8n. */
function nuevoMundo(sesiones = {}, { fallaEnvio = false } = {}) {
  const store = JSON.parse(JSON.stringify(sesiones));
  const enviados = [];
  const http = async ({ url, body }) => {
    if (String(url).includes('/message/sendText/')) {
      // El intento siempre queda registrado; fallaEnvio sólo tumba los envíos a
      // terceros (los avisos internos al agente siguen funcionando).
      enviados.push({ to: body.number, text: body.text, fallo: Boolean(fallaEnvio && body.number !== AGENTE) });
      if (fallaEnvio && body.number !== AGENTE) throw new Error('500 Evolution caído');
      return { ok: true };
    }
    if (body.action === 'session_get') {
      const s = store[body.client_jid];
      return s
        ? { ok: true, found: true, session: { client_jid: body.client_jid, ...s } }
        : { ok: true, found: false, session: null };
    }
    if (body.action === 'session_set') {
      store[body.client_jid] = { ...(store[body.client_jid] || {}), ...body };
      if (body.datos_parciales) store[body.client_jid].datos_parciales = JSON.stringify(body.datos_parciales);
      return { ok: true };
    }
    throw new Error('llamada inesperada: ' + JSON.stringify(body));
  };
  return { store, enviados, http };
}

const staffItem = (text) => [{ json: { remoteJid: AGENTE, digits: '584129922399', text, isStaff: true, id: 'M1' } }];
const datos = (mundo, jid) => JSON.parse(mundo.store[jid]?.datos_parciales || '{}');

async function correr(nodo, items, mundo) {
  const fn = new AsyncFunction('items', '$env', codeDe[nodo]);
  return fn.call({ helpers: { httpRequest: mundo.http } }, items, ENV);
}

/** Recorre el camino real del staff hasta el envío. */
async function cadena(texto, mundo) {
  const comandos = await correr('Comandos Staff', staffItem(texto), mundo);
  if (!comandos.length) return { paso: [], salida: [] };
  const paso = await correr('Ejecutar Paso', comandos, mundo);
  if (!paso.length) return { paso, salida: [] };
  return { paso, salida: await correr('Salida Staff', paso, mundo) };
}

test('BOT COMANDOS: reconoce atender, fin (con o sin número), respuesta (>) y nota interna', async () => {
  const casos = [
    ['atender 584126481628', 'atender', '584126481628', ''],
    ['fin', 'fin', null, ''],
    ['fin 584126481628', 'fin', '584126481628', ''],
    ['>Hola Juan', 'respuesta', null, 'Hola Juan'],
    ['>   Hola Juan  ', 'respuesta', null, 'Hola Juan'],
    ['>584126481628 Hola Juan', 'respuesta', '584126481628', 'Hola Juan'],
    ['hola equipo', 'nota', null, ''],
    ['finalmente listo', 'nota', null, ''],
    ['>', 'nota', null, '']
  ];
  for (const [texto, cmd, number, cuerpo] of casos) {
    const [item] = await correr('Comandos Staff', staffItem(texto), nuevoMundo());
    assert.equal(item.json.cmd, cmd, `cmd de "${texto}"`);
    assert.equal(item.json.number, number, `número de "${texto}"`);
    assert.equal(item.json.cuerpo, cuerpo, `cuerpo de "${texto}"`);
  }
});

test('BOT ATENDER: asigna el cliente al agente y toma el hilo del cliente', async () => {
  const mundo = nuevoMundo();
  const { paso } = await cadena('atender 584126481628', mundo);

  assert.equal(datos(mundo, AGENTE).cliente_actual, CLIENTE, 'el agente queda con su cliente asignado');
  assert.equal(mundo.store[CLIENTE].estado, 'puente', 'el hilo del cliente pasa a puente');
  assert.equal(datos(mundo, CLIENTE).atendido_por, AGENTE, 'el cliente sabe quién atiende');
  assert.deepEqual(mundo.store[AGENTE].handoff_hilo, {}, 'el campo deprecado se limpia');
  assert.match(paso[0].json.salida.text, /Atendiendo a 584126481628/);
  assert.match(paso[0].json.salida.text, /Responde con: >/);
});

test('BOT RELAY: la respuesta del agente sale al cliente asignado y se confirma', async () => {
  const mundo = nuevoMundo({
    [AGENTE]: { estado: 'puente', datos_parciales: JSON.stringify({ cliente_actual: CLIENTE }) }
  });
  await cadena('>Tu pedido ya salió ✨', mundo);

  assert.equal(mundo.enviados[0].to, CLIENTE, 'el mensaje va al cliente');
  assert.equal(mundo.enviados[0].text, 'Tu pedido ya salió ✨', 'el texto llega íntegro');
  assert.equal(mundo.enviados[1].to, AGENTE, 'el agente recibe la confirmación');
  assert.match(mundo.enviados[1].text, /✅ Enviado a 584126481628/);
  assert.equal(mundo.store[CLIENTE].estado, 'puente', 'el bot queda en silencio para ese cliente');
  assert.deepEqual(datos(mundo, CLIENTE).historial, [{ b: 'Tu pedido ya salió ✨' }],
    'la IA conserva el contexto del mensaje humano (texto plano: el lector ya lo etiqueta como Bot)');
});

test('BOT RELAY: el número explícito funciona sin asignación previa y respeta saltos de línea', async () => {
  const mundo = nuevoMundo();
  await cadena('>584141111111 linea1\nlinea2', mundo);

  assert.equal(mundo.enviados[0].to, '584141111111@s.whatsapp.net');
  assert.equal(mundo.enviados[0].text, 'linea1\nlinea2');
});

test('BOT RELAY: sin cliente asignado avisa al agente y no escribe a ningún cliente', async () => {
  const mundo = nuevoMundo();
  await cadena('>Hola', mundo);

  assert.equal(mundo.enviados.length, 1, 'un solo mensaje (el instructivo)');
  assert.equal(mundo.enviados[0].to, AGENTE);
  assert.match(mundo.enviados[0].text, /No sé a qué cliente responder/);
  assert.deepEqual(Object.keys(mundo.store), [], 'no toca ninguna sesión');
});

test('BOT RELAY: nunca toma a otro agente como destinatario', async () => {
  const mundo = nuevoMundo();
  await cadena('>584242162538 oye', mundo);

  assert.equal(mundo.enviados.length, 1);
  assert.match(mundo.enviados[0].text, /Destino inválido/);
});

test('BOT RELAY: si el envío falla avisa al agente, no confirma y no marca al cliente', async () => {
  const mundo = nuevoMundo(
    { [AGENTE]: { estado: 'puente', datos_parciales: JSON.stringify({ cliente_actual: CLIENTE }) } },
    { fallaEnvio: true }
  );
  await cadena('>Hola', mundo);

  assert.equal(mundo.enviados[0].to, CLIENTE);
  assert.equal(mundo.enviados[0].fallo, true, 'el envío al cliente falló');
  assert.match(mundo.enviados[1].text, /No pude enviar el mensaje/);
  assert.equal(mundo.enviados.some((e) => /✅ Enviado/.test(e.text)), false, 'no confirma un envío inexistente');
  assert.equal(mundo.store[CLIENTE], undefined, 'no deja al cliente en puente');
});

test('BOT NOTA: un mensaje interno entre agentes no llega a ningún cliente', async () => {
  const mundo = nuevoMundo();
  const { paso, salida } = await cadena('hola equipo, ¿quién atiende?', mundo);

  assert.deepEqual(paso, [], 'el flujo se corta en Ejecutar Paso');
  assert.deepEqual(salida, []);
  assert.deepEqual(mundo.enviados, [], 'cero envíos');
});

test('BOT FIN: devuelve el hilo del cliente a la IA y limpia la asignación', async () => {
  const mundo = nuevoMundo({
    [AGENTE]: { estado: 'puente', datos_parciales: JSON.stringify({ cliente_actual: CLIENTE }) },
    [CLIENTE]: { estado: 'puente', datos_parciales: '{}' }
  });
  await cadena('fin', mundo);

  assert.equal(mundo.store[CLIENTE].estado, 'IA', 'el bot retoma el hilo');
  assert.equal(datos(mundo, AGENTE).cliente_actual, null, 'la asignación se limpia');
  assert.match(mundo.enviados[0].text, /Atención cerrada para 584126481628/);
});

test('BOT FIN: sin asignación avisa, y fin <número> libera a ese cliente', async () => {
  const sinAsignacion = nuevoMundo();
  await cadena('fin', sinAsignacion);
  assert.match(sinAsignacion.enviados[0].text, /No tienes un cliente asignado/);

  const conNumero = nuevoMundo({
    [AGENTE]: { estado: 'puente', datos_parciales: '{}' },
    [CLIENTE]: { estado: 'puente', datos_parciales: '{}' }
  });
  await cadena('fin 584126481628', conNumero);
  assert.equal(conNumero.store[CLIENTE].estado, 'IA');
});

test('BOT WORKFLOW: el espejo no lleva secretos ni process.env (regla de n8n 2.x)', () => {
  const crudo = readFileSync('scripts/whatsapp-n8n-workflow.json', 'utf8');

  assert.equal(crudo.includes('process.env'), false, 'los Code nodes de n8n 2.x no tienen process.env');
  assert.match(crudo, /\$env\.EVOLUTION_API_KEY/, 'la apikey se lee del entorno');
  assert.match(crudo, /\$env\.SUPABASE_BOT_KEY/);
  assert.equal(/sbp_[A-Za-z0-9]{10,}|AgenciaSecreta|"apikey":\s*"(?!\{\{)/.test(crudo), false,
    'cero secretos hardcodeados');
});
