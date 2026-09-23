import { whatsappNumber, whatsappUrl } from './contact-config.js';
import { setupContactGallery } from './portfolio.js';
import { setupContactForm } from './contact-form.js';

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const sections = ['inicio', 'portfolio', 'sobre', 'servicos', 'projetos', 'redes', 'contato'].map(id => document.getElementById(id));
const mainLinks = [...document.querySelectorAll('[data-main-nav]')];
const portfolio = document.getElementById('portfolio');
const contact = document.getElementById('contato');
setupContactForm(document.getElementById('contact-form'), document.getElementById('contact-feedback'));
const galleries = [
  { section: portfolio, controller: setupContactGallery(portfolio, { diagonal: true }), visible: false },
  { section: contact, controller: setupContactGallery(contact, { shuffle: true }), visible: false },
];
let frame = 0;

function syncGalleries() {
  galleries.forEach(gallery => gallery.controller.setActive(gallery.visible && !reducedMotion.matches));
}
function render() {
  frame = 0;
  const probe = window.innerHeight * .4;
  let current = sections[0];
  sections.forEach(section => { if (section.getBoundingClientRect().top <= probe) current = section; });
  root.classList.toggle('on-landing', current.id === 'inicio');
  root.classList.toggle('on-contact', current.id === 'contato');
  mainLinks.forEach(link => {
    const selected = link.dataset.mainNav === (current.id === 'projetos' ? 'portfolio' : current.id);
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  if (!('IntersectionObserver' in window)) {
    galleries.forEach(gallery => {
      const rect = gallery.section.getBoundingClientRect();
      gallery.visible = rect.top < window.innerHeight && rect.bottom > 0;
    });
    syncGalleries();
  }
}
function requestRender() { if (!frame) frame = requestAnimationFrame(render); }
function goToSection(id, behavior = 'smooth') {
  const target = document.getElementById(id);
  if (!target || !sections.includes(target)) return;
  const motion = reducedMotion.matches ? 'instant' : behavior;
  if (id === 'inicio') window.scrollTo({ top: 0, behavior: motion });
  else target.scrollIntoView({ behavior: motion, block: 'start' });
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[data-story-link]');
  if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const id = link.getAttribute('href').slice(1);
  if (!sections.some(section => section.id === id)) return;
  event.preventDefault();
  if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
  goToSection(id);
});
window.addEventListener('hashchange', () => goToSection(location.hash.slice(1), 'instant'));
window.addEventListener('scroll', requestRender, { passive: true });
window.addEventListener('resize', requestRender, { passive: true });
window.addEventListener('pageshow', requestRender);
reducedMotion.addEventListener('change', syncGalleries);

if ('IntersectionObserver' in window) {
  const galleryObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const gallery = galleries.find(item => item.section === entry.target);
      gallery.visible = entry.isIntersecting;
    });
    syncGalleries();
  });
  galleries.forEach(gallery => galleryObserver.observe(gallery.section));
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      if (entry.target.classList.contains('about-art')) {
        // Begin the one-second headline delay only when both image layers are ready.
        const images = [...entry.target.querySelectorAll('img')];
        Promise.all(images.map(image => image.decode().catch(() => {})))
          .then(() => entry.target.classList.add('is-revealed'));
      } else {
        entry.target.classList.add('is-revealed');
      }
    });
  }, { threshold: .08 });
  document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));
  root.classList.add('has-reveals');
}

document.querySelectorAll('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });
const contactUrl = whatsappUrl(whatsappNumber);
document.querySelectorAll('[data-whatsapp]').forEach(link => {
  if (!contactUrl) return;
  link.href = contactUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.removeAttribute('aria-disabled');
});
render();
if (location.hash) requestAnimationFrame(() => goToSection(location.hash.slice(1), 'instant'));
document.fonts.ready.then(requestRender);
