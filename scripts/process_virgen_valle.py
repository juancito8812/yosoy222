#!/usr/bin/env python3
"""Procesa la foto de la vela 'Virgen del Valle' al estándar del catálogo YoSoy222.

- Recorta la figura completa (corona + base) con margen y su sombra de contacto.
- Fondo difuminado desde la imagen original (resize + blur + brightness 0.85).
- thumbs 480 q78 / catalog 900 q80, cuadradas 1:1.
"""
from PIL import Image, ImageFilter, ImageEnhance
import os
import sys

SRC = '/home/debianserver/.hermes/cache/images/img_0b2ad7e44550.jpg'
NAME = 'VM-VIRGEN-VALLE_vela_virgen_del_valle_32g'
# Figura completa: x≈425..660, y≈120..670 (medido sobre 1280x835) + margen.
CROP = (392, 88, 700, 706)
SHARPEN = True

img = Image.open(SRC).convert('RGB')
band = img.crop(CROP)
if SHARPEN:
    band = band.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=3))
    band = ImageEnhance.Contrast(band).enhance(1.03)
print('banda:', band.size, 'aspecto', round(band.width / band.height, 2))

for folder, size, blur_r, quality in (
    ('images/thumbs', 480, 25, 78),
    ('images/catalog', 900, 35, 80),
):
    bg = img.resize((size, size), Image.LANCZOS)
    bg = bg.filter(ImageFilter.GaussianBlur(radius=blur_r))
    bg = ImageEnhance.Brightness(bg).enhance(0.85)

    prod = band.copy()
    prod.thumbnail((int(size * 0.917), int(size * 0.917)), Image.LANCZOS)
    bg.paste(prod, ((size - prod.width) // 2, (size - prod.height) // 2))

    dst = f'{folder}/{NAME}.jpg'
    bg.save(dst, 'JPEG', quality=quality, optimize=True)
    print(f'{dst}: producto {prod.size} sobre {size}x{size} ({os.path.getsize(dst)//1024} KB)')

if len(sys.argv) > 1 and sys.argv[1] == '--debug':
    img.crop(CROP).resize((480, int(480 * band.height / band.width))).save(
        '/home/debianserver/.hermes/cache/scratch/virgen_banda.jpg', quality=90)
    print('debug banda -> scratch/virgen_banda.jpg')
