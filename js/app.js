/* ============================================
   YoSoy222 — App JS
   Search · Filters · Cart with steppers · WhatsApp
   ============================================ */

(function () {
  'use strict';

  /* ----- Config ----- */
  const WHATSAPP = '521XXXXXXXXXX';

  /* ----- Product data (from original repo) ----- */
  const products = [
    { file: "Armonia.jpg", name: "Armonía", cat: "vela" },
    { file: "Aura Corazón.jpg", name: "Aura Corazón", cat: "vela" },
    { file: "Aura Rosa.jpg", name: "Aura Rosa", cat: "vela" },
    { file: "Aura Tulipan.jpg", name: "Aura Tulipán", cat: "vela" },
    { file: "Buda.jpg", name: "Buda", cat: "vela" },
    { file: "Buquet .jpg", name: "Buquet", cat: "vela" },
    { file: "Collar Eslabon Medio.jpg", name: "Collar Eslabón Medio", cat: "collar" },
    { file: "Collar Largo 01.jpg", name: "Collar Largo 01", cat: "collar" },
    { file: "Collar Medio 02.jpg", name: "Collar Medio 02", cat: "collar" },
    { file: "Corazon Blanca.jpg", name: "Corazón Blanca", cat: "vela" },
    { file: "Corazón .jpg", name: "Corazón", cat: "vela" },
    { file: "Cruz .jpg", name: "Cruz", cat: "vela" },
    { file: "Cubo .jpg", name: "Cubo", cat: "vela" },
    { file: "Espiral.jpg", name: "Espiral", cat: "vela" },
    { file: "Estrella.jpg", name: "Estrella", cat: "vela" },
    { file: "Gargantilla 2.jpg", name: "Gargantilla 2", cat: "collar" },
    { file: "Gargantilla Lisa.jpg", name: "Gargantilla Lisa", cat: "collar" },
    { file: "Hamsa .jpg", name: "Hamsa", cat: "vela" },
    { file: "Mandala.jpg", name: "Mandala", cat: "vela" },
    { file: "Margarita.jpg", name: "Margarita", cat: "vela" },
    { file: "Mini Corazones.jpg", name: "Mini Corazones", cat: "vela" },
    { file: "Mini Girasol.jpg", name: "Mini Girasol", cat: "vela" },
    { file: "Mini Margarita.jpg", name: "Mini Margarita", cat: "vela" },
    { file: "PETIT.jpg", name: "Petit", cat: "vela" },
    { file: "Piedras Natural.jpg", name: "Piedras Natural", cat: "otro" },
    { file: "Pulsera Infinito Azul.jpg", name: "Pulsera Infinito Azul", cat: "pulsera" },
    { file: "Pulsera Infinito Beige.jpg", name: "Pulsera Infinito Beige", cat: "pulsera" },
    { file: "Pulsera Infinito Roja.jpg", name: "Pulsera Infinito Roja", cat: "pulsera" },
    { file: "Pulsera Ojito.jpg", name: "Pulsera Ojito", cat: "pulsera" },
    { file: "Pulsera Perla.jpg", name: "Pulsera Perla", cat: "pulsera" },
    { file: "Pulsera San Benito.jpg", name: "Pulsera San Benito", cat: "pulsera" },
    { file: "Rosa .jpg", name: "Rosa", cat: "vela" },
    { file: "Rosa Pequeña.jpg", name: "Rosa Pequeña", cat: "vela" },
    { file: "Sagrada Familia.jpg", name: "Sagrada Familia", cat: "vela" },
    { file: "Sagrada Familia 1.jpg", name: "Sagrada Familia 1", cat: "vela" },
    { file: "Tulipan.jpg", name: "Tulipán", cat: "vela" },
    { file: "Vela Canela.jpg", name: "Vela Canela", cat: "vela" },
    { file: "Vela Estrellas.jpg", name: "Vela Estrellas", cat: "vela" },
    { file: "Vela Rosa.jpg", name: "Vela Rosa", cat: "vela" },
    { file: "Vela Tulipan.jpg", name: "Vela Tulipán", cat: "vela" },
    { file: "Velita Corazoncito.jpg", name: "Velita Corazoncito", cat: "vela" },
    { file: "Vintage.jpg", name: "Vintage", cat: "vela" },
    { file: "Virgen del Carmen.jpg", name: "Virgen del Carmen", cat: "vela" },
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
      html += `
        <article class="product-card" data-category="${cat}" data-index="${i}" data-name="${p.name}">
          <div class="product-image">
            <img src="images/thumbs/${p.file}" alt="${p.name} artesanal" loading="lazy">
          </div>
          <div class="product-info">
            <h3>${p.name}</h3>
            <p class="product-category">${catLabels[p.cat] || 'Producto artesanal'}</p>
            <div class="product-footer">
              <button class="add-cart-btn" data-name="${p.name}" data-price="85" data-index="${i}">Agregar</button>
            </div>
          </div>
        </article>`;
    });
    grid.innerHTML = html;

    // Attach add-to-cart handlers
    $$('.add-cart-btn', grid).forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const price = parseInt(btn.dataset.price, 10);
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
    cartTotal.textContent = `$${total} MXN`;

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
          <span class="cart-item-price">$${item.price * item.qty}</span>
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
    const lines = cart.map(i => `• ${i.name} x${i.qty} — $${i.price * i.qty} MXN`);
    const msg = encodeURIComponent(
      `Hola YoSoy222 👋\n\nMe gustaría hacer este pedido:\n\n${lines.join('\n')}\n\n*Total: $${total} MXN*\n\n¡Gracias! 🕯️`
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
