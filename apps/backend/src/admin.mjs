// Adaptateur de la console d'administration.
// Prolonge `store.mjs` : seule couche qui connait le SQL des vues admin et des
// suppressions transactionnelles. Les routes n'appellent que ces methodes.
//
// Contrat de non-divulgation (req_015 AC2 / AC7) : chaque projection est une
// liste explicite de colonnes. Ni `password_hash`, ni `sessions.token`, ni
// aucun chemin absolu ne sortent d'ici — les tailles de stockage sont rendues
// en octets par categorie, sans le chemin qui les a produites.
//
// Politique de dependances a la suppression d'un compte (req_015 AC5,
// item_025 AC4) — choisie, documentee, testee :
//   - sessions            -> supprimees (CASCADE de la cle etrangere) ;
//   - progress, reviews   -> supprimees explicitement (ces tables portent un
//                            user_id sans cle etrangere : sans ce nettoyage
//                            elles resteraient orphelines) ;
//   - decks prives        -> supprimes avec leurs fiches (CASCADE) : contenu
//                            personnel, sans autre lecteur possible ;
//   - decks general/master-> CONSERVES et rattaches a owner_id = NULL. C'est
//                            l'etat deja prevu par le schema pour les decks
//                            d'origine ; supprimer du contenu partage serait un
//                            effet de bord indesirable de la suppression d'un
//                            compte. Aucune reference ne reste pendante.
//   - assets d'uploads    -> les dossiers des decks reellement supprimes sont
//                            retires apres commit (voir strategie compensee).
//
// Strategie compensee pour les fichiers (item_026 AC4) : le systeme de fichiers
// n'est pas transactionnel. On commit d'abord la transaction SQLite, puis on
// retire les dossiers d'assets des decks supprimes. Un echec de cette seconde
// etape ne remet pas la base en cause : il est renvoye dans
// `assetCleanup.failed` pour que l'operateur puisse le traiter, la base restant
// la source de verite.

import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

/** Bornes de pagination : evite qu'un appel admin ne scanne toute la base. */
export const ADMIN_PAGE_SIZE = 25;
export const ADMIN_MAX_PAGE_SIZE = 100;

/** Normalise limit/offset d'une requete admin (valeurs hors bornes ramenees). */
export function normalizePaging({ limit, offset } = {}) {
  const parsedLimit = Number.parseInt(limit, 10);
  const parsedOffset = Number.parseInt(offset, 10);
  return {
    limit:
      Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, ADMIN_MAX_PAGE_SIZE)
        : ADMIN_PAGE_SIZE,
    offset: Number.isInteger(parsedOffset) && parsedOffset > 0 ? parsedOffset : 0,
  };
}

/** Motif LIKE echappe : l'operateur cherche du texte, pas des jokers SQL. */
function likePattern(query) {
  const escaped = String(query ?? "")
    .trim()
    .replace(/[\\%_]/g, (c) => `\\${c}`);
  return `%${escaped}%`;
}

/**
 * Taille recursive d'un dossier, en octets, avec nombre de fichiers.
 * Renvoie `available: false` quand le dossier n'existe pas (dev, volume non
 * monte) : mieux vaut annoncer l'indisponibilite qu'afficher un 0 trompeur
 * (item_026 AC2).
 */
export function directoryUsage(dir) {
  if (!dir || !existsSync(dir)) return { available: false, bytes: null, fileCount: null };
  let bytes = 0;
  let fileCount = 0;
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile()) {
        bytes += statSync(path).size;
        fileCount++;
      }
    }
  };
  try {
    walk(dir);
  } catch {
    return { available: false, bytes: null, fileCount: null };
  }
  return { available: true, bytes, fileCount };
}

/** Taille du fichier SQLite et de ses annexes WAL/SHM. */
export function databaseUsage(dbPath) {
  if (!dbPath || dbPath === ":memory:" || !existsSync(dbPath)) {
    return { available: false, bytes: null };
  }
  let bytes = 0;
  for (const suffix of ["", "-wal", "-shm"]) {
    const path = `${dbPath}${suffix}`;
    if (existsSync(path)) bytes += statSync(path).size;
  }
  return { available: true, bytes };
}

