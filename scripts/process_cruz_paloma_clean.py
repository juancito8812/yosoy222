#!/usr/bin/env python3
"""Cruz con Paloma: fotos limpias, sin borde difuminado.

Estilo de referencia del dueño: fondo real de la foto, producto centrado,
sin insertar la misma imagen ampliada/blurada detrás.

Fuentes (Telegram, 20-oct-2026):
  - grupo de 3 cruces
  - individual celeste / roja / amarilla
"""
from PIL import Image, ImageFilter
import numpy as np

CACHE = '/home/debianserver/.hermes/cache/images'
OUT = '/home/debianserver/Documentos/programacion/yosoy222'

# (fuente, centro x del producto, nombre destino)
SINGLES = [
    ('img_66c40fddf05f.jpg', 625, 'VM-CRUZ_vela_cruz_con_paloma_52g-v2'),  # celeste
    ('img_652f16c116d5.jpg', 630, 'VM-CRUZ_vela_cruz_con_paloma_52g-v3'),   # roja
    ('img_b9379c85a94b.jpg', 635, 'VM-CRUZ_vela_cruz_con_paloma_52g-v4'),   # amarilla
]
GROUP = ('img_6c002e56383b.jpg', (320, 0, 1080, 721), 'VM-CRUZ_vela_cruz_con_paloma_52g')
SIDE = 680


def sharpen(im):
    return im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=45, threshold=3))


def save_all(square, name):
    for folder, size, q in (('images/thumbs', 480, 78), ('images/catalog', 900, 82)):
        im = square.resize((size, size), Image.LANCZOS)
        im = sharpen(im) if size == 900 else im
        dst = f'{OUT}/{folder}/{name}.jpg'
        im.save(dst, 'JPEG', quality=q, optimize=True, progressive=True)
        print(dst, im.size)


def square_crop(im, cx, side=SIDE):
    w, h = im.size
    side = min(side, h, w)
    l = max(0, min(cx - side // 2, w - side))
    t = max(0, (h - side) // 2 - 40)
    return im.crop((l, t, l + side, t + side))


def edge_pad_square(im, box):
    """Recorta el grupo y completa a cuadrado repitiendo el borde (sin blur)."""
    crop = im.crop(box)
    w, h = crop.size
    side = max(w, h)
    a = np.asarray(crop)
    top = (side - h) // 2
    bottom = side - h - top
    a = np.pad(a, ((top, bottom), (0, 0), (0, 0)), mode='edge')
    return Image.fromarray(a)


for src, cx, name in SINGLES:
    im = Image.open(f'{CACHE}/{src}').convert('RGB')
    save_all(square_crop(im, cx), name)

im = Image.open(f'{CACHE}/{GROUP[0]}').convert('RGB')
save_all(edge_pad_square(im, GROUP[1]), GROUP[2])
