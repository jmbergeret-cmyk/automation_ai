import { formatWeek } from '../lib/hours.js';

/**
 * Horarios por día de la semana (0 = domingo), en formato 'HH:MM'.
 * De acá salen tanto el texto que se muestra como el estado "abierto ahora".
 * Es el único lugar donde se tocan los horarios.
 */
const raw = [
  {
    slug: 'pocitos',
    name: 'Pocitos',
    // Sin dirección exacta todavía: por ahora se muestra sólo el barrio.
    note: 'Delivery y takeaway.',
    image: '/img/local-pocitos.jpg',
    // Lunes a viernes, mediodía y noche.
    hours: {
      1: [['11:30', '14:30'], ['20:30', '22:30']],
      2: [['11:30', '14:30'], ['20:30', '22:30']],
      3: [['11:30', '14:30'], ['20:30', '22:30']],
      4: [['11:30', '14:30'], ['20:30', '22:30']],
      5: [['11:30', '14:30'], ['20:30', '22:30']],
    },
  },
  {
    slug: 'ciudad-vieja',
    name: 'Ciudad Vieja',
    note: 'Delivery y takeaway.',
    image: '/img/local-ciudad-vieja.jpg',
    // Lunes a viernes, sólo mediodía.
    hours: {
      1: [['11:30', '15:00']],
      2: [['11:30', '15:00']],
      3: [['11:30', '15:00']],
      4: [['11:30', '15:00']],
      5: [['11:30', '15:00']],
    },
  },
];

export const locations = raw.map((place) => ({ ...place, schedule: formatWeek(place.hours) }));
