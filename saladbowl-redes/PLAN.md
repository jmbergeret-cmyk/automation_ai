# Saladbowl · Redes — Plan de construcción (Nivel 1 → Nivel 2)

Agente de contenido para Instagram y Facebook de Saladbowl. Este documento es
la especificación completa: una sesión nueva (modelo económico) tiene que poder
construirlo de punta a punta leyendo solo esto y el repo.

Estado: **aprobado por Juan el 18/09/2026. Listo para construir.**

---

## 0. Principios (no negociables)

1. **Fotos siempre reales.** Nunca se genera comida con IA. Si falta una foto,
   se pide; no se inventa. La IA escribe, planifica y anima (movimiento sutil
   sobre fotos reales); no dibuja platos.
2. **Plantillas en código, no diseño por IA.** Cada pieza sale de una plantilla
   HTML/CSS fija que reproduce el sistema de diseño de la web
   (`saladbowl-web`). La IA solo elige foto y escribe texto. Así el diseño es
   idéntico las 100 veces y no depende del humor del modelo.
3. **La web es la fuente de la verdad.** Menú, novedades del mes, horarios,
   locales, tono y fotos se leen de `saladbowl-web/`. Nada se duplica a mano.
4. **Nada inventado.** Ni platos, ni ingredientes, ni precios, ni promos, ni
   claims ("sin ultraprocesados", "verdura del día", etc.). Si un texto necesita
   un dato que no está en el repo, se marca `TODO` y se le pregunta a Juan.
   Juan ya rechazó contenido inventado dos veces; es el error más caro.
5. **Juan aprueba todo** antes de que salga, en ≤ 1 hora cada 15 días.
6. **Mínimo lock-in.** Las piezas son archivos en el repo; el programador de
   publicación (Nivel 2) es un eslabón intercambiable.

## 1. Voz y tono (`TONO.md`, se escribe en la Fase 4)

Extraído de la web, que Juan aprobó texto por texto:

