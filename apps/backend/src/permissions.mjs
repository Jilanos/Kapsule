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

// --- Console d'administration ---------------------------------------------
// Les gardes ci-dessous restent des fonctions pures : les routes les appellent
// avant toute ecriture, le store fournit les compteurs. Aucune de ces regles ne
// doit dependre d'un masquage frontend.

/** Seul l'admin accede a la console d'administration. */
export function canAdminister(user) {
  return user?.role === "admin";
}

/**
 * Un admin peut-il changer le role de ce compte ?
 * Invariants (dans cet ordre, le premier refus l'emporte) :
 * - role cible valide ;
 * - au moins un administrateur doit rester apres l'operation ;
 * - pas de modification de son propre role (evite l'auto-verrouillage et rend
 *   la perte de droits toujours volontaire d'un tiers).
 *
 * L'ordre compte. Le seul appelant capable de declencher l'invariant « dernier
 * admin » est l'unique administrateur agissant sur lui-meme : tester
 * l'auto-modification d'abord rendrait cet invariant inatteignable, et le refus
 * renvoye serait le moins informatif des deux. Place en second, il reste vivant,
 * testable, et il protegera aussi tout futur chemin d'appel (script, lot) qui ne
 * passerait pas par un acteur egal a la cible.
 *
 * @param {{id:string, role:string}} actor administrateur agissant
 * @param {{id:string, role:string}} target compte cible
 * @param {string} nextRole role demande
 * @param {number} adminCount nombre d'administrateurs actuellement en base
 * @returns {{ ok: true } | { ok: false, status: number, error: string }}
 */
export function checkRoleChange(actor, target, nextRole, adminCount) {
  if (!VALID_ROLES.includes(nextRole)) {
    return {
      ok: false,
      status: 400,
      error: `role invalide "${nextRole}" (attendu : ${VALID_ROLES.join(", ")})`,
    };
  }
  if (target.role === "admin" && nextRole !== "admin" && adminCount <= 1) {
    return {
      ok: false,
      status: 409,
      error: "impossible de retrograder le dernier administrateur",
    };
  }
  if (actor.id === target.id) {
    return {
      ok: false,
      status: 409,
      error: "vous ne pouvez pas modifier votre propre role",
    };
  }
  return { ok: true };
}

/**
 * Un admin peut-il supprimer ce compte ?
 * Memes invariants que le changement de role, dans le meme ordre et pour la
 * meme raison : le dernier administrateur est intouchable, puis nul ne supprime
 * son propre compte depuis la console.
 * @returns {{ ok: true } | { ok: false, status: number, error: string }}
 */
export function checkUserDeletion(actor, target, adminCount) {
  if (target.role === "admin" && adminCount <= 1) {
    return {
      ok: false,
      status: 409,
      error: "impossible de supprimer le dernier administrateur",
    };
  }
  if (actor.id === target.id) {
    return {
      ok: false,
      status: 409,
      error: "vous ne pouvez pas supprimer votre propre compte",
    };
  }
  return { ok: true };
}
