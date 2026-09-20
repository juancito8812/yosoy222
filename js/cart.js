/* ============================================
   YoSoy222 — Cart (módulo puro de dominio)
   Totales · Validación · TTL de 30 días
   Sin DOM ni estado: app.js consume esta API.
   ============================================ */

(function () {
  'use strict';

  /* ----- Cart TTL & Calculations (Pure domain logic) ----- */
  const CART_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  function calculateCartTotals(cartItems) {
    const total = (cartItems || []).reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
    const count = (cartItems || []).reduce((s, i) => s + (Number(i.qty) || 0), 0);
    return { total, count };
  }

  function loadCartData(raw, catalog = [], now = Date.now()) {
    if (!raw) return { items: [], expired: false };
    try {
      const parsed = JSON.parse(raw);
      let candidateItems = [];
      let expired = false;

      if (Array.isArray(parsed)) {
        // Legacy cart format (direct array)
        candidateItems = parsed;
      } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
        candidateItems = parsed.items;
        if (parsed.updatedAt !== undefined) {
          const isValidTimestamp = typeof parsed.updatedAt === 'number' && Number.isFinite(parsed.updatedAt) && parsed.updatedAt > 0;
          if (!isValidTimestamp || (now - parsed.updatedAt > CART_TTL_MS)) {
            return { items: [], expired: true };
          }
        }
      } else {
        return { items: [], expired: false };
      }

      const validItems = candidateItems
        .filter(item =>
          item &&
          typeof item.name === 'string' &&
          typeof item.price === 'number' &&
          typeof item.qty === 'number' &&
          Number.isFinite(item.price) &&
          Number.isInteger(item.qty) &&
          item.price >= 0 &&
          item.qty > 0 &&
          item.qty <= 999
        )
        .map(item => {
          const product = (catalog || []).find(p => p.name === item.name);
          if (!product) return null;
          return {
            name: product.name,
            price: product.price,
            qty: item.qty
          };
        })
        .filter(Boolean);

      return { items: validItems, expired };
    } catch {
      return { items: [], expired: false };
    }
  }

  function saveCartData(items, now = Date.now()) {
    return JSON.stringify({
      items: items || [],
      updatedAt: now
    });
  }

  /* ----- Exports ----- */
  const api = { CART_TTL_MS, calculateCartTotals, loadCartData, saveCartData };

  if (typeof window !== 'undefined') window.YoSoyCart = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
