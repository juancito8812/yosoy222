#!/usr/bin/env python3
"""Unifica Aura Navidad y Virgen del Valle al template del catálogo.

Template que usan las demás velas:
  - cuadrado 900x900 (catalog) / 480x480 (thumb)
  - producto insertado centrado ocupando ~80% de la altura
  - fondo = la misma foto ampliada + blur + leve oscurecido
  - balance de blancos neutro (pared de fondo gris/blanca, no beige)
"""
from PIL import Image, ImageFilter, ImageEnhance
import os

TARGETS = [
    # (fuente, caja del producto, nombre destino)
    ('/home/debianserver/.hermes/cache/images/img_33dcea7a58cd.jpg',
     (305, 300, 1905, 1364),
     'VE-AURA-NAVIDAD_vela_aura_navidena_409g'),
    ('/home/debianserver/.hermes/cache/images/img_0b2ad7e44550.jpg',
     (0, 40, 1108, 790),
     'VM-VIRGEN-VALLE_vela_virgen_del_valle_32g'),
]
H_FILL = 0.62


def neutralize(im, strength=0.55):
    """Acerca el balance de blancos al gris neutro usando la esquina superior."""
    w, h = im.size
    patch = im.crop((0, 0, max(1, w // 6), max(1, h // 6)))
    px = list(patch.getdata())
    r = sum(p[0] for p in px) / len(px)
    g = sum(p[1] for p in px) / len(px)
    b = sum(p[2] for p in px) / len(px)
    avg = (r + g + b) / 3
    gains = [1 + (avg / max(v, 1) - 1) * strength for v in (r, g, b)]
    return im.point(lambda i: i), gains


def apply_gains(im, gains):
    r, g, b = im.split()
    r = r.point(lambda i: min(255, int(i * gains[0])))
    g = g.point(lambda i: min(255, int(i * gains[1])))
    b = b.point(lambda i: min(255, int(i * gains[2])))
    return Image.merge('RGB', (r, g, b))


def band_box(im, box):
    """Si no hay caja, detecta el producto por contraste con la pared."""
    if box:
        return box
    g = im.convert('L').resize((im.width // 4, im.height // 4))
    w, h = g.size
    bg = g.crop((0, 0, w // 8, h // 8))
    bg_mean = sum(bg.getdata()) / (bg.width * bg.height)
    diff = g.point(lambda i: 255 if abs(i - bg_mean) > 12 else 0)
    diff = diff.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
    bbox = diff.getbbox() or (0, 0, w, h)
    pad = 6
    return tuple(max(0, v * 4) for v in (
        max(0, bbox[0] - pad), max(0, bbox[1] - pad),
        min(w, bbox[2] + pad), min(h, bbox[3] + pad)))


for src, box, name in TARGETS:
    img = Image.open(src).convert('RGB')
    box = band_box(img, box)
    prod = img.crop(box)
    prod = prod.filter(ImageFilter.UnsharpMask(radius=2, percent=55, threshold=3))
    prod = ImageEnhance.Contrast(prod).enhance(1.02)
    print(f'{name}: caja {box} -> producto {prod.size}')

    for folder, size, blur_r, q in (('images/thumbs', 480, 22, 78),
                                    ('images/catalog', 900, 32, 80)):
        bg = img.resize((size, size), Image.LANCZOS)
        bg = bg.filter(ImageFilter.GaussianBlur(radius=blur_r))
        bg = ImageEnhance.Brightness(bg).enhance(0.88)
        bg = ImageEnhance.Color(bg).enhance(0.85)
        # neutro: quitar dominante cálida del fondo
        bg = apply_gains(bg, (0.96, 1.0, 1.04))

        p = prod.copy()
        p.thumbnail((int(size * 0.94), int(size * H_FILL)), Image.LANCZOS)
        p = apply_gains(p, (0.97, 1.0, 1.02))
        bg.paste(p, ((size - p.width) // 2, (size - p.height) // 2))

        dst = f'{folder}/{name}.jpg'
        bg.save(dst, 'JPEG', quality=q, optimize=True)
        print(f'  {dst}: producto {p.size} en {size}x{size} ({os.path.getsize(dst)//1024} KB)')
