# AGENTS.md — Instrucciones Operativas para Agentes AI

> Este archivo contiene todas las especificaciones de arquitectura, flujo de trabajo, estándares de código y seguridad necesarias para cualquier agente AI que opere en el repositorio YoSoy222.

---

## 1. Visión del Proyecto

Tienda online de velas artesanales, pulseras, collares, franelas y accesorios.
- **URL de Producción:** https://yosoy222.com
- **Repositorio:** https://github.com/juancito8812/yosoy222
- **WhatsApp Oficial:** `+58 412 648 1628` (`584126481628`)
- **Agentes Humanos de Respaldo:** Agente 1 (`+58 412 992 2399`), Agente 2 (`+58 424 216 2538`)
- **Bot de WhatsApp:** activo sobre el número oficial vía n8n + Evolution API (Baileys) autohospedados en `debianm700` (Tailscale `100.77.200.34`, stack Docker `/home/debianserver/marketing-agency`). El espejo saneado del workflow vive en `scripts/whatsapp-n8n-workflow.json` (la fuente viva es la instancia n8n de debianm700). Reglas anti-baneo vigentes: el bot solo responde (nunca inicia), delay humano 2-14s, sin enlaces en primer contacto, sin grupos. **Memoria de conversación por cliente** (historial 20 turnos + pedido acumulado en sesión Supabase vía Edge `session_get`/`session_set`; **expira a las 24h sin actividad del cliente** — sello `ultima_actividad` en `datos_parciales`, respaldo `updated_at` — evita heredar pedidos viejos o puentes abandonados): el bot no reinicia la conversación en cada mensaje. Estados de sesión: `IA` (bot responde) y `puente` (humanos atienden; preguntas comerciales devuelven el hilo al bot con reset, mensajes no-comerciales se reenvían al staff). **Importante para n8n 2.x:** los Code nodes corren en task runner aislado SIN `process.env` — usar siempre `$env.*`. Despliegue del workflow: `import:workflow` (desactiva) + `publish:workflow --id` + `docker restart agency-n8n` (backup previo).
- **Hosting:** GitHub Pages con proxy, DNS y CDN bajo Cloudflare.
- **Arquitectura:** PWA instalable con catálogo pre-renderizado para SEO (Schema.org), panel de analítica privada con Luxury Glassmorphism, telemetría en la nube (Supabase Cloud + GA4) y soporte offline (Service Worker Cache v42).

---

## 2. Stack Tecnológico y Principios de Diseño

- **Cero dependencias de runtime:** Vanilla HTML5 semántico, CSS3 moderno y ES6+ JavaScript. No introducir frameworks pesados (React, Vue, etc.) ni empaquetadores complejos.
- **Testing Nativo:** Módulo `node:test` de Node.js (ejecutable con `npm test` o `node --test tests/*.test.mjs`). Cero paquetes de testing externos.
- **PWA (Cache v42):** Estrategia Network-First para navegación de páginas (`mode === 'navigate'`) y Stale-While-Revalidate para recursos estáticos. Precaching enfocado en shell, dashboard, config compartida, iconos HD y miniaturas (`images/thumbs/`). Iconos de alta resolución generados desde fuente 1280px con fondo blanco sólido y Safe Zone del 80% sin franjas negras.
- **Dashboard & Analítica Cloud:** Telemetría sin cookies en `js/analytics.js` con ingesta global en Supabase Cloud (`public.yosoy222_events`) **vía Edge Function `dashboard-stats` acción `track`** (sanitización whitelist + rate limit 30/min **durable en Postgres**: RPC atómica `consume_rate_limit` sobre `private.rate_limit_buckets` con limpieza pg_cron cada 10 min y fallback en memoria — verificado: burst 40 con bucket en 5 → 25×200 y 15×429; SQL en `scripts/supabase_rate_limit.sql`; 20 sep 2026). RLS activado y **tabla 100% service_role-only desde el 20 sep 2026** (política `anon_insert_events` eliminada tras desplegar v31; sondeos: anon INSERT 401, anon SELECT vacío, Edge track 200). Lectura global vía la misma función (login admin server-side; credenciales solo en secrets — ver `supabase/README.md`). El cliente ya NO lleva ninguna clave de BD (`js/config.js` solo tiene `SUPABASE_URL` y `GA_ID`). Forwarder oficial GA4 (`G-Y9R0B5NH75`, **carga diferida**: se inyecta tras la primera interacción del usuario o a los 8s como fallback — nunca compite en el arranque; TBT 0ms verificado con Lighthouse); y panel de control en `dashboard.html` (`/dashboard.html`) protegido con autenticación criptográfica (Web Crypto SHA-256 salted hash, protección anti-fuerza bruta, rate-limiting, sesiones efímeras con timeout de 2h y cambio de credenciales con verificación de la vigente).
- **SEO & Indexabilidad:** 44 productos prerenderizados en `index.html` mediante `scripts/prerender_catalog.py` y datos estructurados Schema.org (`Store` + `ItemList`).
- **Base de Datos / Fuente de Verdad:** Archivo Excel `Catalogo.xlsx` ubicado localmente en `/home/jr/Documentos/Catalogo velas/Catalogo.xlsx`.

