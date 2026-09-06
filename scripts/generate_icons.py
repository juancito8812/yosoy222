#!/usr/bin/env python3
"""
Genera los iconos PWA del sitio a partir de la imagen de WhatsApp adjunta.

Política de iconos:
- "any"  -> fondo blanco, sin transparencia (mejor compatibilidad con lanzadores).
- "maskable" -> conserva canal alfa (sirve para iconos que se recortan en la plataforma).

Fuente: imagen adjunta con fondo blanco.
Proceso:
1. Cargar imagen a RGBA.
2. Píxeles "blancos" (R,G,B >= 250) -> hacer transparentes.
3. Cada tamaño:
   - Redimensionar a T x T.
   - Centrar sobre canvas square transparente.
   - "any": aplanar sobre fondo blanco (RGB).
   - "maskable": mantener RGBA.
"""

import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image

# Configuración del proyecto
REPO_ROOT = Path(__file__).resolve().parent.parent
ICONS_DIR = REPO_ROOT / "icons"
SOURCE_IMAGE = "/home/jr/.var/app/org.telegram.desktop/data/TelegramDesktop/tdata/temp_data/photo_2026-09-05_22-43-50.jpg"

ANY_SIZES = {
    "icon-72x72.png": 72,
    "icon-96x96.png": 96,
    "icon-128x128.png": 128,
    "icon-144x144.png": 144,
    "icon-152x152.png": 152,
    "icon-192x192.png": 192,
    "icon-384x384.png": 384,
    "icon-512x512.png": 512,
}

MASKABLE_SIZES = {
    "icon-maskable-192x192.png": 192,
    "icon-maskable-512x512.png": 512,
}

WHITE_THRESHOLD = 250
PAD_FRACTION = 0.06  # padding suave para maskable


def load_base_image(path: str) -> Image.Image:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Imagen fuente no encontrada: {path}")
    im = Image.open(path).convert("RGBA")
    arr = np.array(im).astype(np.uint8)
    rgb = arr[..., :3]
    alpha = arr[..., 3].copy()
    white = (rgb >= WHITE_THRESHOLD).all(axis=2)
    alpha[white] = 0
    return Image.fromarray(np.dstack([rgb, alpha]))


def square_center(img: Image.Image, size: int) -> Image.Image:
    im = img.resize((size, size), Image.LANCZOS)
    W, H = im.size
    s = max(W, H)
    sq = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    sq.paste(im, ((s - W) // 2, (s - H) // 2))
    return sq.resize((size, size), Image.LANCZOS)


def make_any(img: Image.Image, size: int) -> Image.Image:
    rgba = square_center(img, size)
    flat = Image.new("RGB", (size, size), (255, 255, 255))
    flat.paste(rgba, mask=rgba.split()[3])
    return flat


def make_maskable(img: Image.Image, size: int) -> Image.Image:
    im = img.resize((size, size), Image.LANCZOS)
    W, H = im.size
    pad_x = int(W * PAD_FRACTION)
    pad_y = int(H * PAD_FRACTION)
    crop = im.crop((pad_x, pad_y, W - pad_x, H - pad_y))
    s2 = max(crop.size)
    canvas = Image.new("RGBA", (s2, s2), (0, 0, 0, 0))
    canvas.paste(crop, ((s2 - crop.size[0]) // 2, (s2 - crop.size[1]) // 2))
    return canvas.resize((size, size), Image.LANCZOS)


def verify_any_opaque(path: Path) -> bool:
    if not path.exists():
        return False
    a = np.array(Image.open(path))
    if a.shape[2] != 3:
        return False
    return True


def main() -> int:
    print("fuente:", SOURCE_IMAGE)
    base = load_base_image(SOURCE_IMAGE)

    for name, size in ANY_SIZES.items():
        path = ICONS_DIR / name
        img = make_any(base, size)
        img.save(path, optimize=True)
        print(f"any  {name} -> {path}")

    for name, size in MASKABLE_SIZES.items():
        path = ICONS_DIR / name
        img = make_maskable(base, size)
        img.save(path, optimize=True)
        print(f"mask {name} -> {path}")

    print("\n verificando any opacos...")
    issues = []
    for name, size in ANY_SIZES.items():
        path = ICONS_DIR / name
        if not verify_any_opaque(path):
            issues.append(name)

    if issues:
        print("ERROR any no opacos:", issues)
        return 1

    print("OK todos los any están aplanados (RGB sin alpha)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
