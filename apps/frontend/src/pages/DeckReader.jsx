import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { CardView } from "../components/CardView.jsx";

const STATE_LABEL = {
  learned: "Apprise",
  seen: "Vue",
  unseen: "",
};

export function DeckReader() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [progress, setProgress] = useState({}); // cardId -> { state, quizScore }
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null); // null = vue d'ensemble

  useEffect(() => {
    api
      .getDeck(deckId)
      .then((data) => {
        setDeck(data.deck);
        setProgress(data.progress ?? {});
      })
      .catch((e) => setError(e.message));
  }, [deckId]);

  // Met a jour la progression (local en slice 3 ; persiste via l'API en slice 4).
  const setCardState = useCallback((cardId, state, quizScore = null) => {
    setProgress((prev) => {
      // Ne pas retrograder learned -> seen.
      if (prev[cardId]?.state === "learned" && state === "seen") return prev;
      return { ...prev, [cardId]: { state, quizScore } };
    });
  }, []);

  if (error) return <p className="msg error">{error}</p>;
  if (!deck) return <p className="msg">Chargement…</p>;

  const cards = deck.cards;
  const learnedCount = cards.filter((c) => progress[c.id]?.state === "learned").length;

  // --- Lecture d'une fiche -------------------------------------------------
  if (activeIndex !== null) {
    const card = cards[activeIndex];
    const isLast = activeIndex === cards.length - 1;
    return (
      <CardView
        card={card}
        deckId={deckId}
        index={activeIndex}
        total={cards.length}
        isLast={isLast}
        onSeen={() => setCardState(card.id, "seen")}
        onBack={() => setActiveIndex(null)}
        onLearnAndNext={(quizScore) => {
          setCardState(card.id, "learned", quizScore);
          if (isLast) setActiveIndex(null);
          else setActiveIndex(activeIndex + 1);
        }}
      />
    );
  }

  // --- Vue d'ensemble du deck ---------------------------------------------
  const firstUnlearned = cards.findIndex((c) => progress[c.id]?.state !== "learned");
  return (
    <section>
      <Link to="/" className="back-link">← Tous les decks</Link>
      <h1>{deck.title}</h1>
      {deck.description && <p className="muted">{deck.description}</p>}
      <p className="deck-summary">
        {learnedCount}/{cards.length} fiches apprises
      </p>

      <button
        type="button"
        className="btn-primary"
        onClick={() => setActiveIndex(firstUnlearned === -1 ? 0 : firstUnlearned)}
      >
        {learnedCount === 0
          ? "Commencer"
          : learnedCount === cards.length
            ? "Revoir depuis le début"
            : "Continuer"}
      </button>

      <ol className="card-overview">
        {cards.map((c, i) => {
          const state = progress[c.id]?.state ?? "unseen";
          return (
            <li key={c.id}>
              <button
                type="button"
                className={`card-row state-${state}`}
                onClick={() => setActiveIndex(i)}
              >
                <span className={`state-dot state-${state}`} aria-hidden />
                <span className="card-row-title">{c.title}</span>
                <span className="card-row-meta muted">
                  {c.durationMin ? `${c.durationMin} min` : ""}
                  {STATE_LABEL[state] ? ` · ${STATE_LABEL[state]}` : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
