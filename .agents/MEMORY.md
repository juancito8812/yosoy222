# Memoria del Proyecto: YoSoy222 — Velas Artesanales

## Información General

- **Propósito:** Tienda online de velas artesanales, collares, pulseras, accesorios y franelas con checkout por WhatsApp.
- **Stack:** HTML5 + CSS3 + JavaScript vanilla (sin frameworks ni dependencias), PWA (manifest.json + sw.js), GitHub Pages, Cloudflare (DNS proxy + reglas edge).
- **Repositorio:** https://github.com/juancito8812/yosoy222
- **URL producción:** https://yosoy222.com (Cloudflare anycast)
- **URL Pages:** https://juancito8812.github.io/yosoy222/
- **WhatsApp pedidos:** +58 412 648 1628 (`584126481628`)
- **Última sesión:** 2026-09-03
- **Versión de memoria:** 1

## Arquitectura

- **Ruta local del repo:** `/home/jr/Documentos/Catalogo velas/fotos de calidad/yosoy222/`
- **Fuente de verdad (datos):** `/home/jr/Documentos/Catalogo velas/Catalogo.xlsx` — el usuario edita precios/descripciones/imágenes ahí; el sitio se regenera desde ese Excel.
- **Estructura:**
  - `index.html` — una sola página: nav, hero, catálogo, lightbox, carrito, footer. Metas CSP + Referrer-Policy.
  - `css/style.css` — tema completo, responsivo, grid de productos.
  - `js/app.js` — datos de productos (44, array generado desde el Excel), búsqueda (nombre + descripción), filtros por categoría, carrito con steppers, checkout WhatsApp, lightbox.
  - `images/thumbs/` (≈400px) y `images/catalog/` (≈800px) — convención de imágenes sin bordes blancos (procesadas con `process_images_v2.py`).
  - `manifest.json`, `sw.js`, `icons/` — PWA instalable con soporte offline.
  - `_headers` — existe pero GitHub Pages **lo ignora** (es convención Netlify/Cloudflare Pages).
- **Flujo de actualización:** editar `Catalogo.xlsx` → regenerar array de `js/app.js` (script `_sync_products.py` en la carpeta del catálogo) → verificar al 100% → commit + push a `main` → GitHub Pages auto-deploy (~2 min).

## Decisiones Clave

- **[2026-09-03]** — Headers de seguridad vía **Cloudflare Transform Rule** (no `_headers`): GitHub Pages no puede enviar headers HTTP custom; la regla edge inyecta X-Frame-Options DENY, X-Content-Type-Options nosniff, Permissions-Policy, Referrer-Policy y Strict-Transport-Security. Verificado en vivo con curl.
- **[2026-09-03]** — **Proxy de Cloudflare activado en los 5 registros DNS**: resolvió el problema de DNS en la WiFi de la casa (antes DNS_PROBE_FINISHED_NXDOMAIN); ahora el sitio responde `server: cloudflare` + `cf-ray` desde IPs anycast.
- **[2026-09-03]** — **Cache Rule HTML en Cloudflare** (ruleset `http_request_cache_settings`, id `23c65e9259154365b5dcee888249444c`): HTML cacheado en el edge con TTL 5 min (`edge_ttl override_origin 300` + `browser_ttl override_origin 300`). Verificado: `/` pasó de `DYNAMIC` a `cf-cache-status: HIT`, ciclo REVALIDATED→HIT cada ~300s → deploys se propagan en ~5 min. Nota: el navegador recibe `max-age=600` (10 min, mismo valor que mandaba el origin de GitHub/Fastly y mínimo del plan), el edge revalida cada 300s.
- **[2026-09-03]** — **CSP estricto vía meta tag** (sin `unsafe-inline`): el sitio no usa estilos/scripts inline, verificado en navegador sin violaciones.
- **[2026-09-03]** — **Excel como única fuente de verdad**: 42 filas del Excel mapeadas al 100% (precios, descripciones verbatim, categorías); 2 variantes extra de Pulsera Infinito (Azul/Beige/Roja — 3 tarjetas, decisión del usuario, datos de fila P-01).
- **[2026-08-30 aprox.]** — WhatsApp `584126481628` configurado en 6 puntos (constante app.js + 3 enlaces index.html + carrito + lightbox); reemplazó el placeholder `521XXXXXXXXXX`.
- **[2026-08-30 aprox.]** — Lightbox + eliminación de bordes blancos de imágenes; fotos de Mini Petit y Armonía Coco extraídas de `Velas Envases.pdf`.

