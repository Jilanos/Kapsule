import { useCallback, useEffect, useState } from "react";
import { api } from "../../api.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { ConfirmDialog } from "./ConfirmDialog.jsx";
import { Pager } from "./Pager.jsx";
import { ROLES, ROLE_LABEL, describeUserImpact, formatDateTime } from "../../lib/adminFormat.js";

/**
 * Gestion des comptes : recherche, roles, suppression.
 * Le masquage d'une action ici n'est jamais une garantie : chaque mutation est
 * revalidee par le serveur, qui reste seul juge des invariants (dernier
 * administrateur, auto-modification).
 */
export function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  // Role selectionne mais pas encore applique, par compte.
  const [draftRoles, setDraftRoles] = useState({});
  // Compte en cours de suppression : { user, impact }.
  const [pendingDeletion, setPendingDeletion] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    api.admin
      .listUsers({ q: query, offset })
      .then((data) => {
        setPage(data);
        setDraftRoles({});
      })
      .catch((e) => setError(e.message));
  }, [query, offset]);

  useEffect(() => {
    load();
  }, [load]);

  const applyRole = async (target) => {
    const nextRole = draftRoles[target.id] ?? target.role;
    if (nextRole === target.role) return;
    setBusyId(target.id);
    setActionError(null);
    setMessage(null);
    try {
      await api.admin.setUserRole(target.id, nextRole);
      setMessage(`Rôle de ${target.email} : ${ROLE_LABEL[nextRole]}.`);
      load();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  // L'impact est demande au serveur avant d'ouvrir la confirmation : la
  // decision se prend sur des chiffres a jour, pas sur ceux du dernier listing.
  const askDeletion = async (target) => {
    setActionError(null);
    setMessage(null);
    setDeleteError(null);
    try {
      const { user } = await api.admin.getUser(target.id);
      setPendingDeletion({ user, impact: user.impact });
    } catch (e) {
      setActionError(e.message);
    }
  };

  const confirmDeletion = async () => {
    const target = pendingDeletion.user;
    setBusyId(target.id);
    setDeleteError(null);
    try {
      const result = await api.admin.deleteUser(target.id);
      setPendingDeletion(null);
      const failed = result.assetCleanup?.failed ?? [];
      setMessage(
        `Compte ${target.email} supprimé.` +
          (failed.length
            ? ` Attention : les fichiers de ${failed.length} deck(s) n'ont pas pu être retirés.`
            : ""),
      );
      // La suppression peut vider la page courante : on revient au debut.
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
        Impossible de charger les comptes : {error}
      </p>
    );
  if (!page)
    return (
      <p className="msg" role="status">
        Chargement des comptes…
      </p>
    );

  return (
    <section aria-labelledby="admin-users-heading">
      <h2 id="admin-users-heading">Comptes</h2>

      <form
        className="admin-search"
        onSubmit={(event) => {
          event.preventDefault();
          setOffset(0);
          load();
        }}
      >
        <label htmlFor="admin-users-search">Chercher un compte par email</label>
        <input
          id="admin-users-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOffset(0);
          }}
          autoComplete="off"
          placeholder="exemple@domaine.fr"
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
            {page.total} compte{page.total > 1 ? "s" : ""} — affichage {page.offset + 1} à{" "}
            {page.offset + page.users.length}
          </caption>
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">Rôle</th>
              <th scope="col">Créé le</th>
              <th scope="col">Dernière activité</th>
              <th scope="col">Decks</th>
              <th scope="col">Progression</th>
              <th scope="col">Sessions</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {page.users.map((account) => {
              const isSelf = account.id === currentUser?.id;
              const draft = draftRoles[account.id] ?? account.role;
              const busy = busyId === account.id;
              return (
                <tr key={account.id}>
                  <th scope="row" className="admin-cell-email">
                    {account.email}
                    {isSelf && <span className="admin-self-badge"> (vous)</span>}
                  </th>
                  <td>{ROLE_LABEL[account.role] ?? account.role}</td>
                  <td>{formatDateTime(account.createdAt)}</td>
                  <td>{formatDateTime(account.lastSeenAt)}</td>
                  <td>
                    {account.deckCount}
                    <span className="admin-cell-detail">
                      {" "}
                      ({account.privateDeckCount} privé{account.privateDeckCount > 1 ? "s" : ""},{" "}
                      {account.sharedDeckCount} partagé{account.sharedDeckCount > 1 ? "s" : ""})
                    </span>
                  </td>
                  <td>
                    {account.progressCount}
                    <span className="admin-cell-detail"> ({account.reviewCount} rév.)</span>
                  </td>
                  <td>{account.sessionCount}</td>
                  <td className="admin-cell-actions">
                    <label className="sr-only" htmlFor={`role-${account.id}`}>
                      Rôle de {account.email}
                    </label>
                    <select
                      id={`role-${account.id}`}
                      value={draft}
                      disabled={isSelf || busy}
                      onChange={(event) =>
                        setDraftRoles((prev) => ({ ...prev, [account.id]: event.target.value }))
                      }
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABEL[role]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="link-btn"
                      disabled={isSelf || busy || draft === account.role}
                      onClick={() => applyRole(account)}
                    >
                      Appliquer
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      disabled={isSelf || busy}
                      onClick={() => askDeletion(account)}
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

      {page.users.length === 0 && <p className="msg">Aucun compte pour cette recherche.</p>}

      <Pager page={page} onOffset={setOffset} label="comptes" />

      {pendingDeletion && (
        <ConfirmDialog
          title={`Supprimer le compte ${pendingDeletion.user.email} ?`}
          confirmValue={pendingDeletion.user.id}
          impactLines={describeUserImpact(pendingDeletion.impact)}
          busy={busyId === pendingDeletion.user.id}
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
