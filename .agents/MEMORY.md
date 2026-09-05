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
- **Versión de memoria:** 11

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
- **Último commit desplegado:** `2f79b0e` (docs token) — deploy exitoso y **purge automático verificado en verde** (workflow `Purge Cloudflare Cache` → success). Imagen hero optimizada servida en producción (23.5 KB).
- **Redes sociales:** Instagram `@yo_soy222`, TikTok `@yo_soy222`, Facebook `share/1C5X2yKscG/`.
- **GitHub Actions:** Workflow `purge-cache.yml` configurado y funcionando (valida respuesta de Cloudflare con `jq`). Secrets: `CLOUDFLARE_ZONE_ID` y `CLOUDFLARE_API_TOKEN` (autenticación Bearer) — configurados.
- **Cache version:** `yosoy222-v4` (sw.js línea 6) — precache del catálogo offline completo via mensaje del SW.
- **Imágenes hero:** corregidas — `VM-ROSA_vela_rosa_79g.jpg` y `VE-ARMONIA-CANELA_vela_armonia_canela_508g.jpg`.
- **Sitio en producción:** funcional y auditado (44 productos, imágenes, búsqueda, filtros, carrito, WhatsApp, lightbox, teclado, PWA, footer Venezuela, mensaje por categoría).
- **Headers de seguridad:** activos y verificados (Cloudflare Transform Rule).
- **Deploy:** push a main → GitHub Pages (~2 min) → purge automático de Cloudflare (~30 seg).

## Cambios Recientes

- **[2026-09-05]** — **Documentación final sincronizada al 100%** (memoria v11, Fase 11 agregada al plan): README con conteos reales (index 298 / css 832 / js 564 / manifest 68 / sw 127 líneas), PWA offline total, imágenes optimizadas (thumbs 480 / catalog 900), purge verificado en verde; AGENTS.md con sección "PWA y caché" (bump a v5 + PRECACHE_IMAGES + validación jq del workflow); PLAN con Fase 11: Hardening + Performance + PWA offline total; MEMORY con estado real (token con permiso Cache Purge ✓).
- **[2026-09-05]** — **Token Cloudflare regenerado con permiso `Cache Purge`** — verificado con purge directo (`success: true`, sin error 10000) y actualizado en el secret `CLOUDFLARE_API_TOKEN` de GitHub. Workflow `purge-cache.yml` confirmado en verde en el último deploy (run 23:14).
- **[2026-09-05]** — **Documentación sincronizada al 100%** (memoria v10): README (offline total v4, requisito permiso `Cache Purge`, verificación curl del token), PLAN (pending: token a regenerar, Polish no disponible en Free, WebP local como alternativa), AGENTS (regla del permiso del token + regla PWA bump/PRECACHE_IMAGES), MEMORY (TODOs y notas actualizados). Estado real: cache v4, imagen hero 23.5 KB en producción.
- **[2026-09-05]** — **PWA offline total**: `sw.js` bump v3→v4 con mensaje `PRECACHE_IMAGES` (la página envía thumbs+catalog de los 44 productos y el SW los cachea en segundo plano, idempotente con marcador `CATALOG_MARKER`); `app.js` lo dispara en `updatefound`/`controllerchange`. **Cloudflare Polish NO aplica en plan Free** (docs oficiales: solo Pro+; el PATCH se acepta pero no transforma — probado y revertido a `off`). Alternativa gratis: WebP local en repo. **Pendiente usuario:** token cfut_… NO tiene permiso `Zone:Cache Purge` (error 10000 al purgar) → el workflow `purge-cache.yml` va a fallar; crear token con `Cache Purge:Edit` y actualizar el secret en GitHub.
- **[2026-09-05]** — **Optimización de rendimiento (perf audit)**: imágenes redimensionadas en repo — `images/thumbs/` máx 480px (JPEG q78) y `images/catalog/` máx 900px (JPEG q80), progresivas. Peso total ~12 MB → ~4.9 MB (thumbs 6.1→1.4 MB, catalog 6.1→3.5 MB). Sin upscaling de imágenes pequeñas. HTML: `fetchpriority="high"` en hero principal, `fetchpriority="low"` + `loading="lazy"` en hero flotante, `decoding="async"` en grid/lightbox, fuentes recortadas a pesos usados (Inter 400-700, Playfair 400-700+italic). Verificado: LCP ~408 ms, 0 errores CSP. Script temporal en `/tmp/opencode/optimize_images.py`.
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
- [x] **REGENERAR token Cloudflare con permiso `Zone → Cache Purge → Edit`** — COMPLETADO 5 sep 2026: nuevo token verificado con purge directo (`success: true`, ya no da error 10000) y actualizado en el secret `CLOUDFLARE_API_TOKEN` de GitHub.
- [x] **Focus trap en carrito/lightbox** — COMPLETADO (5 sep 2026, code review F8: `aria-modal`, trap Tab, ESC, foco restaurado).
- [ ] **WAF Managed Ruleset** — Cloudflare Managed Ruleset con acción `managed_challenge`. El token actual NO accede a esa fase; requiere token con permiso específico.
- [ ] **SEO:** Google Analytics (GA4), Google Search Console, Open Graph completo, Sitemap.xml, robots.txt, Canonical URL.
- [ ] **PWA:** Banner "nueva versión disponible" cuando SW detecte update, minificar CSS/JS.
- [ ] **UX:** filtros por precio, rutas hash, indicador offline.
- [ ] **Cloudflare Polish** — NO disponible en plan Free (solo Pro+). Alternativa gratis: WebP local en repo (pendiente decisión del usuario).
- [ ] **HSTS preload** (opcional, cuando el sitio esté 100% estable).

## Notas / Problemas Conocidos

- **Imágenes `imagenes_web` con marco interior:** algunas traen marco/padding blanco heredado del original — pendiente de recorte si el usuario lo pide.
- **Set `imagenes_web`:** carpeta `/home/jr/Documentos/gemini velas/imagenes_web/` (97 JPG 1000×1000). Se copiaron 36 archivos al repo.
- **Errores de WhatsApp `@521XXXXXXXXX`:** enlaces viejos cacheados/reenviados; el sitio usa `584126481628`.
- **Caché PWA:** después de cada deploy, recargar 2 veces o hacer bump de versión del SW.
- **Deploy:** push a main → GitHub Pages ~2 min + purge automático de Cloudflare (~30 seg).
- **Python-urllib bloqueado por Cloudflare:** usar curl o UA de navegador para verificar.
- **AGENTS.md creado:** contiene instrucciones completas para cualquier agente AI que trabaje en el repo.
