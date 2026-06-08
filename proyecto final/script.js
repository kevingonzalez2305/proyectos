/* ==============================================
   script.js — CBTIS 128
   ============================================== */

/* ── LOADER ── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const start  = Date.now();
  const hide   = () => loader.classList.add('gone');
  const elapsed = Date.now() - start;
  elapsed >= 400 ? hide() : setTimeout(hide, 400 - elapsed);
});

/* ── NAVBAR scroll ── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

/* ── MENÚ MÓVIL ── */
function toggleMenu() {
  const nav = document.getElementById('navLinks');
  const btn = document.getElementById('hamburger');
  const isOpen = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}
function closeMobileMenu() {
  const nav = document.getElementById('navLinks');
  const btn = document.getElementById('hamburger');
  nav.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
}

/* ── Cerrar menú al hacer click fuera ── */
document.addEventListener('click', (e) => {
  const nav  = document.getElementById('navLinks');
  const btn  = document.getElementById('hamburger');
  if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) {
    closeMobileMenu();
  }
});

document.querySelectorAll('#navLinks a').forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileMenu();
});

let toastTimeout = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 3500);
}

/* ── FORMULARIO DE CONTACTO ── */
function handleContact() {
  const nombre = document.getElementById('fn').value.trim();
  const email  = document.getElementById('fe').value.trim();
  const msg    = document.getElementById('fmsg').value.trim();

  if (!nombre || !email || !msg) {
    showToast('⚠️ Por favor completa todos los campos');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('⚠️ Ingresa un correo electrónico válido');
    return;
  }

  ['fn', 'ftel', 'fe', 'fmsg'].forEach(id => {
    document.getElementById(id).value = '';
  });
  showToast('✓ Mensaje enviado correctamente');
}

/* ── Años dinámicos ── */
(function updateYears() {
  const founded = 1979;
  const years   = new Date().getFullYear() - founded;
  document.querySelectorAll('.years-dynamic').forEach(el => {
    el.textContent = `Más de ${years} años`;
  });
})();

/* ── REVEAL animado con IntersectionObserver ── */
const revealTargets = document.querySelectorAll(
  '.nos-card, .value-chip, .esp-card, .tit-card, .logro-card, .gal-item, .tl-item, .info-block'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity  = '1';
      e.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

revealTargets.forEach((el, i) => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.55s ease ${i * 0.05}s, transform 0.55s ease ${i * 0.05}s`;
  revealObserver.observe(el);
});

