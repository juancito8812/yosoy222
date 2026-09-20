/* ============================================
   YoSoy222 — Configuración Central Compartida
   Única fuente de verdad para claves de terceros.
   Consumido por: js/analytics.js y js/dashboard.js
   NOTA: la ingesta de telemetría va vía Edge Function
   (dashboard-stats, acción "track" — sanitización y rate
   limit server-side). No hay claves de base de datos aquí:
   la tabla no acepta lecturas ni inserciones anónimas.
   ============================================ */

(function () {
  'use strict';

  window.YoSoyConfig = {
    // Supabase Cloud (ingesta + lectura global vía Edge Function)
    SUPABASE_URL: 'https://gkekolsttfbiegyhvejy.supabase.co',

    // Google Analytics 4
    GA_ID: 'G-Y9R0B5NH75'
  };
})();
