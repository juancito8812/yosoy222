/* ============================================
   YoSoy222 — Analytics & Telemetry Engine
   Client-side event tracking, localStorage telemetry,
   Geolocation (Country & City), GA4 and Supabase Cloud.
   ============================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'yosoy222_analytics';
  const SESSION_KEY = 'yosoy222_session_id';
  const GEO_KEY = 'yosoy222_geo_data';
  const MAX_EVENTS = 2000;
  const RETENTION_DAYS = 60;

  const SUPABASE_URL = (window.YoSoyConfig && window.YoSoyConfig.SUPABASE_URL) || '';
  // Nota: la ingesta NO usa clave anon — va vía Edge Function (acción "track",
  // sanitización + rate limit server-side). Ver js/config.js.

  // Google Analytics 4 Measurement ID
  const GA_ID = (window.YoSoyConfig && window.YoSoyConfig.GA_ID) || '';

  // Initialize GA4 without inline scripts (100% CSP compliant)
  if (typeof window !== 'undefined' && GA_ID) {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, {
      send_page_view: true
    });

    // Carga diferida: gtag.js NO compite con el LCP. Se inyecta tras la
    // primera interacción (el stub de arriba encola los eventos mientras
    // tanto) o a los 8s como red de seguridad para sesiones sin interacción
    // (rebotes y lectores silenciosos).
    if (!document.querySelector(`script[src*="${GA_ID}"]`)) {
      let ga4Loaded = false;
      const loadGa4 = () => {
        if (ga4Loaded) return;
        ga4Loaded = true;
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);
      };
      ['pointerdown', 'keydown', 'touchstart'].forEach(evt =>
        window.addEventListener(evt, loadGa4, { once: true, passive: true, capture: true })
      );
      setTimeout(loadGa4, 8000);
    }
  }

  // Helper: Detect Geolocation (Country & City) asynchronously
  function getCachedGeo() {
    try {
      const cached = sessionStorage.getItem(GEO_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
    return { country: 'Venezuela', city: 'Caracas', code: 'VE' };
  }

  // Fetch Geo in background on session start
  if (typeof window !== 'undefined' && !sessionStorage.getItem(GEO_KEY)) {
    fetch('https://get.geojs.io/v1/ip/geo.json')
      .then(r => r.json())
      .then(data => {
        if (data && data.country) {
          const geo = {
            country: data.country || 'Venezuela',
            city: data.city || 'Caracas',
            code: data.country_code || 'VE'
          };
          sessionStorage.setItem(GEO_KEY, JSON.stringify(geo));
        }
      })
      .catch(() => {
        // Fallback: estimate from Intl TimeZone
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
          let country = 'Venezuela';
          let city = 'Caracas';
          let code = 'VE';
          if (tz.includes('Caracas')) { country = 'Venezuela'; city = 'Caracas'; code = 'VE'; }
          else if (tz.includes('Bogota')) { country = 'Colombia'; city = 'Bogotá'; code = 'CO'; }
          else if (tz.includes('Madrid')) { country = 'España'; city = 'Madrid'; code = 'ES'; }
          else if (tz.includes('New_York') || tz.includes('Miami')) { country = 'Estados Unidos'; city = 'Miami'; code = 'US'; }
          sessionStorage.setItem(GEO_KEY, JSON.stringify({ country, city, code }));
        } catch {}
      });
  }

  // Helper: Detect referrer / traffic channel & PWA standalone mode
  function detectSource() {
    const isPWA = (typeof window !== 'undefined') && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
    const ref = document.referrer.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');

    if (utmSource) return utmSource.toLowerCase();
    if (!ref && isPWA) return 'pwa_app';
    if (!ref) return 'directo';
    if (ref.includes('instagram.com')) return 'instagram';
    if (ref.includes('tiktok.com')) return 'tiktok';
    if (ref.includes('facebook.com') || ref.includes('fb.me')) return 'facebook';
    if (ref.includes('google.') || ref.includes('bing.') || ref.includes('ecosia.')) return 'google_search';
    if (ref.includes('whatsapp') || ref.includes('wa.me')) return 'whatsapp';
    if (ref.includes('t.co') || ref.includes('twitter.com') || ref.includes('x.com')) return 'twitter_x';
    return isPWA ? 'pwa_app' : 'otro_referido';
  }

  // Helper: Detect Device
  function detectDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'móvil' : 'ordenador';
  }

  // Helper: Get or create session ID
  function getSessionId() {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 's_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      sessionStorage.setItem(SESSION_KEY, sid);
      
      // Record new session
      trackSession(sid);
    }
    return sid;
  }

  // Storage handlers with retention cleanup
  function getAnalyticsData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { version: 1, sessions: [], events: [] };
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return { version: 1, sessions: [], events: [] };
      data.sessions = Array.isArray(data.sessions) ? data.sessions : [];
      data.events = Array.isArray(data.events) ? data.events : [];
      return data;
    } catch {
      return { version: 1, sessions: [], events: [] };
    }
  }

  function saveAnalyticsData(data) {
    try {
      const cutoff = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
      data.events = data.events.filter(e => e.t >= cutoff).slice(-MAX_EVENTS);
      data.sessions = data.sessions.filter(s => s.t >= cutoff).slice(-500);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota exceeded errors
    }
  }

  function trackSession(sid) {
    const geo = getCachedGeo();
    const data = getAnalyticsData();
    data.sessions.push({
      id: sid,
      t: Date.now(),
      src: detectSource(),
      dev: detectDevice(),
      country: geo.country,
      city: geo.city,
      path: window.location.pathname
    });
    saveAnalyticsData(data);
  }

  // Cloud Sync to Supabase — vía Edge Function (service_role server-side).
  // Reemplaza el INSERT directo con la clave anon (removida de config.js).
  function syncToSupabase(payload) {
    if (!SUPABASE_URL) return;
    try {
      fetch(`${SUPABASE_URL}/functions/v1/dashboard-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'track', ...payload }),
        keepalive: true
      }).catch(() => {});
    } catch {}
  }

  // Public Tracking API
  function trackEvent(type, details = {}) {
    const src = details.src || detectSource();
    const dev = details.dev || detectDevice();
    const sid = getSessionId();
    const geo = getCachedGeo();
    const country = details.country || geo.country || 'Venezuela';
    const city = details.city || geo.city || 'Caracas';

    const evt = {
      type: String(type || 'custom'),
      t: Date.now(),
      sid: sid,
      src: src,
      dev: dev,
      country: country,
      city: city,
      ...details
    };

    // 1. Local Storage Cache
    const data = getAnalyticsData();
    data.events.push(evt);
    saveAnalyticsData(data);

    // 2. Global Cloud Sync (Supabase)
    const sbPayload = {
      event_type: String(type || 'custom'),
      session_id: sid,
      source: src,
      device: dev,
      country: country,
      city: city,
      product_name: details.name || details.product || null,
      product_price: Number(details.price) || null,
      product_cat: details.cat || null,
      query: details.query || null,
      total_amount: Number(details.total) || null,
      items_count: Number(details.itemsCount) || (type === 'add_to_cart' ? Number(details.qty) || 1 : null)
    };
    syncToSupabase(sbPayload);

    // 3. Google Analytics 4 Forwarding
    if (typeof window.gtag === 'function' && GA_ID) {
      try {
        if (type === 'view_item') {
          window.gtag('event', 'view_item', {
            currency: 'USD',
            value: Number(details.price) || 0,
            items: [{ item_name: details.name, item_category: details.cat, price: details.price }]
          });
        } else if (type === 'add_to_cart') {
          window.gtag('event', 'add_to_cart', {
            currency: 'USD',
            value: Number(details.price) || 0,
            items: [{ item_name: details.name, item_category: details.cat, price: details.price, quantity: details.qty || 1 }]
          });
        } else if (type === 'whatsapp_checkout') {
          window.gtag('event', 'begin_checkout', {
            currency: 'USD',
            value: Number(details.total) || 0,
            items_count: details.itemsCount || 1
          });
          window.gtag('event', 'generate_lead', {
            currency: 'USD',
            value: Number(details.total) || 0,
            lead_type: 'whatsapp_order'
          });
        } else if (type === 'whatsapp_contact') {
          window.gtag('event', 'contact', {
            method: 'whatsapp',
            product: details.product || 'general'
          });
        } else if (type === 'search') {
          window.gtag('event', 'search', {
            search_term: details.query
          });
        } else {
          window.gtag('event', type, details);
        }
      } catch {}
    }
  }

  // Auto-record initial page view on load
  if (typeof window !== 'undefined') {
    window.YoSoyAnalytics = {
      track: trackEvent,
      getData: getAnalyticsData,
      clearData: () => localStorage.removeItem(STORAGE_KEY),
      detectSource,
      detectDevice,
      getGeo: getCachedGeo
    };

    getSessionId();
    trackEvent('page_view', {
      title: document.title,
      src: detectSource(),
      dev: detectDevice()
    });
  }
})();
