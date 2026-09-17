/**
 * Horarios de los locales: estado en vivo y texto legible.
 *
 * Los rangos se guardan por día de la semana (0 = domingo, como getDay()),
 * en formato 'HH:MM'. Un rango que termina antes de que empiece se entiende
 * como cruce de medianoche (ej. 20:00–01:00).
 *
 * Todo el cálculo es puro: recibe la fecha, no la busca. Así se puede testear.
 */

export const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const DAY_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

/** Minutos que faltan para el cierre a partir de los cuales avisamos. */
export const CLOSING_SOON_MINUTES = 45;

const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const toClock = (minutes) => {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/** Rangos del día `day`, normalizados a minutos y con el cruce de medianoche resuelto. */
const rangesFor = (hours, day) =>
  (hours[day] || []).map(([open, close]) => {
    const start = toMinutes(open);
    let end = toMinutes(close);
    if (end <= start) end += 1440; // cierra después de medianoche
    return { start, end };
  });

/**
 * Estado del local en un momento dado.
 * @returns {{state: 'open'|'closing-soon'|'closed', label: string, closesAt?: string, opensAt?: string}}
 */
export function getStatus(hours, now = new Date()) {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();

  // ¿Seguimos dentro de un rango que arrancó ayer y cruzó la medianoche?
  const yesterday = (day + 6) % 7;
  const spill = rangesFor(hours, yesterday).find((r) => r.end > 1440 && minutes < r.end - 1440);
  const open = spill
    ? { start: spill.start - 1440, end: spill.end - 1440 }
    : rangesFor(hours, day).find((r) => minutes >= r.start && minutes < r.end);

  if (open) {
    const left = open.end - minutes;
    const closesAt = toClock(open.end);
    return left <= CLOSING_SOON_MINUTES
      ? { state: 'closing-soon', label: `Cierra ${closesAt}`, closesAt }
      : { state: 'open', label: 'Abierto ahora', closesAt };
  }

  // Próxima apertura: hoy más tarde, o el primer día que tenga horario.
  const later = rangesFor(hours, day).find((r) => r.start > minutes);
  if (later) {
    const opensAt = toClock(later.start);
    return { state: 'closed', label: `Cerrado — abre a las ${opensAt}`, opensAt };
  }

  for (let i = 1; i <= 7; i++) {
    const next = rangesFor(hours, (day + i) % 7)[0];
    if (!next) continue;
    const opensAt = toClock(next.start);
    const when = i === 1 ? 'mañana' : DAY_NAMES[(day + i) % 7];
    return { state: 'closed', label: `Cerrado — abre ${when} ${opensAt}`, opensAt };
  }

  return { state: 'closed', label: 'Cerrado' };
}

/** "Lun a vie 11:30–22:00 · Sáb y dom 12:00–22:00" a partir de los rangos. */
export function formatWeek(hours) {
  const order = [1, 2, 3, 4, 5, 6, 0]; // arrancamos en lunes
  const key = (day) => (hours[day] || []).map(([a, b]) => `${a}–${b}`).join(', ');

  const groups = [];
  for (const day of order) {
    const value = key(day);
    if (!value) continue;
    const last = groups.at(-1);
    if (last && last.value === value && order.indexOf(day) === order.indexOf(last.days.at(-1)) + 1) {
      last.days.push(day);
    } else {
      groups.push({ value, days: [day] });
    }
  }

  const label = (days) => {
    const names = days.map((d) => DAY_SHORT[d][0].toUpperCase() + DAY_SHORT[d].slice(1));
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} y ${names[1]}`;
    return `${names[0]} a ${names.at(-1)}`;
  };

  return groups.map((g) => `${label(g.days)} ${g.value}`).join(' · ');
}
