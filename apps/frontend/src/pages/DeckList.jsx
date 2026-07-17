import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { ImportDeck } from "../components/ImportDeck.jsx";

export function DeckList() {
  const [decks, setDecks] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    api
      .listDecks()
      .then(setDecks)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="msg error">Impossible de charger les decks : {error}</p>;
  if (!decks) return <p className="msg">Chargement…</p>;

  return (
    <section>
      <div className="list-head">
        <h1>Vos decks</h1>
        <ImportDeck onImported={load} />
      </div>
      {decks.length === 0 && (
        <p className="msg">Aucun deck pour l'instant. Importez-en un pour commencer.</p>
      )}
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
