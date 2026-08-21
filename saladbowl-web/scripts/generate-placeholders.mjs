/**
 * Genera los placeholders de fotos en public/img.
 * Son SVG livianos, con las proporciones finales de cada foto,
 * para poder reemplazarlos por las fotos reales sin tocar el layout.
 *
 *   npm run placeholders
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'img');

const PALETTES = [
  ['#EDEFE6', '#1E3D2F', '#4CAF6D', '#F5C542'],
  ['#E9EEE4', '#24503C', '#5FBB7E', '#F0C24A'],
  ['#F1EDE2', '#1E3D2F', '#7DC48F', '#E8B93C'],
  ['#E7EDE7', '#2A5641', '#4CAF6D', '#F5C542'],
];

/** PRNG determinístico: mismo nombre, mismo dibujo. */
function rng(seed) {
  let s = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function placeholder({ name, w, h, label }) {
  const rand = rng(name);
  const [bg, dark, green, citrus] = PALETTES[Math.floor(rand() * PALETTES.length)];
  const cx = w * (0.42 + rand() * 0.16);
  const cy = h * (0.44 + rand() * 0.12);
  const r = Math.min(w, h) * (0.3 + rand() * 0.05);

  // "Ingredientes": puntos distribuidos dentro del bowl.
  let bits = '';
  const count = 14 + Math.floor(rand() * 10);
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * r * 0.78;
    const rr = r * (0.07 + rand() * 0.1);
    const fill = rand() > 0.82 ? citrus : green;
    bits += `<circle cx="${(cx + Math.cos(a) * d).toFixed(1)}" cy="${(cy + Math.sin(a) * d).toFixed(1)}" r="${rr.toFixed(1)}" fill="${fill}" opacity="${(0.35 + rand() * 0.45).toFixed(2)}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="72%">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${dark}" stop-opacity="0.14"/>
    </radialGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/><feColorMatrix type="saturate" values="0"/></filter>
    <clipPath id="bowl"><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}"/></clipPath>
  </defs>
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * 1.12).toFixed(1)}" fill="${dark}" opacity="0.07"/>
  <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="#FFFFFF" opacity="0.55"/>
  <g clip-path="url(#bowl)">${bits}</g>
  <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${dark}" stroke-opacity="0.16" stroke-width="${(Math.min(w, h) * 0.006).toFixed(1)}"/>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.05"/>
  <text x="${(w * 0.05).toFixed(0)}" y="${(h - h * 0.045).toFixed(0)}" font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(Math.min(w, h) * 0.032)}" letter-spacing="${(Math.min(w, h) * 0.004).toFixed(1)}" fill="${dark}" opacity="0.4">${label.toUpperCase()} · ${w}×${h}</text>
</svg>
`;
}

const IMAGES = [
  { name: 'hero', w: 1200, h: 1500, label: 'Hero' },
  { name: 'marca', w: 1600, h: 1200, label: 'Marca' },
  { name: 'bowl-verde-bravo', w: 1000, h: 1000, label: 'Verde bravo' },
  { name: 'bowl-pollo-quinoa', w: 1000, h: 1000, label: 'Pollo y quinoa' },
  { name: 'bowl-cesar', w: 1000, h: 1000, label: 'Cesar' },
  { name: 'bowl-falafel', w: 1000, h: 1000, label: 'Falafel' },
  { name: 'bowl-salmon', w: 1000, h: 1000, label: 'Salmon' },
  { name: 'bowl-mediterraneo', w: 1000, h: 1000, label: 'Mediterraneo' },
  { name: 'local-pocitos', w: 1200, h: 800, label: 'Pocitos' },
  { name: 'local-ciudad-vieja', w: 1200, h: 800, label: 'Ciudad Vieja' },
  { name: 'local-carrasco', w: 1200, h: 800, label: 'Carrasco' },
];

mkdirSync(OUT, { recursive: true });
for (const img of IMAGES) {
  writeFileSync(join(OUT, `${img.name}.svg`), placeholder(img));
}
console.log(`${IMAGES.length} placeholders en public/img`);
