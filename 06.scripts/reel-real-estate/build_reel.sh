#!/usr/bin/env bash
# Reel de Instagram — real estate · 1080x1920 · ~25s
# Los textos viven en reel.ass (editalo y volvé a correr este script).
set -euo pipefail

SP="$(cd "$(dirname "$0")" && pwd)"
U="${CLIPS_DIR:?exportá CLIPS_DIR con la carpeta de los .mov}"
B="$SP/build"; OUT="$SP/out"
FONTS="${FONTS_DIR:-/mnt/skills/examples/canvas-design/canvas-fonts}"
mkdir -p "$B" "$OUT"

GRADE="eq=contrast=1.07:saturation=1.12:brightness=0.012,unsharp=5:5:0.35:5:5:0.0"

# ── scrim: degradé negro de abajo hacia arriba, para que el texto se lea siempre
if [ ! -f "$B/scrim.png" ]; then
  ffmpeg -hide_banner -loglevel error -f lavfi \
    -i "color=c=black:s=1080x1920,format=rgba,geq=r=0:g=0:b=0:a='if(lt(Y,760),0,255*0.72*pow((Y-760)/1160,0.85))'" \
    -frames:v 1 "$B/scrim.png" -y
fi

# ── 1. recorte + corrección de color de cada plano (silencioso)
shot () { # $1=src $2=ss $3=dur $4=out
  ffmpeg -hide_banner -loglevel error -ss "$2" -t "$3" -i "$1" \
    -vf "${GRADE},format=yuv420p" -r 30 -an \
    -c:v libx264 -crf 17 -preset medium "$4" -y
}
shot "$U/312b1615-IMG_3662.mov" 0.30 5.30 "$B/v1.mp4"   # vista / rambla  (hook)
shot "$U/719cca1c-IMG_3658.mov" 0.20 5.90 "$B/v2.mp4"   # living + ventanal
shot "$U/103ea9e6-IMG_3648.mov" 0.10 5.05 "$B/v3.mp4"   # cocina
shot "$U/097f4cfc-IMG_3656.mov" 0.20 5.95 "$B/v4.mp4"   # baño
shot "$U/312b1615-IMG_3662.mov" 5.60 4.20 "$B/v5.mp4"   # cierre / CTA

# ── 2. ensamble con disolvencias + scrim + textos ASS + fades de entrada/salida
ffmpeg -hide_banner -loglevel error \
  -i "$B/v1.mp4" -i "$B/v2.mp4" -i "$B/v3.mp4" -i "$B/v4.mp4" -i "$B/v5.mp4" \
  -i "$B/scrim.png" \
  -filter_complex "\
[0][1]xfade=transition=fade:duration=0.30:offset=5.00[a];\
[a][2]xfade=transition=fade:duration=0.30:offset=10.60[b];\
[b][3]xfade=transition=fade:duration=0.30:offset=15.35[c];\
[c][4]xfade=transition=fade:duration=0.30:offset=21.00[d];\
[5]format=rgba[scr];\
[d][scr]overlay=0:0:format=auto[e];\
[e]drawbox=x=0:y=0:w=1080:h=1920:color=black@0.22:t=fill:enable='gte(t,21.3)'[f];\
[f]subtitles='${SP}/reel.ass':fontsdir='${FONTS}'[g];\
[g]fade=t=in:st=0:d=0.5,fade=t=out:st=24.5:d=0.7,format=yuv420p[vo]" \
  -f lavfi -t 25.2 -i anullsrc=channel_layout=stereo:sample_rate=48000 \
  -map "[vo]" -map 6:a -c:a aac -b:a 128k -shortest -r 30 -c:v libx264 -crf 19 -preset slow -profile:v high -level 4.1 \
  -movflags +faststart "$OUT/reel_instagram_9x16.mp4" -y

ffmpeg -hide_banner -loglevel error -ss 1.2 -i "$OUT/reel_instagram_9x16.mp4" -frames:v 1 -q:v 2 "$OUT/portada.jpg" -y
echo "OK -> $OUT/reel_instagram_9x16.mp4"
