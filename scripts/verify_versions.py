#!/usr/bin/env python3
"""
Verifica la coherencia de versiones de caché del sitio.

Comprueba:
- CACHE_NAME en sw.js (formato yosoy222-vN)
- start_url en manifest.json lleva la misma versión
- los <script src> locales de index.html y dashboard.html llevan ?v=N
  y que N no está más de 1 versión por detrás de la del SW
- PRECACHE_ASSETS de sw.js: cada asset local con ?v= existe en disco
  y usa la misma versión que CACHE_NAME (o está sin versionar)

Uso:
    python3 scripts/verify_versions.py
"""

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

VERSION_RE = re.compile(r"yosoy222-v(\d+)")
QUERY_RE = re.compile(r"\?v=(\d+)")


def fail(msg: str, problems: list) -> None:
    problems.append(msg)


def read_sw_text(problems: list) -> str | None:
    """Lee sw.js una vez; None si no existe o no tiene versión de caché."""
    sw_path = REPO_ROOT / "sw.js"
    if not sw_path.exists():
        fail("no existe sw.js", problems)
        return None
    text = sw_path.read_text(encoding="utf-8")
    if not VERSION_RE.search(text):
        fail("sw.js: no encuentro CACHE_NAME con formato yosoy222-vN", problems)
        return None
    return text


def check_manifest(sw_version: int, problems: list) -> None:
    manifest_path = REPO_ROOT / "manifest.json"
    if not manifest_path.exists():
        fail("no existe manifest.json", problems)
        return
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    start_url = manifest.get("start_url", "")
    m = QUERY_RE.search(start_url)
    if not m:
        fail(f"manifest.json: start_url sin ?v=N -> '{start_url}'", problems)
        return
    v = int(m.group(1))
    if v != sw_version:
        fail(f"manifest.json: start_url ?v={v} != SW v{sw_version}", problems)


def check_script_tags(sw_version: int, problems: list) -> None:
    tag_re = re.compile(r'<script[^>]+src="(js/[^"?]+(?:\?v=(\d+))?)"')
    for page in ("index.html", "dashboard.html"):
        path = REPO_ROOT / page
        if not path.exists():
            fail(f"no existe {page}", problems)
            continue
        html = path.read_text(encoding="utf-8")
        for src, qv in tag_re.findall(html):
            if not qv:
                fail(f"{page}: script '{src}' sin ?v=N", problems)
                continue
            v = int(qv)
            if v < sw_version - 1:
                fail(f"{page}: script '{src}' ?v={v} está >=2 versiones detrás del SW (v{sw_version})", problems)


def get_manifest_icon_versions() -> set:
    """Versiones ?v=N declaradas en los iconos de manifest.json."""
    try:
        manifest = json.loads((REPO_ROOT / "manifest.json").read_text(encoding="utf-8"))
        return {int(m.group(1)) for icon in manifest.get("icons", []) if (m := QUERY_RE.search(icon.get("src", "")))}
    except Exception:
        return set()


def check_precache_assets(sw_version: int, sw_text: str, icon_versions: set, problems: list) -> None:
    m = re.search(r"const PRECACHE_ASSETS = \[(.*?)\]", sw_text, re.S)
    if not m:
        fail("sw.js: no encuentro PRECACHE_ASSETS", problems)
        return
    assets = re.findall(r"'([^']+)'", m.group(1))
    for asset in assets:
        if asset in ("/", "/index.html", "/dashboard.html") or asset.startswith("/__"):
            continue
        clean = asset.split("?")[0].lstrip("/")
        file_path = REPO_ROOT / clean
        if not file_path.exists():
            fail(f"sw.js: precache '{asset}' no existe en disco", problems)
            continue
        qm = QUERY_RE.search(asset)
        if not qm:
            continue
        v = int(qm.group(1))
        # Los iconos se versionan por generación (junto a manifest.json), no por bump de caché
        if clean.startswith("icons/"):
            if v not in icon_versions:
                fail(f"sw.js: precache '{asset}' ?v={v} no coincide con la versión de iconos del manifest {sorted(icon_versions) or '(vacía)'}", problems)
        elif v != sw_version:
            fail(f"sw.js: precache '{asset}' ?v={qm.group(1)} != CACHE_NAME v{sw_version}", problems)


def check_docs(sw_version: int, problems: list) -> None:
    """Los docs no deben anunciar una versión de caché MAYOR que la del SW.
    Referencias a versiones menores son históricas (hitos del pasado) y son válidas."""
    for doc in ("README.md", "AGENTS.md"):
        path = REPO_ROOT / doc
        if not path.exists():
            continue
        for n in {int(m.group(1)) for m in VERSION_RE.finditer(path.read_text(encoding="utf-8"))}:
            if n > sw_version:
                fail(f"{doc}: menciona Cache v{n} pero el SW está en v{sw_version} (¿bump incompleto?)", problems)


def main() -> int:
    problems: list = []
    sw_text = read_sw_text(problems)
    sw_version = int(VERSION_RE.search(sw_text).group(1)) if sw_text else 0
    if sw_version:
        icon_versions = get_manifest_icon_versions()
        check_manifest(sw_version, problems)
        check_script_tags(sw_version, problems)
        check_precache_assets(sw_version, sw_text, icon_versions, problems)
        check_docs(sw_version, problems)

    print(f"Versión de caché del SW: yosoy222-v{sw_version}")
    if problems:
        print("problemas:")
        for p in problems:
            print(" -", p)
        return 1

    print("OK: versiones de caché coherentes (sw.js, manifest.json, script tags, precache, docs)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
