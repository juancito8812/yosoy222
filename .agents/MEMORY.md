# Memoria del Proyecto: YoSoy222

## Información General

- **Propósito:** Tienda online de velas artesanales, pulseras, collares, franelas y accesorios con PWA offline y checkout por WhatsApp
- **Stack:** HTML5 + CSS3 + JavaScript vanilla (sin frameworks), PWA (manifest.json + sw.js), GitHub Pages, Cloudflare CDN
- **Última sesión:** 12 de septiembre de 2026, 16:00
- **Versión de memoria:** 1

## Arquitectura

- **Página única:** `index.html` (~298 líneas) con nav, hero, catálogo, lightbox, carrito, footer
- **Estilos:** `css/style.css` (~833 líneas) — paleta tierra crema (#faf6ef), mobile-first
- **Lógica:** `js/app.js` (~585 líneas) — 44 productos, búsqueda, filtros, carrito localStorage, WhatsApp, lightbox, a11y
- **PWA:** `manifest.json` (68 líneas) + `sw.js` (138 líneas, cache v7, stale-while-revalidate)
- **Imágenes:** `images/thumbs/` (63 archivos, máx 480px) + `images/catalog/` (60 archivos, máx 900px)
- **Iconos:** `icons/` (11 archivos: 10 iconos PWA 72-512px + source_logo.jpg)
- **Scripts:** `scripts/` (generate_icons.py, verify_icons.py, process_images.py, process_images_v2.py, IMAGE_GUIDE.md)

## Decisiones Clave

- **12 sep 2026** — Revisión completa de documentación: AGENTS.md, PLAN_IMPLEMENTACION.md y .agents/MEMORY.md actualizados con estado real del repo
- **12 sep 2026** — Imagen Armonía Coco reprocesada (bordes eliminados, producto agrandado)
- **12 sep 2026** — Guía de imágenes creada (scripts/IMAGE_GUIDE.md)
- **5 sep 2026** — PWA offline total (cache v7): precache del catálogo completo vía PRECACHE_IMAGES
- **5 sep 2026** — Optimización de imágenes: thumbs 480px q78, catalog 900px q80, peso total ~4.9 MB
- **5 sep 2026** — Imágenes hero decorativas actualizadas (hero-rosas-3.jpg, hero-escaparate.jpg)
- **3 sep 2026** — Seguridad: CSP vía meta tag, headers vía Cloudflare Transform Rule, Cache Rule HTML TTL 5 min
- **3 sep 2026** — WhatsApp centralizado: const WHATSAPP = '584126481628' en js/app.js
- **3 sep 2026** — GitHub Actions purge automático de Cloudflare tras cada deploy

## Estado Actual

- **Branch:** main
- **Último commit:** `b912d75` (docs: agregar guía de imágenes y actualizar documentación)
- **Cache version:** yosoy222-v7
- **Productos:** 44 (25 velas, 5 collares, 6 pulseras, 7 franelas, 1 accesorio)
- **Imágenes:** 63 thumbs, 60 catalog (incluye 4 decorativas y 15 variantes adicionales)
- **WhatsApp:** 584126481628 (configurado en js/app.js y 3 lugares de index.html)
- **Dominio:** yosoy222.com (Cloudflare proxy activado)
- **Deploy:** GitHub Pages automático (~2 min) + purge Cloudflare (~30 seg)

## Cambios Recientes

- **12 sep 2026** — AGENTS.md actualizado: estructura corregida (scripts/), conteo de imágenes (63 thumbs, 60 catalog), imágenes decorativas y variantes documentadas
- **12 sep 2026** — PLAN_IMPLEMENTACION.md actualizado: Fase 12 completada, tabla de imágenes agregada, commits recientes
- **12 sep 2026** — .agents/MEMORY.md inicializado con estado completo del proyecto
- **12 sep 2026** — README.md verificado: 810 líneas, inconsistencias corregidas
- **12 sep 2026** — 2 archivos PNG no rastreados en raíz: "Armonía Canela.png", "Armonía Coco.png" (candidatos a .gitignore o eliminación)

## Próximos Pasos / TODOs

- [ ] SEO: Google Analytics (GA4), Search Console, Open Graph, sitemap.xml, robots.txt, canonical URL
- [ ] Performance: minificar CSS/JS, banner "nueva versión disponible" para PWA
- [ ] Seguridad: WAF Managed Ruleset en Cloudflare (requiere token con permiso waf:edit)
- [ ] UX: focus trap en carrito/lightbox, filtros por precio, rutas hash, indicador offline
- [ ] Cloudflare Polish (WebP automático) — no disponible en plan Free
- [ ] Verificar/eliminar archivos PNG sueltos en raíz del repo
- [ ] Actualizar token Cloudflare con permiso Zone → Cache Purge → Edit (si sigue fallando)

## Notas / Problemas Conocidos

- **Archivos PNG sueltos:** "Armonía Canela.png" y "Armonía Coco.png" en la raíz del repo, no rastreados por git. Candidatos a eliminación o .gitignore
- **Token Cloudflare:** el secret CLOUDFLARE_API_TOKEN puede seguir fallando con Authentication error (10000) si no tiene permiso Zone → Cache Purge → Edit
- **Imágenes variantes:** 15 imágenes con sufijos -2, -3 en carpetas thumbs/catalog sin entrada en products[] — son versiones adicionales que no se muestran en el catálogo
- **VM-MINIGIRASOL:** imagen en ambas carpetas sin entrada en products[]
- **GitHub Pages NO aplica _headers:** el archivo _headers sirve solo para Netlify/Cloudflare Pages; los headers de seguridad se sirven vía Cloudflare Transform Rule