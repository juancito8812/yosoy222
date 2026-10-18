#!/usr/bin/env python3
"""
scripts/prerender_catalog.py
Lee los productos de js/app.js y prerenderiza las tarjetas de producto
dentro de <div class="products-grid" id="productsGrid"> en index.html.
Esto asegura que motores de búsqueda (Google, Bing), rastreadores de IA
y navegadores sin JavaScript puedan indexar y ver los 45 productos inmediatamente.
"""

import json
import re
import sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
APP_JS = ROOT / 'js' / 'app.js'
INDEX_HTML = ROOT / 'index.html'

SITE_URL = 'https://yosoy222.com/'
CATALOG_URL = SITE_URL + '#catalogo'
ITEMLIST_START = '    <!-- SCHEMA-ITEMLIST:START -->'
ITEMLIST_END = '    <!-- SCHEMA-ITEMLIST:END -->'


def image_path(file):
    """Nombre de archivo listo para URL (percent-encoded).

    Hay fotos heredadas con espacios en el nombre ("Armonia Coco.jpg"). Sin
    codificar, la URL viaja con un espacio literal tanto al JSON-LD como a la
    tarjeta: los validadores la marcan como URL inválida y algunos clientes la
    rechazan. quote() no toca los nombres que ya son limpios.
    """
    return quote(file, safe='')


def build_itemlist(matches):
    """Genera el JSON-LD ItemList con los productos del catálogo.

    Google solo puede construir un listado de productos si cada ListItem
    apunta a un Product con nombre, imagen, oferta y disponibilidad; por eso
    se emite un bloque derivado de app.js (fuente única de verdad) en lugar
    de mantenerlo a mano, que es como se quedó desincronizado antes.
    """
    items = []
    for position, (file, name, cat, price, desc, *_season) in enumerate(matches, start=1):
        price_val = float(price)
        items.append({
            "@type": "ListItem",
            "position": position,
            "item": {
                "@type": "Product",
                "name": name,
                "image": SITE_URL + 'images/thumbs/' + image_path(file),
                "description": desc,
                "category": cat,
                "url": CATALOG_URL,
                "offers": {
                    "@type": "Offer",
                    "price": f"{price_val:.2f}",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock",
                    "url": CATALOG_URL,
                    "seller": {"@type": "LocalBusiness", "@id": SITE_URL + '#store'},
                },
            },
        })

    data = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Catálogo YoSoy222",
        "description": f"Catálogo artesanal de YoSoy222: {len(items)} productos hechos a mano en Venezuela.",
        "url": CATALOG_URL,
        "numberOfItems": len(items),
        "itemListOrder": "https://schema.org/ItemListOrderAscending",
        "itemListElement": items,
    }
    body = json.dumps(data, ensure_ascii=False, indent=2)
    body = '\n'.join('    ' + line for line in body.splitlines())
    return (
        f'{ITEMLIST_START}\n'
        f'    <script type="application/ld+json">\n'
        f'{body}\n'
        f'    </script>\n'
        f'{ITEMLIST_END}\n'
    )


def inject_itemlist(html, block):
    """Reemplaza el bloque entre marcas o lo inserta antes de </head>."""
    start = html.find(ITEMLIST_START)
    if start != -1:
        end = html.find(ITEMLIST_END, start)
        if end == -1:
            print("Error: SCHEMA-ITEMLIST:START sin SCHEMA-ITEMLIST:END", file=sys.stderr)
            sys.exit(1)
        return html[:start] + block + html[end + len(ITEMLIST_END) + 1:]

    head_end = html.find('</head>')
    if head_end == -1:
        print("Error: No se encontró </head> en index.html", file=sys.stderr)
        sys.exit(1)
    return html[:head_end] + block + html[head_end:]

def escape_html(text):
    if isinstance(text, (int, float)):
        return str(text) if not float(text).is_integer() else str(int(text))
    map_chars = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'}
    for k, v in map_chars.items():
        text = text.replace(k, v)
    return text

