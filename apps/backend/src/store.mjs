// Adaptateur de stockage : seule couche qui connait SQLite.
// Les routes n'appellent que ces methodes, jamais la base directement.

import { validateDeck } from "@kapsule/schema";
import { schedule, gradeFromQuiz, addDays } from "./sm2.mjs";

export const VALID_STATES = ["unseen", "seen", "learned"];
const DEFAULT_USER = "default";

/** Nombre total de questions de quiz dans une fiche. */
function countQuizQuestions(card) {
  return (card.sections ?? [])
    .filter((s) => s.type === "quiz")
    .reduce((n, s) => n + (s.questions?.length ?? 0), 0);
}

/** Date du jour (UTC) au format YYYY-MM-DD. */
const today = () => new Date().toISOString().slice(0, 10);

export class Store {
  /** @param {import("better-sqlite3").Database} db */
  constructor(db) {
    this.db = db;
  }

  /**
   * Liste les decks avec leur nombre de fiches (metadonnees, sans le contenu).
   * @param {{id:string, role:string}} [viewer] filtre par visibilite/role.
   *   Omis -> aucun filtre (usage interne : verification "base vide" au seed).
   */
  listDecks(viewer) {
    let where = "";
    const params = [];
    if (viewer && viewer.role !== "admin") {
      // Decks visibles selon le role : general pour tous, master pour les
      // maitres, private pour son proprietaire.
      const clauses = ["d.visibility = 'general'", "(d.visibility = 'private' AND d.owner_id = ?)"];
      params.push(viewer.id);
      if (viewer.role === "master") clauses.push("d.visibility = 'master'");
      where = `WHERE ${clauses.join(" OR ")}`;
    }
    const rows = this.db
      .prepare(
        `SELECT d.id, d.title, d.description, d.tags, d.schema_version AS schemaVersion,
                d.visibility, d.owner_id AS ownerId, d.updated_at AS updatedAt,
                (SELECT COUNT(*) FROM cards c WHERE c.deck_id = d.id) AS cardCount
         FROM decks d ${where} ORDER BY d.updated_at DESC`,
      )
      .all(...params);
    return rows.map((r) => ({ ...r, tags: JSON.parse(r.tags) }));
  }

  /** Metadonnees d'acces d'un deck (proprietaire + visibilite) ou null. */
  getDeckAccess(deckId) {
    return (
      this.db
        .prepare(`SELECT owner_id AS ownerId, visibility FROM decks WHERE id = ?`)
        .get(deckId) ?? null
    );
  }

