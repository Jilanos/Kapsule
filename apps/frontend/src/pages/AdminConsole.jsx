import { useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { AdminUsers } from "../components/admin/AdminUsers.jsx";
import { AdminDecks } from "../components/admin/AdminDecks.jsx";
import { AdminStorage } from "../components/admin/AdminStorage.jsx";
import { AdminAudit } from "../components/admin/AdminAudit.jsx";

const TABS = [
  { id: "users", label: "Comptes", Panel: AdminUsers },
  { id: "decks", label: "Contenus", Panel: AdminDecks },
  { id: "storage", label: "Stockage", Panel: AdminStorage },
  { id: "audit", label: "Journal", Panel: AdminAudit },
];

/**
 * Console d'administration Kapsule (req_015).
 *
 * Le refus affiche pour un non-admin est un confort de navigation : les routes
 * `/api/admin/*` repondent 403 de toute facon, y compris en appel direct. Ne
 * jamais traiter ce garde comme la mesure de securite.
 */
export function AdminConsole() {
  const { user } = useAuth();
  const [active, setActive] = useState("users");
  const tabRefs = useRef({});

  if (user?.role !== "admin") {
    return (
      <p className="msg error" role="alert">
        Cette page est réservée aux administrateurs.
      </p>
    );
  }

  // Navigation clavier attendue d'un onglet : fleches, Origine et Fin.
  const onTabKeyDown = (event) => {
    const order = TABS.map((tab) => tab.id);
    const index = order.indexOf(active);
    const moves = {
      ArrowRight: (index + 1) % order.length,
      ArrowLeft: (index - 1 + order.length) % order.length,
      Home: 0,
      End: order.length - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const nextId = order[next];
    setActive(nextId);
    tabRefs.current[nextId]?.focus();
  };

  const ActivePanel = TABS.find((tab) => tab.id === active).Panel;

  return (
    <section className="admin-console">
      <div className="list-head">
        <h1>Administration</h1>
        <p className="admin-hint">
          Connecté en tant que {user.email}. Chaque action sensible est journalisée.
        </p>
      </div>

      <div className="admin-tabs" role="tablist" aria-label="Sections d'administration">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`admin-tab-${tab.id}`}
            className={`admin-tab${tab.id === active ? " admin-tab-active" : ""}`}
            aria-selected={tab.id === active}
            aria-controls={`admin-panel-${tab.id}`}
            // Un seul onglet dans l'ordre de tabulation : les fleches font le
            // reste, conformement au motif d'onglets accessible.
            tabIndex={tab.id === active ? 0 : -1}
            ref={(node) => {
              tabRefs.current[tab.id] = node;
            }}
            onClick={() => setActive(tab.id)}
            onKeyDown={onTabKeyDown}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`admin-panel-${active}`}
        aria-labelledby={`admin-tab-${active}`}
        tabIndex={-1}
        className="admin-panel"
      >
        <ActivePanel />
      </div>
    </section>
  );
}
