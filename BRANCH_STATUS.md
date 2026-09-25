# 🌿 Estado de la rama `redesign-ritual` — Handoff para agentes

> **Documento de trabajo de la rama.** Si estás retomando el trabajo del rediseño, empieza aquí.
> Última actualización: **25 de septiembre de 2026** (push a `origin` — rama respaldada en GitHub + preview efímero rearmado para el cliente).

---

## 1. Dónde estamos (una frase)

Rediseño integral ritualista (paleta beige-dorado, tipografía serif, taxonomía de productos nueva) en la rama `redesign-ritual`, **v42, sincronizada con main al 22-sep, QA gate aprobado y con el álbum de variantes de color de velas montado (24-sep), NO mergeada a main** y **respaldada en `origin/redesign-ritual` (`da8ea11`, push del 25-sep)** — el dueño quiere mergear solo cuando lo autorice explícitamente; el único pendiente real es su aprobación visual (ahora incluye revisar el álbum nuevo).

## 2. Estado exacto

| Qué | Valor |
|---|---|
| Rama | `redesign-ritual` (remota sincronizada: local = origin) |
| Respaldo remoto | **Push 25-sep** `431c355..da8ea11` a `origin/redesign-ritual` (fast-forward). `origin/main` intacta en `02783cb`. **CI no corre en esta rama** (`ci.yml` solo en push/PR a `main`): la verificación (tests 16/16 + `verify_versions` + `build_variants --check`) es gate local del worktree |
| Versión de caché en la rama | **v42** (v40 QA gate → v41 visor de variantes + fotos Rosa/Mini Corazones → v42 álbum completo con la sesión del 24-sep) |
| Últimos commits | `1d94c58` (visor de variantes: puntitos en el lightbox) · `6e61283` (fotos nuevas Rosa/Mini Corazones + v41) · `f1fbd3e`/`b63e1db` (QA gate v40) · `da8ea11` (álbum completo: 100 fotos, portada de grupo de primera, docs v42 — **en `origin` desde el 25-sep**) |
| Tests | 16/16 (incluye `variants.test.mjs`) · `verify_versions.py` OK (v42) · `build_variants.py --check` OK (22 productos, 76 variantes) |
| Lighthouse (22-sep, 4 corridas: túnel vs producción × móvil/desktop) | Performance **idéntica a producción: 92 móvil / 99 desktop** (CLS 0.003 vs 0.023 prod — el rediseño mejora; TBT ~0). SEO 69 y A11y 96 del preview son artefactos, no defectos (detalle en §5) |
| Base de la rama | **Sincronizada con main al `2f4091b`** (22 sep): incluye v35/v36/v37 (fusión cloud+local, persistencia de token, verificador en CI, purga 401), el workflow del bot v2 final (memoria + expiración 24h, sin apikey hardcodeada) y toda la documentación nueva. El desajuste v37-vs-v39 quedó resuelto y el bump a v40 ya se aplicó en la rama: el merge no necesita renombrar nada |
| Resolución del merge | `sw.js`/`manifest`/HTMLs/dashboard → main (solo diferían en `?v=`); `whatsapp-n8n-workflow.json` → main (v2 final, mata la apikey `AgenciaSecreta2026` de la rama); docs → combinados (hitos de ambas sesiones, v39 en la rama); PLAN → main |

## 3. Qué se hizo (resumen por sesión)

**Sesiones previas (14-21 sep, commits `b3d5ed0`…`85e3940`):**
- Rediseño integral ritualista: paleta beige-dorado-perl, tipografía Playfair/serif para títulos, iconos SVG minimalistas
- Nueva taxonomía de catálogo: chips `velas / melts / dijes-pulseras / franelas` (los wax melts salieron de "velas"; pulseras+collares+accesorios → "dijes y pulseras") — verificado: 22+3+12+7 = 44 productos, sin huérfanos
- Flujo n8n de WhatsApp con agentes humanos (`scripts/whatsapp-n8n-workflow.json`) — **deuda de seguridad pendiente, ver §6**
- QR de vinculación WhatsApp (`scripts/qr-vinculacion-whatsapp.png`)

