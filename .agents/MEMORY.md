# Memoria del Proyecto: YoSoy222 — Velas Artesanales

## Información General

- **Propósito:** Tienda online de velas artesanales, collares, pulseras, accesorios y franelas con checkout por WhatsApp.
- **Stack:** HTML5 + CSS3 + JavaScript vanilla (sin frameworks ni dependencias), PWA (manifest.json + sw.js), GitHub Pages, Cloudflare (DNS proxy + reglas edge), GitHub Actions (purge automático de caché).
- **Repositorio:** https://github.com/juancito8812/yosoy222
- **URL producción:** https://yosoy222.com (Cloudflare anycast)
- **URL Pages:** https://juancito8812.github.io/yosoy222/
- **WhatsApp pedidos:** +58 412 648 1628 (`584126481628`)
- **Instagram:** https://www.instagram.com/yo_soy222
- **TikTok:** https://www.tiktok.com/@yo_soy222
- **Facebook:** https://www.facebook.com/share/1C5X2yKscG/
- **Cloudflare Zone ID:** `f959322eed862ae75a79f46e8f780d65`
- **Última sesión:** 2026-09-05
- **Versión de memoria:** 5

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
- **[2026-09-03]** — **Cache Rule HTML en Cloudflare** (ruleset `http_request_cache_settings`, id `23c65e9259154365b5dcee888249444c`): HTML cacheado en el edge con TTL 5 min (`edge_ttl override_origin 300` + `browser_ttl override_origin 300`). Verificado: `/` pasó de `DYNAMIC` a `cf-cache-status: HIT`, ciclo REVALIDATED→HIT cada ~300s → deploys se propagan en ~5 min. Nota: el navegador recibe `max-age=600` (10 min, mismo valor que mandaba el origin de GitHub/Fastly y mínimo del plan), el edge revalida cada 300s. **NOTA (5 sep 2026):** Se creó workflow de GitHub Actions para purgar automáticamente después de cada deploy, eliminando la necesidad de purge manual.
- **[2026-09-03]** — **CSP estricto vía meta tag** (sin `unsafe-inline`): el sitio no usa estilos/scripts inline, verificado en navegador sin violaciones.
- **[2026-09-03]** — **Paleta tierra (blanco cálido → crema)**: el sitio pasó de tema oscuro a claro. Fondo `#faf6ef`, tarjetas `#fffdf8`, texto café oscuro `#3b3125`, acento ámbar tierra `#a96f2d`; header translúcido crema, lightbox se mantiene oscuro a propósito. También actualizados `manifest.json` y meta `theme-color` a `#faf6ef`. (`6773efb`)
- **[2026-09-05]** — **Set de imágenes `imagenes_web` adoptado (híbrido)**: el usuario pidió usar el set 1000×1000 de `/home/jr/Documentos/gemini velas/imagenes_web/` (97 JPG + manifest `_catalogo_web.json`, preparado por una sesión paralela). Al revisar el set en preview se detectó que las entradas F-01…F-07 **muestran velas/escenas IA, no las franelas reales** — decisión: híbrido. Se actualizaron **36 productos** (15 velas moldes, 9 velas envases, 12 collares/pulseras/accesorios) a las imágenes web (`VM-ROSA_vela_rosa_79g.jpg`, `G-01_gargantilla_gold-filled_lisa.jpg`, etc.), las **7 franelas conservan sus fotos reales** `F-01.jpg`…`F-07.jpg`, y **Armonía Coco** mantiene su imagen anterior (no existe en el set). (`d6d4b53`, deploy verificado: 88 URLs → 200)
- **[2026-09-03]** — **Fotos reales de las 7 franelas (F-01…F-07)**: antes mostraban imágenes de velas. Mapeadas las fotos reales encontradas en `fotos de calidad/` (los 3 Loto Sagrado en `1779977763582/8623208/9652259.png` + 2 `copilot_image_*.jpeg`) y las 2 adjuntadas por el usuario (F-06 Cool y F-07 El Amor). Archivos `F-01.jpg`…`F-07.jpg` en thumbs/catalog. (`9b5891e`, `b346ced`, `fc0eca2`)
- **[2026-09-03]** — **Excel como única fuente de verdad**: 42 filas del Excel mapeadas al 100% (precios, descripciones verbatim, categorías); 2 variantes extra de Pulsera Infinito (Azul/Beige/Roja — 3 tarjetas, decisión del usuario, datos de fila P-01).
- **[2026-08-30 aprox.]** — WhatsApp `584126481628` configurado en 6 puntos (constante app.js + 3 enlaces index.html + carrito + lightbox); reemplazó el placeholder `521XXXXXXXXXX`.
- **[2026-08-30 aprox.]** — Lightbox + eliminación de bordes blancos de imágenes; fotos de Mini Petit y Armonía Coco extraídas de `Velas Envases.pdf`.

