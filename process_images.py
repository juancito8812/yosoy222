#!/usr/bin/env python3
"""
Remove white/near-white borders from product images.
Crops to the content area and saves back to the same location.
"""

from PIL import Image
import os
import glob

THUMBS_DIR = 'images/thumbs'
CATALOG_DIR = 'images/catalog'
THRESHOLD = 240  # Pixel values above this are considered "white"
CROP_MARGIN = 2  # Keep 2px margin to avoid cutting into content

def remove_borders(img_path):
    """Remove white borders from an image and save it."""
    try:
        img = Image.open(img_path)
        original_size = img.size
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Get pixels
        pixels = img.load()
        width, height = img.size
        
        # Find bounding box of non-white content
        top = 0
        bottom = height - 1
        left = 0
        right = width - 1
        
        # Find top
        for y in range(height):
            found = False
            for x in range(width):
                r, g, b = pixels[x, y]
                if r < THRESHOLD or g < THRESHOLD or b < THRESHOLD:
                    found = True
                    break
            if found:
                top = y
                break
        
        # Find bottom
        for y in range(height - 1, -1, -1):
            found = False
            for x in range(width):
                r, g, b = pixels[x, y]
                if r < THRESHOLD or g < THRESHOLD or b < THRESHOLD:
                    found = True
                    break
            if found:
                bottom = y
                break
        
        # Find left
        for x in range(width):
            found = False
            for y in range(height):
                r, g, b = pixels[x, y]
                if r < THRESHOLD or g < THRESHOLD or b < THRESHOLD:
                    found = True
                    break
            if found:
                left = x
                break
        
        # Find right
        for x in range(width - 1, -1, -1):
            found = False
            for y in range(height):
                r, g, b = pixels[x, y]
                if r < THRESHOLD or g < THRESHOLD or b < THRESHOLD:
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
            changed, old_size, new_size = remove_borders(f)
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
            changed, old_size, new_size = remove_borders(f)
            if changed:
                processed += 1
                print(f"  ✓ {name}: {old_size} → {new_size}")
            else:
                skipped += 1
        
        print(f"\nDone: {processed} cropped, {skipped} unchanged")

if __name__ == '__main__':
    main()
