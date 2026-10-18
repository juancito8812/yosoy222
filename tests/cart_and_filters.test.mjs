import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import appModule from '../js/app.js';
import cartModule from '../js/cart.js';

const {
  filterProductList,
  seasonFilters,
  catDescriptions,
  products,
  catMap
} = appModule;

const {
  calculateCartTotals,
  loadCartData,
  saveCartData,
  CART_TTL_MS
} = cartModule;

test('CART: calculateCartTotals correctly sums price and quantity', () => {
  const items = [
    { name: 'Item A', price: 10.5, qty: 2 },
    { name: 'Item B', price: 5, qty: 3 }
  ];
  const result = calculateCartTotals(items);
  assert.equal(result.count, 5);
  assert.equal(result.total, 36);
});

test('CART: calculateCartTotals returns 0 for empty cart', () => {
  const result = calculateCartTotals([]);
  assert.equal(result.count, 0);
  assert.equal(result.total, 0);
});

test('FILTERS: filterProductList matches by category', () => {
  const testProducts = [
    { name: 'Vela Rosa', cat: 'vela', desc: 'Aroma coco' },
    { name: 'Pulsera Roja', cat: 'pulsera', desc: 'Proteccion' },
    { name: 'Franela Blanca', cat: 'franela', desc: 'Algodon' }
  ];
  const testCatMap = { vela: 'velas', pulsera: 'pulseras', franela: 'franelas' };

  const velas = filterProductList(testProducts, 'velas', '', testCatMap);
  assert.equal(velas.length, 1);
  assert.equal(velas[0].name, 'Vela Rosa');

  const all = filterProductList(testProducts, 'todos', '', testCatMap);
  assert.equal(all.length, 3);
});

test('FILTERS: filterProductList matches by search term in name or desc case-insensitively', () => {
  const testProducts = [
    { name: 'Vela Rosa', cat: 'vela', desc: 'Aroma coco y jazmin' },
    { name: 'Pulsera Roja', cat: 'pulsera', desc: 'Proteccion amuleto' }
  ];
  const testCatMap = { vela: 'velas', pulsera: 'pulseras' };

  const byName = filterProductList(testProducts, 'todos', 'rosa', testCatMap);
  assert.equal(byName.length, 1);
  assert.equal(byName[0].name, 'Vela Rosa');

  const byDesc = filterProductList(testProducts, 'todos', 'JAZMIN', testCatMap);
  assert.equal(byDesc.length, 1);
  assert.equal(byDesc[0].name, 'Vela Rosa');

  const noMatch = filterProductList(testProducts, 'todos', 'inexistente', testCatMap);
  assert.equal(noMatch.length, 0);
});

test('CART STORAGE & TTL: loadCartData migrates legacy array format', () => {
  const catalog = [{ name: 'Rosa', price: 7 }];
  const legacyJson = JSON.stringify([{ name: 'Rosa', price: 7, qty: 2 }]);
  
  const result = loadCartData(legacyJson, catalog, Date.now());
  assert.equal(result.expired, false);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].qty, 2);
  assert.equal(result.items[0].price, 7);
});

test('CART STORAGE & TTL: loadCartData reconciles prices and drops invalid or uncataloged items', () => {
  const catalog = [{ name: 'Rosa', price: 7 }];
  const forgedJson = JSON.stringify({
    updatedAt: Date.now(),
    items: [
      { name: 'Rosa', price: 0.01, qty: 2 },        // tampered price -> should be restored to 7
      { name: 'HackerItem', price: 1, qty: 1 },     // not in catalog -> dropped
      { name: 'Rosa', price: 7, qty: -5 },          // negative qty -> dropped
      { name: 'Rosa', price: 7, qty: 2.5 }          // non-integer qty -> dropped
    ]
  });

  const result = loadCartData(forgedJson, catalog, Date.now());
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].price, 7);
  assert.equal(result.items[0].qty, 2);
});

test('CART STORAGE & TTL: loadCartData expires cart after 30 days', () => {
  const catalog = [{ name: 'Rosa', price: 7 }];
  const now = Date.now();
  const thirtyOneDaysAgo = now - (31 * 24 * 60 * 60 * 1000);

  const expiredJson = JSON.stringify({
    updatedAt: thirtyOneDaysAgo,
    items: [{ name: 'Rosa', price: 7, qty: 1 }]
  });

  const result = loadCartData(expiredJson, catalog, now);
  assert.equal(result.expired, true);
  assert.equal(result.items.length, 0);
});

test('CART STORAGE & TTL: saveCartData wraps items with timestamp', () => {
  const items = [{ name: 'Rosa', price: 7, qty: 2 }];
  const now = 1700000000000;
  const serialized = saveCartData(items, now);
  const parsed = JSON.parse(serialized);

  assert.equal(parsed.updatedAt, now);
  assert.deepEqual(parsed.items, items);
});

