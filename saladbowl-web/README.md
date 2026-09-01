# Saladbowl — sitio web

Sitio de Saladbowl (fast-casual saludable, Montevideo). Astro + Tailwind + GSAP
ScrollTrigger + Lenis.

> **¿Tenés material para pasarme?** Está todo explicado en
> [MATERIAL.md](./MATERIAL.md): va en `material/`, con el nombre que sea.

## Correr el proyecto

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # sale a dist/
npm run preview
```

## Estado

- **Home**: completa, con todo el sistema de movimiento, video en el hero y marquee.
- **/menu**: carta completa con filtros por categoría (FLIP) y barra sticky.
- **/locales**: cards con estado "abierto ahora" en vivo.
- **/nosotros**: sólo estructura, falta el texto largo y las fotos.

```bash
npm test   # tests de la lógica de horarios (bordes de apertura y cierre)
```

## Estructura

```
src/
  components/         Nav y Footer
  components/home/    Hero, ValueStrip, MenuPreview, Brand, Locations
  data/               site.js, menu.js, locations.js  ← el contenido editable
  layouts/            BaseLayout.astro
  pages/              index.astro
  lib/hours.js        estado de los locales (puro, testeado en test/)
  scripts/motion.js   GSAP + Lenis: todo el movimiento vive acá
  scripts/status.js   pinta el estado "abierto ahora"
  scripts/menu-filters.js  filtros de /menu con FLIP
  styles/             global.css (tokens + base), fonts.css (@font-face)
public/img/           placeholders de fotos
public/video/         loop del hero (placeholder)
public/fonts/         Archivo + Inter (subsets latin y latin-ext)
```

## Sistema visual

| Token             | Valor     | Uso                              |
| ----------------- | --------- | -------------------------------- |
| `cream`           | `#FAF9F6` | fondo                            |
| `cream-deep`      | `#F2F0E9` | franjas y marcos de foto         |
| `forest`          | `#1E3D2F` | textos, nav, secciones oscuras   |
| `forest-soft`     | `#3D5C4D` | texto secundario                 |
| `leaf`            | `#4CAF6D` | sólo CTAs                        |
| `citrus`          | `#F5C542` | acento, con cuentagotas          |

Tipografía: **Archivo** para títulos (600–700, tracking `-0.035em`), **Inter**
para cuerpo. Están servidas desde `/public/fonts` para no depender del CDN; en
`src/styles/fonts.css` está el comentario con el `<link>` de Google Fonts por si
se prefiere volver a esa vía.

## Sistema de movimiento

Todo se maneja con atributos en el HTML, sin escribir JS por sección:

| Atributo              | Qué hace                                                        |
| --------------------- | --------------------------------------------------------------- |
| `data-reveal`         | fade + 34px hacia arriba, 0.7s, `power2.out`                    |
| `data-stagger`        | en un contenedor: sus `data-reveal` entran con 0.1s de diferencia |
| `data-delay="0.2"`    | retraso extra para un `data-reveal` suelto                       |
| `data-media`          | en el marco de una foto: la imagen entra de `scale(1.05)` a `1`  |
| `data-parallax`       | capa que se mueve al 85% de la velocidad del scroll              |
| `data-hero` / `data-hero-item` / `data-hero-media` | intro del hero al cargar     |
| `data-nav`            | el header que se compacta al scrollear                          |

Con `prefers-reduced-motion: reduce` no se inicializa Lenis ni ninguna animación:
todo queda en su estado final. Sin JS también se ve el sitio completo (los
estados iniciales cuelgan de `.js`).

## Video del hero

`src/data/site.js` → `hero.video`. Mientras haya un video, se muestra el video;
si se pone `video: null`, se muestra la foto (`hero.poster`) y no cambia nada más.

El `src` no está en el HTML: lo engancha `motion.js` sólo si la conexión da y no
hay `prefers-reduced-motion`. En cualquier otro caso queda el poster. Para el
video final: mp4 (H.264) **y** webm (VP9), sin audio, 8–12 s, menos de 3 MB.
El que está ahora es un placeholder generado con la foto placeholder.

El hero va a sangre con el claim encima, así que el video se recorta según la
pantalla: conviene filmar **apaisado (16:9)** dejando aire a la izquierda —ahí
va el texto— y con la acción hacia el centro-derecha. Si más adelante quieren
un plano vertical para mobile, `initHeroVideo()` en `motion.js` es el lugar
donde elegir la fuente según el viewport.

## Horarios y estado de los locales

Se editan en un solo lugar: `src/data/locations.js`, por día de la semana
(0 = domingo). De ahí salen tanto el texto ("Lun a Vie 11:30–22:00") como el
estado en vivo. Un rango que cierra antes de abrir se entiende como cruce de
medianoche (20:00–01:00). El aviso de "cierra pronto" son los últimos 45
minutos: se cambia en `CLOSING_SOON_MINUTES` (`src/lib/hours.js`).

## Fotos

Los archivos de `public/img` son placeholders SVG con las proporciones finales:

| Archivo             | Proporción | Dónde                        |
| ------------------- | ---------- | ---------------------------- |
| `hero.svg`          | 4:5        | hero                         |
| `bowl-*.svg`        | 1:1        | grilla del menú              |
| `marca.svg`         | 4:3        | sección de marca             |
| `local-*.svg`       | 3:2        | cards de locales             |

Para reemplazarlos: pisá el archivo con la foto real (mismo nombre y proporción,
o actualizá la ruta en `src/data/*.js`). `npm run placeholders` los vuelve a
generar.

## Pendientes

- Link real del ecommerce en `src/data/site.js` (`orderUrl`).
- Logo y fotos reales; video final del hero.
- Direcciones, horarios, precios y redes: hoy son datos de ejemplo.
- Texto y fotos de `/nosotros`.
