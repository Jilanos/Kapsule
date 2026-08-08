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
  markDeckLearned: (deckId) =>
    req(`/decks/${encodeURIComponent(deckId)}/progress`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state: "learned" }),
    }),
  reviewCard: (deckId, cardId, quizScore) =>
    req(`/decks/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(cardId)}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ quizScore }),
    }),
  // visibility : 'private' | 'general' | 'master' (ignore a la mise a jour d'un
  // deck existant, dont la visibilite est preservee cote serveur).
  importDeck: (deck, visibility = "private") =>
    req(`/decks?visibility=${encodeURIComponent(visibility)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(deck),
    }),
  deleteDeck: (deckId) => req(`/decks/${encodeURIComponent(deckId)}`, { method: "DELETE" }),
  changeDeckVisibility: (deckId, visibility) =>
    req(`/decks/${encodeURIComponent(deckId)}/visibility`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visibility }),
    }),
  setProgress: (deckId, cardId, state, quizScore) =>
    req(`/decks/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(cardId)}/progress`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state, quizScore }),
    }),

  // Console d'administration (role admin ; le backend renvoie 403 sinon — le
  // masquage de l'entree de menu n'est qu'un confort, jamais la securite).
  admin: {
    listUsers: (params) => req(`/admin/users${adminQuery(params)}`),
    getUser: (userId) => req(`/admin/users/${encodeURIComponent(userId)}`),
    setUserRole: (userId, role) =>
      req(`/admin/users/${encodeURIComponent(userId)}/role`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role }),
      }),
    // `confirmId` reprend l'identifiant de la cible : une suppression ne peut
    // pas partir d'un simple clic (contrat serveur).
    deleteUser: (userId) =>
      req(`/admin/users/${encodeURIComponent(userId)}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmId: userId }),
      }),
    listDecks: (params) => req(`/admin/decks${adminQuery(params)}`),
    getDeck: (deckId) => req(`/admin/decks/${encodeURIComponent(deckId)}`),
    getDeckImpact: (deckId) => req(`/admin/decks/${encodeURIComponent(deckId)}/impact`),
    // Edition bornee : le serveur refuse toute cle hors titre, description et
    // visibilite, l'appelant n'envoie donc que celles-la.
    updateDeck: (deckId, { title, description, visibility }) =>
      req(`/admin/decks/${encodeURIComponent(deckId)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, description, visibility }),
      }),
    deleteDeck: (deckId) =>
      req(`/admin/decks/${encodeURIComponent(deckId)}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmId: deckId }),
      }),
    storage: () => req("/admin/storage"),
    listAudit: (params) => req(`/admin/audit${adminQuery(params)}`),
  },
};

/** Chaine de requete admin : seules les cles fournies sont envoyees. */
function adminQuery({ q, limit, offset } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (limit != null) params.set("limit", String(limit));
  if (offset) params.set("offset", String(offset));
  const query = params.toString();
  return query ? `?${query}` : "";
}
