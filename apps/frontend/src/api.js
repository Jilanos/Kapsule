// Client API : un seul point d'acces au backend.

async function req(path, options) {
  const res = await fetch(`/api${path}`, options);
  if (!res.ok) {
    let body = null;
    try {
      body = await res.json();
    } catch {
      /* pas de corps JSON */
    }
    const err = new Error(body?.error ?? `Erreur ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listDecks: () => req("/decks"),
  getDeck: (deckId) => req(`/decks/${encodeURIComponent(deckId)}`),
  importDeck: (deck) =>
    req("/decks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(deck),
    }),
  deleteDeck: (deckId) =>
    req(`/decks/${encodeURIComponent(deckId)}`, { method: "DELETE" }),
  setProgress: (deckId, cardId, state, quizScore) =>
    req(
      `/decks/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(cardId)}/progress`,
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ state, quizScore }),
      },
    ),
};
