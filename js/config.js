/* ============================================
   YoSoy222 — Configuración Central Compartida
   Única fuente de verdad para claves de terceros.
   Consumido por: js/analytics.js y js/dashboard.js
   NOTA: la clave anon de Supabase es pública por diseño
   (ingesta desde el navegador); su poder lo limita RLS.
   ============================================ */

(function () {
  'use strict';

  window.YoSoyConfig = {
    // Supabase Cloud (ingesta de telemetría)
    SUPABASE_URL: 'https://gkekolsttfbiegyhvejy.supabase.co',
    SUPABASE_ANON: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZWtvbHN0dGZiaWVneWh2ZWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NzY5NzIsImV4cCI6MjEwNTE1Mjk3Mn0.bzRsjLbjsUMarF3fyilr0koIz9ggt3mBdAYjJESDGXU',

    // Google Analytics 4
    GA_ID: 'G-Y9R0B5NH75'
  };
})();
