// Console d'administration — edition bornee des metadonnees d'un deck (item_032).
// Couvre l'autorisation et le rejet des champs inconnus (AC1), l'allowlist
// stricte et l'immuabilite du reste (AC2), l'atomicite, `updatedAt` et la trace
// d'audit (AC3).

import { after, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openDb } from "../src/db.mjs";
import { parseDeckMetadataPatch } from "../src/admin.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseDeck = JSON.parse(readFileSync(join(__dirname, "fixtures", "deck-reseaux.json"), "utf8"));

const UPLOADS_DIR = mkdtempSync(join(tmpdir(), "kapsule-deck-edit-uploads-"));
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

  // Un deck importe par un maitre : l'edition administrative ne doit pas en
  // changer le proprietaire.
  const seedDeck = async (token, id = "reseaux") => {
    const res = await call("/api/decks?visibility=general", {
      method: "POST",
      body: { ...baseDeck, id, title: "Titre initial", description: "Description initiale" },
      token,
    });
    assert.equal(res.status, 201);
    return id;
  };

  return { db, call, json, makeUser, seedDeck, close: () => new Promise((r) => server.close(r)) };
}

after(() => rmSync(UPLOADS_DIR, { recursive: true, force: true }));

test("parseDeckMetadataPatch n'accepte que les trois champs metier", () => {
  assert.deepEqual(parseDeckMetadataPatch({ title: "  Titre  " }), {
    ok: true,
    patch: { title: "Titre" },
  });
  // Une description vide devient l'etat « absente », pas une chaine vide.
  assert.deepEqual(parseDeckMetadataPatch({ description: "   " }), {
    ok: true,
    patch: { description: null },
  });
  assert.equal(parseDeckMetadataPatch({ id: "autre" }).status, 400);
  assert.equal(parseDeckMetadataPatch({ ownerId: "u1" }).status, 400);
  assert.equal(parseDeckMetadataPatch({ cards: [] }).status, 400);
  assert.equal(parseDeckMetadataPatch({ title: "" }).status, 400);
  assert.equal(parseDeckMetadataPatch({ title: "x".repeat(121) }).status, 400);
  assert.equal(parseDeckMetadataPatch({ description: "x".repeat(501) }).status, 400);
  assert.equal(parseDeckMetadataPatch({ visibility: "public" }).status, 400);
  assert.equal(parseDeckMetadataPatch({}).status, 400);
  assert.equal(parseDeckMetadataPatch(null).status, 400);
});

test("AC1 : seul un admin edite, et les champs inconnus sont refuses", async () => {
  const { call, makeUser, seedDeck, close } = await startApp();
  try {
    const admin = await makeUser("admin@edit.fr", "admin");
    const master = await makeUser("master@edit.fr", "master");
    const guest = await makeUser("guest@edit.fr");
    const deckId = await seedDeck(master.token);

    for (const actor of [null, guest, master]) {
      const res = await call(`/api/admin/decks/${deckId}`, {
        method: "PATCH",
        body: { title: "Pirate" },
        token: actor?.token,
      });
      assert.equal(res.status, actor ? 403 : 401);
    }

    // La lecture des metadonnees suit la meme garde que l'ecriture.
    const read = await call(`/api/admin/decks/${deckId}`, { token: guest.token });
    assert.equal(read.status, 403);

    const unknown = await call(`/api/admin/decks/${deckId}`, {
      method: "PATCH",
      body: { title: "Ok", ownerId: guest.id },
      token: admin.token,
    });
    assert.equal(unknown.status, 400);
    assert.match((await unknown.json()).error, /ownerId/);

    const missing = await call("/api/admin/decks/inconnu", {
      method: "PATCH",
      body: { title: "Ok" },
      token: admin.token,
    });
    assert.equal(missing.status, 404);
  } finally {
    await close();
  }
});

