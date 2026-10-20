-- ============================================================================
-- 2026-10-30 — Grants por defecto para TABLAS NUEVAS del schema public
-- Proyecto: YoSoy222 (gkekolsttfbiegyhvejy)
--
-- Contexto: Supabase deja de otorgar acceso automático por Data API
-- (PostgREST / supabase-js / GraphQL) a las tablas creadas en `public` a partir
-- del 30 de octubre de 2026. Las tablas existentes conservan sus permisos; las
-- nuevas nacen SIN grants y el cliente recibe:
--     42501  permission denied for table <tabla>   (HTTP 403)
-- incluso con la RLS abierta.
--
-- Este proyecto NO tiene carpeta de migraciones: las tablas se crean desde el
-- SQL Editor del dashboard. Ejecutar este script UNA vez en el SQL Editor de
-- producción y volver a ejecutarlo tras cualquier `create table` nuevo (es
-- idempotente y solo afecta a objetos futuros, no toca los existentes).
--
-- Criterio de este proyecto: la BD es 100% service_role-only desde el 20 sep
-- 2026 (ver supabase/README.md). Por eso los grants por defecto van SOLO a
-- service_role: anon y authenticated no deben poder tocar una tabla nueva ni
-- por error. Si alguna tabla futura necesita lectura pública, se otorga
-- explícitamente en su propio script (bloque comentado al final).
--
-- ⚠️ GRANT ≠ RLS. Sin GRANT → 403 para todos. Con GRANT y RLS cerrada → 0 filas.
--   Toda tabla nueva sigue necesitando: alter table ... enable row level security;
-- ============================================================================

alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to service_role;

alter default privileges for role postgres in schema public
  grant usage, select on sequences to service_role;

alter default privileges for role postgres in schema public
  grant execute on functions to service_role;

-- Endurecimiento: que un default privileges heredado no deje a anon/authenticated
-- con acceso a tablas nuevas.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Verificación (solo lectura). Debe devolver 0 filas.
-- Cualquier tabla listada es inaccesible por Data API para service_role.
-- ---------------------------------------------------------------------------
do $$
declare
  faltantes text;
begin
  select string_agg(c.relname, ', ') into faltantes
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
    and not exists (
      select 1 from information_schema.role_table_grants g
      where g.table_schema = 'public'
        and g.table_name = c.relname
        and g.grantee = 'service_role'
        and g.privilege_type = 'SELECT'
    );

  if faltantes is not null then
    raise warning 'Tablas sin GRANT SELECT para service_role: %', faltantes;
  else
    raise notice 'OK: todas las tablas de public tienen GRANT SELECT para service_role.';
  end if;
end $$;

-- ============================================================================
-- PLANTILLA para tablas nuevas (copiar en el script/issue de la tabla)
-- ============================================================================
-- create table public.<tabla> (...);
--
-- alter table public.<tabla> enable row level security;
--
-- grant select, insert, update, delete on public.<tabla> to service_role;
-- revoke all on public.<tabla> from anon, authenticated;
-- revoke truncate, references, trigger on public.<tabla> from anon, authenticated;
--
-- -- Solo si la tabla debe ser legible/escrita por clientes (caso raro aquí):
-- -- grant select on public.<tabla> to anon;
-- -- create policy "<tabla>_select_publica" on public.<tabla>
-- --   for select to anon using (true);
-- ============================================================================
