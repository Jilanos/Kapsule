// Tests de la matrice des droits : roles (invite/maitre/admin) et visibilite
// des decks (private/general/master), enforcement au niveau des routes.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openDb } from "../src/db.mjs";
import { createApp } from "../src/app.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseDeck = JSON.parse(readFileSync(join(__dirname, "fixtures", "deck-reseaux.json"), "utf8"));

/** Clone le deck d'exemple avec un nouvel id (id unique par test). */
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

  // Cree un compte, force son role en base, renvoie {token, id}.
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

const listIds = async (call, token) =>
  (await (await call("/api/decks", { token })).json()).map((d) => d.id);

test("AC2/AC3 : un invite ne cree que du prive, visible de lui seul", async () => {
  const { call, makeUser, close } = await startApp();
  try {
    const guest = await makeUser("guest@b.fr", "guest");
    const other = await makeUser("other@b.fr", "guest");
    const admin = await makeUser("admin@b.fr", "admin");

    // Creation privee OK (visibilite par defaut).
    const created = await call("/api/decks", {
      method: "POST",
      body: deckWithId("g1"),
      token: guest.token,
    });
    assert.equal(created.status, 201);

    // Un invite ne peut pas creer un deck general.
    const denied = await call("/api/decks?visibility=general", {
      method: "POST",
      body: deckWithId("g2"),
      token: guest.token,
    });
    assert.equal(denied.status, 403);

    // Visible par le proprietaire, invisible pour un autre invite, visible pour l'admin.
    assert.ok((await listIds(call, guest.token)).includes("g1"));
    assert.ok(!(await listIds(call, other.token)).includes("g1"));
    assert.ok((await listIds(call, admin.token)).includes("g1"));

    // Lecture directe refusee (404) pour l'autre invite.
    assert.equal((await call("/api/decks/g1", { token: other.token })).status, 404);
    assert.equal((await call("/api/decks/g1", { token: guest.token })).status, 200);
  } finally {
    await close();
  }
});

test("AC2/AC3 : deck general cree par un maitre, visible par tous", async () => {
  const { call, makeUser, close } = await startApp();
  try {
    const master = await makeUser("master@b.fr", "master");
    const guest = await makeUser("guest@b.fr", "guest");

    const res = await call("/api/decks?visibility=general", {
      method: "POST",
      body: deckWithId("gen1"),
      token: master.token,
    });
    assert.equal(res.status, 201);
    assert.ok((await listIds(call, guest.token)).includes("gen1"));
  } finally {
    await close();
  }
});

test("AC2 : deck maitre invisible pour l'invite, visible pour maitre et admin", async () => {
  const { call, makeUser, close } = await startApp();
  try {
    const master = await makeUser("master@b.fr", "master");
    const guest = await makeUser("guest@b.fr", "guest");
    const admin = await makeUser("admin@b.fr", "admin");

    const res = await call("/api/decks?visibility=master", {
      method: "POST",
      body: deckWithId("m1"),
      token: master.token,
    });
    assert.equal(res.status, 201);

    assert.ok(!(await listIds(call, guest.token)).includes("m1"));
    assert.ok((await listIds(call, master.token)).includes("m1"));
    assert.ok((await listIds(call, admin.token)).includes("m1"));
    assert.equal((await call("/api/decks/m1", { token: guest.token })).status, 404);
  } finally {
    await close();
  }
});

test("AC4 : seul l'admin supprime un deck", async () => {
  const { call, makeUser, close } = await startApp();
  try {
    const master = await makeUser("master@b.fr", "master");
    const guest = await makeUser("guest@b.fr", "guest");
    const admin = await makeUser("admin@b.fr", "admin");

    await call("/api/decks?visibility=general", {
      method: "POST",
      body: deckWithId("d1"),
      token: master.token,
    });

    assert.equal(
      (await call("/api/decks/d1", { method: "DELETE", token: guest.token })).status,
      403,
    );
    assert.equal(
      (await call("/api/decks/d1", { method: "DELETE", token: master.token })).status,
      403,
    );
    assert.equal(
      (await call("/api/decks/d1", { method: "DELETE", token: admin.token })).status,
      204,
    );
    // Supprime -> 404 ensuite.
    assert.equal(
      (await call("/api/decks/d1", { method: "DELETE", token: admin.token })).status,
      404,
    );
  } finally {
    await close();
  }
});

test("AC4 : seul l'admin change la visibilite d'un deck", async () => {
  const { call, makeUser, close } = await startApp();
  try {
    const master = await makeUser("master@b.fr", "master");
    const guest = await makeUser("guest@b.fr", "guest");
    const admin = await makeUser("admin@b.fr", "admin");

    await call("/api/decks?visibility=master", {
      method: "POST",
      body: deckWithId("v1"),
      token: master.token,
    });

    // Non-admin refuses.
    assert.equal(
      (
        await call("/api/decks/v1/visibility", {
          method: "PATCH",
          body: { visibility: "general" },
          token: master.token,
        })
      ).status,
      403,
    );

    // Admin : bascule en general -> desormais visible par l'invite.
    const patched = await call("/api/decks/v1/visibility", {
      method: "PATCH",
      body: { visibility: "general" },
      token: admin.token,
    });
    assert.equal(patched.status, 200);
    assert.ok((await listIds(call, guest.token)).includes("v1"));

    // Visibilite invalide -> 400.
    assert.equal(
      (
        await call("/api/decks/v1/visibility", {
          method: "PATCH",
          body: { visibility: "public" },
          token: admin.token,
        })
      ).status,
      400,
    );
  } finally {
    await close();
  }
});

test("AC2 : l'admin voit les decks prives des autres", async () => {
  const { call, makeUser, close } = await startApp();
  try {
    const guest = await makeUser("guest@b.fr", "guest");
    const admin = await makeUser("admin@b.fr", "admin");

    await call("/api/decks", { method: "POST", body: deckWithId("p1"), token: guest.token });
    assert.ok((await listIds(call, admin.token)).includes("p1"));
    assert.equal((await call("/api/decks/p1", { token: admin.token })).status, 200);
  } finally {
    await close();
  }
});

test("AC1 : un nouvel inscrit est invite par defaut", async () => {
  const { call, close } = await startApp();
  try {
    const reg = await call("/api/auth/register", {
      method: "POST",
      body: { email: "new@b.fr", password: "motdepasse1" },
    });
    const { user } = await reg.json();
    assert.equal(user.role, "guest");
  } finally {
    await close();
  }
});
