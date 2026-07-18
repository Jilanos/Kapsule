// Tests de l'authentification : comptes, sessions par appareil, cloisonnement,
// migration de la progression `default`, inscription fermable.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openDb } from "../src/db.mjs";
import { createApp } from "../src/app.mjs";
import { Store } from "../src/store.mjs";
import { hashPassword, verifyPassword } from "../src/auth.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const exampleDeck = JSON.parse(
  readFileSync(join(__dirname, "fixtures", "deck-reseaux.json"), "utf8"),
);

async function startApp(seed) {
  const db = openDb(":memory:");
  if (seed) seed(new Store(db));
  const app = createApp(db);
  const server = await new Promise((r) => {
    const s = app.listen(0, () => r(s));
  });
  const base = `http://localhost:${server.address().port}`;
  return { base, close: () => new Promise((r) => server.close(r)) };
}

const post = (base, path, body, token) =>
  fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

test("hachage scrypt : verifie le bon mot de passe, rejette le mauvais", async () => {
  const h = await hashPassword("correct horse battery");
  assert.ok(!h.includes("correct horse battery")); // jamais en clair
  assert.equal(await verifyPassword("correct horse battery", h), true);
  assert.equal(await verifyPassword("mauvais", h), false);
});

test("AC1 : inscription, connexion, deconnexion", async () => {
  const { base, close } = await startApp();
  try {
    const reg = await post(base, "/api/auth/register", {
      email: "a@b.fr",
      password: "motdepasse1",
    });
    assert.equal(reg.status, 201);
    const { token } = await reg.json();
    assert.ok(token);

    // me() avec le token
    const me = await fetch(`${base}/api/auth/me`, {
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(me.status, 200);
    assert.equal((await me.json()).user.email, "a@b.fr");

    // login independant
    const login = await post(base, "/api/auth/login", { email: "a@b.fr", password: "motdepasse1" });
    assert.equal(login.status, 200);

    // mauvais mot de passe
    const bad = await post(base, "/api/auth/login", { email: "a@b.fr", password: "xxxxxxxx" });
    assert.equal(bad.status, 401);

    // logout invalide le token
    const out = await post(base, "/api/auth/logout", {}, token);
    assert.equal(out.status, 204);
    const after = await fetch(`${base}/api/auth/me`, {
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(after.status, 401);
  } finally {
    await close();
  }
});

test("AC1 : email duplique et mot de passe trop court rejetes", async () => {
  const { base, close } = await startApp();
  try {
    await post(base, "/api/auth/register", { email: "dup@b.fr", password: "motdepasse1" });
    const dup = await post(base, "/api/auth/register", {
      email: "dup@b.fr",
      password: "motdepasse2",
    });
    assert.equal(dup.status, 409);
    const short = await post(base, "/api/auth/register", { email: "x@b.fr", password: "court" });
    assert.equal(short.status, 422);
  } finally {
    await close();
  }
});

test("AC2 : deux appareils, la deconnexion de l'un n'affecte pas l'autre", async () => {
  const { base, close } = await startApp();
  try {
    await post(base, "/api/auth/register", { email: "multi@b.fr", password: "motdepasse1" });
    const t1 = (
      await (
        await post(base, "/api/auth/login", { email: "multi@b.fr", password: "motdepasse1" })
      ).json()
    ).token;
    const t2 = (
      await (
        await post(base, "/api/auth/login", { email: "multi@b.fr", password: "motdepasse1" })
      ).json()
    ).token;
    assert.notEqual(t1, t2);

    await post(base, "/api/auth/logout", {}, t1);
    // t1 revoque, t2 toujours valide
    assert.equal(
      (await fetch(`${base}/api/auth/me`, { headers: { authorization: `Bearer ${t1}` } })).status,
      401,
    );
    assert.equal(
      (await fetch(`${base}/api/auth/me`, { headers: { authorization: `Bearer ${t2}` } })).status,
      200,
    );
  } finally {
    await close();
  }
});

test("AC3 : routes decks/progression exigent une session et cloisonnent par utilisateur", async () => {
  const { base, close } = await startApp((store) => store.importDeck(exampleDeck));
  try {
    // sans token -> 401
    assert.equal((await fetch(`${base}/api/decks`)).status, 401);

    const tA = (
      await (
        await post(base, "/api/auth/register", { email: "userA@b.fr", password: "motdepasse1" })
      ).json()
    ).token;
    const tB = (
      await (
        await post(base, "/api/auth/register", { email: "userB@b.fr", password: "motdepasse1" })
      ).json()
    ).token;

    // A marque une fiche apprise
    await fetch(`${base}/api/decks/reseaux-essentiels/cards/adresses-ip/progress`, {
      method: "PUT",
      headers: { "content-type": "application/json", authorization: `Bearer ${tA}` },
      body: JSON.stringify({ state: "learned", quizScore: 2 }),
    });

    // A voit sa progression, B ne voit rien
    const listA = await (
      await fetch(`${base}/api/decks`, { headers: { authorization: `Bearer ${tA}` } })
    ).json();
    const listB = await (
      await fetch(`${base}/api/decks`, { headers: { authorization: `Bearer ${tB}` } })
    ).json();
    assert.equal(listA[0].progress.learned, 1);
    assert.equal(listB[0].progress.learned, 0);
  } finally {
    await close();
  }
});

test("AC4 : la progression `default` est migree vers le premier compte cree", async () => {
  const { base, close } = await startApp((store) => {
    store.importDeck(exampleDeck);
    // progression accumulee avant l'existence de comptes (utilisateur MVP)
    store.setProgress("reseaux-essentiels", "adresses-ip", "learned", 2, "default");
    store.setProgress("reseaux-essentiels", "dns", "seen", null, "default");
  });
  try {
    const token = (
      await (
        await post(base, "/api/auth/register", { email: "first@b.fr", password: "motdepasse1" })
      ).json()
    ).token;
    const list = await (
      await fetch(`${base}/api/decks`, { headers: { authorization: `Bearer ${token}` } })
    ).json();
    assert.equal(list[0].progress.learned, 1);
    assert.equal(list[0].progress.seen, 2);
  } finally {
    await close();
  }
});

test("AC5 : KAPSULE_REGISTRATION=closed ferme l'inscription mais pas la connexion", async () => {
  const { base, close } = await startApp();
  try {
    // un compte existe deja avant fermeture
    await post(base, "/api/auth/register", { email: "existing@b.fr", password: "motdepasse1" });

    process.env.KAPSULE_REGISTRATION = "closed";
    try {
      const reg = await post(base, "/api/auth/register", {
        email: "new@b.fr",
        password: "motdepasse1",
      });
      assert.equal(reg.status, 403);
      // la connexion existante fonctionne toujours
      const login = await post(base, "/api/auth/login", {
        email: "existing@b.fr",
        password: "motdepasse1",
      });
      assert.equal(login.status, 200);
    } finally {
      delete process.env.KAPSULE_REGISTRATION;
    }
  } finally {
    await close();
  }
});
