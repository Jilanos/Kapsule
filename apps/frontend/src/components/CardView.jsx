import { useEffect, useRef, useState } from "react";
import { Section } from "./Section.jsx";

/**
 * Affiche une fiche complete (toutes ses sections) avec un pied de navigation.
 * @param {{
 *   card: any, deckId: string, index: number, total: number,
 *   onPrevious: () => void, onNext: () => void,
 *   onLearnAndNext: (quizScore: number|null) => void,
 *   isLast: boolean, onBack: () => void
 * }} props
 */
export function CardView({
  card,
  deckId,
  index,
  total,
  onPrevious,
  onNext,
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

  // A l'ouverture (ou changement de fiche) : remonter en haut, deplacer le
  // focus sur le titre et mettre a jour le titre de document. La consultation
  // reste volontairement neutre : seul le bouton de validation modifie l'etat.
  useEffect(() => {
    setQuizScore(null);
    topRef.current?.scrollIntoView({ block: "start" });
    titleRef.current?.focus();
    document.title = `${card.title} — Kapsule`;
    return () => {
      document.title = "Kapsule";
    };
  }, [card.id]);

  return (
    <article className="card-view" ref={topRef}>
      <nav className="card-progress-row" aria-label="Navigation dans le deck">
        <button type="button" className="card-back-control" onClick={onBack}>
          <span aria-hidden>←</span>
          <span>{backLabel.replace("← ", "")}</span>
        </button>
        <div className="card-navigation">
          <button
            type="button"
            className="card-nav-button"
            onClick={onPrevious}
            disabled={index === 0}
            aria-label="Fiche précédente"
          >
            <span aria-hidden>←</span>
            <span className="card-nav-label">Précédente</span>
          </button>
          <span className="card-counter" aria-live="polite">
            <span className="card-counter-label">Fiche</span>
            <strong>{index + 1}</strong>
            <span aria-hidden>/</span>
            <span>{total}</span>
          </span>
          <button
            type="button"
            className="card-nav-button"
            onClick={onNext}
            disabled={index === total - 1}
            aria-label="Fiche suivante"
          >
            <span className="card-nav-label">Suivante</span>
            <span aria-hidden>→</span>
          </button>
        </div>
      </nav>

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
