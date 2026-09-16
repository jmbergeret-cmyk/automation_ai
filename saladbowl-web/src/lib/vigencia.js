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

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** 'AAAA-MM' → { desde: primer día, hasta: último día } del mes. */
export function rangoMes(mes) {
  const [y, m] = mes.split('-').map(Number);
  const ultimo = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const mm = String(m).padStart(2, '0');
  return { desde: `${y}-${mm}-01`, hasta: `${y}-${mm}-${ultimo}` };
}

/** 'AAAA-MM' → 'Septiembre' */
export function nombreMes(mes) {
  const nombre = MESES[Number(mes.split('-')[1]) - 1];
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

/**
 * Normaliza una novedad: si tiene `mes`, de ahí salen desde/hasta
 * (un `hasta` explícito gana, por si algo dura más que el mes).
 */
export function conFechas(n) {
  if (!n.mes) return n;
  const r = rangoMes(n.mes);
  return { ...n, desde: n.desde ?? r.desde, hasta: n.hasta ?? r.hasta };
}
