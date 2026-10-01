/**
 * Hoja de contacto: renderiza las 8 plantillas con datos de ejemplo reales
 * del repo (menú, locales, claims aprobados — nada inventado) y arma una
 * sola imagen PNG para que Juan apruebe el diseño.
 *
 * Criterio de aceptación de la Fase 2 (PLAN.md §10): Juan mira esta hoja y
 * aprueba el diseño antes de seguir con los reels.
 *
 *   node scripts/hoja.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { abrirNavegador, renderPieza, rutaWeb, ISOTIPO_URL, WORDMARK_URL } from './render.mjs';
import {
  wordmarkHTML,
  isotipoHTML,
  parrafo,
  fondoPlaca,
  celdaMenu,
  gridHTML,
  carruselBadge,
  ctaHTML,
  pillsHTML,
} from '../plantillas/ayudantes.mjs';
import { menu, categories, locations, claims, site } from '../fuentes.mjs';

const ROOT = join(import.meta.dirname, '..');
const OUT = join(ROOT, 'quincenas', '_hoja-contacto.png');

const item = (slug) => {
  const found = menu.find((m) => m.slug === slug);
  if (!found) throw new Error(`no existe el plato ${slug} en menu.js`);
  return found;
};
const local = (slug) => {
  const found = locations.find((l) => l.slug === slug);
  if (!found) throw new Error(`no existe el local ${slug} en locations.js`);
  return found;
};

const cesar = item('caesar-salad');
const california = item('california-salad');
const garbanzo = item('garbanzo-chips-salad');
const sweetChicken = item('sweet-chicken');
const veggieWrap = item('hot-veggie-wrap');
const pocitos = local('pocitos');

const wordmarkCrema = () => wordmarkHTML(WORDMARK_URL, { color: 'var(--crema)', ancho: 200 });

// Único CTA aprobado (PLAN.md §1): pedir en saladbowl.pidedirecto.uy.
const dominioPedidos = site.orderUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

const mesActual = new Intl.DateTimeFormat('es-UY', { month: 'long' }).format(new Date());
const mesCapitalizado = mesActual.charAt(0).toUpperCase() + mesActual.slice(1);

/** Las 8 piezas de muestra, una por plantilla. Todo el contenido sale del repo. */
const piezas = [
  {
    plantilla: 'post-foto',
    variables: {
      foto: rutaWeb(cesar.image),
      titulo: cesar.name,
      subtitulo_html: parrafo(cesar.description, 'subtitulo'),
      carrusel_html: '',
      wordmark_html: wordmarkCrema(),
    },
  },
  {
    plantilla: 'post-placa',
    variables: (() => {
      const { fondo, texto } = fondoPlaca('verde');
      return {
        fondo_color: fondo,
        color_texto: texto,
        claim: claims.madre,
        pills_html: '',
        firma_html: parrafo('@saladbowluy', 'firma'),
        cta_html: ctaHTML('Hacé tu pedido', dominioPedidos, { fondo: 'var(--rojo)', color: 'var(--verde)' }),
        isotipo_html: isotipoHTML(ISOTIPO_URL, { color: texto, ancho: 140 }),
      };
    })(),
  },
  {
    // Ejemplo de maqueta: no hay novedad vigente hoy (novedades.js), así que
    // se usa un plato real del menú sólo para probar el layout de la banda.
    plantilla: 'post-novedad',
    variables: {
      mes: mesCapitalizado,
      titulo: california.name,
      foto: rutaWeb(california.image),
      wordmark_html: wordmarkHTML(WORDMARK_URL, { color: 'var(--verde)', ancho: 180 }),
    },
  },
  {
    plantilla: 'post-menu',
    variables: {
      items_html: gridHTML(
        [garbanzo, sweetChicken, veggieWrap],
        (i) => celdaMenu({ foto: rutaWeb(i.image), nombre: i.name }),
      ),
      wordmark_html: wordmarkHTML(WORDMARK_URL, { color: 'var(--verde)', ancho: 180 }),
    },
  },
  {
    plantilla: 'post-local',
    variables: {
      foto: rutaWeb(pocitos.image),
      nombre: pocitos.name,
      horario: pocitos.schedule,
      nota: pocitos.note,
      wordmark_html: wordmarkCrema(),
    },
  },
  {
    plantilla: 'story-foto',
    variables: {
      foto: rutaWeb(sweetChicken.image),
      texto: claims.sub[6], // "Ingredientes que podés nombrar."
      wordmark_html: wordmarkCrema(),
    },
  },
  {
    plantilla: 'story-placa',
    variables: (() => {
      const { fondo, texto } = fondoPlaca('rosado');
      return {
        fondo_color: fondo,
        color_texto: texto,
        texto: claims.sub[2], // "Creemos en la comida real."
        pills_html: pillsHTML(categories.map((c) => c.label), { fondo: 'var(--verde)', color: 'var(--rosado)' }),
        cta_html: ctaHTML('Hacé tu pedido', dominioPedidos, { fondo: 'var(--verde)', color: 'var(--rosado)' }),
        isotipo_html: isotipoHTML(ISOTIPO_URL, { color: texto, ancho: 160 }),
      };
    })(),
  },
  {
    plantilla: 'reel-cover',
    variables: {
      foto: rutaWeb(california.image),
      titulo: california.name,
      wordmark_html: wordmarkCrema(),
    },
  },
];

async function main() {
  mkdirSync(join(ROOT, 'quincenas'), { recursive: true });

  const browser = await abrirNavegador();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  const celdas = [];
  for (const pieza of piezas) {
    const buffer = await renderPieza(page, pieza);
    const dataUri = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    celdas.push({ plantilla: pieza.plantilla, dataUri });
    console.log(`renderizada: ${pieza.plantilla}`);
  }

  // Compone la hoja de contacto: una página HTML con las 8 miniaturas.
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 48px; background: #e9e6de; font-family: Arial, sans-serif; }
  h1 { margin: 0 0 32px; font-size: 28px; color: #143316; }
  .grilla { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
  figure { margin: 0; }
  figure img { width: 100%; display: block; border-radius: 8px; box-shadow: 0 4px 18px rgba(0,0,0,0.18); }
  figcaption { margin-top: 10px; font-size: 15px; font-weight: bold; color: #143316; text-align: center; }
</style>
</head>
<body>
  <h1>Saladbowl · Redes — hoja de contacto (Fase 2)</h1>
  <div class="grilla">
    ${celdas
      .map((c) => `<figure><img src="${c.dataUri}"><figcaption>${c.plantilla}</figcaption></figure>`)
      .join('\n    ')}
  </div>
</body>
</html>`;

  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.setContent(html, { waitUntil: 'load' });
  const alto = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewportSize({ width: 1440, height: alto });
  const hoja = await page.screenshot({ type: 'png', fullPage: true });
  writeFileSync(OUT, hoja);

  await browser.close();
  console.log(`\nhoja de contacto: ${OUT}`);
}

main();
