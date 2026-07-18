// Construction de l'application Express. Separee du demarrage (server.mjs)
// pour pouvoir la tester sans ouvrir de port.

import express from "express";
import cors from "cors";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { formatErrors } from "@kapsule/schema";
import { Store } from "./store.mjs";
import { AuthStore } from "./auth.mjs";
import { createRateLimiter } from "./rate-limit.mjs";
import {
  canonicalAssetPath,
  verifyAssetSig,
  signDeckAssets,
  signCardAssets,
} from "./asset-signing.mjs";
import {
  VALID_VISIBILITY,
  canViewDeck,
  canEditDeck,
  canCreateWithVisibility,
  canDeleteDeck,
  canChangeVisibility,
} from "./permissions.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Racine des assets images, un sous-dossier par deck : uploads/<deckId>/…
const UPLOADS_DIR = process.env.KAPSULE_UPLOADS ?? join(__dirname, "..", "uploads");
// Frontend buildé servi en production (meme conteneur). Vide en dev (Vite sert le front).
const STATIC_DIR =
  process.env.KAPSULE_STATIC_DIR ?? join(__dirname, "..", "..", "frontend", "dist");

/**
 * @param {import("better-sqlite3").Database} db
 * @returns {import("express").Express}
 */
export function createApp(db, options = {}) {
  const store = new Store(db);
  const auth = new AuthStore(db);
  const app = express();
  // Derriere Caddy : fait confiance a X-Forwarded-For pour identifier le client
  // (rate limit par IP reelle).
  app.set("trust proxy", true);
  app.use(cors());
  app.use(express.json({ limit: "5mb" }));

  // Limiteur de debit des routes d'authentification (AC4) : protege login et
  // register du brute force et du DoS CPU (hachage scrypt).
  const authLimiter = createRateLimiter(options.rateLimit ?? { windowMs: 15 * 60_000, max: 10 });
  const rateLimit = (limiter) => (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    if (!limiter.check(key)) {
      return res.status(429).json({ error: "trop de tentatives, reessayez plus tard" });
    }
    next();
  };

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

  app.post("/api/auth/register", rateLimit(authLimiter), async (req, res, next) => {
    try {
      if (!auth.registrationOpen()) {
        return res.status(403).json({ error: "les inscriptions sont fermees" });
      }
      const { email, password } = req.body ?? {};
      const result = await auth.register(email, password);
      if (!result.ok) return res.status(result.status).json({ error: result.error });
      // Connexion immediate apres inscription.
      const token = auth.createSession(result.user.id, req.get("user-agent"));
      res.status(201).json({ token, user: result.user });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/login", rateLimit(authLimiter), async (req, res, next) => {
    try {
      const { email, password } = req.body ?? {};
      const result = await auth.login(email, password, req.get("user-agent"));
      if (!result.ok) return res.status(401).json({ error: result.error });
      res.json({ token: result.token, user: result.user });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    const header = req.get("authorization") ?? "";
    auth.deleteSession(header.slice(7));
    res.status(204).end();
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    res.json({ user: req.user, registrationOpen: auth.registrationOpen() });
  });

  // --- Assets images (URL signee, ADR 003) ---------------------------------
  // Servis via <img> (pas d'en-tete Bearer) : l'autorisation est portee par une
  // signature a duree de vie courte emise a la lecture du deck (gardee par
  // canViewDeck). Sans signature valide, on ne sert rien.
  app.get("/api/decks/:deckId/assets/*", (req, res) => {
    const rel = canonicalAssetPath(req.params[0]);
    if (rel.includes("..")) return res.status(400).end();
    // Verification signature/expiration avant tout acces au disque.
    if (!verifyAssetSig(req.params.deckId, rel, req.query.exp, req.query.sig)) {
      return res.status(403).json({ error: "acces a l'asset non autorise" });
    }
    const deckDir = join(UPLOADS_DIR, req.params.deckId);
    const file = join(deckDir, rel);
    if (!file.startsWith(deckDir) || !existsSync(file)) {
      return res.status(404).json({ error: "asset introuvable" });
    }
    res.sendFile(file);
  });

  // --- Decks (session requise ; progression cloisonnee par utilisateur) ----

  app.get("/api/decks", requireAuth, (req, res) => {
    // Le filtrage par visibilite/role se fait cote SQL.
    const decks = store.listDecks(req.user);
    const summary = store.getProgressSummary(req.user.id);
    res.json(
      decks.map((d) => ({
        ...d,
        progress: summary[d.id] ?? { learned: 0, seen: 0 },
      })),
    );
  });

  app.get("/api/decks/:deckId", requireAuth, (req, res) => {
    const access = store.getDeckAccess(req.params.deckId);
    // Deck absent ou non visible : meme reponse 404 (on ne divulgue pas l'existence).
    if (!access || !canViewDeck(req.user, access)) {
      return res.status(404).json({ error: "deck introuvable" });
    }
    const deck = signDeckAssets(store.getDeck(req.params.deckId), req.params.deckId);
    res.json({
      deck,
      progress: store.getDeckProgress(req.params.deckId, req.user.id),
      visibility: access.visibility,
      ownerId: access.ownerId,
    });
  });

  app.get("/api/decks/:deckId/cards/:cardId", requireAuth, (req, res) => {
    const access = store.getDeckAccess(req.params.deckId);
    if (!access || !canViewDeck(req.user, access)) {
      return res.status(404).json({ error: "fiche introuvable" });
    }
    const card = store.getCard(req.params.deckId, req.params.cardId);
    if (!card) return res.status(404).json({ error: "fiche introuvable" });
    res.json(signCardAssets(card, req.params.deckId));
  });

  // Import / mise a jour d'un deck (valide contre le contrat de contenu).
  // Creation : la visibilite demandee (?visibility=) doit etre autorisee pour
  //   le role ; le proprietaire devient l'utilisateur courant.
  // Mise a jour : reservee a qui peut editer le deck ; owner/visibilite preserves.
  app.post("/api/decks", requireAuth, (req, res) => {
    const deckId = req.body?.id;
    const existing = deckId ? store.getDeckAccess(deckId) : null;

    if (existing) {
      if (!canEditDeck(req.user, existing)) {
        return res.status(403).json({ error: "modification de ce deck non autorisee" });
      }
      const result = store.importDeck(req.body); // owner/visibilite preserves par l'upsert
      if (!result.valid) {
        return res.status(422).json({
          error: "deck invalide",
          details: result.errors,
          report: formatErrors(result.errors),
        });
      }
      return res.status(201).json({ deck: result.deck });
    }

    // Creation.
    const visibility = req.query.visibility ?? "private";
    if (!VALID_VISIBILITY.includes(visibility)) {
      return res.status(400).json({ error: `visibilite invalide "${visibility}"` });
    }
    if (!canCreateWithVisibility(req.user, visibility)) {
      return res
        .status(403)
        .json({ error: `creation d'un deck "${visibility}" non autorisee pour votre role` });
    }
    const result = store.importDeck(req.body, { ownerId: req.user.id, visibility });
    if (!result.valid) {
      return res.status(422).json({
        error: "deck invalide",
        details: result.errors,
        report: formatErrors(result.errors),
      });
    }
    res.status(201).json({ deck: result.deck });
  });

  // Changement de visibilite : admin uniquement.
  app.patch("/api/decks/:deckId/visibility", requireAuth, (req, res) => {
    if (!canChangeVisibility(req.user)) {
      return res.status(403).json({ error: "action reservee a l'administrateur" });
    }
    const { visibility } = req.body ?? {};
    if (!VALID_VISIBILITY.includes(visibility)) {
      return res.status(400).json({ error: `visibilite invalide "${visibility}"` });
    }
    if (!store.setDeckVisibility(req.params.deckId, visibility)) {
      return res.status(404).json({ error: "deck introuvable" });
    }
    res.json({ ok: true, visibility });
  });

  app.delete("/api/decks/:deckId", requireAuth, (req, res) => {
    if (!canDeleteDeck(req.user)) {
      return res.status(403).json({ error: "seul l'administrateur peut supprimer un deck" });
    }
    const removed = store.deleteDeck(req.params.deckId);
    if (!removed) return res.status(404).json({ error: "deck introuvable" });
    res.status(204).end();
  });

  // --- Progression (cloisonnee par utilisateur) ----------------------------

  app.put("/api/decks/:deckId/cards/:cardId/progress", requireAuth, (req, res) => {
    // Meme decision d'autorisation que la lecture du deck : on n'ecrit pas de
    // progression sur une fiche que l'utilisateur ne peut pas voir. 404 pour ne
    // pas divulguer l'existence du deck (cf. audit 2026-07-18, P0 autorisations).
    const access = store.getDeckAccess(req.params.deckId);
    if (!access || !canViewDeck(req.user, access)) {
      return res.status(404).json({ error: "fiche introuvable" });
    }
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

  // --- Repetition espacee (SM-2) -------------------------------------------

  // Fiches a reviser aujourd'hui, tous decks confondus.
  app.get("/api/reviews/due", requireAuth, (req, res) => {
    res.json(store.getDueReviews(req.user));
  });

  // Enregistre une revision : reprogramme selon le score de quiz.
  app.post("/api/decks/:deckId/cards/:cardId/review", requireAuth, (req, res) => {
    // Meme garde de visibilite que la progression : une revision ne peut pas
    // etre ecrite sur un deck que l'utilisateur ne peut plus voir.
    const access = store.getDeckAccess(req.params.deckId);
    if (!access || !canViewDeck(req.user, access)) {
      return res.status(404).json({ error: "fiche introuvable" });
    }
    const { quizScore } = req.body ?? {};
    const result = store.reviewCard(
      req.params.deckId,
      req.params.cardId,
      quizScore ?? null,
      req.user.id,
    );
    if (!result.ok) return res.status(404).json({ error: result.error });
    res.json({ ok: true, review: result.review });
  });

  // --- Frontend statique (production) --------------------------------------
  // En prod, le meme conteneur sert la PWA buildée + fallback SPA. En dev, le
  // dossier n'existe pas : Vite sert le front et proxifie /api.
  if (existsSync(STATIC_DIR)) {
    app.use(express.static(STATIC_DIR));
    // Fallback SPA : toute route hors /api renvoie index.html (routing client).
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(join(STATIC_DIR, "index.html"));
    });
  }

  // Gestionnaire d'erreurs JSON (evite les fuites de stack en reponse).
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    console.error("Erreur non geree :", err);
    res.status(500).json({ error: "erreur interne" });
  });

  return app;
}
