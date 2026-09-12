# Memoria del Proyecto: YoSoy222

## Información General

- **Propósito:** Tienda online de velas artesanales, pulseras, collares, franelas y accesorios con PWA offline y checkout por WhatsApp
- **Stack:** HTML5 + CSS3 + JavaScript vanilla (sin frameworks), PWA (manifest.json + sw.js), GitHub Pages, Cloudflare CDN
- **Última sesión:** 12 de septiembre de 2026, 18:00
- **Versión de memoria:** 3

## Arquitectura

- **Página única:** `index.html` (~298 líneas) con nav, hero, catálogo, lightbox, carrito, footer
- **Estilos:** `css/style.css` (~833 líneas) — paleta tierra crema (#faf6ef), mobile-first
- **Lógica:** `js/app.js` (~585 líneas) — 44 productos, búsqueda, filtros, carrito localStorage, WhatsApp, lightbox, a11y
- **PWA:** `manifest.json` (68 líneas) + `sw.js` (138 líneas, cache v8, stale-while-revalidate, query strings `?v=8` en imágenes/iconos)
- **Imágenes:** `images/thumbs/` (63 archivos, máx 480px) + `images/catalog/` (60 archivos, máx 900px)
- **Iconos:** `icons/` (11 archivos: 10 iconos PWA 72-512px + source_logo.jpg)
- **Scripts:** `scripts/` (generate_icons.py, verify_icons.py, process_images.py, process_images_v2.py, IMAGE_GUIDE.md)

## Decisiones Clave

- **12 sep 2026** — Cache busting para imágenes/PWA: query strings `?v=8` en URLs de imágenes (thumbs/catalog) y iconos para forzar actualización en dispositivos con PWA instalada
- **12 sep 2026** — Service Worker actualizado: handler `CLEAR_OLD_CACHE` para limpiar versiones viejas de la caché al activar nueva versión
- **12 sep 2026** — Code review de seguridad completo: 0 hallazgos críticos, 0 altos (escapeHtml, loadCart, CSP, SW bien implementados)
- **12 sep 2026** — Code review de calidad: correctitud ✓, legibilidad ✓, arquitectura ✓, performance ✓ (requestAnimationFrame, lazy loading, stale-while-revalidate)
- **12 sep 2026** — Imagen Armonía Canela actualizada con foto profesional
- **12 sep 2026** — Revisión completa de documentación: AGENTS.md, PLAN_IMPLEMENTACION.md, README.md, .agents/MEMORY.md actualizados
- **12 sep 2026** — Guía de imágenes creada (scripts/IMAGE_GUIDE.md)
- **5 sep 2026** — PWA offline total (cache v8): precache del catálogo completo vía PRECACHE_IMAGES
- **5 sep 2026** — Optimización de imágenes: thumbs 480px q78, catalog 900px q80, peso total ~4.9 MB
- **3 sep 2026** — Seguridad: CSP vía meta tag, headers vía Cloudflare Transform Rule, Cache Rule HTML TTL 5 min
- **3 sep 2026** — WhatsApp centralizado: const WHATSAPP = '584126481628' en js/app.js

## Estado Actual

- **Branch:** main
- **Último commit:** `69607ca` (fix: forzar actualización de imágenes en PWA y web)
- **Cache version:** yosoy222-v8
- **Productos:** 44 (25 velas, 5 collares, 6 pulseras, 7 franelas, 1 accesorio)
- **Imágenes:** 63 thumbs, 60 catalog (incluye 4 decorativas y 15 variantes adicionales)
- **WhatsApp:** 584126481628 (configurado en js/app.js y 3 lugares de index.html)
- **Dominio:** yosoy222.com (Cloudflare proxy activado)
- **Deploy:** GitHub Pages automático (~2 min) + purge Cloudflare (~30 seg)

## Code Review (12 sep 2026)

### Seguridad — 0 hallazgos críticos
- ✅ `escapeHtml()` escapa correctamente &, <, >, ", ' (anti-XSS)
- ✅ `loadCart()` valida tipos, rangos, y reconcilia precios con catálogo actual
- ✅ CSP configurado correctamente: `default-src 'none'` con allows mínimos
- ✅ No hay secrets en el código
- ✅ Enlaces externos usan `rel="noopener"` (prevenir tab-nabbing)
- ✅ Service Worker valida origen: solo procesa requests del mismo origen

### Calidad — 4/5 ejes aprobados
- ✅ **Correctitud:** código funciona correctamente, edge cases manejados
- ✅ **Legibilidad:** código limpio, funciones específicas, nombres descriptivos
- ✅ **Arquitectura:** estructura simple y funcional, sin sobre-ingeniería
- ✅ **Performance:** requestAnimationFrame, lazy loading, stale-while-revalidate, precache en lotes

## Cambios Recientes

- **12 sep 2026** — `69607ca` fix: forzar actualización de imágenes en PWA y web (query strings ?v=8, CLEAR_OLD_CACHE)
- **12 sep 2026** — `d383718` fix: forzar actualización de iconos PWA para usuarios instalados (query strings ?v=8 en manifest.json)
- **12 sep 2026** — `09e50a3` docs: actualizar documentación completa + code review seguridad/calidad
- **12 sep 2026** — `0e7d276` fix: actualizar imagen Armonía Canela con foto profesional
- **12 sep 2026** — `76a2959` docs: actualizar documentación — sincronizar con estado real del repo
- **12 sep 2026** — README.md, AGENTS.md, PLAN_IMPLEMENTACION.md, .agents/MEMORY.md actualizados

## Próximos Pasos / TODOs

- [ ] SEO: Google Analytics (GA4), Search Console, Open Graph, sitemap.xml, robots.txt, canonical URL
- [ ] Performance: minificar CSS/JS, banner "nueva versión disponible" para PWA
- [ ] Seguridad: WAF Managed Ruleset en Cloudflare (requiere token con permiso waf:edit)
- [ ] UX: filtros por precio, rutas hash, indicador offline
- [ ] Cloudflare Polish (WebP automático) — no disponible en plan Free

## Notas / Problemas Conocidos

- **Token Cloudflare:** el secret CLOUDFLARE_API_TOKEN puede seguir fallando con Authentication error (10000) si no tiene permiso Zone → Cache Purge → Edit
- **Imágenes variantes:** 15 imágenes con sufijos -2, -3 en carpetas thumbs/catalog sin entrada en products[] — son versiones adicionales que no se muestran en el catálogo
- **VM-MINIGIRASOL:** imagen en ambas carpetas sin entrada en products[]
- **GitHub Pages NO aplica _headers:** el archivo _headers sirve solo para Netlify/Cloudflare Pages; los headers de seguridad se sirven vía Cloudflare Transform Rule