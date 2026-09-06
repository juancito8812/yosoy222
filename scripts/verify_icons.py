#!/usr/bin/env python3
"""
Verifica los iconos PWA del sitio contra manifest.json.

Comprueba por cada entrada del manifest:
- existe el archivo en icons/
- el ancho y alto reales coinciden con sizes declarados
- los iconos "any" son RGB planos (sin alpha)
- los iconos "maskable" son RGBA

Uso:
    python3 scripts/verify_icons.py
"""

import json
import sys
from pathlib import Path

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
ICONS_DIR = REPO_ROOT / "icons"
MANIFEST_PATH = REPO_ROOT / "manifest.json"


def main() -> int:
    if not MANIFEST_PATH.exists():
        print(f"ERROR: no encuentra {MANIFEST_PATH}")
        return 1

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    icons = manifest.get("icons", [])
    if not isinstance(icons, list):
        print("ERROR: manifest.json no tiene 'icons' como array")
        return 1

    total_any = 0
    total_mask = 0
    ok_any = 0
    ok_mask = 0
    problems = []

    for entry in icons:
        src = entry.get("src", "")
        declared = entry.get("sizes", "")
        purpose = entry.get("purpose", None)

        if not declared or "x" not in declared:
            problems.append(f"{src}: sizes mal formado -> {declared}")
            continue

        try:
            w_decl, h_decl = map(int, declared.split("x"))
        except ValueError:
            problems.append(f"{src}: no puedo parsear sizes -> {declared}")
            continue

        # Ajustar ruta para que siempre sea absoluta respecto a REPO_ROOT
        clean_src = str(src).lstrip("/")
        path = REPO_ROOT / clean_src
        if not path.exists():
            problems.append(f"{src}: archivo no existe")
            continue

        try:
            im = Image.open(path)
        except Exception as exc:
            problems.append(f"{src}: no puedo abrir la imagen -> {exc}")
            continue

        if (im.width, im.height) != (w_decl, h_decl):
            problems.append(
                f"{src}: declarado {declared} pero archivo {im.width}x{im.height}"
            )
            continue

        if purpose in (None, "any"):
            total_any += 1
            if im.mode == "RGB" and len(im.split()) == 3:
                ok_any += 1
            else:
                problems.append(f"{src}: any debería ser RGB plano, veo {im.mode}")
        elif purpose == "maskable":
            total_mask += 1
            if im.mode == "RGBA" and len(im.split()) == 4:
                ok_mask += 1
            else:
                problems.append(f"{src}: maskable debería ser RGBA, veo {im.mode}")
        else:
            problems.append(f"{src}: purpose no reconocido -> {purpose}")

    print(f"any planos OK: {ok_any} / {total_any}")
    print(f"maskable rgba OK: {ok_mask} / {total_mask}")

    if problems:
        print("problemas:")
        for p in problems:
            print(" -", p)
        return 1

    print("OK: iconos coincidence con manifest.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
