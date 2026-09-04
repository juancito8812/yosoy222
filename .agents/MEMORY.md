# Memoria del Proyecto: YoSoy222 — Velas Artesanales

## Información General

- **Propósito:** Tienda online de velas artesanales, collares, pulseras, accesorios y franelas con checkout por WhatsApp.
- **Stack:** HTML5 + CSS3 + JavaScript vanilla (sin frameworks ni dependencias), PWA (manifest.json + sw.js), GitHub Pages, Cloudflare (DNS proxy + reglas edge).
- **Repositorio:** https://github.com/juancito8812/yosoy222
- **URL producción:** https://yosoy222.com (Cloudflare anycast)
- **URL Pages:** https://juancito8812.github.io/yosoy222/
- **WhatsApp pedidos:** +58 412 648 1628 (`584126481628`)
- **Última sesión:** 2026-09-03 (noche)
- **Versión de memoria:** 2

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
- **[2026-09-03]** — **Paleta tierra (blanco cálido → crema)**: el sitio pasó de tema oscuro a claro. Fondo `#faf6ef`, tarjetas `#fffdf8`, texto café oscuro `#3b3125`, acento ámbar tierra `#a96f2d`; header translúcido crema, lightbox se mantiene oscuro a propósito. También actualizados `manifest.json` y meta `theme-color` a `#faf6ef`. (`6773efb`)
- **[2026-09-03]** — **Fotos reales de las 7 franelas (F-01…F-07)**: antes mostraban imágenes de velas. Mapeadas las fotos reales encontradas en `fotos de calidad/` (los 3 Loto Sagrado en `1779977763582/8623208/9652259.png` + 2 `copilot_image_*.jpeg`) y las 2 adjuntadas por el usuario (F-06 Cool y F-07 El Amor). Archivos `F-01.jpg`…`F-07.jpg` en thumbs/catalog. (`9b5891e`, `b346ced`, `fc0eca2`)
- **[2026-09-03]** — **Excel como única fuente de verdad**: 42 filas del Excel mapeadas al 100% (precios, descripciones verbatim, categorías); 2 variantes extra de Pulsera Infinito (Azul/Beige/Roja — 3 tarjetas, decisión del usuario, datos de fila P-01).
- **[2026-08-30 aprox.]** — WhatsApp `584126481628` configurado en 6 puntos (constante app.js + 3 enlaces index.html + carrito + lightbox); reemplazó el placeholder `521XXXXXXXXXX`.
- **[2026-08-30 aprox.]** — Lightbox + eliminación de bordes blancos de imágenes; fotos de Mini Petit y Armonía Coco extraídas de `Velas Envases.pdf`.

## Estado Actual

- **Branch:** main
- **Último commit desplegado:** `fc0eca2` (fix: foto real de F-06 Cool) — push a main hecho, deploy en curso.
- **Cache Rule HTML:** CREADA y verificada en producción (3 sep 2026) — HTML cacheado en edge, TTL 5 min, deploys frescos en ~5 min.
- **WAF Managed Ruleset:** aún NO creado — el token `…9fb0cb` (reactivado, con `#waf:edit`) accede a las fases `http_response_headers_transform` y `http_request_cache_settings` pero **no** a `http_request_firewall_managed` ("request is not authorized").
- **Sitio en producción:** funcional (44 productos, imágenes, búsqueda, filtros, carrito, WhatsApp, lightbox — auditado).
- **Headers de seguridad:** activos y verificados (incluidos en respuestas cacheadas HIT y en www redirect).

## Cambios Recientes

- **[2026-09-03]** — Fotos reales de las 7 franelas publicadas: F-01…F-05 desde `fotos de calidad/`, F-06 y F-07 adjuntadas por el usuario (`9b5891e`, `b346ced`, `fc0eca2`).
- **[2026-09-03]** — Paleta tierra crema en todo el sitio + manifest/theme-color (`6773efb`).
- **[2026-09-03]** — Verificación Excel ↔ sitio: 42/42 productos presentes, precios 0 diferencias; único hallazgo: typo "MANO HANSA" en el título del Excel (el sitio usa "Mano Hamsa", correcto). Script de verificación conservado en `/home/jr/Documentos/Catalogo velas/_verify_sync.py`.
- **[2026-09-03]** — Headers de seguridad vía Cloudflare Transform Rule creados y verificados (`5bc2011`, `3b4b69c`, `fd9452f`).
- **[2026-09-03]** — Cache Rule HTML en Cloudflare creada y verificada (edge HIT, TTL 5 min).
- **[2026-09-03]** — Sincronización total con Catalogo.xlsx: 44 productos, 0 diferencias (`8bf9f15`).
- **[2026-09-03]** — Fotos reales de Mini Petit y Armonía Coco publicadas (extraídas del PDF de envases) (`0c1ea0c`, `ae85fb4`).
- **[2026-09-03]** — Documentación (README + PLAN) actualizada al 100% y publicada (`d9831fe`).
- **[2026-09-02]** — Búsqueda extendida a descripciones + escape HTML en carrito (XSS) — pusheado.
- **[2026-09-02 aprox.]** — PWA completa (manifest + sw + icons), 404 corregido en GitHub Pages.

## Próximos Pasos / TODOs

- [ ] **WAF Managed Ruleset** — Cloudflare Managed Ruleset con acción `managed_challenge` (decisión del usuario: challenge, no block) en la fase `http_request_firewall_managed`. El token `…9fb0cb` (con `#waf:edit`) NO accede a esa fase ("request is not authorized" — verificado 3 sep 2026); requiere token con permiso específico de esa fase o probar con el mismo esquema que funcionó para headers (`POST /rulesets` directo).
- [ ] ~~Fotos reales de franelas F-01…F-07~~ **COMPLETADO** — las 7 franelas muestran sus fotos reales (`F-01.jpg`…`F-07.jpg`). Nota: F-06 y F-07 son baja resolución (~213×320) — si el usuario consigue versiones más grandes, reemplazarlas.
- [ ] **Rotar tokens** — 4+ tokens de Cloudflare aparecieron en texto plano en el chat; el usuario fue advertido de revocarlos. (Uno ya fue revocado.)
- [ ] HSTS preload (opcional, cuando el sitio esté 100% estable).
- [ ] GA4 / SEO (pendientes en PLAN_IMPLEMENTACION.md).

## Notas / Problemas Conocidos

- **Errores de WhatsApp `@521XXXXXXXXX`:** código enlaces viejos cacheados/reenviados; el sitio usa `584126481628`. Solución: borrar chat viejo + recarga forzada (Ctrl+Shift+R o incógnito).
- **403 con Python-urllib:** Cloudflare bloquea el User-Agent `Python-urllib` (anti-bots) — falso positivo al verificar con scripts; usar curl o UA de navegador.
- **Caché PWA:** después de cada deploy, recargar 2 veces en el celular para ver la versión nueva.
- **Deploy:** push a main → GitHub Pages ~2 min + Cache Rule edge ~5 min; verificar con deployments API si hace falta.
- **Fotos adjuntadas por el usuario** aparecen en `/tmp/freebuff-desktop-pastes/` (ya copiadas al repo como `F-06.jpg` / `F-07.jpg`).
- **Imágenes de franelas en `fotos de calidad/`:** los archivos `1779977763582.png` (oliva), `1779978623208.png` (negra), `1779979652259.png` (celeste) y los 2 `copilot_image_*.jpeg` son las fotos reales — NO borrarlos.
- **check-host.net** funciona para verificar el sitio desde redes externas (probes mundiales).