/**
 * Vigencia por fechas, para novedades y avisos.
 *
 * `desde` y `hasta` son 'AAAA-MM-DD' y se interpretan en hora de Montevideo:
 * algo con `hasta: '2026-10-31'` se ve hasta las 23:59 de ese día y a las
 * 00:00 del 1 de noviembre desaparece. Los dos campos son opcionales.
 */
const TZ = '-03:00'; // Montevideo no tiene horario de verano desde 2015.

export function inicioDelDia(fecha) {
  return new Date(`${fecha}T00:00:00${TZ}`);
}

export function finDelDia(fecha) {
  return new Date(`${fecha}T23:59:59.999${TZ}`);
}

export function estaVigente({ desde, hasta } = {}, now = new Date()) {
  if (desde && now < inicioDelDia(desde)) return false;
  if (hasta && now > finDelDia(hasta)) return false;
  return true;
}
