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
import { AuditStore } from "./audit.mjs";
import { AdminStore, normalizePaging, parseDeckMetadataPatch } from "./admin.mjs";
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
  canMarkDeckLearned,
  canAdminister,
  checkRoleChange,
  checkUserDeletion,
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
  const audit = new AuditStore(db);
  // Chemins de stockage pour l'apercu admin. `db.name` est le fichier ouvert par
  // better-sqlite3 : pas de duplication de la logique de resolution de db.mjs.
  // Ces chemins restent internes, seules des tailles en octets sont exposees.
  const dbPath = db.name;
  const admin = new AdminStore(db, {
    dbPath,
    uploadsDir: UPLOADS_DIR,
    backupDir:
      process.env.KAPSULE_BACKUP_DIR ??
      (dbPath && dbPath !== ":memory:" ? join(dirname(dbPath), "backups") : null),
  });
  const app = express();
  // Caddy est l'unique proxy attendu; ne faire confiance qu'a son saut direct.
  app.set("trust proxy", Number(process.env.KAPSULE_TRUST_PROXY_HOPS ?? 1));
  const allowedOrigin = process.env.KAPSULE_CORS_ORIGIN;
  app.use(cors(allowedOrigin ? { origin: allowedOrigin } : { origin: false }));
  app.use(express.json({ limit: "5mb" }));

  // Limiteur de debit des routes d'authentification (AC4) : protege login et
  // register du brute force et du DoS CPU (hachage scrypt).
  const authLimiter = createRateLimiter(options.rateLimit ?? { windowMs: 15 * 60_000, max: 10 });
  const importLimiter = createRateLimiter({ windowMs: 60 * 60_000, max: 20 });
  const rateLimit = (limiter) => (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    if (!limiter.check(key)) {
      return res.status(429).json({ error: "trop de tentatives, reessayez plus tard" });
    }
    next();
  };

  const quota = {
    maxDecks: Number(process.env.KAPSULE_MAX_DECKS_PER_USER ?? 50),
    maxBytes: Number(process.env.KAPSULE_MAX_STORAGE_BYTES_PER_USER ?? 50 * 1024 * 1024),
  };

  app.get("/api/health", (_req, res) => {
    try {
      db.prepare("SELECT 1").get();
      res.json({
        ok: true,
        ready: true,
        schemaVersion: db.pragma("user_version", { simple: true }),
      });
    } catch {
      res.status(503).json({ ok: false, ready: false });
    }
  });

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
  app.get("/api/decks/:deckId/assets/*assetPath", (req, res) => {
    // Express 5 (path-to-regexp v8) : le wildcard doit etre nomme et expose un
    // tableau de segments, la ou Express 4 donnait la chaine complete via req.params[0].
    const splat = req.params.assetPath;
    const rel = canonicalAssetPath(Array.isArray(splat) ? splat.join("/") : (splat ?? ""));
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
    const reviews = store.getReviewSummary(req.user.id);
    res.json(
      decks.map((d) => ({
        ...d,
        progress: summary[d.id] ?? { learned: 0, seen: 0 },
        // Champs additifs (retention memorielle) : neutres si aucune fiche en cycle.
        dueCount: reviews[d.id]?.dueCount ?? 0,
        retention: reviews[d.id]?.retention ?? null,
        retentionSeries: reviews[d.id]?.retentionSeries ?? [],
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
    if (!importLimiter.check(req.user.id)) {
      return res.status(429).json({ error: "trop d'importations, reessayez plus tard" });
    }
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
    const result = store.importDeck(req.body, { ownerId: req.user.id, visibility, quota });
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
    // Etat avant mutation : necessaire a la trace d'audit (req_015 AC6).
    const before = store.getDeckSummary(req.params.deckId);
    if (!before) return res.status(404).json({ error: "deck introuvable" });
    if (!store.setDeckVisibility(req.params.deckId, visibility)) {
      return res.status(404).json({ error: "deck introuvable" });
    }
    admin.recordVisibilityChange(req.params.deckId, before, visibility, audit, {
      id: req.user.id,
      email: req.user.email,
    });
    res.json({ ok: true, visibility });
  });

  // Suppression d'un deck depuis le lecteur (contrat historique : 204, sans
  // confirmation portee par le corps). Delegue a l'adaptateur admin pour
  // beneficier du meme nettoyage de dependances et de la meme trace d'audit que
  // la console : la progression et les revisions du deck ne doivent pas survivre
  // au deck (ces tables n'ont pas de cle etrangere).
  app.delete("/api/decks/:deckId", requireAuth, (req, res) => {
    if (!canDeleteDeck(req.user)) {
      return res.status(403).json({ error: "seul l'administrateur peut supprimer un deck" });
    }
    const result = admin.deleteDeck(req.params.deckId, audit, {
      id: req.user.id,
      email: req.user.email,
    });
    if (!result.ok) return res.status(404).json({ error: "deck introuvable" });
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
    res.json({ ok: true, state: result.state, unchanged: result.unchanged ?? false });
  });

  app.put("/api/decks/:deckId/progress", requireAuth, (req, res) => {
    const access = store.getDeckAccess(req.params.deckId);
    if (!access || !canViewDeck(req.user, access)) {
      return res.status(404).json({ error: "deck introuvable" });
    }
    if (!canMarkDeckLearned(req.user)) {
      return res.status(403).json({ error: "action reservee aux maitres et administrateurs" });
    }
    const { state } = req.body ?? {};
    if (state !== "learned") {
      return res.status(422).json({ error: 'etat invalide (attendu : "learned")' });
    }
    const result = store.markDeckLearned(req.params.deckId, req.user.id);
    if (!result.ok) return res.status(404).json({ error: result.error });
    res.json({
      ok: true,
      state: "learned",
      changed: result.changed,
      progress: result.progress,
    });
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

  // --- Console d'administration (req_015) ----------------------------------
  // Toutes les routes ci-dessous passent par requireAuth puis requireAdmin :
  // l'autorisation est portee par le serveur, jamais par le masquage frontend.
  // 401 sans session valide, 403 pour un invite ou un maitre, y compris en
  // appelant l'URL directement (req_015 AC1).

  const requireAdmin = (req, res, next) => {
    if (!canAdminister(req.user)) {
      return res.status(403).json({ error: "action reservee a l'administrateur" });
    }
    next();
  };
  const adminOnly = [requireAuth, requireAdmin];
  // Acteur consigne dans l'audit : identite minimale, jamais le token.
  const actorOf = (req) => ({ id: req.user.id, email: req.user.email });
  // Une suppression doit porter l'identifiant de sa cible : un clic seul ne
  // suffit pas (item_025 AC4 / item_026 AC4).
  const confirmationMatches = (req, expectedId) => (req.body?.confirmId ?? null) === expectedId;

  app.get("/api/admin/users", ...adminOnly, (req, res) => {
    res.json(admin.listUsers({ q: req.query.q, limit: req.query.limit, offset: req.query.offset }));
  });

  app.get("/api/admin/users/:userId", ...adminOnly, (req, res) => {
    const user = admin.getUser(req.params.userId);
    if (!user) return res.status(404).json({ error: "compte introuvable" });
    res.json({ user });
  });

  app.patch("/api/admin/users/:userId/role", ...adminOnly, (req, res) => {
    const target = admin.getUserForMutation(req.params.userId);
    if (!target) return res.status(404).json({ error: "compte introuvable" });
    const { role } = req.body ?? {};
    const check = checkRoleChange(req.user, target, role, admin.countAdmins());
    if (!check.ok) return res.status(check.status).json({ error: check.error });
    const result = admin.setUserRole(target, role, audit, actorOf(req));
    if (!result.ok) return res.status(404).json({ error: "compte introuvable" });
    res.json({ ok: true, user: result.user });
  });

  app.delete("/api/admin/users/:userId", ...adminOnly, (req, res) => {
    const target = admin.getUserForMutation(req.params.userId);
    if (!target) return res.status(404).json({ error: "compte introuvable" });
    const check = checkUserDeletion(req.user, target, admin.countAdmins());
    if (!check.ok) return res.status(check.status).json({ error: check.error });
    if (!confirmationMatches(req, target.id)) {
      return res
        .status(400)
        .json({ error: "confirmation manquante : renvoyez l'identifiant du compte cible" });
    }
    const result = admin.deleteUser(target, audit, actorOf(req));
    if (!result.ok) return res.status(404).json({ error: "compte introuvable" });
    res.json({ ok: true, impact: result.impact, assetCleanup: result.assetCleanup });
  });

  app.get("/api/admin/decks", ...adminOnly, (req, res) => {
    res.json(admin.listDecks({ q: req.query.q, limit: req.query.limit, offset: req.query.offset }));
  });

  // Metadonnees editables d'un deck. Lues juste avant d'ouvrir l'edition, pour
  // que le formulaire parte de l'etat serveur et non du dernier listing.
  app.get("/api/admin/decks/:deckId", ...adminOnly, (req, res) => {
    const deck = admin.getDeckMetadata(req.params.deckId);
    if (!deck) return res.status(404).json({ error: "deck introuvable" });
    res.json({ deck });
  });

  app.get("/api/admin/decks/:deckId/impact", ...adminOnly, (req, res) => {
    const impact = admin.getDeckDeletionImpact(req.params.deckId);
    if (!impact) return res.status(404).json({ error: "deck introuvable" });
    res.json({ impact });
  });

  // Edition administrative bornee des metadonnees d'un deck (item_032).
  // L'allowlist est portee par `parseDeckMetadataPatch` : l'identifiant, le
  // proprietaire, les fiches et les assets ne sont accessibles par aucun champ
  // de cette route, et une cle inconnue est refusee en 400 plutot qu'ignoree.
  app.patch("/api/admin/decks/:deckId", ...adminOnly, (req, res) => {
    const parsed = parseDeckMetadataPatch(req.body);
    if (!parsed.ok) return res.status(parsed.status).json({ error: parsed.error });
    const result = admin.updateDeckMetadata(req.params.deckId, parsed.patch, audit, actorOf(req));
    if (!result.ok) return res.status(404).json({ error: "deck introuvable" });
    res.json({ ok: true, deck: result.deck });
  });

  // Suppression administrative d'un deck : contrairement a DELETE /api/decks/:id,
  // elle exige une confirmation portant l'identifiant, nettoie la progression et
  // les revisions (tables sans cle etrangere) et laisse une trace d'audit.
  app.delete("/api/admin/decks/:deckId", ...adminOnly, (req, res) => {
    if (!confirmationMatches(req, req.params.deckId)) {
      return res
        .status(400)
        .json({ error: "confirmation manquante : renvoyez l'identifiant du deck cible" });
    }
    const result = admin.deleteDeck(req.params.deckId, audit, actorOf(req));
    if (!result.ok) return res.status(404).json({ error: "deck introuvable" });
    res.json({ ok: true, impact: result.impact, assetCleanup: result.assetCleanup });
  });

  app.get("/api/admin/storage", ...adminOnly, (_req, res) => {
    res.json(admin.storageOverview());
  });

  app.get("/api/admin/audit", ...adminOnly, (req, res) => {
    const { limit, offset } = normalizePaging({ limit: req.query.limit, offset: req.query.offset });
    res.json({ ...audit.list({ limit, offset }), limit, offset });
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
