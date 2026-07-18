// Algorithme de repetition espacee SM-2 (fonction pure, sans etat ni date).
// Reference : SuperMemo 2 (Piotr Wozniak). La note (grade) va de 0 a 5.

const MIN_EASINESS = 1.3;
const DEFAULT_EASINESS = 2.5;

/** Arrondi a 2 decimales (stabilite du facteur de facilite). */
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Calcule le prochain etat de planification.
 * @param {{ easiness:number, interval:number, repetitions:number }|null} prev
 *        etat precedent, ou null pour une premiere planification.
 * @param {number} grade note de rappel 0-5.
 * @returns {{ easiness:number, interval:number, repetitions:number }}
 */
export function schedule(prev, grade) {
  let easiness = prev?.easiness ?? DEFAULT_EASINESS;
  let repetitions = prev?.repetitions ?? 0;
  let interval;

  if (grade < 3) {
    // Rappel rate : on recommence le cycle (revoir des demain).
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round((prev?.interval ?? 1) * easiness);
    repetitions += 1;
  }

  // Ajustement du facteur de facilite (borne a 1.3).
  easiness = Math.max(MIN_EASINESS, easiness + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));

  return { easiness: round2(easiness), interval, repetitions };
}

/**
 * Derive une note SM-2 (1-5) d'un score de quiz.
 * Sans quiz (total = 0), renvoie 4 (relecture complete satisfaisante).
 * @param {number} correct nombre de bonnes reponses
 * @param {number} total nombre de questions
 */
export function gradeFromQuiz(correct, total) {
  if (!total || total <= 0) return 4;
  const ratio = Math.max(0, Math.min(1, correct / total));
  return 1 + Math.round(ratio * 4); // 0 -> 1, 1.0 -> 5
}

/** Ajoute N jours a une date ISO (YYYY-MM-DD) et renvoie une date ISO. */
export function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
