# Guía de Imágenes — YoSoy222

> **⚠️ OBLIGATORIO:** Esta guía debe seguirse cada vez que se procese una imagen nueva para el sitio.
> Cualquier imagen que no cumpla con estos estándar será rechazada en el code review.

---

## Estándar visual

Todas las imágenes de producto siguen el mismo estilo:

```
┌──────────────────────────────┐
│  ╔════════════════════════╗  │
│  ║                        ║  │
│  ║   [Producto centrado]  ║  │
│  ║   sin bordes blancos   ║  │
│  ║                        ║  │
│  ╚════════════════════════╝  │
│                              │
│   Fondo: versión difuminada  │
│   de la misma imagen         │
│   (blur + oscurecida)        │
│                              │
└──────────────────────────────┘
```

**Elementos clave:**
1. **Bordes blancos eliminados** — recortar todo marco blanco/near-white del original
2. **Producto centrado** — el contenido recortado se centra sobre el fondo difuminado
3. **Fondo difuminado** — la imagen original redimensionada + blur + oscurecida (brightness 0.85)
4. **Producto más grande** — debe llenar la mayor parte del espacio disponible (máx ~90% del lado largo)

---

## Tamaños y especificaciones

| Carpeta | Dimensiones máx | Calidad JPEG | Formato | Notas |
|---------|----------------|--------------|---------|-------|
| `images/thumbs/` | 480 × 480 px | q78 | JPEG | Para el grid de productos |
| `images/catalog/` | 900 × 900 px | q80 | JPEG | Para el lightbox (vista ampliada) |

**Reglas:**
- Siempre cuadradas (1:1)
- Si el original no es cuadrado, hacer crop al contenido y luego sobreponer
- Nunca escalar hacia arriba imágenes pequeñas (mejor dejarlas a su tamaño real)
- Las franelas mantienen sus fotos reales sin procesamiento adicional

---

## Proceso de una imagen nueva

### 1. Identificar la imagen fuente

Las fuentes pueden estar en:
- `/home/jr/Documentos/gemini velas/imagenes_web/` — set de 1000×1000
- `/home/jr/Documentos/gemini velas/` — imágenes sueltas
- `/home/jr/Documentos/` — otras imágenes del usuario
- Archivo `.png` o `.jpg` en la raíz del repo

### 2. Eliminar bordes blancos

Si la imagen tiene marco/borde blanco:

```python
from PIL import Image
import numpy as np

img = Image.open('original.png').convert('RGB')
arr = np.array(img)

# Encontrar contenido: primera/última fila/columna con mean < 245
for top in range(arr.shape[0]):
    if np.mean(arr[top,:,:]) < 245:
        break
for bottom in range(arr.shape[0]-1, -1, -1):
    if np.mean(arr[bottom,:,:]) < 245:
        break
for left in range(arr.shape[1]):
    if np.mean(arr[:,left,:]) < 245:
        break
for right in range(arr.shape[1]-1, -1, -1):
    if np.mean(arr[:,right,:]) < 245:
        break

img_clean = img.crop((left, top, right+1, bottom+1))
```

### 3. Crear fondo difuminado

```python
from PIL import Image, ImageFilter, ImageEnhance

# Usar la imagen ORIGINAL (antes de recortar) para el fondo
bg = img.copy().resize((480, 480), Image.LANCZOS)  # o (900, 900) para catalog
bg = bg.filter(ImageFilter.GaussianBlur(radius=25))  # 35 para catalog
enhancer = ImageEnhance.Brightness(bg)
bg = enhancer.enhance(0.85)
```

### 4. Centrar producto sobre fondo

```python
product = img_clean.copy()
product.thumbnail((440, 440), Image.LANCZOS)  # o (840, 840) para catalog

x = (bg.width - product.width) // 2
y = (bg.height - product.height) // 2
bg.paste(product, (x, y))

bg.save('images/thumbs/NOMBRE.jpg', 'JPEG', quality=78, optimize=True)
```

---

## Checklist de calidad

Antes de commitear una imagen, verificar:

- [ ] **Sin bordes blancos** — no queda marco visible alrededor del producto
- [ ] **Producto grande** — ocupa al menos el 70% del lado largo de la imagen
- [ ] **Centrado** — el producto está centrado horizontal y verticalmente
- [ ] **Fondo difuminado** — se ve una versión borrosa de la imagen detrás
- [ ] **Brillo correcto** — el fondo es más oscuro que el producto (brightness 0.85)
- [ ] **Cuadrada** — exactamente 1:1 (480×480 para thumbs, 900×900 para catalog)
- [ ] **Nombre correcto** — coincide con el `file:` del array `products[]` en `js/app.js`
- [ ] **En ambas carpetas** — `images/thumbs/` E `images/catalog/` con el mismo nombre

---

## Variantes de color (misma vela, varios colores)

Cuando una misma vela se fotografía en varios colores, **no se crean productos
nuevos**: el catálogo mantiene UN producto y la foto extra se agrega como
*variante*. El cliente las corre desde el lightbox (puntitos bajo la descripción).

