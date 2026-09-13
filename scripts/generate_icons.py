#!/usr/bin/env python3
"""
scripts/generate_icons.py
Genera los 10 iconos PWA oficiales desde icons/source_logo.jpg.

Política de calidad y compatibilidad:
- "any"      -> Fondo blanco sólido (RGB), logo centrado con padding de 8% (alta nitidez).
- "maskable" -> Fondo blanco sólido (RGBA opaco), centrado en la Safe Zone (padding 15%)
                para evitar barras negras / franjas en lanzadores de Android/iOS.
"""

import sys
from pathlib import Path
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
ICONS_DIR = REPO_ROOT / "icons"
SOURCE_IMAGE = ICONS_DIR / "source_logo.jpg"

resample_filter = getattr(Image, "Resampling", Image).LANCZOS

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

def get_content_bbox(img: Image.Image, threshold: int = 250) -> tuple[int, int, int, int]:
    w, h = img.size
    min_x, min_y, max_x, max_y = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            pixel = img.getpixel((x, y))
            if isinstance(pixel, (tuple, list)):
                r, g, b = pixel[0], pixel[1], pixel[2]
            else:
                r = g = b = int(pixel)
            if r < threshold or g < threshold or b < threshold:
                if not found:
                    min_x, min_y, max_x, max_y = x, y, x, y
                    found = True
                else:
                    min_x = min(min_x, x)
                    min_y = min(min_y, y)
                    max_x = max(max_x, x)
                    max_y = max(max_y, y)
    if not found:
        return (0, 0, w, h)
    return (min_x, min_y, max_x, max_y)

def make_any_icon(logo_crop: Image.Image, target_size: int, padding_fraction: float = 0.08) -> Image.Image:
    bw, bh = logo_crop.size
    canvas = Image.new("RGB", (target_size, target_size), (255, 255, 255))
    max_content = int(target_size * (1 - 2 * padding_fraction))
    
    scale = min(max_content / bw, max_content / bh)
    new_w = max(1, int(bw * scale))
    new_h = max(1, int(bh * scale))
    
    scaled = logo_crop.resize((new_w, new_h), resample_filter)
    pos_x = (target_size - new_w) // 2
    pos_y = (target_size - new_h) // 2
    
    canvas.paste(scaled, (pos_x, pos_y))
    return canvas

def make_maskable_icon(logo_crop: Image.Image, target_size: int, padding_fraction: float = 0.15) -> Image.Image:
    bw, bh = logo_crop.size
    canvas = Image.new("RGBA", (target_size, target_size), (255, 255, 255, 255))
    max_content = int(target_size * (1 - 2 * padding_fraction))
    
    scale = min(max_content / bw, max_content / bh)
    new_w = max(1, int(bw * scale))
    new_h = max(1, int(bh * scale))
    
    scaled = logo_crop.resize((new_w, new_h), resample_filter)
    pos_x = (target_size - new_w) // 2
    pos_y = (target_size - new_h) // 2
    
    canvas.paste(scaled, (pos_x, pos_y))
    return canvas

def main() -> int:
    if not SOURCE_IMAGE.exists():
        print(f"ERROR: Fuente no encontrada en {SOURCE_IMAGE}", file=sys.stderr)
        return 1

    print(f"Procesando imagen fuente: {SOURCE_IMAGE}")
    src_img = Image.open(SOURCE_IMAGE).convert("RGB")
    
    bbox = get_content_bbox(src_img)
    logo_crop = src_img.crop(bbox)
    print(f"Dimensiones de contenido detectadas: {logo_crop.size[0]}x{logo_crop.size[1]} px")

    # Generar iconos ANY
    for name, size in ANY_SIZES.items():
        out_path = ICONS_DIR / name
        icon = make_any_icon(logo_crop, size)
        icon.save(out_path, optimize=True)
        print(f"  ✓ any {name} -> {size}x{size} (RGB sólido)")

    # Generar iconos MASKABLE (Safe Zone)
    for name, size in MASKABLE_SIZES.items():
        out_path = ICONS_DIR / name
        icon = make_maskable_icon(logo_crop, size)
        icon.save(out_path, optimize=True)
        print(f"  ✓ maskable {name} -> {size}x{size} (RGBA opaco con Safe Zone)")

    print("\nIconos generados exitosamente.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
