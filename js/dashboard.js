/* ============================================
   YoSoy222 — Luxury Dashboard Engine
   Cryptographic Auth Gate, Bezier Area Charts, Funnel & Telemetry Analytics
   ============================================ */

(function () {
  'use strict';

  const AUTH_SALT = 'yosoy222_auth_salt_2026';
  // Default salted SHA-256 for user "juancito" and password "YoSoy222#Admin2026"
  const DEFAULT_HASH = '1549ba80a1e67b2423e6cdb96dbf8fbd9c98e3b166d996c1f7201a1006b3928a';
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MINUTES = 15;
  const SESSION_TTL_HOURS = 2;

  let currentDays = 30;

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
        renderDashboard();
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

  // --- DATA COMPUTATION ---
  function getRawData() {
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

  function computeStats(days) {
    const raw = getRawData();
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
      // Group by 4-hour intervals for today
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
      productViews,
      productAdds,
      dailyMap,
      recentEvents: events.slice(-15).reverse()
    };
  }

  // --- MODERN CANVAS AREA CHART ---
  function drawTrendChart(canvas, dailyMap) {
    if (!canvas || !canvas.parentElement) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = canvas.parentElement.clientHeight;

    ctx.clearRect(0, 0, width, height);

    const labels = Object.keys(dailyMap);
    const viewData = labels.map(k => dailyMap[k].views);
    const waData = labels.map(k => dailyMap[k].whatsapp);
    const maxVal = Math.max(...viewData, ...waData, 5);

    const padX = 42;
    const padY = 25;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    // Grid lines (ultra-subtle)
    ctx.strokeStyle = 'rgba(198, 138, 76, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = padY + (chartH / 4) * i;
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
      ctx.fillStyle = '#6e6355';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), padX - 8, y + 3);
    }
    ctx.stroke();

    // Helper: Draw smooth Bezier curve with gradient fill
    function drawSeries(data, strokeColor, gradStart, gradEnd) {
      if (data.length === 0) return;
      if (data.length === 1) {
        const x = padX + chartW / 2;
        const y = padY + chartH - (data[0] / maxVal) * chartH;
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      const points = data.map((val, i) => ({
        x: padX + (chartW / (data.length - 1)) * i,
        y: padY + chartH - (val / maxVal) * chartH
      }));

      // Area Fill
      const grad = ctx.createLinearGradient(0, padY, 0, padY + chartH);
      grad.addColorStop(0, gradStart);
      grad.addColorStop(1, gradEnd);

      ctx.beginPath();
      ctx.moveTo(points[0].x, padY + chartH);
      ctx.lineTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(points[points.length - 1].x, padY + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line Stroke
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Points Glow
      points.forEach(p => {
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw Views & WhatsApp Area
    drawSeries(viewData, '#c68a4c', 'rgba(198, 138, 76, 0.28)', 'rgba(198, 138, 76, 0.0)');
    drawSeries(waData, '#25d366', 'rgba(37, 211, 102, 0.22)', 'rgba(37, 211, 102, 0.0)');

    // Bottom Labels
    ctx.fillStyle = '#8a7d6e';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    const step = Math.max(1, Math.ceil(labels.length / 7));
    labels.forEach((label, i) => {
      if (i % step === 0 || i === labels.length - 1) {
        const x = padX + (chartW / (labels.length - 1)) * i;
        ctx.fillText(label, x, height - 6);
      }
    });
  }

  // --- MODERN DONUT CHART ---
  function drawSourceChart(canvas, sources) {
    if (!canvas || !canvas.parentElement) return;
    const ctx = canvas.getContext('2d');
    const size = Math.min(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    const keys = Object.keys(sources);
    const total = Object.values(sources).reduce((a, b) => a + b, 0) || 1;
    const colors = {
      instagram: '#e1306c',
      tiktok: '#38bdf8',
      facebook: '#3b82f6',
      google_search: '#f43f5e',
      whatsapp: '#22c55e',
      directo: '#c68a4c',
      otro_referido: '#a88d74'
    };

    let startAngle = -Math.PI / 2;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.40;
    const innerRadius = size * 0.26;

    if (keys.length === 0) {
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

    // Inner Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${total}`, centerX, centerY - 1);
    ctx.fillStyle = '#a69888';
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText('Visitas', centerX, centerY + 11);
  }

  // --- RENDER MAIN DASHBOARD ---
  function renderDashboard() {
    const stats = computeStats(currentDays);

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
      sourceLegend.innerHTML = Object.entries(stats.sources).map(([k, v]) => `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; margin-bottom:0.4rem; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
          <span style="text-transform:capitalize; color:var(--text-muted);">${k.replace('_', ' ')}</span>
          <strong style="color:#fff;">${v} (${((v / (stats.totalSessions || 1)) * 100).toFixed(0)}%)</strong>
        </div>
      `).join('') || '<p style="color:var(--text-faint); font-size:0.78rem; text-align:center;">Sin datos registrados</p>';
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
        return `
          <tr>
            <td style="color:var(--text-faint);">${timeStr}</td>
            <td><span class="badge-evt ${typeClasses[e.type] || 'badge-view'}">${e.type.replace('_', ' ')}</span></td>
            <td style="font-weight:500;">${detail}</td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="3" style="text-align:center; color:var(--text-faint); padding:1.5rem;">No hay actividad reciente registrada</td></tr>';
    }
  }

  // --- CSV EXPORT ---
  function exportCSV() {
    const raw = getRawData();
    const rows = [
      ['Timestamp', 'Fecha', 'Tipo de Evento', 'Detalle / Producto / Busqueda', 'Precio/Total', 'Origen / Fuente', 'Dispositivo']
    ];

    (raw.events || []).forEach(e => {
      const date = new Date(e.t).toISOString();
      const detail = e.name || e.query || e.category || '';
      const val = e.total || e.price || '';
      const src = e.src || e.origin || '';
      const dev = e.dev || '';
      rows.push([e.t, date, e.type, detail, val, src, dev]);
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
    const sources = ['instagram', 'instagram', 'tiktok', 'google_search', 'directo', 'whatsapp'];
    const now = Date.now();
    const sessions = [];
    const events = [];

    for (let i = 29; i >= 0; i--) {
      const dayTime = now - (i * 24 * 60 * 60 * 1000);
      const visits = Math.floor(Math.random() * 22) + 10;

      for (let v = 0; v < visits; v++) {
        const sid = 's_' + (dayTime + v);
        const src = sources[Math.floor(Math.random() * sources.length)];
        const isMobile = Math.random() > 0.25;
        sessions.push({ id: sid, t: dayTime + v * 1000, src, dev: isMobile ? 'móvil' : 'ordenador' });
        events.push({ type: 'page_view', t: dayTime + v * 1000, sid, src, dev: isMobile ? 'móvil' : 'ordenador' });

        if (Math.random() > 0.35) {
          const prod = products[Math.floor(Math.random() * products.length)];
          events.push({ type: 'view_item', name: prod, price: 15, t: dayTime + v * 1000 + 500, sid });

          if (Math.random() > 0.45) {
            events.push({ type: 'add_to_cart', name: prod, price: 15, qty: 1, t: dayTime + v * 1000 + 1000, sid });

            if (Math.random() > 0.55) {
              events.push({ type: 'whatsapp_checkout', origin: 'cart_drawer', total: 30, itemsCount: 2, t: dayTime + v * 1000 + 1500, sid });
            }
          }
        }
      }
    }

    localStorage.setItem('yosoy222_analytics', JSON.stringify({ version: 1, sessions, events }));
    renderDashboard();
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

        const inputHash = await computeHash(user, pass);
        const targetHash = getActiveHash();

        if (inputHash === targetHash) {
          clearFailedAttempts();
          createSession();
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
        renderDashboard();
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
        if (confirm('¿Estás seguro de que deseas reiniciar todos los datos de estadísticas?')) {
          localStorage.removeItem('yosoy222_analytics');
          renderDashboard();
        }
      });
    }

    window.addEventListener('resize', () => {
      if (isSessionValid()) renderDashboard();
    });
  });
})();
