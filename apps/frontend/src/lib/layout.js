// Largeur du conteneur principal selon la route.
// Fonction pure, hors React, pour rester testable sans rendu : la regle de
// largeur est une decision produit, pas un detail de composant.

/**
 * Classe de largeur a ajouter a `.app-main`.
 * - lecteur de fiches et revisions : colonne etroite (confort de lecture) ;
 * - liste des decks : largeur intermediaire ;
 * - console d'administration : toute la largeur utile, ses tableaux sont denses
 *   et l'operateur compare des lignes au lieu de lire un texte suivi
 *   (item_031 AC1).
 * @param {string} pathname
 * @returns {string} chaine vide ou classe prefixee d'un espace
 */
export function mainWidthClass(pathname) {
  if (pathname === "/") return " app-main-decks";
  if (pathname === "/admin") return " app-main-admin";
  return "";
}
