# Baseline de Lighthouse — Producción YoSoy222

> Registro oficial de rendimiento para detectar regresiones. Actualizado el 27 de septiembre de 2026 tras el despliegue de **v47**.

## Números de referencia (v47)

Medidos contra `https://yosoy222.com/` con Lighthouse 12 (Chrome headless), producción real sirviendo `yosoy222-v47`.

### Categorías

| Categoría | Móvil | Desktop |
|---|---|---|
| Performance | **97** | **99** |
| Accessibility | **100** | **100** |
| Best Practices | 93 | 93 |
| SEO | 92 | 92 |

### Métricas clave

| Métrica | Móvil | Desktop |
|---|---|---|
| LCP | 2563 ms | 853 ms |
| TBT | **0 ms** | **0 ms** |
| CLS | 0.0035 | 0.0065 |

Contexto del elemento LCP móvil: `images/thumbs/hero-rosas-3.jpg` (hero, precacheada por el SW).

## Evolución reciente

| Versión | Perf móvil | A11y | BP móvil | Nota |
|---|---|---|---|---|
| v38 (producción pre-rediseño) | — | ~96 | ~92 | Referencia previa al rediseño |
| v45 (merge del rediseño) | 95–96 | 96 | 89 | Contraste botón WA 1.98:1, textos <12px |
| **v47 (actual)** | **97** | **100** | **93** | Contraste AAA (#075E36) + textos ≥12px |

El salto de Accessibility 96→100 vino de dos correcciones: icono del botón
WhatsApp en `#075E36` (7.88:1 AAA) y todos los textos a ≥12px (`d49ba51`).

## Hallazgos aceptados (no corregibles, documentados)

1. **Script anti-bots de Cloudflare (`__CF$cvParams`)** — viola la CSP y genera
   1 error de consola en producción. Decisión del dueño (AGENTS.md, regla 8):
   aceptarlo; rota por request, incompatible con hashes, y `unsafe-inline`
   destruiría la protección XSS. No aparece en auditorías locales.
2. **`robots.txt` línea `Content-Signal`** — directiva legítima de señales de
   contenido para IA que Lighthouse marca como "unknown". Los rastreadores la
   ignoran si no la soportan; las directivas estándar están intactas.

## Lighthouse en CI

El workflow `ci.yml` incluye el job `lighthouse`: sirve el repo con
`http.server`, audita con Lighthouse 12 (móvil) y valida con
`scripts/lighthouse_check.py` contra estos umbrales:

| Categoría | Umbral CI |
|---|---|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 85 |
| SEO | ≥ 85 |

Los umbrales dejan margen por debajo del baseline actual (97/100/93/92) para
absorber varianza de runners, pero fallan ante regresiones reales (un salto de
imágenes sin `width/height`, un script pesado, un meta roto).

## Cómo re-auditar manualmente

```bash
# Producción (comparar contra este documento)
npx -y lighthouse@12 "https://yosoy222.com/" --quiet \
  --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage" \
  --output=json --output-path=/tmp/lh.json \
  --only-categories=performance,seo,accessibility,best-practices
python3 scripts/lighthouse_check.py /tmp/lh.json

# Con preset desktop añadir: --preset=desktop
```
