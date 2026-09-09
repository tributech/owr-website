// Read intrinsic pixel dimensions of a PNG or JPEG in public/ at build time.
// Used to lay newsletter screenshots out at a sensible size instead of
// stretching a tall phone capture across the whole column.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ImageSize {
  width: number;
  height: number;
}

const cache = new Map<string, ImageSize | null>();

export function publicImageSize(path: string): ImageSize | null {
  if (!path || !path.startsWith('/')) return null;
  if (cache.has(path)) return cache.get(path)!;

  let size: ImageSize | null = null;
  try {
    const buf = readFileSync(join(process.cwd(), 'public', path.replace(/^\//, '')));
    size = png(buf) ?? jpeg(buf);
  } catch {
    size = null;
  }
  cache.set(path, size);
  return size;
}

function png(buf: Buffer): ImageSize | null {
  const signature = '89504e470d0a1a0a';
  if (buf.length < 24 || buf.subarray(0, 8).toString('hex') !== signature) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpeg(buf: Buffer): ImageSize | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    // SOF0-SOF15, excluding the non-frame markers DHT (c4), JPGA (c8) and DAC (cc).
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}
