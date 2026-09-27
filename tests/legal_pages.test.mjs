// Pruebas del bloque legal del sitio: que las cuatro páginas existan, se
// enlacen entre sí y desde la portada, cumplan la CSP (nada inline) y estén
// dentro del precache del Service Worker con la versión de caché vigente.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const PAGINAS = ['terminos', 'privacidad', 'envios', 'devoluciones'];
const ruta = (nombre) => `legal/${nombre}.html`;

const leer = (p) => readFileSync(p, 'utf8');

// Versión de caché vigente, leída de sw.js: nunca hay que actualizar el test
const versionCache = Number(leer('sw.js').match(/CACHE_NAME = 'yosoy222-v(\d+)'/)[1]);
const precache = leer('sw.js').match(/const PRECACHE_ASSETS = \[([\s\S]*?)\]/)[1];
const index = leer('index.html');

test('LEGAL: las cuatro páginas existen y son documentos completos', () => {
  for (const nombre of PAGINAS) {
    const p = ruta(nombre);
    assert.ok(existsSync(p), `falta ${p}`);
    const html = leer(p);
    assert.ok(html.length > 3000, `${p} parece vacío (${html.length} caracteres)`);
    assert.match(html, /<!DOCTYPE html>/i, `${p} sin doctype`);
    assert.ok(html.trimEnd().endsWith('</html>'), `${p} no cierra el documento`);
    assert.match(html, /<h1>[^<]+<\/h1>/, `${p} sin <h1>`);
    assert.match(html, /<title>[^<]+— YoSoy222<\/title>/, `${p} sin título propio`);
  }
});

test('LEGAL: cada página enlaza a las otras tres y vuelve a la tienda', () => {
  for (const nombre of PAGINAS) {
    const html = leer(ruta(nombre));
    for (const otro of PAGINAS) {
      assert.ok(html.includes(`href="${otro}.html"`), `${nombre} no enlaza a ${otro}`);
    }
    assert.ok(html.includes('href="../index.html"'), `${nombre} no vuelve a la tienda`);
    assert.ok(html.includes('aria-current="page"'), `${nombre} no marca su enlace activo`);
  }
});

test('LEGAL: la portada enlaza las cuatro páginas desde el pie', () => {
  const pie = index.slice(index.indexOf('<div class="footer-bottom">'));
  for (const nombre of PAGINAS) {
    assert.ok(pie.includes(`href="legal/${nombre}.html"`), `el pie no enlaza ${nombre}`);
  }
});

test('LEGAL: el checkout pide aceptación con enlaces antes del botón de WhatsApp', () => {
  const checado = index.indexOf('class="cart-legal"');
  const boton = index.indexOf('id="cartWhatsapp"');
  assert.ok(checado !== -1, 'falta el aviso de aceptación en el carrito');
  assert.ok(boton !== -1 && checado < boton, 'el aviso debe ir antes del botón de WhatsApp');
  const aviso = index.slice(checado, boton);
  assert.ok(aviso.includes('href="legal/terminos.html"') && aviso.includes('href="legal/privacidad.html"'),
    'el aviso debe enlazar términos y privacidad');
});

test('LEGAL: las páginas cumplen la CSP (nada inline) y usan la versión de caché vigente', () => {
  for (const nombre of PAGINAS) {
    const html = leer(ruta(nombre));
    assert.equal(/<style[\s>]/.test(html), false, `${nombre} tiene estilos inline (la CSP los bloquea)`);
    assert.equal(/\son[a-z]+\s*=/.test(html), false, `${nombre} tiene manejadores inline (onclick, onload…)`);
    assert.equal(/<script(?![^>]*\bsrc=)[^>]*>/.test(html), false, `${nombre} tiene scripts inline`);
    assert.ok(html.includes('Content-Security-Policy'), `${nombre} sin meta CSP`);
    // Solo los assets de caché (js/css): los iconos se versionan por generación
    for (const [, qv] of html.matchAll(/(?:\.\.\/)?(?:js|css)\/[^"?]+\?v=(\d+)/g)) {
      assert.equal(Number(qv), versionCache, `${nombre} referencia ?v=${qv} y el SW está en v${versionCache}`);
    }
  }
});

test('LEGAL: los datos identificables de la tienda están rellenados', () => {
  // Bloque legal completo (25-sep-2026): no pueden quedar marcadores de borrador
  // y la identidad del vendedor debe ser verificable en términos y privacidad.
  for (const nombre of PAGINAS) {
    const html = leer(ruta(nombre));
    const pendientes = (html.match(/\[COMPLETAR:/g) || []).length;
    assert.equal(pendientes, 0, `${nombre} aún tiene ${pendientes} marcadores [COMPLETAR] de borrador`);
  }
  const identidad = ['Saidubi Muñoz', 'V-172691842', 'yosoy.ve222@gmail.com'];
  for (const nombre of ['terminos', 'privacidad']) {
    const html = leer(ruta(nombre));
    for (const dato of identidad) {
      assert.ok(html.includes(dato), `${nombre} no contiene el dato identifiable «${dato}»`);
    }
  }
});

test('LEGAL: el aviso de cookies es informativo, persistente y enlaza la política', () => {
  const js = leer('js/legal.js');
  assert.match(js, /yosoy222_cookie_notice/, 'sin clave de persistencia del aviso');
  assert.match(js, /localStorage/, 'no recuerda que ya se mostró');
  assert.match(js, /privacidad\.html/, 'no enlaza la política de privacidad');
  assert.equal(/gtag|googletagmanager|dataLayer/.test(js), false,
    'el aviso es informativo: no debe tocar la analítica');
  assert.ok(leer('css/style.css').includes('.legal-notice'), 'faltan los estilos del aviso en la portada');
  assert.ok(index.includes('js/legal.js'), 'la portada no carga el aviso');
});

test('LEGAL: las páginas y sus assets entran en el precache y en el sitemap', () => {
  for (const nombre of PAGINAS) {
    assert.ok(precache.includes(`/legal/${nombre}.html`), `${nombre} fuera del precache`);
    assert.ok(leer('sitemap.xml').includes(`https://yosoy222.com/legal/${nombre}.html`),
      `${nombre} fuera del sitemap`);
  }
  assert.ok(precache.includes(`/css/legal.css?v=${versionCache}`), 'css/legal.css fuera del precache');
  assert.ok(precache.includes(`/js/legal.js?v=${versionCache}`), 'js/legal.js fuera del precache');
});
