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
- **Versión de memoria:** 7

## Arquitectura

- **Ruta local del repo:** `/home/jr/Documentos/programacion/yosoy222/`
- **Fuente de verdad (datos):** `/home/jr/Documentos/Catalogo velas/Catalogo.xlsx` — el usuario edita precios/descripciones/imágenes ahí; el sitio se regenera desde ese Excel.
- **Estructura:**
  - `index.html` — una sola página (298 líneas): nav, hero, catálogo, lightbox, carrito, footer. Metas CSP + Referrer-Policy.
  - `css/style.css` — tema completo (834 líneas), responsivo, grid de productos, paleta tierra crema.
  - `js/app.js` — datos de productos (44, array generado desde el Excel), búsqueda (nombre + descripción), filtros por categoría, carrito con steppers, checkout WhatsApp, lightbox (512 líneas).
  - `images/thumbs/` (60 archivos) y `images/catalog/` (60 archivos) — imágenes de producto sin bordes blancos.
  - `manifest.json`, `sw.js` (cache v3), `icons/` (10 iconos) — PWA instalable con soporte offline.
  - `_headers` — existe pero GitHub Pages **lo ignora** (es convención Netlify/Cloudflare Pages).
  - `.github/workflows/purge-cache.yml` — purge automático de Cloudflare después de cada deploy.
  - `AGENTS.md` — instrucciones para agentes AI que trabajen en el repo.
- **Flujo de actualización:** editar `Catalogo.xlsx` → regenerar array de `js/app.js` → commit + push a `main` → GitHub Pages auto-deploy (~2 min) → purge automático Cloudflare (~30 seg).

## Decisiones Clave

- **[2026-09-05]** — **Fix imágenes hero rotas** (`d1fe806`): las rutas `Vela Rosa.jpg` y `Vela Canela.jpg` no existían (causa de imágenes rotas en la PWA). Reemplazadas por `VM-ROSA_vela_rosa_79g.jpg` y `VE-ARMONIA-CANELA_vela_armonia_canela_508g.jpg`. Cache bump v2→v3 para forzar limpieza en dispositivos con PWA instalada.
- **[2026-09-05]** — **GitHub Actions: Purge automático restaurado** (`5839051`, `35b877d`): workflow `purge-cache.yml` creado (se había perdido). Se dispara tras cada deploy exitoso de GitHub Pages. Requiere secrets `CLOUDFLARE_ZONE_ID` y `CLOUDFLARE_API_TOKEN` (autenticación Bearer — `CLOUDFLARE_EMAIL` NO se usa). **Estado: secrets configurados por el usuario.**
- **[2026-09-05]** — **Secrets de Cloudflare configurados** — el usuario creó los secrets en GitHub. El workflow `purge-cache.yml` usa API Token con autenticación Bearer (solo requiere `ZONE_ID` + `API_TOKEN`).
- **[2026-09-03]** — Headers de seguridad vía **Cloudflare Transform Rule** (no `_headers`): GitHub Pages no puede enviar headers HTTP custom; la regla edge inyecta X-Frame-Options DENY, X-Content-Type-Options nosniff, Permissions-Policy, Referrer-Policy y Strict-Transport-Security. Verificado en vivo con curl.
- **[2026-09-03]** — **Proxy de Cloudflare activado en los 5 registros DNS**: resolvió el problema de DNS en la WiFi de la casa; ahora el sitio responde `server: cloudflare` + `cf-ray` desde IPs anycast.
- **[2026-09-03]** — **Cache Rule HTML en Cloudflare**: HTML cacheado en el edge con TTL 5 min. Complementado con purge automático vía GitHub Actions.
- **[2026-09-03]** — **CSP estricto vía meta tag** (sin `unsafe-inline`): el sitio no usa estilos/scripts inline.
- **[2026-09-03]** — **Paleta tierra (blanco cálido → crema)**: fondo `#faf6ef`, tarjetas `#fffdf8`, texto café oscuro `#3b3125`, acento ámbar tierra `#a96f2d`.
- **[2026-09-05]** — **Set de imágenes `imagenes_web` adoptado (híbrido)**: 36 productos usan imágenes 1000×1000; las 7 franelas conservan sus fotos reales; Armonía Coco conserva su imagen anterior.
- **[2026-09-03]** — **Excel como única fuente de verdad**: 42 filas del Excel mapeadas al 100%; 2 variantes extra de Pulsera Infinito.
- **[2026-08-30 aprox.]** — WhatsApp `584126481628` configurado en todos los puntos.

## Estado Actual

- **Branch:** main
- **Último commit desplegado:** `fdd9770` (fix XSS escape + imágenes nosotros) — deploy exitoso.
- **Redes sociales:** Instagram `@yo_soy222`, TikTok `@yo_soy222`, Facebook `share/1C5X2yKscG/`.
- **GitHub Actions:** Workflow `purge-cache.yml` configurado y funcionando (valida respuesta de Cloudflare con `jq`). Secrets: `CLOUDFLARE_ZONE_ID` y `CLOUDFLARE_API_TOKEN` (autenticación Bearer) — configurados.
- **Cache version:** `yosoy222-v3` (sw.js línea 6).
- **Imágenes hero:** corregidas — `VM-ROSA_vela_rosa_79g.jpg` y `VE-ARMONIA-CANELA_vela_armonia_canela_508g.jpg`.
- **Sitio en producción:** funcional y auditado (44 productos, imágenes, búsqueda, filtros, carrito, WhatsApp, lightbox, teclado, PWA, footer Venezuela, mensaje por categoría).
- **Headers de seguridad:** activos y verificados (Cloudflare Transform Rule).
- **Deploy:** push a main → GitHub Pages (~2 min) → purge automático de Cloudflare (~30 seg).