### Convención de nombres (obligatoria)

El color principal conserva SIEMPRE el `file:` exacto del producto en
`js/app.js`. Los demás colores agregan el sufijo `-v2`, `-v3`, … **antes de la
extensión**, en AMBAS carpetas:

```
images/thumbs/VM-ROSA_vela_rosa_79g.jpg          ← principal (el file: del catálogo)
images/thumbs/VM-ROSA_vela_rosa_79g-v2.jpg       ← color 2 (ej. rosa claro)
images/thumbs/VM-ROSA_vela_rosa_79g-v3.jpg       ← color 3 (ej. blanco)
images/catalog/VM-ROSA_vela_rosa_79g-v2.jpg      ← misma foto a 900px
images/catalog/VM-ROSA_vela_rosa_79g-v3.jpg
```

Reglas:
- La variante es una foto DEL MISMO producto: mismo encuadre y procesado
  (modo guía), lo único que cambia es el color de la cera.
- Sin huecos: si existen `-v2` y `-v4` pero no `-v3`, renombrar para que sean
  correlativos (el orden de los puntos = orden de los colores).
- Cada variante debe existir en `thumbs/` Y en `catalog/` con el mismo nombre.

### Registro y validación

```bash
# Después de copiar las variantes a images/:
python3 scripts/build_variants.py            # regenera js/variants.json
python3 scripts/build_variants.py --check    # solo valida (lo usa el test)
```

`build_variants.py` escanea las carpetas y genera `js/variants.json` (mapa
`file principal → [variantes]`). `js/app.js` lo carga perezosamente y pinta los
puntos en el lightbox; sin ese archivo, o si falla, la web funciona igual con
una sola foto por producto.

**Obligatorio antes de commitear variantes nuevas:** ejecutar
`python3 scripts/build_variants.py --check` y `npm test` (el test
`tests/variants.test.mjs` valida la convención y que los files existan).
Si agregaste archivos de imagen, sube también el `?v=` de imágenes en
`js/app.js` + `scripts/prerender_catalog.py` y `CACHE_NAME` en `sw.js`
(mismo circuito que cualquier imagen).

---

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| Borde blanco visible | No se recortó bien el original | Usar `process_images_v2.py` o recortar manualmente |
| Producto muy pequeño | Thumbnail demasiado reducido | Aumentar tamaño del `product.thumbnail()` |
| Producto descentrado | Cálculo X/Y incorrecto | Verificar que se use `(bg.width - product.width) // 2` |
| Imagen pixelizada | Se escaló imagen pequeña | No escalar hacia arriba; usar imagen de mayor resolución |
| Fondo no difuminado | Falta el blur | Aplicar `ImageFilter.GaussianBlur(radius=25)` |
| Nombre no coincide | Error tipográfico en archivo | Verificar `file:` en `js/app.js` (con espacios y tildes) |

---

## Script de referencia (procesamiento completo)

```python
#!/usr/bin/env python3
"""Procesa una imagen nueva para el sitio YoSoy222."""

from PIL import Image, ImageFilter, ImageEnhance
import numpy as np
import sys

def process_image(src_path, name):
    img = Image.open(src_path).convert('RGB')
    arr = np.array(img)

    # 1. Recortar bordes blancos
    for top in range(arr.shape[0]):
        if np.mean(arr[top,:,:]) < 245: break
    for bottom in range(arr.shape[0]-1, -1, -1):
        if np.mean(arr[bottom,:,:]) < 245: break
    for left in range(arr.shape[1]):
        if np.mean(arr[:,left,:]) < 245: break
    for right in range(arr.shape[1]-1, -1, -1):
        if np.mean(arr[:,right,:]) < 245: break

    img_clean = img.crop((left, top, right+1, bottom+1))

    for folder, size, blur_r, quality, max_prod in [
        ('images/thumbs', 480, 25, 78, 440),
        ('images/catalog', 900, 35, 80, 840),
    ]:
        # 2. Fondo difuminado
        bg = img.copy().resize((size, size), Image.LANCZOS)
        bg = bg.filter(ImageFilter.GaussianBlur(radius=blur_r))
        bg = ImageEnhance.Brightness(bg).enhance(0.85)

        # 3. Producto centrado y grande
        product = img_clean.copy()
        product.thumbnail((max_prod, max_prod), Image.LANCZOS)
        x = (size - product.width) // 2
        y = (size - product.height) // 2
        bg.paste(product, (x, y))

        # 4. Guardar
        dst = f'{folder}/{name}.jpg'
        bg.save(dst, 'JPEG', quality=quality, optimize=True)
        print(f'  {dst}: {product.size} sobre {size}x{size}')

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Uso: python3 process_new_image.py imagen.png "NombreProducto"')
        sys.exit(1)
    process_image(sys.argv[1], sys.argv[2])
```

---

*Última actualización: 12 de septiembre de 2026*
