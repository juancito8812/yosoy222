# AGENTS.md — Instrucciones Operativas para Agentes AI

> Este archivo contiene todas las especificaciones de arquitectura, flujo de trabajo, estándares de código y seguridad necesarias para cualquier agente AI que opere en el repositorio YoSoy222.

---

## 1. Visión del Proyecto

Tienda online de velas artesanales, pulseras, collares, franelas y accesorios.
- **URL de Producción:** https://yosoy222.com
- **Repositorio:** https://github.com/juancito8812/yosoy222
- **WhatsApp Oficial:** `+58 412 648 1628` (`584126481628`)
- **Agentes Humanos de Respaldo:** Agente 1 (`+58 412 992 2399`), Agente 2 (`+58 424 216 2538`)
- **Hosting:** GitHub Pages con proxy, DNS y CDN bajo Cloudflare.
- **Arquitectura:** PWA instalable con catálogo pre-renderizado para SEO (Schema.org), panel de analítica privada con Luxury Glassmorphism, telemetría en la nube (Supabase Cloud + GA4) y soporte offline (Service Worker Cache v20).

---

## 2. Stack Tecnológico y Principios de Diseño

- **Cero dependencias de runtime:** Vanilla HTML5 semántico, CSS3 moderno y ES6+ JavaScript. No introducir frameworks pesados (React, Vue, etc.) ni empaquetadores complejos.
- **Testing Nativo:** Módulo `node:test` de Node.js (ejecutable con `npm test` o `node --test tests/*.test.mjs`). Cero paquetes de testing externos.
- **PWA (Cache v20):** Estrategia Network-First para navegación de páginas (`mode === 'navigate'`) y Stale-While-Revalidate para recursos estáticos. Precaching enfocado en shell, dashboard, config compartida, iconos HD y miniaturas (`images/thumbs/`). Iconos de alta resolución generados desde fuente 1280px con fondo blanco sólido y Safe Zone del 80% sin franjas negras.
- **Dashboard & Analítica Cloud:** Telemetría sin cookies en `js/analytics.js` con ingesta global en Supabase Cloud (`public.yosoy222_events`) con RLS activado pero política SELECT que expone la tabla a la clave anon (fix insert-only en `scripts/supabase_rls.sql`, pendiente de aplicar; lectura global del dashboard ya migrada a la Edge Function autenticada `supabase/functions/dashboard-stats` — ver `supabase/README.md`), forwarder oficial GA4 (`G-Y9R0B5NH75`), y panel de control en `dashboard.html` (`/dashboard.html`) protegido con autenticación criptográfica (Web Crypto SHA-256 salted hash, protección anti-fuerza bruta, rate-limiting, sesiones efímeras con timeout de 2h y opción de cambio de credenciales).
- **SEO & Indexabilidad:** 44 productos prerenderizados en `index.html` mediante `scripts/prerender_catalog.py` y datos estructurados Schema.org (`Store` + `ItemList`).
- **Base de Datos / Fuente de Verdad:** Archivo Excel `Catalogo.xlsx` ubicado localmente en `/home/jr/Documentos/Catalogo velas/Catalogo.xlsx`.

---

## 3. Comandos Esenciales

```bash
# 1. Ejecutar servidor local de desarrollo (NUNCA usar file://)
python3 -m http.server 8080

# 2. Ejecutar la suite de pruebas automatizadas (13 pruebas de carrito, filtros y seguridad)
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
├── js/app.js                      ← Catálogo inmutable, filtros, carrito blindado, a11y focus trap
├── js/analytics.js                ← Motor de telemetría: GA4 + Supabase Cloud + localStorage
├── js/dashboard.js                ← Motor del Dashboard: autenticación SHA-256, gráficos Bezier en Canvas
├── sw.js                          ← Service Worker (Cache v21, Network-First navegación)
├── supabase/
│   ├── functions/dashboard-stats  ← Edge Function: login admin server-side + lectura con service_role (nunca expuesta)
│   └── README.md                  ← Despliegue, secrets, smoke test y rotación
├── manifest.json                  ← Metadata PWA (id, scope, display standalone, iconos v15)
├── package.json                   ← Script "test" para node --test
├── robots.txt / sitemap.xml       ← Directivas canónicas de indexación
├── _headers                       ← Cabeceras HTTP de seguridad (HSTS, CSP, X-Frame-Options)
├── CNAME                          ← Dominio yosoy222.com
├── tests/
│   └── cart_and_filters.test.mjs  ← 13 pruebas unitarias y de seguridad sin dependencias
├── .github/
│   ├── dependabot.yml             ← Dependabot para GitHub Actions y npm
│   └── workflows/
│       ├── ci.yml                 ← CI de pruebas automatizadas en push/PR
│       └── purge-cache.yml        ← Despliegue: Smoke test (origen 200) + Purge Cloudflare
├── scripts/
│   ├── prerender_catalog.py       ← Generador de tarjetas HTML estáticas para index.html
│   ├── generate_icons.py          ← Generador de iconos desde source_logo.jpg
│   ├── verify_icons.py            ← Validador de especificación de iconos contra manifest.json
│   ├── process_images_v2.py       ← Eliminación de bordes blancos y recorte 1:1
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
1. Ejecutar `npm test` y confirmar que las 13 pruebas pasan al 100%.
2. Ejecutar `git status` para verificar que no queden archivos temporales o cambios sin registrar.
3. Tras hacer `git push`, monitorear con `gh run list --limit 3` y confirmar que tanto `CI Tests` como `Purge Cloudflare Cache` concluyan en verde (`✓`).
4. Al cambiar credenciales o desplegar la Edge Function, seguir `supabase/README.md` (secrets + smoke test).

---

*Documento actualizado al 13 de septiembre de 2026.*
