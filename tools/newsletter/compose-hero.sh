#!/usr/bin/env bash
# Composite a desktop screenshot with two overlaid mobile screenshots into a
# newsletter hero image. Outputs a 1600x800 PNG.
#
# Usage:
#   ./compose-hero.sh <desktop.png> <mobile1.png> <mobile2.png> <out.png>
#
# Layout:
#   - Canvas: 1600x800, gradient dark background (#0a0c10 -> #1c1c1c)
#   - Desktop: scaled to ~1080 wide, left-aligned with rounded corners + shadow
#   - Mobile 1: scaled to ~280 wide, lower-right, tilted -4 deg, shadow
#   - Mobile 2: scaled to ~280 wide, upper-right, tilted +5 deg, shadow,
#     overlapping mobile 1.

set -euo pipefail

if [ "$#" -ne 4 ]; then
  echo "Usage: $0 <desktop.png> <mobile1.png> <mobile2.png> <out.png>" >&2
  exit 1
fi

DESKTOP="$1"
MOBILE1="$2"
MOBILE2="$3"
OUT="$4"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

CANVAS_W=1600
CANVAS_H=800
DESK_W=1080
PHONE_W=380

# Round-corner helper. Args: in, out, radius.
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

# Add a soft drop shadow under an image, preserving alpha.
add_shadow() {
  local in="$1" out="$2"
  magick "$in" \( +clone -background '#000000' -shadow 70x18+0+14 \) \
    +swap -background none -layers merge +repage "$out"
}

# Background gradient.
magick -size "${CANVAS_W}x${CANVAS_H}" \
  gradient:'#0a0c10-#1c1c1c' "$WORK/bg.png"

# Desktop: resize, round corners, shadow.
magick "$DESKTOP" -resize "${DESK_W}x" "$WORK/desktop-resized.png"
round_corners "$WORK/desktop-resized.png" "$WORK/desktop-round.png" 12
add_shadow "$WORK/desktop-round.png" "$WORK/desktop-final.png"
DESK_H=$(magick identify -format "%h" "$WORK/desktop-resized.png")

# Phone helper: resize, round corners, rotate, shadow.
phone() {
  local in="$1" out="$2" rot="$3"
  magick "$in" -resize "${PHONE_W}x" "$WORK/_p-resized.png"
  round_corners "$WORK/_p-resized.png" "$WORK/_p-round.png" 30
  magick "$WORK/_p-round.png" -background none -rotate "$rot" "$WORK/_p-rot.png"
  add_shadow "$WORK/_p-rot.png" "$out"
}

phone "$MOBILE1" "$WORK/p1.png" -6
phone "$MOBILE2" "$WORK/p2.png" 7

# Composition. Desktop on left, phones overlap onto its right side.
DESK_X=50
DESK_Y=$(( (CANVAS_H - DESK_H) / 2 ))
P1_X=900
P1_Y=-10
P2_X=1170
P2_Y=300

magick "$WORK/bg.png" \
  "$WORK/desktop-final.png" -geometry "+${DESK_X}+${DESK_Y}" -composite \
  "$WORK/p1.png" -geometry "+${P1_X}+${P1_Y}" -composite \
  "$WORK/p2.png" -geometry "+${P2_X}+${P2_Y}" -composite \
  "$OUT"

echo "Wrote $OUT"
