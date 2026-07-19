import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { ImportDeck } from "../components/ImportDeck.jsx";
import { VISIBILITY_LABEL } from "../lib/visibility.js";

export function DeckList() {
  const [decks, setDecks] = useState(null);
  const [dueCount, setDueCount] = useState(0);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    api
      .listDecks()
      .then(setDecks)
      .catch((e) => setError(e.message));
    api
      .getDueReviews()
      .then((due) => setDueCount(due.length))
      .catch(() => setDueCount(0));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error)
    return (
      <p className="msg error" role="alert">
        Impossible de charger les decks : {error}
      </p>
    );
  if (!decks)
    return (
      <p className="msg" role="status">
        Chargement…
      </p>
    );

  return (
    <section>
      {dueCount > 0 && (
        <Link to="/reviews" className="review-banner">
          <span className="review-banner-count">{dueCount}</span>
          <span>fiche{dueCount > 1 ? "s" : ""} à réviser aujourd'hui</span>
          <span className="review-banner-cta">Réviser →</span>
        </Link>
      )}
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
              <span className="deck-ref">{deckRef(d.id)}</span>
              <div className="deck-card-head">
                <h2>{d.title}</h2>
                {d.visibility && d.visibility !== "general" && (
                  <span className={`visibility-badge vis-${d.visibility}`}>
                    {VISIBILITY_LABEL[d.visibility]}
                  </span>
                )}
              </div>
              {d.description && <p className="deck-desc">{d.description}</p>}
              <div className="deck-meta">
                <Graduations learned={d.progress.learned} total={d.cardCount} />
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

// Cote de monographie : identifiant court et stable derive de l'id du deck
// (metaphore « cahier de laboratoire »). Deterministe, sans appel backend.
function deckRef(id) {
  let h = 0;
  for (let i = 0; i < String(id).length; i++) {
    h = (h * 31 + String(id).charCodeAt(i)) >>> 0;
  }
  return `KPS·${String(h % 1000).padStart(3, "0")}`;
}

// Barre de graduation : une graduation par fiche (plafonnee), les fiches
// apprises en encre pleine, les restantes en filet. Remplace la barre-pilule.
const GRAD_CAP = 24;
function Graduations({ learned, total }) {
  const pct = total ? Math.round((learned / total) * 100) : 0;
  const ticks = Math.min(total, GRAD_CAP) || 1;
  const on = total ? Math.round((learned / total) * ticks) : 0;
  return (
    <div
      className="grad"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={`${learned} sur ${total} fiches apprises (${pct}%)`}
    >
      {Array.from({ length: ticks }, (_, i) => (
        <span key={i} className={`grad-tick${i < on ? " on" : ""}`} aria-hidden />
      ))}
    </div>
  );
}
