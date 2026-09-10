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
- **PWA:** manifest.json + sw.js (service worker con cache v4, stale-while-revalidate)
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
css/style.css       ← Estilos completos (~832 líneas, paleta tierra crema)
js/app.js           ← Toda la lógica (~564 líneas, 44 productos, búsqueda, filtros, carrito, WhatsApp, a11y focus trap, precache PWA)
manifest.json       ← PWA metadata (id + scope)
sw.js               ← Service worker (cache v6, precache catálogo offline por lotes)
icons/              ← 10 iconos PWA (72-512px + maskable) + source_logo.jpg original:
                      8 any (RGB plano) + 2 maskable (RGBA)
scripts/generate_icons.py  ← regenera los 10 iconos PWA desde icons/source_logo.jpg
scripts/verify_icons.py    ← valida iconos contra manifest.json (existencia, tamaño, formato)
scripts/process_images.py  ← recorte y optimización de bordes en imágenes
images/thumbs/      ← Miniaturas del grid (60 archivos, máx 480px)
images/catalog/     ← Imágenes grandes para lightbox (60 archivos, máx 900px)
.github/workflows/  ← purge-cache.yml (purge automático Cloudflare tras deploy, valida con jq)
```

---

## PWA y caché

- `CACHE_NAME` en `sw.js` = `yosoy222-v6` (bump de versión cuando cambia el SW o assets precacheados).
- A partir de ahora, los iconos PWA se regeneran y validan como un paso repetible:
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

1. **Imagen:** copiar a `images/thumbs/` Y `images/catalog/` con el mismo nombre
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
7. PWA: al cambiar `sw.js`, bump de `CACHE_NAME` (`yosoy222-vN`); la versión nueva precachea el catálogo offline completo vía mensaje `PRECACHE_IMAGES` desde `app.js`
8. WhatsApp es única configuración en `js/app.js` → `const WHATSAPP = '584126481628'`. Los enlaces de `index.html` deben usar ese mismo valor.
9. Antes del deploy revisar: (a) secrets de Cloudflare en GitHub y permisos del token, (b) cabeceras reales con `curl -sI https://yosoy222.com/`.

---

## Configuración clave

| Qué | Dónde | Valor |
|-----|-------|-------|
| WhatsApp | `js/app.js` línea 12 | `const WHATSAPP = '584126481628'` (única configuración) |
| WhatsApp | `index.html` (3 lugares) | debe usar `584126481628` igual que `js/app.js` |
| Cache version | `sw.js` línea 6 | `yosoy222-v6` |
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
| PWA muestra versión vieja | Cache del SW + manifest/icones cacheados | Bump `CACHE_NAME` en `sw.js` y regenerar/verificar iconos con `scripts/generate_icons.py` + `scripts/verify_icons.py` |
| WhatsApp abre número viejo | Caché del navegador o enlaces sin actualizar | Verificar que `js/app.js` y `index.html` usan `584126481628` |
| Imágenes no cargan | Abrir con `file://` | Usar `python3 -m http.server` |
| Franelas muestran velas | Cache del SW | Clear site data en DevTools |

---

## Contacto del dueño

- **GitHub:** https://github.com/juancito8812
- **WhatsApp:** +58 412 648 1628
- **Instagram:** https://www.instagram.com/yo_soy222

---

*Última actualización: 2026-09-10 (whatsapp centralizado en js/app.js, checklist de seguridad antes del deploy, docs sincronizadas: AGENTS/README/MEMORY)*
