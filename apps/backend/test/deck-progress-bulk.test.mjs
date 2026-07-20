import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openDb } from "../src/db.mjs";
import { createApp } from "../src/app.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseDeck = JSON.parse(readFileSync(join(__dirname, "fixtures", "deck-reseaux.json"), "utf8"));
const deckWithId = (id) => ({ ...baseDeck, id, title: `Deck ${id}` });

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

  const makeUser = async (email, role = "guest") => {
    const reg = await call("/api/auth/register", {
      method: "POST",
      body: { email, password: "motdepasse1" },
    });
    const { token, user } = await reg.json();
    if (role !== "guest") db.prepare(`UPDATE users SET role = ? WHERE id = ?`).run(role, user.id);
    return { token, id: user.id };
  };

  return { db, call, makeUser, close: () => new Promise((r) => server.close(r)) };
}

const bulkPath = (deckId) => `/api/decks/${deckId}/progress`;
const cardProgressPath = (deckId, cardId) => `/api/decks/${deckId}/cards/${cardId}/progress`;

test("bulk deck learned is reserved to masters and admins", async () => {
  const { call, makeUser, close } = await startApp();
  try {
    const master = await makeUser("master@bulk.fr", "master");
    const guest = await makeUser("guest@bulk.fr", "guest");
    await call("/api/decks?visibility=general", {
      method: "POST",
      body: deckWithId("bulk-general"),
      token: master.token,
    });

    const denied = await call(bulkPath("bulk-general"), {
      method: "PUT",
      body: { state: "learned" },
      token: guest.token,
    });
    assert.equal(denied.status, 403);

    const allowed = await call(bulkPath("bulk-general"), {
      method: "PUT",
      body: { state: "learned" },
      token: master.token,
    });
    assert.equal(allowed.status, 200);
  } finally {
    await close();
  }
});

test("bulk deck learned returns 404 for a deck that is not visible", async () => {
  const { call, makeUser, close } = await startApp();
  try {
    const owner = await makeUser("owner@bulk.fr", "guest");
    const master = await makeUser("master@bulk.fr", "master");
    await call("/api/decks", {
      method: "POST",
      body: deckWithId("bulk-private"),
      token: owner.token,
    });

    const denied = await call(bulkPath("bulk-private"), {
      method: "PUT",
      body: { state: "learned" },
      token: master.token,
    });
    assert.equal(denied.status, 404);
  } finally {
    await close();
  }
});

test("bulk deck learned is atomic, idempotent and isolated per user", async () => {
  const { db, call, makeUser, close } = await startApp();
  try {
    const master = await makeUser("master@bulk.fr", "master");
    const admin = await makeUser("admin@bulk.fr", "admin");
    await call("/api/decks?visibility=general", {
      method: "POST",
      body: deckWithId("bulk-shared"),
      token: master.token,
    });

    const cardCount = baseDeck.cards.length;
    const firstCard = baseDeck.cards[0].id;
    const prelearned = await call(cardProgressPath("bulk-shared", firstCard), {
      method: "PUT",
      body: { state: "learned", quizScore: 2 },
      token: master.token,
    });
    assert.equal(prelearned.status, 200);

    const invalid = await call(bulkPath("bulk-shared"), {
      method: "PUT",
      body: { state: "seen" },
      token: master.token,
    });
    assert.equal(invalid.status, 422);
    assert.equal(
      db
        .prepare(
          `SELECT COUNT(*) AS n FROM progress
           WHERE user_id = ? AND deck_id = ? AND state = 'learned'`,
        )
        .get(master.id, "bulk-shared").n,
      1,
    );

    const first = await call(bulkPath("bulk-shared"), {
      method: "PUT",
      body: { state: "learned" },
      token: master.token,
    });
    assert.equal(first.status, 200);
    const firstBody = await first.json();
    assert.equal(firstBody.changed, cardCount - 1);
    assert.deepEqual(firstBody.progress, { learned: cardCount, seen: cardCount });

    const second = await call(bulkPath("bulk-shared"), {
      method: "PUT",
      body: { state: "learned" },
      token: master.token,
    });
    assert.equal(second.status, 200);
    assert.equal((await second.json()).changed, 0);

    const masterProgress = db
      .prepare(
        `SELECT COUNT(*) AS n FROM progress
         WHERE user_id = ? AND deck_id = ? AND state = 'learned'`,
      )
      .get(master.id, "bulk-shared");
    const adminProgress = db
      .prepare(
        `SELECT COUNT(*) AS n FROM progress
         WHERE user_id = ? AND deck_id = ? AND state = 'learned'`,
      )
      .get(admin.id, "bulk-shared");
    assert.equal(masterProgress.n, cardCount);
    assert.equal(adminProgress.n, 0);

    const reviews = db
      .prepare(
        `SELECT COUNT(*) AS n, SUM(CASE WHEN last_grade = 4 THEN 1 ELSE 0 END) AS manualGrades
         FROM reviews WHERE user_id = ? AND deck_id = ?`,
      )
      .get(master.id, "bulk-shared");
    assert.equal(reviews.n, cardCount);
    assert.equal(reviews.manualGrades, cardCount - 1);
  } finally {
    await close();
  }
});
