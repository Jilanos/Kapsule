// Ouverture de la base SQLite et creation du schema.
// La base concrete est isolee derriere l'adaptateur de stockage (store.mjs),
// conformement a l'ADR : on doit pouvoir remplacer SQLite plus tard sans
// toucher aux routes.

import Database from "better-sqlite3";
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
  const path =
    file ?? process.env.KAPSULE_DB ?? join(__dirname, "..", "data", "kapsule.sqlite");

  if (path !== ":memory:") {
    mkdirSync(dirname(path), { recursive: true });
  }

  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

/** Cree les tables si elles n'existent pas. */
function migrate(db) {
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
  `);
}
