import { useCallback, useEffect, useState } from "react";
import { api } from "../../api.js";
import { ConfirmDialog } from "./ConfirmDialog.jsx";
import { Pager } from "./Pager.jsx";
import {
  VISIBILITY_LABEL,
  describeDeckImpact,
  formatBytes,
  formatDateTime,
} from "../../lib/adminFormat.js";
import { VISIBILITY_ORDER } from "../../lib/visibility.js";

/**
 * Inspection des contenus : decks, proprietaires, volumes, suppression bornee.
 * Les seules actions offertes sont celles que les regles metier autorisent deja
 * a un administrateur (visibilite, suppression) : la console n'ouvre aucune
 * edition de colonne brute.
 */
export function AdminDecks() {
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [pendingDeletion, setPendingDeletion] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    api.admin
      .listDecks({ q: query, offset })
      .then(setPage)
      .catch((e) => setError(e.message));
  }, [query, offset]);

  useEffect(() => {
    load();
  }, [load]);

  const changeVisibility = async (deck, visibility) => {
    if (visibility === deck.visibility) return;
    setBusyId(deck.id);
    setActionError(null);
    setMessage(null);
    try {
      await api.changeDeckVisibility(deck.id, visibility);
      setMessage(`Visibilité de « ${deck.title} » : ${VISIBILITY_LABEL[visibility]}.`);
      load();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const askDeletion = async (deck) => {
    setActionError(null);
    setMessage(null);
    setDeleteError(null);
    try {
      const { impact } = await api.admin.getDeckImpact(deck.id);
      setPendingDeletion({ deck, impact });
    } catch (e) {
      setActionError(e.message);
    }
  };

  const confirmDeletion = async () => {
    const { deck } = pendingDeletion;
    setBusyId(deck.id);
    setDeleteError(null);
    try {
      const result = await api.admin.deleteDeck(deck.id);
      setPendingDeletion(null);
      const failed = result.assetCleanup?.failed ?? [];
      setMessage(
        `Deck « ${deck.title} » supprimé.` +
          (failed.length ? " Attention : ses fichiers n'ont pas pu être retirés." : ""),
      );
      setOffset(0);
      load();
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  if (error)
    return (
      <p className="msg error" role="alert">
        Impossible de charger les contenus : {error}
      </p>
    );
  if (!page)
    return (
      <p className="msg" role="status">
        Chargement des contenus…
      </p>
    );

  return (
    <section aria-labelledby="admin-decks-heading">
      <h2 id="admin-decks-heading">Contenus</h2>

      <form
        className="admin-search"
        onSubmit={(event) => {
          event.preventDefault();
          setOffset(0);
          load();
        }}
      >
        <label htmlFor="admin-decks-search">Chercher un deck par titre ou identifiant</label>
        <input
          id="admin-decks-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOffset(0);
          }}
          autoComplete="off"
          placeholder="titre ou identifiant"
        />
      </form>

      {message && (
        <p className="msg compact success" role="status">
          {message}
        </p>
      )}
      {actionError && (
        <p className="msg compact error" role="alert">
          Action impossible : {actionError}
        </p>
      )}

      <div className="admin-table-scroll">
        <table className="admin-table">
          <caption>
            {page.total} deck{page.total > 1 ? "s" : ""} — affichage {page.offset + 1} à{" "}
            {page.offset + page.decks.length}
          </caption>
          <thead>
            <tr>
              <th scope="col">Deck</th>
              <th scope="col">Propriétaire</th>
              <th scope="col">Fiches</th>
              <th scope="col">Contenu</th>
              <th scope="col">Assets</th>
              <th scope="col">Lecteurs</th>
              <th scope="col">Mis à jour</th>
              <th scope="col">Visibilité</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {page.decks.map((deck) => {
              const busy = busyId === deck.id;
              return (
                <tr key={deck.id}>
                  <th scope="row" className="admin-cell-deck">
                    {deck.title}
                    <span className="admin-cell-detail"> {deck.id}</span>
                  </th>
                  {/* Un deck sans proprietaire est un etat normal : deck d'origine
                      ou compte supprime dont le contenu partage a ete conserve. */}
                  <td>
                    {deck.ownerEmail ?? <span className="admin-cell-detail">sans compte</span>}
                  </td>
                  <td>{deck.cardCount}</td>
                  <td>{formatBytes(deck.dataBytes)}</td>
                  <td>{formatBytes(deck.assetBytes)}</td>
                  <td>
                    {deck.progressCount}
                    <span className="admin-cell-detail"> ({deck.reviewCount} rév.)</span>
                  </td>
                  <td>{formatDateTime(deck.updatedAt)}</td>
                  <td>
                    <label className="sr-only" htmlFor={`vis-${deck.id}`}>
                      Visibilité de {deck.title}
                    </label>
                    <select
                      id={`vis-${deck.id}`}
                      value={deck.visibility}
                      disabled={busy}
                      onChange={(event) => changeVisibility(deck, event.target.value)}
                    >
                      {VISIBILITY_ORDER.map((visibility) => (
                        <option key={visibility} value={visibility}>
                          {VISIBILITY_LABEL[visibility]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="admin-cell-actions">
                    <button
                      type="button"
                      className="btn-danger"
                      disabled={busy}
                      onClick={() => askDeletion(deck)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {page.decks.length === 0 && <p className="msg">Aucun deck pour cette recherche.</p>}

      <Pager page={page} onOffset={setOffset} label="contenus" />

      {pendingDeletion && (
        <ConfirmDialog
          title={`Supprimer le deck « ${pendingDeletion.deck.title} » ?`}
          confirmValue={pendingDeletion.deck.id}
          impactLines={describeDeckImpact(pendingDeletion.impact)}
          busy={busyId === pendingDeletion.deck.id}
          error={deleteError}
          onConfirm={confirmDeletion}
          onCancel={() => {
            setPendingDeletion(null);
            setDeleteError(null);
          }}
        />
      )}
    </section>
  );
}