test("AC2 : seuls titre, description et visibilite bougent", async () => {
  const { db, call, json, makeUser, seedDeck, close } = await startApp();
  try {
    const admin = await makeUser("admin@edit2.fr", "admin");
    const master = await makeUser("master@edit2.fr", "master");
    const deckId = await seedDeck(master.token);
    const before = db.prepare(`SELECT * FROM decks WHERE id = ?`).get(deckId);
    const cardsBefore = db.prepare(`SELECT COUNT(*) AS n FROM cards WHERE deck_id = ?`).get(deckId);

    const res = await call(`/api/admin/decks/${deckId}`, {
      method: "PATCH",
      body: { title: "Titre corrigé", description: null, visibility: "master" },
      token: admin.token,
    });
    assert.equal(res.status, 200);
    const { deck } = await res.json();
    // Projection bornee : ni `data`, ni fiches, ni chemin d'asset.
    assert.deepEqual(Object.keys(deck).sort(), [
      "createdAt",
      "description",
      "id",
      "ownerId",
      "title",
      "updatedAt",
      "visibility",
    ]);

    const after = db.prepare(`SELECT * FROM decks WHERE id = ?`).get(deckId);
    assert.equal(after.title, "Titre corrigé");
    assert.equal(after.description, null);
    assert.equal(after.visibility, "master");
    // Immuables : identifiant, proprietaire, date de creation, fiches.
    assert.equal(after.id, before.id);
    assert.equal(after.owner_id, before.owner_id);
    assert.equal(after.created_at, before.created_at);
    assert.deepEqual(
      db.prepare(`SELECT COUNT(*) AS n FROM cards WHERE deck_id = ?`).get(deckId),
      cardsBefore,
    );

    // `decks.data` est la source de verite servie au lecteur : le titre y suit
    // la colonne, et une description retiree disparait du JSON.
    const data = JSON.parse(after.data);
    assert.equal(data.title, "Titre corrigé");
    assert.equal("description" in data, false);
    assert.equal(data.cards.length, JSON.parse(before.data).cards.length);

    const served = await json(`/api/decks/${deckId}`, { token: admin.token });
    assert.equal((served.deck ?? served).title, "Titre corrigé");
  } finally {
    await close();
  }
});

test("AC3 : l'edition est atomique, datee et journalisee", async () => {
  const { db, call, json, makeUser, seedDeck, close } = await startApp();
  try {
    const admin = await makeUser("admin@edit3.fr", "admin");
    const master = await makeUser("master@edit3.fr", "master");
    const deckId = await seedDeck(master.token);
    const before = db.prepare(`SELECT updated_at FROM decks WHERE id = ?`).get(deckId);

    const res = await call(`/api/admin/decks/${deckId}`, {
      method: "PATCH",
      body: { title: "Titre journalisé" },
      token: admin.token,
    });
    assert.equal(res.status, 200);

    const after = db.prepare(`SELECT updated_at FROM decks WHERE id = ?`).get(deckId);
    assert.ok(after.updated_at >= before.updated_at);
    assert.ok(Number.isFinite(Date.parse(after.updated_at)));

    const { events } = await json("/api/admin/audit", { token: admin.token });
    const event = events.find((e) => e.action === "deck.metadata.update");
    assert.ok(event, "un evenement d'audit doit tracer l'edition");
    assert.equal(event.actorEmail, admin.email);
    assert.equal(event.targetType, "deck");
    assert.equal(event.targetId, deckId);
    assert.equal(event.beforeState.title, "Titre initial");
    assert.equal(event.beforeState.description, "Description initiale");
    assert.equal(event.afterState.title, "Titre journalisé");
    // Etat borne : le journal trace une decision, jamais le contenu des fiches.
    assert.deepEqual(Object.keys(event.afterState).sort(), ["description", "title", "visibility"]);

    // Un refus de validation ne laisse ni mutation ni trace.
    const auditBefore = db.prepare(`SELECT COUNT(*) AS n FROM audit_log`).get().n;
    const rejected = await call(`/api/admin/decks/${deckId}`, {
      method: "PATCH",
      body: { title: "" },
      token: admin.token,
    });
    assert.equal(rejected.status, 400);
    assert.equal(db.prepare(`SELECT COUNT(*) AS n FROM audit_log`).get().n, auditBefore);
    assert.equal(
      db.prepare(`SELECT title FROM decks WHERE id = ?`).get(deckId).title,
      "Titre journalisé",
    );
  } finally {
    await close();
  }
});
