#!/usr/bin/env python3
"""Watchdog del bot de WhatsApp YoSoy222 (yosoy222_bot en debianm700).

Cada pasada (cron cada 15 min) verifica y alerta a Telegram (topic 393
del grupo del proyecto) solo con novedades:

1. CONEXIÓN: la instancia Evolution `yosoy222_bot` sigue `open`.
2. MENSAJES SIN EJECUCIÓN: todo mensaje entrante del bot (Evolution
   Postgres, `fromMe=false`) debe tener una ejecución de n8n que arranque
   en los ~120s siguientes. Evolution persiste los mensajes en Postgres
   INDEPENDIENTEMENTE de la entrega al webhook, así que si hay mensajes
   posteriores a la última ejecución, el webhook está muerto aunque la
   conexión siga `open` — es la señal definitiva (Baileys recibe, n8n no).
   No hay chequeo de "silencio": que no lleguen mensajes ni ejecuciones es
   una noche tranquila, no una caída.

Correlación por timestamp: Evolution guarda jid @lid en Postgres y n8n
recibe el jid telefónico; no hay mapeo 1:1 entre ambos.

Estado en /home/debianserver/whatsapp-bot-watchdog/state.json.
Credenciales Telegram en /home/debianserver/whatsapp-bot-watchdog/.env
(TG_BOT_TOKEN, TG_CHAT_ID — chmod 600, directorio 700; el token es el
del bot «Telegram - Hermes Alerts», el MISMO canal del watchdog del sitio,
pero con message_thread_id=393 = topic de alertas YoSoy222).
Corre desde cron del usuario (debianserver está en el grupo docker).

Despliegue / actualización (fuente canónica: scripts/whatsapp_bot_watchdog.py
en el repo):
    scp scripts/whatsapp_bot_watchdog.py \
      debianm700:/home/debianserver/whatsapp-bot-watchdog/whatsapp_bot_watchdog.py
Cron (ya instalado):
    */15 * * * * /usr/bin/python3 /home/debianserver/whatsapp-bot-watchdog/whatsapp_bot_watchdog.py \
      >> /home/debianserver/whatsapp-bot-watchdog/watchdog.log 2>&1
Prueba de alerta sin esperar una caída real: /tmp/drill_alertas.py en
debianm700 simula conexión caída y verifica alerta + cooldown + recuperación.
"""
import json
import os
import sqlite3
import subprocess
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

STATE_DIR = "/home/debianserver/whatsapp-bot-watchdog"
STATE_FILE = os.path.join(STATE_DIR, "state.json")
N8N_DB = "/home/node/.n8n/database.sqlite"
LOCAL_COPY = os.path.join(STATE_DIR, "n8n_executions.sqlite")
EXEC_MATCH_AFTER = 120   # una ejecución que arranca <=120s tras el mensaje lo cubre
EXEC_MATCH_BEFORE = 5    # tolerancia de reloj: mensaje <=5s antes del arranque queda cubierto
COOLDOWN_S = 4 * 3600    # re-alerta del mismo problema cada 4h
LOC = timezone(timedelta(hours=-4))  # Venezuela
TELEGRAM_TOPIC = "393"


def now_local():
    return datetime.now(LOC).strftime("%d %b %H:%M:%S")


def log(msg):
    print(f"[{now_local()}] {msg}", flush=True)


def sh(args, timeout=45):
    return subprocess.run(args, capture_output=True, text=True, timeout=timeout).stdout.strip()


def env_from_file(path):
    out = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    out[k.strip()] = v.strip()
    except OSError:
        pass
    return out


def tg_send(text):
    env = env_from_file(os.path.join(STATE_DIR, ".env"))
    token, chat = env.get("TG_BOT_TOKEN"), env.get("TG_CHAT_ID")
    if not token or not chat:
        log(f"⚠️ sin credenciales Telegram en {os.path.join(STATE_DIR, '.env')}, alerta no enviada")
        return False
    params = urllib.parse.urlencode({
        "chat_id": chat,
        "message_thread_id": TELEGRAM_TOPIC,
        "text": text,
    })
    try:
        with urllib.request.urlopen(f"https://api.telegram.org/bot{token}/sendMessage?{params}", timeout=15) as r:
            ok = json.load(r).get("ok", False)
            log(f"telegram: {'entregado' if ok else 'RECHAZADO'}")
            return ok
    except Exception as e:
        log(f"telegram error: {e}")
        return False


def load_state():
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except Exception:
        return {"alerts": {}}


def save_state(state):
    tmp = STATE_FILE + ".tmp"
    with open(tmp, "w") as f:
        json.dump(state, f)
    os.replace(tmp, STATE_FILE)


def should_alert(state, key, now_ts, detail):
    """True si el problema es nuevo o venció el cooldown del mismo detalle."""
    alerts = state.setdefault("alerts", {})
    prev = alerts.get(key)
    if prev and prev.get("detail") == detail and now_ts - prev.get("ts", 0) < COOLDOWN_S:
        return False
    alerts[key] = {"ts": now_ts, "detail": detail}
    return True


def resolve_alert(state, key):
    if state.setdefault("alerts", {}).pop(key, None):
        log(f"resuelto: {key}")
        tg_send(f"✅ BOT RECUPERADO — {key} (activo de nuevo a las {now_local()})")


