// === WHATSAPP CONFIGURATION ===
const WHATSAPP_NUMBER = '521XXXXXXXXXX'; // ← CAMBIAR: tu número de WhatsApp con código de país
const WHATSAPP_MSG_HOLA = 'Hola! Me interesa conocer sus velas artesanales 🕯️';

// === PRODUCT DATA ===
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

// === DOM READY ===
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initProductsGrid('featured-grid', products.slice(0, 8));
    initProductsGrid('catalog-grid', products);
    initFilters();
    initLightbox();
    initWhatsAppFloat();
    initScrollAnimations();
});

// === NAVBAR SCROLL ===
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// === MOBILE MENU ===
function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    
    toggle.addEventListener('click', () => {
        links.classList.toggle('active');
        toggle.textContent = links.classList.contains('active') ? '✕' : '☰';
    });
    
    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('active');
            toggle.textContent = '☰';
        });
    });
}

// === PRODUCTS GRID ===
function initProductsGrid(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = items.map((p, i) => `
        <div class="product-card" data-cat="${p.cat}" data-index="${i}" data-file="${p.file}">
            <div class="product-img">
                <img src="images/thumbs/${p.file}" alt="${p.name}" loading="lazy">
                <div class="product-badge">${catLabel(p.cat)}</div>
                <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Me interesa la vela ' + p.name + ' 🕯️')}" 
                   class="product-whatsapp" 
                   target="_blank" 
                   title="Preguntar por ${p.name}"
                   onclick="event.stopPropagation()">💬</a>
            </div>
            <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-category">${catLabel(p.cat)}</div>
            </div>
        </div>
    `).join('');
    
    // Click to open lightbox (from catalog grid)
    if (containerId === 'catalog-grid') {
        container.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.product-whatsapp')) return;
                openLightbox(parseInt(card.dataset.index), items);
            });
        });
    }
}

function catLabel(cat) {
    const labels = { vela: '🕯️ Vela', pulsera: '📿 Pulsera', collar: '🔗 Collar', otro: '✨ Articulo' };
    return labels[cat] || cat;
}

// === FILTERS ===
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const catalogGrid = document.getElementById('catalog-grid');
    if (!filterBtns.length || !catalogGrid) return;
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            const cards = catalogGrid.querySelectorAll('.product-card');
            
            cards.forEach(card => {
                const show = filter === 'all' || card.dataset.cat === filter;
                card.style.display = show ? '' : 'none';
            });
        });
    });
}

// === LIGHTBOX ===
let currentProducts = [];
let currentIndex = 0;

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    document.getElementById('lb-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    
    document.getElementById('lb-prev').addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + currentProducts.length) % currentProducts.length;
        updateLightbox();
    });
    
    document.getElementById('lb-next').addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % currentProducts.length;
        updateLightbox();
    });
    
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + currentProducts.length) % currentProducts.length; updateLightbox(); }
        if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % currentProducts.length; updateLightbox(); }
    });
}

function openLightbox(index, items) {
    currentProducts = items;
    currentIndex = index;
    updateLightbox();
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function updateLightbox() {
    const p = currentProducts[currentIndex];
    if (!p) return;
    
    document.getElementById('lb-img').src = `images/catalog/${p.file}`;
    document.getElementById('lb-name').textContent = p.name;
    document.getElementById('lb-meta').textContent = `${catLabel(p.cat)} — 2048×2048 px`;
    document.getElementById('lb-counter').textContent = `${currentIndex + 1} / ${currentProducts.length}`;
    
    const waBtn = document.getElementById('lb-whatsapp');
    waBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Me interesa la vela ' + p.name + ' 🕯️')}`;
    waBtn.target = '_blank';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
}

// === WHATSAPP FLOAT ===
function initWhatsAppFloat() {
    const float = document.querySelector('.whatsapp-float');
    if (!float) return;
    
    float.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG_HOLA)}`;
    float.target = '_blank';
}

// === SCROLL ANIMATIONS ===
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.product-card, .feature, .about-text, .about-image').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}