---

## 3. Comandos Esenciales

```bash
# 1. Ejecutar servidor local de desarrollo (NUNCA usar file://)
python3 -m http.server 8080

# 2. Ejecutar la suite de pruebas automatizadas (16 pruebas de carrito, filtros, seguridad y variantes de imagen)
npm test

# 3. Sincronizar catálogo estático prerenderizado tras modificar js/app.js
python3 scripts/prerender_catalog.py

# 4. Regenerar y verificar iconos PWA
python3 scripts/generate_icons.py && python3 scripts/verify_icons.py

# 4b. Verificar coherencia de versiones de caché (sw.js ↔ manifest ↔ script tags ↔ precache)
python3 scripts/verify_versions.py

# 5. Monitorear despliegues y workflows en GitHub Actions
gh run list --limit 3
```

---

## 4. Estructura de Archivos

```
yosoy222/
├── index.html                     ← Landing page con 44 productos prerenderizados y Schema.org LD+JSON
├── dashboard.html                 ← Panel de control privado con autenticación SHA-256
├── css/style.css                  ← Sistema de diseño, tokens en :root (contraste WCAG AA)
├── css/dashboard.css              ← Estilos dedicados para el dashboard y gráficos
├── js/shared.js                   ← Utilidades compartidas (window.YoSoyShared): escapeHtml canónica
├── js/font-flip.js                ← Aplica el CSS de Google Fonts cargado async (media=print → all): FCP ×8 más rápido
├── js/app.js                      ← Catálogo inmutable, filtros, carrito (UI/estado), a11y focus trap, álbum de variantes
├── js/variants.json               ← Índice de variantes de color por producto (generado por scripts/build_variants.py)
├── js/cart.js                     ← Lógica pura del carrito (window.YoSoyCart): totales, validación, TTL 30 días
├── js/analytics.js                ← Motor de telemetría: GA4 (diferido) + Supabase Cloud + localStorage
├── js/dashboard.js                ← Motor del Dashboard: autenticación SHA-256 fail-closed (hash solo en localStorage, nace de login Edge), datos (Edge Function/local), estado
├── js/dashboard-view.js           ← Vista del Dashboard (pura): gráficos Bezier en Canvas y render de KPIs/tablas
├── sw.js                          ← Service Worker (Cache v42, Network-First navegación)
├── supabase/
│   ├── functions/dashboard-stats  ← Edge Function: login admin server-side + lectura con service_role (nunca expuesta)
│   └── README.md                  ← Despliegue, secrets, smoke test y rotación
├── manifest.json                  ← Metadata PWA (id, scope, display standalone, iconos v15)
├── package.json                   ← Script "test" para node --test
├── robots.txt / sitemap.xml       ← Directivas canónicas de indexación
├── _headers                       ← Cabeceras HTTP de seguridad (HSTS, CSP, X-Frame-Options)
├── CNAME                          ← Dominio yosoy222.com
├── tests/
│   └── cart_and_filters.test.mjs  ← 16 pruebas unitarias y de seguridad sin dependencias (variants.test.mjs valida las variantes de color)
├── .github/
│   ├── dependabot.yml             ← Dependabot para GitHub Actions y npm
│   └── workflows/
│       ├── ci.yml                 ← CI de pruebas automatizadas en push/PR
│       └── purge-cache.yml        ← Despliegue: Smoke test (origen 200) + Purge Cloudflare
├── scripts/
│   ├── prerender_catalog.py       ← Generador de tarjetas HTML estáticas para index.html
│   ├── generate_icons.py          ← Generador de iconos desde source_logo.jpg
│   ├── verify_icons.py            ← Validador de especificación de iconos contra manifest.json
│   ├── verify_versions.py         ← Verificador de coherencia de versiones (sw ↔ manifest ↔ HTML ↔ precache)
│   ├── process_images_v2.py       ← Eliminación de bordes blancos y recorte 1:1
│   ├── whatsapp-n8n-workflow.json ← Espejo saneado del workflow del bot (fuente viva: n8n en debianm700)
│   ├── supabase_rls.sql / supabase_rate_limit.sql ← SQL canónico de seguridad de la BD
│   └── IMAGE_GUIDE.md             ← Guía de requerimientos visuales
├── icons/                         ← 10 iconos PWA HD (fondo blanco sólido, 80% Safe Zone) + source_logo.jpg
└── images/
    ├── thumbs/                    ← Miniaturas (máx 480px, ~20 KB)
    └── catalog/                   ← Imágenes de alta resolución para Lightbox (máx 900px)
```

