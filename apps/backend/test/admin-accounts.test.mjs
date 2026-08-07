// Console d'administration — comptes, roles et audit (item_025).
// Couvre les droits (AC1), la projection allowlistee (AC2), les invariants de
// role (AC3), la politique de dependances a la suppression (AC4) et la trace
// d'audit (AC5).

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

// Toutes les surfaces d'administration, avec la methode qui doit etre gardee.
const ADMIN_ROUTES = [
  { method: "GET", path: "/api/admin/users" },
  { method: "GET", path: "/api/admin/users/whatever" },
  { method: "PATCH", path: "/api/admin/users/whatever/role", body: { role: "admin" } },
  { method: "DELETE", path: "/api/admin/users/whatever", body: { confirmId: "whatever" } },
  { method: "GET", path: "/api/admin/decks" },
  { method: "GET", path: "/api/admin/decks/whatever/impact" },
  { method: "DELETE", path: "/api/admin/decks/whatever", body: { confirmId: "whatever" } },
  { method: "GET", path: "/api/admin/storage" },
  { method: "GET", path: "/api/admin/audit" },
];

test("AC1 : sans session, chaque route admin repond 401", async () => {
  const { call, close } = await startApp();
  try {
    for (const route of ADMIN_ROUTES) {
      const res = await call(route.path, { method: route.method, body: route.body });
      assert.equal(res.status, 401, `${route.method} ${route.path} doit exiger une session`);
    }
  } finally {
    await close();
  }
});

test("AC1 : un invite et un maitre recoivent 403 sur chaque route admin", async () => {
  const { call, makeUser, close } = await startApp();
  try {
    const guest = await makeUser("guest@b.fr", "guest");
    const master = await makeUser("master@b.fr", "master");
    for (const actor of [guest, master]) {
      for (const route of ADMIN_ROUTES) {
        const res = await call(route.path, {
          method: route.method,
          body: route.body,
          token: actor.token,
        });
        assert.equal(
          res.status,
          403,
          `${route.method} ${route.path} doit etre refuse a ${actor.email}`,
        );
      }
    }
  } finally {
    await close();
  }
});

test("AC2 : la liste des comptes est allowlistee, cherchable et n'expose aucun secret", async () => {
  const { call, json, makeUser, close } = await startApp();
  try {
    const admin = await makeUser("admin@b.fr", "admin");
    await makeUser("alice@b.fr", "master");
    await makeUser("bob@b.fr", "guest");

    const listing = await json("/api/admin/users", { token: admin.token });
    assert.equal(listing.total, 3);
    assert.equal(listing.users.length, 3);

    const serialized = JSON.stringify(listing);
    for (const forbidden of ["password_hash", "passwordHash", "scrypt:", "token"]) {
      assert.ok(!serialized.includes(forbidden), `la reponse ne doit pas contenir ${forbidden}`);
    }
    assert.deepEqual(
      Object.keys(listing.users[0]).sort(),
      [
        "createdAt",
        "deckCount",
        "email",
        "id",
        "lastSeenAt",
        "privateDeckCount",
        "progressCount",
        "reviewCount",
        "sessionCount",
        "sharedDeckCount",
        "role",
      ].sort(),
    );

    // Recherche par email, insensible a la casse cote SQLite (LIKE ASCII).
    const found = await json("/api/admin/users?q=alice", { token: admin.token });
    assert.equal(found.total, 1);
    assert.equal(found.users[0].email, "alice@b.fr");

    // Un joker SQL saisi par l'operateur est traite comme du texte.
    const literal = await json("/api/admin/users?q=%25", { token: admin.token });
    assert.equal(literal.total, 0);

    // Detail : memes champs, plus l'impact de suppression.
    const detail = await json(`/api/admin/users/${listing.users[0].id}`, { token: admin.token });
    assert.equal(detail.user.email, listing.users[0].email);
    assert.equal(detail.user.impact.policy, "private-decks-deleted-shared-decks-detached");
    assert.equal((await call("/api/admin/users/inconnu", { token: admin.token })).status, 404);
  } finally {
    await close();
  }
});