## Estado Actual

- **Branch:** main
- **Último commit desplegado:** `5839051` (GitHub Actions purge workflow) — deploy `success` verificado.
- **Redes sociales:** Instagram `@yo_soy222`, TikTok `@yo_soy222`, Facebook `share/1C5X2yKscG/` — links actualizados en index.html (contacto + footer).
- **GitHub Actions:** Workflow `purge-cache.yml` configurado — purge automático de Cloudflare después de cada deploy exitoso de GitHub Pages. Requiere secrets `CLOUDFLARE_ZONE_ID` y `CLOUDFLARE_API_TOKEN` en el repo.
- **Excel corregido (typo MANO HANSA → MANO HAMSA):** editado directamente en `sharedStrings.xml` del xlsx para no perder las 56 imágenes embebidas; backup en `Catalogo.xlsx.bak`. Verificación `_verify_sync.py`: **42/42, 0 diferencias reales**.
- **Cache Rule HTML:** CREADA y verificada en producción (3 sep 2026) — HTML cacheado en edge, TTL 5 min, deploys frescos en ~5 min. Ahora complementada con purge automático vía GitHub Actions.
- **WAF Managed Ruleset:** aún NO creado — el token `…9fb0cb` (reactivado, con `#waf:edit`) accede a las fases `http_response_headers_transform` y `http_request_cache_settings` pero **no** a `http_request_firewall_managed` ("request is not authorized").
- **Sitio en producción:** funcional y auditado (44 productos, imágenes, búsqueda, filtros, carrito, WhatsApp, lightbox, teclado, PWA, iconos cuadrados, footer Venezuela, mensaje por categoría).
- **Headers de seguridad:** activos y verificados (incluidos en respuestas cacheadas HIT y en www redirect).
- **Deploy:** push a main → GitHub Pages (~2 min) → purge automático de Cloudflare (~30 seg después).

## Cambios Recientes

- **[2026-09-05]** — **Redes sociales actualizadas** (`d77e007`, `2562be3`): Instagram `@yo_soy222`, TikTok `@yo_soy222`, Facebook `share/1C5X2yKscG/`. Actualizados en index.html (contacto + footer), README.md y PLAN_IMPLEMENTACION.md.
- **[2026-09-05]** — **GitHub Actions: Purge automático de Cloudflare** (`5839051`, `.github/workflows/purge-cache.yml`): después de cada deploy exitoso de GitHub Pages, se ejecuta un job que purga toda la caché de Cloudflare vía API. Requiere secrets `CLOUDFLARE_ZONE_ID` y `CLOUDFLARE_API_TOKEN` configurados en el repo. **Pendiente:** configurar los secrets en GitHub (Zone ID: `f959322eed862ae75a79f46e8f780d65`).
- **[2026-09-05]** — **Documentación actualizada** (`10bb8d5`): redes sociales, deploy workflow, memoria del proyecto actualizada a v5.
- **[2026-09-05]** — **Documentación actualizada al 100%** (`README.md`, `.agents/MEMORY.md`, `PLAN_IMPLEMENTACION.md`): refleja imágenes híbridas (36 productos del set `imagenes_web`, 7 franelas reales, Armonía Coco anterior), correcciones v5 sep 2026 (footer Venezuela, mensaje lightbox por categoría, apertura con teclado, delegación de listeners), y estado de la PWA. Commit de docs y push a main.
- **[2026-09-05]** — **Correcciones v5 sep 2026** (JS+HTML, aplicadas y verificadas): pie de página `Hecho a mano en Venezuela`; lightbox prefills el mensaje WhatsApp según categoría (`vela`/`collar`/`pulsera`/`franela`); tarjetas de producto ahora abren el lightbox con Enter/Espacio (`<button>` real con `aria-label`) en vez de `<div>`; listeners delegados (no se re-vinculan en cada render); `visibleProducts` en estado desde `applyFilters`.
- **[2026-09-05]** — Set `imagenes_web` 1000×1000 adoptado para 36 productos de velas y joyería (`d6d4b53`); franelas F-01…F-07 conservan fotos reales; Armonía Coco sin imagen en el set (conserva la suya). Verificado en producción: 88/88 URLs 200, franela F-01 intacta; el set F-01…F-07 NO se usa porque en esa carpeta muestran velas IA.
- **[2026-09-03]** — Paleta crema + franelas verificadas en producción: app.js/css/fotos byte-idénticos al repo, 88 URLs de imágenes responden 200, 7/7 franelas con foto real en navegador.
- **[2026-09-03]** — Typo corregido en `Catalogo.xlsx`: MANO HANSA → MANO HAMSA (coincide con la descripción y con el sitio "Mano Hamsa"). Backup `Catalogo.xlsx.bak`.
- **[2026-09-03]** — Docs actualizadas (README + PLAN + memoria v2): paleta tierra, fotos franelas, script `_verify_sync.py` documentado.
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

