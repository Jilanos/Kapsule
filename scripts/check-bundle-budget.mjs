// Budget de performance frontend (audit 2026-07-18, AC10).
// Verifie que le bundle buildé reste sous des seuils explicites. A lancer
// APRES `npm run build` (utilise en CI). Sortie non nulle si un budget est
// depasse -> la CI echoue.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, "..", "apps", "frontend", "dist", "assets");

// Seuils (gzip). Marge raisonnable au-dessus de l'etat actuel pour detecter une
// derive sans etre fragile ; a resserrer si le bundle diminue durablement.
const BUDGETS = {
  jsGzipKB: 75, // total JavaScript gzip
  cssGzipKB: 15, // total CSS gzip
};

const gzipKB = (buf) => gzipSync(buf).length / 1024;

let jsGzip = 0;
let cssGzip = 0;
let files;
try {
  files = readdirSync(ASSETS_DIR);
} catch {
  console.error(`Budget: dossier introuvable ${ASSETS_DIR}. Lancez d'abord 'npm run build'.`);
  process.exit(1);
}

for (const name of files) {
  const path = join(ASSETS_DIR, name);
  if (!statSync(path).isFile()) continue;
  const buf = readFileSync(path);
  if (name.endsWith(".js")) jsGzip += gzipKB(buf);
  else if (name.endsWith(".css")) cssGzip += gzipKB(buf);
}

const checks = [
  { label: "JS gzip", value: jsGzip, budget: BUDGETS.jsGzipKB },
  { label: "CSS gzip", value: cssGzip, budget: BUDGETS.cssGzipKB },
];

let failed = false;
for (const c of checks) {
  const status = c.value <= c.budget ? "OK" : "DEPASSE";
  if (c.value > c.budget) failed = true;
  console.log(`${status.padEnd(8)} ${c.label}: ${c.value.toFixed(1)} KB / ${c.budget} KB`);
}

if (failed) {
  console.error(
    "\nBudget de performance depasse. Reduisez le bundle ou ajustez le budget en connaissance de cause.",
  );
  process.exit(1);
}
console.log("\nBudget de performance respecte.");