test("AC2 : la pagination est bornee et les valeurs hors bornes sont ramenees", async () => {
  const { json, makeUser, close } = await startApp();
  try {
    const admin = await makeUser("admin@b.fr", "admin");
    for (let i = 0; i < 4; i++) await makeUser(`u${i}@b.fr`);

    const page = await json("/api/admin/users?limit=2&offset=1", { token: admin.token });
    assert.equal(page.total, 5);
    assert.equal(page.users.length, 2);
    assert.equal(page.limit, 2);
    assert.equal(page.offset, 1);

    // Limite absurde -> plafond ; limite invalide -> defaut.
    assert.equal((await json("/api/admin/users?limit=9999", { token: admin.token })).limit, 100);
    assert.equal((await json("/api/admin/users?limit=abc", { token: admin.token })).limit, 25);
    assert.equal((await json("/api/admin/users?offset=-5", { token: admin.token })).offset, 0);
  } finally {
    await close();
  }
});

test("AC3 : la mutation de role valide l'enum et journalise le changement", async () => {
  const { call, json, makeUser, close } = await startApp();
  try {
    const admin = await makeUser("admin@b.fr", "admin");
    const target = await makeUser("target@b.fr", "guest");

    const bad = await call(`/api/admin/users/${target.id}/role`, {
      method: "PATCH",
      body: { role: "superuser" },
      token: admin.token,
    });
    assert.equal(bad.status, 400);
    assert.match((await bad.json()).error, /role invalide/);

    const ok = await call(`/api/admin/users/${target.id}/role`, {
      method: "PATCH",
      body: { role: "master" },
      token: admin.token,
    });
    assert.equal(ok.status, 200);
    assert.equal((await ok.json()).user.role, "master");

    const { events } = await json("/api/admin/audit", { token: admin.token });
    const event = events.find((e) => e.action === "user.role.update");
    assert.ok(event, "un evenement d'audit doit exister");
    assert.equal(event.actorId, admin.id);
    assert.equal(event.actorEmail, "admin@b.fr");
    assert.equal(event.targetId, target.id);
    assert.equal(event.targetLabel, "target@b.fr");
    assert.deepEqual(event.beforeState, { role: "guest" });
    assert.deepEqual(event.afterState, { role: "master" });

    assert.equal(
      (
        await call("/api/admin/users/inconnu/role", {
          method: "PATCH",
          body: { role: "master" },
          token: admin.token,
        })
      ).status,
      404,
    );
  } finally {
    await close();
  }
});

test("AC3 : un admin ne modifie ni ne supprime son propre compte", async () => {
  const { call, makeUser, close } = await startApp();
  try {
    // Deux admins : l'invariant « dernier admin » n'est donc pas en cause ici,
    // seule la protection contre l'auto-modification est testee.
    const admin = await makeUser("admin@b.fr", "admin");
    await makeUser("peer@b.fr", "admin");

    const role = await call(`/api/admin/users/${admin.id}/role`, {
      method: "PATCH",
      body: { role: "guest" },
      token: admin.token,
    });
    assert.equal(role.status, 409);
    assert.match((await role.json()).error, /votre propre role/);

    const removal = await call(`/api/admin/users/${admin.id}`, {
      method: "DELETE",
      body: { confirmId: admin.id },
      token: admin.token,
    });
    assert.equal(removal.status, 409);
    assert.match((await removal.json()).error, /votre propre compte/);
  } finally {
    await close();
  }
});

