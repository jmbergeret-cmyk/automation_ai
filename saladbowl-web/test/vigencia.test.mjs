import { estaVigente } from '../src/lib/vigencia.js';

const n = { desde: '2026-09-16', hasta: '2026-10-15' };
const cases = [
  ['sin fechas → siempre vigente', {}, new Date('2030-01-01T00:00:00-03:00'), true],
  ['un minuto antes del inicio', n, new Date('2026-09-15T23:59:00-03:00'), false],
  ['justo a las 00:00 del día de inicio', n, new Date('2026-09-16T00:00:00-03:00'), true],
  ['en el medio', n, new Date('2026-10-01T12:00:00-03:00'), true],
  ['23:59 del último día (todavía se ve)', n, new Date('2026-10-15T23:59:00-03:00'), true],
  ['00:00 del día siguiente (ya venció)', n, new Date('2026-10-16T00:00:00-03:00'), false],
  ['sólo hasta, antes', { hasta: '2026-10-15' }, new Date('2026-01-01T00:00:00-03:00'), true],
  ['sólo hasta, después', { hasta: '2026-10-15' }, new Date('2026-12-01T00:00:00-03:00'), false],
  // El servidor de build está en UTC: 02:30 UTC del 16 son las 23:30 del 15 en Montevideo.
  ['build en UTC, 02:30Z del 16/10 = 23:30 del 15 en Montevideo → vigente', n, new Date('2026-10-16T02:30:00Z'), true],
  ['build en UTC, 03:00Z del 16/10 = 00:00 del 16 en Montevideo → vencida', n, new Date('2026-10-16T03:00:00Z'), false],
];

let failed = 0;
for (const [label, item, now, expected] of cases) {
  const got = estaVigente(item, now);
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✗'} ${label} → ${got}`);
}
if (failed) {
  console.error(`\n${failed} caso(s) fallaron`);
  process.exit(1);
}
