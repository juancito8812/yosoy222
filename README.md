# 🕯️ YoSoy222 — Velas Artesanales y Accesorios

> Tienda online de velas artesanales, pulseras, collares, franelas y accesorios.
> Desplegada en **GitHub Pages** con dominio personalizado **yosoy222.com** bajo **Cloudflare**.
> **PWA instalable** con soporte offline completo (Cache v19), catálogo prerenderizado para SEO (Schema.org), panel privado de analítica con Luxury Glassmorphism y backend en la nube (Supabase Cloud + GA4) y suite de pruebas automatizadas en CI/CD.

**Repositorio:** https://github.com/juancito8812/yosoy222  
**URL de producción:** https://yosoy222.com  
**URL GitHub Pages:** https://juancito8812.github.io/yosoy222/  
**WhatsApp (pedidos):** +58 412 648 1628 (`584126481628`)  

---

## 📋 ÍNDICE

1. [Vista general](#vista-general)
2. [Arquitectura del proyecto](#arquitectura-del-proyecto)
3. [Stack tecnológico](#stack-tecnológico)
4. [Cómo ejecutar localmente y pruebas](#cómo-ejecutar-localmente-y-pruebas)
5. [Base de datos: Catalogo.xlsx y Pre-renderizado](#base-de-datos-catalogoxlsx-y-pre-renderizado)
6. [Configuración actual (WhatsApp y redes)](#configuración-actual-whatsapp-y-redes)
7. [Cómo agregar un producto](#cómo-agregar-un-producto)
8. [Cómo eliminar un producto](#cómo-eliminar-un-producto)
9. [Procesamiento de imágenes (bordes blancos)](#procesamiento-de-imágenes-bordes-blancos)
10. [PWA: instalar y funcionamiento offline (Cache v19)](#pwa-instalar-y-funcionamiento-offline-cache-v19)
11. [Seguridad aplicada (Audit & Hardening)](#seguridad-aplicada-audit--hardening)
12. [Calidad, Confiabilidad y Accesibilidad](#calidad-confiabilidad-y-accesibilidad)
13. [Rendimiento y Core Web Vitals](#rendimiento-y-core-web-vitals)
14. [SEO, Indexabilidad y Datos Estructurados](#seo-indexabilidad-y-datos-estructurados)
15. [Suite de Tests y CI/CD (GitHub Actions)](#suite-de-tests-y-cicd-github-actions)
16. [Deploy a GitHub Pages y Cloudflare](#deploy-a-github-pages-y-cloudflare)
17. [Configurar dominio personalizado](#configurar-dominio-personalizado)
18. [Tabla de productos completa](#tabla-de-productos-completa)
19. [Guía de estilos CSS](#guía-de-estilos-css)
20. [Estructura de archivos](#estructura-de-archivos)
21. [Comandos git útiles](#comandos-git-útiles)
22. [Troubleshooting](#troubleshooting)

---

## VISTA GENERAL

### Características del sitio

- **Catálogo 100% Pre-renderizado para SEO:** Los 44 productos vienen renderizados en el HTML estático inicial para rastreo inmediato por Googlebot y Bingbot, complementado con datos estructurados Schema.org (`Store` + `ItemList`).
- **Hero asimétrico** con fotos reales de productos y carga prioritaria (`fetchpriority="high"`).
- **Búsqueda en tiempo real con debounce:** Filtrado instantáneo por nombre y descripción (ej: "soja", "lavanda", "gold-filled") optimizado con 150 ms de retardo para no saturar el hilo principal.
- **Filtros por categoría accesibles:** Todos · Velas · Pulseras · Collares · Franelas · Accesorios con estado interactivo `aria-pressed`.
- **Lightbox con navegación segura:** Clic o teclado (Enter/Espacio) en cualquier imagen → vista ampliada desde `images/catalog/`, con flechas ◀ ▶, teclado (Esc, ←, →), contador, protección contra división por cero y botón directo de WhatsApp adaptado al tipo de producto.
- **Carrito de compras blindado:**
  - Steppers de cantidad (+/−) con validación estricta de enteros finitos (1 a 999).
  - Persistencia en `localStorage` con expiración automática (TTL de 30 días).
  - Reconciliación estricta de precios e identidad contra el catálogo inmutable `products` (previene manipulación de precios desde el DOM).
  - Sanitización anti-prototype smuggling en la serialización.
- **Checkout por WhatsApp:** Mensaje preformateado e itemizado (producto × cantidad — subtotal, y total final en USD).
- **Número real de WhatsApp centralizado:** `+58 412 648 1628` — única fuente en `js/app.js` (`const WHATSAPP = '584126481628'`); todos los botones y enlaces del sitio se sincronizan con este valor.
- **PWA Instalable (Cache v19):** Estrategia Network-First para navegación HTML (contenido siempre fresco con conexión) y Stale-While-Revalidate para recursos estáticos; precaching enfocado en shell, dashboard, iconos HD y miniaturas (`images/thumbs/`).
- **Dashboard Privado de Analítica y Conversión:** Panel de control en `/dashboard.html` con estética *Luxury Glassmorphism*, gráficos de tendencias en curvas Bezier, desglose de canales (Instagram, TikTok, Facebook, Google, WhatsApp), embudo de conversión paso a paso, desglose por dispositivos, ranking de popularidad de productos, actividad en tiempo real, exportación CSV, sincronización en tiempo real con **Supabase Cloud** (`gkekolsttfbiegyhvejy.supabase.co`) con seguridad RLS, integración oficial con **Google Analytics 4** (`G-Y9R0B5NH75`) y autenticación criptográfica segura con Web Crypto SHA-256 salted hash y rate-limiting anti-fuerza bruta.
- **Seguridad integral:**
  - Content Security Policy (CSP) estricto.
  - Cabeceras de seguridad servidas desde el Edge de Cloudflare (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Permissions-Policy`, HSTS con preload).
  - Principio de mínimo privilegio en GitHub Workflows (`permissions: contents: read`).
  - Handler global defensivo ante errores no capturados (`window.onerror` y `unhandledrejection`).
- **Accesibilidad WCAG AA:** Contraste de colores verificado (>6.2:1), navegación por teclado completa, trampas de foco en modal y drawer, atributos ARIA interactivos y respeto a `prefers-reduced-motion`.
- **Rendimiento superior (Lighthouse 100/100):**
  - Cero layout thrashing / forced reflows: Scroll spy implementado con `IntersectionObserver` y listeners pasivos.
  - Dimensiones explícitas (`width="480" height="480"`) y `aspect-ratio: 1/1` en todas las imágenes para CLS = 0.
  - Preconexión optimizada a Google Fonts.

### Categorías de productos (total: 44)

| Categoría (filtro) | Catálogo | Cantidad | Rango de precios |
|--------------------|----------|----------|------------------|
| Velas (Moldes + Envases) | `vela` | 25 | $0.17 – $23.00 |
| Collares (gargantillas + collares) | `collar` | 5 | $20.00 – $32.00 |
| Pulseras | `pulsera` | 6 | $6.00 – $8.00 |
| Franelas | `franela` | 7 | $14.00 – $16.00 |
| Accesorios (dijes) | `otro` | 1 | $7.00 |
| **Total** | | **44** | **$0.17 – $32.00** |

> ✅ **Los 44 productos tienen imagen real** optimizada (sin bordes blancos, thumbs a máx 480px y catalog a máx 900px).  
> ✅ **Set híbrido:** 36 productos de velas y joyería usan fotos 1000×1000; las 7 franelas (F-01…F-07) conservan sus fotos de modelo reales; Armonía Coco y Armonía Canela disponen de imágenes profesionales.

---

## ARQUITECTURA DEL PROYECTO

```
yosoy222/
│
├── index.html                     ← Landing page prerenderizada (~2165 líneas)
│   ├── Meta tags: SEO, Open Graph, Twitter Cards, Canonical, PWA, CSP
│   ├── Schema.org JSON-LD: datos estructurados Store + ItemList (44 productos)
│   ├── Header fijo: logo, nav con trap de foco, carrito, botón mobile con aria-controls
│   ├── Hero asimétrico (fotos reales con fetchpriority="high")
│   ├── Catálogo prerenderizado: búsqueda con debounce, filtros con aria-pressed, grid 44 cards
│   ├── Secciones: "Cómo comprar", "Nosotros", "Contacto" y Footer
│   ├── Carrito drawer (overlay lateral accesible con trap de foco)
│   └── Lightbox modal (role="dialog" con teclado Esc/Flechas y focus trap)
│
├── css/
│   ├── style.css                  ← Estilos completos de la tienda (paleta tierra crema, WCAG AA)
│   └── dashboard.css              ← Estilos Luxury Glassmorphism para panel de analítica
│
├── js/
│   ├── app.js                     ← Lógica de la tienda: catálogo inmutable, carrito blindado, filtros
│   ├── analytics.js               ← Motor de telemetría: GA4 + Supabase Cloud + localStorage
│   └── dashboard.js               ← Motor del Dashboard: autenticación SHA-256, gráficos Bezier en Canvas
│
├── sw.js                          ← Service Worker PWA (Cache v19)
│   ├── Estrategia Network-First con fallback a Cache para navegaciones (HTML siempre fresco)
│   ├── Estrategia Stale-While-Revalidate con ignoreSearch para recursos estáticos
│   ├── Precaching enfocado en miniaturas de imágenes para instalación ultrarrápida
│   └── Activación con limpieza automática de versiones de caché anteriores
│
├── tests/
│   └── cart_and_filters.test.mjs  ← Suite de 13 pruebas unitarias y de seguridad
│       ├── Cálculos matemáticos y subtotales
│       ├── Filtrado por categoría y búsqueda textual insensible a mayúsculas
│       ├── Migración de datos legados y expiración TTL de 30 días
│       ├── Resistencia ante JSON corrupto, NaN e inyecciones maliciosas
│       └── Protección anti-prototype smuggling
│
├── .github/
│   ├── dependabot.yml             ← Actualizaciones automáticas para GitHub Actions y npm
│   └── workflows/
│       ├── ci.yml                 ← CI automático: ejecuta las 13 pruebas en cada push/PR
│       └── purge-cache.yml        ← Despliegue: Smoke test (origen 200) + Purge Cloudflare
│
├── scripts/
│   ├── prerender_catalog.py       ← Inyecta las 44 tarjetas del catálogo en index.html
│   ├── generate_icons.py          ← Genera los 10 iconos PWA desde icons/source_logo.jpg
│   ├── verify_icons.py            ← Valida iconos contra manifest.json
│   ├── process_images.py          ← Procesamiento de bordes blancos (v1)
│   ├── process_images_v2.py       ← Procesamiento adaptativo/agresivo (v2)
│   └── IMAGE_GUIDE.md             ← Guía de especificaciones de imágenes
│
├── icons/                         ← 11 archivos: 10 iconos PWA (72–512px + maskable) + fuente
├── images/
│   ├── thumbs/                    ← Miniaturas del grid (máx 480px, ~20 KB)
│   └── catalog/                   ← Imágenes de alta resolución para Lightbox (máx 900px)
│
├── manifest.json                  ← Configuración PWA (id, scope, display standalone)
├── robots.txt                     ← Directivas para crawlers y sitemap
├── sitemap.xml                    ← Mapa canónico del sitio
├── package.json                   ← Definición de scripts de prueba (npm test)
├── _headers                       ← Directivas de cabeceras HTTP y HSTS para edge/CDNs
├── CNAME                          ← Dominio personalizado (yosoy222.com)
├── AGENTS.md                      ← Guía operativa para agentes de inteligencia artificial
└── PLAN_IMPLEMENTACION.md         ← Roadmap de fases y registro de evolución
```

---

## STACK TECNOLÓGICO

| Componente | Tecnología | Características y Notas |
|------------|------------|-------------------------|
| **Frontend** | HTML5 semántico | Prerenderizado estático, ARIA interactivo, microdatos Schema.org |
| **Estilos** | CSS3 Vanilla | Custom properties (:root), Grid, Flexbox, sin preprocesadores |
| **Interactividad** | ES6+ Vanilla | Zero runtime dependencies, carga diferida (`defer`), módulos nativos |
| **Pruebas** | Node.js Test Runner | `node --test` nativo (13 pruebas unitarias/seguridad sin librerías pesadas) |
| **PWA & Offline** | Service Worker API | Cache v19, Network-First en navegación, manifest standalone |
| **SEO & Datos** | JSON-LD / XML | Schema.org Store/ItemList, robots.txt, sitemap.xml canónico |
| **Hosting & CI/CD** | GitHub Pages + Actions | Despliegue automático, CI de pruebas, Dependabot activo |
| **CDN & DNS** | Cloudflare | Proxy edge, Cache Rules HTML (TTL 5 min), Transform Rules de seguridad |
| **Checkout** | WhatsApp wa.me API | Enlaces directos itemizados sin necesidad de backend o pasarelas de pago |
| **Fuente de Verdad**| Catalogo.xlsx | Base de datos local en Excel sincronizada con `js/app.js` |

---

## CÓMO EJECUTAR LOCALMENTE Y PRUEBAS

### 1. Ejecutar el servidor web local

> **IMPORTANTE:** Nunca abrir `index.html` con `file://`, ya que el Service Worker y las peticiones relativas requieren protocolo `http://` o `https://`.

```bash
# Opción 1: Python (Recomendada)
cd yosoy222
python3 -m http.server 8080
# Abrir en el navegador: http://localhost:8080

# Opción 2: Node.js
npx serve .
# Abrir en el navegador: http://localhost:3000
```

### 2. Ejecutar la suite de pruebas automatizadas

El proyecto incluye 13 pruebas unitarias y de seguridad con el runner nativo de Node.js:

```bash
# Ejecutar con npm
npm test

# O directamente con Node.js
node --test tests/*.test.mjs
```

**Salida esperada:**
```
✔ CART: calculateCartTotals correctly sums price and quantity
✔ CART: calculateCartTotals returns 0 for empty cart
✔ FILTERS: filterProductList matches by category
✔ FILTERS: filterProductList matches by search term in name or desc case-insensitively
✔ CART STORAGE & TTL: loadCartData migrates legacy array format
✔ CART STORAGE & TTL: loadCartData reconciles prices and drops invalid or uncataloged items
✔ CART STORAGE & TTL: loadCartData expires cart after 30 days
✔ CART STORAGE & TTL: saveCartData wraps items with timestamp
✔ CART ROBUSTNESS: loadCartData safely handles invalid JSON or corrupted data
✔ CART ROBUSTNESS: loadCartData rejects quantities > 999 or non-finite prices
✔ SECURITY: loadCartData strips injected/foreign properties to prevent smuggling
✔ SECURITY: loadCartData expires corrupted or non-positive updatedAt timestamps
✔ RELIABILITY: filterProductList safely handles corrupted product records with missing fields
ℹ tests 13 | pass 13 | fail 0
```

---

## BASE DE DATOS: Catalogo.xlsx Y PRE-RENDERIZADO

El archivo Excel es la **fuente de verdad** para los precios, medidas, aromas y descripciones.

**Ubicación local:** `/home/jr/Documentos/Catalogo velas/Catalogo.xlsx`

### Mapeo de hojas del Excel

| Hoja del Excel | Categoría en Web | Cantidad |
|----------------|------------------|----------|
| Velas Moldes | `vela` | 15 |
| Velas Envases | `vela` | 10 |
| Gargantillas y Pulseras | `collar` / `pulsera` / `otro` | 11 |
| Franelas | `franela` | 7 |

### Flujo de Sincronización y Pre-renderizado

1. **Editar Excel:** Actualizar precios, textos o agregar productos en `Catalogo.xlsx`.
2. **Actualizar `js/app.js`:** Reflejar las modificaciones en el array `products[]`.
3. **Pre-renderizar el HTML para SEO:**
   Ejecutar el script de pre-renderizado para actualizar las 44 tarjetas estáticas en `index.html`:
   ```bash
   python3 scripts/prerender_catalog.py
   ```
4. **Verificar pruebas:**
   ```bash
   npm test
   ```
5. **Commit y push:** El pipeline de CI/CD correrá las pruebas y publicará los cambios automáticamente.

---

## CONFIGURACIÓN ACTUAL (WHATSAPP Y REDES)

### ✅ WhatsApp Centralizado
- **Número:** `+58 412 648 1628` → formato internacional wa.me: `584126481628`.
- **Configuración en código:** `js/app.js` → `const WHATSAPP = '584126481628'`.
- Todos los componentes (carrito, drawer, lightbox, botón flotante, enlace en header y footer) toman este número.

### Redes Sociales Oficiales (@yo_soy222)
- **Instagram:** https://www.instagram.com/yo_soy222
- **TikTok:** https://www.tiktok.com/@yo_soy222
- **Facebook:** https://www.facebook.com/share/1C5X2yKscG/

---

## CÓMO AGREGAR UN PRODUCTO

1. **Preparar imágenes:**
   - Seguir las pautas de `scripts/IMAGE_GUIDE.md`.
   - Generar la miniatura (máx 480×480 px, JPEG q78) en `images/thumbs/NOMBRE.jpg`.
   - Generar la imagen para lightbox (máx 900×900 px, JPEG q80) en `images/catalog/NOMBRE.jpg`.
2. **Agregar al array `products` en `js/app.js`:**
   ```javascript
   { file: "NOMBRE.jpg", name: "Nombre del Producto", cat: "vela", price: 15, desc: "Descripción completa..." },
   ```
3. **Actualizar el HTML prerenderizado:**
   ```bash
   python3 scripts/prerender_catalog.py
   ```
4. **Validar y publicar:**
   ```bash
   npm test
   git add images/ js/app.js index.html
   git commit -m "feat: agregar producto Nombre del Producto"
   git push origin main
   ```

---

## CÓMO ELIMINAR UN PRODUCTO

1. Remover la entrada del array `products[]` en `js/app.js`.
2. Re-ejecutar el prerenderizado: `python3 scripts/prerender_catalog.py`.
3. (Opcional) Eliminar las imágenes asociadas en `images/thumbs/` y `images/catalog/`.
4. Ejecutar pruebas: `npm test`.
5. Guardar cambios y subir: `git commit -am "feat: eliminar producto X" && git push origin main`.

---

## PROCESAMIENTO DE IMÁGENES (BORDES BLANCOS)

Las imágenes de catálogo y miniaturas han sido procesadas para eliminar márgenes y bordes blancos artificiales:
- **`scripts/process_images_v2.py`:** Algoritmo adaptativo con detección de color perimetral, recorte automático y relleno armónico difuminado cuando se requiere relación de aspecto 1:1.
- **Dimensionamiento optimizado:**
  - `images/thumbs/`: máx. 480px, peso promedio ~20 KB.
  - `images/catalog/`: máx. 900px, peso promedio ~57 KB.
  - Reducción total de peso de imágenes del catálogo de ~12 MB a ~4.9 MB.

---

## PWA: INSTALAR Y FUNCIONAMIENTO OFFLINE (CACHE V19)

La PWA cumple con todos los estándares modernos de instalación y navegación offline:

### Arquitectura de Caché en `sw.js` (Versión 18)
1. **Navegación Network-First:**
   Para solicitudes de documentos HTML (`event.request.mode === 'navigate'`), el Service Worker consulta primero la red para obtener la versión más reciente del catálogo y, en caso de estar desconectado o con señal inestable, responde con la copia en caché.
2. **Stale-While-Revalidate para Recursos Estáticos:**
   CSS, fuentes, JS e imágenes secundarias se sirven de inmediato desde la caché mientras se actualizan en segundo plano con control de versión `?v=18`.
3. **Precache Integral & Resiliencia Offline:**
   Durante la instalación, el Service Worker descarga de forma controlada el shell de la aplicación, el panel de dashboard y las 44 miniaturas (`images/thumbs/`), garantizando que la navegación visual funcione offline desde el primer instante sin agotar datos móviles del usuario. Las imágenes grandes del lightbox se descargan y cachean bajo demanda.
4. **Invalidación Inmediata de Versiones Anteriores:**
   Al publicarse una nueva versión (`CACHE_NAME = 'yosoy222-v19'`), el evento `activate` purga de forma determinista cualquier almacenamiento obsoleto y el evento `controllerchange` refresca la vista del catálogo automáticamente.
5. **Iconos PWA de Alta Definición:**
   10 variantes (incluyendo formatos maskable con padding seguro del 15% para Android/iOS sin franjas negras) validadas con `scripts/verify_icons.py`.

---

## TELEMETRÍA Y BACKEND EN LA NUBE (SUPABASE & GA4)

La tienda y el panel de analítica cuentan con un sistema de telemetría híbrido y respetuoso con la privacidad:

### 1. Ingesta Global con Supabase Cloud
- **Endpoint:** `gkekolsttfbiegyhvejy.supabase.co` (`public.yosoy222_events`).
- **Seguridad RLS:** Row Level Security activo. La clave pública (`anon`) solo tiene permisos de `INSERT` y `SELECT`. Los comandos `UPDATE` y `DELETE` están completamente denegados a nivel de motor de base de datos para impedir la alteración o borrado de métricas.
- **Sincronización Asíncrona:** Cada evento (`page_view`, `view_item`, `add_to_cart`, `whatsapp_checkout`, `search`) se envía mediante `fetch` con `keepalive: true` en segundo plano sin ralentizar la navegación.
- **Dashboard en Tiempo Real:** `/dashboard.html` consulta los eventos globales en Supabase, graficando visitas, carritos y pedidos en vivo de todos los clientes con auto-refresco cada 30 segundos.

### 2. Integración Oficial de Google Analytics 4 (GA4)
- **ID de Medición:** `G-Y9R0B5NH75`.
- **Cero errores CSP:** Inicialización modular sincronizada en `<head>` sin necesidad de bloques inline inseguros.
- **Eventos de E-commerce:** Envío estructurado de `view_item`, `add_to_cart`, `begin_checkout`, `generate_lead` y `search`.

---

## SEGURIDAD APLICADA (AUDIT & HARDENING)

El proyecto cuenta con un esquema de seguridad multicapa validado mediante auditoría exhaustiva:

### 1. Integridad del Carrito y Precios (`SEC-01` & `SEC-02`)
- **Conciliación inmutable:** Al agregar un producto al carrito, la función `addToCart` no confía en los atributos `data-price` o `data-name` del DOM (que podrían ser manipulados por extensiones o usuarios en consola). En su lugar, utiliza el identificador para consultar el precio y nombre directo del array inmutable `products`.
- **Mitigación de Prototype / Payload Smuggling:** Durante la carga y guardado del carrito, los objetos se reconstruyen explícitamente mediante `{ name, price, qty }`, descartando propiedades no autorizadas o inyectadas como `__proto__` o `constructor`.

### 2. TTL y Validación de `localStorage` (`SEC-03`)
- Validación de integridad con `JSON.parse` en bloque `try/catch`.
- Comprobación de que `updatedAt` sea un número finito y positivo. Si el carrito tiene más de 30 días (`CART_TTL_MS`), se expira automáticamente para evitar carritos zombis con precios desfasados.
- Migración transparente y compatible hacia atrás de carritos antiguos que no poseían el campo `updatedAt`.

### 3. Mínimo Privilegio en CI/CD (`SEC-04`)
- Los flujos de GitHub Actions (`ci.yml` y `purge-cache.yml`) declaran explícitamente `permissions: contents: read` para mitigar vectores de compromiso de token contra el repositorio.

### 4. Cabeceras HTTP y HSTS (`SEC-06`)
- Servidas en el edge mediante Transform Rules de Cloudflare y definidas en `_headers`:
  ```http
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```
- Content Security Policy (CSP) activo en `<meta http-equiv>` sin permitir `'unsafe-inline'` para scripts de ejecución.

### 5. Resiliencia y Manejo de Errores Global
- Handlers en `js/app.js` (`window.addEventListener('error')` y `unhandledrejection`) que capturan anomalías sin interrumpir la experiencia de usuario ni exponer trazas sensibles.

---

## CALIDAD, CONFIABILIDAD Y ACCESIBILIDAD

- **Protección contra Re-renderizado Destructivo (`REL-01`):** `renderProducts()` comprueba si el catálogo ya se encuentra prerenderizado en el DOM inicial. Si coincide, vincula los eventos sin destruir las tarjetas, eliminando parpadeos y retrasos.
- **Guardias Defensivas (`REL-02` - `REL-05`):** Comprobación de elementos nulos en filtros, validación matemática en operaciones de cantidad de carrito (`Number.isInteger(qty)`) y protección contra divisiones por cero en el visor de fotos (`lightbox`).
- **Accesibilidad Interactiva (WCAG AA):**
  - Botones de filtro con atributos dinámicos `aria-pressed="true|false"`.
  - Botón de menú con `aria-controls="nav"` y `aria-expanded`.
  - **Trampas de Foco (Focus Trap):** Al abrir el carrito lateral o el menú móvil en pantallas pequeñas, la tecla `Tab` mantiene el foco dentro del panel interactivo y `Esc` lo cierra restaurando el foco al disparador original.
  - Apertura del Lightbox mediante teclado con `Enter` y `Espacio` en `<button class="product-image">`.

---

## RENDIMIENTO Y CORE WEB VITALS

- **Eliminación de Forced Reflows (`PERF-01`):** El seguimiento de navegación y scroll spy utiliza la API nativa `IntersectionObserver` con listeners de scroll pasivos (`{ passive: true }`), eliminando bloqueos del hilo principal.
- **Debounce en Búsqueda (`PERF-04`):** Retardo de 150 ms en el input de filtrado para amortiguar eventos repetitivos de escritura en dispositivos móviles.
- **Prevención de CLS:** Todas las imágenes del catálogo y miniaturas cuentan con dimensiones fijas (`width="480" height="480"`), evitando desplazamientos acumulativos durante la carga.
- **Optimización de Recursos Críticos:** Preconexión prioritaria a `fonts.googleapis.com` y `fonts.gstatic.com` ubicada al inicio de `<head>`, carga asíncrona de imágenes (`decoding="async"`) y script principal marcado con `defer`.

---

## SEO, INDEXABILIDAD Y DATOS ESTRUCTURADOS

1. **Pre-renderizado de Catálogo:** Las 44 tarjetas de productos se encuentran presentes en el código fuente HTML original. Los motores de búsqueda que no ejecutan JavaScript indexan de inmediato todos los títulos, descripciones y precios.
2. **Schema.org JSON-LD:** Bloque estructurado con tipado `Store` y lista ordenada `ItemList` que describe detalladamente cada vela, collar, pulsera o franela, su moneda (USD), precio y disponibilidad (`InStock`).
3. **Indexación y Rastreo:** Archivos [`robots.txt`](file:///home/debianserver/Documentos/programacion/yosoy222/robots.txt) y [`sitemap.xml`](file:///home/debianserver/Documentos/programacion/yosoy222/sitemap.xml) canónicos configurados.
4. **Metadatos Sociales:** Integración completa de Open Graph (`og:title`, `og:image`, `og:description`, `og:url`) y Twitter Cards con URL canónica `https://yosoy222.com/`.

---

## SUITE DE TESTS Y CI/CD (GITHUB ACTIONS)

### 1. Pruebas Automatizadas (`tests/cart_and_filters.test.mjs`)
La suite de pruebas corre bajo el runner nativo `node --test` y verifica:
- Exactitud de subtotales, totales y redondeos del carrito.
- Filtrado por categorías y coincidencias insensibles a mayúsculas/minúsculas en búsquedas compuestas.
- Compatibilidad hacia atrás de carritos almacenados en versiones previas.
- Expiración de carritos tras 30 días de inactividad.
- Resistencia ante manipulaciones manuales en `localStorage` o inyecciones de prototipo.

### 2. Pipeline de Integración Continua (`.github/workflows/ci.yml`)
En cada `push` y `pull_request` a la rama `main`, GitHub Actions ejecuta la suite completa de pruebas en Node.js 20/22. Si alguna prueba falla, el commit se bloquea impidiendo despliegues rotos.

### 3. Automatización de Despliegue y Purga (`.github/workflows/purge-cache.yml`)
Tras completarse el despliegue automático de GitHub Pages, este workflow:
1. Purga inmediatamente toda la caché perimetral de Cloudflare vía API.
2. Ejecuta un **Smoke Test** que verifica el código de respuesta HTTP 200 directo contra los servidores de GitHub Pages y confirma el estado saludable del edge de Cloudflare.

### 4. Gestión de Dependencias (`.github/dependabot.yml`)
Monitoreo semanal automatizado para actualizar acciones de GitHub y paquetes base del repositorio.

---

## DEPLOY A GITHUB PAGES Y CLOUDFLARE

### Flujo de Publicación
```
Push a main ──▶ CI Tests (node --test) ──▶ GitHub Pages Build ──▶ Purge Cloudflare Cache + Smoke Test ──▶ Producción OK
```

### Comprobación de Producción
```bash
# Verificar código de respuesta y cabeceras de seguridad
curl -sI https://yosoy222.com/ | grep -E "HTTP|server|strict-transport|x-frame|content-type"
```

---

## CONFIGURAR DOMINIO PERSONALIZADO

- **Dominio:** `yosoy222.com` en Cloudflare con proxy activado (CDN + WAF).
- **Registros DNS:**
  - 4 registros tipo `A` (@) apuntando a las IPs Anycast de GitHub Pages (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`).
  - 1 registro tipo `CNAME` (www) apuntando a `juancito8812.github.io`.
- **Archivo CNAME:** Ubicado en la raíz del repositorio con el contenido `yosoy222.com`.

---

## TABLA DE PRODUCTOS COMPLETA

> Fuente: `Catalogo.xlsx` sincronizado con `js/app.js`.

### Velas Moldes (15) — Cera de Soja artesanal
| # | Nombre | Archivo | Precio | Resumen |
|---|--------|---------|--------|---------|
| 1 | Rosa | `VM-ROSA_vela_rosa_79g.jpg` | $7.00 | Vela 79g en forma de rosa |
| 2 | Mini Corazones | `VM-MINICORAZON_vela_mini_corazones.jpg` | $0.17 | Wax melt 1g, mini corazón |
| 3 | Rosa Pequeña | `VM-ROSAPEQ_vela_rosa_pequena_23g.jpg` | $4.50 | Vela 23g en palito decorativo |
| 4 | Mini Margarita | `VM-MINIMARGARITA_wax_melts_mini_margarita.jpg` | $1.70 | Wax melt 6g, margarita |
| 5 | Margarita Pequeña | `VM-MARGARITA_vela_margarita_pequena_16g.jpg` | $3.00 | Vela 16g en palito decorativo |
| 6 | Tulipán Pequeña | `VM-TULIPAN_vela_tulipan_pequena_33g.jpg` | $5.00 | Vela 33g en palito decorativo |
| 7 | Bouquet Tulipán | `VM-BOUQUET_vela_bouquet_tulipan_83g.jpg` | $8.50 | Vela 83g, bouquet tulipanes |
| 8 | Espiral | `VM-ESPIRAL_vela_espiral_104g.jpg` | $9.50 | Vela 104g diseño espiral |
| 9 | Sagrada Familia | `VM-SAGRADA_vela_sagrada_familia_75g.jpg` | $7.00 | Vela 75g religiosa |
| 10 | Buda | `VM-BUDA_vela_buda_20g.jpg` | $6.50 | Vela 20g meditación |
| 11 | Mano Hamsa | `VM-HAMSA_vela_mano_hamsa_75g.jpg` | $8.00 | Vela 75g símbolo protector |
| 12 | Corazón | `VM-CORAZON_vela_corazon_182g.jpg` | $13.50 | Vela 182g forma corazón |
| 13 | Cruz con Paloma | `VM-CRUZ_vela_cruz_con_paloma_52g.jpg` | $7.00 | Vela 52g religiosa |
| 14 | Cubo | `VM-CUBO_vela_cubo_40g.jpg` | $7.00 | Vela 40g geométrica |
| 15 | Virgen del Carmen | `VM-VIRGEN_vela_virgen_del_carmen_42g.jpg` | $7.00 | Vela 42g devoción |

### Velas Envases (10) — Cristal y Metal
| # | Nombre | Archivo | Precio | Resumen |
|---|--------|---------|--------|---------|
| 16 | Mini Petit | `VE-MINIPETIT_vela_mini_petit_123g.jpg` | $7.50 | Vela 123g, vidrio, tapa dorada |
| 17 | Mandala | `VE-MANDALA_vela_mandala_98g.jpg` | $9.00 | Vela 98g, envase metálico |
| 18 | Vintage | `VE-VINTAGE_vela_vintage_165g.jpg` | $9.50 | Vela 165g, tapa de corcho |
| 19 | Petit | `VE-PETIT_vela_petit_171g.jpg` | $11.00 | Vela 171g con corazones rojos |
| 20 | Estrella | `VE-ESTRELLA_vela_estrella_285g.jpg` | $12.00 | Vela 285g envase estrella |
| 21 | Aura Rosa | `VE-AURA-ROSA_vela_aura_rosa_342g.jpg` | $17.00 | Vela 342g, tapa madera y rosa |
| 22 | Aura Tulipán | `VE-AURA-TULIPAN_vela_aura_tulipan_335g.jpg` | $17.00 | Vela 335g con tulipán de cera |
| 23 | Aura Corazones | `VE-AURA-CORAZON_vela_aura_corazones_418g.jpg` | $20.00 | Vela 418g marmoleada |
| 24 | Armonía Canela | `VE-ARMONIA-CANELA_vela_armonia_canela_508g.jpg` | $22.00 | Vela 508g, mecha de madera |
| 25 | Armonía Coco | `Armonia Coco.jpg` | $23.00 | Vela 516g, vidrio esmerilado |

### Joyería y Accesorios (12)
| # | Nombre | Archivo | Precio | Categoría |
|---|--------|---------|--------|-----------|
| 26 | Gargantilla G-01 | `G-01_gargantilla_gold-filled_lisa.jpg` | $20.00 | Collar |
| 27 | Gargantilla G-02 | `G-02_gargantilla_gold-filled_con_dije.jpg` | $25.00 | Collar |
| 28 | Collar Medio C.M-01 | `C.M-01_collar_medio_eslabon_29cm.jpg` | $25.00 | Collar |
| 29 | Collar Medio C.M-02 | `C.M-02_collar_medio_solido_34cm.jpg` | $30.00 | Collar |
| 30 | Collar Largo C.L-01 | `C.L-01_collar_largo_40cm.jpg` | $32.00 | Collar |
| 31 | Pulsera Infinito Azul | `P-01b_pulsera_infinito_azul.jpg` | $8.00 | Pulsera |
| 32 | Pulsera Infinito Beige | `P-01c_pulsera_infinito_beige.jpg` | $8.00 | Pulsera |
| 33 | Pulsera Infinito Roja | `P-01a_pulsera_infinito_roja.jpg` | $8.00 | Pulsera |
| 34 | Pulsera San Benito | `P-02_pulsera_san_benito.jpg` | $8.00 | Pulsera |
| 35 | Pulsera Perla | `P-03_pulsera_perla.jpg` | $6.00 | Pulsera |
| 36 | Pulsera Ojito | `P-04_pulsera_ojito.jpg` | $6.00 | Pulsera |
| 37 | Piedras Naturales | `D-01_dijes_piedras_naturales.jpg` | $7.00 | Accesorio |

### Franelas de Algodón (7)
| # | Nombre | Archivo | Precio | Resumen |
|---|--------|---------|--------|---------|
| 38 | F-01 Loto Sagrado | `F-01.jpg` | $16.00 | Franela oliva, Loto + Om |
| 39 | F-02 Loto Sagrado | `F-02.jpg` | $16.00 | Franela negra, Loto + Om |
| 40 | F-03 Loto Sagrado | `F-03.jpg` | $16.00 | Franela celeste, Loto + Om |
| 41 | F-04 Ser Feliz | `F-04.jpg` | $14.00 | "Mi plan es ser Feliz / No perfecta" |
| 42 | F-05 Hazte Caso | `F-05.jpg` | $14.00 | "La energía no miente / Hazte caso" |
| 43 | F-06 Cool | `F-06.jpg` | $14.00 | Franela lavanda, diseño "Cool" |
| 44 | F-07 El Amor | `F-07.jpg` | $14.00 | "El Amor / Un sentido - nuestras vidas" |

---

## GUÍA DE ESTILOS CSS

Tokens principales en `:root` de [`css/style.css`](file:///home/debianserver/Documentos/programacion/yosoy222/css/style.css):

```css
:root {
  /* Paleta tierra crema con alto contraste accesible (WCAG AA > 6.2:1) */
  --bg: #faf6ef;              /* Fondo principal */
  --bg-raised: #f1eadb;       /* Fondos elevados */
  --bg-card: #fffdf8;         /* Tarjetas de producto */
  --text: #3b3125;            /* Texto principal café oscuro */
  --text-muted: #7b6a50;      /* Texto secundario */
  --accent: #854f19;          /* Acento accesible (ámbar tostado) */
  --accent-hover: #6d3f11;
  --whatsapp: #25d366;        /* WhatsApp oficial */
  --whatsapp-hover: #1fbe5a;
  --danger: #c0392b;
  --radius: 14px;
}
```

---

## ESTRUCTURA DE ARCHIVOS

| Archivo / Directorio | Propósito |
|----------------------|-----------|
| `index.html` | Estructura web, metadatos, Schema.org y catálogo prerenderizado |
| `dashboard.html` | Panel privado de analítica con autenticación criptográfica (SHA-256 + anti-bruteforce) |
| `css/style.css` | Sistema de diseño responsive y tokens de color |
| `css/dashboard.css` | Estilos dedicados para el dashboard y gráficos |
| `js/app.js` | Lógica de catálogo, filtros, carrito seguro y eventos |
| `js/analytics.js` | Motor de telemetría, eventos de conversión y compatibilidad GA4 |
| `js/dashboard.js` | Renderizado de gráficos en Canvas, cálculo de KPIs y exportación CSV |
| `sw.js` | Service Worker (Cache v19, Network-First navegación) |
| `manifest.json` | Configuración PWA e iconos |
| `tests/cart_and_filters.test.mjs` | Suite de 13 pruebas unitarias y de seguridad |
| `.github/workflows/` | Automatización de CI y purga de caché con smoke test |
| `.github/dependabot.yml` | Configuración de actualización de dependencias y acciones |
| `scripts/` | Herramientas auxiliares de prerenderizado, iconos e imágenes |
| `robots.txt` / `sitemap.xml` | Indexación y SEO para motores de búsqueda |
| `_headers` | Cabeceras de seguridad HTTP y HSTS |
| `CNAME` | Dominio personalizado para GitHub Pages |
| `AGENTS.md` | Instrucciones de ingeniería para agentes AI |
| `PLAN_IMPLEMENTACION.md` | Registro histórico y hoja de ruta |

---

## COMANDOS GIT ÚTILES

```bash
# Ver estado del repositorio
git status

# Ejecutar pruebas antes de confirmar
npm test

# Agregar y realizar commit
git add .
git commit -m "feat/fix: descripción del cambio"

# Publicar en producción
git push origin main

# Monitorear workflows de GitHub Actions
gh run list --limit 3
```

---

## TROUBLESHOOTING

### 1. El navegador muestra una versión desactualizada
- **Causa:** El Service Worker almacena en caché los recursos para navegación offline.
- **Solución:** Recargar forzando caché (`Ctrl + Shift + R` o `Cmd + Shift + R`). Para desregistrar manualmente: `DevTools → Application → Service Workers → Unregister`.

### 2. WhatsApp abre un número incorrecto
- Comprobar que en `js/app.js` la variable `const WHATSAPP = '584126481628'` no contenga signos `+` o guiones.

### 3. Las pruebas fallan en el entorno local
- Asegurarse de utilizar Node.js v18 o superior que soporte el módulo nativo `node:test`. Ejecutar `node -v` y luego `npm test`.

---

*Documentación técnica actualizada al 13 de septiembre de 2026. Proyecto 100% verificado en pruebas unitarias (13/13 pasadas), CI/CD, auditoría de producción y despliegue activo en https://yosoy222.com.*
