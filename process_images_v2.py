#!/usr/bin/env python3
"""
Remove white/near-white borders from product images - IMPROVED VERSION.
More aggressive border detection with adaptive threshold.
"""

from PIL import Image
import os
import glob
import numpy as np

THUMBS_DIR = 'images/thumbs'
CATALOG_DIR = 'images/catalog'
THRESHOLD = 230  # More aggressive - detect more "white" pixels
CROP_MARGIN = 1  # Minimal margin
EDGE_CHECK = 10  # Check first/last N pixels for border detection

def get_border_color(img, side='top', check_size=EDGE_CHECK):
    """Get the dominant color of a border region."""
    pixels = img.load()
    width, height = img.size
    
    colors = []
    if side == 'top':
        for y in range(check_size):
            for x in range(0, width, max(1, width // 20)):
                colors.append(pixels[x, y])
    elif side == 'bottom':
        for y in range(height - check_size, height):
            for x in range(0, width, max(1, width // 20)):
                colors.append(pixels[x, y])
    elif side == 'left':
        for x in range(check_size):
            for y in range(0, height, max(1, height // 20)):
                colors.append(pixels[x, y])
    elif side == 'right':
        for x in range(width - check_size, width):
            for y in range(0, height, max(1, height // 20)):
                colors.append(pixels[x, y])
    
    if not colors:
        return None
    
    # Get average color
    avg_r = sum(c[0] for c in colors) // len(colors)
    avg_g = sum(c[1] for c in colors) // len(colors)
    avg_b = sum(c[2] for c in colors) // len(colors)
    
    return (avg_r, avg_g, avg_b)

def is_pixel_close_to_border(pixel, border_color, tolerance=30):
    """Check if a pixel is close to the border color."""
    if border_color is None:
        return pixel[0] > THRESHOLD and pixel[1] > THRESHOLD and pixel[2] > THRESHOLD
    
    return (abs(pixel[0] - border_color[0]) < tolerance and
            abs(pixel[1] - border_color[1]) < tolerance and
            abs(pixel[2] - border_color[2]) < tolerance)

def remove_borders_v2(img_path):
    """Remove borders using adaptive detection."""
    try:
        img = Image.open(img_path)
        original_size = img.size
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        pixels = img.load()
        width, height = img.size
        
        # Get border colors for each side
        top_color = get_border_color(img, 'top')
        bottom_color = get_border_color(img, 'bottom')
        left_color = get_border_color(img, 'left')
        right_color = get_border_color(img, 'right')
        
        # Find bounding box
        top = 0
        bottom = height - 1
        left = 0
        right = width - 1
        
        # Find top
        for y in range(height):
            found = False
            for x in range(0, width, max(1, width // 50)):
                if not is_pixel_close_to_border(pixels[x, y], top_color):
                    found = True
                    break
            if found:
                top = y
                break
        
        # Find bottom
        for y in range(height - 1, -1, -1):
            found = False
            for x in range(0, width, max(1, width // 50)):
                if not is_pixel_close_to_border(pixels[x, y], bottom_color):
                    found = True
                    break
            if found:
                bottom = y
                break
        
        # Find left
        for x in range(width):
            found = False
            for y in range(0, height, max(1, height // 50)):
                if not is_pixel_close_to_border(pixels[x, y], left_color):
                    found = True
                    break
            if found:
                left = x
                break
        
        # Find right
        for x in range(width - 1, -1, -1):
            found = False
            for y in range(0, height, max(1, height // 50)):
                if not is_pixel_close_to_border(pixels[x, y], right_color):
                    found = True
                    break
            if found:
                right = x
                break
        
        # Add small margin
        left = max(0, left - CROP_MARGIN)
        top = max(0, top - CROP_MARGIN)
        right = min(width - 1, right + CROP_MARGIN)
        bottom = min(height - 1, bottom + CROP_MARGIN)
        
        # Check if we actually cropped anything
        if left == 0 and top == 0 and right == width - 1 and bottom == height - 1:
            return False, original_size, original_size
        
        # Crop
        new_width = right - left + 1
        new_height = bottom - top + 1
        
        if new_width <= 0 or new_height <= 0:
            return False, original_size, original_size
        
        img_cropped = img.crop((left, top, right + 1, bottom + 1))
        
        # Save back
        if img_path.endswith('.jpg') or img_path.endswith('.jpeg'):
            img_cropped.save(img_path, 'JPEG', quality=95, optimize=True)
        else:
            img_cropped.save(img_path, quality=95, optimize=True)
        
        return True, original_size, img_cropped.size
        
    except Exception as e:
        print(f"  Error: {e}")
        return False, None, None

def main():
    # Process thumbs
    if os.path.exists(THUMBS_DIR):
        files = glob.glob(os.path.join(THUMBS_DIR, '*.jpg')) + \
                glob.glob(os.path.join(THUMBS_DIR, '*.jpeg'))
        
        print(f"Processing {len(files)} images in {THUMBS_DIR}...")
        processed = 0
        skipped = 0
        
        for f in sorted(files):
            name = os.path.basename(f)
            changed, old_size, new_size = remove_borders_v2(f)
            if changed:
                processed += 1
                print(f"  ✓ {name}: {old_size} → {new_size}")
            else:
                skipped += 1
        
        print(f"\nDone: {processed} cropped, {skipped} unchanged")
    
    # Process catalog
    if os.path.exists(CATALOG_DIR):
        files = glob.glob(os.path.join(CATALOG_DIR, '*.jpg')) + \
                glob.glob(os.path.join(CATALOG_DIR, '*.jpeg'))
        
        print(f"\nProcessing {len(files)} images in {CATALOG_DIR}...")
        processed = 0
        skipped = 0
        
        for f in sorted(files):
            name = os.path.basename(f)
            changed, old_size, new_size = remove_borders_v2(f)
            if changed:
                processed += 1
                print(f"  ✓ {name}: {old_size} → {new_size}")
            else:
                skipped += 1
        
        print(f"\nDone: {processed} cropped, {skipped} unchanged")

if __name__ == '__main__':
    main()
