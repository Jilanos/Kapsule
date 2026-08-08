import { useRef, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { VISIBILITY_LABEL, creatableVisibilities } from "../lib/visibility.js";

/**
 * Import d'un deck : upload d'un .json ou collage du JSON, validation via l'API.
 * @param {{ onImported: () => void }} props
 */
export function ImportDeck({ onImported }) {
  const { user } = useAuth();
  const choices = creatableVisibilities(user?.role);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState(choices[0]);
  const [errors, setErrors] = useState(null);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const reset = () => {
    setText("");
    setErrors(null);
    setMessage(null);
  };

  const submit = async (raw) => {
    setErrors(null);
    setMessage(null);
    let deck;
    try {
      deck = JSON.parse(raw);
    } catch (e) {
      setErrors([{ path: "(JSON)", message: `JSON illisible : ${e.message}` }]);
      return;
    }
    setBusy(true);
    try {
      const { deck: saved } = await api.importDeck(deck, visibility);
      setMessage(`Deck « ${saved.title} » importé (${saved.cards.length} fiches).`);
      setText("");
      onImported?.();
    } catch (e) {
      // 422 : rapport de validation ; autre : message generique.
      setErrors(e.body?.details ?? [{ path: "(erreur)", message: e.message }]);
    } finally {
      setBusy(false);
    }
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => submit(String(reader.result));
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!open) {
    return (
      <div className="deck-create-actions">
        <button type="button" className="import-toggle" onClick={() => setOpen(true)}>
          + Importer un deck
        </button>
        <a
          className="import-toggle generate-deck-link"
          href="https://gnosis.paulmondou.fr"
          aria-label="Générer un deck avec Gnosis"
          title="Générer un deck avec Gnosis"
        >
          <img src="/brand/gnosis.svg" alt="" aria-hidden="true" />
          Générer un deck
        </a>
      </div>
    );
  }

  return (
    <div className="import-panel">
      <div className="import-head">
        <strong>Importer un deck</strong>
        <button
          type="button"
          className="back-link"
          onClick={() => {
            setOpen(false);
            reset();
          }}
        >
          Fermer
        </button>
      </div>

      {choices.length > 1 ? (
        <label className="import-visibility">
          Visibilité du deck
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            {choices.map((v) => (
              <option key={v} value={v}>
                {VISIBILITY_LABEL[v]}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="import-visibility-note muted">
          Ce deck sera <strong>privé</strong> : visible par vous seul.
        </p>
      )}

      <div className="import-actions">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}>
          Choisir un fichier .json
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} hidden />
      </div>

      <textarea
        className="import-textarea"
        placeholder="…ou collez ici le JSON du deck"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
      />
      <button
        type="button"
        className="btn-primary"
        disabled={busy || !text.trim()}
        onClick={() => submit(text)}
      >
        {busy ? "Import…" : "Importer"}
      </button>

      {message && <p className="import-success">{message}</p>}
      {errors && (
        <div className="import-errors">
          <p>Deck refusé — {errors.length} erreur(s) :</p>
          <ul>
            {errors.map((e, i) => (
              <li key={i}>
                <code>{e.path}</code> : {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
