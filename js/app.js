/* ============================================
   YoSoy222 — App JS
   Search · Filters · Cart with steppers · WhatsApp
   ============================================ */

(function () {
  'use strict';

  /* ----- Config ----- */
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
  { file: "VM-SAGRADA_vela_sagrada_familia_75g.jpg", name: "Sagrada Familia", cat: "vela", price: 7, desc: "Vela artesanal de 75grs. en forma de Sagrada Familia. Elaborada con cera de soja en blanco, verde, amarillo, azul, rosa Aroma: Lavanda, Jazmin. Coco Vainilla." },
  { file: "VM-BUDA_vela_buda_20g.jpg", name: "Buda", cat: "vela", price: 6.5, desc: "Vela artesanal de 20grs. en forma de Buda. Elaborada con cera de soja en blanco, verde, amarillo, azul, rosa, Beige Aroma: Lavanda. Coco Vainilla." },
  { file: "VM-HAMSA_vela_mano_hamsa_75g.jpg", name: "Mano Hamsa", cat: "vela", price: 8, desc: "Vela artesanal de 75grs. en forma de Mano Hamsa. Elaborada con cera de soja en blanco, verde, rosa, beige Aroma: Coco Vainilla. Canela" },
  { file: "VM-CORAZON_vela_corazon_182g.jpg", name: "Corazón", cat: "vela", price: 13.5, desc: "Vela artesanal de 182grs. en forma de Corazón. Elaborada con cera de soja en blanco, rosa, rojo Aroma: Coco Vainilla. Lavanda, Limon Fresh." },
  { file: "VM-CRUZ_vela_cruz_con_paloma_52g.jpg", name: "Cruz con Paloma", cat: "vela", price: 7, desc: "Vela artesanal de 52grs. en forma de Cruz con palomita. Elaborada con cera de soja en blanco con rosa, amarillo, azul Aroma: Coco Vainilla. Jazmin" },
  { file: "VM-CUBO_vela_cubo_40g.jpg", name: "Cubo", cat: "vela", price: 7, desc: "Vela artesanal de 40grs. en forma de Cubo. Elaborada con cera de soja en blanco, amarillo, azul, rosa Aroma: Coco Vainilla. Canela" },
  { file: "VM-VIRGEN_vela_virgen_del_carmen_42g.jpg", name: "Virgen del Carmen", cat: "vela", price: 7, desc: "Vela artesanal de 42grs. en forma de Virgen del Carmen. Elaborada con cera de soja en blanco, amarillo, azul, rosa Aroma: Coco Vainilla. Canela" },
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
  { file: "P-01b_pulsera_infinito_azul.jpg", name: "Pulsera Infinito", cat: "pulsera", price: 8, desc: "Pulsera Infinito simboliza conexión y propósito. Trenzado en hilo rojo, azul, beis acompaña tu energia. Un amuleto para recordar que todo lo que mereces, permeanece." },
  { file: "P-01c_pulsera_infinito_beige.jpg", name: "Pulsera Infinito Beige", cat: "pulsera", price: 8, desc: "Pulsera Infinito simboliza conexión y propósito. Trenzado en hilo rojo, azul, beis acompaña tu energia. Un amuleto para recordar que todo lo que mereces, permeanece." },
  { file: "P-01a_pulsera_infinito_roja.jpg", name: "Pulsera Infinito Roja", cat: "pulsera", price: 8, desc: "Pulsera Infinito simboliza conexión y propósito. Trenzado en hilo rojo, azul, beis acompaña tu energia. Un amuleto para recordar que todo lo que mereces, permeanece." },
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
    if (typeof str !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, (c) => map[c]);
  };

  /* ----- Security: Validate cart from localStorage ----- */
  function loadCart() {
    try {
      const raw = localStorage.getItem('yosoy222_cart');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(item =>
        item &&
        typeof item.name === 'string' &&
        typeof item.price === 'number' &&
        typeof item.qty === 'number' &&
        item.price >= 0 &&
        item.qty > 0 &&
        item.qty <= 999
      );
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
    grid.innerHTML = products.map((p, i) => `
          <article class="product-card" data-index="${i}">
          <button type="button" class="product-image" data-name="${escapeHtml(p.name)}" aria-label="Ampliar imagen de ${escapeHtml(p.name)}">
            <img src="images/thumbs/${escapeHtml(p.file)}" alt="${escapeHtml(p.name)} artesanal" loading="lazy">
          </button>
          <div class="product-info">
            <h3>${escapeHtml(p.name)}</h3>
            <p class="product-category">${escapeHtml(catLabels[p.cat] || 'Producto artesanal')}</p>
            <p class="product-desc">${escapeHtml(p.desc)}</p>
            <div class="product-footer">
              <span class="product-price">$${p.price}</span>
              <button class="add-cart-btn" data-name="${escapeHtml(p.name)}" data-price="${p.price}">Agregar</button>
            </div>
          </div>
        </article>`).join('');
  }

  /* ============================================
     HEADER — scroll + active nav
     ============================================ */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 40);
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  });

  const sections = $$('section[id]');
  function updateActiveNav() {
    const y = window.scrollY + 120;
    for (const s of sections) {
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + s.id));
        break;
      }
    }
  }

  /* ============================================
     MOBILE MENU
     ============================================ */
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.classList.toggle('active');
    nav.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', open);
  });
  navLinks.forEach(l => l.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  /* ============================================
     SEARCH + FILTERS
     ============================================ */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchTerm = '';
      activeFilter = 'todos';
      filterBtns.forEach(b => b.classList.remove('active'));
      filterBtns[0].classList.add('active');
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
  function openCart() {
    cartOverlay.classList.add('open');
    cartDrawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartOverlay.classList.remove('open');
    cartDrawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // Delegated clicks survive re-renders: qty steppers and remove buttons
  cartItems.addEventListener('click', (e) => {
    const qtyBtn = e.target.closest('.qty-btn');
    if (qtyBtn) {
      changeQty(parseInt(qtyBtn.dataset.idx, 10), parseInt(qtyBtn.dataset.delta, 10));
      return;
    }
    const removeBtn = e.target.closest('.cart-item-remove');
    if (removeBtn) removeItem(parseInt(removeBtn.dataset.idx, 10));
  });

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
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }

    btn.classList.add('added');
    const orig = btn.textContent;
    btn.textContent = '✓ Agregado';
    setTimeout(() => { btn.classList.remove('added'); btn.textContent = orig; }, 900);

    saveCart();
    renderCart();
    bumpCount();
    openCart();
  }

  function bumpCount() {
    cartCount.classList.add('bump');
    setTimeout(() => cartCount.classList.remove('bump'), 200);
  }

  function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    saveCart();
    renderCart();
  }

  function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
  }

  function saveCart() {
    localStorage.setItem('yosoy222_cart', JSON.stringify(cart));
  }

  function renderCart() {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const count = cart.reduce((s, i) => s + i.qty, 0);

    cartCount.textContent = count;

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
                <button class="qty-btn" data-idx="${i}" data-delta="-1" aria-label="Reducir cantidad">−</button>
                <span class="qty-value">${item.qty}</span>
                <button class="qty-btn" data-idx="${i}" data-delta="1" aria-label="Aumentar cantidad">+</button>
              </div>
              <button class="cart-item-remove" data-idx="${i}" aria-label="Eliminar ${escapeHtml(item.name)}">Eliminar</button>
            </div>
          </div>
          <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
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
    currentLightboxIndex = visibleProducts.findIndex(p => p.name === targetProduct.name);
    if (currentLightboxIndex === -1) currentLightboxIndex = 0;

    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightboxFn() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightboxContent() {
    const p = visibleProducts[currentLightboxIndex];
    if (!p) return;
    
    lightboxImg.src = `images/catalog/${p.file}`;
    lightboxImg.alt = `${p.name} artesanal`;
    lightboxName.textContent = p.name;
    lightboxDesc.textContent = p.desc;
    lightboxPrice.textContent = `$${p.price.toFixed(2)}`;
    lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${visibleProducts.length}`;
    
    const noun = catNouns[p.cat] || 'este producto';
    lightboxWhatsapp.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola! Me interesa ${noun} ${p.name}`)}`;
  }

  function lightboxPrevFn() {
    currentLightboxIndex = (currentLightboxIndex - 1 + visibleProducts.length) % visibleProducts.length;
    updateLightboxContent();
  }

  function lightboxNextFn() {
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

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightboxFn();
    if (e.key === 'ArrowLeft') lightboxPrevFn();
    if (e.key === 'ArrowRight') lightboxNextFn();
  });

  /* ============================================
     INIT
     ============================================ */
  renderProducts();
  applyFilters();
  renderCart();
  updateActiveNav();

  /* ============================================
     PWA — Register Service Worker
     ============================================ */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered:', reg.scope);
          
          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                console.log('[PWA] New version available!');
                // Could show an update banner here
              }
            });
          });
        })
        .catch((err) => {
          console.log('[PWA] Service Worker registration failed:', err);
        });
    });
  }

})();
