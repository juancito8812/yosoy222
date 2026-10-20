#!/usr/bin/env python3
"""Cruz con Paloma — template estándar de la tienda.

Fondo: la misma foto ampliada y desenfocada (blur-fill).
Primer plano: banda 3:2 nítida, sin halo ni borde difuminado alrededor.
La foto amarilla se neutraliza a la pared crema del resto.
"""
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np

CACHE = '/home/debianserver/.hermes/cache/images/'
OUT = '/home/debianserver/Documentos/programacion/yosoy222'
BASE = 'VM-CRUZ_vela_cruz_con_paloma_52g'

JOBS = [
    ('img_6c002e56383b.jpg', 700, BASE),          # portada: 3 cruces
    ('img_66c40fddf05f.jpg', 625, BASE + '-v2'),  # celeste
    ('img_652f16c116d5.jpg', 630, BASE + '-v3'),  # roja
    ('img_b9379c85a94b.jpg', 635, BASE + '-v4'),  # amarilla
]

TARGET_WALL = np.array([223, 212, 194], float)  # pared crema de referencia


def neutralize(im):
    """Iguala el balance de blancos de la pared al crema del resto."""
    a = np.asarray(im).astype(float)
    wall = np.median(np.concatenate([a[:80, :120].reshape(-1, 3),
                                     a[:80, -120:].reshape(-1, 3)]), 0)
    gain = np.clip(TARGET_WALL / np.maximum(wall, 1), 0.85, 1.25)
    return Image.fromarray(np.clip(a * gain, 0, 255).astype(np.uint8))


def template(im, cx, size=900, ratio=3 / 2):
    w, h = im.size
    side = min(w, h)
    bg = im.crop(((w - side) // 2, 0, (w + side) // 2, side))
    bg = bg.resize((size, size), Image.LANCZOS).filter(ImageFilter.GaussianBlur(30))
    bg = ImageEnhance.Brightness(bg).enhance(0.96)

    band_w = min(w, int(h * ratio))
    left = max(0, min(cx - band_w // 2, w - band_w))
    band = im.crop((left, 0, left + band_w, h))
    band = band.resize((size, int(size * h / band_w)), Image.LANCZOS)
    band = band.filter(ImageFilter.UnsharpMask(radius=1.4, percent=45, threshold=3))

    canvas = bg.copy()
    canvas.paste(band, (0, (size - band.height) // 2))
    return canvas


for src, cx, name in JOBS:
    im = Image.open(CACHE + src).convert('RGB')
    if 'b9379' in src:               # única foto con pared gris
        im = neutralize(im)
    art = template(im, cx)
    for folder, px, q in (('images/thumbs', 480, 78), ('images/catalog', 900, 82)):
        art.resize((px, px), Image.LANCZOS).save(
            f'{OUT}/{folder}/{name}.jpg', 'JPEG', quality=q, optimize=True, progressive=True)
        print(f'{folder}/{name}.jpg', px)
