#!/usr/bin/env python3
"""
scripts/lighthouse_check.py
Valida un reporte JSON de Lighthouse contra los umbrales del baseline
(LIGHTHOUSE_BASELINE.md). Uso:

    python3 scripts/lighthouse_check.py <reporte.json>

Exit 0 si todas las categorías cumplen; exit 1 (y diff de las caídas) si no.
Umbrales con margen por debajo del baseline v47 (97/100/93/92) para absorber
la varianza de runners de CI, pero suficientes para atrapar regresiones reales.
"""

import json
import sys

# Categoría -> (umbral, baseline v47 documentado)
THRESHOLDS = {
    "performance": (90, 97),
    "accessibility": (95, 100),
    "best-practices": (85, 93),
    "seo": (85, 92),
}


def main() -> int:
    if len(sys.argv) != 2:
        print(f"Uso: {sys.argv[0]} <reporte-lighthouse.json>", file=sys.stderr)
        return 2

    try:
        with open(sys.argv[1], encoding="utf-8") as f:
            report = json.load(f)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"ERROR: no se pudo leer el reporte: {exc}", file=sys.stderr)
        return 2

    categories = report.get("categories", {})
    if not categories:
        print("ERROR: el reporte no contiene categorías de Lighthouse", file=sys.stderr)
        return 2

    fallos = []
    print(f"{'categoría':16} {'score':>6} {'umbral':>7} {'baseline':>9}  estado")
    for name, (umbral, baseline) in THRESHOLDS.items():
        cat = categories.get(name)
        if cat is None or cat.get("score") is None:
            print(f"{name:16} {'—':>6} {umbral:>7} {baseline:>9}  AUSENTE (ok)")
            continue
        score = round(cat["score"] * 100)
        estado = "OK" if score >= umbral else "REGRESION"
        print(f"{name:16} {score:>6} {umbral:>7} {baseline:>9}  {estado}")
        if score < umbral:
            fallos.append((name, score, umbral, baseline))

    if fallos:
        print("\n== REGRESIONES DETECTADAS ==")
        for name, score, umbral, baseline in fallos:
            delta_baseline = score - baseline
            linea = (
                f"- {name}: {score} < umbral {umbral} "
                f"(baseline v47: {baseline}, delta {delta_baseline:+d})"
            )
            print(linea)
            # Annotation visible en la UI/API de Actions sin necesidad de logs
            print(f"::error::Lighthouse {name}: {score} < umbral {umbral} (baseline {baseline}, delta {delta_baseline:+d})")
        print(
            "\nRevisa LIGHTHOUSE_BASELINE.md para el contexto y los hallazgos aceptados."
        )
        return 1

    print("\nOK: todas las categorías cumplen los umbrales del baseline.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
