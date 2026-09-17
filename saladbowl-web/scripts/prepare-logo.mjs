/**
 * Saca el logo de los PNG del manual (blanco sobre verde) y deja versiones
 * recortadas con fondo transparente, listas para el nav, el footer y el favicon.
 *
 * El alfa sale de cuánto se acerca cada pixel al blanco, así se conserva el
 * antialiasing de los bordes.
 *
 *   node scripts/prepare-logo.mjs
 */
import { chromium } from 'playwright'; // requiere: npm i -D playwright
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'logo');
mkdirSync(OUT, { recursive: true });

const FUENTES = [
  { origen: 'material/logo/logo-completo-1080x1080.png', destino: 'wordmark.png', margen: 0.02 },
  { origen: 'material/logo/isotipo-aire-2000.png', destino: 'isotipo.png', margen: 0.04 },
];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();

for (const { origen, destino, margen } of FUENTES) {
  const base64 = readFileSync(join(ROOT, origen)).toString('base64');
  const salida = await page.evaluate(
    async ({ base64, margen }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${base64}`;
      await img.decode();

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const px = data.data;
      // El fondo es el color de la esquina: todo lo que se le parece se va.
      const fondo = [px[0], px[1], px[2]];
      const lumFondo = 0.2126 * fondo[0] + 0.7152 * fondo[1] + 0.0722 * fondo[2];

      let x0 = canvas.width, y0 = canvas.height, x1 = 0, y1 = 0;
      for (let i = 0; i < px.length; i += 4) {
        const lum = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
        const alpha = Math.max(0, Math.min(1, (lum - lumFondo) / (255 - lumFondo)));
        px[i] = px[i + 1] = px[i + 2] = 255;
        px[i + 3] = Math.round(alpha * 255);
        if (alpha > 0.35) {
          const p = i / 4;
          const x = p % canvas.width;
          const y = (p / canvas.width) | 0;
          if (x < x0) x0 = x;
          if (y < y0) y0 = y;
          if (x > x1) x1 = x;
          if (y > y1) y1 = y;
        }
      }
      ctx.putImageData(data, 0, 0);

      // Recorte al contenido, con un margen proporcional.
      const pad = Math.round(Math.max(x1 - x0, y1 - y0) * margen);
      const ancho = x1 - x0 + 1 + pad * 2;
      const alto = y1 - y0 + 1 + pad * 2;
      const recorte = document.createElement('canvas');
      recorte.width = ancho;
      recorte.height = alto;
      recorte.getContext('2d').drawImage(canvas, x0 - pad, y0 - pad, ancho, alto, 0, 0, ancho, alto);

      return { dataUrl: recorte.toDataURL('image/png'), ancho, alto };
    },
    { base64, margen },
  );

  writeFileSync(join(OUT, destino), Buffer.from(salida.dataUrl.split(',')[1], 'base64'));
  console.log(`${destino} · ${salida.ancho}×${salida.alto}`);
}

/* Favicon: isotipo blanco sobre cuadrado verde primario. */
const isotipo = readFileSync(join(OUT, 'isotipo.png')).toString('base64');
const favicon = await page.evaluate(async (base64) => {
  const img = new Image();
  img.src = `data:image/png;base64,${base64}`;
  await img.decode();

  const size = 180;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const r = size * 0.22;
  ctx.fillStyle = '#143316';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, r);
  ctx.fill();

  const escala = (size * 0.62) / Math.max(img.width, img.height);
  const w = img.width * escala;
  const h = img.height * escala;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return canvas.toDataURL('image/png');
}, isotipo);

writeFileSync(join(ROOT, 'public', 'favicon.png'), Buffer.from(favicon.split(',')[1], 'base64'));
console.log('favicon.png · 180×180');

await browser.close();