  /** Change la visibilite d'un deck (route admin). Renvoie true si applique. */
  setDeckVisibility(deckId, visibility) {
    const info = this.db
      .prepare(`UPDATE decks SET visibility = ?, updated_at = ? WHERE id = ?`)
      .run(visibility, new Date().toISOString(), deckId);
    return info.changes > 0;
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
   * A la creation, `owner_id` et `visibility` proviennent des options ; a la
   * mise a jour, ils sont preserves (l'upsert ne touche pas ces colonnes).
   * @param {unknown} deck
   * @param {{ ownerId?: string|null, visibility?: string }} [opts]
   * @returns {{ valid: boolean, errors?: {path:string,message:string}[], deck?: any }}
   */
  importDeck(deck, opts = {}) {
    const { valid, errors } = validateDeck(deck);
    if (!valid) return { valid: false, errors };

    const now = new Date().toISOString();
    const existing = this.db.prepare(`SELECT created_at FROM decks WHERE id = ?`).get(deck.id);
    const createdAt = existing?.created_at ?? now;

    const tx = this.db.transaction(() => {
      this.db
        .prepare(
          `INSERT INTO decks (id, title, description, tags, schema_version, data, owner_id, visibility, created_at, updated_at)
           VALUES (@id, @title, @description, @tags, @schemaVersion, @data, @ownerId, @visibility, @createdAt, @updatedAt)
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
          ownerId: opts.ownerId ?? null,
          visibility: opts.visibility ?? "general",
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
      return {
        ok: false,
        error: `etat invalide "${state}" (attendu : ${VALID_STATES.join(", ")})`,
      };
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

    // Passage a "apprise" -> entree dans le cycle de revision SM-2 (echeance J+1).
    if (state === "learned") {
      this.ensureReview(deckId, cardId, quizScore, userId);
    }
    return { ok: true };
  }

  // --- Repetition espacee SM-2 --------------------------------------------

  getReview(deckId, cardId, userId = DEFAULT_USER) {
    return (
      this.db
        .prepare(
          `SELECT easiness, interval_days AS interval, repetitions, due_date AS dueDate,
                  last_grade AS lastGrade
           FROM reviews WHERE user_id = ? AND deck_id = ? AND card_id = ?`,
        )
        .get(userId, deckId, cardId) ?? null
    );
  }

  _writeReview(userId, deckId, cardId, sched, grade) {
    this.db
      .prepare(
        `INSERT INTO reviews (user_id, deck_id, card_id, easiness, interval_days, repetitions, due_date, last_grade, updated_at)
         VALUES (@userId, @deckId, @cardId, @easiness, @interval, @repetitions, @dueDate, @grade, @now)
         ON CONFLICT(user_id, deck_id, card_id) DO UPDATE SET
           easiness=@easiness, interval_days=@interval, repetitions=@repetitions,
           due_date=@dueDate, last_grade=@grade, updated_at=@now`,
      )
      .run({
        userId,
        deckId,
        cardId,
        easiness: sched.easiness,
        interval: sched.interval,
        repetitions: sched.repetitions,
        dueDate: addDays(today(), sched.interval),
        grade,
        now: new Date().toISOString(),
      });
  }

  /**
   * Cree l'entree de revision quand une fiche devient "apprise", si absente.
   * La note initiale derive du score de quiz enregistre.
   */
  ensureReview(deckId, cardId, quizScore, userId = DEFAULT_USER) {
    if (this.getReview(deckId, cardId, userId)) return; // deja dans le cycle
    const card = this.getCard(deckId, cardId);
    if (!card) return;
    const grade = gradeFromQuiz(quizScore ?? 0, countQuizQuestions(card));
    this._writeReview(userId, deckId, cardId, schedule(null, grade), grade);
  }

  /**
   * Enregistre une revision : recalcule la planification SM-2.
   * @returns {{ ok:boolean, error?:string, review?:any }}
   */
  reviewCard(deckId, cardId, quizScore = null, userId = DEFAULT_USER) {
    const card = this.getCard(deckId, cardId);
    if (!card) return { ok: false, error: `fiche introuvable : ${deckId}/${cardId}` };
    const prev = this.getReview(deckId, cardId, userId);
    const grade = gradeFromQuiz(quizScore ?? 0, countQuizQuestions(card));
    const sched = schedule(
      prev
        ? { easiness: prev.easiness, interval: prev.interval, repetitions: prev.repetitions }
        : null,
      grade,
    );
    this._writeReview(userId, deckId, cardId, sched, grade);
    return { ok: true, review: this.getReview(deckId, cardId, userId) };
  }

  /**
   * Fiches dues (due_date <= aujourd'hui), tous decks, avec titres, triees par
   * echeance. Refiltre la visibilite *courante* des decks : une revision creee
   * quand le deck etait visible ne doit plus exposer ses titres si le deck est
   * devenu prive/maitre (cf. audit 2026-07-18, P0 autorisations).
   * @param {{id:string, role:string}|string} viewer objet utilisateur, ou id
   *   seul (usage interne/tests) — dans ce cas aucun filtre de visibilite.
   */
  getDueReviews(viewer) {
    const isObject = viewer != null && typeof viewer === "object";
    const userId = isObject ? viewer.id : (viewer ?? DEFAULT_USER);
    const role = isObject ? viewer.role : "admin"; // id seul -> pas de filtre

    let visibility = "";
    const params = [userId];
    if (role !== "admin") {
      const clauses = ["d.visibility = 'general'", "(d.visibility = 'private' AND d.owner_id = ?)"];
      params.push(userId);
      if (role === "master") clauses.push("d.visibility = 'master'");
      visibility = `AND (${clauses.join(" OR ")})`;
    }
    params.push(today());

    return this.db
      .prepare(
        `SELECT r.deck_id AS deckId, r.card_id AS cardId, r.due_date AS dueDate,
                c.title AS cardTitle, c.duration_min AS durationMin,
                d.title AS deckTitle
         FROM reviews r
         JOIN cards c ON c.deck_id = r.deck_id AND c.card_id = r.card_id
         JOIN decks d ON d.id = r.deck_id
         WHERE r.user_id = ? ${visibility} AND r.due_date <= ?
         ORDER BY r.due_date ASC, d.title ASC`,
      )
      .all(...params);
  }
}
