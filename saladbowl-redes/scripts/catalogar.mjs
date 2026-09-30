/**
 * Agrega a fotos.json las fotos nuevas de fotos/ y de saladbowl-web/public/img/
 * (las que ya están procesadas para la web, fuente: "web"). No inventa nada:
 * sólo mide el archivo (ancho, alto, hash) y dejar el resto de los campos
 * vacíos, para que el agente los complete mirando la foto (PLAN.md §3).
 *
 *   node scripts/catalogar.mjs
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOGO = join(ROOT, 'fotos.json');
const CARPETAS = [
  { dir: join(ROOT, 'fotos'), fuente: 'propia' },
  { dir: join(ROOT, '..', 'saladbowl-web', 'public', 'img'), fuente: 'web' },
];
const EXTENSIONES = new Set(['.jpg', '.jpeg', '.png']);

function listarImagenes(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((nombre) => EXTENSIONES.has(extname(nombre).toLowerCase()))
    .map((nombre) => join(dir, nombre));
}

/** Mide ancho/alto leyendo los headers del archivo, sin dependencias. */
function medir(buffer) {
  // PNG: IHDR siempre arranca en el byte 16.
  if (
    buffer.length > 24 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { ancho: buffer.readUInt32BE(16), alto: buffer.readUInt32BE(20) };
  }

  // JPEG: recorrer los markers hasta un SOFn (0xC0-0xCF, salvo C4/C8/CC).
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buffer[offset + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }
      if (marker === 0xd9) break; // EOI
      const largo = buffer.readUInt16BE(offset + 2);
      const esSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (esSOF) {
        return {
          alto: buffer.readUInt16BE(offset + 5),
          ancho: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + largo;
    }
  }

  throw new Error('formato no reconocido (sólo JPEG/PNG)');
}

function cargarCatalogo() {
  if (!existsSync(CATALOGO)) return [];
  return JSON.parse(readFileSync(CATALOGO, 'utf8'));
}

function main() {
  mkdirSync(join(ROOT, 'fotos'), { recursive: true });
  const catalogo = cargarCatalogo();
  const porArchivo = new Map(catalogo.map((f) => [f.archivo, f]));

  let agregadas = 0;
  for (const { dir, fuente } of CARPETAS) {
    for (const ruta of listarImagenes(dir)) {
      const archivo = relative(ROOT, ruta).split('\\').join('/');
      if (porArchivo.has(archivo)) continue;

      const buffer = readFileSync(ruta);
      const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 12);
      const { ancho, alto } = medir(buffer);

      const entrada = {
        archivo,
        ancho,
        alto,
        hash,
        fuente,
        tipo: null,
        plato: null,
        local: null,
        encuadre: null,
        fondo: null,
        foco: null,
        calidad: null,
        usos: [],
        notas: '',
      };
      catalogo.push(entrada);
      porArchivo.set(archivo, entrada);
      agregadas++;
    }
  }

  catalogo.sort((a, b) => a.archivo.localeCompare(b.archivo));
  writeFileSync(CATALOGO, JSON.stringify(catalogo, null, 2) + '\n');

  console.log(`${agregadas} foto(s) nueva(s), ${catalogo.length} en total.\n`);
  for (const f of catalogo) {
    console.log(`${f.archivo}  ${f.ancho}×${f.alto}  ${f.hash}  (${f.fuente})`);
  }
}

main();
