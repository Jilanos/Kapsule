// Sauvegarde en ligne de la base SQLite (API .backup(), coherente meme en WAL).
// Ecrit un fichier horodate sous <data>/backups et purge au-dela de KEEP jours.
// Usage : node apps/backend/src/backup.mjs   (typiquement via cron dans le conteneur)

import Database from "better-sqlite3";
import { mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";

const DB_PATH = process.env.KAPSULE_DB ?? "/data/kapsule.sqlite";
const BACKUP_DIR = process.env.KAPSULE_BACKUP_DIR ?? join(dirname(DB_PATH), "backups");
const KEEP_DAYS = Number(process.env.KAPSULE_BACKUP_KEEP_DAYS ?? 7);

mkdirSync(BACKUP_DIR, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dest = join(BACKUP_DIR, `kapsule-${stamp}.sqlite`);

const db = new Database(DB_PATH, { readonly: true });
await db.backup(dest);
db.close();
console.log(`Sauvegarde : ${dest}`);

// Rotation : supprime les sauvegardes plus vieilles que KEEP_DAYS.
const cutoff = Date.now() - KEEP_DAYS * 86400_000;
let removed = 0;
for (const f of readdirSync(BACKUP_DIR)) {
  if (!f.startsWith("kapsule-") || !f.endsWith(".sqlite")) continue;
  const p = join(BACKUP_DIR, f);
  if (statSync(p).mtimeMs < cutoff) {
    unlinkSync(p);
    removed++;
  }
}
if (removed) console.log(`Rotation : ${removed} ancienne(s) sauvegarde(s) supprimee(s).`);