**Sesión 21-sep (tarde):**
- Pedido del dueño: fondo global **#F3EDE4** beige crema cálido, "no grisáceo ni rosado", contraste perfecto, no tocar textos/tipografías/botones/estructura
- `93c2526` (v38): corregido degradado del manifiesto que terminaba en `#FAD4BC` (rosado); tokens de texto secundario `#D8D5D0` (gris ilegible 1.26:1 sobre beige, heredado del dashboard oscuro) → `#66584A` (5.90:1) y `#75684F` (4.69:1), ambos AA verificados por cálculo WCAG
- `e76e732` (v39): cabecera al hacer scroll usaba `rgba(250,212,188,.97)` = el mismo rosado; → `rgba(250,249,246,.97)` (blanco cálido de tarjetas)

**Sesión 24-sep (álbum de velas con la nueva sesión fotográfica):**
- Llegaron 123 fotos HEIC nuevas (iPhone, 3024px). Procesadas 100 al estándar del sitio (modo guía: producto centrado sobre fondo difuminado; thumbs 480 q78, catalog 900 q80)
- El dueño renombró las fotos con el nombre real del producto en `~/Imágenes/velas-guia-para-revisar/catalog/`; el pareo foto→producto se hizo por nombre (24 de 25 velas/melts; **Cruz con Paloma no tuvo foto nueva y conserva la anterior**)
- Portada de cada serie = **foto de grupo (todos los colores juntos)**: elegida por detector (conteo de objetos separados) y **corregible a ojo** por el dueño en `.image-review/series_check.html` (flujo clic→portada, sin overrides pendientes al momento del commit)
- Montaje: portada → `file` principal del producto; resto → `-v2, -v3…` en ambas carpetas (convención de `scripts/IMAGE_GUIDE.md`), con backups de las fotos anteriores en `~/Imágenes/velas-guia-para-revisar/backups/worktree-anterior/`
- `js/variants.json` regenerado con `scripts/build_variants.py`: **22 productos con álbum, 76 fotos extra**. El precache del SW incluye las miniaturas de variantes
- Bump v41→v42 + `imgVer` 10→11 (las imágenes comparten URL con las viejas) + prerender regenerado (44 tarjetas `?v=11`) + docs actualizados (README/AGENTS/IMAGE_GUIDE)
- Nota pendiente menor: 7 fotos de vela quedaron sin renombrar (#014, #099–105) y 17 fotos de pulseras/collares (#107–123) aún no se mapean a sus productos

**Sesión 22-sep (QA gate):**
- `9d9043f` + `ce66d33`: sync con main y **restauración del `index.html` prerenderizado del rediseño** (el sync lo había pisado por un error de resolución — detectado en QA visual por los chips de la taxonomía vieja)
- `b63e1db` (v40): **contraste AA real del dorado** — los títulos `#C9A878` medían 1.93:1 sobre crema (falla WCAG incluso para texto grande) → `--gold-matte: #7A6134` (4.83–5.56:1 en las tres superficies, cubre los `<em>` de 20px) y `--accent` recupera el ámbar canónico pre-rediseño `#854f19` (5.77:1; botones con blanco 6.60:1, Lighthouse 100 documentado); `--text-faint` → `#71654B` (surface 4.72:1); **responsive móvil**: los grids de manifiesto/pilares/rituales quedaban a 3 columnas fijas (overflow de 173px a 375px) → 1 columna ≤900px, scrollW 370 < vw 375 verificado en DOM

## 4. Cómo verificarlo tú mismo

```bash
git fetch origin && git worktree add /tmp/redesign-review origin/redesign-ritual
cd /tmp/redesign-review && npm test                      # 16/16
# alternativa sin worktree: clonar la rama ya respaldada
#   git clone -b redesign-ritual https://github.com/juancito8812/yosoy222.git
python3 scripts/verify_versions.py                       # OK (v42)
python3 scripts/build_variants.py --check                # OK (22 productos, 76 variantes)
python3 -m http.server 8092 --bind 0.0.0.0               # y abrir el navegador
```

Flujos verificados E2E (22-sep, v40): filtros 22/3/12/7 = 44 exactos · búsqueda + empty state + clear ✓ · carrito → drawer → checkout wa.me/584126481628 (total y línea correctos) ✓ · lightbox ✓ · menú móvil ✓ · 21 pares color/fondo auditados AA con alfa compuesto (única excepción: botón WhatsApp verde, decisión de marca preexistente) · consola limpia (solo CORS esperado del Edge de telemetría desde localhost) · `addToCart` sigue resolviendo precio desde `products[]` (SEC-01) ✓ · fixes offline v34 presentes.

Flujos verificados E2E (24-sep, v42): lightbox de Buda abre con 6 puntos de variantes ✓ · clic en un punto cambia la imagen grande (`-v4` verificado) ✓ · dots activos con estado y teclado ←→ ✓ · 139 thumbs / 136 catalog en disco, 0 imágenes rotas en las verificaciones del navegador ✓ · `variants.json` servido con 22 productos ✓ · tests 16/16 + `verify_versions` + `build_variants --check` en verde.

## 5. Pendientes para continuar (orden sugerido)

1. ~~Barrido anti-rosado completo~~ **HECHO (22-sep):** grep estático limpio + barrido computado de backgrounds en las 14 secciones del DOM (0 residuos; el detector habría cazado `#FAD4BC`)
2. ~~QA gate de la skill `cloudflare-preview-gate`~~ **HECHO (22-sep):** tests 13/13 + `verify_versions` + `verify_icons` + consola limpia + 0 secretos en el diff
3. ~~Asegurar la apikey n8n~~ **RESUELTA (22 sep):** workflow v2 final sin secretos (todo vía `$env.*` en n8n)
4. ~~Auditoría móvil (375px)~~ **HECHA (22-sep):** overflow detectado y corregido (grids 3-col → 1-col ≤900px); smoke completo en viewport 375×812
5. ~~Sync con main~~ **HECHO (22-sep):** merge `9d9043f` + restauración `ce66d33`
6. ~~Decisión de versión post-merge~~ **RESUELTA:** la rama ya va **v42** — el merge puede mantener v42 sin renombrar
7. **Pulseras y collares (nueva sesión, 24-sep):** 17 fotos (#107–123) sin mapear a sus 11 productos — usar el mismo flujo: renombrar → pareo → montaje como variantes
8. **7 fotos de velas sin renombrar** (#014, #099–105): quedaron fuera del álbum; revisar si alguna es mejor toma o foto de grupo de alguna serie
9. **Revisar portadas del álbum con el cliente:** `series_check.html` permite corregir a ojo la foto de grupo elegida por el detector (clic = portada)

**Único pendiente real para el merge: aprobación visual del dueño (ahora incluye revisar el álbum de variantes).** Preview para el cliente en §7. Al merge: verificar que main no haya recibido commits nuevos desde `2f4091b` y re-ejecutar el QA rápido (tests + verify_versions + build_variants --check).

**Auditoría Lighthouse comparativa (22-sep, 4 corridas — reportes en `/tmp/lh/`, efímeros):** preview del túnel vs producción, móvil + desktop. Performance **92/99 idéntica** (FCP/LCP 2.7s en ambos; CLS 0.003 vs 0.023 a favor del rediseño; TTI 4.3s vs 5.9s). Las dos brechas de score del preview son artefactos, no defectos: **SEO 69** = cabecera `X-Robots-Tag: none` que Cloudflare inyecta a TODOS los túneles trycloudflare (noindex del entorno; al merge el SEO vuelve a 100); **A11y 96** = el botón WhatsApp (verde + texto blanco, 1.98:1), defecto latente idéntico en producción que ahí Lighthouse nunca evaluó (botón oculto en carga inicial; el CTA grande de contacto es nuevo del rediseño). Best Practices 96 vs 92 a favor del preview (producción suma el error del anti-bots de Cloudflare). Conclusión: **nada en la auditoría se opone al merge**; si algún día se quiere A11y 100 con evidencia, oscurecer el texto del botón WhatsApp.

## 6. Deudas de seguridad de la rama

- ~~`AgenciaSecreta2026` (apikey n8n)~~ RESUELTA 22-sep: el JSON del repo ya no lleva secretos (v2 final vía `$env.*`); rotar la clave en el panel de n8n solo si se reutiliza en otro lado
- El PAT de GitHub usado en la sesión (`github_pat_11BC6…`) quedó expuesto en chat: **el dueño debe revocarlo** en github.com/settings/personal-access-tokens cuando la sesión de trabajo termine

## 7. Infra de preview (efímera, recreable)

- **Preview permanente `preview.yosoy222.com` (debianm700):** **espejo en v42 PERO con las portadas ANTERIORES a la corrección del dueño** (sincronizado antes de `1c87a58`, `imgVer` 11): al volver internet hay que **re-sincronizar el espejo** (tar desde el worktree + recrear el contenedor `previewer`) para que sirva las portadas corregidas y `imgVer` 12. Backup del v40 en `~/yosoy222-preview/site-backup-v40`. Reparado también el crash-loop del conector: la imagen cloudflared corre como uid 65532 y el token era 600 del uid 1000 → `chgrp 65532 + chmod 640` (vía contenedor alpine, sin sudo). **PENDIENTE: caída de internet en debianm700 desde la mañana del 25-sep** (gateway LAN responde pero sin salida WAN) — mientras dure, el túnel no registra y **el bot de WhatsApp (Baileys/n8n) también está sin salida**; al volver internet, `restart: always` reconecta el túnel solo. Actualizarlo tras cambios futuros: recrear el espejo con tar (excluir `.git`, `.agents`, `BRANCH_STATUS.md`, `PLAN_IMPLEMENTACION.md`, `tests`, `scripts`, `supabase`, `package*.json`) hacia `~/yosoy222-preview/site/` y **recrear el contenedor `previewer`** (`docker compose up -d --force-recreate previewer` — el bind mount queda anclado al inodo viejo si solo se renombra la carpeta)
- **Preview efímero de respaldo (25-sep):** worktree real `~/Documentos/programacion/yosoy222-redesign` con `python3 -m http.server 8123 --bind 127.0.0.1` + túnel `~/.local/bin/cloudflared tunnel --url http://localhost:8123` (URL trycloudflare en `/tmp/tunel-preview.log`; **cambia al reiniciar el túnel** — las URLs trycloudflare mueren solas tras horas; regenerar con `pkill -x cloudflared` + relanzamiento). Verificado E2E por el túnel: 44 tarjetas `?v=11`, álbum navegable en el lightbox, imágenes 480/900px OK
- Skill `cloudflare-preview-gate` instalada en `~/.agents/skills/` con workflow completo (túnel + template cliente + QA + cleanup)
- `cloudflared` 2026.5.0 en `~/.local/bin/`

## 8. Convenciones que hay que respetar en esta rama

- Cada cambio de CSS/JS que el SW precachea → **bump de versión de caché** (sw.js + script tags + manifest + docs, `verify_versions.py` lo valida)
- El dueño trabaja y decide en español; commits descriptivos con el porqué
- `prerender_catalog.py` si se toca `products[]` en `js/app.js` (los chips del catálogo viven en `index.html` prerenderizado)
- El dueño aprueba visualmente antes de mergear: mostrar preview, no describir
