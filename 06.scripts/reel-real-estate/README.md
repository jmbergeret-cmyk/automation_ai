# Reel de Instagram — Real Estate

Pipeline reproducible para armar un Reel vertical (1080×1920, ~25 s) a partir de clips
verticales de celular de una propiedad, con placas de texto editables y locución generada
en Higgsfield.

## Qué produce

| Archivo | Qué es |
|---|---|
| `out/reel_instagram_9x16.mp4` | Reel listo para publicar — 1080×1920, 30 fps, H.264, pista de audio silenciosa |
| `out/portada.jpg` | Frame de portada para el grid |

## Estructura del video

| # | Plano | Duración | Placa |
|---|---|---|---|
| 1 | Vista a la rambla (hook) | 5,3 s | `MONTEVIDEO · FRENTE A LA RAMBLA` / "Piso alto, con vista al mar" |
| 2 | Living + ventanal | 5,9 s | `LIVING` / "Parquet espigado y ventanal al mar" |
| 3 | Cocina | 5,1 s | `COCINA` / "Integrada, con luz todo el día" |
| 4 | Baño | 6,0 s | `BAÑO` / "Ducha vidriada e iluminación cálida" |
| 5 | Cierre | 4,2 s | "¿Lo querés ver por dentro?" / "Escribinos por DM · @tucuenta" |

Disolvencias de 0,3 s entre planos, fade de entrada y salida.

## Cómo correrlo

```bash
export CLIPS_DIR=/ruta/a/los/clips     # carpeta con los .mov / .mp4 verticales
./build_reel.sh
```

Requiere `ffmpeg` compilado con `libass`, `libx264` y `geq`. Si el build de ffmpeg no trae
el filtro `drawtext` no importa: todo el texto se dibuja con `libass` desde `reel.ass`.

Si las tipografías no están en la ruta por defecto:

```bash
export FONTS_DIR=/ruta/a/las/fuentes   # necesita Outfit-Regular.ttf y Outfit-Bold.ttf
```

## Cómo editar los textos

Todos los textos, posiciones y tiempos viven en **`reel.ass`** (formato ASS de subtítulos).
Editás el archivo, volvés a correr `./build_reel.sh` y listo. Lo que se toca más seguido:

- `@tucuenta` en la última placa → el handle real de la cuenta.
- `MONTEVIDEO · FRENTE A LA RAMBLA` → barrio / ubicación real.
- Los `\pos(x,y)` mueven cada placa. La zona segura de Reels es **y entre 300 y 1450**:
  arriba de 300 tapa el header de Instagram, abajo de 1450 lo tapan el caption y los botones.
- `\fs72` fuerza un tamaño distinto al del estilo para una línea puntual (útil cuando un
  texto largo se pasa de ancho). A 78 px entran ~22 caracteres por línea.

Los planos, sus duraciones y los puntos de corte se cambian en `build_reel.sh`
(las llamadas a `shot` y los `offset` de los `xfade`). **Ojo:** si cambiás duraciones hay
que reajustar los tiempos en `reel.ass`, que son absolutos sobre la línea de tiempo final.

## Locución

La voz en off se genera con Higgsfield (`generate_audio`, modelo `seed_audio`, voz *Livia*).
El guion usado, alineado a los planos:

> Piso alto, sobre la rambla. Esta es la vista... todos los días.
> Living con parquet espigado y ventanal de piso a techo.
> Cocina integrada, con luz natural de mañana a tarde.
> Y un baño con ducha vidriada y luz cálida.
> Si ya te lo estás imaginando adentro... mandanos un mensaje.

Dura 21,5 s y entra dentro de los 25,2 s del reel. El MP4 se entrega **sin locución
pegada**, con una pista de audio silenciosa: eso deja elegir en Instagram entre audio
trending (mejor alcance) o la locución. Para pegarla:

```bash
ffmpeg -i out/reel_instagram_9x16.mp4 -i vo.wav \
  -filter_complex "[1:a]adelay=600|600,apad[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest \
  out/reel_con_locucion.mp4
```
