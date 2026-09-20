/* ============================================
   YoSoy222 — Luxury Dashboard Engine
   Cryptographic Auth Gate, Supabase Cloud Integration,
   Geographic Telemetry (Countries & Cities),
   Bezier Area Charts, Funnel & Telemetry Analytics
   ============================================ */

(function () {
  'use strict';

  const AUTH_SALT = 'yosoy222_auth_salt_2026';
  // Precomputed salted SHA-256 hash for default administrator authentication
  const DEFAULT_HASH = '1549ba80a1e67b2423e6cdb96dbf8fbd9c98e3b166d996c1f7201a1006b3928a';
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MINUTES = 15;
  const SESSION_TTL_HOURS = 2;

  // Supabase Cloud Configuration (única fuente: js/config.js)
  const SUPABASE_URL = (window.YoSoyConfig && window.YoSoyConfig.SUPABASE_URL) || '';
  // Edge Function de lectura autenticada (service_role vive server-side)
  const STATS_FN = `${SUPABASE_URL}/functions/v1/dashboard-stats`;

  // Credenciales actuales del panel (usuario + token de la Edge Function)
  let cloudAuth = null;

  let currentDays = 30;
  let cachedCloudData = null;
  let lastCloudFetch = 0;

  /* ----- Vista: gráficos y render (js/dashboard-view.js) -----
     El módulo de vista es puro: recibe stats ya computadas.
     Este módulo (core) posee auth, datos y estado; obtiene las
     stats y delega el pintado. Firma original intacta. */
  async function renderDashboard(forceCloud = false) {
    const cloud = await fetchCloudData(forceCloud);
    const stats = computeStats(currentDays, cloud);
    return YoSoyDashView.renderDashboard(stats);
  }

  // --- CRYPTOGRAPHIC UTILITIES ---
  async function computeHash(username, password) {
    const raw = (username.trim().toLowerCase() + ':' + password + ':' + AUTH_SALT);
    const buffer = new TextEncoder().encode(raw);
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getActiveHash() {
    return localStorage.getItem('yosoy222_auth_hash') || DEFAULT_HASH;
  }

  // --- BRUTE FORCE PROTECTION ---
  function getLockoutState() {
    try {
      const raw = localStorage.getItem('yosoy222_auth_lock');
      if (!raw) return { attempts: 0, lockUntil: 0 };
      return JSON.parse(raw);
    } catch {
      return { attempts: 0, lockUntil: 0 };
    }
  }

  function recordFailedAttempt() {
    const state = getLockoutState();
    state.attempts = (state.attempts || 0) + 1;
    if (state.attempts >= MAX_ATTEMPTS) {
      state.lockUntil = Date.now() + (LOCKOUT_MINUTES * 60 * 1000);
    }
    localStorage.setItem('yosoy222_auth_lock', JSON.stringify(state));
    return state;
  }

  function clearFailedAttempts() {
    localStorage.removeItem('yosoy222_auth_lock');
  }

  // --- SESSION MANAGEMENT ---
  function isSessionValid() {
    try {
      const raw = sessionStorage.getItem('yosoy222_dash_session');
      if (!raw) return false;
      const sess = JSON.parse(raw);
      if (!sess || !sess.expires) return false;
      return Date.now() < sess.expires;
    } catch {
      return false;
    }
  }

  function createSession() {
    const expires = Date.now() + (SESSION_TTL_HOURS * 60 * 60 * 1000);
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('yosoy222_dash_session', JSON.stringify({ token, expires }));
  }

  function destroySession() {
    sessionStorage.removeItem('yosoy222_dash_session');
  }

  // Referencias del formulario de auth (lazy: los helpers se usan solo en el submit)
  const authErrorEl = document.getElementById('authError');
  const authUserEl = document.getElementById('authUser');
  const authPasswordEl = document.getElementById('authPassword');

  // --- UI SWITCHER ---
  function showAuthError(msg) {
    authErrorEl.textContent = msg;
    authErrorEl.style.display = 'block';
  }

  function acceptLogin(user, token = null) {
    clearFailedAttempts();
    createSession();
    cloudAuth = token ? { user, token } : null;
    authErrorEl.style.display = 'none';
    authPasswordEl.value = '';
    setDashboardVisible(true);
  }

  function rejectLogin() {
    const failed = recordFailedAttempt();
    const remaining = MAX_ATTEMPTS - failed.attempts;
    showAuthError(remaining > 0
      ? `Credenciales incorrectas. Te quedan ${remaining} intento(s).`
      : `Demasiados intentos fallidos. Bloqueado por ${LOCKOUT_MINUTES} minutos.`);
  }

  // Login server-side vía Edge Function. Devuelve true si resolvió el login
  // (éxito o error definitivo de la función); false si hay que caer al fallback local.
  async function edgeLogin(user, pass) {
    try {
      const res = await fetch(STATS_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', user, pass })
      });
      const payload = await res.json().catch(() => ({}));
      if (res.ok && payload.ok && payload.token) {
        acceptLogin(user.trim().toLowerCase(), payload.token);
        return true;
      }
      if (res.status === 429) {
        showAuthError(`Demasiados intentos fallidos. Bloqueado por ${payload.minutes || LOCKOUT_MINUTES} minuto(s).`);
        return true;
      }
      if (res.status === 401) {
        rejectLogin();
        return true;
      }
      // Otro error (404 si aún no está desplegada, 5xx, CORS…): fallback local.
      console.warn('Edge Function no disponible (' + res.status + '); usando autenticación local degradada.');
    } catch (err) {
      console.warn('Edge Function inaccesible; usando autenticación local degradada.', err);
    }
    return false;
  }

  // --- UI SWITCHER ---
  function setDashboardVisible(authenticated) {
    const overlay = document.getElementById('authOverlay');
    const content = document.getElementById('dashContent');

    if (authenticated) {
      if (overlay) overlay.style.display = 'none';
      if (content) {
        content.style.display = 'flex';
        renderDashboard(true);
      }
    } else {
      if (overlay) overlay.style.display = 'flex';
      if (content) content.style.display = 'none';
      if (authErrorEl) authErrorEl.style.display = 'none';
      if (authUserEl) authUserEl.focus();
    }
  }

  // --- DATA COMPUTATION & SUPABASE CLOUD SYNC ---
  async function fetchCloudData(force = false) {
    if (!force && cachedCloudData && (Date.now() - lastCloudFetch < 15000)) {
      return cachedCloudData;
    }
    // Lectura global SOLO vía Edge Function autenticada (service_role server-side).
    // Sin sesión válida en la nube → cae a datos locales (getLocalRawData).
    if (!STATS_FN || !cloudAuth || !cloudAuth.token) return null;

    try {
      const res = await fetch(STATS_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stats',
          user: cloudAuth.user,
          token: cloudAuth.token,
          limit: 2500
        })
      });
      if (res.status === 401 || res.status === 429) {
        // Token expirado/inválido o rate limit: cerrar sesión en la nube
        cloudAuth = null;
        return null;
      }
      if (res.ok) {
        const payload = await res.json();
        const rows = Array.isArray(payload.rows) ? payload.rows : [];
        if (rows.length > 0) {
          const events = rows.map(r => ({
            id: r.id,
            type: r.event_type,
            t: new Date(r.created_at).getTime(),
            sid: r.session_id,
            src: r.source || 'directo',
            dev: r.device || 'móvil',
            country: r.country || 'Venezuela',
            city: r.city || 'Caracas',
            name: r.product_name,
            price: Number(r.product_price) || 0,
            cat: r.product_cat,
            query: r.query,
            total: Number(r.total_amount) || 0,
            itemsCount: Number(r.items_count) || 1,
            qty: Number(r.items_count) || 1
          }));

          const sessionMap = new Map();
          events.forEach(e => {
            const sid = e.sid || ('s_' + e.t);
            if (!sessionMap.has(sid)) {
              sessionMap.set(sid, {
                id: sid,
                t: e.t,
                src: e.src,
                dev: e.dev,
                country: e.country,
                city: e.city
              });
            }
          });

          cachedCloudData = {
            sessions: Array.from(sessionMap.values()),
            events: events,
            isCloud: true
          };
          lastCloudFetch = Date.now();
          return cachedCloudData;
        }
      }
    } catch (e) {
      console.warn('Supabase Cloud Analytics fetch:', e);
    }
    return null;
  }

  function getLocalRawData() {
    try {
      const raw = localStorage.getItem('yosoy222_analytics');
      if (!raw) return { sessions: [], events: [] };
      return JSON.parse(raw);
    } catch {
      return { sessions: [], events: [] };
    }
  }

  function filterByDays(items, days) {
    if (days === 0) return items;
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return items.filter(i => (i.t || i.timestamp) >= cutoff);
  }

  function computeStats(days, dataSource) {
    const raw = dataSource || getLocalRawData();
    const sessions = filterByDays(raw.sessions || [], days);
    const events = filterByDays(raw.events || [], days);

    const totalSessions = sessions.length;
    const pageViews = events.filter(e => e.type === 'page_view').length || totalSessions;
    
    const waEvents = events.filter(e => e.type === 'whatsapp_checkout' || e.type === 'whatsapp_contact');
    const waOrders = events.filter(e => e.type === 'whatsapp_checkout');
    const cartAdds = events.filter(e => e.type === 'add_to_cart');
    const totalRevenue = waOrders.reduce((sum, e) => sum + (Number(e.total) || 0), 0);
    const conversionRate = totalSessions > 0 ? ((waEvents.length / totalSessions) * 100).toFixed(1) : '0.0';
    const viewedProducts = events.filter(e => e.type === 'view_item').length;
    
    // Devices
    let mobileCount = 0;
    let desktopCount = 0;
    sessions.forEach(s => {
      if (s.dev === 'móvil') mobileCount++;
      else desktopCount++;
    });

    const mobilePct = totalSessions > 0 ? Math.round((mobileCount / totalSessions) * 100) : 0;
    const desktopPct = totalSessions > 0 ? (100 - mobilePct) : 0;

    // Traffic Sources
    const sources = {};
    sessions.forEach(s => {
      const src = s.src || 'directo';
      sources[src] = (sources[src] || 0) + 1;
    });

    // Geolocation: Countries & Cities
    const countries = {};
    const cities = {};
    sessions.forEach(s => {
      const co = s.country || 'Venezuela';
      const ci = s.city || 'Caracas';
      countries[co] = (countries[co] || 0) + 1;
      cities[ci] = (cities[ci] || 0) + 1;
    });

    // Top Products
    const productViews = {};
    const productAdds = {};
    events.forEach(e => {
      if (e.type === 'view_item' && e.name) {
        productViews[e.name] = (productViews[e.name] || 0) + 1;
      }
      if (e.type === 'add_to_cart' && e.name) {
        productAdds[e.name] = (productAdds[e.name] || 0) + (e.qty || 1);
      }
    });

    // Daily Map
    const dailyMap = {};
    const chartDays = days === 0 ? 30 : (days === 1 ? 1 : days);

    if (chartDays === 1) {
      for (let h = 0; h < 24; h += 4) {
        const key = `${h}:00`;
        dailyMap[key] = { views: 0, whatsapp: 0 };
      }
      events.forEach(e => {
        const hour = new Date(e.t || Date.now()).getHours();
        const block = Math.floor(hour / 4) * 4;
        const key = `${block}:00`;
        if (dailyMap[key]) {
          if (e.type === 'page_view') dailyMap[key].views++;
          if (e.type.startsWith('whatsapp')) dailyMap[key].whatsapp++;
        }
      });
    } else {
      for (let i = chartDays - 1; i >= 0; i--) {
        const d = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
        const key = d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
        dailyMap[key] = { views: 0, whatsapp: 0 };
      }
      events.forEach(e => {
        const d = new Date(e.t || Date.now());
        const key = d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
        if (dailyMap[key]) {
          if (e.type === 'page_view') dailyMap[key].views++;
          if (e.type.startsWith('whatsapp')) dailyMap[key].whatsapp++;
        }
      });
    }

    return {
      totalSessions,
      pageViews,
      waTotal: waEvents.length,
      waOrders: waOrders.length,
      cartAdds: cartAdds.length,
      totalRevenue,
      conversionRate,
      viewedProducts,
      mobilePct,
      desktopPct,
      sources,
      countries,
      cities,
      productViews,
      productAdds,
      dailyMap,
      recentEvents: events.slice(0, 15),
      isCloud: !!raw.isCloud
    };
  }

  // --- CSV EXPORT ---
  function exportCSV() {
    const raw = cachedCloudData || getLocalRawData();
    const rows = [
      ['Timestamp', 'Fecha', 'Tipo de Evento', 'Detalle / Producto / Busqueda', 'Precio/Total', 'Origen / Fuente', 'Dispositivo', 'Pais', 'Ciudad']
    ];

    (raw.events || []).forEach(e => {
      const date = new Date(e.t).toISOString();
      const detail = e.name || e.query || e.category || '';
      const val = e.total || e.price || '';
      const src = e.src || e.origin || '';
      const dev = e.dev || '';
      const co = e.country || 'Venezuela';
      const ci = e.city || 'Caracas';
      rows.push([e.t, date, e.type, detail, val, src, dev, co, ci]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `yosoy222_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- DEMO DATA SEEDER ---
  function seedDemoData() {
    const products = ['Rosa', 'Mini Corazones', 'Armonía Canela', 'Sagrada Familia', 'Gargantilla G-01', 'Pulsera Infinito Azul', 'F-01 Loto Sagrado'];
    const sources = ['instagram', 'instagram', 'tiktok', 'google_search', 'directo', 'whatsapp', 'pwa_app'];
    const locations = [
      { country: 'Venezuela', city: 'Caracas' },
      { country: 'Venezuela', city: 'Valencia' },
      { country: 'Venezuela', city: 'Maracaibo' },
      { country: 'Venezuela', city: 'Barquisimeto' },
      { country: 'Venezuela', city: 'Guatire' },
      { country: 'Estados Unidos', city: 'Miami' },
      { country: 'España', city: 'Madrid' },
      { country: 'Colombia', city: 'Bogotá' }
    ];
    const now = Date.now();
    const sessions = [];
    const events = [];

    for (let i = 0; i < 45; i++) {
      const sid = 's_demo_' + i;
      const t = now - Math.floor(Math.random() * 25 * 24 * 60 * 60 * 1000);
      const src = sources[Math.floor(Math.random() * sources.length)];
      const dev = Math.random() > 0.3 ? 'móvil' : 'ordenador';
      const loc = locations[Math.floor(Math.random() * locations.length)];
      
      sessions.push({ id: sid, t, src, dev, country: loc.country, city: loc.city, path: '/' });
      events.push({ type: 'page_view', t: t + 100, sid, src, dev, country: loc.country, city: loc.city, title: 'YoSoy222' });

      if (Math.random() > 0.25) {
        const prod = products[Math.floor(Math.random() * products.length)];
        events.push({ type: 'view_item', t: t + 1500, sid, src, dev, country: loc.country, city: loc.city, name: prod, price: 12, cat: 'Velas' });

        if (Math.random() > 0.45) {
          events.push({ type: 'add_to_cart', t: t + 3000, sid, src, dev, country: loc.country, city: loc.city, name: prod, price: 12, qty: 1 });

          if (Math.random() > 0.40) {
            events.push({ type: 'whatsapp_checkout', t: t + 6000, sid, src, dev, country: loc.country, city: loc.city, total: 24, itemsCount: 2 });
          }
        }
      }
    }

    localStorage.setItem('yosoy222_analytics', JSON.stringify({ version: 1, sessions, events }));
    cachedCloudData = null;
    renderDashboard(false);
  }

  // --- INITIALIZATION & EVENTS ---
  document.addEventListener('DOMContentLoaded', () => {
    if (isSessionValid()) {
      setDashboardVisible(true);
    } else {
      setDashboardVisible(false);
    }

    // Login Form
    const authForm = document.getElementById('authForm');

    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = authUserEl.value;
        const pass = authPasswordEl.value;

        const lock = getLockoutState();
        if (lock.lockUntil && Date.now() < lock.lockUntil) {
          showAuthError(`Demasiados intentos fallidos. Bloqueado por ${Math.ceil((lock.lockUntil - Date.now()) / 60000)} minuto(s).`);
          return;
        }

        // Preferente: Edge Function (valida server-side). Si no está disponible, fallback local.
        if (await edgeLogin(user, pass)) return;

        // Fallback local (modo degradado, misma lógica de siempre)
        if ((await computeHash(user, pass)) === getActiveHash()) {
          acceptLogin(user.trim().toLowerCase());
        } else {
          rejectLogin();
        }
      });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        destroySession();
        cloudAuth = null;
        setDashboardVisible(false);
      });
    }

    // Password Modal
    const openPwdBtn = document.getElementById('openPwdBtn');
    const pwdModal = document.getElementById('pwdModal');
    const cancelPwdBtn = document.getElementById('cancelPwdBtn');
    const pwdForm = document.getElementById('pwdForm');

    if (openPwdBtn && pwdModal) {
      openPwdBtn.addEventListener('click', () => {
        pwdModal.style.display = 'flex';
      });
    }

    if (cancelPwdBtn && pwdModal) {
      cancelPwdBtn.addEventListener('click', () => {
        pwdModal.style.display = 'none';
      });
    }

    if (pwdForm) {
      pwdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newU = document.getElementById('newUsername').value;
        const newP = document.getElementById('newPassword').value;

        if (newP.length < 6) {
          alert('La contraseña debe tener al menos 6 caracteres.');
          return;
        }

        const newHash = await computeHash(newU, newP);
        localStorage.setItem('yosoy222_auth_hash', newHash);
        alert('Credenciales actualizadas exitosamente.');
        pwdModal.style.display = 'none';
      });
    }

    // Segmented Range Buttons
    const rangeBtns = document.querySelectorAll('.range-btn');
    rangeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        rangeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDays = parseInt(btn.dataset.days, 10);
        renderDashboard(false);
      });
    });

    // Export & Demo Buttons
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportCSV);

    const demoBtn = document.getElementById('demoBtn');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        if (confirm('¿Cargar datos de prueba para visualizar todos los gráficos del Dashboard?')) {
          seedDemoData();
        }
      });
    }

    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('¿Eliminar todos los datos locales de analítica?')) {
          localStorage.removeItem('yosoy222_analytics');
          cachedCloudData = null;
          renderDashboard(false);
        }
      });
    }

    // Responsive Canvas Re-render
    window.addEventListener('resize', () => {
      if (isSessionValid()) renderDashboard(false);
    });

    // Background Auto-Refresh every 30 seconds
    setInterval(() => {
      if (isSessionValid() && document.visibilityState === 'visible') {
        renderDashboard(true);
      }
    }, 30000);
  });
})();
