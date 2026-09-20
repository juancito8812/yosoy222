/* ============================================
   YoSoy222 — Utilidades Compartidas
   Código común entre el sitio y el dashboard.
   Consumido por: js/app.js, js/dashboard-view.js
   (la configuración de terceros vive en js/config.js)
   ============================================ */

(function () {
  'use strict';

  /* ----- Security: HTML escaping -----
     Los eventos y datos externos pueden contener contenido inyectado
     por terceros (especialmente el histórico anterior al RLS
     insert-only). Única copia canónica de esta función. */
  const escapeHtml = (str) => {
    if (typeof str === 'number') return String(str);
    if (typeof str !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, (c) => map[c]);
  };

  const api = { escapeHtml };

  if (typeof window !== 'undefined') window.YoSoyShared = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
