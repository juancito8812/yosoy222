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

  // Helper: Country Flags
  function getFlagEmoji(country) {
    if (!country) return '🌍';
    const c = country.toLowerCase();
    if (c.includes('venezuela')) return '🇻🇪';
    if (c.includes('estados unidos') || c.includes('united states') || c === 'us') return '🇺🇸';
    if (c.includes('españa') || c.includes('spain') || c === 'es') return '🇪🇸';
    if (c.includes('colombia') || c === 'co') return '🇨🇴';
    if (c.includes('méxico') || c.includes('mexico') || c === 'mx') return '🇲🇽';
    if (c.includes('chile')) return '🇨🇱';
    if (c.includes('argentina')) return '🇦🇷';
    if (c.includes('panamá') || c.includes('panama')) return '🇵🇦';
    if (c.includes('perú') || c.includes('peru')) return '🇵🇪';
    if (c.includes('ecuador')) return '🇪🇨';
    if (c.includes('reino unido') || c.includes('united kingdom')) return '🇬🇧';
    return '🏳️';
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
      const err = document.getElementById('authError');
      if (err) err.style.display = 'none';
      const userInput = document.getElementById('authUser');
      if (userInput) userInput.focus();
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

  // --- LUXURY BEZIER AREA CHARTS ---
  function drawTrendChart(canvas, dailyMap) {
    if (!canvas || !canvas.parentElement) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = canvas.parentElement.clientHeight;
    if (width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);

    const labels = Object.keys(dailyMap);
    const viewData = labels.map(k => dailyMap[k].views);
    const waData = labels.map(k => dailyMap[k].whatsapp);

    const maxVal = Math.max(...viewData, ...waData, 5);
    const padX = 35;
    const padY = 25;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    // Subtle Horizontal Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padY + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
      ctx.stroke();

      const val = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillStyle = '#7a6e60';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val, padX - 8, y + 3);
    }

    function drawSmoothSeries(data, strokeColor, fillColorStart, fillColorEnd) {
      if (data.length < 2) return;

      const points = data.map((val, i) => ({
        x: padX + (chartW / (data.length - 1)) * i,
        y: padY + chartH - (val / maxVal) * chartH
      }));

      const grad = ctx.createLinearGradient(0, padY, 0, padY + chartH);
      grad.addColorStop(0, fillColorStart);
      grad.addColorStop(1, fillColorEnd);

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.lineTo(points[points.length - 1].x, padY + chartH);
      ctx.lineTo(points[0].x, padY + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.fill();
        ctx.strokeStyle = '#12100e';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    drawSmoothSeries(viewData, '#c68a4c', 'rgba(198, 138, 76, 0.28)', 'rgba(198, 138, 76, 0.0)');
    drawSmoothSeries(waData, '#10b981', 'rgba(16, 185, 129, 0.25)', 'rgba(16, 185, 129, 0.0)');

    ctx.fillStyle = '#a69888';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    const step = Math.max(1, Math.floor(labels.length / 7));
    labels.forEach((label, i) => {
      if (i % step === 0 || i === labels.length - 1) {
        const x = padX + (chartW / (labels.length - 1)) * i;
        ctx.fillText(label, x, height - 6);
      }
    });
  }

  // --- TRAFFIC SOURCES DONUT CHART ---
  function drawSourceChart(canvas, sources) {
    if (!canvas || !canvas.parentElement) return;
    const ctx = canvas.getContext('2d');
    const size = Math.min(canvas.parentElement.clientWidth, 220);
    canvas.width = size;
    canvas.height = size;
    if (size === 0) return;

    ctx.clearRect(0, 0, size, size);

    const keys = Object.keys(sources);
    const total = Object.values(sources).reduce((a, b) => a + b, 0) || 0;

    const colors = {
      pwa_app: '#f59e0b',
      instagram: '#f43f5e',
      tiktok: '#38bdf8',
      facebook: '#3b82f6',
      google_search: '#eab308',
      whatsapp: '#10b981',
      twitter_x: '#a855f7',
      directo: '#c68a4c',
      otro_referido: '#94a3b8'
    };

    let startAngle = -Math.PI / 2;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.40;
    const innerRadius = size * 0.26;

    if (keys.length === 0 || total === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
      ctx.fill();
      return;
    }

    keys.forEach(k => {
      const val = sources[k];
      const sliceAngle = (val / total) * (Math.PI * 2);
      ctx.fillStyle = colors[k] || '#c68a4c';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fill();
      startAngle += sliceAngle;
    });

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${total}`, centerX, centerY - 1);
    ctx.fillStyle = '#a69888';
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText('Visitas', centerX, centerY + 11);
  }

  // --- RENDER MAIN DASHBOARD ---
  async function renderDashboard(forceCloud = false) {
    const cloud = await fetchCloudData(forceCloud);
    const stats = computeStats(currentDays, cloud);

    // Update Live Indicator Status
    const livePill = document.querySelector('.live-pill');
    if (livePill) {
      if (stats.isCloud) {
        livePill.innerHTML = '<span class="live-dot" style="background:#10b981;"></span> En Vivo (Supabase Cloud)';
      } else {
        livePill.innerHTML = '<span class="live-dot"></span> En Vivo (Local)';
      }
    }

    // Update KPI Numbers
    document.getElementById('kpiViews').textContent = stats.pageViews.toLocaleString();
    document.getElementById('kpiWhatsapp').textContent = stats.waTotal.toLocaleString();
    document.getElementById('kpiCart').textContent = stats.cartAdds.toLocaleString();
    document.getElementById('kpiRevenue').textContent = `$${stats.totalRevenue.toFixed(2)}`;
    document.getElementById('kpiConversion').textContent = `${stats.conversionRate}%`;

    // Funnel Steps
    document.getElementById('funnelViews').textContent = stats.pageViews;
    document.getElementById('funnelProducts').textContent = stats.viewedProducts;
    document.getElementById('funnelCart').textContent = stats.cartAdds;
    document.getElementById('funnelWhatsapp').textContent = stats.waTotal;

    const pRate = stats.pageViews > 0 ? ((stats.viewedProducts / stats.pageViews) * 100).toFixed(0) : 0;
    const cRate = stats.viewedProducts > 0 ? ((stats.cartAdds / stats.viewedProducts) * 100).toFixed(0) : 0;
    const wRate = stats.cartAdds > 0 ? ((stats.waTotal / stats.cartAdds) * 100).toFixed(0) : 0;

    document.getElementById('funnelPRate').textContent = `${pRate}%`;
    document.getElementById('funnelCRate').textContent = `${cRate}%`;
    document.getElementById('funnelWRate').textContent = `${wRate}%`;

    // Devices
    document.getElementById('deviceMobile').textContent = `${stats.mobilePct}%`;
    document.getElementById('deviceDesktop').textContent = `${stats.desktopPct}%`;

    // Draw Charts
    drawTrendChart(document.getElementById('trendCanvas'), stats.dailyMap);
    drawSourceChart(document.getElementById('sourceCanvas'), stats.sources);

    // Source Badge & Legend
    const sourceKeys = Object.keys(stats.sources);
    document.getElementById('sourceTotalBadge').textContent = `${sourceKeys.length} canal${sourceKeys.length === 1 ? '' : 'es'}`;
    const sourceLegend = document.getElementById('sourceLegend');
    if (sourceLegend) {
      sourceLegend.innerHTML = Object.entries(stats.sources).map(([k, v]) => {
        const label = k === 'pwa_app' ? '📱 App PWA' : k.replace('_', ' ');
        return `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; margin-bottom:0.4rem; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
          <span style="text-transform:capitalize; color:var(--text-muted);">${label}</span>
          <strong style="color:#fff;">${v} (${((v / (stats.totalSessions || 1)) * 100).toFixed(0)}%)</strong>
        </div>
      `;
      }).join('') || '<p style="color:var(--text-faint); font-size:0.78rem; text-align:center;">Sin datos registrados</p>';
    }

    // Geographic Distribution (Countries & Cities)
    const geoTotalBadge = document.getElementById('geoTotalBadge');
    const countryKeys = Object.keys(stats.countries);
    const cityKeys = Object.keys(stats.cities);
    if (geoTotalBadge) {
      geoTotalBadge.textContent = `${countryKeys.length} país(es) · ${cityKeys.length} ciudad(es)`;
    }

    const countriesTable = document.getElementById('countriesTable');
    if (countriesTable) {
      const sortedCo = Object.entries(stats.countries).sort((a, b) => b[1] - a[1]);
      const maxCo = sortedCo[0]?.[1] || 1;
      countriesTable.innerHTML = sortedCo.map(([co, count]) => {
        const flag = getFlagEmoji(co);
        const pct = Math.round((count / (stats.totalSessions || 1)) * 100);
        const barPct = Math.round((count / maxCo) * 100);
        return `
          <tr>
            <td>
              <div style="font-weight:600; color:#fff; display:flex; align-items:center; gap:0.4rem;">
                <span>${flag}</span> <span>${co}</span>
              </div>
            </td>
            <td><strong>${count}</strong> <span style="font-size:0.75rem; color:var(--text-faint);">(${pct}%)</span></td>
            <td>
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill" style="width: ${barPct}%; background: linear-gradient(90deg, #c68a4c, #eab308);"></div>
              </div>
            </td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="3" style="text-align:center; color:var(--text-faint); padding:1rem;">Sin ubicaciones registradas</td></tr>';
    }

    const citiesTable = document.getElementById('citiesTable');
    if (citiesTable) {
      const sortedCi = Object.entries(stats.cities).sort((a, b) => b[1] - a[1]);
      const maxCi = sortedCi[0]?.[1] || 1;
      citiesTable.innerHTML = sortedCi.map(([ci, count]) => {
        const pct = Math.round((count / (stats.totalSessions || 1)) * 100);
        const barPct = Math.round((count / maxCi) * 100);
        return `
          <tr>
            <td>
              <div style="font-weight:600; color:#fff;">📍 ${ci}</div>
            </td>
            <td><strong>${count}</strong> <span style="font-size:0.75rem; color:var(--text-faint);">(${pct}%)</span></td>
            <td>
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill" style="width: ${barPct}%; background: linear-gradient(90deg, #10b981, #34d399);"></div>
              </div>
            </td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="3" style="text-align:center; color:var(--text-faint); padding:1rem;">Sin ciudades registradas</td></tr>';
    }

    // Top Products with Progress Fill
    const topProdTable = document.getElementById('topProductsTable');
    if (topProdTable) {
      const allNames = Array.from(new Set([...Object.keys(stats.productViews), ...Object.keys(stats.productAdds)]));
      const maxScore = Math.max(...allNames.map(n => (stats.productViews[n] || 0) + (stats.productAdds[n] || 0) * 2), 1);
      const sorted = allNames.sort((a, b) => ((stats.productViews[b] || 0) + (stats.productAdds[b] || 0) * 2) - ((stats.productViews[a] || 0) + (stats.productAdds[a] || 0) * 2)).slice(0, 5);

      topProdTable.innerHTML = sorted.map(name => {
        const v = stats.productViews[name] || 0;
        const c = stats.productAdds[name] || 0;
        const score = v + c * 2;
        const pct = Math.min(100, Math.round((score / maxScore) * 100));
        return `
          <tr>
            <td>
              <div style="font-weight:600; color:#fff;">${name}</div>
            </td>
            <td>${v}</td>
            <td><span style="color:#facc15; font-weight:600;">${c}</span></td>
            <td style="width: 25%;">
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill" style="width: ${pct}%;"></div>
              </div>
            </td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="4" style="text-align:center; color:var(--text-faint); padding:1.5rem;">Sin productos visualizados aún</td></tr>';
    }

    // Recent Events Feed
    const eventTable = document.getElementById('eventTable');
    if (eventTable) {
      const typeClasses = {
        whatsapp_checkout: 'badge-whatsapp',
        whatsapp_contact: 'badge-whatsapp',
        add_to_cart: 'badge-cart',
        view_item: 'badge-view',
        search: 'badge-search',
        page_view: 'badge-view'
      };

      eventTable.innerHTML = stats.recentEvents.map(e => {
        const timeStr = new Date(e.t).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
        const detail = e.name || e.query || (e.total ? `$${e.total} USD` : e.src || e.origin || 'Navegación');
        const flag = getFlagEmoji(e.country);
        const locationText = `${flag} ${e.city || 'Caracas'}, ${e.country || 'Venezuela'}`;
        return `
          <tr>
            <td style="color:var(--text-faint);">${timeStr}</td>
            <td><span class="badge-evt ${typeClasses[e.type] || 'badge-view'}">${e.type.replace('_', ' ')}</span></td>
            <td style="font-size:0.8rem; color:#d6c7b2;">${locationText}</td>
            <td style="font-weight:500;">${detail}</td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="4" style="text-align:center; color:var(--text-faint); padding:1.5rem;">No hay actividad reciente registrada</td></tr>';
    }
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
    const authError = document.getElementById('authError');

    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('authUser').value;
        const pass = document.getElementById('authPassword').value;

        const lock = getLockoutState();
        if (lock.lockUntil && Date.now() < lock.lockUntil) {
          const remainingMins = Math.ceil((lock.lockUntil - Date.now()) / 60000);
          authError.textContent = `Demasiados intentos fallidos. Bloqueado por ${remainingMins} minuto(s).`;
          authError.style.display = 'block';
          return;
        }

        // Autenticación server-side vía Edge Function (preferida):
        // valida contra DASH_AUTH_HASH y devuelve token HMAC para leer stats.
        if (STATS_FN) {
          try {
            const res = await fetch(STATS_FN, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'login', user, pass })
            });
            const payload = await res.json().catch(() => ({}));
            if (res.ok && payload.ok && payload.token) {
              clearFailedAttempts();
              createSession();
              cloudAuth = { user: user.trim().toLowerCase(), token: payload.token };
              authError.style.display = 'none';
              document.getElementById('authPassword').value = '';
              setDashboardVisible(true);
              return;
            }
            if (res.status === 429) {
              authError.textContent = `Demasiados intentos fallidos. Bloqueado por ${payload.minutes || LOCKOUT_MINUTES} minuto(s).`;
              authError.style.display = 'block';
              return;
            }
            if (res.status === 401) {
              const failed = recordFailedAttempt();
              const remaining = MAX_ATTEMPTS - failed.attempts;
              authError.textContent = remaining > 0
                ? `Credenciales incorrectas. Te quedan ${remaining} intento(s).`
                : `Demasiados intentos fallidos. Bloqueado por ${LOCKOUT_MINUTES} minutos.`;
              authError.style.display = 'block';
              return;
            }
            // Otro error de la función (404 si aún no está desplegada, 5xx, CORS…):
            // continuar al fallback local con aviso.
            console.warn('Edge Function no disponible (' + res.status + '); usando autenticación local degradada.');
          } catch (err) {
            console.warn('Edge Function inaccesible; usando autenticación local degradada.', err);
          }
        }

        // Fallback local (modo degradado, misma lógica de siempre)
        const inputHash = await computeHash(user, pass);
        const targetHash = getActiveHash();

        if (inputHash === targetHash) {
          clearFailedAttempts();
          createSession();
          cloudAuth = null;
          authError.style.display = 'none';
          document.getElementById('authPassword').value = '';
          setDashboardVisible(true);
        } else {
          const failed = recordFailedAttempt();
          const remaining = MAX_ATTEMPTS - failed.attempts;
          if (remaining > 0) {
            authError.textContent = `Credenciales incorrectas. Te quedan ${remaining} intento(s).`;
          } else {
            authError.textContent = `Demasiados intentos fallidos. Bloqueado por ${LOCKOUT_MINUTES} minutos.`;
          }
          authError.style.display = 'block';
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
