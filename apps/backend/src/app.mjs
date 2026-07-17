// Construction de l'application Express. Separee du demarrage (server.mjs)
// pour pouvoir la tester sans ouvrir de port.

import express from "express";
import cors from "cors";
import { dirname, join, normalize } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { formatErrors } from "@kapsule/schema";
import { Store } from "./store.mjs";
import { AuthStore } from "./auth.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Racine des assets images, un sous-dossier par deck : uploads/<deckId>/…
const UPLOADS_DIR = process.env.KAPSULE_UPLOADS ?? join(__dirname, "..", "uploads");

/**
 * @param {import("better-sqlite3").Database} db
 * @returns {import("express").Express}
 */
export function createApp(db) {
  const store = new Store(db);
  const auth = new AuthStore(db);
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "5mb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // Middleware : exige une session valide (Authorization: Bearer <token>).
  // Attache l'utilisateur a req.user. 401 si absent/expire -> le front renvoie
  // vers l'ecran de connexion sans crasher.
  const requireAuth = (req, res, next) => {
    const header = req.get("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    const user = auth.getSessionUser(token);
    if (!user) return res.status(401).json({ error: "authentification requise" });
    req.user = user;
    next();
  };

  // --- Authentification ----------------------------------------------------

  app.post("/api/auth/register", (req, res) => {
    if (!auth.registrationOpen()) {
      return res.status(403).json({ error: "les inscriptions sont fermees" });
    }
    const { email, password } = req.body ?? {};
    const result = auth.register(email, password);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    // Connexion immediate apres inscription.
    const token = auth.createSession(result.user.id, req.get("user-agent"));
    res.status(201).json({ token, user: result.user });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body ?? {};
    const result = auth.login(email, password, req.get("user-agent"));
    if (!result.ok) return res.status(401).json({ error: result.error });
    res.json({ token: result.token, user: result.user });
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    const header = req.get("authorization") ?? "";
    auth.deleteSession(header.slice(7));
    res.status(204).end();
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    res.json({ user: req.user, registrationOpen: auth.registrationOpen() });
  });

  // --- Assets images (public : charges via <img>, pas de donnees sensibles) -
  app.get("/api/decks/:deckId/assets/*", (req, res) => {
    const rel = normalize(req.params[0]).replace(/^(\.\.[/\\])+/, "");
    if (rel.includes("..")) return res.status(400).end();
    const deckDir = join(UPLOADS_DIR, req.params.deckId);
    const file = join(deckDir, rel);
    if (!file.startsWith(deckDir) || !existsSync(file)) {
      return res.status(404).json({ error: "asset introuvable" });
    }
    res.sendFile(file);
  });

  // --- Decks (session requise ; progression cloisonnee par utilisateur) ----

  app.get("/api/decks", requireAuth, (req, res) => {
    const decks = store.listDecks();
    const summary = store.getProgressSummary(req.user.id);
    res.json(
      decks.map((d) => ({
        ...d,
        progress: summary[d.id] ?? { learned: 0, seen: 0 },
      })),
    );
  });

  app.get("/api/decks/:deckId", requireAuth, (req, res) => {
    const deck = store.getDeck(req.params.deckId);
    if (!deck) return res.status(404).json({ error: "deck introuvable" });
    res.json({ deck, progress: store.getDeckProgress(req.params.deckId, req.user.id) });
  });

  app.get("/api/decks/:deckId/cards/:cardId", requireAuth, (req, res) => {
    const card = store.getCard(req.params.deckId, req.params.cardId);
    if (!card) return res.status(404).json({ error: "fiche introuvable" });
    res.json(card);
  });

  // Import / mise a jour d'un deck (valide contre le contrat de contenu).
  app.post("/api/decks", requireAuth, (req, res) => {
    const result = store.importDeck(req.body);
    if (!result.valid) {
      return res.status(422).json({
        error: "deck invalide",
        details: result.errors,
        report: formatErrors(result.errors),
      });
    }
    res.status(201).json({ deck: result.deck });
  });

  app.delete("/api/decks/:deckId", requireAuth, (req, res) => {
    const removed = store.deleteDeck(req.params.deckId);
    if (!removed) return res.status(404).json({ error: "deck introuvable" });
    res.status(204).end();
  });

  // --- Progression (cloisonnee par utilisateur) ----------------------------

  app.put("/api/decks/:deckId/cards/:cardId/progress", requireAuth, (req, res) => {
    const { state, quizScore } = req.body ?? {};
    const result = store.setProgress(
      req.params.deckId,
      req.params.cardId,
      state,
      quizScore ?? null,
      req.user.id,
    );
    if (!result.ok) return res.status(422).json({ error: result.error });
    res.json({ ok: true, state });
  });

  return app;
}
