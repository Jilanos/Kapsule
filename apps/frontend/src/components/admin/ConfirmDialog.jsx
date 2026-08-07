import { useEffect, useId, useRef, useState } from "react";

/**
 * Confirmation d'une action destructrice.
 *
 * Deux exigences portees ici (req_015 AC5, item_025 AC4) :
 *  - l'impact est affiche *avant* que le bouton de confirmation soit utilisable ;
 *  - la confirmation exige la saisie de l'identifiant de la cible, de sorte
 *    qu'un clic seul ou une frappe au mauvais endroit ne suffise pas.
 *
 * S'appuie sur `<dialog>` native : piege de focus, retour au declencheur et
 * fermeture par Echap sont fournis par la plateforme plutot que reimplementes.
 *
 * @param {{
 *   title: string,
 *   confirmValue: string,        identifiant a retaper
 *   confirmLabel?: string,
 *   impactLines: string[],
 *   busy?: boolean,
 *   error?: string|null,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 * }} props
 */
export function ConfirmDialog({
  title,
  confirmValue,
  confirmLabel = "Supprimer définitivement",
  impactLines,
  busy = false,
  error = null,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const [typed, setTyped] = useState("");
  const titleId = useId();
  const impactId = useId();
  const inputId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog?.showModal) return; // environnement sans <dialog> : rendu inerte
    dialog.showModal();
    return () => dialog.close();
  }, []);

  // Echap et le bouton systeme de fermeture passent par l'evenement `cancel`.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onDialogCancel = (event) => {
      event.preventDefault();
      if (!busy) onCancel();
    };
    dialog.addEventListener("cancel", onDialogCancel);
    return () => dialog.removeEventListener("cancel", onDialogCancel);
  }, [busy, onCancel]);

  const matches = typed.trim() === confirmValue;

  return (
    <dialog ref={dialogRef} className="admin-dialog" aria-labelledby={titleId}>
      <form
        method="dialog"
        onSubmit={(event) => {
          event.preventDefault();
          if (matches && !busy) onConfirm();
        }}
      >
        <h2 id={titleId}>{title}</h2>
        <div id={impactId} className="admin-dialog-impact">
          <p>Cette action est irréversible. Elle va produire les effets suivants :</p>
          <ul>
            {impactLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <label className="admin-dialog-field" htmlFor={inputId}>
          <span>
            Pour confirmer, saisissez <code>{confirmValue}</code>
          </span>
          <input
            id={inputId}
            type="text"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            spellCheck="false"
            aria-describedby={impactId}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
        </label>
        {error && (
          <p className="msg compact error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-dialog-actions">
          <button type="button" className="link-btn" onClick={onCancel} disabled={busy}>
            Annuler
          </button>
          <button type="submit" className="btn-danger" disabled={!matches || busy}>
            {busy ? "Suppression…" : confirmLabel}
          </button>
        </div>
        {!matches && (
          <p className="admin-dialog-hint" role="status">
            L'identifiant saisi ne correspond pas encore.
          </p>
        )}
      </form>
    </dialog>
  );
}
