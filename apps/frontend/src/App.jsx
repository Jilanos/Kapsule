import { useEffect, useRef } from "react";
import { Link, useLocation } from "./router.jsx";
import { DeckList } from "./pages/DeckList.jsx";
import { DeckReader } from "./pages/DeckReader.jsx";
import { ReviewSession } from "./pages/ReviewSession.jsx";
import { useAuth } from "./auth/AuthContext.jsx";
import { AuthScreen } from "./auth/AuthScreen.jsx";

export function App() {
  const { user, loading, logout } = useAuth();
  const mainRef = useRef(null);
  const { pathname } = useLocation();

  // Focus de route (AC8) : a chaque changement d'URL, on place le focus sur le
  // conteneur principal pour que la navigation clavier/lecteur d'ecran reparte
  // du contenu et non de la fin de la page precedente.
  useEffect(() => {
    if (user) mainRef.current?.focus();
  }, [pathname, user]);

  if (loading)
    return (
      <p className="msg" role="status">
        Chargement…
      </p>
    );
  if (!user) return <AuthScreen />;

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Aller au contenu principal
      </a>
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden>
            K
          </span>{" "}
          Kapsule
        </Link>
        <div className="header-user">
          <span className="header-email" title={user.email}>
            {user.email}
          </span>
          <button type="button" className="link-btn" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </header>
      <main
        className={`app-main${pathname === "/" ? " app-main-decks" : ""}`}
        id="main"
        tabIndex={-1}
        ref={mainRef}
      >
        {pathname === "/" && <DeckList />}
        {pathname === "/reviews" && <ReviewSession />}
        {pathname.startsWith("/decks/") && <DeckReader />}
      </main>
    </div>
  );
}
