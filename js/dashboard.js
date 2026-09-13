/* ============================================
   YoSoy222 — Dashboard Engine
   Data processing, pure-canvas charts, metrics & export
   ============================================ */

(function () {
  'use strict';

  let currentDays = 30; // default view range

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
    if (days === 0) return items; // 0 = All time
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return items.filter(i => (i.t || i.timestamp) >= cutoff);
  }

  // Calculate Metrics
  function computeStats(days) {
    const raw = getRawData();
    const sessions = filterByDays(raw.sessions || [], days);
    const events = filterByDays(raw.events || [], days);

    const totalSessions = sessions.length;
    const pageViews = events.filter(e => e.type === 'page_view').length || totalSessions;
    
    // WhatsApp clicks
    const waEvents = events.filter(e => e.type === 'whatsapp_checkout' || e.type === 'whatsapp_contact');
    const waOrders = events.filter(e => e.type === 'whatsapp_checkout');
    
    // Cart Adds
    const cartAdds = events.filter(e => e.type === 'add_to_cart');
    
    // Estimated Revenue from completed WhatsApp clicks
    const totalRevenue = waOrders.reduce((sum, e) => sum + (Number(e.total) || 0), 0);
    
    // Conversion Rate: WhatsApp checkouts / sessions
    const conversionRate = totalSessions > 0 ? ((waEvents.length / totalSessions) * 100).toFixed(1) : '0.0';

    // Funnel
    const viewedProducts = events.filter(e => e.type === 'view_item').length;
    
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

    // Top Searches
    const searches = {};
    events.forEach(e => {
      if (e.type === 'search' && e.query) {
        searches[e.query] = (searches[e.query] || 0) + 1;
      }
    });

    // Group by Day (for charts)
    const dailyMap = {};
    const chartDays = days === 0 ? 30 : days;
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

    return {
      totalSessions,
      pageViews,
      waTotal: waEvents.length,
      waOrders: waOrders.length,
      cartAdds: cartAdds.length,
      totalRevenue,
      conversionRate,
      viewedProducts,
      sources,
      productViews,
      productAdds,
      searches,
      dailyMap,
      recentEvents: events.slice(-15).reverse()
    };
  }

  // Draw Line Chart on Canvas
  function drawTrendChart(canvas, dailyMap) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = canvas.parentElement.clientHeight;

    ctx.clearRect(0, 0, width, height);

    const labels = Object.keys(dailyMap);
    const viewData = labels.map(k => dailyMap[k].views);
    const waData = labels.map(k => dailyMap[k].whatsapp);

    const maxVal = Math.max(...viewData, ...waData, 5);
    const padX = 40;
    const padY = 30;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    // Grid lines
    ctx.strokeStyle = '#e5ded4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = padY + (chartH / 4) * i;
      ctx.moveTo(padX, y);
      ctx.lineTo(width - padX, y);
      ctx.fillStyle = '#8b7a69';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), padX - 8, y + 3);
    }
    ctx.stroke();

    // Helper: draw a series line
    function drawLine(data, strokeColor, fillColor) {
      if (data.length < 2) return;
      ctx.beginPath();
      data.forEach((val, i) => {
        const x = padX + (chartW / (data.length - 1)) * i;
        const y = padY + chartH - (val / maxVal) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Points
      ctx.fillStyle = strokeColor;
      data.forEach((val, i) => {
        const x = padX + (chartW / (data.length - 1)) * i;
        const y = padY + chartH - (val / maxVal) * chartH;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw Views & WhatsApp
    drawLine(viewData, '#854f19');
    drawLine(waData, '#25d366');

    // Bottom Labels
    ctx.fillStyle = '#8b7a69';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    const step = Math.ceil(labels.length / 6);
    labels.forEach((label, i) => {
      if (i % step === 0 || i === labels.length - 1) {
        const x = padX + (chartW / (labels.length - 1)) * i;
        ctx.fillText(label, x, height - 8);
      }
    });
  }

  // Draw Donut Chart for Traffic Sources
  function drawSourceChart(canvas, sources) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = Math.min(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    const keys = Object.keys(sources);
    const total = Object.values(sources).reduce((a, b) => a + b, 0) || 1;

    const colors = {
      instagram: '#e1306c',
      tiktok: '#111111',
      facebook: '#1877f2',
      google_search: '#ea4335',
      whatsapp: '#25d366',
      directo: '#854f19',
      otro_referido: '#a88d74'
    };

    let startAngle = -Math.PI / 2;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.38;
    const innerRadius = size * 0.22;

    if (keys.length === 0) {
      ctx.fillStyle = '#e5ded4';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
      ctx.fill();
      return;
    }

    keys.forEach(k => {
      const val = sources[k];
      const sliceAngle = (val / total) * (Math.PI * 2);
      ctx.fillStyle = colors[k] || '#8b7a69';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fill();
      startAngle += sliceAngle;
    });

    // Inner Text
    ctx.fillStyle = '#2b221a';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${total} Visitas`, centerX, centerY + 4);
  }

  // Render Everything to DOM
  function renderDashboard() {
    const stats = computeStats(currentDays);

    // KPIs
    document.getElementById('kpiViews').textContent = stats.pageViews.toLocaleString();
    document.getElementById('kpiWhatsapp').textContent = stats.waTotal.toLocaleString();
    document.getElementById('kpiCart').textContent = stats.cartAdds.toLocaleString();
    document.getElementById('kpiRevenue').textContent = `$${stats.totalRevenue.toFixed(2)} USD`;
    document.getElementById('kpiConversion').textContent = `${stats.conversionRate}%`;

    // Funnel
    document.getElementById('funnelViews').textContent = stats.pageViews;
    document.getElementById('funnelProducts').textContent = stats.viewedProducts;
    document.getElementById('funnelCart').textContent = stats.cartAdds;
    document.getElementById('funnelWhatsapp').textContent = stats.waTotal;

    const pRate = stats.pageViews > 0 ? ((stats.viewedProducts / stats.pageViews) * 100).toFixed(0) : 0;
    const cRate = stats.viewedProducts > 0 ? ((stats.cartAdds / stats.viewedProducts) * 100).toFixed(0) : 0;
    const wRate = stats.cartAdds > 0 ? ((stats.waTotal / stats.cartAdds) * 100).toFixed(0) : 0;

    document.getElementById('funnelPRate').textContent = `${pRate}% de visitas`;
    document.getElementById('funnelCRate').textContent = `${cRate}% vieron producto`;
    document.getElementById('funnelWRate').textContent = `${wRate}% añadieron`;

    // Draw Charts
    drawTrendChart(document.getElementById('trendCanvas'), stats.dailyMap);
    drawSourceChart(document.getElementById('sourceCanvas'), stats.sources);

    // Render Sources Legend
    const sourceLegend = document.getElementById('sourceLegend');
    if (sourceLegend) {
      sourceLegend.innerHTML = Object.entries(stats.sources).map(([k, v]) => `
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.3rem;">
          <span style="text-transform:capitalize;">${k.replace('_', ' ')}</span>
          <strong>${v} (${((v / (stats.totalSessions || 1)) * 100).toFixed(0)}%)</strong>
        </div>
      `).join('') || '<p style="color:#726252; font-size:0.8rem;">Sin datos en este rango</p>';
    }

    // Render Top Products Table
    const topProdTable = document.getElementById('topProductsTable');
    if (topProdTable) {
      const allNames = Array.from(new Set([...Object.keys(stats.productViews), ...Object.keys(stats.productAdds)]));
      const sorted = allNames.sort((a, b) => ((stats.productViews[b] || 0) + (stats.productAdds[b] || 0)) - ((stats.productViews[a] || 0) + (stats.productAdds[a] || 0))).slice(0, 6);
      
      topProdTable.innerHTML = sorted.map(name => `
        <tr>
          <td><strong>${name}</strong></td>
          <td>${stats.productViews[name] || 0}</td>
          <td>${stats.productAdds[name] || 0}</td>
        </tr>
      `).join('') || '<tr><td colspan="3" style="text-align:center; color:#726252;">Sin productos visualizados aún</td></tr>';
    }

    // Render Recent Events Feed
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
        const detail = e.name || e.query || (e.total ? `$${e.total} USD` : e.src || e.origin || '-');
        return `
          <tr>
            <td>${timeStr}</td>
            <td><span class="badge-event ${typeClasses[e.type] || 'badge-view'}">${e.type.replace('_', ' ')}</span></td>
            <td>${detail}</td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="3" style="text-align:center; color:#726252;">No hay eventos registrados recientemente</td></tr>';
    }
  }

  // Export CSV
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

  // Seed Demo Data (so juancito can immediately see how it looks)
  function seedDemoData() {
    const products = ['Rosa', 'Mini Corazones', 'Armonía Canela', 'Sagrada Familia', 'Gargantilla G-01', 'Pulsera Infinito', 'F-01 Loto Sagrado'];
    const sources = ['instagram', 'instagram', 'tiktok', 'google_search', 'directo', 'whatsapp'];
    const now = Date.now();
    const sessions = [];
    const events = [];

    for (let i = 29; i >= 0; i--) {
      const dayTime = now - (i * 24 * 60 * 60 * 1000);
      const visits = Math.floor(Math.random() * 18) + 8;

      for (let v = 0; v < visits; v++) {
        const sid = 's_' + (dayTime + v);
        const src = sources[Math.floor(Math.random() * sources.length)];
        sessions.push({ id: sid, t: dayTime + v * 1000, src, dev: Math.random() > 0.3 ? 'móvil' : 'ordenador' });
        events.push({ type: 'page_view', t: dayTime + v * 1000, sid, src });

        if (Math.random() > 0.4) {
          const prod = products[Math.floor(Math.random() * products.length)];
          events.push({ type: 'view_item', name: prod, price: 15, t: dayTime + v * 1000 + 500, sid });

          if (Math.random() > 0.5) {
            events.push({ type: 'add_to_cart', name: prod, price: 15, qty: 1, t: dayTime + v * 1000 + 1000, sid });

            if (Math.random() > 0.6) {
              events.push({ type: 'whatsapp_checkout', origin: 'cart_drawer', total: 30, itemsCount: 2, t: dayTime + v * 1000 + 1500, sid });
            }
          }
        }
      }
    }

    localStorage.setItem('yosoy222_analytics', JSON.stringify({ version: 1, sessions, events }));
    renderDashboard();
  }

  // Event Listeners
  document.addEventListener('DOMContentLoaded', () => {
    const rangeSelect = document.getElementById('rangeSelect');
    if (rangeSelect) {
      rangeSelect.addEventListener('change', (e) => {
        currentDays = parseInt(e.target.value, 10);
        renderDashboard();
      });
    }

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
      renderDashboard();
    });

    renderDashboard();
  });
})();
