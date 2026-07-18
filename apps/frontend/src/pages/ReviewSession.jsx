import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { CardView } from "../components/CardView.jsx";

// Vue "Revisions du jour" : enchaine les fiches dues, tous decks confondus.
export function ReviewSession() {
  const [due, setDue] = useState(null); // liste des fiches dues
  const [index, setIndex] = useState(0);
  const [card, setCard] = useState(null); // fiche complete courante
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getDueReviews()
      .then(setDue)
      .catch((e) => setError(e.message));
  }, []);

  // Charge la fiche complete courante quand l'index change.
  useEffect(() => {
    if (!due || due.length === 0 || index >= due.length) return;
    const { deckId, cardId } = due[index];
    setCard(null);
    api
      .getCard(deckId, cardId)
      .then(setCard)
      .catch((e) => setError(e.message));
  }, [due, index]);

  if (error) return <p className="msg error">{error}</p>;
  if (!due) return <p className="msg">Chargement…</p>;

  if (due.length === 0) {
    return (
      <section className="review-done">
        <Link to="/" className="back-link">
          ← Accueil
        </Link>
        <h1>Rien à réviser 🎉</h1>
        <p className="muted">Aucune fiche n'est due aujourd'hui. Revenez plus tard !</p>
      </section>
    );
  }

  if (index >= due.length) {
    return (
      <section className="review-done">
        <Link to="/" className="back-link">
          ← Accueil
        </Link>
        <h1>Révisions terminées 🎉</h1>
        <p className="muted">
          {due.length} fiche{due.length > 1 ? "s" : ""} révisée{due.length > 1 ? "s" : ""}. Beau
          travail !
        </p>
      </section>
    );
  }

  if (!card) return <p className="msg">Chargement de la fiche…</p>;

  const current = due[index];
  const isLast = index === due.length - 1;

  return (
    <CardView
      card={card}
      deckId={current.deckId}
      index={index}
      total={due.length}
      isLast={isLast}
      backLabel="← Accueil"
      nextLabel="Valider la révision & suivante →"
      lastLabel="Valider la dernière révision"
      onSeen={() => {}}
      onBack={() => navigate("/")}
      onLearnAndNext={(quizScore) => {
        // Enregistre la revision (reprogrammation SM-2) puis passe a la suivante.
        api
          .reviewCard(current.deckId, current.cardId, quizScore)
          .catch((e) => console.warn("Révision non synchronisée :", e.message));
        setIndex((i) => i + 1);
      }}
    />
  );
}
