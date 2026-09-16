import { estaVigente, conFechas, nombreMes } from '../lib/vigencia.js';
import { site } from './site.js';

/**
 * Novedades del mes. Se muestran en la home, en una banda rosada, con el
 * mes como título ("Novedades · Septiembre").
 *
 * Reglas:
 *  - Cada una lleva `mes: 'AAAA-MM'` y vence sola el último día de ese mes.
 *    Si algo tiene que durar más, se le agrega `hasta: 'AAAA-MM-DD'`.
 *  - Si no hay ninguna vigente, la sección desaparece entera de la home.
 *  - Con una sola va grande, con foto. Con dos o tres, en tarjetas.
 *  - `item` es el slug del plato en menu.js: le pone la etiqueta "Nuevo" a
 *    su tarjeta en la home y en /menu mientras la novedad esté vigente.
 *
 * Campos: mes, titulo, texto, imagen, link, linkTexto, item (opcional),
 * hasta (opcional).
 */
export const novedades = [
  {
    // EJEMPLO para ver el diseño: Sweet Chicken es un plato real, pero no
    // es nuevo. Reemplazar por la primera novedad real o borrar antes de
    // salir a producción.
    mes: '2026-09',
    titulo: 'Sweet Chicken',
    texto: 'Pollo, boniato asado, hummus, quinoa roja, cherry y castañas. Ya está en los dos locales.',
    imagen: '/img/bowl-sweet-chicken.jpg',
    link: site.orderUrl,
    linkTexto: 'Pedila',
    item: 'sweet-chicken',
  },
];

/** Las que se muestran hoy. Se calcula al hacer el build y se vuelve a chequear en el navegador. */
export const vigentes = novedades.map(conFechas).filter((n) => estaVigente(n));

/** Título de la sección: el mes de las novedades vigentes. */
export const mesVigente = vigentes.length ? nombreMes(vigentes[0].mes ?? vigentes[0].desde.slice(0, 7)) : null;

/** Para la etiqueta "Nuevo" en las tarjetas del menú. Devuelve la novedad o undefined. */
export const novedadDe = (slug) => vigentes.find((n) => n.item === slug);
