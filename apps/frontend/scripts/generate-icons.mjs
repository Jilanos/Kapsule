// Genere les icones PWA (PNG) sans dependance externe et conserve le favicon
// Kapsule versionne dans public/brand.
import { deflateSync, inflateSync } from "node:zlib";
import { copyFileSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public");
const SOURCE_ICON = join(OUT, "brand", "kapsule-favicon.png");
mkdirSync(OUT, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeData));
  return Buffer.concat([len, typeData, crc]);
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(buffer) {
  const signature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== signature) throw new Error("PNG invalide");

  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = null;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8) throw new Error("Seuls les PNG 8 bits sont supportes");
      colorType = data[9];
      if (![2, 6].includes(colorType)) throw new Error("Seuls les PNG RGB/RGBA sont supportes");
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  const bpp = colorType === 6 ? 4 : 3;
  const stride = width * bpp;
  const inflated = inflateSync(Buffer.concat(idat));
  const rgba = Buffer.alloc(width * height * 4);
  let input = 0;
  let output = 0;
  let prev = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = inflated[input++];
    const row = Buffer.from(inflated.subarray(input, input + stride));
    input += stride;
    for (let i = 0; i < stride; i++) {
      const left = i >= bpp ? row[i - bpp] : 0;
      const up = prev[i] ?? 0;
      const upLeft = i >= bpp ? prev[i - bpp] : 0;
      if (filter === 1) row[i] = (row[i] + left) & 255;
      else if (filter === 2) row[i] = (row[i] + up) & 255;
      else if (filter === 3) row[i] = (row[i] + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) row[i] = (row[i] + paeth(left, up, upLeft)) & 255;
      else if (filter !== 0) throw new Error(`Filtre PNG non supporte: ${filter}`);
    }
    for (let x = 0; x < width; x++) {
      const src = x * bpp;
      rgba[output++] = row[src];
      rgba[output++] = row[src + 1];
      rgba[output++] = row[src + 2];
      rgba[output++] = colorType === 6 ? row[src + 3] : 255;
    }
    prev = row;
  }
  return { width, height, rgba };
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc(height * (width * 4 + 1));
  let p = 0;
  let src = 0;
  for (let y = 0; y < height; y++) {
    raw[p++] = 0;
    rgba.copy(raw, p, src, src + width * 4);
    p += width * 4;
    src += width * 4;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function resizeContain(source, size) {
  const target = Buffer.alloc(size * size * 4);
  const padding = Math.floor(size * 0.08);
  const scale = Math.min((size - padding * 2) / source.width, (size - padding * 2) / source.height);
  const outWidth = Math.max(1, Math.round(source.width * scale));
  const outHeight = Math.max(1, Math.round(source.height * scale));
  const xOffset = Math.floor((size - outWidth) / 2);
  const yOffset = Math.floor((size - outHeight) / 2);

  for (let y = 0; y < outHeight; y++) {
    const sy = Math.min(source.height - 1, Math.floor(y / scale));
    for (let x = 0; x < outWidth; x++) {
      const sx = Math.min(source.width - 1, Math.floor(x / scale));
      const src = (sy * source.width + sx) * 4;
      const dst = ((y + yOffset) * size + x + xOffset) * 4;
      target[dst] = source.rgba[src];
      target[dst + 1] = source.rgba[src + 1];
      target[dst + 2] = source.rgba[src + 2];
      target[dst + 3] = source.rgba[src + 3];
    }
  }
  return target;
}

const source = decodePng(readFileSync(SOURCE_ICON));
for (const size of [192, 512]) {
  writeFileSync(
    join(OUT, `pwa-${size}x${size}.png`),
    encodePng(size, size, resizeContain(source, size)),
  );
}
copyFileSync(SOURCE_ICON, join(OUT, "favicon.png"));
console.log("Icones PWA generees dans", OUT);
