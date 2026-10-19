#!/usr/bin/env python3
"""Procesa la foto de la vela 'Ondulada' (40 g) al estándar del catálogo YoSoy222.

Foto grupal: cuatro velas onduladas blancas con letras doradas (Fé y Familia)
sobre losa de travertino. Se recorta el grupo completo con su base y se compone
sobre el fondo original difuminado (cuadradas 1:1).
"""
from PIL import Image, ImageFilter, ImageEnhance
import os
import sys

SRC = '/home/debianserver/.hermes/cache/images/img_db294befc568.jpg'
NAME = 'VM-ONDULADA_vela_ondulada_40g'
# Grupo de 4 velas + losa: x≈270..1010, y≈100..570 (sobre 1280x714) + margen.
CROP = (238, 72, 1042, 604)
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
    band.resize((640, int(640 * band.height / band.width))).save(
        '/home/debianserver/.hermes/cache/scratch/ondulada_banda.jpg', quality=90)
    print('debug banda -> scratch/ondulada_banda.jpg')
