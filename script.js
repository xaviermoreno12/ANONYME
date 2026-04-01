/* ============================================================
   ANONYME — script.js
   ============================================================ */

/* ── Año en footer ───────────────────────────────────────────── */
const yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Header: scroll effect ───────────────────────────────────── */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Hero image Ken Burns ────────────────────────────────────── */
const heroImg = document.querySelector('.hero-img');
if (heroImg) {
  if (heroImg.complete) heroImg.classList.add('loaded');
  else heroImg.addEventListener('load', () => heroImg.classList.add('loaded'));
}

/* ── Search toggle ───────────────────────────────────────────── */
const searchToggle = document.getElementById('searchToggle');
const searchBar    = document.getElementById('searchBar');
const searchClose  = document.getElementById('searchClose');
const searchInput  = searchBar?.querySelector('.search-input');

searchToggle?.addEventListener('click', () => {
  const open = searchBar.classList.toggle('open');
  if (open) setTimeout(() => searchInput?.focus(), 300);
});
searchClose?.addEventListener('click', () => searchBar.classList.remove('open'));

/* ── Mobile nav ──────────────────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');

navToggle?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
  const spans = navToggle.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
  }
});

mobileNav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.querySelectorAll('span').forEach(s => { s.style.transform=''; s.style.opacity=''; });
  });
});

/* ── Carrito ─────────────────────────────────────────────────── */
let cart = [];

const cartSidebar  = document.getElementById('cartSidebar');
const cartOverlay  = document.getElementById('cartOverlay');
const cartClose    = document.getElementById('cartClose');
const cartItemsEl  = document.getElementById('cartItems');
const cartFooterEl = document.getElementById('cartFooter');
const cartTotalEl  = document.getElementById('cartTotal');
const cartCountEl  = document.querySelector('.cart-count');
const cartBtn      = document.querySelector('.cart-btn');

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  cartSidebar.setAttribute('aria-hidden', 'false');
}
function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  cartSidebar.setAttribute('aria-hidden', 'true');
}

cartBtn?.addEventListener('click', openCart);
cartClose?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);

function formatPrice(n) {
  return '$' + n.toLocaleString('es-AR');
}

function renderCart() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Tu carrito está vacío</p>';
    cartFooterEl.style.display = 'none';
  } else {
    cartItemsEl.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <div class="cart-item-img" style="background:#f0ece6"></div>
        <div class="cart-item-info">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">${formatPrice(item.price)}</p>
        </div>
        <button class="cart-item-remove" data-index="${i}" aria-label="Eliminar">✕</button>
      </div>
    `).join('');
    cartFooterEl.style.display = 'block';
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    cartTotalEl.textContent = formatPrice(total);

    cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        cart.splice(Number(btn.dataset.index), 1);
        updateCartCount();
        renderCart();
      });
    });
  }
}

function updateCartCount() {
  if (cartCountEl) {
    cartCountEl.textContent = cart.length;
    cartCountEl.classList.toggle('show', cart.length > 0);
  }
}

document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    cart.push({
      name:  btn.dataset.name,
      price: Number(btn.dataset.price)
    });
    updateCartCount();
    renderCart();

    // Feedback visual
    const orig = btn.textContent;
    btn.textContent = '¡Agregado!';
    btn.style.background = '#B8861C';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
    }, 1500);

    openCart();
  });
});

/* ── Wishlist toggle ─────────────────────────────────────────── */
document.querySelectorAll('.wishlist-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    btn.classList.toggle('active');
    if (btn.classList.contains('active')) {
      btn.querySelector('svg path').setAttribute('fill', '#e63946');
    } else {
      btn.querySelector('svg path').setAttribute('fill', 'none');
    }
  });
});

/* ── Filtros de productos ────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    productCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* ── Smooth scroll para links internos ───────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = header.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── Intersection Observer: animación de entrada ─────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card, .category-card, .ig-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});
