#!/usr/bin/env bash
# Composite 4 mobile screenshots into a row-style newsletter hero.
# Outputs a 1600x800 PNG with subtle alternating tilts and shadows
# on a dark gradient background.
#
# Usage:
#   ./compose-phone-row.sh <p1.png> <p2.png> <p3.png> <p4.png> <out.png>

set -euo pipefail

if [ "$#" -ne 5 ]; then
  echo "Usage: $0 <p1.png> <p2.png> <p3.png> <p4.png> <out.png>" >&2
  exit 1
fi

P1="$1"; P2="$2"; P3="$3"; P4="$4"; OUT="$5"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

CANVAS_W=1600
CANVAS_H=800
PHONE_W=360

round_corners() {
  local in="$1" out="$2" radius="$3"
  local w h
  w=$(magick identify -format "%w" "$in")
  h=$(magick identify -format "%h" "$in")
  magick -size "${w}x${h}" xc:none \
    -draw "roundrectangle 0,0 $((w-1)),$((h-1)) ${radius},${radius}" \
    "$WORK/_mask.png"
  magick "$in" "$WORK/_mask.png" \
    -alpha set -compose DstIn -composite "$out"
}

add_shadow() {
  local in="$1" out="$2"
  magick "$in" \( +clone -background '#000000' -shadow 70x18+0+14 \) \
    +swap -background none -layers merge +repage "$out"
}

phone() {
  local in="$1" out="$2" rot="$3"
  magick "$in" -resize "${PHONE_W}x" "$WORK/_p-resized.png"
  round_corners "$WORK/_p-resized.png" "$WORK/_p-round.png" 38
  magick "$WORK/_p-round.png" -background none -rotate "$rot" "$WORK/_p-rot.png"
  add_shadow "$WORK/_p-rot.png" "$out"
}

magick -size "${CANVAS_W}x${CANVAS_H}" \
  gradient:'#0a0c10-#1c1c1c' "$WORK/bg.png"

phone "$P1" "$WORK/p1.png" 0
phone "$P2" "$WORK/p2.png" 0
phone "$P3" "$WORK/p3.png" 0
phone "$P4" "$WORK/p4.png" 0

# Flat row, evenly spaced, vertically centered.
PHONE_H=$(magick identify -format "%h" "$WORK/p1.png")
ROW_Y=$(( (CANVAS_H - PHONE_H) / 2 ))
P1_X=32;   P1_Y=$ROW_Y
P2_X=424;  P2_Y=$ROW_Y
P3_X=816;  P3_Y=$ROW_Y
P4_X=1208; P4_Y=$ROW_Y

magick "$WORK/bg.png" \
  "$WORK/p1.png" -geometry "+${P1_X}+${P1_Y}" -composite \
  "$WORK/p2.png" -geometry "+${P2_X}+${P2_Y}" -composite \
  "$WORK/p3.png" -geometry "+${P3_X}+${P3_Y}" -composite \
  "$WORK/p4.png" -geometry "+${P4_X}+${P4_Y}" -composite \
  "$OUT"

echo "Wrote $OUT"
