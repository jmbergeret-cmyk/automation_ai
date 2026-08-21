# Saladbowl — sitio web

Sitio de Saladbowl (fast-casual saludable, Montevideo). Astro + Tailwind + GSAP
ScrollTrigger + Lenis.

## Correr el proyecto

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # sale a dist/
npm run preview
```

## Estado

- **Home**: completa, con todo el sistema de movimiento.
- `/menu`, `/locales`, `/nosotros`: todavía no existen (los links del nav y de las
  secciones ya apuntan ahí).

## Estructura

```
src/
  components/         Nav y Footer
  components/home/    Hero, ValueStrip, MenuPreview, Brand, Locations
  data/               site.js, menu.js, locations.js  ← el contenido editable
  layouts/            BaseLayout.astro
  pages/              index.astro
  scripts/motion.js   GSAP + Lenis: todo el movimiento vive acá
  styles/             global.css (tokens + base), fonts.css (@font-face)
public/img/           placeholders de fotos
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
- Direcciones, horarios, precios y redes: hoy son datos de ejemplo.
- Páginas `/menu`, `/locales`, `/nosotros`.
