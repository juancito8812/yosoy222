# 🌿 Estado de la rama `redesign-ritual` — Handoff para agentes

> **Documento de trabajo de la rama.** Si estás retomando el trabajo del rediseño, empieza aquí.
> Última actualización: **22 de septiembre de 2026** (sincronización con main).

---

## 1. Dónde estamos (una frase)

Rediseño integral ritualista (paleta beige-dorado, tipografía serif, taxonomía de productos nueva) en la rama `redesign-ritual`, **v39, sincronizada con main al 22-sep (merge `9d9043f`: bot v2 final + docs + v35-v37), NO mergeado a main** — el dueño quiere mergear solo cuando esté 100% listo y lo autorice explícitamente.

## 2. Estado exacto

| Qué | Valor |
|---|---|
| Rama | `redesign-ritual` (remota sincronizada: local = origin) |
| Versión de caché en la rama | **v39** |
| Últimos commits | `9d9043f` (sync con main 22-sep) · `e76e732` (cabecera scroll sin rosado) · `93c2526` (fondo #F3EDE4 + contraste AA) |
| Tests | 13/13 · `verify_versions.py` OK (v39 coherente en la rama) |
| Base de la rama | **Sincronizada con main al `2f4091b`** (22 sep): incluye v35/v36/v37 (fusión cloud+local, persistencia de token, verificador en CI, purga 401), el workflow del bot v2 final (memoria + expiración 24h, sin apikey hardcodeada) y toda la documentación nueva. El desajuste v37-vs-v39 quedó resuelto: la rama documenta su v39 y main la suya; al merge futuro se recomienda renombrar la versión final a v40 |
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

## 4. Cómo verificarlo tú mismo

```bash
git fetch origin && git worktree add /tmp/redesign-review origin/redesign-ritual
cd /tmp/redesign-review && npm test                      # 13/13
python3 scripts/verify_versions.py                       # OK (v39)
python3 -m http.server 8092 --bind 0.0.0.0               # y abrir el navegador
```

Flujos ya verificados E2E (21-sep): filtros nuevos suman 44/44 exactos · carrito → drawer → checkout wa.me/584126481628 ✓ · lightbox 1/44 con fallback v34 intacto · `addToCart` sigue resolviendo precio desde `products[]` (SEC-01) ✓ · fixes offline v34 presentes (5 matches).

## 5. Pendientes para continuar (orden sugerido)

1. **Barrido anti-rosado completo:** grep de `FAD4BC|250,212,188|rosado|durazno` en css + screenshots de todas las secciones (hero ✓, manifiesto ✓, cabecera ✓, catálogo ✓ — faltan rituales, cómo-comprar, nosotros, contacto y footer)
2. **QA gate de la skill `cloudflare-preview-gate`** (instalada en `~/.agents/skills/`): tests + verificadores + consola limpia + sin secretos en el diff → solo entonces hablar de merge
3. ~~**Asegurar la apikey n8n**~~ **RESUELTA (22 sep):** el sync con main trajo el workflow v2 final sin ninguna apikey hardcodeada (todo vía `$env.*` en n8n). Rotar la clave `AgenciaSecreta2026` en el panel de n8n si se usó en algún otro lugar (ya no existe en el repo)
4. **Auditoría móvil (375px):** el dueño navega por móvil; el hero y el carrito se vieron bien pero falta pase sistemático
5. **Sync con main:** main va v37 y trae 4 commits que la rama no tiene (dashboard v35/v36/v37: fusión cloud+local, persistencia de token cloud, verificador en CI, purga del 401). Al mergear: resolver choques de `verify_versions` (la rama documentará v39+), y replantear los script tags de `index.html` (la rama los reescribió)
6. **Decisión de versión de caché post-merge:** recomendado saltar a v40 en el commit de merge para que la numeración sea monótona en ambos linajes

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