- Español rioplatense, **voseo** ("pedila", "unite", "comés").
- Frases cortas, directas. Sin clichés de marketing ("¡Descubrí!", "sabores
  únicos", "experiencia"). Sin signos de exclamación en cadena.
- Claim madre: **"Unite a la revolución saludable."** Sub-claims aprobados:
  "Alimentos reales, frescos y naturales." / "Comer bien es la base de una
  vida activa, sana y feliz." / "Creemos en la comida real." / "Fresco, calidad
  y real." / "Elaboramos todos los días." / "Utilizamos la mejor materia
  prima. Eso no se negocia." / "Ingredientes que podés nombrar."
- Emojis: máximo 1 por texto, y solo si suma. Hashtags: máximo 5, al final,
  siempre `#saladbowl` `#montevideo`.
- Llamado a la acción único: pedir en `saladbowl.pidedirecto.uy` (link en bio)
  o "delivery y takeaway en Pocitos y Ciudad Vieja".
- Prohibido: precios, promos no confirmadas, "sin ultraprocesados", "verdura
  del día", "hecho al momento", "barra a la vista", nombres de platos que no
  estén en `menu.js`.

## 2. Estructura de carpetas

```
saladbowl-redes/
├── PLAN.md                 ← este documento
├── AGENTE.md               ← runbook: cómo se arma una quincena (Fase 4)
├── TONO.md                 ← voz de marca (Fase 4)
├── package.json            ← type: module; deps: playwright (symlink al
│                              chromium del entorno), ffmpeg-static
├── fuentes.mjs             ← importa menu/novedades/locations/site desde
│                              ../saladbowl-web/src/data y expone tokens
├── fotos/                  ← biblioteca de fotos originales (Juan las sube acá)
├── fotos.json              ← catálogo: una entrada por foto (ver §3)
├── plantillas/             ← una carpeta por plantilla: index.html + estilos
│   ├── _base.css           ← tokens, @font-face (fuentes de la web), reset
│   ├── post-foto/
│   ├── post-placa/
│   ├── post-novedad/
│   ├── post-menu/
│   ├── post-local/
│   ├── story-foto/
│   ├── story-placa/
│   └── reel-cover/
├── scripts/
│   ├── catalogar.mjs       ← agrega fotos nuevas a fotos.json (medidas, hash)
│   ├── render.mjs          ← pieza JSON → JPG (Playwright)
│   ├── reel.mjs            ← 1-3 fotos → MP4 vertical 6-8 s (Ken Burns)
│   ├── hoja.mjs            ← hoja de contacto de todas las plantillas (QA)
│   ├── tablero.mjs         ← arma el HTML del tablero de aprobación
│   └── exportar.mjs        ← finales aprobados → salida/<quincena>/
├── quincenas/
│   └── 2026-10-a/
│       ├── plan.json       ← el plan (piezas, textos, fechas) — lo escribe el agente
│       ├── render/         ← JPG/MP4 generados
│       └── tablero.html    ← lo que se publica como Artifact
└── salida/
    └── 2026-10-a/          ← solo lo aprobado: 01-lun-post.jpg + 01-lun-post.txt …
```

## 3. Biblioteca de fotos (`fotos/`, `fotos.json`)

Juan sube fotos a `fotos/` (por GitHub web, de a lotes chicos: el límite que
lo trabó antes era el total del lote, no cada archivo; ≤ 40 MB por commit).
`scripts/catalogar.mjs` agrega las nuevas a `fotos.json` con campos vacíos que
el agente completa mirando la foto:

```json
{
  "archivo": "fotos/Caesar Salad.jpg",
  "ancho": 3000, "alto": 4000, "hash": "…",
  "tipo": "plato | local | equipo | detalle | proceso | otro",
  "plato": "caesar-salad",            // slug de menu.js o null
  "local": "pocitos | ciudad-vieja | null",
  "encuadre": "cenital | 45 | frontal | detalle",
  "fondo": "claro | oscuro | mesa | local",
  "foco": { "x": 0.5, "y": 0.45 },     // punto de interés, para los recortes
  "calidad": 1-5,
  "usos": ["2026-10-a/03"],            // para no repetir foto en quincenas seguidas
  "notas": ""
}
```

Las 13 fotos ya procesadas para la web (`saladbowl-web/public/img/`) también
entran al catálogo, con `fuente: "web"`.

Regla de rotación: una misma foto no se usa como post principal dos quincenas
seguidas.

## 4. Plantillas (Fase 2) — el corazón del proyecto

Todas comparten `_base.css`: tokens copiados de
`saladbowl-web/src/styles/global.css` (verde `#143316`, verde-2 `#1d4620`,
verde-3 `#2e6930`, crema `#faf9f6`, crema-2 `#f2f0e9`, rosado `#ffbcc8`, rojo
`#ef6048`), Lato 900/700/400 desde `../saladbowl-web/public/fonts/` (copiar los
woff2 a `plantillas/fuentes/`), títulos con `letter-spacing: -0.02em;
line-height: 1.02`, isotipo y wordmark desde `saladbowl-web/public/logo/`.

Reglas de diseño (las mismas de la web): **máximo 2 elementos compitiendo**,
mucho aire, la foto es protagonista, el texto corto y grande. Nunca más de
una tipografía. Nunca degradados de colores que no estén en la paleta.

| Plantilla | Formato | Qué muestra | Variables |
|---|---|---|---|
| `post-foto` | 1080×1350 | Foto a sangre, scrim suave abajo, nombre del plato en Lato 900 + wordmark chico | foto, foco, titulo, subtitulo (opcional) |
| `post-placa` | 1080×1350 | Fondo verde (o rosado, o crema), un claim grande, isotipo | fondo, claim, firma |
| `post-novedad` | 1080×1350 | La banda rosada de la web: "NOVEDADES DEL MES / Mes" + foto + nombre | mes, titulo, foto |
| `post-menu` | 1080×1350 | Grilla de 3 o 4 fotos con nombres, título "Lo que sale hoy" | items[] |
| `post-local` | 1080×1350 | Nombre del barrio + horarios (de `locations.js`) + foto del local | local |
| `story-foto` | 1080×1920 | Foto a sangre con zonas seguras (250 px arriba, 340 px abajo), texto corto | foto, foco, texto |
| `story-placa` | 1080×1920 | Placa de texto (claim, aviso, "abrimos en 30 min") | fondo, texto |
| `reel-cover` | 1080×1920 | Portada del reel: foto + título | foto, titulo |

Carrusel = N `post-*` con el mismo `carrusel_id`; el render numera las
slides.

`scripts/render.mjs`: recibe una pieza (`{plantilla, variables, salida}`),
arma el HTML inyectando variables (sin frameworks: string templates + escape),
lo abre con Playwright al tamaño exacto, `deviceScaleFactor: 1`, espera
`document.fonts.ready` + imágenes, y guarda JPG calidad 90. Chromium del
entorno: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` con
`args: ['--no-sandbox']`; el proxy necesita `bypass: 'localhost,127.0.0.1'`
(ver `saladbowl-web/scripts/` y el historial: ya está resuelto ahí).

`scripts/hoja.mjs`: renderiza cada plantilla con datos de ejemplo reales del
repo y arma una hoja de contacto PNG. **Es el criterio de aceptación de la
Fase 2: Juan mira la hoja y aprueba el diseño antes de seguir.**

## 5. Reels (Fase 3)

`scripts/reel.mjs`: 1 a 3 fotos → MP4 1080×1920, 6-8 s, H.264, 30 fps.
Técnica: página HTML con la foto y una animación CSS lenta (zoom 1.0→1.08 +
paneo hacia `foco`, 3 s por foto, fundido de 0.4 s entre fotos, wordmark fijo
abajo), grabada con Playwright `recordVideo` (sale WebM) y convertida con
`ffmpeg-static` (`npm i ffmpeg-static`; el ffmpeg de Playwright no sirve, no
tiene x264). Sin audio (Juan elige música en Instagram al subir; la API de
Meta no permite música con derechos).

Opción 2 (más adelante, cuando Juan tenga plan pago en Higgsfield o API de
Kling): movimiento generado (vapor, cámara) a partir de la misma foto. Misma
interfaz: `reel.mjs --motor=ia`. No construir ahora.

## 6. El agente: cómo arma una quincena (Fase 4, `AGENTE.md`)

El "agente" es una sesión de Claude Code que sigue `AGENTE.md`. Hoy la
dispara Juan ("armá la quincena de octubre-a"); en Nivel 2 la dispara una
Routine cada 15 días. Pasos:

1. **Leer fuentes**: `fuentes.mjs` (menú, novedades vigentes del mes,
   horarios, locales), `fotos.json`, `TONO.md`, y `quincenas/` anteriores
   (para no repetir fotos ni textos).
2. **Armar el mix** de la quincena (14 días):
   - 6 posts (3 por semana, mar/jue/sáb 12:00): 2 platos (`post-foto`),
     1 novedad del mes si hay (`post-novedad`, si no un `post-placa` de
     valor), 1 local/horarios (`post-local`), 1 marca (`post-placa` con
     claim), 1 carrusel menú (`post-menu` + 3 `post-foto`).
   - 6 stories (una por post, el mismo día, 19:00): reutilizan la foto del
     post en `story-foto` con texto de una línea, o `story-placa`.
   - 1-2 reels (viernes 18:00): 2-3 fotos de platos, `reel.mjs`.
   - Mix ajustable en `AGENTE.md`; los horarios son sugeridos hasta tener
     datos reales.
3. **Escribir `plan.json`**: una entrada por pieza con `id`, `fecha`, `hora`,
   `red` (`ig`, `fb`, `ambas`), `formato`, `plantilla`, `variables`, `texto`
   (caption), `hashtags`, `alt` (texto alternativo, siempre), `fotos_usadas`.
4. **Renderizar** todo (`render.mjs`, `reel.mjs`).
5. **Publicar el tablero** (§7) y avisarle a Juan con el link.
6. **Leer la devolución** del tablero, aplicar cambios, re-renderizar solo lo
   que cambió, republicar. Repetir hasta que todo esté aprobado o descartado.
7. **Exportar** (`exportar.mjs`) y commitear `salida/<quincena>/`.

Textos: los escribe el modelo de la sesión siguiendo `TONO.md`. Cada caption
≤ 300 caracteres salvo el de carrusel. Antes de dar por terminado el plan, el
agente pasa una **lista de control**: ¿hay algún plato, ingrediente, precio,
promo o claim que no esté en el repo? Si sí, se saca o se marca `TODO`.

## 7. Tablero de aprobación (Fase 5)

Un Artifact (`tablero.html`) publicado con la capability `db` (cargar la
skill `artifact-capabilities` antes de escribirlo; el CSP bloquea todo lo
externo, así que fuentes e imágenes van inline como data URI, igual que el
preview de la web: ver `inline.py` en el historial).

- Piezas agrupadas por día; cada una muestra la imagen o el video, la red, la
  hora, el caption completo y el alt.
- Tres botones por pieza: **Aprobar / Cambiar / Descartar**; "Cambiar" abre
  un campo de nota. Estado guardado en `db`: colección
  `quincenas/<id>/piezas`, doc `<pieza-id>` = `{estado, nota, actualizado}`.
- Arriba, un contador: "9 aprobadas · 2 con cambios · 1 pendiente".
- Los archivos finales se ven a tamaño real: en el celular, mantener
  apretado guarda la imagen (sirve para subir a mano en Nivel 1).
- El agente lee las decisiones con `read_db` (`query` sobre la colección).

Criterio de aceptación: Juan aprueba una quincena real de prueba en ≤ 40 min.

## 8. Exportación y publicación manual (Fase 6, cierra el Nivel 1)

`scripts/exportar.mjs`: por cada pieza aprobada copia el archivo final a
`salida/<quincena>/NN-<dia>-<formato>.jpg|mp4` y escribe al lado
`NN-<dia>-<formato>.txt` con caption + hashtags + alt + red + fecha/hora.
Más un `CALENDARIO.md` con la tabla de la quincena.

Juan sube en Meta Business Suite (programar posts, reels y stories es
gratis ahí) — ~10 min por semana.

## 9. Nivel 2 (después de una quincena real aprobada)

1. **Routine quincenal** (`create_trigger`, sesión nueva cada vez, prompt =
   "seguí `saladbowl-redes/AGENTE.md` para la quincena que empieza el
   próximo lunes") + aviso por Gmail con el link del tablero.
2. **Programación automática**: Buffer (plan gratis, 3 canales, API) o Postiz
   (open source, si Juan tiene un servidor). Requisito previo: Instagram
   profesional vinculado a la página de Facebook en Meta Business Suite.
   `scripts/programar.mjs` toma `salida/<quincena>/` y crea los posts
   programados. Stories: si el programador no las soporta, quedan manuales.
3. **Sincronía con la web**: cuando Juan carga una novedad en
   `saladbowl-web/src/data/novedades.js`, la quincena siguiente la toma sola.
4. Nivel 3 (API de Meta directa, app review 2-4 semanas) solo si el
   programador se queda corto.

## 10. Fases, orden y criterio de aceptación

| Fase | Entregable | Aceptación |
|---|---|---|
| F1 | Estructura, `package.json`, `fuentes.mjs`, `catalogar.mjs`, `fotos.json` con las fotos que ya hay | `node scripts/catalogar.mjs` corre y lista las fotos con medidas |
| F2 | `_base.css` + las 8 plantillas + `render.mjs` + `hoja.mjs` | Hoja de contacto publicada como Artifact; **Juan aprueba el diseño** |
| F3 | `reel.mjs` | Un reel de 6-8 s con 3 fotos, MP4 H.264 1080×1920, se ve en el celu |
| F4 | `TONO.md`, `AGENTE.md`, primera `quincenas/<id>/plan.json` renderizada | Lista de control sin datos inventados; 12-14 piezas |
| F5 | Tablero con `db` | Juan aprueba/cambia/descarta desde el celu y el agente lo lee |
| F6 | `exportar.mjs` + `salida/` | Carpeta lista para subir a Meta Business Suite |

Después de cada fase: `git commit` + `git push` a la rama de trabajo y un
mensaje corto a Juan con qué mirar. Las fases F2 y F5 esperan su OK.

## 11. Entorno (para no volver a tropezar)

- Chromium: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`; Playwright
  instalado en el scratchpad de la sesión de la web y enlazado en
  `saladbowl-web/node_modules` — reutilizar el mismo truco o `npm i
  playwright` (sin `playwright install`).
- Proxy saliente: `HTTPS_PROXY` con `bypass: 'localhost,127.0.0.1'` en
  Playwright. `npm` funciona; `drive.google.com` y el CDN de Higgsfield no.
- Fuentes: no hay acceso a Google Fonts desde el navegador; usar los woff2
  del repo.
- Artifacts: sin recursos externos; todo inline (`<meta charset="utf-8">`
  primero, o aparece mojibake).
- Procesos en segundo plano mueren al cerrar el comando: `setsid nohup …
  & disown`.
- Sin `gh`; GitHub vía MCP. Sin `sudo`.
- Commits: rama de trabajo propia (`claude/saladbowl-redes-…`), merge a
  `main` solo con OK de Juan. Nunca subir secretos (tokens de Buffer/Meta
  van en variables de entorno de la sesión, no en el repo).

## 12. Lo que Juan aporta

- Fotos: lotes a `saladbowl-redes/fotos/` (ya hay 10 en
  `saladbowl-web/material/fotos/`; el resto cuando el flujo esté listo).
- Usuarios reales de Instagram y Facebook.
- Qué querés que las redes digan que la web no dice (equipo, detrás de
  escena, promos reales): se agrega como pilar en `AGENTE.md`.
- La novedad de cada mes en `saladbowl-web/src/data/novedades.js` (o me la
  dictás y la cargo).
