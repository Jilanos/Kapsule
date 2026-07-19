import { useEffect, useRef, useState } from "react";
import { Section } from "./Section.jsx";

/**
 * Affiche une fiche complete (toutes ses sections) avec un pied de navigation.
 * @param {{
 *   card: any, deckId: string, index: number, total: number,
 *   onSeen: () => void,
 *   onLearnAndNext: (quizScore: number|null) => void,
 *   isLast: boolean, onBack: () => void
 * }} props
 */
export function CardView({
  card,
  deckId,
  index,
  total,
  onSeen,
  onLearnAndNext,
  isLast,
  onBack,
  backLabel = "← Deck",
  nextLabel = "Marquer apprise & fiche suivante →",
  lastLabel = "Terminer & marquer apprise",
}) {
  const [quizScore, setQuizScore] = useState(null);
  const topRef = useRef(null);
  const titleRef = useRef(null);

  // A l'ouverture (ou changement de fiche) : marquer "vue", remonter en haut,
  // deplacer le focus sur le titre de la fiche et mettre a jour le titre de
  // document (AC8 : gestion du focus apres changement de fiche).
  useEffect(() => {
    setQuizScore(null);
    onSeen();
    topRef.current?.scrollIntoView({ block: "start" });
    titleRef.current?.focus();
    document.title = `${card.title} — Kapsule`;
    return () => {
      document.title = "Kapsule";
    };
    // onSeen est stable pour une meme fiche ; on ne depend que de la fiche.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id]);

  return (
    <article className="card-view" ref={topRef}>
      <div className="card-progress-row">
        <button type="button" className="back-link" onClick={onBack}>
          {backLabel}
        </button>
        <span className="card-counter">
          Fiche {index + 1} / {total}
        </span>
      </div>

      <h1 className="card-title" tabIndex={-1} ref={titleRef}>
        {card.title}
      </h1>
      {card.durationMin && (
        <p className="card-duration muted">⏱ {card.durationMin} min de lecture</p>
      )}

      {card.sections.map((section, i) => (
        <Section
          key={i}
          section={section}
          deckId={deckId}
          onQuizScore={(score) => setQuizScore(score)}
        />
      ))}

      <footer className="card-footer">
        <button type="button" className="btn-primary" onClick={() => onLearnAndNext(quizScore)}>
          {isLast ? lastLabel : nextLabel}
        </button>
      </footer>
    </article>
  );
}