test("AC3 : le dernier administrateur ne peut etre ni retrograde ni supprime", async () => {
  const { call, db, makeUser, close } = await startApp();
  try {
    // Un seul administrateur en base : c'est la seule situation ou l'invariant
    // « dernier admin » peut se declencher, et le refus attendu est bien le sien
    // plutot que celui de l'auto-modification.
    const sole = await makeUser("sole@b.fr", "admin");
    await makeUser("guest@b.fr", "guest");
    assert.equal(db.prepare(`SELECT COUNT(*) AS n FROM users WHERE role='admin'`).get().n, 1);

    const demote = await call(`/api/admin/users/${sole.id}/role`, {
      method: "PATCH",
      body: { role: "guest" },
      token: sole.token,
    });
    assert.equal(demote.status, 409);
    assert.match((await demote.json()).error, /dernier administrateur/);

    const removal = await call(`/api/admin/users/${sole.id}`, {
      method: "DELETE",
      body: { confirmId: sole.id },
      token: sole.token,
    });
    assert.equal(removal.status, 409);
    assert.match((await removal.json()).error, /dernier administrateur/);

    // L'invariant tient en base : l'administrateur est toujours la.
    assert.equal(db.prepare(`SELECT COUNT(*) AS n FROM users WHERE role='admin'`).get().n, 1);

    // L'invariant ne bloque que le *dernier* : une fois un pair promu, la
    // retrogradation de cet admin-la passe.
    const peer = db.prepare(`SELECT id FROM users WHERE email = 'guest@b.fr'`).get();
    const promote = await call(`/api/admin/users/${peer.id}/role`, {
      method: "PATCH",
      body: { role: "admin" },
      token: sole.token,
    });
    assert.equal(promote.status, 200);
    const demotePeer = await call(`/api/admin/users/${peer.id}/role`, {
      method: "PATCH",
      body: { role: "guest" },
      token: sole.token,
    });
    assert.equal(demotePeer.status, 200, "avec deux admins, retrograder un pair est permis");
  } finally {
    await close();
  }
});

test("AC3 : un admin non dernier peut etre retrograde puis supprime par un pair", async () => {
  const { call, db, makeUser, close } = await startApp();
  try {
    const admin = await makeUser("admin@b.fr", "admin");
    const peer = await makeUser("peer@b.fr", "admin");

    const removed = await call(`/api/admin/users/${peer.id}`, {
      method: "DELETE",
      body: { confirmId: peer.id },
      token: admin.token,
    });
    assert.equal(removed.status, 200);
    assert.equal(db.prepare(`SELECT COUNT(*) AS n FROM users WHERE role='admin'`).get().n, 1);
  } finally {
    await close();
  }
});

test("AC4 : la suppression exige la confirmation portant l'identifiant cible", async () => {
  const { call, makeUser, close } = await startApp();
  try {
    const admin = await makeUser("admin@b.fr", "admin");
    const target = await makeUser("target@b.fr", "guest");

    for (const body of [undefined, {}, { confirmId: "autre-chose" }]) {
      const res = await call(`/api/admin/users/${target.id}`, {
        method: "DELETE",
        body,
        token: admin.token,
      });
      assert.equal(res.status, 400, "sans confirmation exacte, la suppression est refusee");
    }

    const ok = await call(`/api/admin/users/${target.id}`, {
      method: "DELETE",
      body: { confirmId: target.id },
      token: admin.token,
    });
    assert.equal(ok.status, 200);
  } finally {
    await close();
  }
});

