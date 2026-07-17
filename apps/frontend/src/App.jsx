import { Routes, Route, Link } from "react-router-dom";
import { DeckList } from "./pages/DeckList.jsx";
import { DeckReader } from "./pages/DeckReader.jsx";

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark">K</span> Kapsule
        </Link>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<DeckList />} />
          <Route path="/decks/:deckId" element={<DeckReader />} />
        </Routes>
      </main>
    </div>
  );
}
