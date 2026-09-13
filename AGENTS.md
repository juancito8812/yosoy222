# AGENTS.md — Instrucciones para Agentes AI

> Este archivo contiene todo lo que un agente AI necesita saber para trabajar en el proyecto YoSoy222.

---

## Qué es este proyecto

Tienda online de velas artesanales, pulseras, collares, franelas y accesorios. **PWA instalable** con soporte offline. Checkout por WhatsApp.

- **URL:** https://yosoy222.com
- **Repo:** https://github.com/juancito8812/yosoy222
- **WhatsApp:** +58 412 648 1628 (`584126481628`)

---

## Stack

- **HTML5 + CSS3 + JavaScript vanilla** — sin frameworks, sin npm, sin build tools
- **PWA:** manifest.json + sw.js (service worker con cache v9, stale-while-revalidate, query strings `?v=9` en imágenes/iconos)
- **Hosting:** GitHub Pages (deploy automático al hacer push a `main`)
- **DNS/CDN:** Cloudflare (proxy activado, Cache Rule HTML TTL 5 min, purge automático vía GitHub Actions)
- **Base de datos:** `Catalogo.xlsx` en `/home/jr/Documentos/Catalogo velas/Catalogo.xlsx`

---

## Cómo ejecutar localmente

```bash
cd /home/jr/Documentos/programacion/yosoy222
python3 -m http.server 8080
# Abrir http://localhost:8080
```

**NUNCA** abrir `index.html` con `file://` — las imágenes y el SW no cargan.

---

## Estructura del proyecto

```
index.html          ← Página única (nav, hero, catálogo, lightbox, carrito, footer)
css/style.css       ← Estilos completos (~833 líneas, paleta tierra crema)
js/app.js           ← Toda la lógica (~585 líneas, 44 productos, búsqueda, filtros, carrito, WhatsApp, a11y focus trap, precache PWA)
manifest.json       ← PWA metadata (id + scope)
sw.js               ← Service worker (cache v9, stale-while-revalidate, query strings `?v=9` en imágenes/iconos)
icons/              ← 11 archivos: 10 iconos PWA (72-512px + maskable) + source_logo.jpg original:
                      8 any (RGB plano) + 2 maskable (RGBA)
scripts/
  generate_icons.py   ← regenera los 10 iconos PWA desde icons/source_logo.jpg
  verify_icons.py     ← valida iconos contra manifest.json (existencia, tamaño, formato)
  process_images.py   ← recorte y optimización de bordes en imágenes (v1 y v2)
  process_images_v2.py ← versión adaptativa/agresiva (recomendada)
  IMAGE_GUIDE.md      ← guía de cómo deben quedar las imágenes (estándar visual, tamaños, proceso, checklist)
images/
  thumbs/             ← Miniaturas del grid (63 archivos, máx 480px) — 44 productos + 4 decorativas (hero/nosotros) + 15 variantes adicionales
  catalog/            ← Imágenes grandes para lightbox (60 archivos, máx 900px) — 44 productos + 16 variantes adicionales
.github/workflows/
  purge-cache.yml     ← purge automático Cloudflare tras deploy, valida con jq
_headers              ← CSP + headers de seguridad (GitHub Pages NO los aplica; sirve para Netlify/Cloudflare Pages)
CNAME                 ← Dominio personalizado (yosoy222.com)
```

### Nota sobre imágenes

- **44 productos** tienen imagen en el array `products[]` de `js/app.js`
- **Imágenes decorativas** (no en products[]): `hero-escaparate.jpg`, `hero-rosas-3.jpg`, `nosotros-1.jpg`, `nosotros-2.jpg` — se usan en el hero y sección Nosotros
- **Variantes adicionales** (sufijos `-2`, `-3`): versiones extras de algunos productos que no están en products[] pero sí en las carpetas de imágenes
- **`VM-MINIGIRASOL_wax_melts_mini_girasol.jpg`**: imagen en thumbs/catalog sin entrada en products[]

---

## PWA y caché

