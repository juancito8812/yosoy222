-- ============================================================
-- Rate limit DURABLE para la Edge Function dashboard-stats
-- (aplicado y verificado el 20 sep 2026)
-- ============================================================
-- Problema: el rate limit en memoria (Map por isolate) no es
-- compartible entre isolates de Supabase — cada request puede
-- aterrizar en un worker distinto y el límite efectivo escala
-- con el número de isolates (verificado: 35 requests → 35×200).
--
-- Solución: buckets en Postgres con una RPC atómica.
--   * La RPC vive en `public` (PostgREST solo expone ese esquema)
--     como wrapper SECURITY DEFINER que opera sobre la tabla
--     privada. EXECUTE revocado a PUBLIC/anon/authenticated y
--     concedido solo a service_role.
--   * La tabla vive en el esquema `private` (no expuesta por REST,
--     404 para cualquier cliente).
--   * Limpieza automática con pg_cron cada 10 min (buckets > 1h).
--   * La Edge Function usa esta RPC como primaria; si la RPC no
--     responde, degrada al Map en memoria (fallback por-isolate).
-- ============================================================

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.rate_limit_buckets (
  bucket_key  text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count        integer NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key text,
  p_max int,
  p_window_seconds int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private
AS $$
DECLARE
  v_now    timestamptz := now();
  v_window interval    := make_interval(secs => p_window_seconds);
  v_count  int;
BEGIN
  -- Ventana fija atómica: si la ventana expiró, el contador reinicia en 1
  -- con window_start nuevo; si no, incrementa. Una sola instrucción = sin
  -- carreras entre requests concurrentes.
  INSERT INTO rate_limit_buckets (bucket_key, window_start, count, updated_at)
  VALUES (p_key, v_now, 1, v_now)
  ON CONFLICT (bucket_key) DO UPDATE
    SET count = CASE WHEN rate_limit_buckets.window_start + v_window <= v_now
                     THEN 1
                     ELSE rate_limit_buckets.count + 1 END,
        window_start = CASE WHEN rate_limit_buckets.window_start + v_window <= v_now
                            THEN v_now
                            ELSE rate_limit_buckets.window_start END,
        updated_at = v_now;

  SELECT count INTO v_count FROM rate_limit_buckets WHERE bucket_key = p_key;
  RETURN v_count <= p_max;   -- true = permitido, false = 429
END;
$$;

-- Aislamiento: solo service_role puede ejecutar la RPC
REVOKE ALL ON FUNCTION public.consume_rate_limit(text,int,int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text,int,int) TO service_role;

-- La tabla privada no es accesible por roles de cliente
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA private FROM anon, authenticated;

-- Limpieza automática: cada 10 min borra buckets con ventana expirada > 1h
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'cleanup_rate_limit_buckets';
SELECT cron.schedule(
  'cleanup_rate_limit_buckets',
  '*/10 * * * *',
  'DELETE FROM private.rate_limit_buckets WHERE window_start < now() - interval ''1 hour'''
);

-- ============================================================
-- Verificación aplicada (20 sep 2026):
--   * buckets crecen en BD: 5 tracks → {track:<ip>, count: 5}
--   * límite dispara de verdad: bucket en 5 + 40 requests →
--     25×200 y 15×429 (exacto al cálculo 30 − 5)
--   * anon en la RPC → 401 (EXECUTE solo service_role)
--   * anon en la tabla → 404 (esquema private no expuesto)
--   * limpieza de auditoría: TRUNCATE private.rate_limit_buckets
--     → siguiente request crea bucket nuevo en count=1
-- ============================================================
