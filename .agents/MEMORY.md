# Memoria del Proyecto: YoSoy222

## Información General

- **Propósito:** Tienda online de velas artesanales, pulseras, collares, franelas y accesorios con PWA offline, checkout por WhatsApp y dashboard de analítica privada
- **Stack:** HTML5 + CSS3 + JavaScript vanilla (sin frameworks), PWA (manifest.json + sw.js), GitHub Pages, Cloudflare CDN
- **Última sesión:** 16 de septiembre de 2026
- **Versión de memoria:** 8

## Arquitectura

- **Página principal:** `index.html` (~950 líneas) con catálogo prerenderizado, schema.org LD+JSON, telemetría y PWA
- **Dashboard:** `dashboard.html` (`/dashboard.html`), `css/dashboard.css`, `js/dashboard.js` — estética Luxury Glassmorphism, autenticación criptográfica SHA-256 con sal, selector de fechas segmentado, KPIs, gráficos Canvas en curvas Bezier con gradientes, embudo de conversión, desglose por dispositivos, ranking de popularidad y exportación CSV
- **Telemetría:** `js/analytics.js` — captura de visitas, detección de canales (Instagram, TikTok, Facebook, Google, WhatsApp, Directo), visualización de productos, carrito, búsquedas y clics a WhatsApp (compatible con GA4)
- **Estilos:** `css/style.css` (~833 líneas) — paleta tierra crema (#faf6ef) con contraste WCAG AA (`--accent: #854f19`)
- **Lógica:** `js/app.js` (~760 líneas) — catálogo inmutable, 44 productos, búsqueda con debounce, filtros, carrito seguro con TTL de 30 días, WhatsApp, lightbox, a11y focus trap
- **PWA:** `manifest.json` (68 líneas) + `sw.js` (155 líneas, cache v16, Network-First para navegación, stale-while-revalidate para estáticos, query strings `?v=16`, `ignoreSearch: true`, auto-refresh en controllerchange, offline total)
- **Testing:** 13 pruebas unitarias y de seguridad nativas con `node:test` (`npm test`) en `tests/cart_and_filters.test.mjs`
- **Imágenes:** `images/thumbs/` (63 archivos, máx 480px) + `images/catalog/` (60 archivos, máx 900px)
- **Iconos:** `icons/` (11 archivos: 10 iconos PWA 72-512px + source_logo.jpg) — 8 any RGB plano + 2 maskable RGBA con fondo blanco sólido y Safe Zone del 80% (sin franjas negras en Android/iOS)
- **Watchdog:** Cron job ping cada 2m con alertas automáticas de caída a Telegram (Topic 393)
- **Scripts:** `scripts/` (prerender_catalog.py, generate_icons.py, verify_icons.py, process_images.py, process_images_v2.py, IMAGE_GUIDE.md)

## Decisiones Clave & Hitos

- **16 sep 2026** — **Rediseño Luxury Glassmorphism & Cache v16 (Fase 18):** rediseño visual de alta gama en `/dashboard.html` con tema Warm Charcoal & Gold, gráficos Bezier con gradientes luminosos, selector de rango rápido (`[Hoy] [7D] [30D] [60D] [Todo]`), desglose de dispositivos móvil/escritorio, unificación de textos en catálogo y bump a Cache v16.
- **13 sep 2026** — **Watchdog de Caída en Tiempo Real:** cron job programado cada 2 minutos (`every 2m`) con alertas automáticas al Topic 393 ante cualquier fallo HTTP o timeout.
- **13 sep 2026** — **Iconos PWA HD & Eliminación de Franjas Negras (Fase 17, Cache v15):** regeneración de los 10 iconos desde la nueva imagen de 1280×1280 px con fondo blanco sólido (`#ffffff`), re-muestreo Lanczos y Safe Zone de 15% en maskable para eliminar franjas negras en Android/iOS.
- **13 sep 2026** — **Dashboard & Analítica Privada Protegida (Fase 16, Cache v14):** panel en `/dashboard.html` protegido con Web Crypto SHA-256 salted hash, rate-limiting anti-fuerza bruta, expiración de sesión, KPIs en tiempo real, gráficos de evolución y canales de tráfico, funnel de 4 pasos, eventos recientes y exportador CSV.
- **13 sep 2026** — **Corrección de prerender_catalog.py & Limpieza DOM:** corrección del delimitador regex que causaba anidación y duplicación de tarjetas (se eliminaron 120KB de tags sobrantes en `index.html`, reduciendo la altura de `#catalogo` de 126k px a 5k px).
- **13 sep 2026** — **PWA Cache v13 & Tarjetas de Contacto:** rediseño accesible de redes sociales con botones uniformes, enlaces directos a WhatsApp, Instagram, TikTok y Facebook.
- **13 sep 2026** — **Google PageSpeed 99/100/100/100:** 100 Accesibilidad (WCAG AA contraste >6.2:1, landmark `<main>`, h3 en footer, drawer semántico), 100 Prácticas recomendadas (CSP compatible con Cloudflare Web Analytics, sin errores de consola), 100 SEO (meta OpenGraph, Twitter Cards, Canonical URL, Schema.org LD+JSON) y 99 Rendimiento (prevención CLS con width/height y aspect-ratio 1:1, LCP 0.8s, TBT 0ms).
- **13 sep 2026** — **Testing & CI/CD Automatizado:** suite de 13 pruebas nativas (`npm test`), GitHub Actions CI en pull requests / pushes, y Dependabot configurado.
- **12 sep 2026** — Sincronización de imagen de Armonía Canela: foto profesional con ramas de canela y planta en piedra.
- **12 sep 2026** — CI GitHub Actions: `.github/workflows/purge-cache.yml` ejecutando smoke test y purga de Cloudflare con éxito en cada push a main.
- **5 sep 2026** — PWA offline total: precache del catálogo completo vía `PRECACHE_IMAGES` en segundo plano en lotes de 6.
- **3 sep 2026** — WhatsApp centralizado: `const WHATSAPP = '584126481628'` en `js/app.js`.

## Estado Actual

- **Branch:** main
- **Cache version:** yosoy222-v16
- **Dashboard:** https://yosoy222.com/dashboard.html
- **Productos:** 44 (25 velas, 5 collares, 6 pulseras, 7 franelas, 1 accesorio)
- **Imágenes:** 63 thumbs, 60 catalog (incluye 4 decorativas y 15 variantes adicionales)
- **WhatsApp:** 584126481628 (configurado en `js/app.js` y 3 lugares de `index.html`)
- **Dominio:** yosoy222.com (Cloudflare proxy activado)
- **Deploy:** GitHub Pages automático (~2 min) + purge Cloudflare automático (~30 seg)
- **PageSpeed:** 99 Rendimiento, 100 Accesibilidad, 100 Prácticas recomendadas, 100 SEO

## Próximos Pasos / TODOs

- [ ] Analytics: Integración Google Analytics 4 (GA4) opcional
- [ ] Search Console: Envío de sitemap.xml
- [ ] UX: Selector de ordenamiento por precio y filtro por rango