def main():
    if not APP_JS.exists():
        print(f"Error: No se encontró {APP_JS}", file=sys.stderr)
        sys.exit(1)
    if not INDEX_HTML.exists():
        print(f"Error: No se encontró {INDEX_HTML}", file=sys.stderr)
        sys.exit(1)

    with open(APP_JS, 'r', encoding='utf-8') as f:
        js_content = f.read()

    # Extraer array products
    start = js_content.find('const products = [')
    if start == -1:
        print("Error: No se encontró 'const products = [' en app.js", file=sys.stderr)
        sys.exit(1)
    end = js_content.find('];', start) + 1
    products_js = js_content[start:end]

    pattern = re.compile(
        r'\{\s*file:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*cat:\s*"([^"]+)",\s*price:\s*([0-9.]+),\s*desc:\s*"([^"]+)"'
        r'(?:\s*,\s*season:\s*"([^"]+)")?\s*\}'
    )
    matches = pattern.findall(products_js)

    if not matches:
        print("Error: No se pudieron extraer productos de app.js", file=sys.stderr)
        sys.exit(1)

    cat_labels = {
        'vela': 'Vela ritualista',
        'melt': 'Wax Melts',
        'pulsera': 'Pulsera simbólica',
        'collar': 'Collar con intención',
        'franela': 'Franela con propósito',
        'otro': 'Dije amuleto'
    }

    cards = []
    for i, (file, name, cat, price, desc, *_season) in enumerate(matches):
        price_val = float(price)
        price_str = str(int(price_val)) if price_val.is_integer() else str(price_val)
        card = (
            f'          <article class="product-card" data-index="{i}">\n'
            f'          <button type="button" class="product-image" data-name="{escape_html(name)}" aria-label="Ampliar imagen de {escape_html(name)}">\n'
            f'            <img src="images/thumbs/{escape_html(image_path(file))}?v=14" alt="{escape_html(name)} artesanal" width="480" height="480" loading="lazy" decoding="async">\n'
            f'          </button>\n'
            f'          <div class="product-info">\n'
            f'            <h3>{escape_html(name)}</h3>\n'
            f'            <p class="product-category">{escape_html(cat_labels.get(cat, "Producto artesanal"))}</p>\n'
            f'            <p class="product-desc">{escape_html(desc)}</p>\n'
            f'            <div class="product-footer">\n'
            f'              <span class="product-price"><span class="currency">$</span>{price_str}</span>\n'
            f'              <button class="add-cart-btn" data-name="{escape_html(name)}" data-price="{price_str}">Agregar</button>\n'
            f'            </div>\n'
            f'          </div>\n'
            f'        </article>'
        )
        cards.append(card)

    rendered_grid = '\n' + '\n'.join(cards) + '\n            '

    with open(INDEX_HTML, 'r', encoding='utf-8') as f:
        html = f.read()

    start_tag = '<div class="products-grid" id="productsGrid">'
    end_tag = '<div class="empty-state"'

    start_pos = html.find(start_tag)
    if start_pos == -1:
        print("Error: No se encontró <div class=\"products-grid\" id=\"productsGrid\"> en index.html", file=sys.stderr)
        sys.exit(1)

    end_pos = html.find(end_tag, start_pos)
    if end_pos == -1:
        print("Error: No se encontró <div class=\"empty-state\" en index.html", file=sys.stderr)
        sys.exit(1)

    new_html = html[:start_pos] + start_tag + rendered_grid + '</div>\n\n            ' + html[end_pos:]
    new_html = inject_itemlist(new_html, build_itemlist(matches))

    with open(INDEX_HTML, 'w', encoding='utf-8') as f:
        f.write(new_html)

    print(f"Éxito: Se prerenderizaron {len(cards)} productos en index.html "
          f"(+ItemList JSON-LD con {len(matches)} items).")

if __name__ == '__main__':
    main()
