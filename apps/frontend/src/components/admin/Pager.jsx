/**
 * Pagination des listings admin : deux boutons et la position courante.
 * Ne s'affiche pas quand tout tient sur une page. La position passe par
 * `role="status"` pour etre annoncee apres chaque changement de page.
 * @param {{ page: {offset:number, limit:number, total:number}, onOffset: (n:number)=>void, label: string }} props
 */
export function Pager({ page, onOffset, label }) {
  const first = page.offset === 0;
  const last = page.offset + page.limit >= page.total;
  if (first && last) return null;
  const current = Math.floor(page.offset / page.limit) + 1;
  const pages = Math.max(1, Math.ceil(page.total / page.limit));
  return (
    <nav className="admin-pager" aria-label={`Pagination des ${label}`}>
      <button
        type="button"
        className="link-btn"
        disabled={first}
        onClick={() => onOffset(Math.max(0, page.offset - page.limit))}
      >
        ← Précédent
      </button>
      <span role="status">
        Page {current} sur {pages}
      </span>
      <button
        type="button"
        className="link-btn"
        disabled={last}
        onClick={() => onOffset(page.offset + page.limit)}
      >
        Suivant →
      </button>
    </nav>
  );
}
