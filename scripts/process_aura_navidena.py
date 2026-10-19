#!/usr/bin/env python3
"""Procesa la foto de la vela 'Aura Navidad' al estandar del catalogo YoSoy222."""
from PIL import Image, ImageFilter, ImageEnhance
import sys

SRC = '/home/debianserver/.hermes/cache/images/img_daacb00b5348.jpg'
NAME = 'VE-AURA-NAVIDAD_vela_aura_navidena_409g'
CROP = (130, 335, 655, 1060)
SHARPEN = True

img = Image.open(SRC).convert('RGB')
band = img.crop(CROP)
if SHARPEN:
    band = band.filter(ImageFilter.UnsharpMask(radius=2, percent=50, threshold=3))
    band = ImageEnhance.Contrast(band).enhance(1.02)
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
    import os
    print(f'{dst}: producto {prod.size} sobre {size}x{size} ({os.path.getsize(dst)//1024} KB)')

if len(sys.argv) > 1 and sys.argv[1] == '--debug':
    img.crop(CROP).resize((480, int(480 * band.height / band.width))).save(
        '/home/debianserver/.hermes/cache/scratch/aura_banda.jpg', quality=90)
    print('debug banda -> scratch/aura_banda.jpg')