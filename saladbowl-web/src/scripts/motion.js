/**
 * Sistema de movimiento de Saladbowl.
 *
 * Reglas: reveals de 30-40px + fade (0.7s / power2.out / stagger 0.1),
 * parallax leve en el hero (la imagen viaja al 85% del scroll),
 * imágenes que entran de scale 1.05 a 1, y nav que se compacta.
 * Si el usuario pide menos movimiento, no se anima nada.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const DURATION = 0.7;
const EASE = 'power2.out';
const STAGGER = 0.1;
const SHIFT = 34;
const START = 'top 85%';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- scroll */
function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Los anchors internos usan el scroll suave.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -88 });
    });
  });
}

/* --------------------------------------------------------------- reveals */
function initReveals() {
  const grouped = new WeakSet();

  // Grupos: los hermanos entran escalonados con un único trigger.
  gsap.utils.toArray('[data-stagger]').forEach((group) => {
    const items = gsap.utils.toArray('[data-reveal]', group);
    if (!items.length) return;
    items.forEach((item) => grouped.add(item));

    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: DURATION,
      ease: EASE,
      stagger: STAGGER,
      scrollTrigger: { trigger: group, start: START, once: true },
    });
  });

  // Sueltos.
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    if (grouped.has(el)) return;
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: DURATION,
      ease: EASE,
      delay: Number(el.dataset.delay || 0),
      scrollTrigger: { trigger: el, start: START, once: true },
    });
  });
}

/* --------------------------------------------------------------- imágenes */
function initMedia() {
  gsap.utils.toArray('[data-media]').forEach((frame) => {
    const image = frame.querySelector('img');
    if (!image) return;
    gsap.to(image, {
      scale: 1,
      duration: 1.2,
      ease: EASE,
      scrollTrigger: { trigger: frame, start: 'top 90%', once: true },
      onComplete: () => {
        // Devolvemos el control al CSS para que el hover de las cards funcione.
        frame.classList.add('is-in');
        gsap.set(image, { clearProps: 'transform' });
      },
    });
  });
}

/* -------------------------------------------------------------- parallax */
function initParallax() {
  gsap.utils.toArray('[data-parallax]').forEach((layer) => {
    const frame = layer.closest('[data-parallax-frame]') || layer.parentElement;
    // La imagen mide 118% del marco: ±6.5% ≈ moverse al 85% de la velocidad.
    gsap.fromTo(
      layer,
      { yPercent: -6.5 },
      {
        yPercent: 6.5,
        ease: 'none',
        scrollTrigger: {
          trigger: frame,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      },
    );
  });
}

/* ------------------------------------------------------------ hero intro */
function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  const copy = gsap.utils.toArray('[data-hero-item]', hero);
  const frame = hero.querySelector('[data-hero-media]');

  const tl = gsap.timeline({ defaults: { duration: DURATION, ease: EASE }, delay: 0.15 });

  if (frame) {
    tl.fromTo(frame, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 1.2 }, 0);
  }
  if (copy.length) {
    tl.to(copy, { opacity: 1, y: 0, stagger: STAGGER }, 0.1);
  }
}

/* ------------------------------------------------------------------ nav */
function initNav() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;

  let ticking = false;
  const update = () => {
    nav.classList.toggle('is-compact', window.scrollY > 32);
    ticking = false;
  };

  update();
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
}

/* ----------------------------------------------------------------- init */
initNav();

if (!reduceMotion) {
  initSmoothScroll();
  initHero();
  initReveals();
  initMedia();
  initParallax();

  // Las webfonts cambian alturas: recalculamos posiciones cuando cargan.
  if (document.fonts) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}