---

## 5. Reglas de Seguridad Inviolables

1. **NUNCA exponer secretos:** No añadir tokens, claves de API ni credenciales al código fuente ni al control de versiones. Los secretos de despliegue (`CLOUDFLARE_ZONE_ID` y `CLOUDFLARE_API_TOKEN`) se gestionan en los Secrets de GitHub Actions.
2. **Conciliación de Precios en Carrito (`SEC-01`):** La función `addToCart` DEBE buscar siempre el precio y nombre del producto dentro del array inmutable `products[]` en `js/app.js`. NUNCA confiar en valores `data-price` o `data-name` extraídos del DOM.
3. **Saneamiento Anti-Prototype Smuggling (`SEC-02`):** Al deserializar o guardar elementos en el carrito, estructurar explícitamente las propiedades permitidas `{ name, price, qty }`. NUNCA usar spread `...item` indiscriminado que permita inyección de `__proto__`.
4. **Validación de Timestamps (`SEC-03`):** `loadCartData` debe validar que `updatedAt` sea un entero finito y positivo antes de calcular el TTL de 30 días.
5. **Mínimo Privilegio en Workflows (`SEC-04`):** Todo workflow en `.github/workflows/` debe declarar explícitamente `permissions: contents: read` salvo necesidad justificada.
6. **Escape HTML Sistemático:** Toda inserción de datos dinámicos en el DOM debe utilizar `escapeHtml()` para prevenir ataques de Cross-Site Scripting (XSS).
7. **Sin `eval()` ni inline scripts:** Cumplir con la Content Security Policy estricta (`script-src 'self'`).
8. **Script anti-bots inyectado por Cloudflare (`__CF$cv$params`):** Cloudflare añade al HTML servido un script inline cuyo contenido **rota en cada respuesta** (verificado 20 sep 2026: hash distinto por request) → NO es compatible con CSP por hash, y su iframe choca con `default-src 'none'`. Genera 1 error de consola y BP Lighthouse 92/100. **Decisión del dueño: aceptarlo y documentarlo** — NO intentar "arreglarlo" con hashes (inviabile), `unsafe-inline` (destruye la protección XSS) ni cambiando la CSP.
9. **Política de ramas — merge SOLO con autorización del dueño:** `main` es producción (todo push despliega). La rama `redesign-ritual` **NUNCA se mergea a main, ni se abre PR de merge, ni se pushea su contenido a main** sin que el dueño lo autorice explícitamente Y la rama esté 100% lista (QA gate completo + visto bueno del cliente). Su handoff vive en `BRANCH_STATUS.md` en la raíz de esa rama.

---

## 6. Procedimiento para Modificar o Agregar Productos

Al modificar, agregar o eliminar productos del catálogo:
1. Asegurarse de contar con las imágenes procesadas en `images/thumbs/` (máx 480px) y `images/catalog/` (máx 900px) siguiendo `scripts/IMAGE_GUIDE.md`.
2. Actualizar el array `products[]` en `js/app.js`.
3. **OBLIGATORIO:** Ejecutar el pre-renderizado del catálogo para actualizar `index.html`:
   ```bash
   python3 scripts/prerender_catalog.py
   ```
4. **OBLIGATORIO:** Ejecutar las pruebas unitarias y verificar que todas pasen:
   ```bash
   npm test
   ```
5. Si hubo cambios estructurales en el Service Worker o assets esenciales, actualizar `CACHE_NAME` en `sw.js` (e.g. `yosoy222-v20`) y validar coherencia con `python3 scripts/verify_versions.py`.
6. Realizar commit y push a `main`.

---

## 7. Protocolo de Verificación Antes de Finalizar Tareas

Antes de reportar una tarea como completa:
1. Ejecutar `npm test` y confirmar que las 16 pruebas pasan al 100%.
2. Ejecutar `python3 scripts/verify_versions.py` si se tocó cualquier versión o asset precacheado.
3. Ejecutar `git status` para verificar que no queden archivos temporales o cambios sin registrar.
4. Tras hacer `git push`, monitorear CI (`gh run list --limit 3` o API de check-runs) y confirmar que `CI Tests` y `Purge Cloudflare Cache` concluyan en verde (`✓`).
5. Al cambiar credenciales o desplegar la Edge Function, seguir `supabase/README.md` (secrets + smoke test).
6. Al modificar el workflow del bot: backup previo en debianm700, desplegar con `import:workflow` + `publish:workflow --id` + `docker restart agency-n8n`, verificar E2E (memoria, pedido, handoff, puente) y actualizar el espejo del repo.
7. **Verificar la rama activa antes de commitear:** `git branch --show-current` — en `main` solo va producción; el rediseño vive exclusivamente en `redesign-ritual` (ver regla 9).

---

*Documento actualizado al 22 de septiembre de 2026.*
