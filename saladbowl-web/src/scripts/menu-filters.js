/**
 * Filtros del menú: al cambiar de categoría las cards se reordenan con FLIP
 * (mismo criterio de movimiento que el resto del sitio: suave y corto).
 */
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function apply(cards, category) {
  cards.forEach((card) => {
    const show = category === 'todo' || card.dataset.category === category;
    card.classList.toggle('is-hidden', !show);
  });
}

function init() {
  const root = document.querySelector('[data-menu]');
  if (!root || root.dataset.bound) return;
  root.dataset.bound = 'true';

  const buttons = [...root.querySelectorAll('[data-filter]')];
  const cards = gsap.utils.toArray('[data-item]', root);
  const counter = root.querySelector('[data-menu-count]');

  const setActive = (active) => {
    buttons.forEach((button) => {
      const on = button === active;
      button.setAttribute('aria-pressed', String(on));
      button.classList.toggle('is-active', on);
    });
  };

  const updateCount = () => {
    if (!counter) return;
    const visible = cards.filter((card) => !card.classList.contains('is-hidden')).length;
    counter.textContent = `${visible} ${visible === 1 ? 'plato' : 'platos'}`;
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      setActive(button);

      if (reduceMotion) {
        apply(cards, category);
        updateCount();
        return;
      }

      // Sólo medimos las cards que cambian de estado o que quedan visibles:
      // medir las 16 en un celular de gama media cuesta un frame largo.
      const targets = cards.filter((card) => {
        const visible = !card.classList.contains('is-hidden');
        const quedará = category === 'todo' || card.dataset.category === category;
        return visible || quedará;
      });

      const state = Flip.getState(targets, { simple: true });
      apply(cards, category);
      updateCount();

      Flip.from(state, {
        duration: 0.55,
        ease: 'power2.out',
        stagger: 0.02,
        absolute: true,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { opacity: 0, scale: 0.94 },
            { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' },
          ),
        onLeave: (elements) =>
          gsap.to(elements, { opacity: 0, scale: 0.94, duration: 0.3, ease: 'power2.out' }),
      });
    });
  });

  updateCount();
}

document.addEventListener('astro:page-load', init);
