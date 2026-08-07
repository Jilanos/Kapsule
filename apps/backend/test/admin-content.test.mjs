// Console d'administration — contenus et stockage (item_026).
// Couvre les droits et bornes (AC1), les metriques de deck (AC2), l'apercu de
// stockage sans divulgation (AC3) et la suppression de contenu tracee (AC4).

import { after, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openDb } from "../src/db.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseDeck = JSON.parse(readFileSync(join(__dirname, "fixtures", "deck-reseaux.json"), "utf8"));
const CARD_ID = "adresses-ip";
const deckWithId = (id) => ({ ...baseDeck, id, title: `Deck ${id}` });

// `app.mjs` resout le dossier d'uploads a l'import : on fixe la variable
// d'environnement avant, puis on importe dynamiquement.
const UPLOADS_DIR = mkdtempSync(join(tmpdir(), "kapsule-admin-uploads-"));
process.env.KAPSULE_UPLOADS = UPLOADS_DIR;
const { createApp } = await import("../src/app.mjs");

async function startApp() {
  const db = openDb(":memory:");
  const app = createApp(db);
  const server = await new Promise((r) => {
    const s = app.listen(0, () => r(s));
  });
  const base = `http://localhost:${server.address().port}`;

  const call = (path, { method = "GET", body, token } = {}) =>
    fetch(`${base}${path}`, {
      method,
      headers: {
        ...(body ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

  const json = (path, opts) => call(path, opts).then((r) => r.json());

  const makeUser = async (email, role = "guest") => {
    const reg = await call("/api/auth/register", {
      method: "POST",
      body: { email, password: "motdepasse1" },
    });
    const { token, user } = await reg.json();
    if (role !== "guest") db.prepare(`UPDATE users SET role = ? WHERE id = ?`).run(role, user.id);
    return { token, id: user.id, email };
  };

  return { db, call, json, makeUser, close: () => new Promise((r) => server.close(r)) };
}

test("AC1 : les listings de contenus sont bornes et allowlistes", async () => {
  const { call, json, makeUser, close } = await startApp();
  try {
    const admin = await makeUser("admin@b.fr", "admin");
    const master = await makeUser("master@b.fr", "master");
    for (const id of ["a", "b", "c"]) {
      await call("/api/decks?visibility=general", {
        method: "POST",
        body: deckWithId(id),
        token: master.token,
      });
    }

    const listing = await json("/api/admin/decks", { token: admin.token });
    assert.equal(listing.total, 3);
    assert.deepEqual(Object.keys(listing.decks[0]).sort(), [
      "assetBytes",
      "cardCount",
      "createdAt",
      "dataBytes",
      "id",
      "ownerEmail",
      "ownerId",
      "progressCount",
      "reviewCount",
      "title",
      "updatedAt",
      "visibility",
    ]);

    // La pagination est bornee comme celle des comptes.
    const page = await json("/api/admin/decks?limit=2&offset=2", { token: admin.token });
    assert.equal(page.decks.length, 1);
    assert.equal(page.limit, 2);
    assert.equal((await json("/api/admin/decks?limit=9999", { token: admin.token })).limit, 100);

    // Recherche par titre et par identifiant.
    assert.equal((await json("/api/admin/decks?q=Deck%20a", { token: admin.token })).total, 1);
    assert.equal((await json("/api/admin/decks?q=zzz", { token: admin.token })).total, 0);
  } finally {
    await close();
  }
});

test("AC2 : chaque deck expose proprietaire, visibilite, compteurs et volumes", async () => {
  const { call, json, makeUser, close } = await startApp();
  try {
    const admin = await makeUser("admin@b.fr", "admin");
    const owner = await makeUser("owner@b.fr", "master");
    await call("/api/decks?visibility=master", {
      method: "POST",
      body: deckWithId("mesure"),
      token: owner.token,
    });
    await call(`/api/decks/mesure/cards/${CARD_ID}/progress`, {
      method: "PUT",
      body: { state: "learned", quizScore: 1 },
      token: owner.token,
    });

    const { decks } = await json("/api/admin/decks?q=mesure", { token: admin.token });
    const deck = decks[0];
    assert.equal(deck.ownerId, owner.id);
    assert.equal(deck.ownerEmail, "owner@b.fr");
    assert.equal(deck.visibility, "master");
    assert.ok(deck.cardCount > 0);
    assert.ok(deck.dataBytes > 0, "la taille du JSON stocke doit etre exacte");
    assert.equal(deck.progressCount, 1);
    assert.equal(deck.reviewCount, 1);
    // Aucun asset pour ce deck : indisponible plutot que 0 trompeur.
    assert.equal(deck.assetBytes, null);

    // Un deck dote d'un dossier d'assets rapporte des octets reels.
    mkdirSync(join(UPLOADS_DIR, "mesure"), { recursive: true });
    writeFileSync(join(UPLOADS_DIR, "mesure", "schema.png"), Buffer.alloc(2048));
    const withAssets = await json("/api/admin/decks?q=mesure", { token: admin.token });
    assert.equal(withAssets.decks[0].assetBytes, 2048);
  } finally {
    rmSync(join(UPLOADS_DIR, "mesure"), { recursive: true, force: true });
    await close();
  }
});

test("AC3 : l'apercu de stockage agrege sans divulguer chemin ni contenu", async () => {
  const { call, json, makeUser, close } = await startApp();
  try {
    const admin = await makeUser("admin@b.fr", "admin");
    const master = await makeUser("master@b.fr", "master");
    await call("/api/decks?visibility=general", {
      method: "POST",
      body: deckWithId("stock"),
      token: master.token,
    });

    const overview = await json("/api/admin/storage", { token: admin.token });

    // La base de test est en memoire : l'indisponibilite est annoncee telle
    // quelle, sans octets inventes.
    assert.equal(overview.database.available, false);
    assert.equal(overview.database.bytes, null);

    // Le dossier d'uploads existe (cree par le test) : tailles agregees reelles.
    assert.equal(overview.uploads.available, true);
    assert.equal(typeof overview.uploads.bytes, "number");
    assert.equal(typeof overview.uploads.fileCount, "number");

    assert.ok(overview.deckDataBytes > 0);
    assert.equal(overview.counts.users, 2);
    assert.equal(overview.counts.admins, 1);
    assert.equal(overview.counts.decks, 1);
    assert.ok(overview.counts.cards > 0);
    assert.equal(typeof overview.counts.auditEvents, "number");

    // Non-divulgation : ni chemin absolu, ni nom de fichier, ni contenu.
    const serialized = JSON.stringify(overview);
    for (const forbidden of [UPLOADS_DIR, tmpdir(), "/data", ".sqlite", ".png"]) {
      assert.ok(!serialized.includes(forbidden), `l'apercu ne doit pas contenir ${forbidden}`);
    }
  } finally {
    await close();
  }
});

test("AC4 : la suppression de contenu annonce son impact, exige confirmation et laisse une trace", async () => {
  const { call, db, json, makeUser, close } = await startApp();
  try {
    const admin = await makeUser("admin@b.fr", "admin");
    const master = await makeUser("master@b.fr", "master");
    const reader = await makeUser("reader@b.fr", "guest");

    await call("/api/decks?visibility=general", {
      method: "POST",
      body: deckWithId("cible"),
      token: master.token,
    });
    // Deux lecteurs distincts progressent sur ce deck partage.
    for (const actor of [master, reader]) {
      await call(`/api/decks/cible/cards/${CARD_ID}/progress`, {
        method: "PUT",
        body: { state: "learned", quizScore: 1 },
        token: actor.token,
      });
    }
    mkdirSync(join(UPLOADS_DIR, "cible"), { recursive: true });
    writeFileSync(join(UPLOADS_DIR, "cible", "figure.png"), Buffer.alloc(512));

    // Impact annonce avant toute ecriture.
    const { impact } = await json("/api/admin/decks/cible/impact", { token: admin.token });
    assert.equal(impact.deck.id, "cible");
    assert.equal(impact.deck.visibility, "general");
    assert.ok(impact.cards > 0);
    assert.equal(impact.progress, 2);
    assert.equal(impact.reviews, 2);
    assert.equal(impact.affectedUsers, 2, "l'operateur doit voir combien de comptes sont touches");
    assert.equal(impact.assetBytes, 512);
    assert.equal(
      (await call("/api/admin/decks/inconnu/impact", { token: admin.token })).status,
      404,
    );

    // Sans confirmation exacte, rien ne bouge.
    for (const body of [undefined, {}, { confirmId: "autre" }]) {
      const denied = await call("/api/admin/decks/cible", {
        method: "DELETE",
        body,
        token: admin.token,
      });
      assert.equal(denied.status, 400);
    }
    assert.equal(db.prepare(`SELECT COUNT(*) AS n FROM decks WHERE id='cible'`).get().n, 1);

    const res = await call("/api/admin/decks/cible", {
      method: "DELETE",
      body: { confirmId: "cible" },
      token: admin.token,
    });
    assert.equal(res.status, 200);
    const payload = await res.json();
    assert.equal(payload.impact.affectedUsers, 2);
    assert.deepEqual(payload.assetCleanup, { removed: ["cible"], failed: [] });

    // Deck, fiches, progression et revisions ont disparu ensemble : aucune
    // ligne orpheline dans les tables sans cle etrangere.
    for (const sql of [
      `SELECT COUNT(*) AS n FROM decks WHERE id='cible'`,
      `SELECT COUNT(*) AS n FROM cards WHERE deck_id='cible'`,
      `SELECT COUNT(*) AS n FROM progress WHERE deck_id='cible'`,
      `SELECT COUNT(*) AS n FROM reviews WHERE deck_id='cible'`,
    ]) {
      assert.equal(db.prepare(sql).get().n, 0, sql);
    }
    // Les assets du deck ont ete retires apres commit.
    assert.equal(existsSync(join(UPLOADS_DIR, "cible")), false);

    // Trace d'audit avec acteur, cible et detail d'impact.
    const { events } = await json("/api/admin/audit", { token: admin.token });
    const event = events.find((e) => e.action === "deck.delete");
    assert.equal(event.actorEmail, "admin@b.fr");
    assert.equal(event.targetType, "deck");
    assert.equal(event.targetId, "cible");
    assert.equal(event.targetLabel, "Deck cible");
    assert.deepEqual(event.beforeState, {
      title: "Deck cible",
      visibility: "general",
      ownerId: master.id,
    });
    assert.equal(event.afterState, null);
    assert.equal(event.detail.affectedUsers, 2);

    assert.equal(
      (
        await call("/api/admin/decks/cible", {
          method: "DELETE",
          body: { confirmId: "cible" },
          token: admin.token,
        })
      ).status,
      404,
      "une seconde suppression ne trouve plus la cible",
    );
  } finally {
    await close();
  }
});

test("AC4 : la suppression depuis le lecteur nettoie aussi les dependances et s'audite", async () => {
  const { call, db, json, makeUser, close } = await startApp();
  try {
    const admin = await makeUser("admin@b.fr", "admin");
    const master = await makeUser("master@b.fr", "master");
    await call("/api/decks?visibility=general", {
      method: "POST",
      body: deckWithId("legacy"),
      token: master.token,
    });
    await call(`/api/decks/legacy/cards/${CARD_ID}/progress`, {
      method: "PUT",
      body: { state: "learned", quizScore: 1 },
      token: master.token,
    });

    // Contrat historique preserve : 204, sans corps de confirmation.
    assert.equal(
      (await call("/api/decks/legacy", { method: "DELETE", token: admin.token })).status,
      204,
    );
    assert.equal(
      db.prepare(`SELECT COUNT(*) AS n FROM progress WHERE deck_id='legacy'`).get().n,
      0,
    );
    assert.equal(db.prepare(`SELECT COUNT(*) AS n FROM reviews WHERE deck_id='legacy'`).get().n, 0);

    const { events } = await json("/api/admin/audit", { token: admin.token });
    assert.ok(events.some((e) => e.action === "deck.delete" && e.targetId === "legacy"));
  } finally {
    await close();
  }
});

test("AC4 : un changement de visibilite laisse une trace d'audit", async () => {
  const { call, json, makeUser, close } = await startApp();
  try {
    const admin = await makeUser("admin@b.fr", "admin");
    const master = await makeUser("master@b.fr", "master");
    await call("/api/decks?visibility=general", {
      method: "POST",
      body: deckWithId("vis"),
      token: master.token,
    });

    assert.equal(
      (
        await call("/api/decks/vis/visibility", {
          method: "PATCH",
          body: { visibility: "master" },
          token: admin.token,
        })
      ).status,
      200,
    );

    const { events } = await json("/api/admin/audit", { token: admin.token });
    const event = events.find((e) => e.action === "deck.visibility.update");
    assert.deepEqual(event.beforeState, { visibility: "general" });
    assert.deepEqual(event.afterState, { visibility: "master" });
    assert.equal(event.targetLabel, "Deck vis");

    assert.equal(
      (
        await call("/api/decks/inconnu/visibility", {
          method: "PATCH",
          body: { visibility: "master" },
          token: admin.token,
        })
      ).status,
      404,
    );
  } finally {
    await close();
  }
});

after(() => rmSync(UPLOADS_DIR, { recursive: true, force: true }));
