import { useCallback, useEffect, useState } from "react";
import { api } from "../../api.js";
import { Pager } from "./Pager.jsx";
import {
  AUDIT_ACTION_LABEL,
  describeAuditTransition,
  formatDateTime,
} from "../../lib/adminFormat.js";

/**
 * Journal des actions d'administration, du plus recent au plus ancien.
 * Lecture seule : l'API n'expose aucune ecriture sur ce journal, la console ne
 * propose donc aucune action ici (item_025 AC5).
 */
export function AdminAudit() {
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    api.admin
      .listAudit({ offset })
      .then(setPage)
      .catch((e) => setError(e.message));
  }, [offset]);

  useEffect(() => {
    load();
  }, [load]);

  if (error)
    return (
      <p className="msg error" role="alert">
        Impossible de charger le journal : {error}
      </p>
    );
  if (!page)
    return (
      <p className="msg" role="status">
        Chargement du journal…
      </p>
    );

  return (
    <section aria-labelledby="admin-audit-heading">
      <h2 id="admin-audit-heading">Journal d'audit</h2>
      <p className="admin-hint">
        Trace en lecture seule des actions sensibles. Aucun secret n'y est consigné.
      </p>

      <div className="admin-table-scroll">
        <table className="admin-table">
          <caption>
            {page.total} événement{page.total > 1 ? "s" : ""} enregistré
            {page.total > 1 ? "s" : ""}
          </caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Action</th>
              <th scope="col">Administrateur</th>
              <th scope="col">Cible</th>
              <th scope="col">Changement</th>
            </tr>
          </thead>
          <tbody>
            {page.events.map((event) => (
              <tr key={event.id}>
                <th scope="row">{formatDateTime(event.createdAt)}</th>
                <td>{AUDIT_ACTION_LABEL[event.action] ?? event.action}</td>
                {/* L'email de l'acteur est un instantane : il reste lisible meme
                    si le compte a disparu depuis. */}
                <td>
                  {event.actorEmail ?? <span className="admin-cell-detail">compte supprimé</span>}
                </td>
                <td>
                  {event.targetLabel ?? event.targetId}
                  <span className="admin-cell-detail"> {event.targetType}</span>
                </td>
                <td>{describeAuditTransition(event) || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {page.events.length === 0 && <p className="msg">Aucune action enregistrée pour l'instant.</p>}

      <Pager page={page} onOffset={setOffset} label="événements" />
    </section>
  );
}