export class AdminStore {
  /**
   * @param {import("better-sqlite3").Database} db
   * @param {{ dbPath?: string, uploadsDir?: string, backupDir?: string }} [paths]
   *   chemins injectes par l'application ; ils ne sortent jamais en reponse.
   */
  constructor(db, paths = {}) {
    this.db = db;
    this.paths = paths;
  }

  // --- Comptes -------------------------------------------------------------

  countAdmins() {
    return this.db.prepare(`SELECT COUNT(*) AS n FROM users WHERE role = 'admin'`).get().n;
  }

  /** Compte cible pour une decision d'autorisation (champs minimaux). */
  getUserForMutation(id) {
    return this.db.prepare(`SELECT id, email, role FROM users WHERE id = ?`).get(id) ?? null;
  }

  /**
   * Liste paginee des comptes, avec les compteurs necessaires a une decision.
   * `lastSeenAt` vient de la session la plus recemment utilisee : c'est la seule
   * activite dont l'application dispose ; elle vaut null si aucune session.
   * @param {{ q?: string, limit?: number, offset?: number }} [opts]
   */
  listUsers({ q, limit, offset } = {}) {
    const paging = normalizePaging({ limit, offset });
    const search = String(q ?? "").trim();
    const where = search ? `WHERE u.email LIKE ? ESCAPE '\\'` : "";
    const filterParams = search ? [likePattern(search)] : [];

    const total = this.db
      .prepare(`SELECT COUNT(*) AS n FROM users u ${where}`)
      .get(...filterParams).n;

    const users = this.db
      .prepare(
        `SELECT u.id, u.email, u.role, u.created_at AS createdAt,
                (SELECT MAX(s.last_used_at) FROM sessions s WHERE s.user_id = u.id) AS lastSeenAt,
                (SELECT COUNT(*) FROM sessions s WHERE s.user_id = u.id) AS sessionCount,
                (SELECT COUNT(*) FROM decks d WHERE d.owner_id = u.id) AS deckCount,
                (SELECT COUNT(*) FROM decks d WHERE d.owner_id = u.id AND d.visibility = 'private')
                  AS privateDeckCount,
                (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id) AS progressCount,
                (SELECT COUNT(*) FROM reviews r WHERE r.user_id = u.id) AS reviewCount
         FROM users u ${where}
         ORDER BY u.created_at ASC, u.id ASC
         LIMIT ? OFFSET ?`,
      )
      .all(...filterParams, paging.limit, paging.offset)
      .map((row) => ({ ...row, sharedDeckCount: row.deckCount - row.privateDeckCount }));

    return { users, total, ...paging };
  }

  /** Detail d'un compte : memes champs que la liste, plus l'impact de suppression. */
  getUser(id) {
    const row = this.db
      .prepare(
        `SELECT u.id, u.email, u.role, u.created_at AS createdAt,
                (SELECT MAX(s.last_used_at) FROM sessions s WHERE s.user_id = u.id) AS lastSeenAt,
                (SELECT COUNT(*) FROM sessions s WHERE s.user_id = u.id) AS sessionCount,
                (SELECT COUNT(*) FROM decks d WHERE d.owner_id = u.id) AS deckCount,
                (SELECT COUNT(*) FROM decks d WHERE d.owner_id = u.id AND d.visibility = 'private')
                  AS privateDeckCount,
                (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id) AS progressCount,
                (SELECT COUNT(*) FROM reviews r WHERE r.user_id = u.id) AS reviewCount
         FROM users u WHERE u.id = ?`,
      )
      .get(id);
    if (!row) return null;
    return {
      ...row,
      sharedDeckCount: row.deckCount - row.privateDeckCount,
      impact: this.getUserDeletionImpact(id),
    };
  }

