#!/usr/bin/env bash
# ============================================================
# YoSoy222 — Aplicar el fix RLS vía Management API de Supabase
#
# Ejecuta scripts/supabase_rls.sql contra tu proyecto SIN abrir
# el SQL Editor, usando un token personal de acceso (PAT).
#
# Uso:
#   1. Crea el token en https://supabase.com/dashboard/account/tokens
#      (Generate new token — se muestra una sola vez).
#   2. Ejecuta:
#        SUPABASE_PAT="sbp_xxx..." bash scripts/apply_rls.sh
#
# El token NUNCA se guarda en el repo (solo se usa en esta ejecución).
# Requiere el project ref correcto: gkekolsttfbiegyhvejy
# ============================================================
set -euo pipefail

PROJECT_REF="gkekolsttfbiegyhvejy"
API="https://api.supabase.com"
SQL_FILE="$(cd "$(dirname "$0")" && pwd)/supabase_rls.sql"

if [[ -z "${SUPABASE_PAT:-}" ]]; then
  echo "ERROR: exporta SUPABASE_PAT con tu personal access token:"
  echo '  SUPABASE_PAT="sbp_..." bash scripts/apply_rls.sh'
  echo "Token: https://supabase.com/dashboard/account/tokens"
  exit 1
fi

if [[ ! -f "$SQL_FILE" ]]; then
  echo "ERROR: no encuentro $SQL_FILE"
  exit 1
fi

echo "== Ejecutando el fix RLS en el proyecto $PROJECT_REF =="
# Extrae solo el SQL real (sin comentarios) para la ejecución remota
SQL_PAYLOAD=$(grep -v '^\s*--' "$SQL_FILE" | sed '/^\s*$/d')

HTTP_CODE=$(curl -s -o /tmp/rls_response.json -w "%{http_code}" \
  -X POST "$API/v1/projects/$PROJECT_REF/database/query" \
  -H "Authorization: Bearer $SUPABASE_PAT" \
  -H "Content-Type: application/json" \
  -d "$(python3 -c 'import json,sys; print(json.dumps({"query": sys.stdin.read()}))' <<<"$SQL_PAYLOAD")")

echo "HTTP $HTTP_CODE"
cat /tmp/rls_response.json | head -c 500
echo ""

if [[ "$HTTP_CODE" == "200" ]]; then
  echo "== OK: SQL ejecutado. Verificando políticas resultantes =="
  curl -s -X POST "$API/v1/projects/$PROJECT_REF/database/query" \
    -H "Authorization: Bearer $SUPABASE_PAT" \
    -H "Content-Type: application/json" \
    -d '{"query": "select policyname, cmd, roles from pg_policies where schemaname='"'"'public'"'"' and tablename='"'"'yosoy222_events'"'"'"}'
  echo ""
  echo "Siguiente paso: correr los sondeos de verificación (SELECT anon debe devolver [])."
else
  echo "== FALLO: revisa la respuesta de arriba =="
  echo "Causas comunes: token sin permisos para este proyecto, o project ref equivocado."
  exit 1
fi
