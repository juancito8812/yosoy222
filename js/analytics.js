/* ============================================
   YoSoy222 — Analytics & Telemetry Engine
   Client-side event tracking, localStorage telemetry,
   and Google Analytics 4 (GA4) integration.
   ============================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'yosoy222_analytics';
  const SESSION_KEY = 'yosoy222_session_id';
  const MAX_EVENTS = 2000;
  const RETENTION_DAYS = 60;

  // Google Analytics 4 Measurement ID
  const GA_ID = 'G-Y9R0B5NH75';

  // Initialize GA4 without inline scripts (100% CSP compliant)
  if (typeof window !== 'undefined' && GA_ID) {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, {
      send_page_view: true
    });

    // Asynchronously inject the official GTM script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
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

  // Public Tracking API
  function trackEvent(type, details = {}) {
    const evt = {
      type: String(type || 'custom'),
      t: Date.now(),
      sid: getSessionId(),
      ...details
    };

    const data = getAnalyticsData();
    data.events.push(evt);
    saveAnalyticsData(data);

    // Forward enriched e-commerce events to GA4
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

  // Track initial page view on load
  if (typeof window !== 'undefined') {
    window.YoSoyAnalytics = {
      track: trackEvent,
      getData: getAnalyticsData,
      clearData: () => localStorage.removeItem(STORAGE_KEY),
      detectSource,
      detectDevice
    };

    // Auto-record page view
    getSessionId();
    trackEvent('page_view', {
      title: document.title,
      src: detectSource(),
      dev: detectDevice()
    });
  }
})();
