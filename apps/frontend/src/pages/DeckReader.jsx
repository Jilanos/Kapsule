import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";

// Version socle (slice 2) : charge le deck et liste ses fiches.
// Le lecteur de fiches complet est ajoute en slice 3.
export function DeckReader() {
  const { deckId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getDeck(deckId)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [deckId]);

  if (error) return <p className="msg error">{error}</p>;
  if (!data) return <p className="msg">Chargement…</p>;

  const { deck } = data;
  return (
    <section>
      <Link to="/" className="back-link">← Tous les decks</Link>
      <h1>{deck.title}</h1>
      <ol className="card-list">
        {deck.cards.map((c) => (
          <li key={c.id}>
            {c.title}
            {c.durationMin ? <span className="muted"> · {c.durationMin} min</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