def copy_n8n_db():
    """Copia DB + WAL + SHM: sin el WAL, el snapshot parece viejo (trampa clásica)."""
    for sfx in ["", "-wal", "-shm"]:
        subprocess.run(["docker", "cp", f"agency-n8n:{N8N_DB}{sfx}", f"{LOCAL_COPY}{sfx}"], capture_output=True)


def recent_exec_starts(n=40):
    """[(id, epoch UTC)] de arranque de las últimas n ejecuciones, desc por id."""
    copy_n8n_db()
    c = sqlite3.connect(LOCAL_COPY)
    rows = c.execute(
        "SELECT id, startedAt FROM execution_entity ORDER BY id DESC LIMIT ?", (n,)
    ).fetchall()
    c.close()
    out = []
    for eid, started in rows:
        try:
            ts = datetime.strptime(started[:19], "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc).timestamp()
            out.append((eid, ts))
        except Exception:
            continue
    return out


def check_connection(now_ts, state):
    key = "conectividad"
    try:
        apikey = sh(["docker", "exec", "agency-evolution-api", "printenv", "AUTHENTICATION_API_KEY"])
        resp = sh(["curl", "-s", "-m", "10", "-H", f"apikey: {apikey}",
                   "http://localhost:8081/instance/connectionState/yosoy222_bot"])
        s = json.loads(resp).get("instance", {}).get("state")
    except Exception as e:
        s = f"error: {e}"
    if s != "open":
        if should_alert(state, key, now_ts, str(s)):
            tg_send(
                f"🚨 BOT DE WHATSAPP CAÍDO\n"
                f"Estado de la instancia yosoy222_bot: {s}\n"
                f"Pistas: docker logs --tail 50 agency-evolution-api · "
                f"reconnect en Evolution API · docker restart agency-evolution-api\n"
                f"({now_local()})"
            )
        return False
    resolve_alert(state, key)
    return True


def check_unprocessed(now_ts, state, execs):
    """Mensajes entrantes posteriores a la última ejecución = webhook muerto."""
    key = "mensajes sin ejecución"
    if not execs:
        log("n8n: sin ejecuciones registradas (workflow parado o BD vacía)")
        if should_alert(state, key, now_ts, "sin ejecuciones"):
            tg_send(f"🚨 BOT SIN EJECUCIONES EN N8N\nNo hay ninguna ejecución registrada.\n({now_local()})")
        return None
    last_eid, last_exec_ts = execs[0]
    cutoff = int(last_exec_ts + EXEC_MATCH_BEFORE)
    age_min = (now_ts - last_exec_ts) / 60
    log(f"n8n: última ejecución #{last_eid} hace {age_min:.1f} min; auditando mensajes > cutoff")
    q = (
        'SELECT "messageTimestamp", key->>\'remoteJid\', "messageType" FROM "Message" '
        'WHERE key->>\'fromMe\'=\'false\' AND "messageTimestamp" > %d '
        'ORDER BY "messageTimestamp";' % cutoff
    )
    try:
        out = sh(["docker", "exec", "agency-postgres-evo", "psql", "-U", "evolution", "-d", "evolution",
                  "-t", "-A", "-F", "|", "-c", q])
    except subprocess.TimeoutExpired:
        log("postgres timeout")
        return None
    lost = []
    for line in out.splitlines():
        parts = line.split("|")
        if len(parts) < 2 or not parts[0].isdigit():
            continue
        lost.append((int(parts[0]), parts[1], parts[2] if len(parts) > 2 else "?"))
    if lost:
        detalle = "\n".join(
            f"· {datetime.fromtimestamp(t, LOC).strftime('%d %b %H:%M:%S')} — {j} ({mt})"
            for t, j, mt in lost[:8]
        )
        if should_alert(state, key, now_ts, f"{len(lost)} msgs > exec #{last_eid}"):
            tg_send(
                f"🚨 MENSAJES SIN EJECUCIÓN EN N8N\n"
                f"{len(lost)} mensaje(s) entrante(s) NO generaron ejecución "
                f"(última ejecución #{last_eid}):\n{detalle}\n"
                f"El webhook no está entregando aunque Baileys recibe. "
                f"Revisar docker logs agency-evolution-api y el webhook en n8n.\n"
                f"({now_local()})"
            )
    else:
        resolve_alert(state, key)
    return len(lost)


def rotate_log_if_big(limit=2_000_000):
    """Rota el propio log (cron hace >>) si supera ~2MB, conservando 1 generación."""
    path = os.path.join(STATE_DIR, "watchdog.log")
    try:
        if os.path.exists(path) and os.path.getsize(path) > limit:
            os.replace(path, path + ".old")
    except OSError:
        pass


def main():
    os.makedirs(STATE_DIR, exist_ok=True)
    rotate_log_if_big()
    now_ts = datetime.now(timezone.utc).timestamp()
    state = load_state()
    log("=== inicio de pasada ===")
    if check_connection(now_ts, state):
        execs = recent_exec_starts()
        n = check_unprocessed(now_ts, state, execs)
        if n is not None:
            log(f"mensajes sin cubrir: {n}")
    save_state(state)
    log("=== fin de pasada ===")


if __name__ == "__main__":
    sys.exit(main())
