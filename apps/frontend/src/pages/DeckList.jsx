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
                <Graduations
                  learned={d.progress.learned}
                  due={d.dueCount ?? 0}
                  total={d.cardCount}
                />
                {d.retentionSeries?.length >= 2 && (
                  <RetentionTrace series={d.retentionSeries} retention={d.retention} />
                )}
                <span className="deck-count">{deckLegend(d)}</span>
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

// Legende textuelle des etats d'un deck (accessible sans la trace, AC5) :
// « N acquises · N dues · N non lues [· rétention ~NN %] ».
function deckLegend(d) {
  const total = d.cardCount;
  const due = Math.min(d.dueCount ?? 0, d.progress.learned);
  const acquired = Math.max(0, d.progress.learned - due);
  const unseen = Math.max(0, total - d.progress.learned);
  const parts = [`${acquired} acquise${acquired > 1 ? "s" : ""}`];
  if (due > 0) parts.push(`${due} due${due > 1 ? "s" : ""}`);
  parts.push(`${unseen} non lue${unseen > 1 ? "s" : ""}`);
  if (d.retention != null) parts.push(`rétention ~${Math.round(d.retention * 100)} %`);
  return parts.join(" · ");
}

// Barre de graduation : une graduation par fiche (plafonnee). Trois etats :
// acquises (encre pleine), dues a reviser (rouge d'annotation), restantes
// (filet). Remplace la barre-pilule.
const GRAD_CAP = 24;
function Graduations({ learned, due, total }) {
  const pct = total ? Math.round((learned / total) * 100) : 0;
  const ticks = Math.min(total, GRAD_CAP) || 1;
  const scale = (n) => (total ? Math.round((n / total) * ticks) : 0);
  const dueClamped = Math.min(due ?? 0, learned);
  const onCount = scale(learned - dueClamped); // acquises non dues
  const dueCount = scale(learned) - onCount; // dues (derive pour rester coherent avec onCount)
  const label =
    `${learned - dueClamped} acquises` +
    (dueClamped > 0 ? `, ${dueClamped} a reviser` : "") +
    `, ${total - learned} non lues (${pct}% apprises)`;
  return (
    <div
      className="grad"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
    >
      {Array.from({ length: ticks }, (_, i) => {
        let cls = "grad-tick";
        if (i < onCount) cls += " on";
        else if (i < onCount + dueCount) cls += " due";
        return <span key={i} className={cls} aria-hidden />;
      })}
    </div>
  );
}

// Trace de retention : courbe de decroissance estimee (present -> futur).
// Encre de Prusse tant que la retention tient, rouge d'annotation sous le
// seuil. SVG inline, sans librairie. Purement decorative : l'info chiffree est
// portee par la legende (deckLegend) et par aria-label.
const TRACE_W = 120;
const TRACE_H = 34;
const TRACE_PAD = 3;
const TRACE_THRESHOLD = 0.5;
function RetentionTrace({ series, retention }) {
  const n = series.length;
  const x = (i) => TRACE_PAD + (i / (n - 1)) * (TRACE_W - 2 * TRACE_PAD);
  const y = (r) => TRACE_PAD + (1 - r) * (TRACE_H - 2 * TRACE_PAD);
  const segments = [];
  for (let i = 0; i < n - 1; i++) {
    segments.push({
      x1: x(i),
      y1: y(series[i]),
      x2: x(i + 1),
      y2: y(series[i + 1]),
      low: series[i] < TRACE_THRESHOLD || series[i + 1] < TRACE_THRESHOLD,
    });
  }
  const pct = retention != null ? Math.round(retention * 100) : Math.round(series[0] * 100);
  return (
    <svg
      className="retention-trace"
      viewBox={`0 0 ${TRACE_W} ${TRACE_H}`}
      width="100%"
      height={TRACE_H}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Courbe de rétention estimée : ${pct}% aujourd'hui, en déclin sur ${
        n - 1
      } jours sans révision`}
    >
      <line
        className="trace-threshold"
        x1={TRACE_PAD}
        y1={y(TRACE_THRESHOLD)}
        x2={TRACE_W - TRACE_PAD}
        y2={y(TRACE_THRESHOLD)}
      />
      {segments.map((s, i) => (
        <line
          key={i}
          className={s.low ? "trace-line trace-line-low" : "trace-line"}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
        />
      ))}
    </svg>
  );
}
