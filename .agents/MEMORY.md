# Memoria del Proyecto: YoSoy222

## Información General

- **Propósito:** Tienda online de velas artesanales, pulseras, collares, franelas y accesorios con PWA offline y checkout por WhatsApp
- **Stack:** HTML5 + CSS3 + JavaScript vanilla (sin frameworks), PWA (manifest.json + sw.js), GitHub Pages, Cloudflare CDN
- **Última sesión:** 13 de septiembre de 2026, 00:40
- **Versión de memoria:** 4

## Arquitectura

- **Página única:** `index.html` (~308 líneas) con nav, hero, catálogo, lightbox, carrito, footer y semántica accesible (`<main id="main">`)
- **Estilos:** `css/style.css` (~833 líneas) — paleta tierra crema (#faf6ef) con contraste WCAG AA (`--accent: #854f19`), mobile-first
- **Lógica:** `js/app.js` (~585 líneas) — 44 productos, búsqueda, filtros, carrito localStorage, WhatsApp, lightbox, a11y focus trap
- **PWA:** `manifest.json` (68 líneas) + `sw.js` (151 líneas, cache v9, stale-while-revalidate, query strings `?v=9`, `ignoreSearch: true`, offline total)
- **Imágenes:** `images/thumbs/` (63 archivos, máx 480px) + `images/catalog/` (60 archivos, máx 900px)
- **Iconos:** `icons/` (11 archivos: 10 iconos PWA 72-512px + source_logo.jpg) — 8 any RGB plano + 2 maskable RGBA
- **Scripts:** `scripts/` (generate_icons.py, verify_icons.py, process_images.py, process_images_v2.py, IMAGE_GUIDE.md)

## Decisiones Clave & Hitos

- **13 sep 2026** — **Google PageSpeed 100/100/100:** 100 Accesibilidad (WCAG AA contraste >6.2:1, landmark `<main>`, h3 en footer, drawer semántico), 100 Prácticas recomendadas (CSP compatible con Cloudflare Web Analytics, sin errores de consola), 100 SEO (meta OpenGraph, Twitter Cards, Canonical URL) y 90-99 Rendimiento (prevención CLS con width/height y aspect-ratio 1:1, LCP 0.8s, TBT 0ms).
- **13 sep 2026** — **PWA Cache v9:** bump de `CACHE_NAME = 'yosoy222-v9'`, invalidación completa de cachés anteriores (`yosoy222-v8`), sincronización de URLs de precache (`?v=9`) y `{ ignoreSearch: true }` en `sw.js` para resiliencia offline.
- **12 sep 2026** — Sincronización de imagen de Armonía Canela: foto profesional con ramas de canela y planta en piedra.
- **12 sep 2026** — CI GitHub Actions: `.github/workflows/purge-cache.yml` ejecutando purga de Cloudflare con éxito en cada push a main.
- **12 sep 2026** — `scripts/verify_icons.py` mejorado para ignorar query strings en `manifest.json` (10/10 iconos verificados OK).
- **5 sep 2026** — PWA offline total: precache del catálogo completo vía `PRECACHE_IMAGES` en segundo plano en lotes de 6.
- **5 sep 2026** — Optimización de imágenes: thumbs 480px q78, catalog 900px q80, peso total ~4.9 MB.
- **3 sep 2026** — Seguridad: CSP estricto vía meta tag, headers vía Cloudflare Transform Rule, Cache Rule HTML TTL 5 min.
- **3 sep 2026** — WhatsApp centralizado: `const WHATSAPP = '584126481628'` en `js/app.js`.

## Estado Actual

- **Branch:** main
- **Cache version:** yosoy222-v9
- **Productos:** 44 (25 velas, 5 collares, 6 pulseras, 7 franelas, 1 accesorio)
- **Imágenes:** 63 thumbs, 60 catalog (incluye 4 decorativas y 15 variantes adicionales)
- **WhatsApp:** 584126481628 (configurado en `js/app.js` y 3 lugares de `index.html`)
- **Dominio:** yosoy222.com (Cloudflare proxy activado)
- **Deploy:** GitHub Pages automático (~2 min) + purge Cloudflare automático (~30 seg)
- **PageSpeed:** 100 Accesibilidad, 100 Prácticas recomendadas, 100 SEO, 90-99 Rendimiento

## Próximos Pasos / TODOs

- [ ] SEO: Google Analytics (GA4), Google Search Console (sitemap.xml / robots.txt)
- [ ] Performance: minificar CSS/JS, banner "nueva versión disponible" para PWA
- [ ] Seguridad: WAF Managed Ruleset en Cloudflare
- [ ] UX: filtros por precio, rutas hash compartibles por categoría, indicador offline visual
