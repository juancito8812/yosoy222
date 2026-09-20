# Supabase Edge Function: `dashboard-stats`

Lectura autenticada de la analítica global sin exponer la tabla a la clave anon.
Complemento del fix `scripts/supabase_rls.sql` (RLS insert-only).

## Arquitectura

```
dashboard.html ──1──▶ POST /functions/v1/dashboard-stats {action:"login", user, pass}
                       │  valida sha256(user:pass:salt) contra secret DASH_AUTH_HASH
                       │  rate limit 5/15min por IP · timingSafeEqual
                       ◀── { ok, token: "<exp>.<hmac>", expiresInMs: 7200000 }
dashboard.html ──2──▶ POST {action:"stats", user, token}
                       │  verifica HMAC (sin estado, 2h)
                       │  lee con SUPABASE_SERVICE_ROLE_KEY (nunca sale al cliente)
                       ◀── { ok, rows: [...] }
tienda (analytics.js) ──▶ POST {action:"track", event_type, ...}
                       │  whitelist de columnas + sanitización server-side
                       │  rate limit 30/min por IP — DURABLE: RPC
                       │  public.consume_rate_limit (service_role only) sobre
                       │  private.rate_limit_buckets; limpieza pg_cron cada 10 min;
                       │  fallback en memoria por-isolate si la RPC falla
                       ◀── { ok: true } | 429 rate_limited
```

La clave `service_role` vive **solo en los secrets de la función**. El navegador
recibe un token HMAC efímero, no credenciales de base de datos.

## Secrets requeridos (Dashboard → Edge Functions → dashboard-stats → Secrets)

| Secret | Valor | Cómo se genera |
|---|---|---|
| `DASH_AUTH_SALT` | cadena aleatoria ≥32 chars | `openssl rand -hex 32` |
| `DASH_AUTH_HASH` | `sha256("usuario:contraseña:" + DASH_AUTH_SALT)` en hex | ver comando abajo |
| `SESSION_SECRET` | cadena aleatoria ≥32 chars | `openssl rand -hex 32` |
| `SUPABASE_URL` | `https://gkekolsttfbiegyhvejy.supabase.co` | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | clave service_role | Project Settings → API (**NUNCA** en el repo) |
| `ALLOWED_ORIGINS` | opcional, separado por comas | p.ej. `http://localhost:8090` |

> `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` suelen estar ya inyectados por
> Supabase en las Edge Functions; confírmalo en el panel antes de crearlos.

### Generar DASH_AUTH_HASH

```bash
# 1. Genera el salt y guárdalo también en el secret DASH_AUTH_SALT
SALT=$(openssl rand -hex 32)
echo "SALT: $SALT"

# 2. Sustituye USUARIO y CONTRASEÑA por los del admin y calcula el hash
python3 -c "
import hashlib
print(hashlib.sha256('USUARIO:CONTRASEÑA:$SALT'.encode()).hexdigest())
"
# 3. Ese hex es DASH_AUTH_HASH
```

El formato es idéntico al que usa el cliente (`computeHash` en `js/dashboard.js`:
`usuario en minúsculas + ':' + contraseña + ':' + salt`).

## Deploy

```bash
# Autenticarse (una vez)
npx supabase login

# Vincular al proyecto (una vez)
npx supabase link --project-ref gkekolsttfbiegyhvejy

# Desplegar
npx supabase functions deploy dashboard-stats --project-ref gkekolsttfbiegyhvejy
```

## Smoke test (solo lectura salvo un login fallido intencional)

```bash
FN="https://gkekolsttfbiegyhvejy.supabase.co/functions/v1/dashboard-stats"

# 1. Login con credenciales MALAS → esperado 401 {"error":"bad_credentials"}
curl -s -X POST "$FN" -H "Content-Type: application/json" \
  -H "Origin: https://yosoy222.com" \
  -d '{"action":"login","user":"admin","pass":"incorrecta"}'

# 2. Login correcto → esperado {"ok":true,"token":"...","expiresInMs":7200000}
curl -s -X POST "$FN" -H "Content-Type: application/json" \
  -H "Origin: https://yosoy222.com" \
  -d '{"action":"login","user":"USUARIO","pass":"CONTRASEÑA"}'

# 3. Stats con el token → esperado {"ok":true,"rows":[...]}
curl -s -X POST "$FN" -H "Content-Type: application/json" \
  -H "Origin: https://yosoy222.com" \
  -d '{"action":"stats","user":"USUARIO","token":"TOKEN_DEL_PASO_2"}'
```

## Orden de activación recomendado (sin dejar la tienda sin dashboard)

1. Desplegar la función y pasar el smoke test (aún con la tabla expuesta, no pasa nada).
2. Aplicar `scripts/supabase_rls.sql` (RLS insert-only).
3. Confirmar que el dashboard lee vía función (pill "En Vivo (Supabase Cloud)").
4. Verificar con los sondeos de `scripts/supabase_rls.sql` que SELECT anon → `[]`.
5. Borrar del Table Editor las filas de auditoría `id=112` e `id=114`.

## Rotación de la clave anon (mitigación mientras RLS queda pendiente)

La clave anon actual está expuesta públicamente (repo + navegador) y mientras la
política SELECT siga abierta, cualquiera puede leer la tabla con ella. Rotarla
invalida la clave filtrada:

1. Dashboard de Supabase → Project Settings → API → **Rotate anon key**
   (advertencia: invalida la anterior al instante; hacer el paso 3 rápido).
2. Copiar la clave nueva y actualizar **solo** `js/config.js` → `SUPABASE_ANON`
   (es el único lugar donde vive: verificado con grep en todo el repo).
3. Deploy a GitHub Pages (push a `main`) — la web deja de enviar la clave vieja.
4. Verificar ingesta: abrir la tienda, generar un evento y confirmar HTTP 201 en
   la pestaña Network (o correr el sondeo INSERT de `scripts/supabase_rls.sql`).
5. La clave vieja debe fallar con `Invalid API key`:
   ```bash
   curl -s "https://gkekolsttfbiegyhvejy.supabase.co/rest/v1/yosoy222_events?select=id&limit=1" \
     -H "apikey: CLAVE_VIEJA"
   ```

Nota: rotar la anon NO cierra el agujero de lectura por sí sola (la nueva también
es pública); solo mata reutilización de la filtrada. El cierre real sigue siendo
aplicar `scripts/supabase_rls.sql`.

## Rotación (credenciales del dashboard)

- **Contraseña comprometida:** generar `DASH_AUTH_HASH` nuevo con la misma `DASH_AUTH_SALT`
  y actualizar el secret. Los tokens previos siguen válidos hasta expirar (máx 2h) porque
  el HMAC no depende del hash de login; para revocarlos al instante, rota `SESSION_SECRET`.
- **SESSION_SECRET rotado:** todas las sesiones activas mueren al instante (los tokens no verifican).
