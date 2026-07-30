import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { openDb } from "../src/db.mjs";
import { createApp } from "../src/app.mjs";
import { Store } from "../src/store.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const exampleDeck = JSON.parse(
  readFileSync(join(__dirname, "..", "..", "..", "decks", "reseaux-essentiels.json"), "utf8"),
);

/**
 * Demarre l'app avec une base en memoire, importe le deck d'exemple, cree un
 * compte et renvoie un fetch pre-authentifie (jette le token dans l'en-tete).
 */
async function startApp() {
  const db = openDb(":memory:");
  new Store(db).importDeck(exampleDeck);
  const app = createApp(db);
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const base = `http://localhost:${server.address().port}`;

  const reg = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "test@kapsule.fr", password: "motdepasse1" }),
  });
  const { token } = await reg.json();

  // fetch authentifie : fusionne le Bearer token et le content-type JSON.
  const f = (path, opts = {}) =>
    fetch(`${base}${path}`, {
      ...opts,
      headers: {
        authorization: `Bearer ${token}`,
        ...(opts.body ? { "content-type": "application/json" } : {}),
        ...(opts.headers ?? {}),
      },
    });

  return { base, f, close: () => new Promise((r) => server.close(r)) };
}

test("GET /api/decks liste les decks avec progression", async () => {
  const { f, close } = await startApp();
  try {
    const res = await f("/api/decks");
    assert.equal(res.status, 200);
    const decks = await res.json();
    assert.equal(decks.length, 1);
    assert.equal(decks[0].id, "reseaux-essentiels");
    assert.equal(decks[0].cardCount, 3);
    assert.deepEqual(decks[0].progress, { learned: 0, seen: 0 });
  } finally {
    await close();
  }
});

test("GET /api/decks/:id renvoie deck + progression", async () => {
  const { f, close } = await startApp();
  try {
    const res = await f("/api/decks/reseaux-essentiels");
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.deck.cards.length, 3);
    assert.deepEqual(body.progress, {});
  } finally {
    await close();
  }
});

test("GET deck inexistant -> 404", async () => {
  const { f, close } = await startApp();
  try {
    const res = await f("/api/decks/inconnu");
    assert.equal(res.status, 404);
  } finally {
    await close();
  }
});

test("routes decks sans token -> 401", async () => {
  const { base, close } = await startApp();
  try {
    assert.equal((await fetch(`${base}/api/decks`)).status, 401);
  } finally {
    await close();
  }
});

test("POST /api/decks rejette un deck invalide avec un rapport", async () => {
  const { f, close } = await startApp();
  try {
    const res = await f("/api/decks", {
      method: "POST",
      body: JSON.stringify({ schemaVersion: 1, id: "x", title: "X", cards: [] }),
    });
    assert.equal(res.status, 422);
    const body = await res.json();
    assert.ok(Array.isArray(body.details));
    assert.ok(typeof body.report === "string");
  } finally {
    await close();
  }
});

test("PUT progress puis relecture -> etat persiste", async () => {
  const { f, close } = await startApp();
  try {
    const put = await f("/api/decks/reseaux-essentiels/cards/adresses-ip/progress", {
      method: "PUT",
      body: JSON.stringify({ state: "learned", quizScore: 2 }),
    });
    assert.equal(put.status, 200);

    const body = await (await f("/api/decks/reseaux-essentiels")).json();
    assert.equal(body.progress["adresses-ip"].state, "learned");

    const list = await (await f("/api/decks")).json();
    assert.equal(list[0].progress.learned, 1);
  } finally {
    await close();
  }
});

test("PUT progress learned puis seen conserve le statut et la revision", async () => {
  const { f, close } = await startApp();
  try {
    const path = "/api/decks/reseaux-essentiels/cards/adresses-ip/progress";
    await f(path, { method: "PUT", body: JSON.stringify({ state: "learned", quizScore: 2 }) });

    const downgraded = await f(path, { method: "PUT", body: JSON.stringify({ state: "seen" }) });
    assert.equal(downgraded.status, 200);
    assert.deepEqual(await downgraded.json(), { ok: true, state: "learned", unchanged: true });

    const body = await (await f("/api/decks/reseaux-essentiels")).json();
    assert.equal(body.progress["adresses-ip"].state, "learned");
  } finally {
    await close();
  }
});

test("PUT progress avec etat invalide -> 422", async () => {
  const { f, close } = await startApp();
  try {
    const res = await f("/api/decks/reseaux-essentiels/cards/adresses-ip/progress", {
      method: "PUT",
      body: JSON.stringify({ state: "maitrise" }),
    });
    assert.equal(res.status, 422);
  } finally {
    await close();
  }
});
