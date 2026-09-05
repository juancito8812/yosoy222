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
- **Sección "Cómo comprar"**, "Nosotros" y Contacto con redes @yo_soy222
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
> ✅ **Imágenes del set `imagenes_web` (híbrido)**: 36 productos (velas + joyería) usan las fotos 1000×1000 de `/home/jr/Documentos/gemini velas/imagenes_web/`; las 7 franelas (F-01…F-07) conservan sus fotos reales; Armonía Coco conserva su imagen anterior (no existe en el set).

---

## ARQUITECTURA DEL PROYECTO

```
yosoy222/                          ← RAÍZ del repositorio│   ├── index.html                     ← Landing page (única página, ~293 líneas)
│   ├── Meta tags: SEO, Open Graph, PWA, seguridad (CSP + Referrer-Policy)
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
│       ├── Tokens CSS (:root — paleta tierra crema)
│       ├── Header, hero, catálogo, tarjetas, buscador, filtros
│       ├── Cómo comprar, Nosotros, Contacto, Footer
│       ├── Carrito drawer + steppers
│       ├── Lightbox
│       ├── WhatsApp flotante
│       ├── Accesibilidad (focus-visible) · Reduced-motion
│       └── Media queries (900px, 600px, 380px)
│
├── js/
│   └── app.js                      ← Toda la lógica JS (~540 líneas)
│       ├── Config WhatsApp: const WHATSAPP = '584126481628'
│       ├── Array products[] — 44 productos (file, name, cat, price, desc)
│       ├── Seguridad: escapeHtml() + loadCart() validado
│       ├── Render del grid · búsqueda (nombre + descripción) · filtros
│       ├── Carrito (localStorage) · steppers · checkout WhatsApp
│       ├── Menú mobile · scroll spy · smooth scroll
│       ├── Lightbox (abrir, navegar, teclado, cerrar con Esc)
│       ├── Clic en tarjeta con teclado (Enter/Espacio → lightbox)
│       └── Registro del Service Worker (PWA)
│
├── manifest.json                   ← PWA: nombre, iconos, tema (~66 líneas)
├── sw.js                           ← Service worker: caché offline (~110 líneas)
├── icons/                          ← 10 iconos PWA — 8 'any' (72,96,128,144,152,192,384,512px) + 2 maskable
│
├── images/
│   ├── thumbs/                     ← Miniaturas del grid (142 archivos en disco; el catálogo usa 44)
│   └── catalog/                    ← Imágenes para el lightbox (mismo nombre de archivo; 142 en disco)
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

### Verificación automática Excel ↔ sitio

Existe un script de verificación en `/home/jr/Documentos/Catalogo velas/_verify_sync.py`:

```bash
cd "/home/jr/Documentos/Catalogo velas" && python3 _verify_sync.py
```

Compara los **42 productos del Excel** (4 hojas) contra el sitio: presencia, **precio** y **descripción** (con y sin colapso de espacios). Reporta diferencias reales, diferencias cosméticas (espacios dobles, invisibles en el navegador) y los productos extra del sitio.

> Estado 3-sep-2026: **0 diferencias reales** (42/42 con precio y descripción idénticos). Las únicas tarjetas extra del sitio son las 2 variantes de color de Pulsera Infinito (Beige y Roja, decisión del usuario con datos de la fila P-01).

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

### Redes sociales — @yo_soy222

| Red | URL | Estado |
|-----|-----|--------|
| Instagram | https://www.instagram.com/yo_soy222 | ✅ Configurado |
| TikTok | https://www.tiktok.com/@yo_soy222 | ✅ Configurado |
| Facebook | https://www.facebook.com/share/1C5X2yKscG/ | ✅ Configurado |

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
> 💡 **Mensaje de WhatsApp por categoría en el lightbox**: el lightbox ya no redacta `"Me interesa la vela …"` para todo producto; el texto se adapta según categoría (`vela`/`collar`/`pulsera`/`franela`) para que el prefilled quede natural al copiar.

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

> **Estado actual (5-sep-2026):** el catálogo usa el set **`imagenes_web`** (1000×1000, origen `/home/jr/Documentos/gemini velas/imagenes_web/`) para 36 productos de velas y joyería; las 7 franelas conservan sus fotos reales (`F-01`…`F-07.jpg`); Armonía Coco conserva su imagen anterior (no existe en el set). Los scripts de abajo se usan para fotos nuevas o recortes.

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
| `manifest.json` | Nombre "YoSoy222", `display: standalone`, tema `#faf6ef`, fondo `#faf6ef`, iconos |
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

