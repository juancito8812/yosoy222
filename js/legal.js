/* ============================================
   YoSoy222 — Aviso informativo de cookies
   Barra no bloqueante: informa del uso de cookies propias de medición
   (Google Analytics) y enlaza la Política de Privacidad. NO bloquea la
   analítica ni la navegación: el aviso se despide una vez y se recuerda
   en localStorage. Se omite en la propia página de privacidad, donde ya
   se explica todo. Sin dependencias ni estilos inline (CSP estricta).
   ============================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'yosoy222_cookie_notice';

  function yaVisto() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false; // modo privado o almacenamiento bloqueado: mostramos el aviso
    }
  }

  function recordar() {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) { /* sin persistencia: el aviso vuelve en la próxima visita */ }
  }

  function enPaginaDePrivacidad() {
    return /(^|\/)privacidad\.html$/.test(window.location.pathname);
  }

  function rutaPrivacidad() {
    // Las páginas legales viven en /legal/, la tienda en la raíz
    return window.location.pathname.indexOf('/legal/') !== -1
      ? 'privacidad.html'
      : 'legal/privacidad.html';
  }

  function construir() {
    var aviso = document.createElement('aside');
    aviso.className = 'legal-notice';
    aviso.setAttribute('role', 'region');
    aviso.setAttribute('aria-label', 'Aviso de cookies');

    var texto = document.createElement('p');
    texto.textContent = 'Usamos cookies propias para medir cómo se visita el catálogo (Google Analytics). No usamos cookies publicitarias ni vendemos tus datos. ';
    var enlace = document.createElement('a');
    enlace.href = rutaPrivacidad();
    enlace.textContent = 'Política de Privacidad';
    texto.appendChild(enlace);
    texto.appendChild(document.createTextNode('.'));

    var acciones = document.createElement('div');
    acciones.className = 'legal-notice-actions';

    var boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'legal-notice-accept';
    boton.textContent = 'Entendido';
    boton.addEventListener('click', function () {
      recordar();
      aviso.remove();
    });

    acciones.appendChild(boton);
    aviso.appendChild(texto);
    aviso.appendChild(acciones);
    return aviso;
  }

  function iniciar() {
    if (yaVisto() || enPaginaDePrivacidad()) return;
    document.body.appendChild(construir());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();
