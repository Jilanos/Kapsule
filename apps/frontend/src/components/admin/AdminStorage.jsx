import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { UNAVAILABLE, formatBytes, formatUsage } from "../../lib/adminFormat.js";

/**
 * Apercu du stockage et compteurs de donnees.
 * Volontairement limite a des categories et des octets : ni chemin, ni nom de
 * fichier, ni acces au contenu (req_015 AC7). Une categorie non mesurable est
 * annoncee « indisponible » plutot que ramenee a zero.
 */
export function AdminStorage() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.admin
      .storage()
      .then(setOverview)
      .catch((e) => setError(e.message));
  }, []);

  if (error)
    return (
      <p className="msg error" role="alert">
        Impossible de charger l'aperçu de stockage : {error}
      </p>
    );
  if (!overview)
    return (
      <p className="msg" role="status">
        Mesure du stockage…
      </p>
    );

  const categories = [
    {
      key: "database",
      label: "Base de données",
      value: formatUsage(overview.database),
      note: "Fichier SQLite et ses journaux WAL.",
    },
    {
      key: "uploads",
      label: "Images de fiches",
      value: formatUsage(overview.uploads),
      note:
        overview.uploads?.available === true
          ? `${overview.uploads.fileCount} fichier${overview.uploads.fileCount > 1 ? "s" : ""}.`
          : "Aucun volume d'images monté.",
    },
    {
      key: "backups",
      label: "Sauvegardes",
      value: formatUsage(overview.backups),
      note:
        overview.backups?.available === true
          ? `${overview.backups.fileCount} sauvegarde${overview.backups.fileCount > 1 ? "s" : ""} conservée(s).`
          : "Aucune sauvegarde accessible depuis l'application.",
    },
    {
      key: "deckData",
      label: "JSON des decks",
      value: formatBytes(overview.deckDataBytes),
      note: "Contenu des decks stocké en base, inclus dans la base ci-dessus.",
    },
  ];

  const counts = [
    ["Comptes", overview.counts.users],
    ["dont administrateurs", overview.counts.admins],
    ["Decks", overview.counts.decks],
    ["Fiches", overview.counts.cards],
    ["Lignes de progression", overview.counts.progress],
    ["Révisions programmées", overview.counts.reviews],
    ["Sessions actives", overview.counts.sessions],
    ["Événements d'audit", overview.counts.auditEvents],
  ];

  return (
    <section aria-labelledby="admin-storage-heading">
      <h2 id="admin-storage-heading">Stockage</h2>

      <ul className="admin-storage-grid">
        {categories.map((category) => (
          <li key={category.key} className="admin-storage-card">
            <span className="admin-storage-label">{category.label}</span>
            <span
              className={`admin-storage-value${category.value === UNAVAILABLE ? " admin-storage-unavailable" : ""}`}
            >
              {category.value}
            </span>
            <span className="admin-storage-note">{category.note}</span>
          </li>
        ))}
      </ul>

      <h3>Compteurs de données</h3>
      <div className="admin-table-scroll">
        <table className="admin-table admin-table-counts">
          <caption className="sr-only">Nombre d'enregistrements par catégorie</caption>
          <thead>
            <tr>
              <th scope="col">Catégorie</th>
              <th scope="col">Nombre</th>
            </tr>
          </thead>
          <tbody>
            {counts.map(([label, value]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