## Cambios Recientes

- **[2026-09-05]** — **Code review completo + 10 hallazgos corregidos** (`js/app.js`, `css/style.css`, `sw.js`, `index.html`, `manifest.json`, `.github/workflows/purge-cache.yml`, docs): (1) workflow ahora valida respuesta de Cloudflare con `jq` y falla si el purge no fue exitoso; (2) drift documental corregido — `CLOUDFLARE_EMAIL` NO es necesario (Bearer); (3) `console.log` removidos de `sw.js`; (4)+(5) CSS `.product-image` fusionado y fallback `::after` con stacking context correcto (`z-index: 0`); (6) cantidad tope 999 durante sesión (`addToCart`/`changeQty`); (7) ya no se auto-abre el carrito al agregar (feedback "✓ Agregado" + contador); (8) a11y: `aria-modal`, focus trap con Tab, ESC cierra el carrito, foco se mueve al abrir/cerrar y regresa al elemento previo; (9) `manifest.json` con `id` y `scope`; (10) precache SW incluye las 2 imágenes del hero. (Commit posterior a `fdd9770`.)
- **[2026-09-05]** — **Documentación completa actualizada** (`AGENTS.md`, `MEMORY.md`, `README.md`, `PLAN_IMPLEMENTACION.md`): nuevo archivo AGENTS.md con instrucciones para agentes AI; README.md con datos correctos (imágenes hero, cache v3, 60 imágenes por carpeta).
- **[2026-09-05]** — **Fix imágenes hero rotas** (`d1fe806`): `Vela Rosa.jpg` → `VM-ROSA_vela_rosa_79g.jpg`, `Vela Canela.jpg` → `VE-ARMONIA-CANELA_vela_armonia_canela_508g.jpg`. Cache bump v2→v3.
- **[2026-09-05]** — **GitHub Actions workflow restaurado** (`5839051`): purge automático de Cloudflare después de cada deploy. Secrets configurados por el usuario.
- **[2026-09-05]** — **Redes sociales actualizadas** (`d77e007`, `2562be3`): Instagram `@yo_soy222`, TikTok `@yo_soy222`, Facebook `share/1C5X2yKscG/`.
- **[2026-09-05]** — **Correcciones v5 sep 2026** (JS+HTML): footer Venezuela, lightbox prefills WhatsApp por categoría, tarjetas abren lightbox con Enter/Espacio, listeners delegados.
- **[2026-09-05]** — Set `imagenes_web` 1000×1000 adoptado para 36 productos; franelas conservan fotos reales.
- **[2026-09-03]** — Paleta crema + franelas verificadas en producción.
- **[2026-09-03]** — Typo corregido en `Catalogo.xlsx`: MANO HANSA → MANO HAMSA.
- **[2026-09-03]** — Headers de seguridad vía Cloudflare Transform Rule creados y verificados.
- **[2026-09-03]** — Cache Rule HTML en Cloudflare creada y verificada.
- **[2026-09-03]** — Sincronización total con Catalogo.xlsx: 44 productos, 0 diferencias.

## Próximos Pasos / TODOs

- [x] **Configurar secrets de Cloudflare en GitHub** — COMPLETADO (usuario configuró ZONE_ID y API_TOKEN).
- [ ] **WAF Managed Ruleset** — Cloudflare Managed Ruleset con acción `managed_challenge`. El token actual NO accede a esa fase; requiere token con permiso específico.
- [ ] **SEO:** Google Analytics (GA4), Google Search Console, Open Graph completo, Sitemap.xml, robots.txt, Canonical URL.
- [ ] **PWA:** Banner "nueva versión disponible" cuando SW detecte update, minificar CSS/JS.
- [ ] **UX:** Focus trap en carrito/lightbox, filtros por precio, rutas hash, indicador offline.
- [ ] **HSTS preload** (opcional, cuando el sitio esté 100% estable).

## Notas / Problemas Conocidos

- **Imágenes `imagenes_web` con marco interior:** algunas traen marco/padding blanco heredado del original — pendiente de recorte si el usuario lo pide.
- **Set `imagenes_web`:** carpeta `/home/jr/Documentos/gemini velas/imagenes_web/` (97 JPG 1000×1000). Se copiaron 36 archivos al repo.
- **Errores de WhatsApp `@521XXXXXXXXX`:** enlaces viejos cacheados/reenviados; el sitio usa `584126481628`.
- **Caché PWA:** después de cada deploy, recargar 2 veces o hacer bump de versión del SW.
- **Deploy:** push a main → GitHub Pages ~2 min + purge automático de Cloudflare (~30 seg).
- **Python-urllib bloqueado por Cloudflare:** usar curl o UA de navegador para verificar.
- **AGENTS.md creado:** contiene instrucciones completas para cualquier agente AI que trabaje en el repo.
