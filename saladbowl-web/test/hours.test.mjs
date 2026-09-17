import { getStatus, formatWeek } from '../src/lib/hours.js';

const pocitos = {
  0: [['12:00', '22:00']], 1: [['11:30', '22:00']], 2: [['11:30', '22:00']],
  3: [['11:30', '22:00']], 4: [['11:30', '22:00']], 5: [['11:30', '22:00']], 6: [['12:00', '22:00']],
};
const cv = { 1: [['11:00','17:00']], 2: [['11:00','17:00']], 3: [['11:00','17:00']], 4: [['11:00','17:00']], 5: [['11:00','17:00']], 6: [['11:00','16:00']] };
const nocturno = { 4: [['20:00', '01:00']] }; // jueves de 20 a 01

// 2026-08-27 es jueves
const at = (s) => new Date(`2026-08-27T${s}:00`);
const cases = [
  ['jueves 11:29 (un minuto antes de abrir)', pocitos, at('11:29'), 'closed'],
  ['jueves 11:30 (justo abre)', pocitos, at('11:30'), 'open'],
  ['jueves 15:00 (pleno servicio)', pocitos, at('15:00'), 'open'],
  ['jueves 21:14 (46 min para cerrar)', pocitos, at('21:14'), 'open'],
  ['jueves 21:15 (45 min para cerrar)', pocitos, at('21:15'), 'closing-soon'],
  ['jueves 21:59 (último minuto)', pocitos, at('21:59'), 'closing-soon'],
  ['jueves 22:00 (justo cierra)', pocitos, at('22:00'), 'closed'],
  ['jueves 23:00 (abre mañana)', pocitos, at('23:00'), 'closed'],
  ['domingo 13:00 en Ciudad Vieja (cerrado todo el día)', cv, new Date('2026-08-30T13:00:00'), 'closed'],
  ['jueves 23:30 con cierre 01:00', nocturno, at('23:30'), 'open'],
  ['viernes 00:30 con cierre 01:00 (cruce de medianoche)', nocturno, new Date('2026-08-28T00:30:00'), 'closing-soon'],
  ['viernes 01:30 (ya cerró)', nocturno, new Date('2026-08-28T01:30:00'), 'closed'],
];

let fail = 0;
for (const [name, hours, date, expected] of cases) {
  const { state, label } = getStatus(hours, date);
  const ok = state === expected;
  if (!ok) fail++;
  console.log(`${ok ? '✓' : '✗'} ${name} → ${state} · "${label}"${ok ? '' : `  ESPERADO ${expected}`}`);
}
console.log('\nformatWeek Pocitos:     ', formatWeek(pocitos));
console.log('formatWeek Ciudad Vieja:', formatWeek(cv));
process.exit(fail ? 1 : 0);
