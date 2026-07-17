// Genere les icones PWA (PNG) sans dependance externe : un carre de couleur
// unie avec un "K" dessine a la main en pixels. Suffisant pour l'installabilite ;
// a remplacer par un vrai visuel plus tard.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public");
mkdirSync(OUT, { recursive: true });

const BG = [79, 70, 229]; // indigo
const FG = [255, 255, 255];

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

// Dessine un "K" stylise dans une grille 8x8 mise a l'echelle.
const GLYPH = [
  "10000100",
  "10001000",
  "10010000",
  "10100000",
  "11100000",
  "10010000",
  "10001000",
  "10000100",
];
function isForeground(x, y, size) {
  const pad = Math.floor(size * 0.18);
  const inner = size - pad * 2;
  if (x < pad || y < pad || x >= size - pad || y >= size - pad) return false;
  const gx = Math.floor(((x - pad) / inner) * 8);
  const gy = Math.floor(((y - pad) / inner) * 8);
  return GLYPH[gy]?.[gx] === "1";
}

function makePng(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0; // filter type 0
    for (let x = 0; x < size; x++) {
      const [r, g, b] = isForeground(x, y, size) ? FG : BG;
      raw[p++] = r;
      raw[p++] = g;
      raw[p++] = b;
      raw[p++] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
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

for (const size of [192, 512]) {
  writeFileSync(join(OUT, `pwa-${size}x${size}.png`), makePng(size));
}
writeFileSync(join(OUT, "favicon.png"), makePng(64));
console.log("Icones PWA generees dans", OUT);
