// Tests de non-regression P0 (audit 2026-07-18) : les ecritures de progression
// et de revision, ainsi que la liste des revisions dues, appliquent la meme
// decision d'autorisation que la lecture d'un deck.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openDb } from "../src/db.mjs";
import { createApp } from "../src/app.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseDeck = JSON.parse(readFileSync(join(__dirname, "fixtures", "deck-reseaux.json"), "utf8"));
const CARD_ID = "adresses-ip";
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

const progressPath = (deckId) => `/api/decks/${deckId}/cards/${CARD_ID}/progress`;
const reviewPath = (deckId) => `/api/decks/${deckId}/cards/${CARD_ID}/review`;

test("P0 : ecriture de progression refusee sur un deck non visible (404)", async () => {
  const { call, makeUser, close } = await startApp();
  try {
    const owner = await makeUser("owner@b.fr", "guest");
    const other = await makeUser("other@b.fr", "guest");

    // Deck prive appartenant a `owner`.
    assert.equal(
      (await call("/api/decks", { method: "POST", body: deckWithId("priv"), token: owner.token }))
        .status,
      201,
    );

    // Un autre invite ne peut pas ecrire de progression (deck invisible).
    const denied = await call(progressPath("priv"), {
      method: "PUT",
      body: { state: "seen" },
      token: other.token,
    });
    assert.equal(denied.status, 404);

    // Le proprietaire, lui, peut ecrire.
    const ok = await call(progressPath("priv"), {
      method: "PUT",
      body: { state: "seen" },
      token: owner.token,
    });
    assert.equal(ok.status, 200);
  } finally {
    await close();
  }
});

test("P0 : ecriture de revision refusee sur un deck non visible (404)", async () => {
  const { call, makeUser, close } = await startApp();
  try {
    const owner = await makeUser("owner@b.fr", "guest");
    const other = await makeUser("other@b.fr", "guest");

    await call("/api/decks", { method: "POST", body: deckWithId("priv"), token: owner.token });

    const denied = await call(reviewPath("priv"), {
      method: "POST",
      body: { quizScore: 1 },
      token: other.token,
    });
    assert.equal(denied.status, 404);

    const ok = await call(reviewPath("priv"), {
      method: "POST",
      body: { quizScore: 1 },
      token: owner.token,
    });
    assert.equal(ok.status, 200);
  } finally {
    await close();
  }
});

test("P0 : les revisions dues refiltrent la visibilite courante du deck", async () => {
  const { db, call, makeUser, close } = await startApp();
  try {
    const master = await makeUser("master@b.fr", "master");
    const guest = await makeUser("guest@b.fr", "guest");

    // Deck general cree par un maitre : visible par l'invite.
    await call("/api/decks?visibility=general", {
      method: "POST",
      body: deckWithId("shared"),
      token: master.token,
    });

    // L'invite apprend une fiche -> une revision est creee pour lui.
    assert.equal(
      (
        await call(progressPath("shared"), {
          method: "PUT",
          body: { state: "learned", quizScore: 1 },
          token: guest.token,
        })
      ).status,
      200,
    );

    // On force l'echeance dans le passe pour la rendre "due" aujourd'hui.
    db.prepare(
      `UPDATE reviews SET due_date = '2000-01-01' WHERE deck_id = 'shared' AND user_id = ?`,
    ).run(guest.id);

    // Tant que le deck est general, la fiche est due pour l'invite.
    const before = await (await call("/api/reviews/due", { token: guest.token })).json();
    assert.ok(
      before.some((r) => r.deckId === "shared"),
      "la fiche doit etre due avant changement",
    );

    // Un admin bascule le deck en visibilite "master".
    const admin = await makeUser("admin@b.fr", "admin");
    assert.equal(
      (
        await call("/api/decks/shared/visibility", {
          method: "PATCH",
          body: { visibility: "master" },
          token: admin.token,
        })
      ).status,
      200,
    );

    // L'invite ne voit plus le deck : la revision due ne doit plus exposer son titre.
    const after = await (await call("/api/reviews/due", { token: guest.token })).json();
    assert.ok(
      !after.some((r) => r.deckId === "shared"),
      "la fiche ne doit plus etre due apres passage master",
    );

    // Le maitre, lui, la voit toujours.
    const forMaster = await (await call("/api/reviews/due", { token: master.token })).json();
    // (le maitre n'a pas appris la fiche -> pas de revision propre ; on verifie
    // simplement que la requete reste saine)
    assert.ok(Array.isArray(forMaster));
  } finally {
    await close();
  }
});
