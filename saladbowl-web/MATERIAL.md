# Dónde dejar el material

Todo va en `saladbowl-web/material/`. Dejalo con el nombre que quieras y en la
mejor calidad que tengas: yo lo recorto, lo comprimo, lo renombro y lo conecto
al sitio. **No hace falta que prepares nada.**

```
saladbowl-web/material/
├── logo/     el logo en todas las versiones que tengas
├── fotos/    fotos de producto, locales y equipo
├── video/    material para el hero
└── marca/    manual de marca, paleta, tipografías, lo que haya
```

## Cómo subirlo (desde el navegador, sin instalar nada)

1. Entrá a la rama de trabajo:
   https://github.com/jmbergeret-cmyk/automation_ai/tree/claude/saladbowl-website-onbo75/saladbowl-web/material
2. Entrá a la subcarpeta que corresponda → botón **Add file** → **Upload files**.
3. Arrastrá los archivos y dale **Commit changes** (dejá seleccionada la opción
   de commitear directo a `claude/saladbowl-website-onbo75`).
4. Avisame acá y lo integro.

Límite de GitHub por la web: 25 MB por archivo, 100 archivos por vez. Si algún
video pesa más, mandá un export más liviano: igual lo comprimo abajo de 3 MB.

## Qué me sirve de cada cosa

### Logo
Lo mejor es el **SVG**. Si no hay, PNG con fondo transparente de 1000 px para
arriba. Si existen varias versiones, mandalas todas y yo elijo:

- versión para fondo oscuro (es la que va en el nav, sobre verde)
- versión para fondo claro
- isotipo solo, sin texto (para el favicon y el ícono de la app)

### Fotos
Cuanto más grandes, mejor: yo genero los recortes. Estas son las proporciones
que usa el sitio hoy, por si querés elegir tomas pensando en cada lugar:

| Dónde | Proporción | Cuántas |
| --- | --- | --- |
| Hero (si no hay video) | 4:5 vertical | 1 |
| Platos del menú | 1:1 cuadrada | 16, una por plato |
| Sección de marca | 4:3 | 1 |
| Locales | 3:2 apaisada | 3, una por local |

JPG o WEBP, 2000 px el lado largo alcanza. Si mandás las originales sin
recortar, mejor todavía.

### Video del hero
Loop de 8 a 12 segundos, sin audio: el armado de un bowl. Como el hero va a
sangre con el claim encima, conviene **apaisado 16:9, con aire a la izquierda**
(ahí cae el texto) y la acción hacia el centro-derecha. Mandalo como salga del
teléfono o de la cámara; yo hago el mp4 + webm comprimidos.

### Marca
Si hay manual de marca, PDF y listo. Si no, alcanza con los hex de la paleta y
el nombre de las tipografías. Hoy el sitio usa lo que estaba en el brief:

| Token | Hex |
| --- | --- |
| verde de fondo | `#1E3D2F` |
| verde profundo | `#16301F` |
| crema | `#FAF9F6` |
| verde vivo (solo CTAs) | `#4CAF6D` |
| citrus (acentos) | `#F5C542` |

Tipografías: Archivo para títulos, Inter para cuerpo. Si el manual dice otras y
están en Google Fonts, las cambio en un rato; si son de pago, necesito los
archivos web (woff2) con su licencia.

## Datos que también me faltan

No son archivos, me los podés escribir por chat:

- link real del ecommerce (hoy es un placeholder)
- direcciones y horarios reales de los tres locales
- precios reales del menú
- usuarios reales de Instagram, TikTok y el WhatsApp de contacto
- mail de contacto

## Otras vías, si en algún momento las querés habilitar

- **Google Drive**: hoy el entorno tiene bloqueado `drive.google.com` y el
  conector se desconectó. Se destraba reconectando el conector en claude.ai
  (Settings → Connectors) o agregando `drive.google.com` y
  `*.googleusercontent.com` a los hosts permitidos del environment.
- **Adjuntar en el chat**: sirve para que yo *vea* una imagen y opine, pero no
  me llega el archivo original, así que no se puede usar en el build.
