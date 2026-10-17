#!/usr/bin/env python3
"""Guard de CI: si cambia contenido cacheable, la versión de caché debe subir.

Incidente 17-oct-2026: la vela "Pino Navideño" y el bloque `ItemList` se
publicaron SIN subir la versión de caché (v50 → seguía v50). El HTML se
refresca rápido (max-age 600), pero `js/*.js`, `css/*.css` y `sw.js` quedan
cacheados horas en el borde y en el navegador: los usuarios con caché —y las
PWA instaladas— siguieron viendo el catálogo de 44 productos sin la vela.

Este script compara el commit actual con su padre y falla el build cuando
detecta contenido cacheable modificado sin bump de `CACHE_NAME` en `sw.js`.

Uso:
    python3 scripts/check_cache_bump.py [rev_base]     # por defecto HEAD^

Escape (cambio cacheable legítimo sin bump, p. ej. sólo comentarios):
    CACHE_BUMP_SKIP=1 python3 scripts/check_cache_bump.py
"""

import os
import re
import subprocess
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
SW_JS = ROOT / 'sw.js'

# Rutas cuyo contenido llega al cliente y viaja con `?v=NN`.
WATCHED_PREFIXES = (
    'js/',
    'css/',
    'legal/',
)
WATCHED_FILES = (
    'index.html',
    'dashboard.html',
    'manifest.json',
)
# `sw.js` queda fuera: ahí vive la versión, su cambio es consecuencia del bump.


def git(*args: str, cwd: Path = ROOT) -> str:
    return subprocess.run(
        ['git', *args], cwd=cwd, check=True, capture_output=True, text=True
    ).stdout


def cache_version(text: str) -> int | None:
    m = re.search(r"CACHE_NAME\s*=\s*'yosoy222-v(\d+)'", text)
    return int(m.group(1)) if m else None


def version_at(rev: str) -> int | None:
    try:
        return cache_version(git('show', f'{rev}:sw.js'))
    except subprocess.CalledProcessError:
        return None


def changed_files(base: str) -> list[str] | None:
    try:
        out = git('diff', '--name-only', base, 'HEAD')
    except subprocess.CalledProcessError:
        return None
    return [line.strip() for line in out.splitlines() if line.strip()]


def is_watched(path: str) -> bool:
    if path in WATCHED_FILES:
        return True
    return any(path.startswith(prefix) for prefix in WATCHED_PREFIXES)


def main() -> int:
    base = sys.argv[1] if len(sys.argv) > 1 else 'HEAD^'
    if os.environ.get('CACHE_BUMP_SKIP') == '1':
        print('AVISO: CACHE_BUMP_SKIP=1 → guard de versión de caché omitido.')
        return 0

    files = changed_files(base)
    if files is None:
        print(f'AVISO: no se pudo comparar con {base} (¿clon superficial?). Guard omitido.')
        return 0

    touched = sorted(f for f in files if is_watched(f))
    if not touched:
        print('OK: sin cambios de contenido cacheable; no hace falta bump de versión.')
        return 0

    before = version_at(base)
    after = cache_version(SW_JS.read_text(encoding='utf-8'))
    if before is None or after is None:
        print('AVISO: no se pudo leer CACHE_NAME en sw.js (actual o anterior). Guard omitido.')
        return 0

    if after == before:
        print(
            f'ERROR: {len(touched)} archivo(s) cacheable(s) cambiaron pero la versión '
            f'de caché sigue en v{after}. Sube `CACHE_NAME` en sw.js y todas las refs '
            '`?v=` en el mismo commit, o el cambio no llegará a los usuarios con caché.'
        )
        for path in touched[:15]:
            print(f'  - {path}')
        if len(touched) > 15:
            print(f'  … y {len(touched) - 15} más')
        return 1

    print(f'OK: versión de caché v{before} → v{after} con {len(touched)} archivo(s) cacheable(s).')
    return 0


if __name__ == '__main__':
    sys.exit(main())
