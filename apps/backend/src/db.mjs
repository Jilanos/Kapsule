// Ouverture de la base SQLite et creation du schema.
// La base concrete est isolee derriere l'adaptateur de stockage (store.mjs),
// conformement a l'ADR : on doit pouvoir remplacer SQLite plus tard sans
// toucher aux routes.

import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Ouvre (et initialise) la base SQLite.
 * @param {string} [file] chemin du fichier ; ":memory:" pour les tests.
 * @returns {import("better-sqlite3").Database}
 */
export function openDb(file) {
  const path = file ?? process.env.KAPSULE_DB ?? join(__dirname, "..", "data", "kapsule.sqlite");

  if (path !== ":memory:") {
    mkdirSync(dirname(path), { recursive: true });
  }

  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

// Migrations versionnees, appliquees dans l'ordre selon PRAGMA user_version.
// Ajouter une migration = pousser une fonction ; ne jamais reordonner ni
// modifier une migration deja publiee.
const MIGRATIONS = [
  // 1 : socle MVP (decks, cards, progress).
  (db) =>
    db.exec(`
    CREATE TABLE IF NOT EXISTS decks (
      id            TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      description   TEXT,
      tags          TEXT NOT NULL DEFAULT '[]',
      schema_version INTEGER NOT NULL,
      data          TEXT NOT NULL,          -- deck JSON complet (source de verite du contenu)
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );

    -- Une ligne par fiche, pour lister/naviguer sans re-parser tout le deck.
    CREATE TABLE IF NOT EXISTS cards (
      deck_id       TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
      card_id       TEXT NOT NULL,
      position      INTEGER NOT NULL,
      title         TEXT NOT NULL,
      duration_min  INTEGER,
      level         TEXT,
      data          TEXT NOT NULL,          -- fiche JSON complete
      PRIMARY KEY (deck_id, card_id)
    );

    -- Progression par (utilisateur, fiche). MVP mono-utilisateur : user_id='default'.
    CREATE TABLE IF NOT EXISTS progress (
      user_id       TEXT NOT NULL,
      deck_id       TEXT NOT NULL,
      card_id       TEXT NOT NULL,
      state         TEXT NOT NULL,          -- 'unseen' | 'seen' | 'learned'
      quiz_score    INTEGER,
      updated_at    TEXT NOT NULL,
      PRIMARY KEY (user_id, deck_id, card_id)
    );
  `),

  // 2 : authentification multi-appareils (users, sessions).
  (db) =>
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,    -- normalise en minuscules
      password_hash TEXT NOT NULL,          -- format "scrypt:<sel hex>:<hash hex>"
      created_at    TEXT NOT NULL
    );

    -- Une session par appareil : token opaque revocable.
    CREATE TABLE IF NOT EXISTS sessions (
      token         TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at    TEXT NOT NULL,
      last_used_at  TEXT NOT NULL,
      expires_at    TEXT NOT NULL,
      user_agent    TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  `),

  // 3 : repetition espacee SM-2 (reviews).
  (db) =>
    db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      user_id       TEXT NOT NULL,
      deck_id       TEXT NOT NULL,
      card_id       TEXT NOT NULL,
      easiness      REAL NOT NULL,
      interval_days INTEGER NOT NULL,
      repetitions   INTEGER NOT NULL,
      due_date      TEXT NOT NULL,          -- YYYY-MM-DD
      last_grade    INTEGER,
      updated_at    TEXT NOT NULL,
      PRIMARY KEY (user_id, deck_id, card_id)
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_due ON reviews(user_id, due_date);
  `),

  // 4 : roles utilisateurs et visibilite des decks.
  // - users.role : 'guest' (defaut a l'inscription) | 'master' | 'admin'.
  // - decks.owner_id : createur du deck (NULL pour les decks seeds historiques).
  // - decks.visibility : 'private' (proprietaire seul) | 'general' (tous) |
  //   'master' (maitres et admin). Defaut 'general' -> les decks existants
  //   restent visibles par tous apres migration.
  (db) =>
    db.exec(`
    ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'guest'
      CHECK (role IN ('guest','master','admin'));

    ALTER TABLE decks ADD COLUMN owner_id TEXT REFERENCES users(id);
    ALTER TABLE decks ADD COLUMN visibility TEXT NOT NULL DEFAULT 'general'
      CHECK (visibility IN ('private','general','master'));
    CREATE INDEX IF NOT EXISTS idx_decks_owner ON decks(owner_id);
  `),

  // 5 : les sessions ne conservent plus le bearer brut, uniquement son digest.
  (db) => {
    const rows = db.prepare(`SELECT token FROM sessions`).all();
    const update = db.prepare(`UPDATE sessions SET token = ? WHERE token = ?`);
    for (const row of rows) {
      update.run(createHash("sha256").update(row.token).digest("hex"), row.token);
    }
  },
];

/** Applique les migrations manquantes selon PRAGMA user_version. */
function migrate(db) {
  let version = db.pragma("user_version", { simple: true });
  const run = db.transaction(() => {
    for (let i = version; i < MIGRATIONS.length; i++) {
      MIGRATIONS[i](db);
    }
    db.pragma(`user_version = ${MIGRATIONS.length}`);
  });
  if (version < MIGRATIONS.length) run();
}
