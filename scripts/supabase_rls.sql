-- ============================================================
-- YoSoy222 — Fix RLS para public.yosoy222_events
-- Auditoría 2026-09-20: RLS está ACTIVADO, pero existe una
-- política SELECT que expone TODA la tabla a la clave anon
-- (109+ eventos legibles públicamente) y una política INSERT
-- abierta (cualquiera puede inyectar filas).
-- UPDATE y DELETE ya están bloqueados (sin política) — no tocar.
--
-- CÓMO APLICAR:
--   Supabase Dashboard → SQL Editor → pegar todo → Run.
--
-- ✅ PASO 0 — DIAGNÓSTICO (ejecutar ANTES del fix si el primer intento no surgió efecto):
--   select current_database(), current_user, version();
--   → Si "current_database()" NO coincide con el proyecto gkekolsttfbiegyhvejy
--     (míralo en Project Settings → General → Reference Name), estás en el
--     proyecto equivocado: cambia de proyecto en el selector superior y reintenta.
--   select tablename, rowsecurity from pg_tables
--     where schemaname='public' and tablename='yosoy222_events';
--   → rowsecurity debe ser true; si es false, el fix no se llegó a aplicar aquí.
--
-- ⚠️ FALLOS COMUNES (verificados en el re-sondeo del 20/09/2026):
--   1. Proyecto equivocado: confirma que estás en el proyecto cuyo
--      project ref es gkekolsttfbiegyhvejy (Project Settings → General).
--      Si el SQL se corre en otro proyecto, esta tabla no se toca.
--   2. El editor ejecuta TODO como una transacción: si cualquier
--      sentencia falla, se revierte todo y no cambia nada. Revisa que
--      el panel de resultados diga "Success. No rows returned" sin errores.
--   3. Comprueba que aplicaste: SELECT vía anon debe devolver []
--      (ver más abajo).
--
-- EFECTO SECUNDARIO ESPERADO (no es un bug):
--   El dashboard (/dashboard.html) deja de poder leer la nube
--   con la clave anon y cae automáticamente a los datos locales
--   del navegador (fetchCloudData devuelve null → getLocalRawData).
--   Para recuperar la lectura global hace falta un path de
--   lectura autenticado (Edge Function con service_role o JWT
--   de usuario). Ver nota al final.
-- ============================================================

-- 1) Asegurar RLS activado (idempotente)
alter table public.yosoy222_events enable row level security;

-- 2) Eliminar TODAS las políticas actuales de la tabla.
--    (No dependemos del nombre: las descubrimos del catálogo.
--    Esto quita la SELECT permisiva y la INSERT abierta;
--    se vuelven a crear de forma mínima abajo.)
do $$
declare r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename  = 'yosoy222_events'
  loop
    execute format('drop policy if exists %I on public.yosoy222_events', r.policyname);
  end loop;
end $$;

-- 3) Política mínima de ingesta: anon SOLO puede INSERTAR.
--    Sin SELECT, UPDATE ni DELETE (la ausencia de política = denegado).
create policy "anon_insert_events"
  on public.yosoy222_events
  for insert
  to anon
  with check (true);

-- 4) (Opcional, recomendado) Cota anti-spam a nivel de columna:
--    impide INSERT con id/created_at suplantados.
--    Descomentar si la tabla lo permite:
-- alter table public.yosoy222_events alter column id set default nextval('yosoy222_events_id_seq'::regclass);

-- ============================================================
-- VERIFICACIÓN (ejecutar después del fix; también se puede
-- correr con curl desde fuera — comandos al final del archivo)
-- ============================================================
-- SELECT anónimo debe devolver 0 filas:
--   select count(*) from public.yosoy222_events;  -- vía anon → 0
--
-- Políticas resultantes esperadas:
--   select policyname, cmd, roles
--   from pg_policies
--   where schemaname='public' and tablename='yosoy222_events';
--   → 1 fila: anon_insert_events | INSERT | {anon}
--
-- Verificación desde shell (solo lectura):
--   curl -s "$SUPABASE_URL/rest/v1/yosoy222_events?select=id&limit=1" \
--     -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
--   → []  (antes devolvía las filas)
--
--   curl -s -o /dev/null -w "%{http_code} %{size_download}\n" -X POST \
--     "$SUPABASE_URL/rest/v1/yosoy222_events" \
--     -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
--     -H "Content-Type: application/json" \
--     -d '{"event_type":"audit_probe_fix","session_id":"s_audit_fix"}'
--   → 201 (la ingesta de la web sigue funcionando)
--
-- LIMPIEZA de la fila de prueba de la auditoría (id=112,
-- event_type='audit_probe'): borrarla desde el Table Editor
-- o con service_role (anon no puede DELETE, por diseño).
-- ============================================================
-- NOTA — lectura del dashboard después del fix:
--   Opción A (rápida): aceptar que el dashboard muestre solo
--   datos locales hasta implementar lectura autenticada.
--   Opción B (correcta): Supabase Edge Function con service_role
--   que valide una credencial de admin y sirva los agregados.
