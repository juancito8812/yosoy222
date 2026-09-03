# 🕯️ YoSoy222 — Velas Artesanales y Accesorios

> Tienda online de velas artesanales, pulseras, collares y accesorios.
> Desplegada en **GitHub Pages** con dominio personalizado **yosoy222.com**.

**Repositorio:** https://github.com/juancito8812/yosoy222
**URL de producción:** https://yosoy222.com

---

## 📋 ÍNDICE

1. [Vista general](#vista-general)
2. [Arquitectura del proyecto](#arquitectura-del-proyecto)
3. [Stack tecnológico](#stack-tecnológico)
4. [Cómo ejecutar localmente](#cómo-ejecutar-localmente)
5. [Configuración obligatoria](#configuración-obligatoria)
6. [Cómo agregar un producto](#cómo-agregar-un-producto)
7. [Cómo eliminar un producto](#cómo-eliminar-un-producto)
8. [Procesamiento de imágenes](#procesamiento-de-imágenes)
9. [Deploy a GitHub Pages](#deploy-a-github-pages)
10. [Configurar dominio personalizado](#configurar-dominio-personalizado)
11. [Tabla de productos completa](#tabla-de-productos)
12. [Guía de estilos CSS](#guía-de-estilos-css)
13. [Estructura de archivos](#estructura-de-archivos)
14. [Troubleshooting](#troubleshooting)

---

## VISTA GENERAL

### Características del sitio

- **Hero asimétrico** con fotos reales de productos
- **Búsqueda en tiempo real** en el catálogo
- **Filtros por categoría** (Velas, Pulseras, Collares, Accesorios)
- **Carrito de compras** con steppers de cantidad (+/−)
- **Checkout por WhatsApp** con mensaje itemizado
- **Sección "Cómo comprar"** con pasos claros
- **Iconos SVG profesionales** (sin emojis en UI)
- **Paleta cálida de velas** (carbón + ámbar)
- **Responsive completo** (mobile-first)
- **Accesibilidad** (focus-visible, aria-labels, reduced-motion)
- **47 productos** con precios y descripciones reales

### Categorías de productos

| Categoría | Cantidad | Rango de precios |
|-----------|----------|------------------|
| Velas Moldes | 15 | $0.17 - $13.50 |
| Velas Envases | 12 | $9 - $23 |
| Velas Premium | 6 | $75 - $85 |
| Pulseras | 6 | $6 - $8 |
| Collares | 5 | $20 - $32 |
| Accesorios | 1 | $7 |
| **Total** | **47** | **$0.17 - $85** |

---

## ARQUITECTURA DEL PROYECTO

```
yosoy222/                          ← RAÍZ del repositorio
│
├── index.html                     ← LANDING PAGE principal (única página)
│   ├── Header fijo con logo, nav, carrito y menú mobile
│   ├── Hero asimétrico (texto + fotos de productos)
│   ├── Catálogo con búsqueda y filtros
│   ├── Sección "Cómo comprar" (3 pasos)
│   ├── Sección "Nosotros" (2 columnas)
│   ├── Contacto con iconos SVG (WhatsApp, Instagram, TikTok, Facebook)
│   ├── Carrito drawer con steppers de cantidad
│   ├── Footer con navegación y redes
│   └── Botón flotante de WhatsApp
│
├── css/
│   └── style.css                  ← Estilos completos (~730 líneas)
│       ├── Variables CSS (paleta cálida de velas)
│       ├── Header fijo + mobile menu
│       ├── Hero asimétrico
│       ├── Grid de productos responsive
│       ├── Tarjetas de producto con hover
│       ├── Búsqueda y filtros
│       ├── Carrito drawer
│       ├── Secciones (Cómo comprar, Nosotros, Contacto)
│       ├── Footer
│       ├── WhatsApp flotante
│       ├── Accesibilidad (focus-visible)
│       ├── Reduced-motion
│       └── Media queries (900px, 600px, 380px)
│
├── js/
│   └── app.js                     ← Toda la lógica JavaScript (~390 líneas)
│       ├── Configuración WhatsApp (NÚMERO)
│       ├── Array de productos (NOMBRE, ARCHIVO, CATEGORÍA, PRECIO, DESCRIPCIÓN)
│       ├── Renderizado dinámico de grid
│       ├── Búsqueda en tiempo real
│       ├── Sistema de filtros
│       ├── Carrito con persistencia (localStorage)
│       ├── Steppers de cantidad
│       ├── Checkout por WhatsApp
│       ├── Menú mobile
│       ├── Scroll spy (nav activa)
│       └── Smooth scroll
│
├── images/
│   ├── thumbs/                    ← 97 thumbnails (400×400px, ~16KB c/u)
│   │   └── *.jpg                  ← Para el grid de la landing
│   └── catalog/                   ← 97 imágenes completas (800×800px, ~58KB c/u)
│       └── *.jpg                  ← Para vista ampliada
│
├── process_images.py              ← Script para remover bordes blancos
├── CNAME                          ← Dominio personalizado (yosoy222.com)
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
            ├── Lee array `products[]` (47 productos)
            ├── Renderiza products-grid (todos)
            ├── Cada card → imagen de images/thumbs/
            ├── Búsqueda filtra por nombre
            ├── Filtros filtran por categoría
            ├── Click "Agregar" → añade al carrito
            ├── Carrito → localStorage persistence
            ├── Steppers → cambian cantidad
            └── "Pedir por WhatsApp" → wa.me con mensaje itemizado
```

---

## STACK TECNOLÓGICO

| Componente | Tecnología | Notas |
|-----------|-----------|-------|
| HTML | HTML5 semántico | Sin frameworks, ARIA labels |
| CSS | CSS3 vanilla | Variables, Grid, Flexbox, animations |
| JavaScript | ES6+ vanilla | Sin dependencias, sin build tools |
| Imágenes | JPEG | Thumbs 400px + Catalog 800px, bordes removidos |
| Hosting | GitHub Pages | Static site, HTTPS automático |
| DNS | Cloudflare | Dominio yosoy222.com |
| WhatsApp | wa.me links | Sin API, solo enlaces directos |
| Fonts | Google Fonts | Playfair Display + Inter |

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

**Archivo:** `js/app.js` — Línea 6

```javascript
// ANTES (placeholder — NO funciona):
const WHATSAPP = '521XXXXXXXXXX';

// DESPUÉS (tu número real):
const WHATSAPP = '5215512345678';  // Formato: 521 + 10 dígitos
```

**También cambiar en:** `index.html` — Buscar y reemplazar TODAS las ocurrencias de `521XXXXXXXXXX`:

| Ubicación en index.html | Contexto |
|------------------------|----------|
| Contacto WhatsApp | `href="https://wa.me/521XXXXXXXXXX?text=..."` |
| Footer WhatsApp | `href="https://wa.me/521XXXXXXXXXX"` |
| WhatsApp flotante | `href="https://wa.me/521XXXXXXXXXX?text=..."` |

**Formato del número WhatsApp:**
```
521 + Código de país (2 dígitos) + Número (8 dígitos)
Ejemplo: 521 55 1234 5678 → 5215512345678
```

### Cambiar redes sociales

**Archivo:** `index.html` — Secciones contacto y footer

```html
<!-- ANTES: -->
<a href="https://instagram.com/yosoy222" target="_blank">Instagram</a>

<!-- DESPUÉS: -->
<a href="https://instagram.com/TU_USUARIO" target="_blank">Instagram</a>
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
- Cuadrada (1:1) o recortada al contenido
- Thumbs: máx 400×400px, calidad 80%
- Catalog: máx 800×800px, calidad 85%

**Para remover bordes blancos:**
```bash
python3 process_images.py
```

### Paso 2: Agregar al array de productos

**Archivo:** `js/app.js` — Sección `const products = [...]`

Agregar una línea al array:
```javascript
{ file: "NOMBRE.jpg", name: "Nombre Bonito", cat: "vela", price: 15, desc: "Descripción del producto" },
```

**Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `file` | string | Nombre exacto del archivo JPG (con extensión) |
| `name` | string | Nombre que se muestra al usuario |
| `cat` | string | Categoría: `"vela"`, `"pulsera"`, `"collar"`, `"otro"` |
| `price` | number | Precio en USD |
| `desc` | string | Descripción corta del producto |

**Ejemplo completo:**
```javascript
{ file: "Nueva Vela Azul.jpg", name: "Vela Azul Celestial", cat: "vela", price: 25, desc: "Vela artesanal de 150grs. en envase de vidrio" },
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

## PROCESAMIENTO DE IMÁGENES

### Remover bordes blancos

El script `process_images.py` detecta y recorta bordes blancos/near-white de todas las imágenes:

```bash
python3 process_images.py
```

**Configuración:**
- `THRESHOLD = 240` — Píxeles por encima de este valor se consideran "blancos"
- `CROP_MARGIN = 2` — Mantener 2px de margen para no cortar el contenido

**Resultados típicos:**
- 10-15 imágenes recortadas por lote
- 85-90 imágenes sin cambios (ya sin bordes)

---

## DEPLOY A GITHUB PAGES

### Estado actual

✅ **GitHub Pages:** Activado
✅ **Dominio:** yosoy222.com (via Cloudflare)
✅ **HTTPS:** Habilitado
✅ **Deploy automático:** Cada push a `main`

### Configuración inicial (ya completada)

1. Ir a https://github.com/juancito8812/yosoy222/settings/pages
2. **Source:** Deploy from a branch
3. **Branch:** main | **Folder:** / (root)
4. Click **Save**

### Deploy automático

Cada `git push` a la rama `main` activa un deploy automático. No hay nada que hacer manualmente después de la configuración inicial.

### Verificar el deploy

```bash
# Ver el último deploy:
curl -s https://api.github.com/repos/juancito8812/yosoy222/pages | python3 -m json.tool

# O simplemente abrir la URL y verificar que carga
```

---

## CONFIGURAR DOMINIO PERSONALIZADO

### Estado actual

✅ **Dominio:** yosoy222.com
✅ **DNS:** Cloudflare
✅ **Registros:** 4 A records + 1 CNAME

### Configuración DNS (ya completada)

| Tipo | Nombre | Valor | Proxy |
|------|--------|-------|-------|
| A | @ | 185.199.108.153 | Off |
| A | @ | 185.199.109.153 | Off |
| A | @ | 185.199.110.153 | Off |
| A | @ | 185.199.111.153 | Off |
| CNAME | www | juancito8812.github.io | Off |

### CNAME en GitHub

Archivo `CNAME` en la raíz del repositorio:
```
yosoy222.com
```

### Verificar DNS

```bash
# Verificar resolución
dig yosoy222.com +short

# Verificar HTTPS
curl -sI https://yosoy222.com | head -5
```

---

## TABLA DE PRODUCTOS

### Velas Moldes (15 productos)

| # | Archivo | Nombre | Precio | Descripción |
|---|---------|--------|--------|-------------|
| 1 | Rosa .jpg | Rosa | $7.00 | Vela artesanal de 79grs. en forma de Rosa |
| 2 | Mini Corazones.jpg | Mini Corazones | $0.17 | Wax Melts 1grs. en forma de Mini corazón |
| 3 | Rosa Pequeña.jpg | Rosa Pequeña | $4.50 | Vela artesanal de 23grs. en forma de Rosa pequeña |
| 4 | Mini Margarita.jpg | Mini Margarita | $1.70 | Wax Melts 6grs. en forma de Mini Margarita |
| 5 | Margarita.jpg | Margarita | $3.00 | Vela artesanal de 16grs. en forma de Margarita pequeña |
| 6 | Tulipan.jpg | Tulipán | $5.00 | Vela artesanal de 33grs. en forma de Tulipan pequeña |
| 7 | Buquet .jpg | Buquet Tulipán | $8.50 | Vela artesanal de 83grs. en forma de Buquet Tulipan |
| 8 | Espiral.jpg | Espiral | $9.50 | Vela artesanal de 104grs. en forma de Espiral |
| 9 | Sagrada Familia.jpg | Sagrada Familia | $7.00 | Vela artesanal de 75grs. en forma de Sagrada Familia |
| 10 | Buda.jpg | Buda | $6.50 | Vela artesanal de 20grs. en forma de Buda |
| 11 | Hamsa .jpg | Hamsa | $8.00 | Vela artesanal de 75grs. en forma de Mano Hamsa |
| 12 | Corazón .jpg | Corazón | $13.50 | Vela artesanal de 182grs. en forma de Corazón |
| 13 | Cruz .jpg | Cruz con Paloma | $7.00 | Vela artesanal de 52grs. en forma de Cruz con palomita |
| 14 | Cubo .jpg | Cubo | $7.00 | Vela artesanal de 40grs. en forma de Cubo |
| 15 | Virgen del Carmen.jpg | Virgen del Carmen | $7.00 | Vela artesanal de 42grs. en forma de Virgen del Carmen |

### Velas Envases (12 productos)

| # | Archivo | Nombre | Precio | Descripción |
|---|---------|--------|--------|-------------|
| 16 | Mandala.jpg | Mandala | $9.00 | Vela artesanal de 98grs. en envase de metal decorativo |
| 17 | Vintage.jpg | Vintage | $9.50 | Vela artesanal de 165grs. en envase de vidrio transparente |
| 18 | PETIT.jpg | Petit | $11.00 | Vela artesanal de 171grs. en envase de vidrio transparente |
| 19 | Estrella1.jpg | Estrella Envase | $12.00 | Vela artesanal de 285grs. en envase de vidrio transparente |
| 20 | Aura Rosa.jpg | Aura Rosa | $17.00 | Vela artesanal de 342grs. en envase de vidrio transparente |
| 21 | Aura Tulipan.jpg | Aura Tulipán | $17.00 | Vela artesanal de 335grs. en envase de vidrio transparente |
| 22 | Aura Corazón.jpg | Aura Corazón | $20.00 | Vela artesanal de 418grs. en envase de vidrio transparente |
| 23 | Armonia.jpg | Armonía Canela | $22.00 | Vela artesanal de 508grs. en envase de vidrio opaco |
| 24 | Mini Girasol.jpg | Mini Girasol | $1.70 | Wax Melts en forma de Mini Girasol |
| 25 | Estrella.jpg | Estrella | $7.00 | Vela artesanal en forma de Estrella |
| 26 | Corazon Blanca.jpg | Corazón Blanca | $7.00 | Vela artesanal en forma de Corazón Blanco |
| 27 | Sagrada Familia 1.jpg | Sagrada Familia 1 | $7.00 | Vela artesanal en forma de Sagrada Familia |

### Velas Premium (6 productos)

| # | Archivo | Nombre | Precio | Descripción |
|---|---------|--------|--------|-------------|
| 28 | Vela Rosa.jpg | Vela Rosa | $85.00 | Vela artesanal premium en forma de Rosa |
| 29 | Vela Canela.jpg | Vela Canela | $85.00 | Vela artesanal premium de canela |
| 30 | Vela Estrellas.jpg | Vela Estrellas | $85.00 | Vela artesanal premium con forma de estrellas |
| 31 | Vela Tulipan.jpg | Vela Tulipán | $85.00 | Vela artesanal premium en forma de Tulipán |
| 32 | Velita Corazoncito.jpg | Velita Corazoncito | $75.00 | Vela artesanal en forma de corazoncito |
| 33 | Mini Girasol.jpg | Mini Girasol | $1.70 | Wax Melts en forma de Mini Girasol |

### Pulseras (6 productos)

| # | Archivo | Nombre | Precio | Descripción |
|---|---------|--------|--------|-------------|
| 34 | Pulsera Infinito Azul.jpg | Pulsera Infinito Azul | $8.00 | Pulsera Infinito simboliza conexión y propósito |
| 35 | Pulsera Infinito Beige.jpg | Pulsera Infinito Beige | $8.00 | Pulsera Infinito simboliza conexión y propósito |
| 36 | Pulsera Infinito Roja.jpg | Pulsera Infinito Roja | $8.00 | Pulsera Infinito simboliza conexión y propósito |
| 37 | Pulsera San Benito.jpg | Pulsera San Benito | $8.00 | Pulsera San Benito conecta intención y protección |
| 38 | Pulsera Perla.jpg | Pulsera Perla | $6.00 | Pulsera Perla irradia calma y claridad |
| 39 | Pulsera Ojito.jpg | Pulsera Ojito | $6.00 | Pulsera Ojito protege y equilibra tu energía |

### Collares (5 productos)

| # | Archivo | Nombre | Precio | Descripción |
|---|---------|--------|--------|-------------|
| 40 | Gargantilla 2.jpg | Gargantilla | $20.00 | Gargantilla de Gold-Filled bañada en oro |
| 41 | Gargantilla Lisa.jpg | Gargantilla Lisa | $25.00 | Gargantilla de Gold-Filled bañada en oro. Diseño liso |
| 42 | Collar Medio 02.jpg | Collar Medio | $25.00 | Collar Medio de Gold-Filled bañada en oro |
| 43 | Collar Eslabon Medio.jpg | Collar Eslabón Medio | $30.00 | Collar Medio de Gold-Filled con eslabones |
| 44 | Collar Largo 01.jpg | Collar Largo | $32.00 | Collar Largo de Gold-Filled bañada en oro |

### Accesorios (1 producto)

| # | Archivo | Nombre | Precio | Descripción |
|---|---------|--------|--------|-------------|
| 45 | Piedras Natural.jpg | Piedras Naturales | $7.00 | Dijes Piedras Naturales. Cada una vibra con intención |

---

## GUÍA DE ESTILOS CSS

### Variables de colores (modificar en `:root`)

```css
:root {
  /* Paleta cálida de velas */
  --bg: #100e0c;              /* Fondo principal (carbón oscuro) */
  --bg-raised: #1a1612;       /* Fondo elevado */
  --bg-card: #1e1915;         /* Fondo de tarjetas */
  --surface: #141110;         /* Fondo de secciones alternas */
  --border: rgba(232,168,124,0.10); /* Bordes sutiles */
  
  /* Texto */
  --text: #f4ede3;            /* Texto principal (crema) */
  --text-muted: #a89b8b;      /* Texto secundario */
  --text-faint: #6d6359;      /* Texto tenue */
  
  /* Acento (miel/ámbar) */
  --accent: #e8a87c;          /* Color de acento principal */
  --accent-hover: #d99a6c;    /* Acento hover */
  
  /* Funcional */
  --whatsapp: #25d366;        /* Verde WhatsApp */
  --danger: #c0392b;          /* Rojo peligro */
}
```

### Clases principales

| Clase | Uso |
|-------|-----|
| `.btn-primary` | Botón ámbar/acentado |
| `.btn-ghost` | Botón transparente con borde |
| `.btn-whatsapp` | Botón verde WhatsApp |
| `.product-card` | Tarjeta de producto en grid |
| `.filter-btn` | Botón de filtro de categoría |
| `.search` | Campo de búsqueda |
| `.cart-drawer` | Panel lateral del carrito |
| `.qty-stepper` | Stepper de cantidad (+/−) |
| `.contact-link` | Tarjeta de contacto con icono SVG |

### Breakpoints responsive

```css
@media (max-width: 900px)  { /* Tablet — menú mobile, layout vertical */ }
@media (max-width: 600px)  { /* Móvil — grid 2 columnas, botones full-width */ }
@media (max-width: 380px)  { /* Móvil pequeño — grid 1 columna */ }
```

---

## ESTRUCTURA DE ARCHIVOS

### Requeridos (no borrar)

| Archivo | Propósito | Líneas aprox. |
|---------|-----------|---------------|
| `index.html` | Landing page | ~250 |
| `css/style.css` | Todos los estilos | ~730 |
| `js/app.js` | Toda la lógica JS | ~390 |
| `images/thumbs/*.jpg` | Thumbnails del grid | 97 archivos |
| `images/catalog/*.jpg` | Imágenes del catálogo | 97 archivos |
| `CNAME` | Dominio personalizado | 1 línea |

### Opcionales

| Archivo | Propósito |
|---------|-----------|
| `process_images.py` | Script para remover bordes blancos |
| `PLAN_IMPLEMENTACION.md` | Plan de fases del proyecto |
| `.gitignore` | Archivos ignorados por git |

---

## COMANDOS GIT ÚTILES

```bash
# Ver estado
git status

# Agregar y commitear
git add index.html js/app.js css/style.css
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

### El sitio no carga en yosoy222.com
- **Causa:** DNS no propagado o GitHub Pages no activado
- **Solución:** Verificar DNS con `dig yosoy222.com +short` y revisar settings de GitHub Pages

---

## CONTACTO DEL PROYECTO

- **GitHub:** https://github.com/juancito8812
- **Repositorio:** https://github.com/juancito8812/yosoy222
- **Sitio web:** https://yosoy222.com

---

*Documentación actualizada: 3 de septiembre 2026*