  /**
   * Ce que la suppression de ce compte va faire, avant confirmation
   * (req_015 AC5). Aligne exactement sur la politique appliquee par
   * `deleteUser` : les decks prives partent, les decks partages sont detaches.
   */
  getUserDeletionImpact(id) {
    const decks = this.db
      .prepare(
        `SELECT id, title, visibility FROM decks WHERE owner_id = ?
         ORDER BY visibility ASC, title ASC`,
      )
      .all(id);
    const deletedDecks = decks.filter((d) => d.visibility === "private");
    const detachedDecks = decks.filter((d) => d.visibility !== "private");
    const cards = deletedDecks.length
      ? this.db
          .prepare(
            `SELECT COUNT(*) AS n FROM cards
             WHERE deck_id IN (${deletedDecks.map(() => "?").join(",")})`,
          )
          .get(...deletedDecks.map((d) => d.id)).n
      : 0;
    return {
      policy: "private-decks-deleted-shared-decks-detached",
      sessions: this.db.prepare(`SELECT COUNT(*) AS n FROM sessions WHERE user_id = ?`).get(id).n,
      progress: this.db.prepare(`SELECT COUNT(*) AS n FROM progress WHERE user_id = ?`).get(id).n,
      reviews: this.db.prepare(`SELECT COUNT(*) AS n FROM reviews WHERE user_id = ?`).get(id).n,
      deletedDecks: deletedDecks.map((d) => ({ id: d.id, title: d.title })),
      detachedDecks: detachedDecks.map((d) => ({
        id: d.id,
        title: d.title,
        visibility: d.visibility,
      })),
      deletedCards: cards,
    };
  }

  /**
   * Change le role d'un compte. Atomique : la mutation et sa trace d'audit
   * partagent la meme transaction. Les invariants (dernier admin, auto-
   * modification, enum) sont verifies par `permissions.mjs` en amont.
   * @returns {{ ok: boolean, user?: any }}
   */
  setUserRole(target, nextRole, audit, actor) {
    const tx = this.db.transaction(() => {
      const info = this.db
        .prepare(`UPDATE users SET role = ? WHERE id = ?`)
        .run(nextRole, target.id);
      if (info.changes === 0) return false;
      audit.record({
        actor,
        action: "user.role.update",
        targetType: "user",
        targetId: target.id,
        targetLabel: target.email,
        before: { role: target.role },
        after: { role: nextRole },
      });
      return true;
    });
    if (!tx()) return { ok: false };
    return { ok: true, user: this.getUser(target.id) };
  }

  /**
   * Supprime un compte selon la politique documentee en tete de fichier.
   * Base d'abord (transaction), fichiers ensuite (compensation).
   * @returns {{ ok: boolean, impact: any, assetCleanup: {removed: string[], failed: string[]} }}
   */
  deleteUser(target, audit, actor) {
    const impact = this.getUserDeletionImpact(target.id);

    const tx = this.db.transaction(() => {
      // Decks partages : detaches avant la suppression du compte, sinon la cle
      // etrangere decks.owner_id -> users.id ferait echouer le DELETE.
      this.db
        .prepare(`UPDATE decks SET owner_id = NULL WHERE owner_id = ? AND visibility != 'private'`)
        .run(target.id);
      // Decks prives : supprimes (les fiches suivent par CASCADE).
      this.db
        .prepare(`DELETE FROM decks WHERE owner_id = ? AND visibility = 'private'`)
        .run(target.id);
      // Tables sans cle etrangere : nettoyage explicite, sinon lignes orphelines.
      this.db.prepare(`DELETE FROM progress WHERE user_id = ?`).run(target.id);
      this.db.prepare(`DELETE FROM reviews WHERE user_id = ?`).run(target.id);
      // sessions : CASCADE via la cle etrangere sessions.user_id.
      const info = this.db.prepare(`DELETE FROM users WHERE id = ?`).run(target.id);
      if (info.changes === 0) return false;
      audit.record({
        actor,
        action: "user.delete",
        targetType: "user",
        targetId: target.id,
        targetLabel: target.email,
        before: { email: target.email, role: target.role },
        after: null,
        detail: impact,
      });
      return true;
    });

    if (!tx()) return { ok: false, impact, assetCleanup: { removed: [], failed: [] } };
    const assetCleanup = this.#removeDeckAssets(impact.deletedDecks.map((d) => d.id));
    // Le nettoyage des lignes de progression/revision des decks supprimes n'est
    // pas couvert par la boucle ci-dessus pour les *autres* utilisateurs : un
    // deck prive n'a qu'un lecteur, mais on nettoie tout de meme par deck_id
    // pour ne rien laisser derriere en cas de donnee historique.
    this.#purgeDeckRows(impact.deletedDecks.map((d) => d.id));
    return { ok: true, impact, assetCleanup };
  }

