import { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { CardView } from "../components/CardView.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { VISIBILITY_LABEL, VISIBILITY_ORDER, isAdmin } from "../lib/visibility.js";

const STATE_LABEL = {
  learned: "Apprise",
  seen: "Vue",
  unseen: "",
};

export function DeckReader() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deck, setDeck] = useState(null);
  const [progress, setProgress] = useState({}); // cardId -> { state, quizScore }
  const [visibility, setVisibility] = useState(null);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null); // null = vue d'ensemble

  useEffect(() => {
    api
      .getDeck(deckId)
      .then((data) => {
        setDeck(data.deck);
        setProgress(data.progress ?? {});
        setVisibility(data.visibility ?? null);
      })
      .catch((e) => setError(e.message));
  }, [deckId]);

  const onDelete = useCallback(async () => {
    if (!window.confirm(`Supprimer définitivement le deck « ${deck?.title} » ?`)) return;
    try {
      await api.deleteDeck(deckId);
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  }, [deck, deckId, navigate]);

  const onChangeVisibility = useCallback(
    async (next) => {
      try {
        await api.changeDeckVisibility(deckId, next);
        setVisibility(next);
      } catch (e) {
        setError(e.message);
      }
    },
    [deckId],
  );

  // Met a jour la progression : mise a jour optimiste locale immediate, puis
  // persistance backend en arriere-plan (tolerant hors-ligne : un echec reseau
  // ne perd pas l'etat affiche).
  const setCardState = useCallback(
    (cardId, state, quizScore = null) => {
      let persist = true;
      setProgress((prev) => {
        // Ne pas retrograder learned -> seen (ni re-persister un no-op).
        if (prev[cardId]?.state === "learned" && state === "seen") {
          persist = false;
          return prev;
        }
        return { ...prev, [cardId]: { state, quizScore } };
      });
      if (persist) {
        api
          .setProgress(deckId, cardId, state, quizScore)
          .catch((e) => console.warn("Progression non synchronisee :", e.message));
      }
    },
    [deckId],
  );

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
      <div className="deck-title-row">
        <h1>{deck.title}</h1>
        {visibility && (
          <span className={`visibility-badge vis-${visibility}`}>
            {VISIBILITY_LABEL[visibility]}
          </span>
        )}
      </div>
      {deck.description && <p className="muted">{deck.description}</p>}

      {isAdmin(user?.role) && (
        <div className="admin-bar">
          <label className="admin-visibility">
            Visibilité
            <select value={visibility ?? "general"} onChange={(e) => onChangeVisibility(e.target.value)}>
              {VISIBILITY_ORDER.map((v) => (
                <option key={v} value={v}>
                  {VISIBILITY_LABEL[v]}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn-danger" onClick={onDelete}>
            Supprimer le deck
          </button>
        </div>
      )}
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
