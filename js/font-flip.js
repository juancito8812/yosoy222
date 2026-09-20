/* ============================================
   YoSoy222 — Flip de CSS de fuentes async
   El <link data-async-fonts> carga con media="print"
   (no bloquea el primer pintado). Este script lo aplica
   a all al terminar de cargar: el texto pinta primero en
   fallback (Georgia/serif) y hace swap a las fuentes web.
   La CSP no permite handlers inline (onload="..."), así
   que el flip vive aquí. Sin dependencias.
   ============================================ */

(function () {
  'use strict';

  var link = document.querySelector('link[data-async-fonts]');
  if (!link) return;

  function apply() {
    link.media = 'all';
  }

  if (link.sheet) {
    // Ya cargó (caso SW/cache): aplicar de inmediato
    apply();
  } else {
    link.addEventListener('load', apply);
    // Red de seguridad: si el evento no llega (error, caché rara),
    // el texto queda legible en fallback y no rompe nada.
    link.addEventListener('error', apply);
  }
})();
