/**
 * 1 a 3 fotos → reel vertical (1080×1920, H.264, 30 fps, sin audio).
 *
 * Técnica (PLAN.md §5): una página HTML con las fotos superpuestas, cada
 * una con zoom lento (1.0 → 1.08) y paneo hacia su `foco`, 3 s de pantalla
 * por foto con 0.4 s de fundido cruzado entre fotos consecutivas. Se graba
 * con Playwright (recordVideo, sale WebM) y se convierte a MP4 con
 * ffmpeg-static — el ffmpeg que trae Playwright no tiene libx264.
 *
 *   node scripts/reel.mjs reel.json
 *
 * reel.json: { fotos: [{ foto, foco: {x,y} }, ...], salida }
 * `foto` es la misma ruta que usan menu.js/locations.js ('/img/...') o una
 * ruta relativa a saladbowl-redes (p.ej. 'fotos/Caesar Salad.jpg').
 */
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ffmpegPath from 'ffmpeg-static';
import { ROOT, WORDMARK_URL, rutaWeb, rutaRedes } from './render.mjs';
import { wordmarkHTML } from '../plantillas/ayudantes.mjs';

const ANCHO = 1080;
const ALTO = 1920;
const FPS = 30;
const SEGUNDOS_POR_FOTO = 3;
const FUNDIDO = 0.4; // segundos de cruce entre fotos consecutivas
const CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/** `foto` puede venir como ruta de saladbowl-web ('/img/...') o del repo propio. */
function resolverFoto(foto) {
  return foto.startsWith('/') ? rutaWeb(foto) : rutaRedes(foto);
}

/** Capas superpuestas con crossfade: cada foto ocupa `SEGUNDOS_POR_FOTO`, solapando `FUNDIDO` con la siguiente. */
function armarCapas(fotos) {
  const n = fotos.length;
  const paso = SEGUNDOS_POR_FOTO - FUNDIDO;
  const total = SEGUNDOS_POR_FOTO + (n - 1) * paso;

  const capas = fotos.map((f, i) => {
    const inicioFade = i === 0 ? 0 : i * paso;
    const fin = i === n - 1 ? total : inicioFade + SEGUNDOS_POR_FOTO;
    const pct = (t) => ((t / total) * 100).toFixed(3);

    // Opacidad: 0 → 1 en los primeros FUNDIDO s (salvo la primera, que ya arranca visible),
    // 1 → 0 en los últimos FUNDIDO s (salvo la última, que se queda).
    const puntos = [];
    puntos.push([pct(inicioFade), i === 0 ? 1 : 0]);
    if (i > 0) puntos.push([pct(inicioFade + FUNDIDO), 1]);
    if (i < n - 1) puntos.push([pct(fin - FUNDIDO), 1]);
    puntos.push([pct(fin), i === n - 1 ? 1 : 0]);

    const keyframesOpacidad = puntos.map(([p, o]) => `${p}% { opacity: ${o}; }`).join('\n        ');

    // Ken Burns: de centrado (scale 1.0) a empujado hacia el foco (scale 1.08).
    const focoX = f.foco?.x ?? 0.5;
    const focoY = f.foco?.y ?? 0.5;
    const corrimientoX = Math.round((0.5 - focoX) * 2 * ANCHO * 0.035);
    const corrimientoY = Math.round((0.5 - focoY) * 2 * ALTO * 0.035);

    return {
      src: resolverFoto(f.foto),
      objectPosition: `${(focoX * 100).toFixed(1)}% ${(focoY * 100).toFixed(1)}%`,
      keyframesOpacidad,
      keyframesZoom: `
        0% { transform: scale(1) translate(0, 0); }
        100% { transform: scale(1.08) translate(${corrimientoX}px, ${corrimientoY}px); }
      `,
      duracionVisible: fin - inicioFade,
    };
  });

  return { capas, total };
}

function armarHTML(fotos) {
  const { capas, total } = armarCapas(fotos);

  const estilosCapas = capas
    .map(
      (c, i) => `
      @keyframes opacidad-${i} { ${c.keyframesOpacidad} }
      @keyframes zoom-${i} { ${c.keyframesZoom} }
      .capa-${i} {
        animation: opacidad-${i} ${total}s linear forwards, zoom-${i} ${c.duracionVisible}s ease-out forwards;
      }
      .capa-${i} img { object-position: ${c.objectPosition}; }
    `,
    )
    .join('\n');

  const capasHTML = capas
    .map((c, i) => `<div class="capa capa-${i}"><img src="${c.src}" alt=""></div>`)
    .join('\n  ');

  return {
    total,
    html: `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${ANCHO}px; height: ${ALTO}px; overflow: hidden; background: #000; }
  .capa { position: absolute; inset: 0; opacity: 0; }
  .capa img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .scrim {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(20,51,22,0.75) 0%, transparent 22%);
    z-index: 10;
  }
  .wordmark-pie { position: absolute; left: 64px; bottom: 70px; z-index: 11; }
  .logo-mask {
    -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
    -webkit-mask-size: contain; mask-size: contain;
    -webkit-mask-position: center; mask-position: center;
  }
  ${estilosCapas}
</style>
</head>
<body>
  ${capasHTML}
  <div class="scrim"></div>
  <div class="wordmark-pie">${wordmarkHTML(WORDMARK_URL, { color: 'var(--crema, #faf9f6)', ancho: 190 }).valor}</div>
</body>
</html>`,
  };
}

function convertirAMp4(webmPath, mp4Path) {
  mkdirSync(dirname(mp4Path), { recursive: true });
  const resultado = spawnSync(
    ffmpegPath,
    [
      '-y',
      '-i', webmPath,
      '-an',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-r', String(FPS),
      '-vf', `scale=${ANCHO}:${ALTO}`,
      '-movflags', '+faststart',
      mp4Path,
    ],
    { encoding: 'utf8' },
  );
  if (resultado.status !== 0) {
    throw new Error(`ffmpeg falló (código ${resultado.status}):\n${resultado.stderr}`);
  }
}

export async function armarReel({ fotos, salida }) {
  if (!fotos?.length || fotos.length > 3) throw new Error('un reel lleva entre 1 y 3 fotos');

  const { html, total } = armarHTML(fotos);
  const dirVideo = join(ROOT, '.tmp-reel');
  mkdirSync(dirVideo, { recursive: true });

  const browser = await chromium.launch({ executablePath: CHROMIUM, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: ANCHO, height: ALTO },
    deviceScaleFactor: 1,
    recordVideo: { dir: dirVideo, size: { width: ANCHO, height: ALTO } },
  });
  const page = await context.newPage();

  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0));
  await page.waitForTimeout(Math.round(total * 1000) + 150);

  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  const webmPath = await video.path();
  convertirAMp4(webmPath, salida);
  rmSync(dirVideo, { recursive: true, force: true });

  return { salida, duracion: total };
}

async function cli(argv) {
  if (argv.length === 0) {
    console.error('uso: node scripts/reel.mjs <reel.json>');
    process.exit(1);
  }
  for (const archivo of argv) {
    const config = JSON.parse(readFileSync(archivo, 'utf8'));
    const { salida, duracion } = await armarReel(config);
    console.log(`${salida}  (${duracion.toFixed(1)} s, ${config.fotos.length} foto${config.fotos.length > 1 ? 's' : ''})`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await cli(process.argv.slice(2));
}