test('CART ROBUSTNESS: loadCartData safely handles invalid JSON or corrupted data', () => {
  const catalog = [{ name: 'Rosa', price: 7 }];
  assert.deepEqual(loadCartData('', catalog), { items: [], expired: false });
  assert.deepEqual(loadCartData('not json!', catalog), { items: [], expired: false });
  assert.deepEqual(loadCartData(null, catalog), { items: [], expired: false });
  assert.deepEqual(loadCartData('{}', catalog), { items: [], expired: false });
  assert.deepEqual(loadCartData('{"items": "not an array"}', catalog), { items: [], expired: false });
});

test('CART ROBUSTNESS: loadCartData rejects quantities > 999 or non-finite prices', () => {
  const catalog = [{ name: 'Rosa', price: 7 }];
  const data = JSON.stringify({
    items: [
      { name: 'Rosa', price: 7, qty: 1000 }, // > 999
      { name: 'Rosa', price: Infinity, qty: 1 },
      { name: 'Rosa', price: 7, qty: 5 } // valid
    ]
  });
  const result = loadCartData(data, catalog);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].qty, 5);
});

test('SECURITY: loadCartData strips injected/foreign properties to prevent smuggling', () => {
  const catalog = [{ name: 'Rosa', price: 7 }];
  const data = JSON.stringify({
    updatedAt: Date.now(),
    items: [
      { name: 'Rosa', price: 7, qty: 1, extraField: 'malicious', admin: true }
    ]
  });
  const result = loadCartData(data, catalog);
  assert.equal(result.items.length, 1);
  assert.deepEqual(Object.keys(result.items[0]).sort(), ['name', 'price', 'qty'].sort());
  assert.equal(result.items[0].extraField, undefined);
  assert.equal(result.items[0].admin, undefined);
});

test('SECURITY: loadCartData expires corrupted or non-positive updatedAt timestamps', () => {
  const catalog = [{ name: 'Rosa', price: 7 }];
  const corruptedNull = JSON.stringify({ updatedAt: null, items: [{ name: 'Rosa', price: 7, qty: 1 }] });
  assert.equal(loadCartData(corruptedNull, catalog).expired, true);

  const corruptedNegative = JSON.stringify({ updatedAt: -500, items: [{ name: 'Rosa', price: 7, qty: 1 }] });
  assert.equal(loadCartData(corruptedNegative, catalog).expired, true);
});

test('RELIABILITY: filterProductList safely handles corrupted product records with missing fields', () => {
  const malformed = [
    { name: null, cat: 'vela', desc: null },
    { cat: 'pulsera' },
    null,
    undefined,
    { name: 'Rosa', cat: 'vela', desc: 'Vela artesanal' }
  ];
  const result = filterProductList(malformed, 'todos', 'rosa');
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Rosa');
});

test('FILTERS: la colección "Velas Navideñas" agrupa piezas por temporada sin sacarlas de su categoría', () => {
  const testProducts = [
    { name: 'Pino Navideño', cat: 'vela', desc: 'Canela', season: 'navidad' },
    { name: 'Rosa', cat: 'vela', desc: 'Coco' },
    { name: 'Mini Corazones', cat: 'melt', desc: 'Jazmin' }
  ];
  const testCatMap = { vela: 'velas', melt: 'melts' };

  const navidad = filterProductList(testProducts, 'navidad', '', testCatMap);
  assert.equal(navidad.length, 1);
  assert.equal(navidad[0].name, 'Pino Navideño');

  // La pieza estacional sigue viva en su categoría madre
  assert.equal(filterProductList(testProducts, 'velas', '', testCatMap).length, 2);
  // No se cuela en otras categorías ni ignora el buscador
  assert.equal(filterProductList(testProducts, 'melts', '', testCatMap).length, 1);
  assert.equal(filterProductList(testProducts, 'navidad', 'rosa', testCatMap).length, 0);
  assert.equal(filterProductList(testProducts, 'todos', '', testCatMap).length, 3);
});

test('FILTERS: el catálogo real marca las piezas de temporada y siguen siendo velas', () => {
  const seasonal = (products || []).filter(p => p.season === 'navidad');
  assert.ok(seasonal.length >= 1, 'debe haber al menos una pieza en Velas Navideñas');
  assert.ok(seasonal.every(p => p.cat === 'vela'), 'las piezas navideñas actuales son velas');
  assert.equal(filterProductList(products, 'navidad', '', catMap).length, seasonal.length);
});

test('FILTERS: cada chip del catálogo tiene su descripción de categoría', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const chips = [...html.matchAll(/class="filter-btn[^"]*" data-filter="([a-z-]+)"/g)].map(m => m[1]);
  assert.ok(chips.includes('todos'), 'falta el chip Todos');
  assert.ok(chips.includes('navidad'), 'falta el chip Velas Navideñas');
  for (const chip of chips) {
    if (chip === 'todos') continue;
    const known = catDescriptions[chip] || Object.values(seasonFilters).includes(chip);
    assert.ok(known, `el chip "${chip}" no tiene categoría ni colección asociada`);
  }
  assert.ok(catDescriptions.navidad && catDescriptions.navidad.length > 20,
    'Velas Navideñas necesita texto de introducción propio');
});



