// Adaptateur de stockage : seule couche qui connait SQLite.
// Les routes n'appellent que ces methodes, jamais la base directement.

import { validateDeck } from "@kapsule/schema";

export const VALID_STATES = ["unseen", "seen", "learned"];
const DEFAULT_USER = "default";

export class Store {
  /** @param {import("better-sqlite3").Database} db */
  constructor(db) {
    this.db = db;
  }

  /** Liste les decks avec leur nombre de fiches (metadonnees, sans le contenu complet). */
  listDecks() {
    const rows = this.db
      .prepare(
        `SELECT d.id, d.title, d.description, d.tags, d.schema_version AS schemaVersion,
                d.updated_at AS updatedAt,
                (SELECT COUNT(*) FROM cards c WHERE c.deck_id = d.id) AS cardCount
         FROM decks d ORDER BY d.updated_at DESC`,
      )
      .all();
    return rows.map((r) => ({ ...r, tags: JSON.parse(r.tags) }));
  }

  /** Renvoie le deck complet (avec ses fiches) ou null. */
  getDeck(deckId) {
    const row = this.db.prepare(`SELECT data FROM decks WHERE id = ?`).get(deckId);
    return row ? JSON.parse(row.data) : null;
  }

  /** Renvoie une fiche precise ou null. */
  getCard(deckId, cardId) {
    const row = this.db
      .prepare(`SELECT data FROM cards WHERE deck_id = ? AND card_id = ?`)
      .get(deckId, cardId);
    return row ? JSON.parse(row.data) : null;
  }

  /**
   * Valide puis insere/remplace un deck et ses fiches (transaction atomique).
   * @param {unknown} deck
   * @returns {{ valid: boolean, errors?: {path:string,message:string}[], deck?: any }}
   */
  importDeck(deck) {
    const { valid, errors } = validateDeck(deck);
    if (!valid) return { valid: false, errors };

    const now = new Date().toISOString();
    const existing = this.db.prepare(`SELECT created_at FROM decks WHERE id = ?`).get(deck.id);
    const createdAt = existing?.created_at ?? now;

    const tx = this.db.transaction(() => {
      this.db
        .prepare(
          `INSERT INTO decks (id, title, description, tags, schema_version, data, created_at, updated_at)
           VALUES (@id, @title, @description, @tags, @schemaVersion, @data, @createdAt, @updatedAt)
           ON CONFLICT(id) DO UPDATE SET
             title=@title, description=@description, tags=@tags,
             schema_version=@schemaVersion, data=@data, updated_at=@updatedAt`,
        )
        .run({
          id: deck.id,
          title: deck.title,
          description: deck.description ?? null,
          tags: JSON.stringify(deck.tags ?? []),
          schemaVersion: deck.schemaVersion,
          data: JSON.stringify(deck),
          createdAt,
          updatedAt: now,
        });

      // On reconstruit les fiches du deck pour rester coherent avec le contenu.
      this.db.prepare(`DELETE FROM cards WHERE deck_id = ?`).run(deck.id);
      const insertCard = this.db.prepare(
        `INSERT INTO cards (deck_id, card_id, position, title, duration_min, level, data)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      );
      deck.cards.forEach((card, i) => {
        insertCard.run(
          deck.id,
          card.id,
          i,
          card.title,
          card.durationMin ?? null,
          card.level ?? null,
          JSON.stringify(card),
        );
      });
    });
    tx();

    return { valid: true, deck: this.getDeck(deck.id) };
  }

  deleteDeck(deckId) {
    const info = this.db.prepare(`DELETE FROM decks WHERE id = ?`).run(deckId);
    return info.changes > 0;
  }

  /** Progression d'un deck : map cardId -> { state, quizScore }. */
  getDeckProgress(deckId, userId = DEFAULT_USER) {
    const rows = this.db
      .prepare(
        `SELECT card_id AS cardId, state, quiz_score AS quizScore
         FROM progress WHERE user_id = ? AND deck_id = ?`,
      )
      .all(userId, deckId);
    const map = {};
    for (const r of rows) map[r.cardId] = { state: r.state, quizScore: r.quizScore };
    return map;
  }

  /** Toute la progression de l'utilisateur, agregee par deck. */
  getProgressSummary(userId = DEFAULT_USER) {
    const rows = this.db
      .prepare(
        `SELECT deck_id AS deckId,
                SUM(CASE WHEN state='learned' THEN 1 ELSE 0 END) AS learned,
                SUM(CASE WHEN state IN ('seen','learned') THEN 1 ELSE 0 END) AS seen
         FROM progress WHERE user_id = ? GROUP BY deck_id`,
      )
      .all(userId);
    const map = {};
    for (const r of rows) map[r.deckId] = { learned: r.learned, seen: r.seen };
    return map;
  }

  /**
   * Enregistre l'etat d'une fiche.
   * @returns {{ ok: boolean, error?: string }}
   */
  setProgress(deckId, cardId, state, quizScore = null, userId = DEFAULT_USER) {
    if (!VALID_STATES.includes(state)) {
      return { ok: false, error: `etat invalide "${state}" (attendu : ${VALID_STATES.join(", ")})` };
    }
    if (!this.getCard(deckId, cardId)) {
      return { ok: false, error: `fiche introuvable : ${deckId}/${cardId}` };
    }
    this.db
      .prepare(
        `INSERT INTO progress (user_id, deck_id, card_id, state, quiz_score, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, deck_id, card_id) DO UPDATE SET
           state=excluded.state, quiz_score=excluded.quiz_score, updated_at=excluded.updated_at`,
      )
      .run(userId, deckId, cardId, state, quizScore, new Date().toISOString());
    return { ok: true };
  }
}