- `CACHE_NAME` en `sw.js` = `yosoy222-v9` (bump de versión cuando cambia el SW o assets precacheados).
- Iconos PWA se regeneran y validan como un paso repetible:
  - `python3 scripts/generate_icons.py` — regenera los 10 iconos desde `icons/source_logo.jpg`.
  - `python3 scripts/verify_icons.py` — verifica que los iconos coinciden con `manifest.json` (existencia, tamaño real vs `sizes`, formato: any=RGB plano, maskable=RGBA).
  - Siempre ejecutar `verify_icons.py` después de regenerar; si falla, no se considera cambio listo.
  - La imagen fuente oficial del logo se almacena de forma persistente en `icons/source_logo.jpg`.
- El catálogo offline completo se precachea solo: `app.js` envía al SW la lista de imágenes (`PRECACHE_IMAGES`) cuando se activa una versión nueva del SW; el SW las cachea en segundo plano en lotes de 6 (idempotente). No agregar imágenes a mano en `PRECACHE_ASSETS` (ahí solo van el shell y el hero).
- El workflow `purge-cache.yml` purga Cloudflare tras cada deploy y **falla en rojo** (validación `jq`) si el token no tiene permiso `Zone → Cache Purge → Edit`.

---

## Fuente de verdad: Catalogo.xlsx

El Excel es la base de datos del negocio. Ubicación:
`/home/jr/Documentos/Catalogo velas/Catalogo.xlsx`

**Hojas del Excel:**
| Hoja | Categoría web | Productos |
|------|---------------|-----------|
| Velas Moldes | `vela` | 15 |
| Velas Envases | `vela` | 10 |
| Gargantillas y Pulseras | `collar` / `pulsera` / `otro` | 11 |
| Franelas | `franela` | 7 |

**Para sincronizar:** pedir "sincronizar el sitio con Catalogo.xlsx" — el agente vuelca cada fila a `js/app.js`.

**Verificar sincronización:**
```bash
cd "/home/jr/Documentos/Catalogo velas" && python3 _verify_sync.py
```

---

## Cómo agregar un producto

### ⚠️ IMPORTANTE: Procesar imágenes ANTES de subir

**Siempre leer `scripts/IMAGE_GUIDE.md` antes de procesar cualquier imagen nueva.** Ahí está el estándar visual, tamaños, proceso paso a paso y checklist de calidad.

Resumen rápido:
- **thumbs:** máx 480×480 px, JPEG q78
- **catalog:** máx 900×900 px, JPEG q80
- Sin bordes blancos, producto centrado, fondo difuminado (blur + brightness 0.85)
- Siempre cuadradas (1:1)

### Pasos

1. **Imagen:** procesar según `scripts/IMAGE_GUIDE.md` y copiar a `images/thumbs/` Y `images/catalog/` con el mismo nombre
2. **Dato:** agregar entrada en `js/app.js` → array `products`:
   ```javascript
   { file: "ARCHIVO.jpg", name: "Nombre", cat: "vela", price: 15, desc: "Descripción" }
   ```
   Categorías válidas: `vela`, `collar`, `pulsera`, `franela`, `otro`
3. **Push:** `git add -A && git commit -m "feat: agregar producto X" && git push`

---

## Cómo eliminar un producto

1. Quitar la línea de `products[]` en `js/app.js`
2. (Opcional) Borrar imágenes: `rm "images/thumbs/ARCHIVO.jpg" "images/catalog/ARCHIVO.jpg"`
3. Push

---

## Deploy

```bash
git add -A
git commit -m "feat: descripción del cambio"
git push origin main
```

**Flujo:** push → GitHub Pages (~2 min) → purge automático Cloudflare (~30 seg) → sitio actualizado

---

## Seguridad — REGLAS

