# Baseline de Lighthouse — Producción YoSoy222

> Registro oficial de rendimiento para detectar regresiones. Actualizado el 27 de septiembre de 2026 tras el despliegue de **v47**.

## Números de referencia (v48)

Medidos contra `https://yosoy222.com/` con Lighthouse 12 (Chrome headless), producción real sirviendo `yosoy222-v48` (scripts del head a `defer`).

Medidos contra `https://yosoy222.com/` con Lighthouse 12 (Chrome headless), producción real sirviendo `yosoy222-v47`.

### Categorías

| Categoría | Móvil | Desktop |
|---|---|---|
| Performance | **96–97** | **99** |
| Accessibility | **100** | **100** |
| Best Practices | 93 | 93 |
| SEO | 92 | 92 |

### Métricas clave

| Métrica | Móvil | Desktop |
|---|---|---|
| LCP | 2518–2764 ms | 853–1006 ms |
| TBT | **0 ms** | **0 ms** |
| CLS | 0.003–0.013 | 0.003–0.0065 |
| Main-thread (script eval) | 75–86 ms | — |

Contexto del elemento LCP móvil: `images/thumbs/hero-rosas-3.jpg` (hero, precacheada por el SW).

## Evolución reciente

| Versión | Perf móvil | A11y | BP móvil | Nota |
|---|---|---|---|---|
| v38 (producción pre-rediseño) | — | ~96 | ~92 | Referencia previa al rediseño |
| v45 (merge del rediseño) | 95–96 | 96 | 89 | Contraste botón WA 1.98:1, textos <12px |
| **v47** | **97** | **100** | **93** | Contraste AAA (#075E36) + textos ≥12px |
| **v48 (actual)** | **96–97** | **100** | **93** | Scripts del head a defer (sin render-blocking JS; eval de scripts 86→75 ms) |

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
`http.server`, audita con Lighthouse 12 (móvil, 3 reintentos ante fallos de
infraestructura) y valida con `scripts/lighthouse_check.py` contra estos
umbrales. El reporte JSON queda como artefacto del job y los fallos de umbral
emiten annotations `::error::` con el delta por categoría.

| Categoría | Umbral CI | Baseline producción |
|---|---|---|
| Performance | ≥ 75 | 96–97 |
| Accessibility | ≥ 95 | 100 |
| Best Practices | ≥ 85 | 93 |
| SEO | ≥ 85 | 92 |

**Por qué Performance usa 75 y no 90:** el runner de GitHub Actions audita sin
CDN, sin compresión (`http.server` no gzip) y con Chrome/npx fríos — su suelo
medido es ~79 aunque producción sostiene 96–97. El umbral de CI atrapa
regresiones catastróficas del build; la referencia fina es este baseline,
medido manualmente contra `yosoy222.com`. Accessibility/BP/SEO sí son
comparables entre entornos y usan umbrales ajustados.

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