## Estado Actual

- **Branch:** main
- **Último commit desplegado:** `5bc2011` (docs: security headers live via Cloudflare) — deploy `success` verificado; README.md servido byte-idéntico al local.
- **Cache Rule HTML:** CREADA y verificada en producción (3 sep 2026) — HTML cacheado en edge, TTL 5 min, deploys frescos en ~5 min.
- **WAF Managed Ruleset:** aún NO creado — el token `…9fb0cb` (reactivado, con `#waf:edit`) accede a las fases `http_response_headers_transform` y `http_request_cache_settings` pero **no** a `http_request_firewall_managed` ("request is not authorized").
- **Sitio en producción:** funcional (44 productos, imágenes, búsqueda, filtros, carrito, WhatsApp, lightbox — auditado).
- **Headers de seguridad:** activos y verificados (incluidos en respuestas cacheadas HIT y en www redirect).

## Cambios Recientes

- **[2026-09-03]** — Headers de seguridad vía Cloudflare Transform Rule creados y verificados (`5bc2011`, `3b4b69c`, `fd9452f`).
- **[2026-09-03]** — Cache Rule HTML en Cloudflare creada y verificada (edge HIT, TTL 5 min).
- **[2026-09-03]** — Sincronización total con Catalogo.xlsx: 44 productos, 0 diferencias (`8bf9f15`).
- **[2026-09-03]** — Fotos reales de Mini Petit y Armonía Coco publicadas (extraídas del PDF de envases) (`0c1ea0c`, `ae85fb4`).
- **[2026-09-03]** — Documentación (README + PLAN) actualizada al 100% y publicada (`d9831fe`).
- **[2026-09-02]** — Búsqueda extendida a descripciones + escape HTML en carrito (XSS) — pusheado.
- **[2026-09-02 aprox.]** — PWA completa (manifest + sw + icons), 404 corregido en GitHub Pages.

## Próximos Pasos / TODOs

- [ ] **WAF Managed Ruleset** — Cloudflare Managed Ruleset con acción `managed_challenge` (decisión del usuario: challenge, no block) en la fase `http_request_firewall_managed`. El token `…9fb0cb` (con `#waf:edit`) NO accede a esa fase ("request is not authorized" — verificado 3 sep 2026); requiere token con permiso específico de esa fase o probar con el mismo esquema que funcionó para headers (`POST /rulesets` directo).
- [ ] **Fotos reales de franelas F-01…F-07** — el usuario tiene las fotos, aún no las ha adjuntado; mapearlas en orden y reemplazar las actuales (`image_1779*.jpg`).
- [ ] **Rotar tokens** — 4+ tokens de Cloudflare aparecieron en texto plano en el chat; el usuario fue advertido de revocarlos. (Uno ya fue revocado.)
- [ ] HSTS preload (opcional, cuando el sitio esté 100% estable).
- [ ] GA4 / SEO (pendientes en PLAN_IMPLEMENTACION.md).

## Notas / Problemas Conocidos

- **Errores de WhatsApp `@521XXXXXXXXX`:** código enlaces viejos cacheados/reenviados; el sitio usa `584126481628`. Solución: borrar chat viejo + recarga forzada (Ctrl+Shift+R o incógnito).
- **403 con Python-urllib:** Cloudflare bloquea el User-Agent `Python-urllib` (anti-bots) — falso positivo al verificar con scripts; usar curl o UA de navegador.
- **Caché PWA:** después de cada deploy, recargar 2 veces en el celular para ver la versión nueva.
- **Deploy:** push a main → GitHub Pages ~2 min; verificar con deployments API si hace falta.
- **check-host.net** funciona para verificar el sitio desde redes externas (probes mundiales).