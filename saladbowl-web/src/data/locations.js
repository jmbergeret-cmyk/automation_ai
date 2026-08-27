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
    address: 'Av. Brasil 2650, esq. Bulevar España',
    note: 'Salón para 30 y barra sobre la vereda.',
    image: '/img/local-pocitos.svg',
    mapUrl: 'https://maps.google.com/?q=Av.+Brasil+2650,+Montevideo',
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
    address: 'Sarandí 480, entre Treinta y Tres y Misiones',
    note: 'El del mediodía: pedís, esperás cinco minutos y seguís.',
    image: '/img/local-ciudad-vieja.svg',
    mapUrl: 'https://maps.google.com/?q=Sarand%C3%AD+480,+Montevideo',
    hours: {
      1: [['11:00', '17:00']],
      2: [['11:00', '17:00']],
      3: [['11:00', '17:00']],
      4: [['11:00', '17:00']],
      5: [['11:00', '17:00']],
      6: [['11:00', '16:00']],
    },
  },
  {
    slug: 'carrasco',
    name: 'Carrasco',
    address: 'Av. Arocena 1580, esq. Costa Rica',
    note: 'Con patio y estacionamiento sobre Costa Rica.',
    image: '/img/local-carrasco.svg',
    mapUrl: 'https://maps.google.com/?q=Av.+Arocena+1580,+Montevideo',
    hours: {
      0: [['11:30', '22:30']],
      1: [['11:30', '22:30']],
      2: [['11:30', '22:30']],
      3: [['11:30', '22:30']],
      4: [['11:30', '22:30']],
      5: [['11:30', '23:30']],
      6: [['11:30', '23:30']],
    },
  },
];

export const locations = raw.map((place) => ({ ...place, schedule: formatWeek(place.hours) }));
