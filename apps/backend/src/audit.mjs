// Journal d'audit des actions d'administration.
// Seule couche qui ecrit dans `audit_log`. Deux regles non negociables :
//   1. aucun secret n'entre dans le journal (les etats avant/apres passent par
//      une allowlist explicite, jamais par un `...row`) ;
//   2. l'API n'expose aucune ecriture ni suppression d'evenement : le journal
//      est append-only pour les routes (item_025 AC5).

/** Champs d'un compte autorises dans un etat d'audit. */
const USER_STATE_FIELDS = ["email", "role"];
/** Champs d'un deck autorises dans un etat d'audit. */
const DECK_STATE_FIELDS = ["title", "visibility", "ownerId"];

const ALLOWLIST = { user: USER_STATE_FIELDS, deck: DECK_STATE_FIELDS };

/**
 * Reduit un objet a ses champs autorises pour ce type de cible.
 * Renvoie null si rien a journaliser, pour laisser la colonne NULL.
 */
export function sanitizeState(targetType, state) {
  if (!state) return null;
  const fields = ALLOWLIST[targetType] ?? [];
  const out = {};
  for (const key of fields) {
    if (state[key] !== undefined) out[key] = state[key];
  }
  return Object.keys(out).length > 0 ? out : null;
}

const encode = (value) => (value == null ? null : JSON.stringify(value));
const decode = (value) => {
  if (value == null) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export class AuditStore {
  /** @param {import("better-sqlite3").Database} db */
  constructor(db) {
    this.db = db;
  }

  /**
   * Consigne une action d'administration.
   * Synchrone et sans transaction propre : appelee *dans* la transaction de la
   * mutation qu'elle decrit, pour que l'ecriture metier et sa trace soient
   * atomiques (item_025 AC5).
   * @param {{
   *   actor: {id:string, email:string},
   *   action: string,
   *   targetType: 'user'|'deck',
   *   targetId?: string|null,
   *   targetLabel?: string|null,
   *   before?: object|null,
   *   after?: object|null,
   *   detail?: object|null,
   * }} event
   */
  record(event) {
    this.db
      .prepare(
        `INSERT INTO audit_log
           (created_at, actor_id, actor_email, action, target_type, target_id, target_label,
            before_state, after_state, detail)
         VALUES (@createdAt, @actorId, @actorEmail, @action, @targetType, @targetId, @targetLabel,
            @before, @after, @detail)`,
      )
      .run({
        createdAt: new Date().toISOString(),
        actorId: event.actor?.id ?? null,
        actorEmail: event.actor?.email ?? null,
        action: event.action,
        targetType: event.targetType,
        targetId: event.targetId ?? null,
        targetLabel: event.targetLabel ?? null,
        before: encode(sanitizeState(event.targetType, event.before)),
        after: encode(sanitizeState(event.targetType, event.after)),
        detail: encode(event.detail ?? null),
      });
  }

  /**
   * Evenements les plus recents d'abord, pagines.
   * @returns {{ events: any[], total: number }}
   */
  list({ limit = 50, offset = 0 } = {}) {
    const total = this.db.prepare(`SELECT COUNT(*) AS n FROM audit_log`).get().n;
    const rows = this.db
      .prepare(
        `SELECT id, created_at AS createdAt, actor_id AS actorId, actor_email AS actorEmail,
                action, target_type AS targetType, target_id AS targetId,
                target_label AS targetLabel, before_state AS beforeState,
                after_state AS afterState, detail
         FROM audit_log ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(limit, offset);
    return {
      total,
      events: rows.map((r) => ({
        ...r,
        beforeState: decode(r.beforeState),
        afterState: decode(r.afterState),
        detail: decode(r.detail),
      })),
    };
  }

  count() {
    return this.db.prepare(`SELECT COUNT(*) AS n FROM audit_log`).get().n;
  }
}
