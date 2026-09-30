/**
 * Motor de render: {plantilla, variables, salida} → JPG.
 *
 * Arma el HTML de una plantilla inyectando variables en su index.html (sin
 * frameworks: reemplazo de {{clave}} con escape de HTML por defecto), lo abre
 * con Playwright al tamaño exacto de la plantilla y guarda un JPG calidad 90.
 *
 *   node scripts/render.mjs quincenas/2026-10-a/piezas/01.json [...]
 *
 * Cada archivo de pieza es un JSON: { plantilla, variables, salida }.
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const PLANTILLAS_DIR = join(ROOT, 'plantillas');
const CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/*
 * `page.setContent()` deja el documento con origen about:blank, y Chromium
 * no le deja pedir file:// desde ahí (mismo problema que ya resolvieron
 * saladbowl-web/scripts/prepare-*.mjs): todo lo local va como data URI en
 * vez de file://.
 */
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };

function dataUri(rutaAbsoluta) {
  const mime = MIME[extname(rutaAbsoluta).toLowerCase()];
  if (!mime) throw new Error(`tipo de archivo sin mime declarado: ${rutaAbsoluta}`);
  return `data:${mime};base64,${readFileSync(rutaAbsoluta).toString('base64')}`;
}

/** Tamaño en píxeles de cada plantilla (PLAN.md §4). */
export const TAMANIOS = {
  'post-foto': [1080, 1350],
  'post-placa': [1080, 1350],
  'post-novedad': [1080, 1350],
  'post-menu': [1080, 1350],
  'post-local': [1080, 1350],
  'story-foto': [1080, 1920],
  'story-placa': [1080, 1920],
  'reel-cover': [1080, 1920],
};

/** Marca un string como HTML ya armado: `inyectar` no lo escapa. */
class Cruda {
  constructor(valor) {
    this.valor = valor;
  }
}
export const cruda = (valor) => new Cruda(valor);

const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (valor) => String(valor ?? '').replace(/[&<>"']/g, (c) => ENTIDADES[c]);

/** data URI de una foto/imagen relativa a la raíz de saladbowl-redes. */
export const rutaRedes = (relativa) => dataUri(join(ROOT, relativa));

/**
 * data URI de una imagen pública de saladbowl-web. Recibe la misma ruta que
 * usan menu.js/locations.js/site.js ('/img/foo.jpg'): raíz de public/.
 */
export const rutaWeb = (publica) => dataUri(join(ROOT, '..', 'saladbowl-web', 'public', publica.replace(/^\/+/, '')));

export const ISOTIPO_URL = rutaWeb('/logo/isotipo.png');
export const WORDMARK_URL = rutaWeb('/logo/wordmark.png');

const NOMBRES_FUENTES = [
  'lato-400-latin-ext.woff2',
  'lato-400-latin.woff2',
  'lato-700-latin-ext.woff2',
  'lato-700-latin.woff2',
  'lato-900-latin-ext.woff2',
  'lato-900-latin.woff2',
];

let baseCSSCache;
function leerBase() {
  if (baseCSSCache) return baseCSSCache;
  let css = readFileSync(join(PLANTILLAS_DIR, '_base.css'), 'utf8');
  for (const nombre of NOMBRES_FUENTES) {
    css = css.replaceAll(`__FUENTES__/${nombre}`, dataUri(join(PLANTILLAS_DIR, 'fuentes', nombre)));
  }
  baseCSSCache = css;
  return css;
}

/** Reemplaza {{clave}} en `texto`. Sin la clave en `valores`, queda vacío. */
function inyectar(texto, valores) {
  return texto.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, clave) => {
    if (!(clave in valores)) return '';
    const valor = valores[clave];
    return valor instanceof Cruda ? valor.valor : esc(valor);
  });
}

/** Arma el documento HTML completo de una pieza (para debug / hoja.mjs). */
export function armarHTML(plantilla, variables) {
  const dir = join(PLANTILLAS_DIR, plantilla);
  const indexPath = join(dir, 'index.html');
  if (!existsSync(indexPath)) throw new Error(`plantilla desconocida: ${plantilla}`);

  const plantillaHTML = readFileSync(indexPath, 'utf8');
  const estilosPath = join(dir, 'estilos.css');
  const estilos = existsSync(estilosPath) ? readFileSync(estilosPath, 'utf8') : '';

  const cuerpo = inyectar(plantillaHTML, variables);

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
${leerBase()}
${estilos}
</style>
</head>
<body>
${cuerpo}
</body>
</html>`;
}

export async function abrirNavegador() {
  return chromium.launch({ executablePath: CHROMIUM, args: ['--no-sandbox'] });
}

/** Renderiza una pieza en una página ya abierta. Devuelve el Buffer del JPG. */
export async function renderPieza(page, { plantilla, variables }) {
  const tamanio = TAMANIOS[plantilla];
  if (!tamanio) throw new Error(`plantilla desconocida: ${plantilla}`);
  const [width, height] = tamanio;

  await page.setViewportSize({ width, height });
  await page.setContent(armarHTML(plantilla, variables), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0));

  return page.screenshot({ type: 'jpeg', quality: 90 });
}

async function cli(argv) {
  if (argv.length === 0) {
    console.error('uso: node scripts/render.mjs <pieza.json> [...]');
    process.exit(1);
  }

  const browser = await abrirNavegador();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  try {
    for (const archivo of argv) {
      const pieza = JSON.parse(readFileSync(archivo, 'utf8'));
      const buffer = await renderPieza(page, pieza);
      mkdirSync(dirname(pieza.salida), { recursive: true });
      writeFileSync(pieza.salida, buffer);
      console.log(`${pieza.salida}  (${pieza.plantilla}, ${(buffer.length / 1024).toFixed(0)} KB)`);
    }
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await cli(process.argv.slice(2));
}