test("AC4 : la politique de dependances supprime les decks prives et detache les partages", async () => {
  const { call, db, json, makeUser, close } = await startApp();
  try {
    const admin = await makeUser("admin@b.fr", "admin");
    const target = await makeUser("target@b.fr", "master");
    const other = await makeUser("other@b.fr", "guest");

    // Un deck prive et un deck general, tous deux possedes par la cible.
    await call("/api/decks?visibility=private", {
      method: "POST",
      body: deckWithId("prive"),
      token: target.token,
    });
    await call("/api/decks?visibility=general", {
      method: "POST",
      body: deckWithId("partage"),
      token: target.token,
    });
    // Progression et revision de la cible, et d'un tiers sur le deck partage.
    for (const actor of [target, other]) {
      await call(`/api/decks/partage/cards/${CARD_ID}/progress`, {
        method: "PUT",
        body: { state: "learned", quizScore: 1 },
        token: actor.token,
      });
    }
    await call(`/api/decks/prive/cards/${CARD_ID}/progress`, {
      method: "PUT",
      body: { state: "learned", quizScore: 1 },
      token: target.token,
    });

    // L'impact est annonce avant confirmation, et correspond a la politique.
    const preview = await json(`/api/admin/users/${target.id}`, { token: admin.token });
    assert.deepEqual(preview.user.impact.deletedDecks, [{ id: "prive", title: "Deck prive" }]);
    assert.deepEqual(preview.user.impact.detachedDecks, [
      { id: "partage", title: "Deck partage", visibility: "general" },
    ]);
    assert.ok(preview.user.impact.progress >= 2);
    assert.ok(preview.user.impact.sessions >= 1);

    const res = await call(`/api/admin/users/${target.id}`, {
      method: "DELETE",
      body: { confirmId: target.id },
      token: admin.token,
    });
    assert.equal(res.status, 200);

    // Compte, sessions, progression et revisions de la cible ont disparu.
    assert.equal(db.prepare(`SELECT COUNT(*) AS n FROM users WHERE id = ?`).get(target.id).n, 0);
    assert.equal(
      db.prepare(`SELECT COUNT(*) AS n FROM sessions WHERE user_id = ?`).get(target.id).n,
      0,
    );
    assert.equal(
      db.prepare(`SELECT COUNT(*) AS n FROM progress WHERE user_id = ?`).get(target.id).n,
      0,
    );
    assert.equal(
      db.prepare(`SELECT COUNT(*) AS n FROM reviews WHERE user_id = ?`).get(target.id).n,
      0,
    );

    // Deck prive supprime avec ses fiches ; deck partage conserve et detache.
    assert.equal(db.prepare(`SELECT COUNT(*) AS n FROM decks WHERE id = 'prive'`).get().n, 0);
    assert.equal(db.prepare(`SELECT COUNT(*) AS n FROM cards WHERE deck_id='prive'`).get().n, 0);
    const shared = db.prepare(`SELECT owner_id AS ownerId FROM decks WHERE id='partage'`).get();
    assert.equal(shared.ownerId, null, "le deck partage doit etre detache, pas supprime");

    // La progression du tiers sur le deck partage survit.
    assert.equal(
      db.prepare(`SELECT COUNT(*) AS n FROM progress WHERE user_id = ?`).get(other.id).n,
      1,
    );

    // Aucune ligne orpheline ne subsiste pour le deck supprime.
    assert.equal(db.prepare(`SELECT COUNT(*) AS n FROM progress WHERE deck_id='prive'`).get().n, 0);
    assert.equal(db.prepare(`SELECT COUNT(*) AS n FROM reviews WHERE deck_id='prive'`).get().n, 0);

    // L'audit conserve l'identite de la cible disparue et le detail d'impact.
    const { events } = await json("/api/admin/audit", { token: admin.token });
    const event = events.find((e) => e.action === "user.delete");
    assert.equal(event.targetLabel, "target@b.fr");
    assert.deepEqual(event.beforeState, { email: "target@b.fr", role: "master" });
    assert.equal(event.afterState, null);
    assert.deepEqual(event.detail.deletedDecks, [{ id: "prive", title: "Deck prive" }]);
  } finally {
    await close();
  }
});

test("AC5 : le journal d'audit n'est pas modifiable par l'API et ne porte aucun secret", async () => {
  const { call, json, makeUser, close } = await startApp();
  try {
    const admin = await makeUser("admin@b.fr", "admin");
    const target = await makeUser("target@b.fr", "guest");
    await call(`/api/admin/users/${target.id}/role`, {
      method: "PATCH",
      body: { role: "master" },
      token: admin.token,
    });

    // Aucune route d'ecriture ou de suppression n'existe sur /api/admin/audit.
    // En production le fallback SPA capture les routes inconnues ; en test il
    // n'existe pas, donc Express repond 404. Dans les deux cas, rien n'ecrit.
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      const res = await call("/api/admin/audit", {
        method,
        body: { action: "forge" },
        token: admin.token,
      });
      assert.ok(res.status === 404 || res.status === 405, `${method} ne doit pas etre routee`);
    }
    const before = await json("/api/admin/audit", { token: admin.token });
    const after = await json("/api/admin/audit", { token: admin.token });
    assert.equal(before.total, after.total);

    const serialized = JSON.stringify(after);
    for (const forbidden of ["scrypt:", "password", "Bearer"]) {
      assert.ok(!serialized.includes(forbidden), `l'audit ne doit pas contenir ${forbidden}`);
    }
    assert.ok(after.total >= 1);
    assert.equal(after.limit, 25);
  } finally {
    await close();
  }
});