- [ ] **Configurar secrets de Cloudflare en GitHub** — `CLOUDFLARE_ZONE_ID` (`f959322eed862ae75a79f46e8f780d65`) y `CLOUDFLARE_API_TOKEN` (crear token con permisos `Zone:Cache Purse` en https://dash.cloudflare.com/profile/api-tokens). Una vez configurados, el workflow purgeará automáticamente después de cada deploy.
- [ ] **WAF Managed Ruleset** — Cloudflare Managed Ruleset con acción `managed_challenge` (decisión del usuario: challenge, no block) en la fase `http_request_firewall_managed`. El token `…9fb0cb` (con `#waf:edit`) NO accede a esa fase ("request is not authorized" — verificado 3 sep 2026); requiere token con permiso específico de esa fase o probar con el mismo esquema que funcionó para headers (`POST /rulesets` directo).
- [ ] ~~Fotos reales de franelas F-01…F-07~~ **COMPLETADO** — las 7 franelas muestran sus fotos reales (`F-01.jpg`…`F-07.jpg`). Nota: F-06 y F-07 son baja resolución (~213×320) — si el usuario consigue versiones más grandes, reemplazarlas.
- [ ] **Rotar tokens** — varios tokens de Cloudflare aparecieron en texto plano en el chat; el usuario fue advertido de revocarlos. (Al menos uno ya fue revocado.)
- [ ] HSTS preload (opcional, cuando el sitio esté 100% estable).
- [ ] GA4 / SEO (pendientes en PLAN_IMPLEMENTACION.md).

## Notas / Problemas Conocidos

- **Imágenes `imagenes_web` con marco interior:** algunas (Mini Petit, Mini Corazones, Mandala) traen marco/padding blanco o difuminado heredado del original — pendiente de recorte si el usuario lo pide. El set F-01…F-07 del set NO se usa (velas IA, no franelas).
- **Set `imagenes_web`:** carpeta `/home/jr/Documentos/gemini velas/imagenes_web/` (97 JPG 1000×1000 + `_catalogo_web.json` con códigos/precios). Se copiaron 36 archivos al repo; el resto (variantes b, IA-*) no se usan.
- **Errores de WhatsApp `@521XXXXXXXXX`:** código enlaces viejos cacheados/reenviados; el sitio usa `584126481628`. Solución: borrar chat viejo + recarga forzada (Ctrl+Shift+R o incógnito).
- **403 con Python-urllib:** Cloudflare bloquea el User-Agent `Python-urllib` (anti-bots) — falso positivo al verificar con scripts; usar curl o UA de navegador.
- **Caché PWA:** después de cada deploy, recargar 2 veces en el celular para ver la versión nueva.
- **Deploy:** push a main → GitHub Pages ~2 min + purge automático de Cloudflare (~30 seg después); verificar con deployments API si hace falta. **NOTA:** Los secrets de Cloudflare aún no están configurados en GitHub — el workflow corre pero no purgea hasta que se configuren.
- **Fotos adjuntadas por el usuario** aparecen en `/tmp/freebuff-desktop-pastes/` (ya copiadas al repo como `F-06.jpg` / `F-07.jpg`).
- **Imágenes de franelas en `fotos de calidad/`:** los archivos `1779977763582.png` (oliva), `1779978623208.png` (negra), `1779979652259.png` (celeste) y los 2 `copilot_image_*.jpeg` son las fotos reales — NO borrarlos.
- **check-host.net** funciona para verificar el sitio desde redes externas (probes mundiales).