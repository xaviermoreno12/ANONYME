/* ============================================================
   ANONYME — script.js v2
   Cart: localStorage | WhatsApp checkout | Search funcional
   ============================================================ */

const WHATSAPP = '5491100000000'; // ← Reemplazá con tu número (ej: 5491155443322)

/* ── Helpers ─────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function formatPrice(n) {
  return '$' + Number(n).toLocaleString('es-AR');
}

/* ── Año footer ──────────────────────────────────────────────── */
$$('[id="currentYear"]').forEach(el => el.textContent = new Date().getFullYear());
document.querySelectorAll('#currentYear').forEach(el => el.textContent = new Date().getFullYear());

/* ── CARRITO (localStorage) ──────────────────────────────────── */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('anonyme_cart') || '[]'); } catch(e) { cart = []; }

function saveCart() {
  localStorage.setItem('anonyme_cart', JSON.stringify(cart));
}

function getTotalQty() {
  return cart.reduce((sum, item) => sum + (item.qty || 1), 0);
}

function updateCartCount() {
  const qty = getTotalQty();
  $$('.cart-count').forEach(el => {
    el.textContent = qty;
    el.classList.toggle('show', qty > 0);
  });
}

function renderCart() {
  const itemsEl = $('cartItems');
  const footerEl = $('cartFooter');
  const totalEl = $('cartTotal');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Tu carrito está vacío</p>';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  itemsEl.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item-img"></div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">
          ${formatPrice(item.price)}
          ${item.qty > 1 ? `<span class="cart-qty-badge">x${item.qty}</span>` : ''}
        </p>
      </div>
      <button class="cart-item-remove" data-index="${i}" aria-label="Eliminar">✕</button>
    </div>
  `).join('');

  const total = cart.reduce((acc, item) => acc + item.price * (item.qty || 1), 0);
  if (footerEl) footerEl.style.display = 'block';
  if (totalEl) totalEl.textContent = formatPrice(total);

  $$('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      cart.splice(Number(btn.dataset.index), 1);
      saveCart(); updateCartCount(); renderCart();
    });
  });
}

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ name, price: Number(price), qty: 1 });
  }
  saveCart(); updateCartCount(); renderCart();
}

/* ── Abrir / cerrar carrito ──────────────────────────────────── */
function openCart() {
  $('cartSidebar')?.classList.add('open');
  $('cartOverlay')?.classList.add('open');
}
function closeCart() {
  $('cartSidebar')?.classList.remove('open');
  $('cartOverlay')?.classList.remove('open');
}

$$('.cart-btn').forEach(btn => btn.addEventListener('click', openCart));
$('cartClose')?.addEventListener('click', closeCart);
$('cartOverlay')?.addEventListener('click', closeCart);

/* ── WhatsApp checkout ───────────────────────────────────────── */
$('checkoutBtn')?.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }
  let msg = '¡Hola ANONYME! Quisiera hacer el siguiente pedido:\n\n';
  cart.forEach(item => {
    const qty = item.qty || 1;
    const subtotal = item.price * qty;
    msg += `• ${item.name}${qty > 1 ? ` x${qty}` : ''} — ${formatPrice(subtotal)}\n`;
  });
  const total = cart.reduce((acc, item) => acc + item.price * (item.qty || 1), 0);
  msg += `\n*Total: ${formatPrice(total)}*\n\n¡Muchas gracias! ✨`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
});

/* ── Botones agregar al carrito ──────────────────────────────── */
$$('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    addToCart(btn.dataset.name, btn.dataset.price);
    const orig = btn.textContent;
    btn.textContent = '¡Agregado!';
    btn.style.background = '#B8861C';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1400);
    openCart();
  });
});

/* Init carrito */
updateCartCount();
renderCart();

/* ── Header scroll ───────────────────────────────────────────── */
const header = $('siteHeader');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Hero imagen ─────────────────────────────────────────────── */
const heroImg = document.querySelector('.hero-img');
if (heroImg) {
  if (heroImg.complete) heroImg.classList.add('loaded');
  else heroImg.addEventListener('load', () => heroImg.classList.add('loaded'));
}

/* ── Buscador ────────────────────────────────────────────────── */
const searchToggle = $('searchToggle');
const searchBar    = $('searchBar');
const searchClose  = $('searchClose');
const searchInput  = searchBar?.querySelector('.search-input');

function filterProducts(query) {
  const q = query.toLowerCase().trim();
  const cards = $$('.product-card');
  let found = 0;

  cards.forEach(card => {
    const name = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
    const cat  = card.querySelector('.product-category')?.textContent.toLowerCase() || '';
    const show = !q || name.includes(q) || cat.includes(q);
    card.style.display = show ? '' : 'none';
    if (show) found++;
  });

  // Mensaje sin resultados
  let noRes = $('noResults');
  if (!noRes) {
    noRes = document.createElement('p');
    noRes.id = 'noResults';
    noRes.style.cssText = 'grid-column:1/-1;text-align:center;color:#999;padding:60px 20px;font-family:var(--font-sans);font-size:.9rem;letter-spacing:.05em;display:none';
    noRes.textContent = 'No se encontraron productos.';
    document.querySelector('.products-grid')?.appendChild(noRes);
  }
  noRes.style.display = (q && found === 0) ? 'block' : 'none';
}

searchToggle?.addEventListener('click', () => {
  const open = searchBar.classList.toggle('open');
  if (open) setTimeout(() => searchInput?.focus(), 300);
});
searchClose?.addEventListener('click', () => {
  searchBar?.classList.remove('open');
  if (searchInput) { searchInput.value = ''; filterProducts(''); }
});
searchInput?.addEventListener('input', e => filterProducts(e.target.value));

/* ── Menú hamburguesa ────────────────────────────────────────── */
const navToggle = $('navToggle');
const mobileNav = $('mobileNav');

navToggle?.addEventListener('click', () => {
  const open = mobileNav?.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
  const spans = navToggle.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity = '0';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
  }
});

mobileNav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    navToggle?.querySelectorAll('span').forEach(s => { s.style.transform=''; s.style.opacity=''; });
  });
});

/* ── Filtros (index.html) ────────────────────────────────────── */
$$('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    $$('.product-card').forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
    });
    // Limpiar búsqueda al filtrar
    if (searchInput) { searchInput.value = ''; }
    const noRes = $('noResults');
    if (noRes) noRes.style.display = 'none';
  });
});

/* ── Smooth scroll ───────────────────────────────────────────── */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = (header?.offsetHeight || 64) + 16;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    }
  });
});

/* ── Animaciones de entrada ──────────────────────────────────── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

$$('.product-card, .category-card, .ig-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});
