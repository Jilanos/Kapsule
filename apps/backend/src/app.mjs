// Construction de l'application Express. Separee du demarrage (server.mjs)
// pour pouvoir la tester sans ouvrir de port.

import express from "express";
import cors from "cors";
import { dirname, join, normalize } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { formatErrors } from "@kapsule/schema";
import { Store } from "./store.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Racine des assets images, un sous-dossier par deck : uploads/<deckId>/…
const UPLOADS_DIR = process.env.KAPSULE_UPLOADS ?? join(__dirname, "..", "uploads");

/**
 * @param {import("better-sqlite3").Database} db
 * @returns {import("express").Express}
 */
export function createApp(db) {
  const store = new Store(db);
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "5mb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // --- Decks ---------------------------------------------------------------

  // Liste des decks + progression agregee.
  app.get("/api/decks", (_req, res) => {
    const decks = store.listDecks();
    const summary = store.getProgressSummary();
    res.json(
      decks.map((d) => ({
        ...d,
        progress: summary[d.id] ?? { learned: 0, seen: 0 },
      })),
    );
  });

  // Deck complet + progression par fiche.
  app.get("/api/decks/:deckId", (req, res) => {
    const deck = store.getDeck(req.params.deckId);
    if (!deck) return res.status(404).json({ error: "deck introuvable" });
    res.json({ deck, progress: store.getDeckProgress(req.params.deckId) });
  });

  // Assets images d'un deck (chemins relatifs reference par les fiches).
  // Protege contre la traversee de repertoire.
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

  // Une fiche precise.
  app.get("/api/decks/:deckId/cards/:cardId", (req, res) => {
    const card = store.getCard(req.params.deckId, req.params.cardId);
    if (!card) return res.status(404).json({ error: "fiche introuvable" });
    res.json(card);
  });

  // Import / mise a jour d'un deck (valide contre le contrat de contenu).
  app.post("/api/decks", (req, res) => {
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

  app.delete("/api/decks/:deckId", (req, res) => {
    const removed = store.deleteDeck(req.params.deckId);
    if (!removed) return res.status(404).json({ error: "deck introuvable" });
    res.status(204).end();
  });

  // --- Progression ---------------------------------------------------------

  app.put("/api/decks/:deckId/cards/:cardId/progress", (req, res) => {
    const { state, quizScore } = req.body ?? {};
    const result = store.setProgress(
      req.params.deckId,
      req.params.cardId,
      state,
      quizScore ?? null,
    );
    if (!result.ok) return res.status(422).json({ error: result.error });
    res.json({ ok: true, state });
  });

  return app;
}
