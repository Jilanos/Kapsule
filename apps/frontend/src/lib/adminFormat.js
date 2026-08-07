// Mise en forme des donnees de la console d'administration.
// Fonctions pures, sans React ni acces reseau : elles portent la regle
// « une valeur indisponible s'annonce, elle ne s'approxime pas »
// (item_026 AC2) et restent testables isolement.

export const ROLE_LABEL = {
  guest: "Invité",
  master: "Maître",
  admin: "Administrateur",
};

// Les libelles de visibilite vivent dans lib/visibility.js : la console les
// reexporte plutot que de les redefinir, pour qu'un renommage reste unique.
export { VISIBILITY_LABEL } from "./visibility.js";

export const ROLES = ["guest", "master", "admin"];

/** Texte affiche quand une metrique n'est pas mesurable de facon fiable. */
export const UNAVAILABLE = "indisponible";

const UNITS = ["o", "ko", "Mo", "Go", "To"];

/**
 * Taille lisible. `null`/`undefined` -> « indisponible » : un 0 laisserait
 * croire a un volume mesure et vide.
 * @param {number|null|undefined} bytes
 */
export function formatBytes(bytes) {
  if (bytes == null || Number.isNaN(Number(bytes))) return UNAVAILABLE;
  let value = Number(bytes);
  if (value < 1024) return `${value} ${UNITS[0]}`;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  // Une decimale sous 10 (1,4 Mo), aucune au-dela (128 Mo) : assez precis pour
  // decider, assez court pour un tableau.
  const rounded = value < 10 ? value.toFixed(1) : String(Math.round(value));
  return `${rounded.replace(".", ",")} ${UNITS[unit]}`;
}

/** Usage d'une categorie de stockage renvoyee par l'API. */
export function formatUsage(usage) {
  if (!usage || usage.available === false) return UNAVAILABLE;
  return formatBytes(usage.bytes);
}

/** Horodatage court, ou tiret cadratin quand l'information n'existe pas. */
export function formatDateTime(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const plural = (n, singular, pluralForm = `${singular}s`) =>
  `${n} ${n > 1 ? pluralForm : singular}`;

/**
 * Consequences lisibles de la suppression d'un compte, dans l'ordre de gravite.
 * Rend explicite la politique de dependances appliquee par le serveur : les
 * decks prives partent, les decks partages sont conserves et detaches.
 * @param {object|null} impact
 * @returns {string[]}
 */
export function describeUserImpact(impact) {
  if (!impact) return [];
  const lines = [];
  if (impact.deletedDecks?.length) {
    lines.push(
      `${plural(impact.deletedDecks.length, "deck privé supprimé", "decks privés supprimés")} : ` +
        impact.deletedDecks.map((d) => d.title).join(", "),
    );
  }
  if (impact.deletedCards) {
    lines.push(`${plural(impact.deletedCards, "fiche supprimée", "fiches supprimées")}`);
  }
  if (impact.detachedDecks?.length) {
    lines.push(
      `${plural(
        impact.detachedDecks.length,
        "deck partagé conservé sans propriétaire",
        "decks partagés conservés sans propriétaire",
      )} : ` + impact.detachedDecks.map((d) => d.title).join(", "),
    );
  }
  lines.push(
    `${plural(impact.progress ?? 0, "ligne de progression supprimée", "lignes de progression supprimées")}`,
  );
  lines.push(`${plural(impact.reviews ?? 0, "révision supprimée", "révisions supprimées")}`);
  lines.push(`${plural(impact.sessions ?? 0, "session révoquée", "sessions révoquées")}`);
  return lines;
}

/**
 * Consequences lisibles de la suppression d'un deck.
 * `affectedUsers` est mis en avant : supprimer un deck partage efface la
 * progression d'autres comptes, l'operateur doit le savoir avant de confirmer.
 * @param {object|null} impact
 * @returns {string[]}
 */
export function describeDeckImpact(impact) {
  if (!impact) return [];
  const lines = [
    `${plural(impact.cards ?? 0, "fiche supprimée", "fiches supprimées")}`,
    `${plural(impact.progress ?? 0, "ligne de progression supprimée", "lignes de progression supprimées")}`,
    `${plural(impact.reviews ?? 0, "révision supprimée", "révisions supprimées")}`,
  ];
  if (impact.affectedUsers > 0) {
    lines.push(
      `${plural(impact.affectedUsers, "compte affecté", "comptes affectés")} par cette suppression`,
    );
  }
  lines.push(`Assets : ${formatBytes(impact.assetBytes)}`);
  return lines;
}

/** Libelle humain d'une action d'audit. */
export const AUDIT_ACTION_LABEL = {
  "user.role.update": "Changement de rôle",
  "user.delete": "Suppression de compte",
  "deck.delete": "Suppression de deck",
  "deck.visibility.update": "Changement de visibilité",
};

/** Resume « avant -> apres » d'un evenement d'audit, ou chaine vide. */
export function describeAuditTransition(event) {
  const before = event?.beforeState ?? null;
  const after = event?.afterState ?? null;
  const field = (state) => state?.role ?? state?.visibility ?? null;
  const from = field(before);
  const to = field(after);
  if (from && to) return `${from} → ${to}`;
  if (from && !after) return `${from} → supprimé`;
  return "";
}
