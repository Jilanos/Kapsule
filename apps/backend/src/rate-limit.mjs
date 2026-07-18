// Limiteur de debit en memoire (zero dependance), fenetre glissante par cle.
// Objectif (audit 2026-07-18, AC4) : freiner le brute force et le deni de
// service CPU sur login/register, dont le hachage scrypt est couteux.
//
// Deterministe et testable : `check` accepte un `now` injectable, `reset` vide
// l'etat. Adapte a un process unique (MVP) ; une montee en charge multi-instance
// necessiterait un store partage (suivi hors perimetre).

/**
 * @param {{ windowMs: number, max: number }} opts
 * @returns {{ check: (key: string, now?: number) => boolean, reset: () => void }}
 */
export function createRateLimiter({ windowMs, max }) {
  /** @type {Map<string, number[]>} cle -> timestamps des hits dans la fenetre */
  const hits = new Map();

  return {
    /** true si la requete est autorisee, false si la limite est atteinte. */
    check(key, now = Date.now()) {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      recent.push(now);
      hits.set(key, recent);
      // Nettoyage opportuniste des cles devenues vides (borne la memoire).
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
      }
      return recent.length <= max;
    },
    reset() {
      hits.clear();
    },
  };
}
