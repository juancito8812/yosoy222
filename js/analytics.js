/* ============================================
   YoSoy222 — Analytics & Telemetry Engine
   Client-side event tracking, localStorage telemetry,
   Google Analytics 4 (GA4), and Supabase Cloud Sync.
   ============================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'yosoy222_analytics';
  const SESSION_KEY = 'yosoy222_session_id';
  const MAX_EVENTS = 2000;
  const RETENTION_DAYS = 60;

  // Google Analytics 4 Measurement ID
  const GA_ID = 'G-Y9R0B5NH75';

  // Supabase Cloud Ingestion
  const SUPABASE_URL = 'https://gkekolsttfbiegyhvejy.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZWtvbHN0dGZiaWVneWh2ZWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NzY5NzIsImV4cCI6MjEwNTE1Mjk3Mn0.bzRsjLbjsUMarF3fyilr0koIz9ggt3mBdAYjJESDGXU';

  // Initialize GA4 without inline scripts (100% CSP compliant)
  if (typeof window !== 'undefined' && GA_ID) {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, {
      send_page_view: true
    });

    // Asynchronously inject the official GTM script if not already in markup
    if (!document.querySelector(`script[src*="${GA_ID}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);
    }
  }

  // Helper: Detect referrer / traffic channel
  function detectSource() {
    const ref = document.referrer.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');

    if (utmSource) return utmSource.toLowerCase();
    if (!ref) return 'directo';
    if (ref.includes('instagram.com')) return 'instagram';
    if (ref.includes('tiktok.com')) return 'tiktok';
    if (ref.includes('facebook.com') || ref.includes('fb.me')) return 'facebook';
    if (ref.includes('google.') || ref.includes('bing.') || ref.includes('ecosia.')) return 'google_search';
    if (ref.includes('whatsapp') || ref.includes('wa.me')) return 'whatsapp';
    if (ref.includes('t.co') || ref.includes('twitter.com') || ref.includes('x.com')) return 'twitter_x';
    return 'otro_referido';
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
    const data = getAnalyticsData();
    data.sessions.push({
      id: sid,
      t: Date.now(),
      src: detectSource(),
      dev: detectDevice(),
      path: window.location.pathname
    });
    saveAnalyticsData(data);
  }

  // Cloud Sync to Supabase
  function syncToSupabase(payload) {
    if (!SUPABASE_URL || !SUPABASE_ANON) return;
    try {
      fetch(`${SUPABASE_URL}/rest/v1/yosoy222_events`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_ANON}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    } catch {}
  }

  // Public Tracking API
  function trackEvent(type, details = {}) {
    const src = details.src || detectSource();
    const dev = details.dev || detectDevice();
    const sid = getSessionId();

    const evt = {
      type: String(type || 'custom'),
      t: Date.now(),
      sid: sid,
      src: src,
      dev: dev,
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
      detectDevice
    };

    getSessionId();
    trackEvent('page_view', {
      title: document.title,
      src: detectSource(),
      dev: detectDevice()
    });
  }
})();
