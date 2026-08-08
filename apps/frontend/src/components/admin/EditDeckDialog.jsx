import { useEffect, useId, useRef, useState } from "react";
import { VISIBILITY_LABEL } from "../../lib/adminFormat.js";
import { VISIBILITY_ORDER } from "../../lib/visibility.js";

// Bornes miroir de `parseDeckMetadataPatch` (backend) et de
// packages/schema/deck.schema.json. Elles sont ici pour informer l'operateur
// avant l'envoi ; le refus qui fait autorite reste celui du serveur.
export const DECK_TITLE_MAX = 120;
export const DECK_DESCRIPTION_MAX = 500;

/**
 * Edition bornee des metadonnees d'un deck (item_032 AC4).
 *
 * Le formulaire n'expose que les trois champs que la route admin accepte :
 * titre, description, visibilite. L'identifiant et le proprietaire sont
 * affiches en lecture seule pour que l'operateur sache sur quoi il agit, sans
 * qu'aucun champ ne laisse croire qu'ils sont modifiables.
 *
 * Comme `ConfirmDialog`, s'appuie sur `<dialog>` native : piege de focus,
 * retour au declencheur et fermeture par Echap viennent de la plateforme.
 *
 * @param {{
 *   deck: {id: string, title: string, description: string|null, visibility: string,
 *          ownerEmail?: string|null},
 *   busy?: boolean,
 *   error?: string|null,
 *   onSave: (patch: {title: string, description: string|null, visibility: string}) => void,
 *   onCancel: () => void,
 * }} props
 */
export function EditDeckDialog({ deck, busy = false, error = null, onSave, onCancel }) {
  const dialogRef = useRef(null);
  const [title, setTitle] = useState(deck.title ?? "");
  const [description, setDescription] = useState(deck.description ?? "");
  const [visibility, setVisibility] = useState(deck.visibility);
  const titleId = useId();
  const fieldId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog?.showModal) return; // environnement sans <dialog> : rendu inerte
    dialog.showModal();
    return () => dialog.close();
  }, []);

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

  const trimmedTitle = title.trim();
  const tooLong = trimmedTitle.length > DECK_TITLE_MAX || description.length > DECK_DESCRIPTION_MAX;
  const canSave = trimmedTitle.length > 0 && !tooLong && !busy;

  return (
    <dialog ref={dialogRef} className="admin-dialog" aria-labelledby={titleId}>
      <form
        method="dialog"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSave) return;
          // Une description vide part en `null` : c'est l'etat « absente » que
          // le serveur persiste, plutot qu'une chaine vide.
          onSave({
            title: trimmedTitle,
            description: description.trim() === "" ? null : description.trim(),
            visibility,
          });
        }}
      >
        <h2 id={titleId}>Modifier le deck</h2>

        <p className="admin-dialog-scope">
          Identifiant <code>{deck.id}</code>
          {deck.ownerEmail ? ` — propriétaire ${deck.ownerEmail}` : " — sans propriétaire"}. Ces
          informations, les fiches et les assets ne sont pas modifiables ici.
        </p>

        <label className="admin-dialog-field" htmlFor={`${fieldId}-title`}>
          <span>Titre</span>
          <input
            id={`${fieldId}-title`}
            type="text"
            value={title}
            maxLength={DECK_TITLE_MAX}
            required
            disabled={busy}
            onChange={(event) => setTitle(event.target.value)}
            autoComplete="off"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
        </label>

        <label className="admin-dialog-field" htmlFor={`${fieldId}-description`}>
          <span>Description</span>
          <textarea
            id={`${fieldId}-description`}
            rows={4}
            value={description}
            maxLength={DECK_DESCRIPTION_MAX}
            disabled={busy}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <label className="admin-dialog-field" htmlFor={`${fieldId}-visibility`}>
          <span>Visibilité</span>
          <select
            id={`${fieldId}-visibility`}
            value={visibility}
            disabled={busy}
            onChange={(event) => setVisibility(event.target.value)}
          >
            {VISIBILITY_ORDER.map((value) => (
              <option key={value} value={value}>
                {VISIBILITY_LABEL[value]}
              </option>
            ))}
          </select>
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
          <button type="submit" className="btn-primary" disabled={!canSave}>
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>

        {trimmedTitle.length === 0 && (
          <p className="admin-dialog-hint" role="status">
            Le titre ne peut pas être vide.
          </p>
        )}
      </form>
    </dialog>
  );
}
