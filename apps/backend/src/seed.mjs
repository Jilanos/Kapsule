// Seed : importe tous les decks JSON du dossier decks/ a la racine du repo.
// Idempotent (upsert par id). Lance automatiquement au demarrage si la base
// est vide, ou manuellement via `npm run seed --workspace @kapsule/backend`.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Store } from "./store.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DECKS_DIR = join(__dirname, "..", "..", "..", "decks");

/**
 * Importe les decks du dossier decks/ dans le store.
 * @param {Store} store
 * @returns {{ imported: string[], failed: {file:string, report:any}[] }}
 */
export function seedDecks(store) {
  const imported = [];
  const failed = [];
  let files = [];
  try {
    files = readdirSync(DECKS_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return { imported, failed };
  }

  for (const file of files) {
    try {
      const deck = JSON.parse(readFileSync(join(DECKS_DIR, file), "utf8"));
      const result = store.importDeck(deck);
      if (result.valid) imported.push(deck.id);
      else failed.push({ file, report: result.errors });
    } catch (err) {
      failed.push({ file, report: err.message });
    }
  }
  return { imported, failed };
}

// Execution directe en CLI.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { openDb } = await import("./db.mjs");
  const db = openDb();
  const { imported, failed } = seedDecks(new Store(db));
  console.log(`Decks importes : ${imported.length ? imported.join(", ") : "(aucun)"}`);
  if (failed.length) {
    console.error("Echecs :");
    for (const f of failed) console.error(`  - ${f.file}`, f.report);
    process.exit(1);
  }
}
