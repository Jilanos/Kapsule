// Client API : un seul point d'acces au backend.
// Gere le token de session (persiste en localStorage) et signale les 401.

const TOKEN_KEY = "kapsule_token";
let token = localStorage.getItem(TOKEN_KEY);
let onUnauthorized = null;

export function setToken(value) {
  token = value;
  if (value) localStorage.setItem(TOKEN_KEY, value);
  else localStorage.removeItem(TOKEN_KEY);
}
export const getToken = () => token;

/** Callback appele quand une route protegee renvoie 401 (session expiree). */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function req(path, options = {}) {
  const headers = { ...(options.headers ?? {}) };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { ...options, headers });

  if (res.status === 401 && !path.startsWith("/auth/")) {
    onUnauthorized?.();
  }
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
  // Auth
  register: (email, password) =>
    req("/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  login: (email, password) =>
    req("/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  logout: () => req("/auth/logout", { method: "POST" }),
  me: () => req("/auth/me"),

  // Decks & progression
  listDecks: () => req("/decks"),
  getDeck: (deckId) => req(`/decks/${encodeURIComponent(deckId)}`),
  getCard: (deckId, cardId) =>
    req(`/decks/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(cardId)}`),
  getDueReviews: () => req("/reviews/due"),
  reviewCard: (deckId, cardId, quizScore) =>
    req(
      `/decks/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(cardId)}/review`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quizScore }),
      },
    ),
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
