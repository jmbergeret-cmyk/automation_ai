/**
 * Helpers para armar variables de plantillas (grillas, bloques opcionales,
 * logo recoloreado). Nada de esto reemplaza render.mjs: son atajos para
 * construir los `variables` que le llegan a `armarHTML`.
 */
import { cruda, esc } from '../scripts/render.mjs';

const WORDMARK_RATIO = 898 / 177;
const ISOTIPO_RATIO = 692 / 672;

function logoMask(url, ratio, { color, ancho, clase = '' }) {
  const alto = Math.round(ancho / ratio);
  return `<div class="logo-mask ${clase}" style="width:${ancho}px;height:${alto}px;background-color:${color};-webkit-mask-image:url('${url}');mask-image:url('${url}')"></div>`;
}

/** Wordmark recoloreado a `color` (un token de la paleta), ancho en px. */
export const wordmarkHTML = (url, opts) => cruda(logoMask(url, WORDMARK_RATIO, opts));

/** Isotipo recoloreado a `color` (un token de la paleta), ancho en px. */
export const isotipoHTML = (url, opts) => cruda(logoMask(url, ISOTIPO_RATIO, opts));

/** Bloque opcional: si `valor` es falsy, no imprime nada. */
export const opcional = (valor, armar) => cruda(valor ? armar(valor) : '');

/** Arma un bloque de HTML uniendo `celda(item)` para cada item. */
export const gridHTML = (items, celda) => cruda(items.map(celda).join(''));

/** <p> con el texto escapado, o nada si está vacío. */
export const parrafo = (texto, clase) => opcional(texto, (t) => `<p class="${clase}">${esc(t)}</p>`);

/**
 * post-placa / story-placa: `fondo` es 'verde' | 'rosado' | 'crema'.
 * Devuelve el color de fondo y el de texto/isotipo con contraste correcto,
 * los tres tomados de la paleta (nunca un color inventado).
 */
export function fondoPlaca(fondo) {
  const mapa = {
    verde: { fondo: 'var(--verde)', texto: 'var(--crema)' },
    rosado: { fondo: 'var(--rosado)', texto: 'var(--verde)' },
    crema: { fondo: 'var(--crema)', texto: 'var(--verde)' },
  };
  if (!mapa[fondo]) throw new Error(`fondo desconocido para post-placa: ${fondo}`);
  return mapa[fondo];
}

/** Celda de la grilla de post-menu. `foto` ya es un file:// URL, no se escapa. */
export const celdaMenu = ({ foto, nombre, foco_x = 50, foco_y = 50 }) => `
  <div class="celda">
    <div class="foto-wrap"><img src="${foto}" alt="" style="object-position:${foco_x}% ${foco_y}%"></div>
    <p class="nombre">${esc(nombre)}</p>
  </div>`;

/** Numerador de slide para un carrusel ("2/4"), post-foto. */
export const carruselBadge = (indice, total) =>
  cruda(`<span class="carrusel-badge">${esc(indice)}/${esc(total)}</span>`);

/**
 * Botón CTA de dos líneas (acción + dominio), para post-placa/story-placa.
 * El texto sale siempre de las reglas de PLAN.md §1 (pedir en
 * saladbowl.pidedirecto.uy o "delivery y takeaway en Pocitos y Ciudad
 * Vieja"): esto sólo arma el HTML, no inventa un texto de CTA nuevo.
 */
export const ctaHTML = (texto, sub, { fondo, color }) =>
  cruda(`
    <div class="cta" style="background:${fondo};color:${color}">
      <p class="cta-texto">${esc(texto)}</p>
      ${sub ? `<p class="cta-sub">${esc(sub)}</p>` : ''}
    </div>`);

/** Fila de pills cortas (máx. unas pocas palabras cada una), mismo `fondo`/`color` que un CTA. */
export const pillsHTML = (tags, { fondo, color }) =>
  cruda(`
    <div class="pills">
      ${tags.map((t) => `<span class="pill-tag" style="background:${fondo};color:${color}">${esc(t)}</span>`).join('\n      ')}
    </div>`);
