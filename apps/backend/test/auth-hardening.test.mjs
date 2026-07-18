// Tests de durcissement de l'authentification (audit 2026-07-18, Vague 2 / AC4,
// et politique de session ADR 003). Deterministes : aucun `sleep`, les seuils
// temporels sont pilotes en manipulant directement les colonnes de session.

import { test } from "node:test";
import assert from "node:assert/strict";
import { openDb } from "../src/db.mjs";
import { createApp } from "../src/app.mjs";
import { AuthStore, MAX_PASSWORD_LENGTH } from "../src/auth.mjs";

async function startApp(options) {
  const db = openDb(":memory:");
  const app = createApp(db, options);
  const server = await new Promise((r) => {
    const s = app.listen(0, () => r(s));
  });
  const base = `http://localhost:${server.address().port}`;
  const post = (path, body) =>
    fetch(`${base}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  return { db, base, post, close: () => new Promise((r) => server.close(r)) };
}

test("AC4 : login est rate-limite (429 au-dela du seuil)", async () => {
  const { post, close } = await startApp({ rateLimit: { windowMs: 60_000, max: 3 } });
  try {
    const creds = { email: "brute@b.fr", password: "motdepasse1" };
    // 3 tentatives autorisees (401 car compte inexistant), la 4e est bloquee.
    for (let i = 0; i < 3; i++) {
      assert.equal((await post("/api/auth/login", creds)).status, 401);
    }
    assert.equal((await post("/api/auth/login", creds)).status, 429);
  } finally {
    await close();
  }
});

test("AC4 : mot de passe trop long rejete a l'inscription (422) et sans blocage a la connexion (401)", async () => {
  const { post, close } = await startApp();
  try {
    const huge = "a".repeat(MAX_PASSWORD_LENGTH + 1);
    const reg = await post("/api/auth/register", { email: "long@b.fr", password: huge });
    assert.equal(reg.status, 422);

    // Un compte valide existe.
    assert.equal(
      (await post("/api/auth/register", { email: "ok@b.fr", password: "motdepasse1" })).status,
      201,
    );
    // Connexion avec un mot de passe surdimensionne : rejet 401, jamais 500/hang.
    const login = await post("/api/auth/login", { email: "ok@b.fr", password: huge });
    assert.equal(login.status, 401);
  } finally {
    await close();
  }
});

test("AC4 : l'inscription est fermee par defaut en production", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevReg = process.env.KAPSULE_REGISTRATION;
  process.env.NODE_ENV = "production";
  delete process.env.KAPSULE_REGISTRATION;
  const { post, close } = await startApp();
  try {
    const reg = await post("/api/auth/register", { email: "prod@b.fr", password: "motdepasse1" });
    assert.equal(reg.status, 403);
  } finally {
    await close();
    process.env.NODE_ENV = prevEnv;
    if (prevReg === undefined) delete process.env.KAPSULE_REGISTRATION;
    else process.env.KAPSULE_REGISTRATION = prevReg;
  }
});

test("AC10 : les ecritures de session sont throttlees (pas d'ecriture a chaque acces)", () => {
  const db = openDb(":memory:");
  db.prepare(`INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)`).run(
    "u1",
    "s@b.fr",
    "scrypt:00:00",
    new Date().toISOString(),
  );
  const auth = new AuthStore(db);
  const token = auth.createSession("u1", "test");
  const readUsed = () =>
    db.prepare(`SELECT last_used_at FROM sessions WHERE token = ?`).get(token).last_used_at;

  const initial = readUsed();
  // Acces immediat : sous le seuil de rafraichissement -> aucune ecriture.
  assert.ok(auth.getSessionUser(token));
  assert.equal(readUsed(), initial, "last_used_at ne doit pas changer sous le seuil");

  // Simule une derniere activite ancienne (2 jours) -> l'acces rafraichit.
  const old = new Date(Date.now() - 2 * 24 * 3600_000).toISOString();
  db.prepare(`UPDATE sessions SET last_used_at = ? WHERE token = ?`).run(old, token);
  assert.ok(auth.getSessionUser(token));
  assert.notEqual(readUsed(), old, "last_used_at doit etre rafraichi au-dela du seuil");
});

test("AC4 : les sessions expirees sont purgees", () => {
  const db = openDb(":memory:");
  db.prepare(`INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)`).run(
    "u1",
    "p@b.fr",
    "scrypt:00:00",
    new Date().toISOString(),
  );
  const auth = new AuthStore(db);
  const expired = auth.createSession("u1", "old");
  const live = auth.createSession("u1", "new");

  // Rend une session expiree.
  db.prepare(`UPDATE sessions SET expires_at = ? WHERE token = ?`).run(
    "2000-01-01T00:00:00.000Z",
    expired,
  );

  assert.equal(auth.purgeExpiredSessions(), 1);
  assert.equal(auth.getSessionUser(expired), null);
  assert.ok(auth.getSessionUser(live), "la session valide survit a la purge");
});
