import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export function DeckList() {
  const [decks, setDecks] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listDecks()
      .then(setDecks)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="msg error">Impossible de charger les decks : {error}</p>;
  if (!decks) return <p className="msg">Chargement…</p>;
  if (decks.length === 0)
    return <p className="msg">Aucun deck pour l'instant. Importez-en un pour commencer.</p>;

  return (
    <section>
      <h1>Vos decks</h1>
      <ul className="deck-grid">
        {decks.map((d) => (
          <li key={d.id}>
            <Link to={`/decks/${d.id}`} className="deck-card">
              <h2>{d.title}</h2>
              {d.description && <p className="deck-desc">{d.description}</p>}
              <div className="deck-meta">
                <ProgressBar learned={d.progress.learned} total={d.cardCount} />
                <span className="deck-count">
                  {d.progress.learned}/{d.cardCount} apprises
                </span>
              </div>
              {d.tags?.length > 0 && (
                <div className="tags">
                  {d.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProgressBar({ learned, total }) {
  const pct = total ? Math.round((learned / total) * 100) : 0;
  return (
    <div className="progress" aria-label={`${pct}% appris`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