1. **NUNCA** meter API keys, tokens ni secretos en el código
2. **NUNCA** hacer commit de credenciales
3. Los secrets van en GitHub → Settings → Secrets (CLOUDFLARE_ZONE_ID y CLOUDFLARE_API_TOKEN). El `CLOUDFLARE_API_TOKEN` DEBE tener permiso `Zone → Cache Purge → Edit` — sin eso el workflow `purge-cache.yml` falla con `Authentication error (10000)`
4. El sitio usa CSP estricto via meta tag (sin `unsafe-inline`)
5. `escapeHtml()` en todo render dinámico (anti-XSS)
6. `loadCart()` valida localStorage al cargar
7. PWA: al cambiar `sw.js`, bump de `CACHE_NAME` (`yosoy222-vN`); la versión nueva precachea el catálogo offline completo vía mensaje `PRECACHE_IMAGES` desde `app.js`. Los iconos e imágenes usan query strings `?v=N` para forzar actualización en la caché del navegador.
8. WhatsApp es única configuración en `js/app.js` → `const WHATSAPP = '584126481628'`. Los enlaces de `index.html` deben usar ese mismo valor.
9. Antes del deploy revisar: (a) secrets de Cloudflare en GitHub y permisos del token, (b) cabeceras reales con `curl -sI https://yosoy222.com/`.

---

## Configuración clave

| Qué | Dónde | Valor |
|-----|-------|-------|
| WhatsApp | `js/app.js` línea 12 | `const WHATSAPP = '584126481628'` (única configuración) |
| WhatsApp | `index.html` (3 lugares) | debe usar `584126481628` igual que `js/app.js` |
| Cache version | `sw.js` línea 6 | `yosoy222-v9` |
| Iconos PWA | `icons/` + `manifest.json` | 8 any RGB plano (72,96,128,144,152,192,384,512) + 2 maskable RGBA (192,512) |
| Regenerar iconos | `scripts/generate_icons.py` | Desde `icons/source_logo.jpg`; luego `scripts/verify_icons.py` |
| Redes sociales | `index.html` contacto + footer | @yo_soy222 (IG, TikTok, FB) |
| Tema | `css/style.css` `:root` | Paleta tierra crema (#faf6ef) |
| Security checklist | antes del deploy | secrets de Cloudflare + cabeceras reales en `curl -sI https://yosoy222.com/` |

---

## Troubleshooting común

| Problema | Causa | Solución |
|----------|-------|----------|
| Imágenes rotas en hero | Rutas incorrectas | Verificar archivos en `images/thumbs/` |
| PWA muestra versión vieja | Cache del SW + manifest/icones cacheados | Bump `CACHE_NAME` en `sw.js`, regenerar/verificar iconos con `scripts/generate_icons.py` + `scripts/verify_icons.py`, y actualizar query strings `?v=N` en URLs de imágenes/iconos |
| WhatsApp abre número viejo | Caché del navegador o enlaces sin actualizar | Verificar que `js/app.js` y `index.html` usan `584126481628` |
| Imágenes no cargan | Abrir con `file://` | Usar `python3 -m http.server` |
| Franelas muestran velas | Cache del SW | Clear site data en DevTools |

---

## Contacto del dueño

- **GitHub:** https://github.com/juancito8812
- **WhatsApp:** +58 412 648 1628
- **Instagram:** https://www.instagram.com/yo_soy222

---

*Última actualización: 2026-09-13 — optimización integral PageSpeed + cache v9:
- Puntuaciones Google PageSpeed: 100 Accesibilidad, 100 Prácticas recomendadas, 100 SEO, 90-99 Rendimiento
- Accesibilidad WCAG AA: contraste de color reforzado en `:root` (--accent: #854f19, ratio >6.2:1), hito principal `<main id="main">`, jerarquía semántica de encabezados (h3 en footer) y drawer con div[role="dialog"]
- Rendimiento y prevención CLS: dimensiones explícitas (width/height 480px) y aspect-ratio 1:1 en imágenes
- CSP actualizado para Cloudflare Web Analytics (static.cloudflareinsights.com y cloudflareinsights.com)
- Service worker cache v9 con offline total e invalidación inmediata (ignoreSearch: true y query strings ?v=9)
- Iconos y catálogo offline validados al 100% con scripts/verify_icons.py*

