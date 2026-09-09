/**
 * Convierte las fotos originales de material/fotos en las versiones que usa el
 * sitio: recorte a la proporción de cada lugar, resize y JPEG comprimido.
 *
 * Los originales quedan intactos; esto sólo escribe en public/img.
 * Requiere playwright (npm i -D playwright) para usar el canvas del navegador.
 *
 *   node scripts/prepare-photos.mjs
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'img');

/**
 * focusX/focusY: qué punto del original queda centrado en el recorte (0-1).
 * Por defecto el centro.
 */
const FOTOS = [
  {
    origen: 'material/fotos/Caesar Salad.jpg',
    destino: 'bowl-cesar.jpg',
    ancho: 1200,
    alto: 1200,
  },
  {
    origen: 'material/fotos/California Salad.jpg',
    destino: 'bowl-california.jpg',
    ancho: 1200,
    alto: 1200,
  },
  {
    origen: 'material/fotos/Garbanzo chips salad.jpg',
    destino: 'bowl-garbanzo.jpg',
    ancho: 1200,
    alto: 1200,
  },
  {
    origen: 'material/fotos/image00010 - copia.jpeg',
    destino: 'wrap-pollo.jpg',
    ancho: 1200,
    alto: 1200,
    focusY: 0.45,
  },
  {
    origen: 'material/fotos/image00017 - copia.jpeg',
    destino: 'bebida-jugo.jpg',
    ancho: 1200,
    alto: 1200,
    focusY: 0.45,
  },
  {
    // Sección de marca: la foto del jugo con el packaging y alguien atendiendo.
    origen: 'material/fotos/image00017 - copia.jpeg',
    destino: 'marca.jpg',
    ancho: 1200,
    alto: 1500,
  },
  {
    /*
     * Hero a sangre. Recortar la foto sin más agranda tanto el bowl que se
     * pierde su silueta, así que recomponemos: como el fondo del original es
     * liso, lo extendemos y apoyamos el bowl entero sobre el tercio derecho,
     * dejando aire a la izquierda para el claim.
     */
    origen: 'material/fotos/California Salad.jpg',
    destino: 'hero.jpg',
    ancho: 2400,
    alto: 1350,
    componer: { escalaAlto: 1, centroX: 0.68, difuminado: 260 },
  },
  {
    /*
     * Hero de mobile: vertical, con el bowl arriba y aire abajo, que es donde
     * cae el claim. Mismo criterio de recomposición sobre el fondo liso.
     */
    // El sándwich es vertical y de fondo ambiente: acá alcanza con recortar.
    origen: 'material/fotos/Chicken Avocado Sandwich.jpg',
    destino: 'hero-mobile.jpg',
    ancho: 1200,
    alto: 2000,
    focusY: 0.46,
  },
];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
mkdirSync(OUT, { recursive: true });

for (const foto of FOTOS) {
  const base64 = readFileSync(join(ROOT, foto.origen)).toString('base64');
  const salida = await page.evaluate(
    async ({ base64, ancho, alto, focusX, focusY, componer }) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64}`;
      await img.decode();

      if (componer) {
        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';

        // El fondo del original: lo tomamos de una esquina y pintamos todo el cuadro.
        const muestra = document.createElement('canvas');
        muestra.width = muestra.height = 1;
        muestra.getContext('2d').drawImage(img, 8, 8, 1, 1, 0, 0, 1, 1);
        const [r, g, b] = muestra.getContext('2d').getImageData(0, 0, 1, 1).data;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(0, 0, ancho, alto);

        const escala = (alto * componer.escalaAlto) / img.height;
        const w = img.width * escala;
        const h = img.height * escala;
        const x = ancho * componer.centroX - w / 2;
        const y = alto * (componer.centroY ?? 0.5) - h / 2;
        ctx.drawImage(img, x, y, w, h);

        // Los bordes de la foto se funden con el fondo extendido.
        const d = componer.difuminado;
        const bordes = [
          [x - 2, 0, d + 2, alto, ctx.createLinearGradient(x, 0, x + d, 0)],
          [x + w - d, 0, d + 2, alto, ctx.createLinearGradient(x + w, 0, x + w - d, 0)],
          [0, y - 2, ancho, d + 2, ctx.createLinearGradient(0, y, 0, y + d)],
          [0, y + h - d, ancho, d + 2, ctx.createLinearGradient(0, y + h, 0, y + h - d)],
        ];
        for (const [bx, by, bw, bh, grad] of bordes) {
          grad.addColorStop(0, `rgb(${r},${g},${b})`);
          grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = grad;
          ctx.fillRect(bx, by, bw, bh);
        }

        return canvas.toDataURL('image/jpeg', 0.86);
      }

      // Recorte tipo object-fit: cover alrededor del punto de foco.
      const escala = Math.max(ancho / img.width, alto / img.height);
      const anchoVisible = ancho / escala;
      const altoVisible = alto / escala;
      const x = Math.max(0, Math.min(img.width - anchoVisible, img.width * focusX - anchoVisible / 2));
      const y = Math.max(0, Math.min(img.height - altoVisible, img.height * focusY - altoVisible / 2));

      const canvas = document.createElement('canvas');
      canvas.width = ancho;
      canvas.height = alto;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x, y, anchoVisible, altoVisible, 0, 0, ancho, alto);
      return canvas.toDataURL('image/jpeg', 0.84);
    },
    {
      base64,
      ancho: foto.ancho,
      alto: foto.alto,
      focusX: foto.focusX ?? 0.5,
      focusY: foto.focusY ?? 0.5,
      componer: foto.componer ?? null,
    },
  );

  const buffer = Buffer.from(salida.split(',')[1], 'base64');
  writeFileSync(join(OUT, foto.destino), buffer);
  console.log(`${foto.destino} · ${foto.ancho}×${foto.alto} · ${(buffer.length / 1024).toFixed(0)} KB`);
}

await browser.close();
