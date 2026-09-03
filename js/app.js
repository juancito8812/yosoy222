/* ============================================
   YoSoy222 — App JS
   Search · Filters · Cart with steppers · WhatsApp
   ============================================ */

(function () {
  'use strict';

  /* ----- Config ----- */
  const WHATSAPP = '521XXXXXXXXXX';

  /* ----- Product data (from catalog Excel) ----- */
  const products = [
    // === VELAS MOLDES ===
    { file: "Rosa .jpg", name: "Rosa", cat: "vela", price: 7, desc: "Vela artesanal de 79grs. en forma de Rosa" },
    { file: "Mini Corazones.jpg", name: "Mini Corazones", cat: "vela", price: 0.17, desc: "Wax Melts 1grs. en forma de Mini corazón" },
    { file: "Rosa Pequeña.jpg", name: "Rosa Pequeña", cat: "vela", price: 4.5, desc: "Vela artesanal de 23grs. en forma de Rosa pequeña" },
    { file: "Mini Margarita.jpg", name: "Mini Margarita", cat: "vela", price: 1.7, desc: "Wax Melts 6grs. en forma de Mini Margarita" },
    { file: "Margarita.jpg", name: "Margarita", cat: "vela", price: 3, desc: "Vela artesanal de 16grs. en forma de Margarita pequeña" },
    { file: "Tulipan.jpg", name: "Tulipán", cat: "vela", price: 5, desc: "Vela artesanal de 33grs. en forma de Tulipan pequeña" },
    { file: "Buquet .jpg", name: "Buquet Tulipán", cat: "vela", price: 8.5, desc: "Vela artesanal de 83grs. en forma de Buquet Tulipan" },
    { file: "Espiral.jpg", name: "Espiral", cat: "vela", price: 9.5, desc: "Vela artesanal de 104grs. en forma de Espiral" },
    { file: "Sagrada Familia.jpg", name: "Sagrada Familia", cat: "vela", price: 7, desc: "Vela artesanal de 75grs. en forma de Sagrada Familia" },
    { file: "Buda.jpg", name: "Buda", cat: "vela", price: 6.5, desc: "Vela artesanal de 20grs. en forma de Buda" },
    { file: "Hamsa .jpg", name: "Hamsa", cat: "vela", price: 8, desc: "Vela artesanal de 75grs. en forma de Mano Hamsa" },
    { file: "Corazón .jpg", name: "Corazón", cat: "vela", price: 13.5, desc: "Vela artesanal de 182grs. en forma de Corazón" },
    { file: "Cruz .jpg", name: "Cruz con Paloma", cat: "vela", price: 7, desc: "Vela artesanal de 52grs. en forma de Cruz con palomita" },
    { file: "Cubo .jpg", name: "Cubo", cat: "vela", price: 7, desc: "Vela artesanal de 40grs. en forma de Cubo" },
    { file: "Virgen del Carmen.jpg", name: "Virgen del Carmen", cat: "vela", price: 7, desc: "Vela artesanal de 42grs. en forma de Virgen del Carmen" },
    { file: "Mini Girasol.jpg", name: "Mini Girasol", cat: "vela", price: 1.7, desc: "Wax Melts en forma de Mini Girasol" },
    { file: "Estrella.jpg", name: "Estrella", cat: "vela", price: 7, desc: "Vela artesanal en forma de Estrella" },
    { file: "Corazon Blanca.jpg", name: "Corazón Blanca", cat: "vela", price: 7, desc: "Vela artesanal en forma de Corazón Blanco" },
    { file: "Mandala.jpg", name: "Mandala", cat: "vela", price: 9, desc: "Vela artesanal de 98grs. en envase de metal decorativo" },
    { file: "Vintage.jpg", name: "Vintage", cat: "vela", price: 9.5, desc: "Vela artesanal de 165grs. en envase de vidrio transparente" },

    // === VELAS ENVASES ===
    { file: "PETIT.jpg", name: "Petit", cat: "vela", price: 11, desc: "Vela artesanal de 171grs. en envase de vidrio transparente" },
    { file: "Estrella1.jpg", name: "Estrella Envase", cat: "vela", price: 12, desc: "Vela artesanal de 285grs. en envase de vidrio transparente" },
    { file: "Aura Rosa.jpg", name: "Aura Rosa", cat: "vela", price: 17, desc: "Vela artesanal de 342grs. en envase de vidrio transparente" },
    { file: "Aura Tulipan.jpg", name: "Aura Tulipán", cat: "vela", price: 17, desc: "Vela artesanal de 335grs. en envase de vidrio transparente" },
    { file: "Aura Corazón.jpg", name: "Aura Corazón", cat: "vela", price: 20, desc: "Vela artesanal de 418grs. en envase de vidrio transparente" },
    { file: "Armonia.jpg", name: "Armonía Canela", cat: "vela", price: 22, desc: "Vela artesanal de 508grs. en envase de vidrio opaco" },
    { file: "Vela Rosa.jpg", name: "Vela Rosa", cat: "vela", price: 85, desc: "Vela artesanal premium en forma de Rosa" },
    { file: "Vela Canela.jpg", name: "Vela Canela", cat: "vela", price: 85, desc: "Vela artesanal premium de canela" },
    { file: "Vela Estrellas.jpg", name: "Vela Estrellas", cat: "vela", price: 85, desc: "Vela artesanal premium con forma de estrellas" },
    { file: "Vela Tulipan.jpg", name: "Vela Tulipán", cat: "vela", price: 85, desc: "Vela artesanal premium en forma de Tulipán" },
    { file: "Velita Corazoncito.jpg", name: "Velita Corazoncito", cat: "vela", price: 75, desc: "Vela artesanal en forma de corazoncito" },
    { file: "Sagrada Familia 1.jpg", name: "Sagrada Familia 1", cat: "vela", price: 7, desc: "Vela artesanal en forma de Sagrada Familia" },

    // === PULSERAS ===
    { file: "Pulsera Infinito Azul.jpg", name: "Pulsera Infinito Azul", cat: "pulsera", price: 8, desc: "Pulsera Infinito simboliza conexión y propósito. Trenzado en hilo" },
    { file: "Pulsera Infinito Beige.jpg", name: "Pulsera Infinito Beige", cat: "pulsera", price: 8, desc: "Pulsera Infinito simboliza conexión y propósito. Trenzado en hilo" },
    { file: "Pulsera Infinito Roja.jpg", name: "Pulsera Infinito Roja", cat: "pulsera", price: 8, desc: "Pulsera Infinito simboliza conexión y propósito. Trenzado en hilo" },
    { file: "Pulsera San Benito.jpg", name: "Pulsera San Benito", cat: "pulsera", price: 8, desc: "Pulsera San Benito conecta intención y protección. Trenzado en hilo" },
    { file: "Pulsera Perla.jpg", name: "Pulsera Perla", cat: "pulsera", price: 6, desc: "Pulsera Perla irradia calma y claridad. Trenzado sutil" },
    { file: "Pulsera Ojito.jpg", name: "Pulsera Ojito", cat: "pulsera", price: 6, desc: "Pulsera Ojito protege y equilibra tu energía. Trenzado en hilo" },

    // === COLLARES ===
    { file: "Gargantilla 2.jpg", name: "Gargantilla", cat: "collar", price: 20, desc: "Gargantilla de Gold-Filled bañada en oro. Broche de seguridad" },
    { file: "Gargantilla Lisa.jpg", name: "Gargantilla Lisa", cat: "collar", price: 25, desc: "Gargantilla de Gold-Filled bañada en oro. Diseño liso" },
    { file: "Collar Medio 02.jpg", name: "Collar Medio", cat: "collar", price: 25, desc: "Collar Medio de Gold-Filled bañada en oro" },
    { file: "Collar Eslabon Medio.jpg", name: "Collar Eslabón Medio", cat: "collar", price: 30, desc: "Collar Medio de Gold-Filled con eslabones" },
    { file: "Collar Largo 01.jpg", name: "Collar Largo", cat: "collar", price: 32, desc: "Collar Largo de Gold-Filled bañada en oro" },

    // === ACCESORIOS ===
    { file: "Piedras Natural.jpg", name: "Piedras Naturales", cat: "otro", price: 7, desc: "Dijes Piedras Naturales. Cada una vibra con intención" },
  ];

  /* Category mapping for display */
  const catMap = { vela: 'velas', pulsera: 'pulseras', collar: 'collares', otro: 'accesorios' };
  const catLabels = { vela: 'Vela artesanal', pulsera: 'Pulsera artesanal', collar: 'Collar artesanal', otro: 'Accesorio artesanal' };

  /* ----- DOM refs ----- */
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];

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
  let cart = JSON.parse(localStorage.getItem('yosoy222_cart') || '[]');
  let activeFilter = 'todos';
  let searchTerm = '';

  /* ============================================
     RENDER PRODUCT GRID from data array
     ============================================ */
  function renderProducts() {
    if (!grid) return;
    let html = '';
    products.forEach((p, i) => {
      const cat = catMap[p.cat] || 'accesorios';
      const priceStr = p.price < 1 ? `$${p.price}` : `$${p.price}`;
      html += `
        <article class="product-card" data-category="${cat}" data-index="${i}" data-name="${p.name}">
          <div class="product-image">
            <img src="images/thumbs/${p.file}" alt="${p.name} artesanal" loading="lazy">
          </div>
          <div class="product-info">
            <h3>${p.name}</h3>
            <p class="product-category">${catLabels[p.cat] || 'Producto artesanal'}</p>
            <p class="product-desc">${p.desc}</p>
            <div class="product-footer">
              <span class="product-price">${priceStr}</span>
              <button class="add-cart-btn" data-name="${p.name}" data-price="${p.price}" data-index="${i}">Agregar</button>
            </div>
          </div>
        </article>`;
    });
    grid.innerHTML = html;

    // Attach add-to-cart handlers
    $$('.add-cart-btn', grid).forEach(btn => {
      btn.addEventListener('click', () => {
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
      });
    });
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
    const cards = $$('.product-card', grid);
    let count = 0;
    cards.forEach(card => {
      const cat = card.dataset.category;
      const name = (card.dataset.name || '').toLowerCase();
      const matchesCat = activeFilter === 'todos' || cat === activeFilter;
      const matchesSearch = !searchTerm || name.includes(searchTerm);
      const show = matchesCat && matchesSearch;
      card.classList.toggle('hidden', !show);
      if (show) count++;
    });
    if (resultsCount) {
      resultsCount.textContent = count < cards.length
        ? `${count} de ${cards.length} productos`
        : '';
    }
    if (emptyState) emptyState.hidden = count > 0;
    if (grid) {
      grid.style.display = emptyState && !emptyState.hidden ? 'none' : '';
    }
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
      cartItems.innerHTML = '';
      cartEmpty.hidden = false;
      cartItems.appendChild(cartEmpty);
      cartFooter.hidden = true;
      return;
    }

    cartFooter.hidden = false;
    cartTotal.textContent = `$${total.toFixed(2)} USD`;

    // Build items HTML
    let html = '';
    cart.forEach((item, i) => {
      html += `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <div class="cart-item-meta">
              <div class="qty-stepper">
                <button class="qty-btn" data-idx="${i}" data-delta="-1" aria-label="Reducir cantidad">−</button>
                <span class="qty-value">${item.qty}</span>
                <button class="qty-btn" data-idx="${i}" data-delta="1" aria-label="Aumentar cantidad">+</button>
              </div>
              <button class="cart-item-remove" data-idx="${i}" aria-label="Eliminar ${item.name}">Eliminar</button>
            </div>
          </div>
          <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
        </div>`;
    });
    cartItems.innerHTML = html;

    // Stepper handlers
    $$('.qty-btn', cartItems).forEach(btn => {
      btn.addEventListener('click', () => {
        changeQty(parseInt(btn.dataset.idx, 10), parseInt(btn.dataset.delta, 10));
      });
    });

    // Remove handlers
    $$('.cart-item-remove', cartItems).forEach(btn => {
      btn.addEventListener('click', () => {
        removeItem(parseInt(btn.dataset.idx, 10));
      });
    });

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
     INIT
     ============================================ */
  renderProducts();
  applyFilters();
  renderCart();
  updateActiveNav();

})();