GitHub Pages **no puede enviar headers HTTP personalizados** (ignora archivos `_headers`; verificado con `curl -sI` tras el deploy: solo responde headers controlados por GitHub). Por eso los únicos `<meta http-equiv>` incluidos son los que el navegador **sí** honra:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; manifest-src 'self'; worker-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
```

- ✅ **CSP activa en producción** (protegida vía `<meta>`, aplicada por el navegador; verificada con curl en yosoy222.com). Sin inline styles/scripts en el sitio, así que `script-src`/`style-src 'self'` no rompen nada.
- ✅ Referrer-Policy: honrada vía `<meta>` en navegadores modernos.
- ⚠️ `X-Frame-Options`, `X-Content-Type-Options`, `Permissions-Policy`, `Referrer-Policy` y `HSTS` solo funcionan como header HTTP real — y ahora **se sirven desde el edge de Cloudflare** vía una **Transform Rule** (ruleset `http_response_headers_transform`, creado y verificado con curl en vivo):

```
x-frame-options: DENY
x-content-type-options: nosniff
permissions-policy: camera=(), microphone=(), geolocation=()
referrer-policy: strict-origin-when-cross-origin
strict-transport-security: max-age=31536000; includeSubDomains
```

  Verificado el 3 sep 2026 en `yosoy222.com` (página, CSS, imágenes y www) — el navegador los recibe con el `cf-ray` de Cloudflare.
- ℹ️ El repo incluye un archivo `_headers` con el mismo set. GitHub Pages no lo lee, pero queda listo por si el sitio se mueve a Netlify o Cloudflare Pages, plataformas que sí lo aplican.

### Caché en el edge (Cache Rule de Cloudflare)

GitHub Pages sirve el HTML con `cache-control: max-age=600` y Cloudflare **no cacheaba HTML por defecto** (`cf-cache-status: DYNAMIC`). Para que los visitantes reciban respuestas desde el edge y los deploys se propaguen rápido, se creó una **Cache Rule** (ruleset `http_request_cache_settings`, 3 sep 2026):

- **Expresión:** rutas `/`, `/*.html` y directorios (`/…/`) — es decir, todo el HTML del sitio.
- **Edge TTL:** 5 minutos (`edge_ttl` mode `override_origin`, default 300) — el edge revalida contra GitHub Pages cada 5 min, así un deploy nuevo llega a los visitantes en ~5 min.
- **Browser TTL:** 5 minutos (`browser_ttl` mode `override_origin`, default 300).

Verificado en producción: `cf-cache-status` pasó de `DYNAMIC` a `HIT`/`REVALIDATED` con `age` creciente, ciclo de revalidación ~300s confirmado. El `cache-control` que ve el navegador queda en `max-age=600` (10 min, el mínimo que permite el plan y el mismo valor que ya mandaba el origin) — el edge es el que revalida cada 5 min.

#### Purge automático vía GitHub Actions

Después de cada deploy exitoso de GitHub Pages, un workflow de GitHub Actions purga automáticamente la caché de Cloudflare vía API. Esto garantiza que los cambios estén disponibles inmediatamente después del deploy (~2-3 min después del push).

**Requisitos:** Configurar los secrets `CLOUDFLARE_ZONE_ID` y `CLOUDFLARE_API_TOKEN` en el repo (Settings → Secrets and variables → Actions).

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
✅ **CDN:** Cloudflare proxy activado en los 5 registros + **Cache Rule HTML** (edge TTL 5 min)
✅ **Deploy automático:** cada push a `main` (~2 min)
✅ **Purge automático:** GitHub Actions purga Cloudflare después de cada deploy (~30 seg después)

### Cómo se publica

```bash
git add -A
git commit -m "feat: descripción del cambio"
git push origin main
```

Nada más: GitHub Pages compila y publica solo, y el workflow de GitHub Actions purga la caché automáticamente.

### Flujo completo del deploy

```
push a main → GitHub Pages deploy (~2 min) → purge automático Cloudflare (~30 seg) → sitio actualizado
```

### Verificar el deploy

```bash
curl -s https://api.github.com/repos/juancito8812/yosoy222/pages | python3 -m json.tool
curl -sI https://yosoy222.com | head -5
```

### Configurar purge automático

1. Crear token en Cloudflare: https://dash.cloudflare.com/profile/api-tokens → **Create Token** → permisos `Zone:Cache Purge`
2. En GitHub: Settings → Secrets and variables → Actions → **New repository secret**
3. Agregar `CLOUDFLARE_ZONE_ID` (Zone ID de Cloudflare) y `CLOUDFLARE_API_TOKEN` (el token creado)

---

## CONFIGURAR DOMINIO PERSONALIZADO

### Estado actual

✅ **Dominio:** yosoy222.com (registrado en Cloudflare)
✅ **DNS + CDN:** Cloudflare con proxy **activado** (naranja) en los 5 registros — el tráfico pasa por el edge de Cloudflare (verificado con `server: cloudflare` + `cf-ray`)
✅ **Registros:** 4 A records + 1 CNAME

### Registros DNS (ya creados vía API de Cloudflare)

| Tipo | Nombre | Valor | Proxy |
|------|--------|-------|-------|
| A | @ | 185.199.108.153 | On |
| A | @ | 185.199.109.153 | On |
| A | @ | 185.199.110.153 | On |
| A | @ | 185.199.111.153 | On |
| CNAME | www | juancito8812.github.io | On |

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
| 1 | Rosa | `VM-ROSA_vela_rosa_79g.jpg` | $7.00 | Vela 79g en forma de rosa |
| 2 | Mini Corazones | `VM-MINICORAZON_vela_mini_corazones.jpg` | $0.17 | Wax melt 1g, mini corazón |
| 3 | Rosa Pequeña | `VM-ROSAPEQ_vela_rosa_pequena_23g.jpg` | $4.50 | Vela 23g, palito decorativo |
| 4 | Mini Margarita | `VM-MINIMARGARITA_wax_melts_mini_margarita.jpg` | $1.70 | Wax melt 6g, mini margarita |
| 5 | Margarita Pequeña | `VM-MARGARITA_vela_margarita_pequena_16g.jpg` | $3.00 | Vela 16g, palito decorativo |
| 6 | Tulipán Pequeña | `VM-TULIPAN_vela_tulipan_pequena_33g.jpg` | $5.00 | Vela 33g, palito decorativo |
| 7 | Bouquet Tulipán | `VM-BOUQUET_vela_bouquet_tulipan_83g.jpg` | $8.50 | Vela 83g, bouquet de tulipanes |
| 8 | Espiral | `VM-ESPIRAL_vela_espiral_104g.jpg` | $9.50 | Vela 104g en espiral |
| 9 | Sagrada Familia | `VM-SAGRADA_vela_sagrada_familia_75g.jpg` | $7.00 | Vela 75g |
| 10 | Buda | `VM-BUDA_vela_buda_20g.jpg` | $6.50 | Vela 20g |
| 11 | Mano Hamsa | `VM-HAMSA_vela_mano_hamsa_75g.jpg` | $8.00 | Vela 75g |
| 12 | Corazón | `VM-CORAZON_vela_corazon_182g.jpg` | $13.50 | Vela 182g |
| 13 | Cruz con Paloma | `VM-CRUZ_vela_cruz_con_paloma_52g.jpg` | $7.00 | Vela 52g |
| 14 | Cubo | `VM-CUBO_vela_cubo_40g.jpg` | $7.00 | Vela 40g |
| 15 | Virgen del Carmen | `VM-VIRGEN_vela_virgen_del_carmen_42g.jpg` | $7.00 | Vela 42g |

### Velas Envases (10) — filtro "Velas"

| # | Nombre | Archivo | Precio | Resumen |
|---|--------|---------|--------|---------|
| 16 | Mini Petit | `VE-MINIPETIT_vela_mini_petit_123g.jpg` | $7.50 | Vela 123g, vidrio, tapa dorada |
| 17 | Mandala | `VE-MANDALA_vela_mandala_98g.jpg` | $9.00 | Vela 98g, envase metal decorativo |
| 18 | Vintage | `VE-VINTAGE_vela_vintage_165g.jpg` | $9.50 | Vela 165g, vidrio, tapa corcho, detalle floral |
| 19 | Petit | `VE-PETIT_vela_petit_171g.jpg` | $11.00 | Vela 171g, vidrio, tapa dorada, corazones rojos |
| 20 | Estrella | `VE-ESTRELLA_vela_estrella_285g.jpg` | $12.00 | Vela 285g, vidrio, forma de estrella |
| 21 | Aura Rosa | `VE-AURA-ROSA_vela_aura_rosa_342g.jpg` | $17.00 | Vela 342g, tapa de madera, rosa en superficie |
| 22 | Aura Tulipán | `VE-AURA-TULIPAN_vela_aura_tulipan_335g.jpg` | $17.00 | Vela 335g, tapa de madera, tulipán en superficie |
| 23 | Aura Corazones | `VE-AURA-CORAZON_vela_aura_corazones_418g.jpg` | $20.00 | Vela 418g, marmoleada blanco/rosa |
| 24 | Armonía Canela | `VE-ARMONIA-CANELA_vela_armonia_canela_508g.jpg` | $22.00 | Vela 508g, vidrio opaco, mecha de madera |
| 25 | Armonía Coco | `Armonia Coco.jpg` | $23.00 | Vela 516g, vidrio opaco (sin imagen en el set web) |

### Gargantillas y Collares (5) — filtro "Collares" · *Gold-Filled bañada en oro, dije de piedra natural a elección*

| # | Nombre | Archivo | Precio | Medidas |
|---|--------|---------|--------|---------|
| 26 | Gargantilla G-01 | `G-01_gargantilla_gold-filled_lisa.jpg` | $20.00 | 25cm · 1,5mm · broche langosta |
| 27 | Gargantilla G-02 | `G-02_gargantilla_gold-filled_con_dije.jpg` | $25.00 | 25cm · 3mm · broche ancla |
| 28 | Collar Medio C.M-01 | `C.M-01_collar_medio_eslabon_29cm.jpg` | $25.00 | 29cm · 3mm · broche ancla |
| 29 | Collar Medio C.M-02 | `C.M-02_collar_medio_solido_34cm.jpg` | $30.00 | 34cm · 4mm sólido |
| 30 | Collar Largo C.L-01 | `C.L-01_collar_largo_40cm.jpg` | $32.00 | 40cm · 4mm sólido |

### Pulseras (6) — filtro "Pulseras"

| # | Nombre | Archivo | Precio | Resumen |
|---|--------|---------|--------|---------|
| 31 | Pulsera Infinito | `P-01b_pulsera_infinito_azul.jpg` | $8.00 | Símbolo infinito, trenzado azul |
| 32 | Pulsera Infinito Beige | `P-01c_pulsera_infinito_beige.jpg` | $8.00 | Símbolo infinito, trenzado beige |
| 33 | Pulsera Infinito Roja | `P-01a_pulsera_infinito_roja.jpg` | $8.00 | Símbolo infinito, trenzado rojo |
| 34 | Pulsera San Benito | `P-02_pulsera_san_benito.jpg` | $8.00 | San Benito, hilo rojo |
| 35 | Pulsera Perla | `P-03_pulsera_perla.jpg` | $6.00 | Perla, calma y claridad |
| 36 | Pulsera Ojito | `P-04_pulsera_ojito.jpg` | $6.00 | Ojito protector, hilo rojo |

### Accesorios (1) — filtro "Accesorios"

| # | Nombre | Archivo | Precio | Resumen |
|---|--------|---------|--------|---------|
| 37 | Piedras Naturales | `D-01_dijes_piedras_naturales.jpg` | $7.00 | Dijes de piedras naturales |

### Franelas (7) — filtro "Franelas"

| # | Nombre | Archivo | Precio | Resumen |
|---|--------|---------|--------|---------|
| 38 | F-01 Loto Sagrado | `F-01.jpg` | $16.00 | Franela oliva, Loto + Om |
| 39 | F-02 Loto Sagrado | `F-02.jpg` | $16.00 | Franela negra, Loto + Om |
| 40 | F-03 Loto Sagrado | `F-03.jpg` | $16.00 | Franela celeste, Loto + Om |
| 41 | F-04 Ser Feliz | `F-04.jpg` | $14.00 | "Mi plan es ser Feliz / No perfecta" |
| 42 | F-05 Hazte Caso | `F-05.jpg` | $14.00 | "La energía no miente / Hazte caso" |
| 43 | F-06 Cool | `F-06.jpg` | $14.00 | Franela lavanda, diseño "Cool" |
| 44 | F-07 El Amor | `F-07.jpg` | $14.00 | "El Amor / Un sentido - nuestras vidas" |

> ✅ Las 7 franelas (F-01…F-07) usan sus **fotos reales** (no se tocaron y siguen siendo `F-01.jpg`…`F-07.jpg`).
> 🖼️ **Imágenes web 1000×1000 (set `imagenes_web`):** 36 productos de velas y joyería usan ese set (1000×1000, origen `/home/jr/Documentos/gemini velas/imagenes_web/`). Solo `Armonia Coco` no existe en el set y conserva su imagen anterior.

---

## GUÍA DE ESTILOS CSS

### Variables de color (modificar en `:root` de `css/style.css`)

```css
:root {
  /* Paleta tierra: blanco cálido → crema */
  --bg: #faf6ef;              /* Fondo principal (crema claro) */
  --bg-raised: #f1eadb;       /* Fondo elevado / placeholders */
  --bg-card: #fffdf8;         /* Fondo de tarjetas (blanco cálido) */
  --bg-card-hover: #f7f0e3;
  --surface: #f3ebdd;         /* Secciones alternas */
  --border: rgba(120,90,55,0.14);  /* Bordes sutiles (tierra) */
  --border-strong: rgba(120,90,55,0.26);

  /* Texto */
  --text: #3b3125;            /* Texto principal (café oscuro) */
  --text-muted: #7b6a50;      /* Texto secundario */
  --text-faint: #8f7a5e;      /* Texto tenue */

  /* Acento (ámbar tierra, llama de vela) */
  --accent: #a96f2d;
  --accent-hover: #8f5c22;
  --accent-glow: rgba(169,111,45,0.22);

  /* Funcional */
  --whatsapp: #25d366;
  --whatsapp-hover: #1fbe5a;
  --danger: #c0392b;

  /* Layout */
  --radius: 14px; --radius-sm: 8px; --radius-full: 999px;
  --shadow: 0 6px 24px rgba(101,71,35,0.10);
  --shadow-lg: 0 12px 40px rgba(101,71,35,0.15);
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
| `images/thumbs/` | Miniaturas del grid (142 archivos en disco; el catálogo actual usa 44) | Tarjetas de producto |
| `images/catalog/` | Imágenes grandes (mismo esquema de nombres; 142 en disco) | Lightbox |

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
- **Causa 3:** la imagen parece ser otra cosa (ej: vela en vez de franela) → **caché del service worker**. Limpiar: DevTools → Application → Storage → Clear site data, o borrar caché del navegador

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

