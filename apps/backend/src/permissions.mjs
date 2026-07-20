// Regles d'autorisation : roles utilisateurs et visibilite des decks.
// Fonctions pures (aucun acces base) : le store applique le filtrage SQL,
// les routes appliquent ces gardes avant toute ecriture.

export const VALID_ROLES = ["guest", "master", "admin"];
export const VALID_VISIBILITY = ["private", "general", "master"];

/**
 * Un utilisateur peut-il voir ce deck ?
 * @param {{role:string, id:string}} user
 * @param {{visibility:string, ownerId:string|null}} deck
 */
export function canViewDeck(user, deck) {
  if (user.role === "admin") return true; // l'admin voit tout
  switch (deck.visibility) {
    case "general":
      return true;
    case "master":
      return user.role === "master";
    case "private":
      return deck.ownerId === user.id;
    default:
      return false;
  }
}

/**
 * Un utilisateur peut-il editer (re-importer) ce deck existant ?
 * - decks prives : le proprietaire uniquement ;
 * - decks generaux/maitres : maitres et admin ;
 * - admin : tout.
 */
export function canEditDeck(user, deck) {
  if (user.role === "admin") return true;
  if (deck.visibility === "private") return deck.ownerId === user.id;
  return user.role === "master";
}

/**
 * Un utilisateur peut-il creer un deck avec cette visibilite ?
 * - 'private' : tout compte authentifie (invite inclus) ;
 * - 'general'/'master' : maitres et admin seulement.
 */
export function canCreateWithVisibility(user, visibility) {
  if (visibility === "private") return true;
  return user.role === "master" || user.role === "admin";
}

/** Seul l'admin supprime un deck. */
export function canDeleteDeck(user) {
  return user.role === "admin";
}

/** Seul l'admin change la visibilite d'un deck. */
export function canChangeVisibility(user) {
  return user.role === "admin";
}

/** Maitres et admins peuvent marquer leur propre progression de deck comme apprise. */
export function canMarkDeckLearned(user) {
  return user.role === "master" || user.role === "admin";
}
