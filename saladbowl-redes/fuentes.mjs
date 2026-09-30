/**
 * Fuentes de datos: todo sale de saladbowl-web, nunca se inventa ni se
 * duplica a mano (regla #3 y #4 de PLAN.md). Este módulo es el único punto
 * de entrada a esos datos para el resto de saladbowl-redes.
 */
import { items, categories, featured, formatPrice } from '../saladbowl-web/src/data/menu.js';
import { novedades, vigentes, mesVigente, novedadDe } from '../saladbowl-web/src/data/novedades.js';
import { locations } from '../saladbowl-web/src/data/locations.js';
import { site, hero, navLinks, social } from '../saladbowl-web/src/data/site.js';

export { items as menu, categories, featured, formatPrice };
export { novedades, vigentes as novedadesVigentes, mesVigente, novedadDe };
export { locations };
export { site, hero, navLinks, social };

/** Busca un plato del menú por slug. Devuelve undefined si no existe. */
export const platoPorSlug = (slug) => items.find((item) => item.slug === slug);

/** Busca un local por slug. Devuelve undefined si no existe. */
export const localPorSlug = (slug) => locations.find((loc) => loc.slug === slug);

/**
 * Tokens de diseño: copiados a mano de saladbowl-web/src/styles/global.css
 * (bloque @theme). Si cambian ahí, se actualizan acá — es el único lugar
 * fuera de la web donde viven.
 */
export const tokens = {
  color: {
    verde: '#143316',
    verde2: '#1d4620',
    verde3: '#2e6930',
    negro: '#222222',
    azul: '#30638e',
    rosado: '#ffbcc8',
    rojo: '#ef6048',
    rojoOscuro: '#d94e37',
    crema: '#faf9f6',
    crema2: '#f2f0e9',
  },
  fontDisplay: "'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  titulo: {
    fontWeight: 900,
    letterSpacing: '-0.02em',
    lineHeight: 1.02,
  },
};

/** Claim madre y sub-claims aprobados (PLAN.md §1). */
export const claims = {
  madre: 'Unite a la revolución saludable.',
  sub: [
    'Alimentos reales, frescos y naturales.',
    'Comer bien es la base de una vida activa, sana y feliz.',
    'Creemos en la comida real.',
    'Fresco, calidad y real.',
    'Elaboramos todos los días.',
    'Utilizamos la mejor materia prima. Eso no se negocia.',
    'Ingredientes que podés nombrar.',
  ],
};

export const hashtagsBase = ['#saladbowl', '#montevideo'];
