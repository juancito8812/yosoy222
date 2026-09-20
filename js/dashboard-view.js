/* ============================================
   YoSoy222 — Dashboard View Layer
   Charts (Bezier area + donut), render de KPIs,
   tablas y leyendas. Recibe stats ya computadas
   desde js/dashboard.js (propietario del estado).
   ============================================ */

(function () {
  'use strict';

  /* ----- Security: HTML escaping (js/shared.js, única copia) -----
     Los eventos pueden contener datos inyectados por terceros
     (especialmente el histórico anterior al RLS insert-only). */
  const YoSoySharedModule = (typeof window !== 'undefined' && window.YoSoyShared) || null;
  if (!YoSoySharedModule) throw new Error('YoSoy222: js/shared.js debe cargarse antes que dashboard-view.js');
  const { escapeHtml } = YoSoySharedModule;

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
  function renderDashboard(stats) {
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
          <span style="text-transform:capitalize; color:var(--text-muted);">${escapeHtml(label)}</span>
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
                <span>${flag}</span> <span>${escapeHtml(co)}</span>
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
              <div style="font-weight:600; color:#fff;">📍 ${escapeHtml(ci)}</div>
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
              <div style="font-weight:600; color:#fff;">${escapeHtml(name)}</div>
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
            <td><span class="badge-evt ${typeClasses[e.type] || 'badge-view'}">${escapeHtml(e.type.replace('_', ' '))}</span></td>
            <td style="font-size:0.8rem; color:#d6c7b2;">${escapeHtml(locationText)}</td>
            <td style="font-weight:500;">${escapeHtml(detail)}</td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="4" style="text-align:center; color:var(--text-faint); padding:1.5rem;">No hay actividad reciente registrada</td></tr>';
    }
  }

  // Exports del modulo de vista
  window.YoSoyDashView = {
    escapeHtml,
    getFlagEmoji,
    drawTrendChart,
    drawSourceChart,
    renderDashboard
  };
})();
