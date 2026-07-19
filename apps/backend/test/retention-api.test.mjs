// Tests d'integration : enrichissement de GET /api/decks avec la retention.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openDb } from "../src/db.mjs";
import { createApp } from "../src/app.mjs";
import { Store } from "../src/store.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const exampleDeck = JSON.parse(
  readFileSync(join(__dirname, "fixtures", "deck-reseaux.json"), "utf8"),
);

async function startApp() {
  const db = openDb(":memory:");
  const store = new Store(db);
  store.importDeck(exampleDeck);
  const app = createApp(db);
  const server = await new Promise((r) => {
    const s = app.listen(0, () => r(s));
  });
  const base = `http://localhost:${server.address().port}`;
  const reg = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "ret@kapsule.fr", password: "motdepasse1" }),
  });
  const { token } = await reg.json();
  const f = (path, opts = {}) =>
    fetch(`${base}${path}`, {
      ...opts,
      headers: {
        authorization: `Bearer ${token}`,
        ...(opts.body ? { "content-type": "application/json" } : {}),
        ...(opts.headers ?? {}),
      },
    });
  return { f, store, close: () => new Promise((r) => server.close(r)) };
}

test("AC1 : deck sans fiche en cycle -> valeurs de retention neutres", async () => {
  const { f, close } = await startApp();
  try {
    const decks = await (await f("/api/decks")).json();
    const deck = decks.find((d) => d.id === "reseaux-essentiels");
    assert.ok(deck, "le deck doit etre liste");
    assert.equal(deck.dueCount, 0);
    assert.equal(deck.retention, null);
    assert.deepEqual(deck.retentionSeries, []);
    // Non-cassure : les champs historiques restent presents.
    assert.ok(deck.progress && typeof deck.cardCount === "number");
  } finally {
    await close();
  }
});

test("AC1 : apres apprentissage, retention et serie sont exposees ; dueCount reflete les echeances", async () => {
  const { f, store, close } = await startApp();
  try {
    const uid = (await (await f("/api/auth/me")).json()).user.id;
    // Apprend deux fiches -> entrent dans le cycle de revision (due J+1).
    for (const cardId of ["adresses-ip", "dns"]) {
      await f(`/api/decks/reseaux-essentiels/cards/${cardId}/progress`, {
        method: "PUT",
        body: JSON.stringify({ state: "learned", quizScore: 2 }),
      });
    }

    let decks = await (await f("/api/decks")).json();
    let deck = decks.find((d) => d.id === "reseaux-essentiels");
    assert.equal(deck.dueCount, 0, "fraichement apprises -> rien de du aujourd'hui");
    assert.ok(deck.retention > 0.9, `retention fraiche attendue haute, obtenue ${deck.retention}`);
    assert.ok(Array.isArray(deck.retentionSeries) && deck.retentionSeries.length >= 2);
    // La serie decroit vers le futur.
    const s = deck.retentionSeries;
    assert.ok(s[s.length - 1] <= s[0]);

    // Force une echeance dans le passe -> la fiche devient due.
    store.db
      .prepare(`UPDATE reviews SET due_date='2000-01-01' WHERE user_id=? AND card_id='adresses-ip'`)
      .run(uid);
    decks = await (await f("/api/decks")).json();
    deck = decks.find((d) => d.id === "reseaux-essentiels");
    assert.equal(deck.dueCount, 1, "une fiche echue -> dueCount = 1");
  } finally {
    await close();
  }
});
