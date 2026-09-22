# 🌿 Estado de la rama `redesign-ritual` — Handoff para agentes

> **Documento de trabajo de la rama.** Si estás retomando el trabajo del rediseño, empieza aquí.
> Última actualización: **22 de septiembre de 2026** (sincronización con main + QA gate completo + auditoría Lighthouse comparativa).

---

## 1. Dónde estamos (una frase)

Rediseño integral ritualista (paleta beige-dorado, tipografía serif, taxonomía de productos nueva) en la rama `redesign-ritual`, **v40, sincronizada con main al 22-sep (merge `9d9043f`: bot v2 final + docs + v35-v37) y con el QA gate completo aprobado, NO mergeado a main** — el dueño quiere mergear solo cuando lo autorice explícitamente; el único pendiente real es su aprobación visual.

## 2. Estado exacto

| Qué | Valor |
|---|---|
| Rama | `redesign-ritual` (remota sincronizada: local = origin) |
| Versión de caché en la rama | **v40** (bump hecho en la rama antes del merge: numeración monótona main 37 → rama 40) |
| Últimos commits | `f1fbd3e` (handoff QA actualizado) · `b63e1db` (QA: contraste AA + responsive móvil + v40) · `ce66d33` (restaurar prerender pisado en el sync) · `9d9043f` (sync con main) |
| Tests | 13/13 · `verify_versions.py` OK (v40) · `verify_icons.py` OK |
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

**Sesión 22-sep (QA gate):**
- `9d9043f` + `ce66d33`: sync con main y **restauración del `index.html` prerenderizado del rediseño** (el sync lo había pisado por un error de resolución — detectado en QA visual por los chips de la taxonomía vieja)
- `b63e1db` (v40): **contraste AA real del dorado** — los títulos `#C9A878` medían 1.93:1 sobre crema (falla WCAG incluso para texto grande) → `--gold-matte: #7A6134` (4.83–5.56:1 en las tres superficies, cubre los `<em>` de 20px) y `--accent` recupera el ámbar canónico pre-rediseño `#854f19` (5.77:1; botones con blanco 6.60:1, Lighthouse 100 documentado); `--text-faint` → `#71654B` (surface 4.72:1); **responsive móvil**: los grids de manifiesto/pilares/rituales quedaban a 3 columnas fijas (overflow de 173px a 375px) → 1 columna ≤900px, scrollW 370 < vw 375 verificado en DOM

## 4. Cómo verificarlo tú mismo

```bash
git fetch origin && git worktree add /tmp/redesign-review origin/redesign-ritual
cd /tmp/redesign-review && npm test                      # 13/13
python3 scripts/verify_versions.py                       # OK (v40)
python3 -m http.server 8092 --bind 0.0.0.0               # y abrir el navegador
```

Flujos verificados E2E (22-sep, v40): filtros 22/3/12/7 = 44 exactos · búsqueda + empty state + clear ✓ · carrito → drawer → checkout wa.me/584126481628 (total y línea correctos) ✓ · lightbox ✓ · menú móvil ✓ · 21 pares color/fondo auditados AA con alfa compuesto (única excepción: botón WhatsApp verde, decisión de marca preexistente) · consola limpia (solo CORS esperado del Edge de telemetría desde localhost) · `addToCart` sigue resolviendo precio desde `products[]` (SEC-01) ✓ · fixes offline v34 presentes.

## 5. Pendientes para continuar (orden sugerido)

1. ~~Barrido anti-rosado completo~~ **HECHO (22-sep):** grep estático limpio + barrido computado de backgrounds en las 14 secciones del DOM (0 residuos; el detector habría cazado `#FAD4BC`)
2. ~~QA gate de la skill `cloudflare-preview-gate`~~ **HECHO (22-sep):** tests 13/13 + `verify_versions` + `verify_icons` + consola limpia + 0 secretos en el diff
3. ~~Asegurar la apikey n8n~~ **RESUELTA (22 sep):** workflow v2 final sin secretos (todo vía `$env.*` en n8n)
4. ~~Auditoría móvil (375px)~~ **HECHA (22-sep):** overflow detectado y corregido (grids 3-col → 1-col ≤900px); smoke completo en viewport 375×812
5. ~~Sync con main~~ **HECHO (22-sep):** merge `9d9043f` + restauración `ce66d33`
6. ~~Decisión de versión post-merge~~ **RESUELTA:** la rama ya va **v40** — el merge puede mantener v40 sin renombrar

**Único pendiente real: aprobación visual del dueño.** Preview para el cliente en §7. Al merge: verificar que main no haya recibido commits nuevos desde `2f4091b` y re-ejecutar el QA rápido (tests + verify_versions).

**Auditoría Lighthouse comparativa (22-sep, 4 corridas — reportes en `/tmp/lh/`, efímeros):** preview del túnel vs producción, móvil + desktop. Performance **92/99 idéntica** (FCP/LCP 2.7s en ambos; CLS 0.003 vs 0.023 a favor del rediseño; TTI 4.3s vs 5.9s). Las dos brechas de score del preview son artefactos, no defectos: **SEO 69** = cabecera `X-Robots-Tag: none` que Cloudflare inyecta a TODOS los túneles trycloudflare (noindex del entorno; al merge el SEO vuelve a 100); **A11y 96** = el botón WhatsApp (verde + texto blanco, 1.98:1), defecto latente idéntico en producción que ahí Lighthouse nunca evaluó (botón oculto en carga inicial; el CTA grande de contacto es nuevo del rediseño). Best Practices 96 vs 92 a favor del preview (producción suma el error del anti-bots de Cloudflare). Conclusión: **nada en la auditoría se opone al merge**; si algún día se quiere A11y 100 con evidencia, oscurecer el texto del botón WhatsApp.

## 6. Deudas de seguridad de la rama

- ~~`AgenciaSecreta2026` (apikey n8n)~~ RESUELTA 22-sep: el JSON del repo ya no lleva secretos (v2 final vía `$env.*`); rotar la clave en el panel de n8n solo si se reutiliza en otro lado
- El PAT de GitHub usado en la sesión (`github_pat_11BC6…`) quedó expuesto en chat: **el dueño debe revocarlo** en github.com/settings/personal-access-tokens cuando la sesión de trabajo termine

## 7. Infra de preview (efímera, recreable)

- Skill `cloudflare-preview-gate` instalada en `~/.agents/skills/` con workflow completo (túnel + template cliente + QA + cleanup)
- `cloudflared` 2026.5.0 en `~/.local/bin/`
- Recrear preview: `cd /tmp/redesign-review && nohup setsid python3 -m http.server 8092 --bind 0.0.0.0 &` y `~/.local/bin/cloudflared tunnel --url http://localhost:8092` → URL trycloudflare en el log `/tmp/tunel-preview.log`
- Alternativa privada del dueño: Tailscale `http://<ip-tailnet>:8092` (la IP era 100.74.11.61; verificar con `tailscale ip -4`)

## 8. Convenciones que hay que respetar en esta rama

- Cada cambio de CSS/JS que el SW precachea → **bump de versión de caché** (sw.js + script tags + manifest + docs, `verify_versions.py` lo valida)
- El dueño trabaja y decide en español; commits descriptivos con el porqué
- `prerender_catalog.py` si se toca `products[]` en `js/app.js` (los chips del catálogo viven en `index.html` prerenderizado)
- El dueño aprueba visualmente antes de mergear: mostrar preview, no describir
