# 🕯️ YoSoy222 — Velas Artesanales y Accesorios

> Tienda online de velas artesanales, pulseras, collares, franelas y accesorios.
> Desplegada en **GitHub Pages** con dominio personalizado **yosoy222.com** bajo **Cloudflare**.
> **PWA instalable** con soporte offline completo (Cache v50), catálogo prerenderizado para SEO (Schema.org), panel privado de analítica con Luxury Glassmorphism, backend en la nube (Supabase Cloud + GA4), suite de 40 pruebas en CI/CD y **bot de WhatsApp verificado E2E**.

**Repositorio:** https://github.com/juancito8812/yosoy222  
**URL de producción:** https://yosoy222.com  
**URL GitHub Pages:** https://juancito8812.github.io/yosoy222/  
**WhatsApp (pedidos):** +58 412 648 1628 (`584126481628`)

**Producción actual (27 sep 2026, v50):** el rediseño ritualista de la rama `redesign-ritual` fue **mergeado a `main` con autorización expresa del dueño** (commit `ee9c3b9`) y encima se publicaron: revalidación Network-First de `.json` en el SW (v45), contraste AAA del botón WhatsApp `#075E36` (7.88:1), textos ≥12px (v47), scripts del head a `defer` (v48) y el símbolo `$` alineado con los dígitos vía `span.currency` (v50). Lighthouse móvil en producción: **Perf 96–97 · A11y 100 · BP 93 · SEO 92**. La rama `redesign-ritual` permanece en `origin` como registro histórico.

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
10. [PWA: instalar y funcionamiento offline (Cache v50)](#pwa-instalar-y-funcionamiento-offline-cache-v50)
11. [Telemetría y backend en la nube (Supabase & GA4)](#telemetría-y-backend-en-la-nube-supabase--ga4)
12. [Seguridad aplicada (Audit & Hardening)](#seguridad-aplicada-audit--hardening)
13. [Calidad, Confiabilidad y Accesibilidad](#calidad-confiabilidad-y-accesibilidad)
14. [Rendimiento y Core Web Vitals](#rendimiento-y-core-web-vitals)
15. [SEO, Indexabilidad y Datos Estructurados](#seo-indexabilidad-y-datos-estructurados)
16. [Suite de Tests y CI/CD (GitHub Actions)](#suite-de-tests-y-cicd-github-actions)
17. [Bot de WhatsApp (n8n + Evolution API)](#bot-de-whatsapp-n8n--evolution-api)
18. [Legal: términos, privacidad, envíos y devoluciones](#legal-términos-privacidad-envíos-y-devoluciones)
19. [Ramas de trabajo y política de merge](#ramas-de-trabajo-y-política-de-merge)
20. [Deploy a GitHub Pages y Cloudflare](#deploy-a-github-pages-y-cloudflare)
21. [Configurar dominio personalizado](#configurar-dominio-personalizado)
22. [Tabla de productos completa](#tabla-de-productos-completa)
23. [Guía de estilos CSS](#guía-de-estilos-css)
24. [Estructura de archivos](#estructura-de-archivos)
25. [Comandos git útiles](#comandos-git-útiles)
26. [Troubleshooting](#troubleshooting)

---

## VISTA GENERAL

### Características del sitio

- **Catálogo 100% Pre-renderizado para SEO:** Los 44 productos vienen renderizados en el HTML estático inicial para rastreo inmediato por Googlebot y Bingbot, complementado con datos estructurados Schema.org (`Store` + `ItemList`).
- **Diseño ritualista (post-merge, 27 sep):** paleta beige-crema `#F3EDE4`, tipografía serif Playfair Display en títulos con paleta dorada mate AA, taxonomía de filtros `velas / melts / dijes y pulseras / franelas` y álbum de variantes por producto.
- **Hero asimétrico** con fotos reales de productos y carga prioritaria (`fetchpriority="high"`).
- **Búsqueda en tiempo real con debounce:** Filtrado instantáneo por nombre y descripción (ej: "soja", "lavanda", "gold-filled") optimizado con 150 ms de retardo para no saturar el hilo principal.
- **Filtros por categoría accesibles:** estado interactivo `aria-pressed` y contador de resultados con estado vacío.
- **Lightbox con álbum de variantes:** vista ampliada desde `images/catalog/`, flechas ◀ ▶ y teclado (Esc, ←, →), contador, puntitos navegables de variantes de color (también con teclado) y botón WhatsApp siempre visible incluso con scroll de seguridad en móvil. Los precios muestran el `$` escalado a la altura óptica de los dígitos (span `.currency`, 0.65em — Playfair solo trae cifras oldstyle).
- **Carrito de compras blindado:**
  - Steppers de cantidad (+/−) con validación estricta de enteros finitos (1 a 999).
  - Persistencia en `localStorage` con expiración automática (TTL de 30 días).
  - Reconciliación estricta de precios e identidad contra el catálogo inmutable `products` (previene manipulación de precios desde el DOM).
  - Sanitización anti-prototype smuggling en la serialización.
  - Aviso de aceptación legal (Términos + Privacidad) antes del botón de WhatsApp.
- **Checkout por WhatsApp:** Mensaje preformateado e itemizado (producto × cantidad — subtotal, y total final en USD). Con el navegador offline muestra un aviso no bloqueante: el carrito queda guardado hasta reconectar.
- **Número real de WhatsApp centralizado:** `+58 412 648 1628` — única fuente en `js/app.js` (`const WHATSAPP = '584126481628'`); todos los botones y enlaces del sitio se sincronizan con este valor.
- **PWA Instalable (Cache v50):** Network-First para navegación HTML **y para `.json`** (contenido siempre fresco con conexión), Stale-While-Revalidate para recursos estáticos; precaching enfocado en shell, dashboard, bloque legal, iconos HD y miniaturas (`images/thumbs/`, incluidas las variantes de color del álbum).
- **Dashboard Privado de Analítica y Conversión:** Panel en `/dashboard.html` con estética *Luxury Glassmorphism*, gráficos de tendencias en curvas Bezier, desglose de canales (Instagram, TikTok, Facebook, Google, WhatsApp), embudo de conversión, desglose por dispositivos, ranking de popularidad, actividad en tiempo real, exportación CSV (incluida la era pre-Supabase, fusionada con la cloud), sincronización con **Supabase Cloud** vía **Edge Function** (login server-side + ingesta `track` sanitizada con rate limit durable) e integración oficial con **Google Analytics 4** (`G-Y9R0B5NH75`, **carga diferida**: tras la primera interacción o a los 8s de fallback).
- **Seguridad integral:** CSP estricto, cabeceras de seguridad en el Edge de Cloudflare, mínimo privilegio en workflows, handler global de errores no capturados.
- **Accesibilidad WCAG AA/AAA:** navegación por teclado completa, trampas de foco en modal y drawer, ARIA interactivo, `prefers-reduced-motion`, contraste verificado (botón WhatsApp en AAA 7.88:1).
- **Rendimiento superior (Lighthouse):** scroll spy con `IntersectionObserver`, CLS ≈ 0, fuentes async (FCP ×8 medido en bisect), GA4 diferido (TBT 0ms), scripts del head a `defer`. Baseline vigente en [`LIGHTHOUSE_BASELINE.md`](LIGHTHOUSE_BASELINE.md).

### Limitaciones conocidas

- **CSP estricta vs script anti-bots de Cloudflare (desde ~19 sep 2026):** Cloudflare inyecta en el HTML servido un script de bot-management (`__CF$cv$params`) cuyo contenido rota en cada respuesta y usa un iframe; la CSP (`script-src 'self'`, `default-src 'none'`) lo bloquea → 1 error de consola y Best Practices 92-93/100. Probado y descartado: hash CSP (el hash rota por request), `unsafe-inline` (anula la protección XSS). Estado: **aceptado por el dueño** (AGENTS.md, regla 8); si se deseara BP 100, habría que desactivar Bot Fight Mode en el dashboard de Cloudflare.
- **El hero móvil domina el LCP (2.5-2.8s en producción):** JPEG grande precacheado; la palanca siguiente es convertirlo a WebP/AVIF (~210ms de ganancia estimada). Detalle en `LIGHTHOUSE_BASELINE.md`.

### Categorías de productos (total: 44)

| Categoría (filtro) | Catálogo | Cantidad | Rango de precios |
|--------------------|----------|----------|------------------|
| Velas (Moldes + Envases, incl. wax melts) | `vela` | 25 | $0.17 – $23.00 |
| Collares (gargantillas + collares) | `collar` | 5 | $20.00 – $32.00 |
| Pulseras | `pulsera` | 6 | $6.00 – $8.00 |
| Franelas | `franela` | 7 | $14.00 – $16.00 |
| Accesorios (dijes) | `otro` | 1 | $7.00 |
| **Total** | | **44** | **$0.17 – $32.00** |

> ✅ **Los 44 productos tienen imagen real** optimizada (thumbs a máx 480px y catalog a máx 900px).  
> ✅ **Álbum por producto (variantes de color):** 22 productos muestran un álbum en el lightbox con la sesión fotográfica de velas del 24-sep (100 fotos nuevas; portada = foto de grupo con todos los colores juntos). Convención y validación en `scripts/IMAGE_GUIDE.md` y `scripts/build_variants.py --check`. Pendiente: 17 fotos de joyas (#107–123) para sus 11 productos.  
> ✅ **Set híbrido:** las 7 franelas (F-01…F-07) conservan sus fotos de modelo reales; Cruz con Paloma conserva su foto anterior (sin foto nueva en esa sesión).

---

## ARQUITECTURA DEL PROYECTO

```
yosoy222/
│
├── index.html                     ← Landing page prerenderizada con el rediseño ritualista
│   ├── Meta tags: SEO, Open Graph, Twitter Cards, Canonical, PWA, CSP
│   ├── Schema.org JSON-LD: datos estructurados Store + ItemList (44 productos)
│   ├── Header fijo: logo, nav con trap de foco, carrito, botón mobile con aria-controls
│   ├── Hero asimétrico (fotos reales con fetchpriority="high")
│   ├── Catálogo prerenderizado: búsqueda con debounce, filtros con aria-pressed, grid 44 cards
│   ├── Secciones: "Cómo comprar", "Nosotros", "Contacto" y Footer con enlaces legales
│   ├── Carrito drawer (overlay lateral accesible con trap de foco + aceptación legal)
│   └── Lightbox modal (role="dialog", teclado Esc/Flechas, focus trap y álbum de variantes)
│
├── dashboard.html                 ← Panel privado de analítica (autenticación SHA-256 fail-closed)
│
├── legal/                         ← Documentos legales públicos y publicados
│   ├── terminos.html              ← Términos y condiciones de compra
│   ├── privacidad.html            ← Política de privacidad y cookies
│   ├── envios.html                ← Envíos y entregas
│   └── devoluciones.html          ← Devoluciones y garantías
│
├── css/
│   ├── style.css                  ← Sistema de diseño ritualista (beige #F3EDE4, tokens WCAG AA/AAA)
│   ├── legal.css                  ← Estilos de los documentos legales (solo los carga legal/)
│   └── dashboard.css              ← Estilos Luxury Glassmorphism para panel de analítica
│
├── js/
│   ├── app.js                     ← Catálogo inmutable, carrito blindado, filtros, lightbox con álbum de variantes
│   ├── variants.json              ← Índice de variantes de color por producto (scripts/build_variants.py)
│   ├── cart.js                    ← Lógica pura del carrito (window.YoSoyCart): totales, validación, TTL 30 días
│   ├── shared.js                  ← Utilidades compartidas (window.YoSoyShared): escapeHtml canónica
│   ├── config.js                  ← Única config de cliente: SUPABASE_URL + GA_ID
│   ├── font-flip.js               ← Activa el CSS de Google Fonts cargado async (media=print → all)
│   ├── analytics.js               ← Telemetría: GA4 (diferido) + Supabase vía Edge Function + localStorage
│   ├── legal.js                   ← Aviso informativo de cookies (no bloqueante, dismissible)
│   ├── dashboard.js               ← Motor del Dashboard: autenticación, datos (Edge Function/local), estado
│   └── dashboard-view.js          ← Vista del Dashboard (pura): gráficos Bezier en Canvas y render de KPIs
│
├── sw.js                          ← Service Worker PWA (Cache v50)
│   ├── Network-First para navegaciones (HTML siempre fresco) y para .js/.json (revalidación en background)
│   ├── Stale-While-Revalidate con ignoreSearch para el resto de estáticos
│   ├── Precaching enfocado: shell, dashboard, bloque legal, iconos y miniaturas (en lotes de 6)
│   └── Activación con limpieza automática de cachés anteriores + auto-refresh en controllerchange
│
├── tests/                         ← 40 pruebas nativas node:test (npm test)
│   ├── cart_and_filters.test.mjs  ← 13: carrito, filtros y seguridad
│   ├── bot_relay.test.mjs         ← 11: comandos del staff, atender/fin, relay del número principal
│   ├── legal_pages.test.mjs       ← 8: bloque legal, CSP, precache y guard anti-borrador
│   ├── sw_strategy.test.mjs       ← 5: estrategia de caché (ejecuta el sw.js real en sandbox node:vm)
│   └── variants.test.mjs          ← 3: convención de variantes de color
│
├── supabase/
│   ├── functions/dashboard-stats  ← Edge Function: login admin server-side + lectura global + ingesta track
│   └── README.md                  ← Despliegue, secrets, smoke tests y rotación de credenciales
│
├── .github/
│   ├── dependabot.yml             ← Actualizaciones automáticas para GitHub Actions y npm
│   └── workflows/
│       ├── ci.yml                 ← CI: 40 pruebas + verify_versions + job Lighthouse con umbrales
│       └── purge-cache.yml        ← Despliegue: Smoke test (origen 200) + Purge Cloudflare
│
├── scripts/
│   ├── prerender_catalog.py       ← Inyecta las 44 tarjetas del catálogo en index.html
│   ├── build_variants.py          ← Genera js/variants.json desde la convención -v2, -v3… (--check valida)
│   ├── generate_icons.py          ← Genera los 10 iconos PWA desde icons/source_logo.jpg
│   ├── verify_icons.py            ← Valida iconos contra manifest.json
│   ├── verify_versions.py         ← Verificador de coherencia de versiones (sw ↔ manifest ↔ HTML ↔ precache ↔ docs)
│   ├── lighthouse_check.py        ← Valida el reporte JSON de Lighthouse contra los umbrales de CI
│   ├── process_images.py          ← Procesamiento de bordes blancos (v1)
│   ├── process_images_v2.py       ← Procesamiento adaptativo/agresivo (v2)
│   ├── supabase_rls.sql           ← SQL canónico del endurecimiento RLS
│   ├── supabase_rate_limit.sql    ← SQL canónico del rate limit durable en Postgres
│   ├── whatsapp-n8n-workflow.json ← Espejo saneado del workflow del bot (fuente viva: n8n en debianm700)
│   └── IMAGE_GUIDE.md             ← Guía de especificaciones visuales de imágenes
│
├── icons/                         ← 11 archivos: 10 iconos PWA (72–512px + maskable) + fuente
├── images/
│   ├── thumbs/                    ← Miniaturas del grid y del álbum (máx 480px, ~20 KB)
│   └── catalog/                   ← Imágenes de alta resolución para Lightbox (máx 900px)
│
├── manifest.json                  ← Configuración PWA (id, scope, display standalone)
├── robots.txt                     ← Directivas para crawlers y sitemap
├── sitemap.xml                    ← Mapa canónico del sitio (incluye legal/)
├── package.json                   ← Definición de scripts de prueba (npm test)
├── _headers                       ← Directivas de cabeceras HTTP y HSTS para edge/CDNs
├── CNAME                          ← Dominio personalizado (yosoy222.com)
├── LIGHTHOUSE_BASELINE.md         ← Baseline de rendimiento en producción y umbrales de CI
├── BRANCH_STATUS.md               ← Handoff histórico del rediseño (rama mergeada; queda como registro)
├── PLAN_IMPLEMENTACION.md         ← Registro histórico congelado (fases 1-27)
├── AGENTS.md                      ← Instrucciones operativas para agentes de IA
└── .agents/MEMORY.md              ← Memoria viva del proyecto (estado, decisiones, pendientes)
```

---

## STACK TECNOLÓGICO

| Componente | Tecnología | Características y Notas |
|------------|------------|-------------------------|
| **Frontend** | HTML5 semántico | Prerenderizado estático, ARIA interactivo, microdatos Schema.org |
| **Estilos** | CSS3 Vanilla | Custom properties (:root), Grid, Flexbox, sin preprocesadores |
| **Interactividad** | ES6+ Vanilla | Zero runtime dependencies, carga diferida (`defer`), módulos nativos |
| **Pruebas** | Node.js Test Runner | `node --test` nativo (40 pruebas: sitio, bot, legales, variantes y estrategia del SW, sin librerías externas) |
| **PWA & Offline** | Service Worker API | Cache v50, Network-First en navegación y `.json`, manifest standalone |
| **SEO & Datos** | JSON-LD / XML | Schema.org Store/ItemList, robots.txt, sitemap.xml canónico |
| **Hosting & CI/CD** | GitHub Pages + Actions | Despliegue automático, CI (tests + Lighthouse), Dependabot activo |
| **CDN & DNS** | Cloudflare | Proxy edge, Cache Rules HTML (TTL 5 min), Transform Rules de seguridad, purga automática post-deploy |
| **Backend de telemetría** | Supabase Cloud | Edge Function `dashboard-stats` (login HMAC + service_role) y `session_get`/`session_set` (sesión del bot) |
| **Analítica** | Google Analytics 4 | `G-Y9R0B5NH75`, eventos e-commerce, carga diferida tras primera interacción |
| **Bot de WhatsApp** | n8n + Evolution API | Autohospedados en debianm700 (Tailscale), IA gratuita vía OmniRoute |
| **Checkout** | WhatsApp wa.me API | Enlaces directos itemizados sin backend ni pasarelas de pago |
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

El proyecto incluye **40 pruebas** con el runner nativo de Node.js (13 del sitio + 11 del bot + 8 del bloque legal + 5 de la estrategia del SW + 3 de variantes de imagen):

```bash
# Ejecutar con npm
npm test

# O directamente con Node.js
node --test tests/*.test.mjs
```

**Salida esperada (resumen):**
```
✔ CART: calculateCartTotals correctly sums price and quantity
✔ SECURITY: loadCartData strips injected/foreign properties to prevent smuggling
✔ BOT RELAY: la respuesta del agente sale al cliente asignado y se confirma
✔ BOT WORKFLOW: el espejo no lleva secretos ni process.env (regla de n8n 2.x)
✔ LEGAL: los datos identificables de la tienda están rellenados
✔ sw.js: declara la estrategia Network-First para .js y .json
✔ VARIANTS: variants.json coherente si existe (claves son files reales del catálogo)
ℹ tests 40 | pass 40 | fail 0
```

### 3. Verificadores auxiliares

```bash
python3 scripts/verify_versions.py      # coherencia sw ↔ manifest ↔ HTML ↔ precache ↔ docs
python3 scripts/build_variants.py --check  # convención del álbum de variantes
npm test && python3 scripts/verify_versions.py   # lo mismo que corre CI
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
   ```bash
   python3 scripts/prerender_catalog.py
   ```
4. **Verificar pruebas y versiones:**
   ```bash
   npm test && python3 scripts/verify_versions.py
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

1. **Preparar imágenes** siguiendo `scripts/IMAGE_GUIDE.md`:
   - Miniatura (máx 480×480 px, JPEG q78) en `images/thumbs/NOMBRE.jpg`.
   - Imagen lightbox (máx 900×900 px, JPEG q80) en `images/catalog/NOMBRE.jpg`.
   - Variantes de color con sufijo `-v2, -v3…` en ambas carpetas (entran al álbum).
2. **Agregar al array `products` en `js/app.js`:**
   ```javascript
   { file: "NOMBRE.jpg", name: "Nombre del Producto", cat: "vela", price: 15, desc: "Descripción completa..." },
   ```
3. **Actualizar el HTML prerenderizado y el álbum:**
   ```bash
   python3 scripts/prerender_catalog.py
   python3 scripts/build_variants.py   # solo si se añadieron variantes
   ```
4. **Validar y publicar:**
   ```bash
   npm test && python3 scripts/verify_versions.py
   git add images/ js/app.js index.html
   git commit -m "feat: agregar producto Nombre del Producto"
   git push origin main
   ```

> **Lección del 27-sep:** tras cada bump de versión de caché, commitear SIEMPRE la lista completa de archivos que reporta el sed (un `dashboard.html` olvidado en v49/v50 rompió CI por refs `?v=` desfasadas).

---

## CÓMO ELIMINAR UN PRODUCTO

1. Remover la entrada del array `products[]` en `js/app.js`.
2. Re-ejecutar el prerenderizado: `python3 scripts/prerender_catalog.py`.
3. (Opcional) Eliminar las imágenes asociadas en `images/thumbs/` y `images/catalog/` (y sus variantes en `js/variants.json` regenerado).
4. Ejecutar pruebas: `npm test`.
5. Guardar cambios y subir: `git commit -am "feat: eliminar producto X" && git push origin main`.

---

## PROCESAMIENTO DE IMÁGENES (BORDES BLANCOS)

Las imágenes de catálogo y miniaturas están procesadas para eliminar márgenes y bordes blancos artificiales:
- **`scripts/process_images_v2.py`:** Algoritmo adaptativo con detección de color perimetral, recorte automático y relleno armónico difuminado cuando se requiere relación de aspecto 1:1.
- **Dimensionamiento optimizado:**
  - `images/thumbs/`: máx. 480px, peso promedio ~20 KB.
  - `images/catalog/`: máx. 900px, peso promedio ~57 KB.
  - Reducción total de peso de imágenes del catálogo de ~12 MB a ~4.9 MB.
- **Especificación visual completa** (producto centrado sobre fondo difuminado, convención de variantes, herramientas): `scripts/IMAGE_GUIDE.md`.

---

## PWA: INSTALAR Y FUNCIONAMIENTO OFFLINE (CACHE V50)

La PWA cumple con todos los estándares modernos de instalación y navegación offline:

### Arquitectura de Caché en `sw.js` (Cache v50)
1. **Navegación Network-First:**
   Para solicitudes de documentos HTML (`event.request.mode === 'navigate'`), el Service Worker consulta primero la red y, sin conexión, responde con la copia en caché.
2. **`.js` y `.json` también Network-First (v45):**
   El handler de scripts se amplió a `.js` + `.json`: con red se entrega fresco y la caché se refresca en background; sin red, fallback a la copia cacheada. Así `variants.json` (y cualquier JSON same-origin) nunca queda viejo en navegantes recurrentes.
3. **Stale-While-Revalidate para el resto de recursos estáticos:**
   CSS, fuentes e imágenes secundarias se sirven de inmediato desde caché mientras se actualizan en segundo plano. La coherencia de versiones (`?v=N` en HTML y `PRECACHE_ASSETS` en el SW) la verifica `scripts/verify_versions.py`, que se ejecuta automáticamente en CI junto a los tests.
4. **Precache Integral & Resiliencia Offline:**
   Durante la instalación, el Service Worker descarga de forma controlada el shell de la aplicación, el panel de dashboard, las 4 páginas legales, los iconos HD y las miniaturas del catálogo (portadas + variantes de color del álbum, en lotes de 6), garantizando navegación visual offline desde el primer instante. Las imágenes grandes del lightbox se descargan y cachean bajo demanda.
5. **Invalidación Inmediata de Versiones Anteriores:**
   Al publicarse una nueva versión (`CACHE_NAME = 'yosoy222-v50'`), el evento `activate` purga de forma determinista cualquier almacenamiento obsoleto y el evento `controllerchange` refresca la vista del catálogo automáticamente.
6. **Iconos PWA de Alta Definición:**
   10 variantes (incluyendo formatos maskable con fondo blanco sólido y Safe Zone del 80%, sin franjas negras en Android/iOS) validadas con `scripts/verify_icons.py`.

### UX Offline (Cache v50)
- **Lightbox con degradación elegante:** si la imagen ampliada (`images/catalog/`) no está en caché y la red no responde, el manejador `error` intercambia automáticamente la miniatura precacheada y muestra una nota informativa; al restablecerse la conexión, la imagen grande vuelve a cargar y la nota desaparece sola.
- **Checkout WhatsApp consciente de la red:** con el navegador offline, el panel del carrito muestra un aviso no bloqueante ("tu carrito queda guardado") que se elimina al reconectar y re-renderizar.
- **Fuentes asíncronas (v33):** el CSS de Google Fonts carga con `media="print"` + flip en `js/font-flip.js` (el texto pinta en fallback serif y hace swap) — FCP ×8 más rápido medido en bisect controlado; combinado con GA4 diferido mantiene TBT 0ms.
- **Estrategia del SW verificada por tests:** `tests/sw_strategy.test.mjs` ejecuta el `sw.js` real en sandbox `node:vm` y prueba Network-First de `.js`/`.json`, fallback offline, navegación y limpieza de activación.

---

## TELEMETRÍA Y BACKEND EN LA NUBE (SUPABASE & GA4)

La tienda y el panel de analítica cuentan con un sistema de telemetría híbrido y respetuoso con la privacidad:

### 1. Ingesta Global con Supabase Cloud
- **Endpoint:** `gkekolsttfbiegyhvejy.supabase.co` (`public.yosoy222_events`).
- **Seguridad RLS:** ✅ **service_role-only total (20 sep 2026)**. RLS activado y **cero políticas** en `public.yosoy222_events`: la key anon (eliminada del cliente desde v30) no puede INSERT (401), ni leer filas (SELECT devuelve cuerpo vacío), ni borrar. Matriz probada con sondeos: anon INSERT 401, anon SELECT `[]`, Edge `track` 200, `relrowsecurity: true`. SQL canónico: `scripts/supabase_rls.sql`.
- **Ingesta vía Edge Function:** `analytics.js` envía a `dashboard-stats` acción `track` — sanitización whitelist server-side + rate limit **durable en Postgres**: RPC atómica `consume_rate_limit` (service_role-only) sobre `private.rate_limit_buckets`, limpieza pg_cron cada 10 min y fallback en memoria. Verificado: burst 40 → 25×200 + 15×429 exactos (`scripts/supabase_rate_limit.sql`).
- **Sincronización Asíncrona:** Cada evento (`page_view`, `view_item`, `add_to_cart`, `whatsapp_checkout`, `search`) se envía con `keepalive: true` en segundo plano sin ralentizar la navegación.
- **Dashboard en Tiempo Real:** `/dashboard.html` consulta vía **Edge Function autenticada**: login server-side (SHA-256 salted contra secret) que devuelve un token HMAC efímero (2h), y lectura con `service_role` **nunca expuesta al navegador**. El panel fusiona además la era local pre-Supabase con la cloud (sin duplicados) y exporta la historia completa a CSV. Despliegue y secrets: `supabase/README.md`.

### 2. Integración Oficial de Google Analytics 4 (GA4)
- **ID de Medición:** `G-Y9R0B5NH75`.
- **Carga diferida (v31):** `gtag.js` se inyecta tras la primera interacción del usuario (o a los 8s como fallback) — nunca compite con el LCP; TBT 0ms verificado en producción con Lighthouse. Inicialización modular sin bloques inline (CSP sin `'unsafe-inline'`).
- **Eventos de E-commerce:** Envío estructurado de `view_item`, `add_to_cart`, `begin_checkout`, `generate_lead` y `search`.

---

## BOT DE WHATSAPP (N8N + EVOLUTION API)

El checkout de la tienda apunta al número oficial `+58 412 648 1628`, que atiende un **bot automático** con escalada a humanos:

- **Infraestructura (autohospedada 24/7):** VM `debianm700` en Tailscale (`100.77.200.34`, SSH ya configurado en `~/.ssh/config` de los equipos de trabajo), stack Docker en `/home/debianserver/marketing-agency`: `agency-n8n` (n8n 2.36.8, puerto 5678), `agency-evolution-api` (puerto 8081), `agency-postgres-evo` y `agency-redis-evo`. La instancia `yosoy222_bot` está conectada por WhatsApp (Baileys) al número principal — decisión del dueño.
- **Workflow:** espejo saneado en `scripts/whatsapp-n8n-workflow.json` (ID `Iwg02lASI9CEFic`, cero secretos — todo vía `$env.*`). La **fuente viva** es la instancia n8n de debianm700; el espejo es el respaldo reproducible.
- **Salud verificada (27 sep 2026):** diagnóstico completo de la queja "no está funcionando": el bot **funciona y sin retraso de entrega**. El análisis del SQLite de n8n (con el `data` flattened y `startedAt` en **UTC** — Venezuela = UTC-4) probó entrega del webhook en el mismo segundo del mensaje; el "Hola" aparentemente ignorado del 27-sep era una **nota interna del Agente 1 sin `>`** (sin respuesta por diseño), y el último cliente real (22-sep) fue atendido correctamente ("La vela Rosa cuesta USD $7.00."). Ningún mensaje de cliente se perdió (cruce ejecuciones ↔ chats de Evolution). No se reinició nada: innecesario y arriesgado para la sesión Baileys.
- **Capacidades verificadas E2E (22-27 sep 2026):**
  - **Memoria de conversación:** historial de 20 turnos + pedido acumulado en sesión Supabase (Edge `session_get`/`session_set`); el prompt de la IA recibe los últimos 6 turnos — el cliente no repite datos.
  - **Expiración 24h:** sin actividad del cliente (sello `ultima_actividad`), la sesión resetea a conversación nueva — no hereda pedidos viejos ni puentes abandonados.
  - **IA:** `nemotron-3-super-120b-a12b:free` vía OmniRoute (router LLM local de debianm700 en `:20128` → OpenRouter free tier, costo $0) con fallback + reintentos ×3.
  - **Delay humano 2-14s** antes de responder al cliente (anti-baneo); avisos internos instantáneos.
  - **Pedidos:** validación server-side contra catálogo empotrado con precios, cálculo de total USD, y aviso "📦 Nuevo pedido" a los 2 agentes **con los últimos 3 turnos de contexto**.
  - **Escalada (handoff):** confirmación al cliente + avisos simultáneos a Agente 1 (`+58 412 992 2399`) y Agente 2 (`+58 424 216 2538`).
  - **Modo puente:** tras pedido/handoff la sesión pasa a `puente` — el bot calla; pregunta comercial devuelve el hilo al bot (reset) y mensaje no-comercial se reenvía a los agentes.
  - **Respuesta del staff desde el número principal:** el agente escribe al número de la tienda y el bot reenvía el texto **como número oficial**, confirmando el destinatario al agente y dejando el mensaje en el historial del cliente (la IA conserva el contexto si el hilo vuelve a ella).
  - **Anti-baneo:** el bot nunca inicia conversación, sin enlaces en respuestas, filtro de grupos `@g.us`.
- **Comandos del staff** (el agente los escribe **desde su WhatsApp personal** al número de la tienda; el número oficial es el que responde al cliente):

  | El agente escribe | Qué pasa |
  |---|---|
  | `>Hola Juan, tu pedido ya salió ✨` | Se reenvía al cliente que tenga asignado — **sale del número oficial** |
  | `>584126481628 Hola Juan` | Se reenvía a ese cliente explícitamente (útil con varios hilos abiertos) |
  | `atender 584126481628` | Toma el hilo: fija el cliente asignado y pone la sesión del cliente en `puente` (el bot calla) |
  | `fin` / `fin 584126481628` | Libera el hilo: la sesión del cliente vuelve a `IA` y el bot retoma la conversación |
  | Cualquier otro texto | Nota interna entre agentes: no se envía a ningún cliente (y no recibe respuesta — comportamiento por diseño) |

  El reenvío es **solo texto**: para fotos, audios o notas de voz la alternativa es vincular WhatsApp Web/Escritorio al número principal (consume uno de los 4 dispositivos vinculados; el teléfono del chip debe estar a mano para el QR).
- **Despliegue del workflow (reproducible):**
  ```bash
  # 1. Backup del workflow vivo en debianm700
  ssh debianm700 'mkdir -p ~/workflows_backup_$(date +%F)'
  # 2. Importar el espejo del repo (upsert por ID — DESACTIVA el workflow)
  scp scripts/whatsapp-n8n-workflow.json debianm700:/tmp/wf.json
  ssh debianm700 'docker cp /tmp/wf.json agency-n8n:/tmp/wf.json && \
    docker exec agency-n8n n8n import:workflow --input=/tmp/wf.json && \
    docker exec agency-n8n n8n publish:workflow --id=Iwg02lASI9CEFic && \
    docker restart agency-n8n'   # el restart es OBLIGATORIO en n8n 2.x
  # 3. Health check
  ssh debianm700 'curl -s -o /dev/null -w "%{http_code}" http://localhost:5678/healthz'
  ```
- **Actualización del watchdog** (cambios en `scripts/whatsapp_bot_watchdog.py`):
  ```bash
  scp scripts/whatsapp_bot_watchdog.py \
    debianm700:/home/debianserver/whatsapp-bot-watchdog/whatsapp_bot_watchdog.py
  ```
- **Diagnóstico (receta del 27-sep):** ejecuciones y payloads viven en el SQLite de n8n (`/home/node/.n8n/database.sqlite` dentro del contenedor — copiar DB+`-wal`+`-shm` con `docker cp` o los datos parecen viejos). El campo `data` de `execution_data` es JSON flattened con referencias tipo puntero y cíclicas. Chats de Evolution: `POST /chat/findChats/yosoy222_bot` y `POST /chat/findMessages/yosoy222_bot` con `{"remoteJid": ..., "limit": N}` (GET da 404). Para ejercitar el camino del staff sin clientes reales: POST sintético a `http://localhost:5678/webhook/yosoy222-whatsapp` con el jid de un agente como emisor y la tienda como cliente.
- **Watchdog (27-sep):** `scripts/whatsapp_bot_watchdog.py` (fuente canónica en el repo; desplegado en `debianm700:~/whatsapp-bot-watchdog/`). Cada 15 min (cron) verifica: (1) la instancia Evolution sigue `open`; (2) **todo mensaje entrante del bot tiene su ejecución en n8n** — Evolution persiste los mensajes en su Postgres aunque el webhook no entregue, así que un mensaje posterior a la última ejecución delata un webhook muerto aunque la conexión siga `open` (correlación por timestamp: Evolution guarda jid `@lid` y n8n recibe el jid telefónico). Alerta `🚨` al **topic 393** de Telegram (el mismo grupo del watchdog del sitio) con cooldown de 4h por problema y aviso `✅ RECUPERADO` al resolverse; auto-rota su log. Prueba de alertas sin caída real: `/tmp/drill_alertas.py` en debianm700 (simula conexión caída; verificado: entrega + cooldown + recuperación).
- **Regla crítica de n8n 2.x:** los Code nodes corren en task runner aislado **SIN `process.env`** — usar siempre `$env.*` (secretos: `EVOLUTION_API_KEY`, `SUPABASE_FN_URL`, `SUPABASE_BOT_KEY` en el `.env` del stack). Los `try/catch` silenciosos esconden bugs de entorno: visibilizar el error en el item fue la clave del diagnóstico.

---

## LEGAL: TÉRMINOS, PRIVACIDAD, ENVÍOS Y DEVOLUCIONES

El sitio publica cuatro documentos en `/legal/` (estáticos, indexables y en el `sitemap.xml`), enlazados desde el pie de la portada y entre sí:

| Documento | Ruta | Cubre |
|---|---|---|
| Términos y condiciones | `/legal/terminos.html` | Cómo funciona la compra por WhatsApp (el sitio no cobra en línea), precios y pagos, naturaleza artesanal de los productos, disponibilidad, cancelaciones, uso permitido y ley aplicable |
| Política de privacidad y cookies | `/legal/privacidad.html` | Qué datos se tratan (conversación, pedido, datos técnicos), cookies de medición `_ga`/`_gid`, almacenamiento local del carrito, terceros (Google, Supabase, Cloudflare, Meta, geojs.io), plazos y derechos |
| Envíos y entregas | `/legal/envios.html` | Delivery, encomienda nacional; plazos, costos por zona (MRW/Zoom), embalaje y datos de entrega |
| Devoluciones y garantías | `/legal/devoluciones.html` | Cómo reportar (48h), qué cubre y qué no, cómo se resuelve (cambio por producto equivalente) y cancelaciones |

**Aviso de cookies:** `js/legal.js` muestra una tarjeta informativa no bloqueante con enlace a la política. Al pulsar «Entendido» se recuerda en `localStorage` (`yosoy222_cookie_notice`). No bloquea la analítica: es informativo, no un sistema de consentimiento previo.

**Aceptación en el checkout:** el carrito muestra «Al continuar aceptas los Términos y condiciones y la Política de privacidad» justo antes del botón de WhatsApp.

> ✅ **Publicado y verificado en producción (27 sep 2026, commit `fe63284`):** CI Tests + Pages + Purge en verde; las 4 páginas responden 200 con los datos del vendedor rellenados (26-sep: Saidubi Muñoz, RIF V-172691842, Palo Verde Caracas, yosoy.ve222@gmail.com, jurisdicción Caracas/Miranda) y **cero marcadores `[COMPLETAR]`**. El test-guard (`LEGAL: los datos identificables...`) exige identidad verificable: ninguna página puede volver a publicarse como borrador. Nota honesta: son plantillas redactadas para el negocio real, no sustituyen la revisión de un abogado.

---

## RAMAS DE TRABAJO Y POLÍTICA DE MERGE

| Rama | Estado | Propósito |
|------|--------|-----------|
| `main` | **Producción (v50)** | Todo push despliega automáticamente a yosoy222.com (CI + Pages + Purge). Única rama protegida por el pipeline completo. |
| `redesign-ritual` | **MERGEADA a `main` (27-sep, `ee9c3b9`, autorización expresa del dueño) — registro histórico en `origin`** | Rediseño ritualista: fondo beige #F3EDE4, tipografía Playfair, taxonomía velas/melts/dijes-pulseras/franelas, álbum de variantes (22 productos / 95 fotos), 14 portadas corregidas (`1c87a58`), legal integrado y fixes finales (botón WhatsApp del lightbox visible, wordmark 222). Su handoff vive en `BRANCH_STATUS.md`. |

> 🔒 **POLÍTICA DE MERGE (decisión del dueño, inviolable — AGENTS.md regla 9):** ninguna rama se mergea a `main` —ni se abre PR de merge, ni se pushea su contenido— sin autorización explícita del dueño Y estar 100% lista (QA gate completo: barrido visual, auditoría móvil 375px, tests en verde, sync con main resuelto, visto bueno del cliente). `main` es producción: todo push despliega.

### Reproducir el estado de la rama (histórico)

```bash
# Montar la rama en un worktree aislado (no interrumpe main)
git fetch origin && git worktree add /tmp/redesign-review origin/redesign-ritual
cd /tmp/redesign-review && cat BRANCH_STATUS.md   # handoff histórico del rediseño
python3 -m http.server 8092                       # http://localhost:8092
```

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
- **Accesibilidad Interactiva (WCAG AA/AAA):**
  - Botones de filtro con atributos dinámicos `aria-pressed="true|false"`.
  - Botón de menú con `aria-controls="nav"` y `aria-expanded`.
  - **Trampas de Foco (Focus Trap):** Al abrir el carrito lateral o el menú móvil en pantallas pequeñas, la tecla `Tab` mantiene el foco dentro del panel interactivo y `Esc` lo cierra restaurando el foco al disparador original.
  - Apertura del Lightbox mediante teclado con `Enter` y `Espacio` en `<button class="product-image">`.
  - Contraste del botón WhatsApp en **AAA** (7.88:1, `#075E36`) y todos los textos a ≥12px — el salto de A11y 96→100 en Lighthouse salió de estas dos correcciones (v47).

---

## RENDIMIENTO Y CORE WEB VITALS

- **Eliminación de Forced Reflows (`PERF-01`):** El seguimiento de navegación y scroll spy utiliza la API nativa `IntersectionObserver` con listeners de scroll pasivos (`{ passive: true }`), eliminando bloqueos del hilo principal.
- **Debounce en Búsqueda (`PERF-04`):** Retardo de 150 ms en el input de filtrado para amortiguar eventos repetitivos de escritura en dispositivos móviles.
- **Prevención de CLS:** Todas las imágenes del catálogo y miniaturas cuentan con dimensiones fijas (`width="480" height="480"`), evitando desplazamientos acumulativos durante la carga.
- **Optimización de Recursos Críticos:** CSS de Google Fonts cargado **async** (`media="print"` + flip en `js/font-flip.js` — FCP ×8 más rápido medido en bisect), carga asíncrona de imágenes (`decoding="async"`), scripts del head con `defer` (v48), hero con `fetchpriority="high"` y GA4 diferido (TBT 0ms).
- **Baseline vigente:** Perf 96–97 / A11y 100 / BP 93 / SEO 92 en producción móvil (v48+), con LCP 2518–2764ms dominado por el hero JPEG. Registro completo y umbrales de CI en [`LIGHTHOUSE_BASELINE.md`](LIGHTHOUSE_BASELINE.md); el job `lighthouse` de CI audita el build local y bloquea regresiones (umbral Performance 75 por el suelo del runner sin CDN/gzip, documentado ahí).

---

## SEO, INDEXABILIDAD Y DATOS ESTRUCTURADOS

1. **Pre-renderizado de Catálogo:** Las 44 tarjetas de productos se encuentran presentes en el código fuente HTML original. Los motores de búsqueda que no ejecutan JavaScript indexan de inmediato todos los títulos, descripciones y precios.
2. **Schema.org JSON-LD:** Bloque estructurado con tipado `Store` y lista ordenada `ItemList` que describe detalladamente cada vela, collar, pulsera o franela, su moneda (USD), precio y disponibilidad (`InStock`).
3. **Indexación y Rastreo:** Archivos [`robots.txt`](robots.txt) y [`sitemap.xml`](sitemap.xml) canónicos configurados (el sitemap incluye las 4 páginas legales).
4. **Metadatos Sociales:** Integración completa de Open Graph (`og:title`, `og:image`, `og:description`, `og:url`) y Twitter Cards con URL canónica `https://yosoy222.com/`.

---

## SUITE DE TESTS Y CI/CD (GITHUB ACTIONS)

### 1. Pruebas Automatizadas (40, `npm test`)
La suite corre bajo el runner nativo `node --test` y verifica:
- **Sitio (13):** exactitud de subtotales/totales del carrito, filtrado por categoría y búsqueda insensible a mayúsculas, migración de carritos legacy, expiración a 30 días, resistencia ante JSON corrupto/NaN, protección anti-prototype smuggling y null-safety de filtros.
- **Bot (11):** parser de comandos (`atender`, `fin`, `>`, nota interna), toma y cierre de hilo (puente ↔ IA), reenvío saliendo del número principal, guardas (destinatario inválido, sin asignación, fallo de envío) y que el espejo del workflow no lleva secretos ni `process.env`.
- **Legal (8):** existencia y completitud de las 4 páginas, enlaces cruzados, CSP (nada inline) con versión de caché vigente, guard de identidad del vendedor (0 `[COMPLETAR]`), aviso de cookies y presencia en precache/sitemap.
- **SW (5):** estrategia de caché ejecutando el `sw.js` real en sandbox `node:vm` (Network-First `.js`/`.json`, fallback offline, navegación, limpieza de activación).
- **Variantes (3):** convención de álbum (`-v2, -v3…`) y coherencia de `variants.json`.

### 2. Pipeline de Integración Continua (`.github/workflows/ci.yml`)
En cada `push` y `pull_request` a `main`, GitHub Actions (Node 22) ejecuta:
1. **Job `test`:** la suite completa con reporter TAP, `pipefail` y **annotations `::error::`** por cada test fallido (canal de diagnóstico sin acceso a logs), más `scripts/verify_versions.py` (coherencia de versiones con annotations al fallar).
2. **Job `lighthouse`:** garantiza Chrome, sirve el repo con `http.server`, audita con Lighthouse 12 (móvil, 3 reintentos ante fallos de infraestructura), sube el reporte JSON como artefacto y valida con `scripts/lighthouse_check.py` contra umbrales que emiten annotations con el delta por categoría (Performance ≥75 por el suelo del runner, documentado en `LIGHTHOUSE_BASELINE.md`; A11y ≥95, BP ≥85, SEO ≥85).

Si algo falla, el commit se bloquea impidiendo despliegues rotos.

### 3. Automatización de Despliegue y Purga (`.github/workflows/purge-cache.yml`)
Tras completarse el despliegue automático de GitHub Pages, este workflow:
1. Purga inmediatamente toda la caché perimetral de Cloudflare vía API (secrets `CLOUDFLARE_ZONE_ID` y `CLOUDFLARE_API_TOKEN`).
2. Ejecuta un **Smoke Test** que verifica el código de respuesta HTTP 200 directo contra los servidores de GitHub Pages y confirma el estado saludable del edge de Cloudflare.

### 4. Gestión de Dependencias (`.github/dependabot.yml`)
Monitoreo semanal automatizado para actualizar acciones de GitHub y paquetes base del repositorio.

---

## DEPLOY A GITHUB PAGES Y CLOUDFLARE

### Flujo de Publicación
```
Push a main ──▶ CI Tests (40 tests + verify_versions) ──▶ Job Lighthouse ──▶ GitHub Pages Build ──▶ Purge Cloudflare Cache + Smoke Test ──▶ Producción OK
```

### Comprobación de Producción
```bash
# Verificar código de respuesta y cabeceras de seguridad
curl -sI https://yosoy222.com/ | grep -E "HTTP|server|strict-transport|x-frame|content-type"

# Monitorear los workflows del último push
gh run list --limit 3   # o la API de check-runs
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
| 14 | Cubo | `VM-CUBO_vela_cubo_40g.jpg` | $7.00 | Vela ritualista 40g geométrica ("la vela Cubo") |
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

Tokens principales en `:root` de [`css/style.css`](css/style.css) (paleta del rediseño ritualista, WCAG AA/AAA):

```css
:root {
  /* Paleta ritualista: beige crema cálido (decisión del dueño: no grisáceo ni rosado) */
  --bg: #F3EDE4;              /* Fondo principal */
  --bg-card: #FAF9F6;         /* Tarjetas de producto */
  --text: #3b3125;            /* Texto principal café oscuro */
  --text-muted: #66584A;      /* Texto secundario (5.90:1 sobre crema) */
  --gold-matte: #7A6134;      /* Dorado mate AA para títulos/frases rituales */
  --accent: #854f19;          /* Acento canónico ámbar tostado (5.77:1) */
  --whatsapp: #075e36;        /* Verde oscuro oficial WhatsApp (7.88:1 — AAA) */
  --danger: #c0392b;
  --radius: 14px;
}
```

Tipografía de títulos: **Playfair Display** (serif, cargada async con `js/font-flip.js`). Notas de la fuente: solo trae cifras oldstyle (el 222 del wordmark escala 1.29em para igualar la altura de mayúsculas) y su `$` asciende ~1.5x los dígitos — se corrige con `span.currency` (0.65em, line-height 0).

---

## ESTRUCTURA DE ARCHIVOS

| Archivo / Directorio | Propósito |
|----------------------|-----------|
| `index.html` | Estructura web, metadatos, Schema.org y catálogo prerenderizado |
| `dashboard.html` | Panel privado de analítica con autenticación criptográfica (SHA-256 fail-closed + anti-bruteforce) |
| `css/style.css` | Sistema de diseño ritualista y tokens de color |
| `css/dashboard.css` | Estilos dedicados para el dashboard y gráficos |
| `css/legal.css` | Estilos de los documentos legales (solo los carga legal/) |
| `js/config.js` | Única configuración cliente: `SUPABASE_URL` y `GA_ID` |
| `js/shared.js` | Utilidades compartidas (`window.YoSoyShared`): `escapeHtml` canónica |
| `js/font-flip.js` | Aplica el CSS de Google Fonts cargado async (`media=print` → `all`) |
| `js/app.js` | Lógica de catálogo, filtros, carrito (UI/estado), lightbox con álbum de variantes y eventos |
| `js/variants.json` | Índice de variantes de color por producto (generado por `scripts/build_variants.py`) |
| `js/cart.js` | Lógica pura del carrito (`window.YoSoyCart`): totales, validación, TTL 30 días |
| `js/analytics.js` | Motor de telemetría: GA4 diferido, ingesta vía Edge Function y fallback localStorage |
| `js/legal.js` | Aviso informativo de cookies (no bloqueante, dismissible) |
| `js/dashboard.js` | Motor del Dashboard: autenticación, datos (Edge Function/local) y estado |
| `js/dashboard-view.js` | Vista del Dashboard (pura): gráficos Bezier en Canvas y render de KPIs/tablas |
| `sw.js` | Service Worker (Cache v50, Network-First navegación y .json/.js) |
| `manifest.json` | Configuración PWA e iconos |
| `legal/` | 4 documentos legales publicados con identidad verificable (guard anti-borrador) |
| `tests/*.test.mjs` | 40 pruebas nativas (13 sitio + 11 bot + 8 legal + 5 SW + 3 variantes) |
| `.github/workflows/ci.yml` | CI: tests TAP con annotations + verify_versions + job Lighthouse con umbrales |
| `.github/workflows/purge-cache.yml` | Deploy: smoke test (origen 200) + purge Cloudflare |
| `.github/dependabot.yml` | Configuración de actualización de dependencias y acciones |
| `scripts/` | Prerenderizado, variantes, iconos (`verify_icons.py`), versiones (`verify_versions.py`), Lighthouse check, SQL canónico (`supabase_rls.sql`, `supabase_rate_limit.sql`), imágenes, **espejo del workflow del bot** (`whatsapp-n8n-workflow.json`) e `IMAGE_GUIDE.md` |
| `supabase/` | Edge Functions `dashboard-stats` (login admin, lectura global, ingesta `track`) y `session_get`/`session_set` (sesión del bot) + README de despliegue |
| `robots.txt` / `sitemap.xml` | Indexación y SEO para motores de búsqueda |
| `_headers` | Cabeceras de seguridad HTTP y HSTS |
| `CNAME` | Dominio personalizado para GitHub Pages |
| `LIGHTHOUSE_BASELINE.md` | Baseline de rendimiento en producción, hallazgos aceptados y umbrales de CI |
| `PLAN_IMPLEMENTACION.md` | Registro histórico y hoja de ruta (fases 1-27, congelado) |
| `BRANCH_STATUS.md` | Handoff histórico del rediseño (rama mergeada a main el 27-sep) |
| `AGENTS.md` | Instrucciones operativas para agentes AI |
| `.agents/MEMORY.md` | Memoria viva del proyecto: estado, decisiones con justificación y pendientes |

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

> ⚠️ Tras cada bump de versión de caché: commitear TODOS los archivos que tocó el sed (ver lección del 27-sep en «Cómo agregar un producto»). Y en `main` solo va producción: verificar rama con `git branch --show-current` antes de commitear.

---

## TROUBLESHOOTING

### 1. El navegador muestra una versión desactualizada
- **Causa:** El Service Worker almacena en caché los recursos para navegación offline.
- **Solución:** Recargar forzando caché (`Ctrl + Shift + R` o `Cmd + Shift + R`). Para desregistrar manualmente: `DevTools → Application → Service Workers → Unregister`.

### 2. WhatsApp abre un número incorrecto
- Comprobar que en `js/app.js` la variable `const WHATSAPP = '584126481628'` no contenga signos `+` o guiones.

### 3. Las pruebas fallan en el entorno local
- Asegurarse de utilizar Node.js v18 o superior que soporte el módulo nativo `node:test`. Ejecutar `node -v` y luego `npm test`.

### 4. El paso "Verify cache version coherence" falla en CI pero pasa en local
- **Causa:** el árbol de trabajo local tiene archivos modificados sin commitear (pasó en v49/v50: `dashboard.html` quedó con `?v=48` en el repo).
- **Solución:** `git status` + commitear los archivos pendientes; el verificador es correcto, el local lo enmascaraba.

### 5. Los scripts de Python fallan con UnicodeEncodeError en runners o consolas ASCII
- Ya mitigado: `verify_versions.py`, `build_variants.py` y `lighthouse_check.py` fuerzan stdout UTF-8 con `sys.stdout.reconfigure`. Si se crea un script nuevo con salidas acentuadas, incluir el mismo guard.

### 6. El bot de WhatsApp "no responde"
- Antes de tocar nada: revisar el diagnóstico del 27-sep en `.agents/MEMORY.md`. Lo más común: el mensaje era una **nota interna del staff sin `>`** (no recibe respuesta por diseño). Verificar ejecuciones en n8n y chats en Evolution con la receta del §Bot de WhatsApp.

---

*Documentación técnica actualizada al 27 de septiembre de 2026. Proyecto 100% verificado en pruebas unitarias (40/40 pasadas), CI/CD (tests + Lighthouse), auditoría de producción, bloque legal publicado, bot de WhatsApp verificado E2E y despliegue activo en https://yosoy222.com — producción en **Cache v50** con el rediseño ritualista mergeado desde `redesign-ritual` con autorización expresa del dueño (commit `ee9c3b9`). La rama queda respaldada en `origin` como registro histórico.*