### No veo las franelas o veo velas en sus tarjetas
- **Si ves velas donde deberían estar las franelas**, es **caché del service worker**. Limpiar: DevTools → Application → Storage → Clear site data (o borrar caché del navegador) y recargar.

---

## CONTACTO DEL PROYECTO

- **GitHub:** https://github.com/juancito8812
- **Repositorio:** https://github.com/juancito8812/yosoy222
- **Sitio web:** https://yosoy222.com
- **WhatsApp pedidos:** +58 412 648 1628

---

### Pie de página y lightbox (correcciones v5 sep 2026)

- **País del footer:** `Hecho a mano en Venezuela.` (antes decía México). Confirmado por número WhatsApp +58, USD como moneda y el README del sitio.
- **Mensaje del lightbox por categoría:** se usó un mapa de sustantivos (`vela`·`collar`·`pulsera`·`franela`) para que el prefilled de WhatsApp sea correcto en todos los productos.

### Accesibilidad del lightbox (v5 sep 2026)

- **Apertura con teclado:** cada tarjeta de producto tiene su zona de imagen como `<button>` real (`type="button"`, `aria-label="Ampliar imagen de …"`) que responde a **Enter** y **Espacio**. El clic de ratón sigue igual.
- **No se re-vinculan listeners** en cada render: la apertura del lightbox, los steppers y el botón "Agregar" están delegados en contenedores únicos.
- **`visibleProducts`** se mantiene en estado desde `applyFilters()` para que el lightbox no escanee el DOM en cada apertura.

### Estado del commit más reciente

```
git log --oneline -1   # último commit
# estado del repo: git status --short
```

Último cambio publicado: actualización de documentación README con imágenes híbridas, correcciones de footer/mensaje/lightbox, apertura con teclado; documentación sincronizada al 100% con el sitio real desplegado.

---

*Documentación actualizada: 5 de septiembre de 2026 — sincronizada con el estado real del código: 44 productos, híbrido `imagenes_web` (36 productos actualizados, 7 franelas reales conservadas, Armonía Coco con su imagen anterior), paleta tierra crema, Excel verificado 42/42 sin diferencias, PWA instalable con iconos regenerados (8 'any' cuadrados + 2 maskable), lightbox con apertura por teclado, footer + mensaje de WhatsApp corregidos, seguridad vía Cloudflare, número de WhatsApp real.*
