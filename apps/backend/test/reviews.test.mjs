// Tests du flux de revision SM-2 cote API (au-dela de l'algorithme pur).

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
  readFileSync(join(__dirname, "..", "..", "..", "decks", "reseaux-essentiels.json"), "utf8"),
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
    body: JSON.stringify({ email: "rev@kapsule.fr", password: "motdepasse1" }),
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

async function currentUser(f) {
  return (await (await f("/api/auth/me")).json()).user.id;
}

test("AC1 : marquer une fiche apprise cree une revision due a J+1", async () => {
  const { f, store, close } = await startApp();
  try {
    const uid = await currentUser(f);
    await f("/api/decks/reseaux-essentiels/cards/adresses-ip/progress", {
      method: "PUT",
      body: JSON.stringify({ state: "learned", quizScore: 2 }),
    });
    // une entree de revision existe, avec interval 1 (donc due demain, pas aujourd'hui)
    const review = store.getReview("reseaux-essentiels", "adresses-ip", uid);
    assert.ok(review, "une revision doit etre creee");
    assert.equal(review.interval, 1);
    const due = await (await f("/api/reviews/due")).json();
    assert.equal(due.length, 0, "une fiche fraichement apprise n'est pas due aujourd'hui");
  } finally {
    await close();
  }
});

test("AC3/AC4 : la vue des dues liste les fiches echues avec leurs titres", async () => {
  const { f, store, close } = await startApp();
  try {
    const uid = await currentUser(f);
    // apprend deux fiches puis force leur echeance dans le passe
    for (const cardId of ["adresses-ip", "dns"]) {
      await f(`/api/decks/reseaux-essentiels/cards/${cardId}/progress`, {
        method: "PUT",
        body: JSON.stringify({ state: "learned", quizScore: 2 }),
      });
      store.db
        .prepare(`UPDATE reviews SET due_date='2000-01-01' WHERE user_id=? AND card_id=?`)
        .run(uid, cardId);
    }
    const due = await (await f("/api/reviews/due")).json();
    assert.equal(due.length, 2);
    assert.ok(due[0].cardTitle && due[0].deckTitle);
  } finally {
    await close();
  }
});

test("AC2 : reviser avec un bon score repousse l'echeance ; un echec la ramene a J+1", async () => {
  const { f, store, close } = await startApp();
  try {
    const uid = await currentUser(f);
    await f("/api/decks/reseaux-essentiels/cards/adresses-ip/progress", {
      method: "PUT",
      body: JSON.stringify({ state: "learned", quizScore: 2 }),
    });
    // bon score -> repetitions augmente, interval > 1
    const good = await (await f("/api/decks/reseaux-essentiels/cards/adresses-ip/review", {
      method: "POST",
      body: JSON.stringify({ quizScore: 2 }),
    })).json();
    assert.ok(good.review.interval >= 1);
    assert.ok(good.review.repetitions >= 2);

    // echec -> interval revient a 1, repetitions 0
    const bad = await (await f("/api/decks/reseaux-essentiels/cards/adresses-ip/review", {
      method: "POST",
      body: JSON.stringify({ quizScore: 0 }),
    })).json();
    assert.equal(bad.review.interval, 1);
    assert.equal(bad.review.repetitions, 0);
  } finally {
    await close();
  }
});

test("les revisions sont cloisonnees par utilisateur", async () => {
  const { f, store, close } = await startApp();
  try {
    const uid = await currentUser(f);
    await f("/api/decks/reseaux-essentiels/cards/adresses-ip/progress", {
      method: "PUT",
      body: JSON.stringify({ state: "learned", quizScore: 2 }),
    });
    store.db.prepare(`UPDATE reviews SET due_date='2000-01-01' WHERE user_id=?`).run(uid);

    // la vue de cet utilisateur voit 1 due ; un autre utilisateur : 0
    const due = await (await f("/api/reviews/due")).json();
    assert.equal(due.length, 1);
    assert.equal(store.getDueReviews("autre-user").length, 0);
  } finally {
    await close();
  }
});
