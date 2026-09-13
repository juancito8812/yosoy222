/* ============================================
   YoSoy222 — App JS
   Search · Filters · Cart with steppers · WhatsApp
   ============================================ */

(function () {
  'use strict';

  /* ----- Global Error Handlers ----- */
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('YoSoy222 UI Error:', event.error || event.message);
    });
    window.addEventListener('unhandledrejection', (event) => {
      console.error('YoSoy222 Promise Rejection:', event.reason);
    });
  }

  /* ----- Config ----- */
  // WhatsApp: único punto de configuración del número de pedidos del sitio.
  // Si cambia el número, editar SOLO esta línea; no copiar el número en index.html.
  const WHATSAPP = '584126481628';

  /* ----- Product data (synced from Catalogo.xlsx) ----- */
    const products = [
  // === VELAS MOLDES (hoja: Velas Moldes) ===
  { file: "VM-ROSA_vela_rosa_79g.jpg", name: "Rosa", cat: "vela", price: 7, desc: "Vela artesanal de 79grs. en forma de Rosa, Elaborada con Cera de Soja en blanco, rosa claro, rosa oscuro. Aroma Coco, Lavanda, Jazmin." },
  { file: "VM-MINICORAZON_vela_mini_corazones.jpg", name: "Mini Corazones", cat: "vela", price: 0.17, desc: "Vela artesanal de 1grs. en forma de Mini corazón, Elaborada con Cera de Soja en blanco, rosa, rojo. Aroma Coco, Jazmin" },
  { file: "VM-ROSAPEQ_vela_rosa_pequena_23g.jpg", name: "Rosa Pequeña", cat: "vela", price: 4.5, desc: "Vela artesanal de 23grs. en forma de Rosa pequeña presentada en palito decorativo. Elaborada con cera de soja en blanco, rosa, amarillo rosa claro. Aroma: Coco Vainilla" },
  { file: "VM-MINIMARGARITA_wax_melts_mini_margarita.jpg", name: "Mini Margarita", cat: "vela", price: 1.7, desc: "Wax Melts 6grs. en forma de Mini Margarita. Elaborada con cera de soja en blanco, rosa, amarillo rosa claro. Aroma: Coco Vainilla, Canela" },
  { file: "VM-MARGARITA_vela_margarita_pequena_16g.jpg", name: "Margarita Pequeña", cat: "vela", price: 3, desc: "Vela artesanal de 16grs. en forma de Margarita pequeña presentada en palito decorativo. Elaborada con cera de soja en blanco, rosa, amarillo rosa claro. Aroma: Coco Vainilla" },
  { file: "VM-TULIPAN_vela_tulipan_pequena_33g.jpg", name: "Tulipán Pequeña", cat: "vela", price: 5, desc: "Vela artesanal de 33grs. en forma deTulipan pequeña presentada en palito decorativo. Elaborada con cera de soja en blanco, rosa, amarillo rosa claro. Aroma: Coco Vainilla, Jazmin" },
  { file: "VM-BOUQUET_vela_bouquet_tulipan_83g.jpg", name: "Bouquet Tulipán", cat: "vela", price: 8.5, desc: "Vela artesanal de 83grs. en forma de Buquet Tulipan. Elaborada con cera de soja en blanco, rojo, amarillo, rosa claro. Aroma: Lavanda, Café" },
  { file: "VM-ESPIRAL_vela_espiral_104g.jpg", name: "Espiral", cat: "vela", price: 9.5, desc: "Vela artesanal de 104grs. en forma de Espiral. Elaborada con cera de soja en blanco, verde, amarillo, azul. Aroma: Lavanda, Jazmin." },
  { file: "VM-SAGRADA_vela_sagrada_familia_75g.jpg", name: "Sagrada Familia", cat: "vela", price: 7, desc: "Vela artesanal de 75grs. en forma de Sagrada Familia. Elaborada con cera de soja en blanco, verde, amarillo, azul, rosa, beige, rojo Aroma: Lavanda, Jazmin. Coco Vainilla" },
  { file: "VM-BUDA_vela_buda_20g.jpg", name: "Buda", cat: "vela", price: 6.5, desc: "Vela artesanal de 20grs. en forma de Buda. Elaborada con cera de soja en blanco, verde, amarillo, azul, rosa, Beige Aroma: Lavanda. Coco Vainilla." },
  { file: "VM-HAMSA_vela_mano_hamsa_75g.jpg", name: "Mano Hamsa", cat: "vela", price: 8, desc: "Vela artesanal de 75grs. en forma de Mano Hamsa. Elaborada con cera de soja en blanco, verde, rosa, beige Aroma: Coco Vainilla. Canela" },
  { file: "VM-CORAZON_vela_corazon_182g.jpg", name: "Corazón", cat: "vela", price: 13.5, desc: "Vela artesanal de 182grs. en forma de Corazón. Elaborada con cera de soja en blanco, rosa, rojo Aroma: Coco Vainilla. Lavanda, Limon Fresh." },
  { file: "VM-CRUZ_vela_cruz_con_paloma_52g.jpg", name: "Cruz con Paloma", cat: "vela", price: 7, desc: "Vela artesanal de 52grs. en forma de Cruz con palomita. Elaborada con cera de soja en blanco con rosa, amarillo, azul Aroma: Coco Vainilla. Jazmin" },
  { file: "VM-CUBO_vela_cubo_40g.jpg", name: "Cubo", cat: "vela", price: 7, desc: "Vela artesanal de 40grs. en forma de Cubo. Elaborada con cera de soja en blanco, amarillo, azul, rosa Aroma: Coco Vainilla. Canela" },
  { file: "VM-VIRGEN_vela_virgen_del_carmen_42g.jpg", name: "Virgen del Carmen", cat: "vela", price: 7, desc: "Vela artesanal de 42grs. en forma de Virgen del Carmen. Elaborada con cera de soja en blanco y dorado Aroma: Coco Vainilla. Canela" },
  // === VELAS ENVASES (hoja: Velas Envases) ===
  { file: "VE-MINIPETIT_vela_mini_petit_123g.jpg", name: "Mini Petit", cat: "vela", price: 7.5, desc: "Vela artesanal de 123grs. Elaborado en envase de vidrio transparente, con tapa metalica dorada. Contiene una base de cera de soja blanca. Aroma: Coco Vainilla" },
  { file: "VE-MANDALA_vela_mandala_98g.jpg", name: "Mandala", cat: "vela", price: 9, desc: "Vela artesanal de 98grs. Elaborada en envase de metal decorativo. Contiene cera blanca. Aroma: limón Fresh" },
  { file: "VE-VINTAGE_vela_vintage_165g.jpg", name: "Vintage", cat: "vela", price: 9.5, desc: "Vela artesanal de 165grs. Elaborado en envase de vidrio transparente, con tapa de corcho. Contiene una base de cera de soja en tonalidades blanco y rosado. Decorado con mecatillo y detalles florales en tono crema. Aroma: Jazmin" },
  { file: "VE-PETIT_vela_petit_171g.jpg", name: "Petit", cat: "vela", price: 11, desc: "Vela artesanal de 171grs. Elaborado en envase de vidrio transparente, con tapa metalica dorada. Contiene una base de cera de soja blanca decorada con corazones rojos en superficie. Aroma: Limón Fresh" },
  { file: "VE-ESTRELLA_vela_estrella_285g.jpg", name: "Estrella", cat: "vela", price: 12, desc: "Vela artesanal de 285grs. Elaborado en envase de vidrio transparente, en forma de estrella. Contiene una base de cera de soja blanca y roja. Aroma: Coco, Café, Jasmin" },
  { file: "VE-AURA-ROSA_vela_aura_rosa_342g.jpg", name: "Aura Rosa", cat: "vela", price: 17, desc: "Vela artesanal de 342grs. Elaborado en envase de vidrio transparente con tapa de madera. Contiene una base de cera de soja blanca, con rosa pequeña en superficie. Aroma: Jazmin" },
  { file: "VE-AURA-TULIPAN_vela_aura_tulipan_335g.jpg", name: "Aura Tulipán", cat: "vela", price: 17, desc: "Vela artesanal de 335grs. Elaborado en envase de vidrio transparente con tapa de madera. Contiene una base de cera de soja blanca, con tulipan pequeña en superficie. Aroma: Coco Vainilla" },
  { file: "VE-AURA-CORAZON_vela_aura_corazones_418g.jpg", name: "Aura Corazones", cat: "vela", price: 20, desc: "Vela artesanal de 418grs. Elaborado en envase de vidrio transparente con tapa de madera. Contiene una base de cera de soja marmoleada con blanco y rosa con corazones rojos en superficie. Aroma: Coco Vainilla" },
  { file: "VE-ARMONIA-CANELA_vela_armonia_canela_508g.jpg", name: "Armonía Canela", cat: "vela", price: 22, desc: "Vela artesanal de 508grs. Elaborado en envase de vidrio opaco con tapa de MDF. Contiene una base de cera de soja color canela y mecha de madera. Aroma: Canela" },
  { file: "Armonia Coco.jpg", name: "Armonía Coco", cat: "vela", price: 23, desc: "Vela artesanal de 516grs. Elaborado en envase de vidrio opaco con tapa de MDF. Contiene una base de cera de soja blanca. Aroma: Coco" },
  // === COLLARES / PULSERAS / ACCESORIOS (hoja: Gargantillas y Pulseras) ===
  { file: "G-01_gargantilla_gold-filled_lisa.jpg", name: "Gargantilla G-01", cat: "collar", price: 20, desc: "Gargantilla de Gold-Filled bañada en oro. Cuenta con broche estilo langosta. Dije de piedra natural a tu elección y un mini dije complementario. Mide 25cm de largo y tiene un grosor de 1,5mm" },
  { file: "G-02_gargantilla_gold-filled_con_dije.jpg", name: "Gargantilla G-02", cat: "collar", price: 25, desc: "Gargantilla de Gold-Filled bañada en oro. Cuenta con broche estilo ancla para un cierre seguro y estetico. Dije de piedra natural a tu elección y un mini dije complementario. Mide 25cm de largo y tiene un grosor de 3mm" },
  { file: "C.M-01_collar_medio_eslabon_29cm.jpg", name: "Collar Medio C.M-01", cat: "collar", price: 25, desc: "Collar Medio de Gold-Filled bañada en oro. Cuenta con broche estilo ancla para un cierre seguro y estetico. Dije de piedra natural a tu elección y un mini dije complementario. Mide 29cm de largo y tiene un grosor de 3mm" },
  { file: "C.M-02_collar_medio_solido_34cm.jpg", name: "Collar Medio C.M-02", cat: "collar", price: 30, desc: "Collar Medio de Gold-Filled bañada en oro. Cuenta con broche estilo ancla para un cierre seguro y estetico. Dije de piedra natural a tu elección y un mini dije complementario. Mide 34cm de largo y tiene un grosor sólido de 4mm" },
  { file: "C.L-01_collar_largo_40cm.jpg", name: "Collar Largo C.L-01", cat: "collar", price: 32, desc: "Collar Largo de Gold-Filled bañada en oro. Cuenta con broche estilo ancla para un cierre seguro y estetico. Dije de piedra natural a tu elección y un mini dije complementario. Mide 40cm de largo y tiene un grosor sólido de 4mm" },
  { file: "P-01b_pulsera_infinito_azul.jpg", name: "Pulsera Infinito Azul", cat: "pulsera", price: 8, desc: "Pulsera Infinito simboliza conexión y propósito. Acompaña tu energía. Trenzado en hilo chino fino. Un amuleto para recordar que todo lo que mereces, permanece." },
  { file: "P-01c_pulsera_infinito_beige.jpg", name: "Pulsera Infinito Beige", cat: "pulsera", price: 8, desc: "Pulsera Infinito simboliza conexión y propósito. Acompaña tu energía. Trenzado en hilo chino fino. Un amuleto para recordar que todo lo que mereces, permanece." },
  { file: "P-01a_pulsera_infinito_roja.jpg", name: "Pulsera Infinito Roja", cat: "pulsera", price: 8, desc: "Pulsera Infinito simboliza conexión y propósito. Acompaña tu energía. Trenzado en hilo chino fino. Un amuleto para recordar que todo lo que mereces, permanece." },
  { file: "P-02_pulsera_san_benito.jpg", name: "Pulsera San Benito", cat: "pulsera", price: 8, desc: "Pulsera San Benito conecta intención y protección. Trenzado en hilo rojo y un dije que acompaña tú energia." },
  { file: "P-03_pulsera_perla.jpg", name: "Pulsera Perla", cat: "pulsera", price: 6, desc: "Pulsera Perla irradia calma y claridad. Trenzado sutil y un centro que refleja luz y quilibrio." },
  { file: "P-04_pulsera_ojito.jpg", name: "Pulsera Ojito", cat: "pulsera", price: 6, desc: "Pulsera Ojito protege y equilibra tu energia. Trenzado en hilo rojo, y un ojo que acompaña tu camino." },
  { file: "D-01_dijes_piedras_naturales.jpg", name: "Piedras Naturales", cat: "otro", price: 7, desc: "Dijes Piedras Naturales. Cada una vibra con intención, protección, claridad, fuerza o calma." },
  // === FRANELAS (hoja: Franelas) ===
  { file: "F-01.jpg", name: "F-01 Loto Sagrado", cat: "franela", price: 16, desc: "Franela que une intención y estilo. El Loto renace, el Om eleva. Tela suave y resistente para acompañar tus días con calma y proposito." },
  { file: "F-02.jpg", name: "F-02 Loto Sagrado", cat: "franela", price: 16, desc: "Franela que une intención y estilo. El Loto renace, el Om eleva. Tela suave y resistente para acompañar tus días con calma y proposito." },
  { file: "F-03.jpg", name: "F-03 Loto Sagrado", cat: "franela", price: 16, desc: "Franela que une intención y estilo. El Loto renace, el Om eleva. Tela suave y resistente para acompañar tus días con calma y proposito." },
  { file: "F-04.jpg", name: "F-04 Ser Feliz", cat: "franela", price: 14, desc: "Franela para mujeres que eligen calma sobre exigencia. Tela suave y diseño minimalista que acompaña tu bienestar. La felicidad es un plan que se viste." },
  { file: "F-05.jpg", name: "F-05 Hazte Caso", cat: "franela", price: 14, desc: "Franela que honra tu intuición. Tela suave y diseño minimalista para acompañar tu energia." },
  { file: "F-06.jpg", name: "F-06 Cool", cat: "franela", price: 14, desc: "Franela que afirma tu valor. Diseño limpio, tela suave y diseño minimalista que eleva tu energia." },
  { file: "F-07.jpg", name: "F-07 El Amor", cat: "franela", price: 14, desc: "Franela que honra el poder del amor. Tela suave, diseño minimalista y un mensaje que ilumina tu energia. El amor da sentido y se siente." },
];

  /* Category mapping for display */
  const catMap = { vela: 'velas', pulsera: 'pulseras', collar: 'collares', franela: 'franelas', otro: 'accesorios' };
  const catLabels = { vela: 'Vela artesanal', pulsera: 'Pulsera artesanal', collar: 'Collar artesanal', franela: 'Franela artesanal', otro: 'Accesorio artesanal' };
  const catNouns = { vela: 'la vela', collar: 'el collar', pulsera: 'la pulsera', franela: 'la franela', otro: 'el accesorio' };

  /* ----- DOM refs ----- */
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];

  /* ----- Security: HTML escaping ----- */
  const escapeHtml = (str) => {
    if (typeof str === 'number') return String(str);
    if (typeof str !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, (c) => map[c]);
  };

  /* ----- Cart TTL & Calculations (Pure domain logic) ----- */
  const CART_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  function calculateCartTotals(cartItems) {
    const total = (cartItems || []).reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
    const count = (cartItems || []).reduce((s, i) => s + (Number(i.qty) || 0), 0);
    return { total, count };
  }

  function filterProductList(items, filter, search, map = catMap) {
    const normSearch = (search || '').trim().toLowerCase();
    return (items || []).filter(p => {
      if (!p || typeof p !== 'object') return false;
      const matchesCat = !filter || filter === 'todos' || (map && map[p.cat] === filter);
      const name = (p.name || '').toLowerCase();
      const desc = (p.desc || '').toLowerCase();
      const matchesSearch = !normSearch || name.includes(normSearch) || desc.includes(normSearch);
      return matchesCat && matchesSearch;
    });
  }

  function loadCartData(raw, catalog = products, now = Date.now()) {
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

  /* ----- Browser DOM & Runtime Initialization ----- */
  if (typeof document !== 'undefined') {
    /* ----- Security & Sync: Validate cart from localStorage and reconcile with catalog ----- */
    function loadCart() {
      try {
        if (typeof localStorage === 'undefined') return [];
        const raw = localStorage.getItem('yosoy222_cart');
        const data = loadCartData(raw, products, Date.now());
        if (data.expired) {
          localStorage.removeItem('yosoy222_cart');
        }
        return data.items;
      } catch {
        return [];
      }
    }

    const header        = $('#header');
  const menuToggle    = $('#menuToggle');
  const nav           = $('#nav');
  const navLinks      = $$('.nav-link');
  const searchInput   = $('#searchInput');
  const filterBtns    = $$('.filter-btn');
  const grid          = $('#productsGrid');
  const resultsCount  = $('#resultsCount');
  const emptyState    = $('#emptyState');
  const clearSearchBtn= $('#clearSearch');
  const cartBtn       = $('#cartBtn');
  const cartOverlay   = $('#cartOverlay');
  const cartDrawer    = $('#cartDrawer');
  const cartClose     = $('#cartClose');
  const cartItems     = $('#cartItems');
  const cartFooter    = $('#cartFooter');
  const cartTotal     = $('#cartTotal');
  const cartCount     = $('#cartCount');
  const cartEmpty     = $('#cartEmpty');
  const cartWhatsapp  = $('#cartWhatsapp');
  const cartBrowse    = $('#cartBrowse');

  /* ----- State ----- */
  let cart = loadCart();
  let activeFilter = 'todos';
  let searchTerm = '';
  let visibleProducts = [];   // products shown by current search + filter (drives the lightbox)
  let currentLightboxIndex = 0;

  /* ============================================
     RENDER PRODUCT GRID from data array
     ============================================ */
  function renderProducts() {
    if (!grid) return;
    // Guard: do not destroy DOM if products are already prerendered in HTML
    if (grid.children.length === products.length) return;
    grid.innerHTML = products.map((p, i) => `
          <article class="product-card" data-index="${i}">
          <button type="button" class="product-image" data-name="${escapeHtml(p.name)}" aria-label="Ampliar imagen de ${escapeHtml(p.name)}">
            <img src="images/thumbs/${escapeHtml(p.file)}?v=9" alt="${escapeHtml(p.name)} artesanal" width="480" height="480" loading="lazy" decoding="async">
          </button>
          <div class="product-info">
            <h3>${escapeHtml(p.name)}</h3>
            <p class="product-category">${escapeHtml(catLabels[p.cat] || 'Producto artesanal')}</p>
            <p class="product-desc">${escapeHtml(p.desc)}</p>
            <div class="product-footer">
              <span class="product-price">$${escapeHtml(p.price)}</span>
              <button class="add-cart-btn" data-name="${escapeHtml(p.name)}" data-price="${escapeHtml(p.price)}">Agregar</button>
            </div>
          </div>
        </article>`).join('');
  }

  /* ============================================
     HEADER — scroll + active nav (Zero-reflow IntersectionObserver)
     ============================================ */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (header) header.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  const sections = $$('section[id]');
  if ('IntersectionObserver' in window && sections.length > 0) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

    sections.forEach(s => navObserver.observe(s));
  }

  /* ============================================
     MOBILE MENU
     ============================================ */
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.classList.toggle('active');
      nav.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.forEach(l => l.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ============================================
     SEARCH + FILTERS
     ============================================ */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      applyFilters();
      if (window.YoSoyAnalytics && activeFilter !== 'todos') {
        window.YoSoyAnalytics.track('filter_category', { category: activeFilter });
      }
    });
  });

  let searchDebounceTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        searchTerm = e.target.value.trim().toLowerCase();
        applyFilters();
        if (window.YoSoyAnalytics && searchTerm) {
          window.YoSoyAnalytics.track('search', { query: searchTerm });
        }
      }, 150);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      clearTimeout(searchDebounceTimer);
      if (searchInput) searchInput.value = '';
      searchTerm = '';
      activeFilter = 'todos';
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      if (filterBtns[0]) {
        filterBtns[0].classList.add('active');
        filterBtns[0].setAttribute('aria-pressed', 'true');
      }
      applyFilters();
    });
  }

  function applyFilters() {
    if (!grid) return;
    visibleProducts = [];
    let count = 0;

    // Cards keep the same order as `products`, so grid.children[i] is product i.
    products.forEach((p, i) => {
      const card = grid.children[i];
      if (!card) return;
      const matchesCat = activeFilter === 'todos' || catMap[p.cat] === activeFilter;
      const name = p.name.toLowerCase();
      const desc = p.desc.toLowerCase();
      const show = matchesCat && (!searchTerm || name.includes(searchTerm) || desc.includes(searchTerm));
      card.classList.toggle('hidden', !show);
      if (show) {
        count++;
        visibleProducts.push(p);
      }
    });

    if (resultsCount) {
      resultsCount.textContent = count < products.length ? `${count} de ${products.length} productos` : '';
    }
    const showEmpty = !!emptyState && count === 0;
    if (emptyState) emptyState.hidden = !showEmpty;
    grid.style.display = showEmpty ? 'none' : '';
  }

  /* ============================================
     CART
     ============================================ */
  let lastFocused = null;

  function openCart() {
    lastFocused = document.activeElement;
    if (cartOverlay) cartOverlay.classList.add('open');
    if (cartDrawer) cartDrawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (cartClose) cartClose.focus();
  }
  function closeCart() {
    if (cartOverlay) cartOverlay.classList.remove('open');
    if (cartDrawer) cartDrawer.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Delegated clicks survive re-renders: qty steppers and remove buttons
  if (cartItems) {
    cartItems.addEventListener('click', (e) => {
      const qtyBtn = e.target.closest('.qty-btn');
      if (qtyBtn) {
        changeQty(parseInt(qtyBtn.dataset.idx, 10), parseInt(qtyBtn.dataset.delta, 10));
        return;
      }
      const removeBtn = e.target.closest('.cart-item-remove');
      if (removeBtn) removeItem(parseInt(removeBtn.dataset.idx, 10));
    });
  }

  if (cartBrowse) {
    cartBrowse.addEventListener('click', (e) => {
      e.preventDefault();
      closeCart();
      const target = document.querySelector('#catalogo');
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    });
  }

  function addToCart(btn) {
    if (!btn || !btn.dataset) return;
    const name = btn.dataset.name;
    const product = products.find(p => p.name === name);
    if (!product) return;

    const existing = cart.find(item => item.name === product.name);
    if (existing) {
      existing.qty = Math.min(existing.qty + 1, 999);
    } else {
      cart.push({ name: product.name, price: product.price, qty: 1 });
    }

    btn.classList.add('added');
    const orig = btn.textContent;
    btn.textContent = '✓ Agregado';
    setTimeout(() => { btn.classList.remove('added'); btn.textContent = orig; }, 900);

    saveCart();
    renderCart();
    bumpCount();

    if (window.YoSoyAnalytics) {
      window.YoSoyAnalytics.track('add_to_cart', { name: product.name, price: product.price, cat: product.cat });
    }
  }

  function bumpCount() {
    if (!cartCount) return;
    cartCount.classList.add('bump');
    setTimeout(() => cartCount.classList.remove('bump'), 200);
  }

  function changeQty(index, delta) {
    const idx = Number(index);
    if (!Number.isInteger(idx) || idx < 0 || idx >= cart.length) return;
    const item = cart[idx];
    if (!item) return;
    const deltaNum = Number(delta);
    if (!Number.isInteger(deltaNum)) return;
    const newQty = item.qty + deltaNum;
    if (newQty <= 0) {
      cart.splice(idx, 1);
    } else {
      item.qty = Math.min(newQty, 999);
    }
    saveCart();
    renderCart();
  }

  function removeItem(index) {
    const idx = Number(index);
    if (!Number.isInteger(idx) || idx < 0 || idx >= cart.length) return;
    cart.splice(idx, 1);
    saveCart();
    renderCart();
  }

  function saveCart() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('yosoy222_cart', saveCartData(cart, Date.now()));
      }
    } catch {
      // Ignore quota errors in private browsing
    }
  }

  function renderCart() {
    const { total, count } = calculateCartTotals(cart);

    cartCount.textContent = count;
    cartBtn.setAttribute('aria-label', `Abrir carrito, ${count} productos`);

    if (cart.length === 0) {
      cartItems.replaceChildren(cartEmpty);
      cartEmpty.hidden = false;
      cartFooter.hidden = true;
      return;
    }

    cartFooter.hidden = false;
    cartTotal.textContent = `$${total.toFixed(2)} USD`;

    cartItems.innerHTML = cart.map((item, i) => `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>${escapeHtml(item.name)}</h4>
            <div class="cart-item-meta">
              <div class="qty-stepper">
                <button class="qty-btn" data-idx="${escapeHtml(i)}" data-delta="-1" aria-label="Reducir cantidad">−</button>
                <span class="qty-value">${escapeHtml(item.qty)}</span>
                <button class="qty-btn" data-idx="${escapeHtml(i)}" data-delta="1" aria-label="Aumentar cantidad">+</button>
              </div>
              <button class="cart-item-remove" data-idx="${escapeHtml(i)}" aria-label="Eliminar ${escapeHtml(item.name)}">Eliminar</button>
            </div>
          </div>
          <span class="cart-item-price">$${escapeHtml((item.price * item.qty).toFixed(2))}</span>
        </div>`).join('');

    // WhatsApp link
    const lines = cart.map(i => `• ${i.name} x${i.qty} — $${(i.price * i.qty).toFixed(2)}`);
    const msg = encodeURIComponent(
      `Hola YoSoy222 👋\n\nMe gustaría hacer este pedido:\n\n${lines.join('\n')}\n\n*Total: $${total.toFixed(2)} USD*\n\n¡Gracias! 🕯️`
    );
    cartWhatsapp.href = `https://wa.me/${WHATSAPP}?text=${msg}`;
  }

  /* ============================================
     SMOOTH SCROLL (anchor links)
     ============================================ */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      closeCart();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 80,
        behavior: 'smooth'
      });
    });
  });

  /* ============================================
     LIGHTBOX
     ============================================ */
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxName = $('#lightboxName');
  const lightboxDesc = $('#lightboxDesc');
  const lightboxPrice = $('#lightboxPrice');
  const lightboxCounter = $('#lightboxCounter');
  const lightboxWhatsapp = $('#lightboxWhatsapp');
  const lightboxClose = $('#lightboxClose');
  const lightboxPrev = $('#lightboxPrev');
  const lightboxNext = $('#lightboxNext');

  function openLightbox(index) {
    // `index` points into `products`; map it to its position among the visible products
    const targetProduct = products[index];
    currentLightboxIndex = visibleProducts.indexOf(targetProduct);
    if (currentLightboxIndex === -1) currentLightboxIndex = 0;

    lastFocused = document.activeElement;
    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();

    if (window.YoSoyAnalytics && targetProduct) {
      window.YoSoyAnalytics.track('view_item', { name: targetProduct.name, cat: targetProduct.cat, price: targetProduct.price });
    }
  }

  function closeLightboxFn() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  }

  function updateLightboxContent() {
    const p = visibleProducts[currentLightboxIndex];
    if (!p) return;
    
    // Add cache-busting query string to force image refresh
    lightboxImg.src = `images/catalog/${p.file}?v=9`;
    lightboxImg.alt = `${p.name} artesanal`;
    lightboxName.textContent = p.name;
    lightboxDesc.textContent = p.desc;
    lightboxPrice.textContent = `$${p.price.toFixed(2)}`;
    lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${visibleProducts.length}`;
    
    const noun = catNouns[p.cat] || 'este producto';
    lightboxWhatsapp.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola! Me interesa ${noun} ${p.name}`)}`;
  }

  function lightboxPrevFn() {
    if (!visibleProducts.length) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + visibleProducts.length) % visibleProducts.length;
    updateLightboxContent();
  }

  function lightboxNextFn() {
    if (!visibleProducts.length) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % visibleProducts.length;
    updateLightboxContent();
  }

  // Event delegation for product cards: "Agregar" adds to cart, clicking elsewhere opens the lightbox
  if (grid) {
    grid.addEventListener('click', (e) => {
      const addBtn = e.target.closest('.add-cart-btn');
      if (addBtn) {
        addToCart(addBtn);
        return;
      }
      const card = e.target.closest('.product-card');
      if (card) openLightbox(parseInt(card.dataset.index, 10));
    });
  }

  // Lightbox controls
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightboxFn);
  if (lightboxPrev) lightboxPrev.addEventListener('click', lightboxPrevFn);
  if (lightboxNext) lightboxNext.addEventListener('click', lightboxNextFn);

  // Close on overlay click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightboxFn();
    });
  }

  // Analytics tracking for conversions
  if (cartWhatsapp) {
    cartWhatsapp.addEventListener('click', () => {
      const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const count = cart.reduce((s, i) => s + i.qty, 0);
      if (window.YoSoyAnalytics) {
        window.YoSoyAnalytics.track('whatsapp_checkout', {
          origin: 'cart_drawer',
          total: Number(total.toFixed(2)),
          itemsCount: count
        });
      }
    });
  }

  if (lightboxWhatsapp) {
    lightboxWhatsapp.addEventListener('click', () => {
      const p = visibleProducts[currentLightboxIndex];
      if (window.YoSoyAnalytics && p) {
        window.YoSoyAnalytics.track('whatsapp_contact', {
          origin: 'lightbox',
          product: p.name,
          price: p.price
        });
      }
    });
  }

  const floatWa = $('.whatsapp-float');
  if (floatWa) {
    floatWa.addEventListener('click', () => {
      if (window.YoSoyAnalytics) {
        window.YoSoyAnalytics.track('whatsapp_contact', { origin: 'floating_button' });
      }
    });
  }

  $$('.contact-link').forEach(link => {
    link.addEventListener('click', () => {
      const nameEl = link.querySelector('.contact-name');
      const channel = nameEl ? nameEl.textContent : 'direct';
      if (window.YoSoyAnalytics) {
        window.YoSoyAnalytics.track('channel_click', { channel });
      }
    });
  });

  // Keyboard navigation + focus trap (cart, lightbox, and mobile nav)
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
  document.addEventListener('keydown', (e) => {
    const lightboxActive = lightbox && lightbox.classList.contains('active');
    const cartActive = cartDrawer && cartDrawer.classList.contains('open');
    const navActive = nav && nav.classList.contains('open');

    if (e.key === 'Escape') {
      if (lightboxActive) { closeLightboxFn(); return; }
      if (cartActive) { closeCart(); return; }
      if (navActive && menuToggle) {
        menuToggle.classList.remove('active');
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
        return;
      }
    }

    if (lightboxActive) {
      if (e.key === 'ArrowLeft') lightboxPrevFn();
      if (e.key === 'ArrowRight') lightboxNextFn();
    }

    if (e.key !== 'Tab') return;
    const container = lightboxActive ? lightbox : (cartActive ? cartDrawer : (navActive ? nav : null));
    if (!container) return;
    const focusables = [...container.querySelectorAll(FOCUSABLE)]
      .filter(el => el.offsetParent !== null && !el.hasAttribute('hidden'));
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (!container.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
      return;
    }

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ============================================
     INIT
     ============================================ */
  renderProducts();
  applyFilters();
  renderCart();
  // Note: active nav highlighting is managed by IntersectionObserver

  /* ============================================
     PWA — Register Service Worker + offline catalog precache
     ============================================ */
  function catalogUrls() {
    // Only precache thumbnails for offline browsing; catalog full images load on-demand
    return products.map(p => `images/thumbs/${p.file}?v=9`);
  }

  function requestCatalogPrecache(reg) {
    const urls = catalogUrls();
    const worker = (navigator.serviceWorker.controller || reg.active);
    if (worker) worker.postMessage({ type: 'PRECACHE_IMAGES', urls });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                requestCatalogPrecache(reg);
              }
            });
          });
        })
        .catch(() => {});
    });

    // First activation (skipWaiting + clients.claim) also triggers precache and UI refresh
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      navigator.serviceWorker.ready.then(requestCatalogPrecache);
      renderProducts();
      applyFilters();
    });
  }
}

  /* ----- Testing / Node.js exports ----- */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      CART_TTL_MS,
      calculateCartTotals,
      filterProductList,
      loadCartData,
      saveCartData,
      products,
      catMap,
      escapeHtml
    };
  }
})();

