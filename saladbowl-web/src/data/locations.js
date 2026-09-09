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
    image: '/img/local-pocitos.svg',
    hours: {
      0: [['12:00', '22:00']],
      1: [['11:30', '22:00']],
      2: [['11:30', '22:00']],
      3: [['11:30', '22:00']],
      4: [['11:30', '22:00']],
      5: [['11:30', '22:00']],
      6: [['12:00', '22:00']],
    },
  },
  {
    slug: 'ciudad-vieja',
    name: 'Ciudad Vieja',
    note: 'Delivery y takeaway.',
    image: '/img/local-ciudad-vieja.svg',
    hours: {
      1: [['11:00', '17:00']],
      2: [['11:00', '17:00']],
      3: [['11:00', '17:00']],
      4: [['11:00', '17:00']],
      5: [['11:00', '17:00']],
      6: [['11:00', '16:00']],
    },
  },
];

export const locations = raw.map((place) => ({ ...place, schedule: formatWeek(place.hours) }));
