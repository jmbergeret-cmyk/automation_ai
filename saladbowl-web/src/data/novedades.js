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
  // Sin novedades por ahora: la banda no se muestra. Para cargar una, se
  // descomenta este bloque y se completa. Con `mes` alcanza para que venza
  // sola el último día.
  //
  // {
  //   mes: '2026-10',
  //   titulo: 'Nombre del plato',
  //   texto: 'Una línea con qué tiene.',
  //   imagen: '/img/nombre-de-la-foto.jpg',
  //   link: site.orderUrl,
  //   linkTexto: 'Pedila',
  //   item: 'slug-del-plato-en-menu.js', // opcional: etiqueta "Nuevo" en el menú
  // },
];

/** Las que se muestran hoy. Se calcula al hacer el build y se vuelve a chequear en el navegador. */
export const vigentes = novedades.map(conFechas).filter((n) => estaVigente(n));

/** Título de la sección: el mes de las novedades vigentes. */
export const mesVigente = vigentes.length ? nombreMes(vigentes[0].mes ?? vigentes[0].desde.slice(0, 7)) : null;

/** Para la etiqueta "Nuevo" en las tarjetas del menú. Devuelve la novedad o undefined. */
export const novedadDe = (slug) => vigentes.find((n) => n.item === slug);
