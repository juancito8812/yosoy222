# 🕯️ YoSoy222 — Velas Artesanales y Accesorios

> Tienda online de velas artesanales, pulseras, collares, franelas y accesorios.
> Desplegada en **GitHub Pages** con dominio personalizado **yosoy222.com**.
> **PWA instalable** con soporte offline.

**Repositorio:** https://github.com/juancito8812/yosoy222
**URL de producción:** https://yosoy222.com
**URL GitHub Pages:** https://juancito8812.github.io/yosoy222/
**WhatsApp (pedidos):** +58 412 648 1628 (`584126481628`)

---

## 📋 ÍNDICE

1. [Vista general](#vista-general)
2. [Arquitectura del proyecto](#arquitectura-del-proyecto)
3. [Stack tecnológico](#stack-tecnológico)
4. [Cómo ejecutar localmente](#cómo-ejecutar-localmente)
5. [Base de datos: Catalogo.xlsx (fuente de verdad)](#base-de-datos-catalogoxlsx-fuente-de-verdad)
6. [Configuración actual (WhatsApp y redes)](#configuración-actual-whatsapp-y-redes)
7. [Cómo agregar un producto](#cómo-agregar-un-producto)
8. [Cómo eliminar un producto](#cómo-eliminar-un-producto)
9. [Procesamiento de imágenes (bordes blancos)](#procesamiento-de-imágenes-bordes-blancos)
10. [PWA: instalar y funcionamiento offline](#pwa-instalar-y-funcionamiento-offline)
11. [Seguridad aplicada](#seguridad-aplicada)
12. [Deploy a GitHub Pages](#deploy-a-github-pages)
13. [Configurar dominio personalizado](#configurar-dominio-personalizado)
14. [Tabla de productos completa](#tabla-de-productos-completa)
15. [Guía de estilos CSS](#guía-de-estilos-css)
16. [Estructura de archivos](#estructura-de-archivos)
17. [Comandos git útiles](#comandos-git-útiles)
18. [Troubleshooting](#troubleshooting)

---

## VISTA GENERAL

### Características del sitio

- **Hero asimétrico** con fotos reales de productos
- **Búsqueda en tiempo real** por nombre **y descripción** (ej: "soja", "lavanda", "gold-filled")
- **Filtros por categoría**: Todos · Velas · Pulseras · Collares · Franelas · Accesorios
- **Lightbox**: clic en cualquier imagen de producto → vista ampliada desde `images/catalog/`, con flechas ◀ ▶, teclado (Esc, ←, →), contador, y botón directo de WhatsApp
- **Carrito de compras** con steppers de cantidad (+/−), persistente en `localStorage` y validado al cargar
- **Checkout por WhatsApp** con mensaje itemizado (producto × cantidad — subtotal, y total final)
- **Número real de WhatsApp configurado** (+58 412 648 1628) en todos los botones
- **PWA**: instalable en Android/iOS/desktop, funciona offline (service worker + manifest)
- **Fallback de imagen**: si falta el archivo de un producto, se muestra el nombre como placeholder en vez de un ícono roto
- **Seguridad**: escape de HTML en todo render dinámico (anti-XSS), validación de `localStorage`, headers de seguridad
- **Sección "Cómo comprar"**, "Nosotros" y Contacto con redes @yosoy222
- **Accesibilidad** (focus-visible, aria-labels, reduced-motion) y **responsive mobile-first**
- **44 productos** con precios y descripciones reales sincronizados desde `Catalogo.xlsx`

### Categorías de productos (total: 44)

| Categoría (filtro) | Catálogo | Cantidad | Rango de precios |
|--------------------|----------|----------|------------------|
| Velas (Moldes + Envases) | `vela` | 25 | $0.17 – $23.00 |
| Collares (gargantillas + collares) | `collar` | 5 | $20.00 – $32.00 |
| Pulseras | `pulsera` | 6 | $6.00 – $8.00 |
| Franelas | `franela` | 7 | $14.00 – $16.00 |
| Accesorios (dijes) | `otro` | 1 | $7.00 |
| **Total** | | **44** | **$0.17 – $32.00** |

> ✅ **Los 44 productos tienen foto** (los dos que antes mostraban placeholder — Mini Petit y Armonía Coco — ya tienen imagen real extraída del catálogo en PDF).

---

## ARQUITECTURA DEL PROYECTO

```
yosoy222/                          ← RAÍZ del repositorio
│
├── index.html                     ← Landing page (única página, ~293 líneas)
│   ├── Meta tags: SEO, Open Graph, PWA, seguridad
│   ├── Header fijo: logo, nav, carrito, menú mobile
│   ├── Hero asimétrico (texto + fotos)
│   ├── Catálogo: búsqueda + filtros + grid de productos
│   ├── "Cómo comprar" · "Nosotros" · Contacto · Footer
│   ├── Carrito drawer (overlay lateral)
│   ├── Botón flotante de WhatsApp
│   └── Lightbox (vista ampliada de producto, role="dialog")
│
├── css/
│   └── style.css                   ← Estilos completos (~830 líneas)
│       ├── Tokens CSS (:root — paleta cálida de velas)
│       ├── Header, hero, catálogo, tarjetas, buscador, filtros
│       ├── Cómo comprar, Nosotros, Contacto, Footer
│       ├── Carrito drawer + steppers
│       ├── Lightbox
│       ├── WhatsApp flotante
│       ├── Accesibilidad (focus-visible) · Reduced-motion
│       └── Media queries (900px, 600px, 380px)
│
├── js/
│   └── app.js                      ← Toda la lógica JS (~539 líneas)
│       ├── Config WhatsApp: const WHATSAPP = '584126481628'
│       ├── Array products[] — 44 productos (file, name, cat, price, desc)
│       ├── Seguridad: escapeHtml() + loadCart() validado
│       ├── Render del grid · búsqueda (nombre + descripción) · filtros
│       ├── Carrito (localStorage) · steppers · checkout WhatsApp
│       ├── Menú mobile · scroll spy · smooth scroll
│       ├── Lightbox (abrir, navegar, teclado)
│       └── Registro del Service Worker (PWA)
│
├── manifest.json                   ← PWA: nombre, iconos, tema (~66 líneas)
├── sw.js                           ← Service worker: caché offline (~110 líneas)
├── icons/                          ← 10 iconos PWA (72px → 512px + maskable)
│
├── images/
│   ├── thumbs/                     ← Miniaturas del grid (97 archivos en carpeta; 42 usados por el catálogo actual)
│   └── catalog/                    ← Imágenes para el lightbox (mismo nombre de archivo; 97 en carpeta)
│
├── process_images.py               ← Remoción de bordes blancos (v1, básica)
├── process_images_v2.py            ← Remoción de bordes blancos (v2, detección adaptativa agresiva)
├── CNAME                          ← Dominio personalizado (yosoy222.com)
├── .gitignore                     ← Archivos ignorados (incluye server.js de pruebas)
├── README.md                      ← Este archivo
└── PLAN_IMPLEMENTACION.md         ← Plan de fases del proyecto
```

### Flujo de datos

```
Catalogo.xlsx (fuente de verdad) ──sincroniza──▶ js/app.js (products[])
                                                     │
index.html ◀── css/style.css ── js/app.js
                     │
                     ├── Renderiza grid desde products[] (44 tarjetas)
                     ├── Imágenes → images/thumbs/{file}
                     ├── Búsqueda filtra por name + desc
                     ├── Filtros filtan por categoría
                     ├── Clic en imagen → lightbox (images/catalog/{file})
                     ├── Clic "Agregar" → carrito → localStorage
                     └── "Pedir por WhatsApp" → wa.me/584126481628?text=...
```

---

## STACK TECNOLÓGICO

| Componente | Tecnología | Notas |
|-----------|-----------|-------|
| HTML | HTML5 semántico | ARIA labels, meta PWA/OG/seguridad |
| CSS | CSS3 vanilla | Variables, Grid, Flexbox, `prefers-reduced-motion` |
| JavaScript | ES6+ vanilla | Sin dependencias, sin build tools |
| Imágenes | JPEG | `images/thumbs/` (grid) + `images/catalog/` (lightbox), bordes removidos |
| PWA | manifest.json + sw.js | Instalable y offline; iconos en `icons/` |
| Hosting | GitHub Pages | Static site, HTTPS automático |
| DNS | Cloudflare | Dominio yosoy222.com |
| WhatsApp | wa.me links | Sin API — solo enlaces directos a `584126481628` |
| Fonts | Google Fonts | Playfair Display (títulos) + Inter (cuerpo) |
| Base de datos | Catalogo.xlsx | Excel local — fuente de verdad de precios/descripciones |

**NO se usa:** React, Vue, Angular, jQuery, npm, webpack, backend, ni ninguna dependencia externa.

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

**IMPORTANTE:** No abrir `index.html` directamente con `file://` — las imágenes y el service worker no cargarán. Siempre usar un servidor local (el SW solo funciona bajo `http://localhost` o `https`).

---

## BASE DE DATOS: Catalogo.xlsx (FUENTE DE VERDAD)

El **Excel es la base de datos principal del negocio** y la fuente de verdad de la tienda.

**Ubicación:** `/home/jr/Documentos/Catalogo velas/Catalogo.xlsx`

### Hojas del Excel y su mapeo a la web

| Hoja del Excel | Categoría en la web | Productos |
|----------------|--------------------|-----------|
| Velas Moldes | `vela` (filtro "Velas") | 15 |
| Velas Envases | `vela` (filtro "Velas") | 10 |
| Gargantillas y Pulseras | `collar` / `pulsera` / `otro` | 11 |
| Franelas | `franela` (filtro "Franelas") | 7 |

### Flujo de actualización (precios, descripciones, productos nuevos)

1. Editar `Catalogo.xlsx` (cambiar precio, descripción, agregar/quitar productos, registrar foto).
2. Pedirle al agente: *"sincroniza el sitio con Catalogo.xlsx"* — se vuelca cada fila a `js/app.js`.
3. Para un producto nuevo: la columna de imagen debe referenciar el archivo JPG en `images/thumbs/` y `images/catalog/`.
4. Commit + push → deploy automático en ~2 minutos.

> Cada entrada del array `products[]` en `js/app.js` equivale a una fila del Excel:

```javascript
{ file: "NombreArchivo.jpg", name: "Nombre visible", cat: "vela", price: 15, desc: "Descripción completa" }
```

---

## CONFIGURACIÓN ACTUAL (WHATSAPP Y REDES)

### ✅ WhatsApp — YA CONFIGURADO (no cambiar a menos que cambies de número)

**Número real:** `+58 412 648 1628` → formato wa.me: `584126481628`

**Único punto de configuración en código:** `js/app.js`

```javascript
const WHATSAPP = '584126481628';
```

Todos los botones usan esa constante: carrito, lightbox, contacto, footer y botón flotante.
Los enlaces fijos de `index.html` (3 lugares: contacto, footer, flotante) también usan `584126481628`.

**Formato internacional (sin `+`, sin espacios):**
```
584126481628 = 58 (Venezuela) + 412 648 1628 (número local)
```

**Para verificar que no queda ningún placeholder:**
```bash
grep -rn "521XXX\|5215512345678" index.html js/ css/ || echo "OK: sin placeholders"
```

### Redes sociales — @yosoy222

| Red | URL | Estado |
|-----|-----|--------|
| Instagram | https://www.instagram.com/yosoy222 | ✅ Configurado |
| TikTok | https://www.tiktok.com/@yosoy222 | ✅ Configurado |
| Facebook | https://www.facebook.com/yosoy222 | ✅ Configurado |

Si las cuentas reales tienen otro usuario, editar `index.html` (secciones contacto y footer) y el `manifest.json` no hace falta.

---

## CÓMO AGREGAR UN PRODUCTO

### Paso 1: Imagen

Colocar el archivo en **ambas** carpetas con el mismo nombre:
```
images/thumbs/NOMBRE.jpg       ← miniatura del grid
images/catalog/NOMBRE.jpg      ← imagen grande del lightbox
```

- Formato `.jpg`/`.jpeg`, cuadrada o recortada al contenido
- Sin bordes blancos (usar el procesador, ver sección de imágenes)
- Si la imagen no existe, la tarjeta muestra el nombre del producto como placeholder (CSS `::after` con `attr(data-name)`) — no rompe la página

### Paso 2: Dato en app.js

**Archivo:** `js/app.js` → array `products`

```javascript
{ file: "Nueva Vela Azul.jpg", name: "Vela Azul Celestial", cat: "vela", price: 25, desc: "Vela artesanal de 150grs. en envase de vidrio. Aroma: Jazmín." },
```

**Campos:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `file` | string | Nombre exacto del archivo JPG (con extensión, espacios y tildes permitidos) |
| `name` | string | Nombre mostrado al usuario |
| `cat` | string | `"vela"` · `"collar"` · `"pulsera"` · `"franela"` · `"otro"` (accesorios) |
| `price` | number | Precio en USD |
| `desc` | string | Descripción (visible en tarjeta, lightbox y búsqueda) |

> 🔁 Si el producto viene del Excel, lo normal es sincronizar desde `Catalogo.xlsx` y no editar a mano (ver sección 5).

### Paso 3: Commit y push

```bash
git add images/thumbs/NUEVA.jpg images/catalog/NUEVA.jpg js/app.js
git commit -m "feat: agregar producto Nueva Vela Azul"
git push
```

El deploy automático de GitHub Pages actualiza el sitio en ~2 minutos (si el visitante ya tenía el PWA cacheado, puede necesitar dos recargas, ver Troubleshooting).

---

## CÓMO ELIMINAR UN PRODUCTO

1. Quitar la línea del array `products[]` en `js/app.js`.
2. (Opcional) Borrar las imágenes: `rm "images/thumbs/ARCHIVO.jpg" "images/catalog/ARCHIVO.jpg"`
3. Commit y push:
```bash
git commit -am "feat: eliminar producto NOMBRE"
git push
```

---

## PROCESAMIENTO DE IMÁGENES (BORDES BLANCOS)

El sitio muestra las fotos de producto sin los bordes blancos del original. Hay dos scripts en la raíz del repo:

### Script v1 — `process_images.py`
- Umbral fijo `THRESHOLD = 240` (píxeles near-white) y `CROP_MARGIN = 2px`
- Útil para fotos con fondo blanco uniforme

### Script v2 — `process_images_v2.py` (recomendado)
- Detección adaptativa y más agresiva de píxeles blancos/near-white por imagen
- Procesa en lote `images/thumbs/` y `images/catalog/` para mantener sincronizados ambos tamaños
- Es el que se usó para limpiar la tanda final de bordes

```bash
python3 process_images.py    # o
python3 process_images_v2.py
```

**Requisito:** Pillow instalado (`pip install pillow`).

---

## PWA: INSTALAR Y FUNCIONAMIENTO OFFLINE

El sitio es una **PWA instalable** con caché offline.

### Archivos

| Archivo | Función |
|---------|---------|
| `manifest.json` | Nombre "YoSoy222", `display: standalone`, tema `#d4a24e`, fondo `#1a1210`, iconos |
| `sw.js` | Service worker: precache de HTML/CSS/JS/manifest e **imágenes** (estrategia *stale-while-revalidate*) |
| `icons/` | 10 iconos: 72, 96, 128, 144, 152, 192, 384, 512 + maskable 192/512 |

### Instalar en el celular

1. Abrir https://yosoy222.com en Chrome/Edge (Android) o Safari (iOS)
2. Android: menú ⋮ → "Instalar aplicación" · iOS: Compartir → "Añadir a pantalla de inicio"
3. Se abre como app a pantalla completa, sin barra del navegador

### Offline

- La primera visita descarga y guarda los recursos
- Con el teléfono en modo avión, el sitio sigue abriendo y mostrando el catálogo (los pedidos por WhatsApp requieren conexión, obviamente)

### Importante sobre la caché (PWA)

El service worker sirve contenido cacheado y lo actualiza en segundo plano. **Tras cada deploy, los visitantes habituales pueden ver la versión vieja durante un rato.** Soluciones:
- Recargar dos veces (la segunda ya toma la versión nueva)
- O abrir en incógnito una vez
- O en DevTools → Application → Service Workers → "Unregister" + recargar

---

## SEGURIDAD APLICADA

Revisión y endurecimiento aplicados en `js/app.js` + `index.html`:

### JavaScript (`js/app.js`)

| Medida | Dónde | Qué hace |
|--------|-------|----------|
| `escapeHtml()` | Render del grid, carrito, atributos | Escapa `< > " ' &` en TODO texto insertado con template literals (nombres, descripciones, categorías) — evita XSS si se manipula `products[]` o el `localStorage` |
| `loadCart()` validado | Carga del carrito | Rechaza JSON malformado e items inválidos (tipo de dato, `price >= 0`, `qty` entre 1 y 999) |

### Headers (meta tags en `index.html`)

```html
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">
```

> 📌 Nota: algunos navegadores muestran un warning porque `X-Frame-Options` solo tiene efecto real como header HTTP, no como `<meta>`. Para aplicar headers HTTP reales en GitHub Pages haría falta un archivo `_headers` (aún no implementado — ver PLAN, tareas futuras).

### Ya seguro por diseño
- ✅ Sin `eval()`, sin `innerHTML` con datos de usuario sin escapar
- ✅ Sin secretos ni claves en el código ni en git
- ✅ Enlaces externos con `target="_blank" rel="noopener"`
- ✅ Service worker solo cachea recursos del mismo origen
- ✅ No hay backend: la única entrada de datos es el navegador del visitante (catálogo estático + carrito local)

---

## DEPLOY A GITHUB PAGES

### Estado actual

✅ **GitHub Pages:** Activado (deploy desde `main`, carpeta raíz)
✅ **Dominio:** yosoy222.com (Cloudflare)
✅ **HTTPS:** Habilitado
✅ **Deploy automático:** cada push a `main` (~2 min)

### Cómo se publica

```bash
git add -A
git commit -m "feat: descripción del cambio"
git push origin main
```

Nada más: GitHub Pages compila y publica solo.

### Verificar el deploy

```bash
curl -s https://api.github.com/repos/juancito8812/yosoy222/pages | python3 -m json.tool
curl -sI https://yosoy222.com | head -5
```

---

## CONFIGURAR DOMINIO PERSONALIZADO

### Estado actual

✅ **Dominio:** yosoy222.com (registrado en Cloudflare)
✅ **DNS:** Cloudflare, proxy **desactivado** (requerido por GitHub Pages)
✅ **Registros:** 4 A records + 1 CNAME

### Registros DNS (ya creados vía API de Cloudflare)

| Tipo | Nombre | Valor | Proxy |
|------|--------|-------|-------|
| A | @ | 185.199.108.153 | Off |
| A | @ | 185.199.109.153 | Off |
| A | @ | 185.199.110.153 | Off |
| A | @ | 185.199.111.153 | Off |
| CNAME | www | juancito8812.github.io | Off |

### CNAME en el repo

Archivo `CNAME` en la raíz con el contenido:
```
yosoy222.com
```

### Verificar

```bash
dig yosoy222.com +short      # debe listar las 4 IPs de GitHub Pages
curl -sI https://yosoy222.com | head -5
```

> Si un equipo de tu casa no abre la página pero desde datos móviles sí, es **caché DNS del router/ISP**: reinicia el router o cambia el DNS del dispositivo a `1.1.1.1` / `8.8.8.8`.

---

## TABLA DE PRODUCTOS COMPLETA

> Fuente: `Catalogo.xlsx` → `js/app.js`. Las descripciones completas (colores, aromas disponibles) viven en el Excel y en `app.js`; aquí se resumen los datos clave.
> 💡 *Todos los productos de cera de soja se ofrecen en varios colores y aromas: Coco, Coco Vainilla, Lavanda, Jazmín, Canela, Limón Fresh, Café.*

### Velas Moldes (15) — filtro "Velas"

| # | Nombre | Archivo | Precio | Resumen |
|---|--------|---------|--------|---------|
| 1 | Rosa | `Rosa .jpg` | $7.00 | Vela 79g en forma de rosa |
| 2 | Mini Corazones | `Mini Corazones.jpg` | $0.17 | Wax melt 1g, mini corazón |
| 3 | Rosa Pequeña | `Rosa Pequeña.jpg` | $4.50 | Vela 23g, palito decorativo |
| 4 | Mini Margarita | `Mini Margarita.jpg` | $1.70 | Wax melt 6g, mini margarita |
| 5 | Margarita Pequeña | `Margarita.jpg` | $3.00 | Vela 16g, palito decorativo |
| 6 | Tulipán Pequeña | `Tulipan.jpg` | $5.00 | Vela 33g, palito decorativo |
| 7 | Bouquet Tulipán | `Buquet .jpg` | $8.50 | Vela 83g, bouquet de tulipanes |
| 8 | Espiral | `Espiral.jpg` | $9.50 | Vela 104g en espiral |
| 9 | Sagrada Familia | `Sagrada Familia.jpg` | $7.00 | Vela 75g |
| 10 | Buda | `Buda.jpg` | $6.50 | Vela 20g |
| 11 | Mano Hamsa | `Hamsa .jpg` | $8.00 | Vela 75g |
| 12 | Corazón | `Corazón .jpg` | $13.50 | Vela 182g |
| 13 | Cruz con Paloma | `Cruz .jpg` | $7.00 | Vela 52g |
| 14 | Cubo | `Cubo .jpg` | $7.00 | Vela 40g |
| 15 | Virgen del Carmen | `Virgen del Carmen.jpg` | $7.00 | Vela 42g |

### Velas Envases (10) — filtro "Velas"

| # | Nombre | Archivo | Precio | Resumen |
|---|--------|---------|--------|---------|
| 16 | Mini Petit | `Mini Petit.jpg` | $7.50 | Vela 123g, vidrio, tapa dorada |
| 17 | Mandala | `Mandala.jpg` | $9.00 | Vela 98g, envase metal decorativo |
| 18 | Vintage | `Vintage.jpg` | $9.50 | Vela 165g, vidrio, tapa corcho, detalle floral |
| 19 | Petit | `PETIT.jpg` | $11.00 | Vela 171g, vidrio, tapa dorada, corazones rojos |
| 20 | Estrella | `Estrella1.jpg` | $12.00 | Vela 285g, vidrio, forma de estrella |
| 21 | Aura Rosa | `Aura Rosa.jpg` | $17.00 | Vela 342g, tapa de madera, rosa en superficie |
| 22 | Aura Tulipán | `Aura Tulipan.jpg` | $17.00 | Vela 335g, tapa de madera, tulipán en superficie |
| 23 | Aura Corazones | `Aura Corazón.jpg` | $20.00 | Vela 418g, marmoleada blanco/rosa |
| 24 | Armonía Canela | `Armonia.jpg` | $22.00 | Vela 508g, vidrio opaco, mecha de madera |
| 25 | Armonía Coco | `Armonia Coco.jpg` | $23.00 | Vela 516g, vidrio opaco |

### Gargantillas y Collares (5) — filtro "Collares" · *Gold-Filled bañada en oro, dije de piedra natural a elección*

| # | Nombre | Archivo | Precio | Medidas |
|---|--------|---------|--------|---------|
| 26 | Gargantilla G-01 | `Gargantilla 2.jpg` | $20.00 | 25cm · 1,5mm · broche langosta |
| 27 | Gargantilla G-02 | `Gargantilla Lisa.jpg` | $25.00 | 25cm · 3mm · broche ancla |
| 28 | Collar Medio C.M-01 | `Collar Medio 02.jpg` | $25.00 | 29cm · 3mm · broche ancla |
| 29 | Collar Medio C.M-02 | `Collar Eslabon Medio.jpg` | $30.00 | 34cm · 4mm sólido |
| 30 | Collar Largo C.L-01 | `Collar Largo 01.jpg` | $32.00 | 40cm · 4mm sólido |

### Pulseras (6) — filtro "Pulseras"

| # | Nombre | Archivo | Precio | Resumen |
|---|--------|---------|--------|---------|
| 31 | Pulsera Infinito | `Pulsera Infinito Azul.jpg` | $8.00 | Símbolo infinito, trenzado azul |
| 32 | Pulsera Infinito Beige | `Pulsera Infinito Beige.jpg` | $8.00 | Símbolo infinito, trenzado beige |
| 33 | Pulsera Infinito Roja | `Pulsera Infinito Roja.jpg` | $8.00 | Símbolo infinito, trenzado rojo |
| 34 | Pulsera San Benito | `Pulsera San Benito.jpg` | $8.00 | San Benito, hilo rojo |
| 35 | Pulsera Perla | `Pulsera Perla.jpg` | $6.00 | Perla, calma y claridad |
| 36 | Pulsera Ojito | `Pulsera Ojito.jpg` | $6.00 | Ojito protector, hilo rojo |

### Accesorios (1) — filtro "Accesorios"

| # | Nombre | Archivo | Precio | Resumen |
|---|--------|---------|--------|---------|
| 37 | Piedras Naturales | `Piedras Natural.jpg` | $7.00 | Dijes de piedras naturales |

### Franelas (7) — filtro "Franelas"

| # | Nombre | Archivo | Precio | Resumen |
|---|--------|---------|--------|---------|
| 38 | F-01 Loto Sagrado | `image_1779928174716.jpg` | $16.00 | Loto + Om, tela suave |
| 39 | F-02 Loto Sagrado | `image_1779972568224.jpg` | $16.00 | Loto + Om, tela suave |
| 40 | F-03 Loto Sagrado | `image_1779972935496.jpg` | $16.00 | Loto + Om, tela suave |
| 41 | F-04 Ser Feliz | `image_1779973394660.jpg` | $14.00 | Diseño minimalista |
| 42 | F-05 Hazte Caso | `image_1779974294919.jpg` | $14.00 | Diseño minimalista |
| 43 | F-06 Cool | `image_1779992865576.jpg` | $14.00 | Diseño minimalista |
| 44 | F-07 El Amor | `image_1779993230752.jpg` | $14.00 | Diseño minimalista |

> ⚠️ Las fotos de las franelas se asignaron a archivos sin usar de la carpeta como placeholder visual. **Si alguna no corresponde a su producto, avísame con la foto correcta y corrijo el mapeo.**

---

## GUÍA DE ESTILOS CSS

### Variables de color (modificar en `:root` de `css/style.css`)

```css
:root {
  /* Paleta cálida de velas */
  --bg: #100e0c;              /* Fondo principal (carbón oscuro) */
  --bg-raised: #1a1612;       /* Fondo elevado */
  --bg-card: #1e1915;         /* Fondo de tarjetas */
  --surface: #141110;         /* Secciones alternas */
  --border: rgba(232,168,124,0.10);  /* Bordes sutiles */
  --border-strong: rgba(232,168,124,0.18);

  /* Texto */
  --text: #f4ede3;            /* Texto principal (crema) */
  --text-muted: #a89b8b;      /* Texto secundario */
  --text-faint: #6d6359;      /* Texto tenue */

  /* Acento (miel/ámbar, llama de vela) */
  --accent: #e8a87c;
  --accent-hover: #d99a6c;
  --accent-glow: rgba(232,168,124,0.25);

  /* Funcional */
  --whatsapp: #25d366;
  --whatsapp-hover: #1fbe5a;
  --danger: #c0392b;

  /* Layout */
  --radius: 14px; --radius-sm: 8px; --radius-full: 999px;
  --shadow: 0 6px 24px rgba(0,0,0,0.35);
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --duration: 0.28s;
}
```

### Tipografía

| Rol | Fuente | Peso |
|-----|--------|------|
| Títulos (h1–h4) | Playfair Display (serif) | 600 |
| Cuerpo y UI | Inter (sans) | 400–700 |

### Clases principales

| Clase | Uso |
|-------|-----|
| `.btn-primary` / `.btn-ghost` / `.btn-whatsapp` | Botones |
| `.product-card` / `.product-image` / `.product-desc` | Tarjetas del catálogo |
| `.product-image::after` | Fallback de imagen faltante (muestra `data-name`) |
| `.filter-btn` / `.search` | Filtros y buscador |
| `.cart-drawer` / `.cart-item` / `.qty-stepper` | Carrito |
| `.lightbox` / `.lightbox-img` / `.lightbox-nav` | Vista ampliada |
| `.whatsapp-float` | Botón flotante de WhatsApp |

### Breakpoints responsive

```css
@media (max-width: 900px)  { /* Tablet: menú mobile, hero/nosotros apilados */
@media (max-width: 600px)  { /* Móvil: grid 2 columnas, pasos 1 columna, lightbox compacto */
@media (max-width: 380px)  { /* Móvil pequeño: grid 1 columna */
```

---

## ESTRUCTURA DE ARCHIVOS

### Requeridos (no borrar)

| Archivo | Propósito | Líneas aprox. |
|---------|-----------|---------------|
| `index.html` | Landing page | ~293 |
| `css/style.css` | Todos los estilos | ~830 |
| `js/app.js` | Toda la lógica JS | ~539 |
| `manifest.json` | Metadata PWA | ~66 |
| `sw.js` | Service worker (offline) | ~110 |
| `icons/` | Iconos PWA (10 PNG) | — |
| `CNAME` | Dominio personalizado | 1 |

### Imágenes

| Carpeta | Contenido | Uso |
|---------|-----------|-----|
| `images/thumbs/` | Miniaturas del grid (97 archivos en disco; el catálogo actual usa 42) | Tarjetas de producto |
| `images/catalog/` | Imágenes grandes (mismo esquema de nombres) | Lightbox |

### Opcionales / herramientas

| Archivo | Propósito |
|---------|-----------|
| `process_images.py` | Remoción básica de bordes blancos |
| `process_images_v2.py` | Remoción adaptativa/agresiva de bordes blancos (recomendado) |
| `PLAN_IMPLEMENTACION.md` | Plan de fases del proyecto |
| `.gitignore` | Archivos ignorados (`server.js` de pruebas, etc.) |

---

## COMANDOS GIT ÚTILES

```bash
# Ver estado
git status

# Agregar y commitear
git add js/app.js index.html css/style.css
git commit -m "feat: descripción del cambio"

# Subir a GitHub (deploy automático a yosoy222.com)
git push origin main

# Ver historial
git log --oneline -10

# Descartar cambios de un archivo (cuidado: pierde tu trabajo local)
git checkout -- index.html
```

---

## TROUBLESHOOTING

### "El nombre de usuario @521XXXXXXXXX no está en WhatsApp" al abrir un enlace
- **Causa:** el enlace que abriste es **viejo**: un chat/contacto guardado, un mensaje reenviado, o una versión cacheada del sitio de cuando aún estaba el número placeholder. El sitio desplegado ya usa `584126481628` en todos los botones.
- **Solución:** borra ese chat/contacto antiguo en WhatsApp, o abre la web de nuevo con recarga forzada (`Ctrl+Shift+R`) / incógnito, y usa los botones del sitio. Verificar en el código:
  ```bash
  grep -c "584126481628" index.html js/app.js   # esperado: 4+ ocurrencias
  ```

### El sitio muestra la versión vieja después de un cambio
- **Causa:** caché del navegador **o service worker PWA** (sirve lo cacheado y actualiza en segundo plano)
- **Solución:** recargar 2 veces, o `Ctrl+Shift+R`, o incógnito, o DevTools → Application → Service Workers → Unregister

### Las imágenes no cargan
- **Causa 1:** abrir el HTML con `file://` → usar siempre `python3 -m http.server`
- **Causa 2:** el archivo no existe → la tarjeta muestra el placeholder con el nombre del producto. Agregar el JPG a `images/thumbs/` y `images/catalog/` con el nombre exacto que usa `js/app.js`

### El botón de WhatsApp no funciona o abre número equivocado
- Verificar `js/app.js`: `const WHATSAPP = '584126481628';` y los 3 enlaces fijos en `index.html`

### Algunas imágenes aún muestran bordes blancos
- Correr `python3 process_images_v2.py` (detección agresiva) y volver a hacer push

### Un producto nuevo no aparece
- ¿Está en `products[]` de `app.js` con `cat` válida (`vela`, `collar`, `pulsera`, `franela`, `otro`)? ¿Se hizo push? El deploy tarda ~2 min.

### La búsqueda no encuentra algo
- La búsqueda cubre **nombre y descripción**. Si buscas "premium" y no aparece, ese término no está en ningún nombre/descripción — revisa el texto en el Excel/app.js

### El sitio no abre en yosoy222.com desde casa, pero sí con datos móviles
- **Causa:** caché DNS del router/ISP
- **Solución:** reiniciar router; o en el dispositivo cambiar DNS a `1.1.1.1` / `8.8.8.8`; o verificar con `dig yosoy222.com +short` (debe listar las 4 IPs de GitHub Pages)

---

## CONTACTO DEL PROYECTO

- **GitHub:** https://github.com/juancito8812
- **Repositorio:** https://github.com/juancito8812/yosoy222
- **Sitio web:** https://yosoy222.com
- **WhatsApp pedidos:** +58 412 648 1628

---

*Documentación actualizada: 3 de septiembre de 2026 — sincronizada con el estado real del código (44 productos, PWA, lightbox, seguridad, número de WhatsApp real).*
