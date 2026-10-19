#!/usr/bin/env python3
"""Reemplaza la foto de 'Aura Navidad' (409 g) por la nueva toma del dueño.

Nueva foto: vela en vaso de vidrio con capas rojo/verde/blanco, corazones de cera
y dos pabilos, sobre tapa de madera y losa de travertino. Se recorta el conjunto
y se compone sobre el fondo original difuminado (cuadradas 1:1), igual que el
resto del catálogo.
"""
from PIL import Image, ImageFilter, ImageEnhance
import os

SRC = '/home/debianserver/.hermes/cache/images/img_33dcea7a58cd.jpg'
NAME = 'VE-AURA-NAVIDAD_vela_aura_navidena_409g'
# Vaso + tapa de madera + sombra de contacto (foto 2560x1568) con margen.
CROP = (686, 318, 1524, 1382)

img = Image.open(SRC).convert('RGB')
band = img.crop(CROP)
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
