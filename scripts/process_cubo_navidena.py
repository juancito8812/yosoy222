#!/usr/bin/env python3
"""Procesa la foto de la vela 'Cubo Navideño' al estándar del catálogo YoSoy222.

- Recorta la banda del producto (velas + losa), sin marco de fondo desenfocado.
- Fondo difuminado desde la imagen original (guide: resize + blur + brightness 0.85).
- thumbs 480 q78 / catalog 900 q80, cuadradas 1:1.
"""
from PIL import Image, ImageFilter, ImageEnhance
import sys

SRC = '/home/debianserver/.hermes/cache/images/img_d295c741e2d4.jpg'
NAME = 'VM-CUBO-NAVIDAD_vela_cubo_navidena_40g'
# Banda del producto detectada con rejilla: velas y≈410..785, losa al frente.
CROP = (0, 392, 720, 835)
SHARPEN = True  # contrarresta la suavidad del original (móvil, luz difusa)

img = Image.open(SRC).convert('RGB')
band = img.crop(CROP)
if SHARPEN:
    from PIL import ImageEnhance as _E
    band = band.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=3))
    band = _E.Contrast(band).enhance(1.03)
print('banda:', band.size, 'aspecto', round(band.width / band.height, 2))

for folder, size, blur_r, quality in (
    ('images/thumbs', 480, 25, 78),
    ('images/catalog', 900, 35, 80),
):
    bg = img.resize((size, size), Image.LANCZOS)          # igual que la guía (fondo = original)
    bg = bg.filter(ImageFilter.GaussianBlur(radius=blur_r))
    bg = ImageEnhance.Brightness(bg).enhance(0.85)

    prod = band.copy()
    prod.thumbnail((int(size * 0.917), int(size * 0.917)), Image.LANCZOS)   # ~440/840 como la guía
    bg.paste(prod, ((size - prod.width) // 2, (size - prod.height) // 2))

    dst = f'{folder}/{NAME}.jpg'
    bg.save(dst, 'JPEG', quality=quality, optimize=True)
    import os
    print(f'{dst}: producto {prod.size} sobre {size}x{size} ({os.path.getsize(dst)//1024} KB)')

if len(sys.argv) > 1 and sys.argv[1] == '--debug':
    img.crop(CROP).resize((480, int(480 * band.height / band.width))).save(
        '/home/debianserver/.hermes/cache/scratch/cubo_banda.jpg', quality=90)
    print('debug banda -> scratch/cubo_banda.jpg')
