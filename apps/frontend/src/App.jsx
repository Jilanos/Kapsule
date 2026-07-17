import { Routes, Route, Link } from "react-router-dom";
import { DeckList } from "./pages/DeckList.jsx";
import { DeckReader } from "./pages/DeckReader.jsx";
import { ReviewSession } from "./pages/ReviewSession.jsx";
import { useAuth } from "./auth/AuthContext.jsx";
import { AuthScreen } from "./auth/AuthScreen.jsx";

export function App() {
  const { user, loading, logout } = useAuth();

  if (loading) return <p className="msg">Chargement…</p>;
  if (!user) return <AuthScreen />;

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark">K</span> Kapsule
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
      <main className="app-main">
        <Routes>
          <Route path="/" element={<DeckList />} />
          <Route path="/reviews" element={<ReviewSession />} />
          <Route path="/decks/:deckId" element={<DeckReader />} />
        </Routes>
      </main>
    </div>
  );
}
