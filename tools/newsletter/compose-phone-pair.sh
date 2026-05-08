#!/usr/bin/env bash
# Composite 2 mobile screenshots side-by-side into a 1600x800 newsletter hero.
# Phones are sized large (~720px wide) so the on-screen UI is easy to read.
# Source phones should already be tight-cropped to the action area
# (the bottom black space below content is wasted in this layout).
#
# Usage:
#   ./compose-phone-pair.sh <left.png> <right.png> <out.png>

set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <left.png> <right.png> <out.png>" >&2
  exit 1
fi

LEFT="$1"; RIGHT="$2"; OUT="$3"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

CANVAS_W=1600
CANVAS_H=800
PHONE_W=720
RADIUS=42

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
  local in="$1" out="$2"
  magick "$in" -resize "${PHONE_W}x" "$WORK/_p-resized.png"
  round_corners "$WORK/_p-resized.png" "$WORK/_p-round.png" "$RADIUS"
  add_shadow "$WORK/_p-round.png" "$out"
}

magick -size "${CANVAS_W}x${CANVAS_H}" \
  gradient:'#0a0c10-#1c1c1c' "$WORK/bg.png"

phone "$LEFT" "$WORK/p1.png"
phone "$RIGHT" "$WORK/p2.png"

PHONE_H=$(magick identify -format "%h" "$WORK/p1.png")
ROW_Y=$(( (CANVAS_H - PHONE_H) / 2 ))

# Centred pair with a small gap.
GAP=40
TOTAL_W=$(( PHONE_W * 2 + GAP ))
LEFT_X=$(( (CANVAS_W - TOTAL_W) / 2 ))
RIGHT_X=$(( LEFT_X + PHONE_W + GAP ))

magick "$WORK/bg.png" \
  "$WORK/p1.png" -geometry "+${LEFT_X}+${ROW_Y}" -composite \
  "$WORK/p2.png" -geometry "+${RIGHT_X}+${ROW_Y}" -composite \
  "$OUT"

echo "Wrote $OUT"
