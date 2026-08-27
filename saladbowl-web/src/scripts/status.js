/**
 * Estado "abierto ahora" de cada local, calculado en el cliente con la hora
 * del dispositivo. Los horarios viajan en el atributo data-status de cada card
 * (vienen de src/data/locations.js, que es el único lugar donde se editan).
 */
import { getStatus } from '../lib/hours.js';

function paint() {
  document.querySelectorAll('[data-status]').forEach((badge) => {
    let hours;
    try {
      hours = JSON.parse(badge.dataset.status);
    } catch {
      return;
    }
    const { state, label } = getStatus(hours);
    badge.dataset.state = state;
    const text = badge.querySelector('[data-status-label]');
    if (text) text.textContent = label;
    badge.hidden = false;
  });
}

document.addEventListener('astro:page-load', paint);
// El estado cambia solo: lo revisamos cada minuto.
setInterval(paint, 60_000);
