// Modele de retention memorielle (fonction pure, sans etat ni I/O).
//
// Estime la retention d'une fiche a partir de sa planification SM-2, selon la
// courbe de l'oubli d'Ebbinghaus : R(t) = 2^(-t/S), ou
//   t = jours ecoules depuis la derniere revision (`updatedAt`),
//   S = stabilite du souvenir = intervalle SM-2 courant (`interval`).
// R vaut 1 juste apres une revision et tend vers 0 quand l'echeance est
// largement depassee. C'est une ESTIMATION derivee des donnees existantes :
// aucune chronologie n'est stockee (cf. hors-perimetre req_007).

const DAY_MS = 86_400_000;

/** Arrondi a 3 decimales (stabilite des series JSON). */
const round3 = (n) => Math.round(n * 1000) / 1000;

/**
 * Jours (fractionnaires) ecoules entre un instant ISO et une date de reference.
 * @param {string} iso instant ISO (ex. "2026-07-19T14:39:38.270Z")
 * @param {Date} now date de reference
 */
export function daysSince(iso, now) {
  return (now.getTime() - new Date(iso).getTime()) / DAY_MS;
}

/**
 * Retention estimee d'une fiche a l'instant `now`.
 * @param {{ interval:number, updatedAt:string }} review planification SM-2.
 * @param {Date} now instant d'evaluation.
 * @returns {number} retention dans [0,1] (1 = fraiche, 0 = oubliee).
 */
export function retentionOfCard(review, now) {
  const stability = Math.max(1, review.interval || 1);
  const elapsed = Math.max(0, daysSince(review.updatedAt, now));
  const r = Math.pow(2, -elapsed / stability);
  return Math.min(1, Math.max(0, r));
}

/**
 * Retention agregee d'un deck : moyenne des fiches en cycle de revision.
 * @param {Array<{interval:number, updatedAt:string}>} reviews
 * @param {Date} now
 * @returns {number|null} moyenne dans [0,1], ou null si aucune fiche en cycle.
 */
export function retentionOfDeck(reviews, now) {
  if (!reviews || reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + retentionOfCard(r, now), 0);
  return round3(sum / reviews.length);
}

/**
 * Serie de retention agregee du deck, echantillonnee de `now` vers le futur,
 * pour tracer la courbe de decroissance (a quel rythme le deck sera oublie
 * sans revision). Monotone non croissante par construction.
 * @param {Array<{interval:number, updatedAt:string}>} reviews
 * @param {Date} now
 * @param {{ days?:number, samples?:number }} [opts] fenetre (jours) et nb de points.
 * @returns {number[]} retentions (0-1), du present (index 0) vers le futur. Vide
 *   si aucune fiche en cycle.
 */
export function retentionSeries(reviews, now, { days = 14, samples = 8 } = {}) {
  if (!reviews || reviews.length === 0) return [];
  const n = Math.max(2, samples);
  const points = [];
  for (let i = 0; i < n; i++) {
    const offsetDays = (days * i) / (n - 1); // 0 (present) -> days (futur)
    const at = new Date(now.getTime() + offsetDays * DAY_MS);
    points.push(retentionOfDeck(reviews, at));
  }
  return points;
}
