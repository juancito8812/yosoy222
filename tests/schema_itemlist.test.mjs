import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const appJs = readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const html = readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const PRODUCT_RE = /\{\s*file:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*cat:\s*"([^"]+)",\s*price:\s*([0-9.]+),\s*desc:\s*"([^"]+)"(?:\s*,\s*season:\s*"([^"]+)")?\s*\}/g;

function productsFromApp() {
  const out = [];
  for (const m of appJs.matchAll(PRODUCT_RE)) {
    out.push({ file: m[1], name: m[2], cat: m[3], price: m[4], desc: m[5] });
  }
  return out;
}

function itemListBlocks() {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => m[1]);
  const parsed = [];
  for (const raw of blocks) {
    const data = JSON.parse(raw);
    if (data['@type'] === 'ItemList') parsed.push(data);
  }
  return parsed;
}

test('SCHEMA: index.html expone exactamente un ItemList JSON-LD', () => {
  // Un solo bloque: si el prerender dejara de ser idempotente aparecerían duplicados
  assert.equal(itemListBlocks().length, 1);
  assert.equal(html.match(/SCHEMA-ITEMLIST:START/g).length, 1);
  assert.equal(html.match(/SCHEMA-ITEMLIST:END/g).length, 1);
});

test('SCHEMA: el ItemList declara todos los productos de app.js en orden', () => {
  const products = productsFromApp();
  const [list] = itemListBlocks();
  assert.ok(products.length > 0, 'app.js debe declarar productos');
  assert.equal(list.numberOfItems, products.length);
  assert.equal(list.itemListElement.length, products.length);

  list.itemListElement.forEach((entry, i) => {
    assert.equal(entry['@type'], 'ListItem');
    assert.equal(entry.position, i + 1, `posición ${i + 1} fuera de secuencia`);
    assert.equal(entry.item.name, products[i].name, `nombre desincronizado en posición ${i + 1}`);
  });
});

test('SCHEMA: cada Product lleva imagen absoluta y oferta en USD con disponibilidad', () => {
  for (const entry of itemListBlocks()[0].itemListElement) {
    const { item } = entry;
    assert.equal(item['@type'], 'Product');
    assert.match(item.image, /^https:\/\/yosoy222\.com\/images\/thumbs\/.+\.jpg$/);
    assert.ok(item.description.length > 0);
    assert.equal(item.offers['@type'], 'Offer');
    assert.match(item.offers.price, /^\d+\.\d{2}$/);
    assert.equal(item.offers.priceCurrency, 'USD');
    assert.equal(item.offers.availability, 'https://schema.org/InStock');
  }
});

test('SCHEMA: el catálogo y el ItemList no se desincronizan (49 tarjetas)', () => {
  const cards = html.match(/class="product-card"/g) || [];
  assert.equal(cards.length, productsFromApp().length);
  assert.equal(cards.length, itemListBlocks()[0].numberOfItems);
});
