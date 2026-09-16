import { estaVigente } from '../lib/vigencia.js';
import { site } from './site.js';

/**
 * Novedades de la home: un plato nuevo, un aderezo, un local, lo que sea.
 *
 * Reglas:
 *  - Cada una vence sola con `hasta` ('AAAA-MM-DD'). Vencida, no se muestra.
 *  - Si no hay ninguna vigente, la sección desaparece entera de la home.
 *  - Con una sola se muestra grande, con foto. Con dos o tres, en tarjetas.
 *  - `item` es el slug del plato en menu.js: le pone la etiqueta "Nuevo" a
 *    su tarjeta en la home y en /menu mientras la novedad esté vigente.
 *
 * Campos: titulo, texto, imagen, link, linkTexto, desde (opcional), hasta,
 * item (opcional).
 */
export const novedades = [
  {
    // EJEMPLO para ver el diseño: Sweet Chicken es un plato real, pero no
    // es nuevo. Reemplazar por la primera novedad real o borrar antes de
    // salir a producción.
    titulo: 'Sweet Chicken',
    texto: 'Pollo, boniato asado, hummus, quinoa roja, cherry y castañas. Ya está en los dos locales.',
    imagen: '/img/bowl-sweet-chicken.jpg',
    link: site.orderUrl,
    linkTexto: 'Pedila',
    hasta: '2026-10-15',
    item: 'sweet-chicken',
  },
];

/** Las que se muestran hoy. Se calcula al hacer el build y se vuelve a chequear en el navegador. */
export const vigentes = novedades.filter((n) => estaVigente(n));

/** Para la etiqueta "Nuevo" en las tarjetas del menú. Devuelve la novedad o undefined. */
export const novedadDe = (slug) => vigentes.find((n) => n.item === slug);