  // --- Contenus ------------------------------------------------------------

  /**
   * Liste paginee des decks avec proprietaire, visibilite et volumes.
   * `dataBytes` est la taille exacte du JSON stocke ; `assetBytes` vaut null
   * quand le dossier d'uploads n'est pas disponible, plutot qu'un 0 trompeur.
   */
  listDecks({ q, limit, offset } = {}) {
    const paging = normalizePaging({ limit, offset });
    const search = String(q ?? "").trim();
    const where = search ? `WHERE (d.title LIKE ? ESCAPE '\\' OR d.id LIKE ? ESCAPE '\\')` : "";
    const filterParams = search ? [likePattern(search), likePattern(search)] : [];

    const total = this.db
      .prepare(`SELECT COUNT(*) AS n FROM decks d ${where}`)
      .get(...filterParams).n;

    const decks = this.db
      .prepare(
        `SELECT d.id, d.title, d.visibility, d.owner_id AS ownerId,
                (SELECT u.email FROM users u WHERE u.id = d.owner_id) AS ownerEmail,
                length(d.data) AS dataBytes,
                d.created_at AS createdAt, d.updated_at AS updatedAt,
                (SELECT COUNT(*) FROM cards c WHERE c.deck_id = d.id) AS cardCount,
                (SELECT COUNT(*) FROM progress p WHERE p.deck_id = d.id) AS progressCount,
                (SELECT COUNT(*) FROM reviews r WHERE r.deck_id = d.id) AS reviewCount
         FROM decks d ${where}
         ORDER BY d.updated_at DESC, d.id ASC
         LIMIT ? OFFSET ?`,
      )
      .all(...filterParams, paging.limit, paging.offset)
      .map((row) => ({ ...row, assetBytes: this.#deckAssetBytes(row.id) }));

    return { decks, total, ...paging };
  }

  /** Impact de la suppression d'un deck, avant confirmation (item_026 AC4). */
  getDeckDeletionImpact(deckId) {
    const deck = this.db
      .prepare(
        `SELECT id, title, visibility, owner_id AS ownerId, length(data) AS dataBytes
         FROM decks WHERE id = ?`,
      )
      .get(deckId);
    if (!deck) return null;
    return {
      deck: {
        id: deck.id,
        title: deck.title,
        visibility: deck.visibility,
        ownerId: deck.ownerId,
        dataBytes: deck.dataBytes,
      },
      cards: this.db.prepare(`SELECT COUNT(*) AS n FROM cards WHERE deck_id = ?`).get(deckId).n,
      progress: this.db.prepare(`SELECT COUNT(*) AS n FROM progress WHERE deck_id = ?`).get(deckId)
        .n,
      reviews: this.db.prepare(`SELECT COUNT(*) AS n FROM reviews WHERE deck_id = ?`).get(deckId).n,
      // Nombre de lecteurs distincts touches : une suppression de deck partage
      // efface la progression d'autres comptes, l'operateur doit le voir.
      affectedUsers: this.db
        .prepare(
          `SELECT COUNT(*) AS n FROM (
             SELECT user_id FROM progress WHERE deck_id = ?
             UNION SELECT user_id FROM reviews WHERE deck_id = ?
           )`,
        )
        .get(deckId, deckId).n,
      assetBytes: this.#deckAssetBytes(deckId),
    };
  }

  /**
   * Supprime un deck et tout ce qui en depend : fiches (CASCADE), progression et
   * revisions (pas de cle etrangere -> nettoyage explicite), puis les assets
   * apres commit. Journalise l'operation.
   */
  deleteDeck(deckId, audit, actor) {
    const impact = this.getDeckDeletionImpact(deckId);
    if (!impact) return { ok: false };

    const tx = this.db.transaction(() => {
      this.db.prepare(`DELETE FROM progress WHERE deck_id = ?`).run(deckId);
      this.db.prepare(`DELETE FROM reviews WHERE deck_id = ?`).run(deckId);
      const info = this.db.prepare(`DELETE FROM decks WHERE id = ?`).run(deckId);
      if (info.changes === 0) return false;
      audit.record({
        actor,
        action: "deck.delete",
        targetType: "deck",
        targetId: deckId,
        targetLabel: impact.deck.title,
        before: {
          title: impact.deck.title,
          visibility: impact.deck.visibility,
          ownerId: impact.deck.ownerId,
        },
        after: null,
        detail: {
          cards: impact.cards,
          progress: impact.progress,
          reviews: impact.reviews,
          affectedUsers: impact.affectedUsers,
        },
      });
      return true;
    });

    if (!tx()) return { ok: false };
    return { ok: true, impact, assetCleanup: this.#removeDeckAssets([deckId]) };
  }

  /** Journalise un changement de visibilite decide par la console. */
  recordVisibilityChange(deckId, before, after, audit, actor) {
    audit.record({
      actor,
      action: "deck.visibility.update",
      targetType: "deck",
      targetId: deckId,
      targetLabel: before.title,
      before: { visibility: before.visibility },
      after: { visibility: after },
    });
  }

  // --- Stockage ------------------------------------------------------------

  /**
   * Apercu agrege du stockage Kapsule et compteurs de donnees.
   * Ne renvoie que des categories et des octets : aucun chemin, aucun nom de
   * fichier, aucun contenu (req_015 AC7).
   */
  storageOverview() {
    const scalar = (sql) => this.db.prepare(sql).get().n;
    return {
      database: databaseUsage(this.paths.dbPath),
      uploads: directoryUsage(this.paths.uploadsDir),
      backups: directoryUsage(this.paths.backupDir),
      deckDataBytes: scalar(`SELECT COALESCE(SUM(length(data)), 0) AS n FROM decks`),
      counts: {
        users: scalar(`SELECT COUNT(*) AS n FROM users`),
        admins: this.countAdmins(),
        decks: scalar(`SELECT COUNT(*) AS n FROM decks`),
        cards: scalar(`SELECT COUNT(*) AS n FROM cards`),
        progress: scalar(`SELECT COUNT(*) AS n FROM progress`),
        reviews: scalar(`SELECT COUNT(*) AS n FROM reviews`),
        sessions: scalar(`SELECT COUNT(*) AS n FROM sessions`),
        auditEvents: scalar(`SELECT COUNT(*) AS n FROM audit_log`),
      },
    };
  }

  // --- Interne -------------------------------------------------------------

  /** Octets d'assets d'un deck, ou null si le dossier d'uploads est absent. */
  #deckAssetBytes(deckId) {
    if (!this.paths.uploadsDir) return null;
    const usage = directoryUsage(join(this.paths.uploadsDir, deckId));
    return usage.available ? usage.bytes : null;
  }

  /**
   * Retire les dossiers d'assets de decks supprimes. Best effort : la base est
   * deja committee, un echec est remonte a l'operateur sans annuler la
   * suppression (strategie compensee documentee en tete de fichier).
   */
  #removeDeckAssets(deckIds) {
    const removed = [];
    const failed = [];
    if (!this.paths.uploadsDir) return { removed, failed };
    for (const deckId of deckIds) {
      const dir = join(this.paths.uploadsDir, deckId);
      // Garde-fou anti-traversee : un id de deck ne doit jamais sortir du
      // dossier d'uploads.
      if (!dir.startsWith(this.paths.uploadsDir) || !existsSync(dir)) continue;
      try {
        rmSync(dir, { recursive: true, force: true });
        removed.push(deckId);
      } catch {
        failed.push(deckId);
      }
    }
    return { removed, failed };
  }

  /** Nettoie progression et revisions rattachees a des decks disparus. */
  #purgeDeckRows(deckIds) {
    if (deckIds.length === 0) return;
    const placeholders = deckIds.map(() => "?").join(",");
    const tx = this.db.transaction(() => {
      this.db.prepare(`DELETE FROM progress WHERE deck_id IN (${placeholders})`).run(...deckIds);
      this.db.prepare(`DELETE FROM reviews WHERE deck_id IN (${placeholders})`).run(...deckIds);
    });
    tx();
  }
}
