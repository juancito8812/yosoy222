# 🕯️ YoSoy222 — Landing Page de Velas Artesanales

> Landing page con catálogo de productos e integración WhatsApp.  
> Desplegada en **GitHub Pages** con dominio personalizado.

**Repositorio:** https://github.com/juancito8812/yosoy222  
**URL de producción:** https://juancito8812.github.io/yosoy222/ (o dominio personalizado)

---

## 📋 ÍNDICE PARA AGENTES

Si eres un agente de IA leyendo esto, aquí tienes todo lo que necesitas:

1. [Arquitectura del proyecto](#arquitectura-del-proyecto)
2. [Stack tecnológico](#stack-tecnológico)
3. [Cómo ejecutar localmente](#cómo-ejecutar-localmente)
4. [Configuración obligatoria (WhatsApp)](#configuración-obligatoria)
5. [Cómo agregar un producto](#cómo-agregar-un-producto)
6. [Cómo eliminar un producto](#cómo-eliminar-un-producto)
7. [Cómo cambiar el diseño visual](#cómo-cambiar-el-diseño-visual)
8. [Deploy a GitHub Pages](#deploy-a-github-pages)
9. [Configurar dominio personalizado](#configurar-dominio-personalizado)
10. [Tabla de productos completa](#tabla-de-productos)
11. [Guía de estilos CSS](#guía-de-estilos-css)
12. [Estructura de archivos](#estructura-de-archivos)

---

## ARQUITECTURA DEL PROYECTO

```
yosoy222/                          ← RAÍZ del repositorio
│
├── index.html                     ← LANDING PAGE principal (única página)
│   ├── Navbar fija con enlaces y botón WhatsApp
│   ├── Hero section (fullscreen, fondo degradado)
│   ├── Sección "Sobre nosotros" (2 columnas)
│   ├── Sección "Productos destacados" (8 productos, grid)
│   ├── Sección "Catálogo completo" (todos los productos, con filtros)
│   ├── Sección CTA WhatsApp
│   ├── Footer con navegación y redes
│   ├── Botón flotante de WhatsApp
│   └── Lightbox modal para vista de producto
│
├── css/
│   └── style.css                  ← Estilos completos (~500 líneas)
│       ├── Variables CSS (colores, sombras, radios)
│       ├── Navbar fija + mobile menu
│       ├── Hero con animación
│       ├── Grid de productos responsive
│       ├── Tarjetas de producto con hover
│       ├── Lightbox modal
│       ├── Filtros de categoría
│       ├── Botón WhatsApp flotante
│       └── Media queries (768px, 480px)
│
├── js/
│   └── app.js                     ← Toda la lógica JavaScript (~250 líneas)
│       ├── Configuración WhatsApp (NÚMERO)
│       ├── Array de productos (NOMBRE, ARCHIVO, CATEGORÍA)
│       ├── Renderizado dinámico de grid
│       ├── Sistema de filtros
│       ├── Lightbox con navegación
│       ├── Menú mobile
│       └── Animaciones scroll (IntersectionObserver)
│
├── images/
│   ├── thumbs/                    ← 97 thumbnails (400×400px, ~16KB c/u)
│   │   └── *.jpg                  ← Para el grid de la landing
│   └── catalog/                   ← 97 imágenes completas (800×800px, ~58KB c/u)
│       └── *.jpg                  ← Para el lightbox al hacer click
│
├── .gitignore                     ← Archivos ignorados por git
├── README.md                      ← Este archivo
└── PLAN_IMPLEMENTACION.md         ← Plan de fases de implementación
```

### Flujo de datos

```
index.html
    │
    ├── carga css/style.css
    │
    └── carga js/app.js
            │
            ├── Lee array `products[]`
            ├── Renderiza featured-grid (primeros 8)
            ├── Renderiza catalog-grid (todos)
            ├── Cada card → imagen de images/thumbs/
            ├── Click en card → lightbox con imagen de images/catalog/
            ├── Click en 💬 → enlace wa.me con mensaje predefinido
            └── Botón flotante → WhatsApp con mensaje general
```

---

## STACK TECNOLÓGICO

| Componente | Tecnología | Notas |
|-----------|-----------|-------|
| HTML | HTML5 semántico | Sin frameworks |
| CSS | CSS3 vanilla | Variables, Grid, Flexbox, animations |
| JavaScript | ES6+ vanilla | Sin dependencias, sin build tools |
| Imágenes | JPEG | Thumbs 400px + Catalog 800px |
| Hosting | GitHub Pages | Static site, HTTPS automático |
| WhatsApp | wa.me links | Sin API, solo enlaces directos |

**NO se usa:** React, Vue, Angular, jQuery, npm, webpack, build tools, ni ninguna dependencia externa.

---

## CÓMO EJECUTAR LOCALMENTE

### Opción 1: Python (recomendado)
```bash
cd yosoy222
python3 -m http.server 8080
# Abrir http://localhost:8080
```

### Opción 2: Node.js
```bash
cd yosoy222
npx serve .
# Abrir http://localhost:3000
```

### Opción 3: PHP
```bash
cd yosoy222
php -S localhost:8080
# Abrir http://localhost:8080
```

**IMPORTANTE:** No abrir `index.html` directamente con `file://` — las imágenes no cargarán por restricciones de CORS. Siempre usar un servidor local.

---

## CONFIGURACIÓN OBLIGATORIA

### ⚠️ Cambiar número de WhatsApp

Esto es LO PRIMERO que debe hacerse. El sitio actual tiene un número placeholder.

**Archivo:** `js/app.js` — Líneas 2-3

```javascript
// ANTES (placeholder — NO funciona):
const WHATSAPP_NUMBER = '521XXXXXXXXXX';

// DESPUÉS (tu número real):
const WHATSAPP_NUMBER = '5215512345678';  // Formato: 521 + 10 dígitos
```

**También cambiar en:** `index.html` — Buscar y reemplazar TODAS las ocurrencias de `521XXXXXXXXXX`:

| Ubicación en index.html | Línea aproximada | Contexto |
|------------------------|-------------------|----------|
| Navbar WhatsApp button | ~30 | `href="https://wa.me/521XXXXXXXXXX?text=..."` |
| Hero WhatsApp button | ~48 | `href="https://wa.me/521XXXXXXXXXX?text=..."` |
| CTA WhatsApp button | ~85 | `href="https://wa.me/521XXXXXXXXXX?text=..."` |
| Footer WhatsApp link | ~107 | `href="https://wa.me/521XXXXXXXXXX"` |

**Formato del número WhatsApp:**
```
521 + Código de área (2 dígitos) + Número (8 dígitos)
Ejemplo: 521 55 1234 5678 → 5215512345678
```

### Cambiar redes sociales

**Archivo:** `index.html` — Sección footer (~línea 108-109)

```html
<!-- ANTES: -->
<a href="https://instagram.com/yosoy222" target="_blank">📸 Instagram</a>
<a href="https://facebook.com/yosoy222" target="_blank">📘 Facebook</a>

<!-- DESPUÉS: -->
<a href="https://instagram.com/TU_USUARIO" target="_blank">📸 Instagram</a>
<a href="https://facebook.com/TU_PAGINA" target="_blank">📘 Facebook</a>
```

---

## CÓMO AGREGAR UN PRODUCTO

### Paso 1: Agregar imagen

Colocar la imagen en ambas carpetas:
```
images/thumbs/NOMBRE.jpg       ← Redimensionada a 400×400px
images/catalog/NOMBRE.jpg      ← Redimensionada a 800×800px
```

**Requisitos de imagen:**
- Formato: `.jpg` o `.jpeg`
- Fondo blanco (para consistencia visual)
- Cuadrada (1:1) o con padding blanco si es retrato/paisaje
- Thumbs: máx 400×400px, calidad 80%
- Catalog: máx 800×800px, calidad 85%

**Para generar las versiones desde una imagen original de 2048×2048:**
```python
from PIL import Image

img = Image.open('imagen_original.jpg')

# Thumbnail
thumb = img.copy()
thumb.thumbnail((400, 400), Image.LANCZOS)
thumb.save('images/thumbs/NOMBRE.jpg', 'JPEG', quality=80, optimize=True)

# Catálogo
catalog = img.copy()
catalog.thumbnail((800, 800), Image.LANCZOS)
catalog.save('images/catalog/NOMBRE.jpg', 'JPEG', quality=85, optimize=True)
```

### Paso 2: Agregar al array de productos

**Archivo:** `js/app.js` — Sección `const products = [...]`

Agregar una línea al array:
```javascript
{ file: "NOMBRE.jpg", name: "Nombre Bonito", cat: "vela" },
```

**Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `file` | string | Nombre exacto del archivo JPG (con extensión) |
| `name` | string | Nombre que se muestra al usuario |
| `cat` | string | Categoría: `"vela"`, `"pulsera"`, `"collar"`, `"otro"` |

**Ejemplo completo:**
```javascript
// Agregar después de la última línea del array:
{ file: "Nueva Vela Azul.jpg", name: "Vela Azul Celestial", cat: "vela" },
```

### Paso 3: Commit y push

```bash
git add images/thumbs/NUEVA.jpg images/catalog/NUEVA.jpg js/app.js
git commit -m "feat: agregar producto Nueva Vela Azul"
git push
```

El deploy automático de GitHub Pages actualizará el sitio en ~2 minutos.

---

## CÓMO ELIMINAR UN PRODUCTO

### Paso 1: Eliminar del array

**Archivo:** `js/app.js` — Eliminar la línea correspondiente del array `products`.

### Paso 2 (opcional): Eliminar imágenes

```bash
rm images/thumbs/ARCHIVO.jpg
rm images/catalog/ARCHIVO.jpg
```

### Paso 3: Commit y push

```bash
git add js/app.js
git commit -m "feat: eliminar producto NOMBRE"
git push
```

---

## CÓMO CAMBIAR EL DISEÑO VISUAL

### Cambiar colores

**Archivo:** `css/style.css` — Variables CSS al inicio del archivo:

```css
:root {
    --primary: #2c1810;        /* Color principal (marrón oscuro) */
    --primary-light: #5a3825;  /* Color secundario */
    --accent: #e8a87c;         /* Color de acento (durazno) */
    --bg: #f8f5f0;             /* Fondo general */
    --bg-card: #ffffff;        /* Fondo de tarjetas */
    --text: #3d2c1e;           /* Color de texto */
    --text-light: #8b7355;     /* Texto secundario */
    --whatsapp: #25D366;       /* Verde WhatsApp */
}
```

### Cambiar fuentes

**Archivo:** `css/style.css` — Línea del `body`:
```css
body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    /* Cambiar por Google Fonts: */
    /* font-family: 'Playfair Display', serif; */
}
```

Para usar Google Fonts, agregar en `<head>` de `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
```

### Cambiar texto del hero

**Archivo:** `index.html` — Sección `<section class="hero">`:
```html
<h1><span>Yo</span>Soy222</h1>
<p class="subtitle">Velas Artesanales & Joyería Espiritual</p>
<p class="tagline">Tu texto personalizado aquí...</p>
```

### Cambiar imagen del about

**Archivo:** `index.html` — Línea ~58:
```html
<img src="images/catalog/Aura Rosa.jpg" alt="Vela artesanal Aura Rosa">
```

### Cambiar cantidad de productos destacados

**Archivo:** `js/app.js` — Línea ~82:
```javascript
// Mostrar primeros 8 productos destacados:
initProductsGrid('featured-grid', products.slice(0, 8));

// Cambiar a los primeros 12:
initProductsGrid('featured-grid', products.slice(0, 12));
```

---

## DEPLOY A GITHUB PAGES

### Activar por primera vez

1. Ir a https://github.com/juancito8812/yosoy222/settings/pages
2. **Source:** Deploy from a branch
3. **Branch:** main | **Folder:** / (root)
4. Click **Save**
5. Esperar 2-3 minutos
6. URL: https://juancito8812.github.io/yosoy222/

### Deploy automático

Cada `git push` a la rama `main` activa un deploy automático. No hay nada que hacer manualmente después de la configuración inicial.

### Verificar el deploy

```bash
# Ver el último deploy:
gh api repos/juancito8812/yosoy222/pages 2>/dev/null

# O simplemente abrir la URL y verificar que carga
```

---

## CONFIGURAR DOMINIO PERSONALIZADO

### Paso 1: En GitHub Pages

1. Settings → Pages → Custom domain
2. Escribir el dominio (ej: `yosoy222.com`)
3. Guardar (crea archivo `CNAME` automáticamente)
4. Marcar "Enforce HTTPS"

### Paso 2: En el proveedor de DNS

Agregar estos registros:

```
Tipo    Nombre    Valor                    TTL
─────   ──────    ─────────────────────    ────
A       @         185.199.108.153          600
A       @         185.199.109.153          600
A       @         185.199.110.153          600
A       @         185.199.111.153          600
CNAME   www       juancito8812.github.io   600
```

### Paso 3: Esperar propagación

- DNS: 15 minutos - 48 horas
- SSL automático: ~15 minutos después de que DNS resuelva

---

## TABLA DE PRODUCTOS

| # | Archivo | Nombre | Categoría |
|---|---------|--------|-----------|
| 1 | Armonia.jpg | Armonía | vela |
| 2 | Aura Corazón.jpg | Aura Corazón | vela |
| 3 | Aura Rosa.jpg | Aura Rosa | vela |
| 4 | Aura Tulipan.jpg | Aura Tulipán | vela |
| 5 | Buda.jpg | Buda | vela |
| 6 | Buquet .jpg | Buquet | vela |
| 7 | Collar Eslabon Medio.jpg | Collar Eslabón Medio | collar |
| 8 | Collar Largo 01.jpg | Collar Largo 01 | collar |
| 9 | Collar Medio 02.jpg | Collar Medio 02 | collar |
| 10 | Corazon Blanca.jpg | Corazón Blanca | vela |
| 11 | Corazón .jpg | Corazón | vela |
| 12 | Cruz .jpg | Cruz | vela |
| 13 | Cubo .jpg | Cubo | vela |
| 14 | Espiral.jpg | Espiral | vela |
| 15 | Estrella.jpg | Estrella | vela |
| 16 | Gargantilla 2.jpg | Gargantilla 2 | collar |
| 17 | Gargantilla Lisa.jpg | Gargantilla Lisa | collar |
| 18 | Hamsa .jpg | Hamsa | vela |
| 19 | Mandala.jpg | Mandala | vela |
| 20 | Margarita.jpg | Margarita | vela |
| 21 | Mini Corazones.jpg | Mini Corazones | vela |
| 22 | Mini Girasol.jpg | Mini Girasol | vela |
| 23 | Mini Margarita.jpg | Mini Margarita | vela |
| 24 | PETIT.jpg | Petit | vela |
| 25 | Piedras Natural.jpg | Piedras Natural | otro |
| 26 | Pulsera Infinito Azul.jpg | Pulsera Infinito Azul | pulsera |
| 27 | Pulsera Infinito Beige.jpg | Pulsera Infinito Beige | pulsera |
| 28 | Pulsera Infinito Roja.jpg | Pulsera Infinito Roja | pulsera |
| 29 | Pulsera Ojito.jpg | Pulsera Ojito | pulsera |
| 30 | Pulsera Perla.jpg | Pulsera Perla | pulsera |
| 31 | Pulsera San Benito.jpg | Pulsera San Benito | pulsera |
| 32 | Rosa .jpg | Rosa | vela |
| 33 | Rosa Pequeña.jpg | Rosa Pequeña | vela |
| 34 | Sagrada Familia.jpg | Sagrada Familia | vela |
| 35 | Sagrada Familia 1.jpg | Sagrada Familia 1 | vela |
| 36 | Tulipan.jpg | Tulipán | vela |
| 37 | Vela Canela.jpg | Vela Canela | vela |
| 38 | Vela Estrellas.jpg | Vela Estrellas | vela |
| 39 | Vela Rosa.jpg | Vela Rosa | vela |
| 40 | Vela Tulipan.jpg | Vela Tulipán | vela |
| 41 | Velita Corazoncito.jpg | Velita Corazoncito | vela |
| 42 | Vintage.jpg | Vintage | vela |
| 43 | Virgen del Carmen.jpg | Virgen del Carmen | vela |

**Total:** 43 productos con nombre + 54 productos sin nombre (archivos numéricos/IMG) = **97 productos**

---

## GUÍA DE ESTILOS CSS

### Variables de colores (modificar en `:root`)

```css
--primary: #2c1810;       /* Marrón oscuro - navbar, footer, textos principales */
--primary-light: #5a3825; /* Marrón claro - botones activos, badges */
--accent: #e8a87c;        /* Durazno - acentos, títulos, hover */
--bg: #f8f5f0;            /* Beige claro - fondo general */
--bg-card: #ffffff;       /* Blanco - tarjetas de producto */
--text: #3d2c1e;          /* Marrón - texto principal */
--text-light: #8b7355;    /* Marrón suave - texto secundario */
--whatsapp: #25D366;      /* Verde WhatsApp */
```

### Clases principales

| Clase | Uso |
|-------|-----|
| `.btn-primary` | Botón dorado/acentado |
| `.btn-whatsapp` | Botón verde WhatsApp |
| `.btn-outline` | Botón transparente con borde |
| `.product-card` | Tarjeta de producto en grid |
| `.filter-btn` | Botón de filtro de categoría |
| `.section-header` | Encabezado de sección (título + divisor) |
| `.hero` | Sección hero fullscreen |
| `.lightbox` | Modal de vista completa |

### Breakpoints responsive

```css
@media (max-width: 768px)  { /* Tablet y móvil */ }
@media (max-width: 480px)  { /* Móvil pequeño */ }
```

---

## ESTRUCTURA DE ARCHIVOS

### Requeridos (no borrar)

| Archivo | Propósito | Líneas aprox. |
|---------|-----------|---------------|
| `index.html` | Landing page | ~120 |
| `css/style.css` | Todos los estilos | ~500 |
| `js/app.js` | Toda la lógica JS | ~250 |
| `images/thumbs/*.jpg` | Thumbnails del grid | 97 archivos |
| `images/catalog/*.jpg` | Imágenes del lightbox | 97 archivos |

### Opcionales

| Archivo | Propósito |
|---------|-----------|
| `PLAN_IMPLEMENTACION.md` | Plan de fases del proyecto |
| `.gitignore` | Archivos ignorados por git |

---

## COMANDOS GIT ÚTILES

```bash
# Ver estado
git status

# Agregar y commitear
git add index.html js/app.js
git commit -m "feat: descripción del cambio"

# Subir a GitHub (deploy automático)
git push

# Ver historial
git log --oneline -5

# Deshacer último cambio
git checkout -- index.html
```

---

## TROUBLESHOOTING

### Las imágenes no cargan
- **Causa:** Abrir HTML con `file://` en lugar de servidor local
- **Solución:** Usar `python3 -m http.server 8080` y abrir `localhost:8080`

### Las imágenes no se ven en GitHub Pages
- **Causa:** Nombres de archivo con caracteres especiales (espacios, tildes)
- **Solución:** Renombrar archivos sin espacios ni caracteres especiales, o usar URL encoding

### El botón de WhatsApp no funciona
- **Causa:** Número placeholder `521XXXXXXXXXX`
- **Solución:** Cambiar en `js/app.js` y `index.html` por número real

### El deploy no se actualiza
- **Causa:** Cache del navegador
- **Solución:** Ctrl+Shift+R (hard refresh) o esperar ~5 minutos

### Los filtros no muestran todos los productos
- **Causa:** Producto sin categoría válida
- **Solución:** Verificar que `cat` sea `"vela"`, `"pulsera"`, `"collar"`, o `"otro"`

---

## CONTACTO DEL PROYECTO

- **GitHub:** https://github.com/juancito8812
- **Repositorio:** https://github.com/juancito8812/yosoy222

---

*Documentación generada para que cualquier agente de IA pueda entender y modificar este proyecto.*
