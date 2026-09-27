#!/usr/bin/env python3
"""Construye el índice de variantes de color y valida la convención de nombres.

Convención (ver IMAGE_GUIDE.md, sección «Variantes de color»):
  la vela principal conserva el file: exacto del producto en js/app.js;
  los otros colores de la MISMA vela se nombran agregando el sufijo
  `-v2`, `-v3`, … ANTES de la extensión, en ambas carpetas:

    images/thumbs/VM-ROSA_vela_rosa_79g.jpg        ← principal (la del catálogo)
    images/thumbs/VM-ROSA_vela_rosa_79g-v2.jpg     ← color 2
    images/catalog/VM-ROSA_vela_rosa_79g-v3.jpg    ← color 3 (lightbox)

Genera js/variants.json (inmutable en runtime, se regenera con este script)
y valida que ninguna variante quede huérfana (thumbs sin catalog y viceversa).

Uso:
    python3 scripts/build_variants.py            # escribe js/variants.json
    python3 scripts/build_variants.py --check    # solo valida, no escribe
"""

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
VARIANT_RE = re.compile(r'^(.+\S)-v(\d+)\.jpg$', re.IGNORECASE)


def scan(folder: Path) -> dict:
    """Devuelve {base_file: [sufijos ordenados]} detectados en una carpeta."""
    found = {}
    if not folder.exists():
        return found
    for p in sorted(folder.glob('*.jpg')):
        m = VARIANT_RE.match(p.name)
        if m:
            base, n = m.group(1) + '.jpg', int(m.group(2))
            found.setdefault(base, []).append((n, p.name))
    for base in found:
        found[base] = [name for _, name in sorted(found[base])]
    return found


def main() -> int:
    thumbs = scan(REPO_ROOT / 'images' / 'thumbs')
    catalog = scan(REPO_ROOT / 'images' / 'catalog')

    bases = sorted(set(thumbs) | set(catalog))
    variants = {}
    problemas = []

    for base in bases:
        t, c = thumbs.get(base, []), catalog.get(base, [])
        if t and not c:
            problemas.append(f'{base}: hay variantes en thumbs ({len(t)}) pero ninguna en catalog')
        if c and not t:
            problemas.append(f'{base}: hay variantes en catalog ({len(c)}) pero ninguna en thumbs')
        if set(t) != set(c):
            solo_t = sorted(set(t) - set(c))
            solo_c = sorted(set(c) - set(t))
            if solo_t:
                problemas.append(f'{base}: sin contraparte en catalog: {", ".join(solo_t)}')
            if solo_c:
                problemas.append(f'{base}: sin contraparte en thumbs: {", ".join(solo_c)}')
        variantes = sorted(set(t) & set(c), key=lambda n: int(VARIANT_RE.match(n).group(2)))
        if variantes:
            variants[base] = variantes

    if problemas:
        print('PROBLEMAS de convención:')
        for p in problemas:
            print('  ✗', p)
        return 1

    if '--check' in sys.argv:
        print(f'OK: {len(variants)} productos con variantes de color '
              f'({sum(len(v) for v in variants.values())} variantes en total)')
        for base, lista in variants.items():
            print(f'  {base}: principal + {len(lista)} variantes ({", ".join(n.replace(".jpg","") for n in lista)})')
        return 0

    out = REPO_ROOT / 'js' / 'variants.json'
    out.write_text(json.dumps(variants, indent=1, ensure_ascii=False), encoding='utf-8')
    total = sum(len(v) for v in variants.values())
    print(f'Escrito {out} — {len(variants)} productos con variantes ({total} fotos extra)')
    for base, lista in variants.items():
        print(f'  {base}: +{len(lista)} colores')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
