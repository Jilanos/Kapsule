// Test bout en bout : un deck "genere par IA" (suivant SPEC.md) est importe
// par l'API, relu, et apparait dans la liste. Couvre aussi la route assets.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// La route assets lit KAPSULE_UPLOADS a l'import du module : on le fixe avant.
const uploadsRoot = mkdtempSync(join(tmpdir(), "kapsule-uploads-"));
process.env.KAPSULE_UPLOADS = uploadsRoot;

const { openDb } = await import("../src/db.mjs");
const { createApp } = await import("../src/app.mjs");

const aiDeck = JSON.parse(
  readFileSync(join(__dirname, "fixtures", "ai-generated-deck.json"), "utf8"),
);

async function startApp() {
  const db = openDb(":memory:");
  const app = createApp(db);
  const server = await new Promise((r) => {
    const s = app.listen(0, () => r(s));
  });
  const base = `http://localhost:${server.address().port}`;

  const reg = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "e2e@kapsule.fr", password: "motdepasse1" }),
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

  return { base, f, close: () => new Promise((r) => server.close(r)) };
}

test("e2e : un deck genere par IA s'importe, se relit et apparait dans la liste", async () => {
  const { f, close } = await startApp();
  try {
    // Import via l'API (comme le ferait l'UI).
    const imp = await f("/api/decks", { method: "POST", body: JSON.stringify(aiDeck) });
    assert.equal(imp.status, 201, await imp.text());

    // Apparait dans la liste.
    const list = await (await f("/api/decks")).json();
    assert.ok(list.some((d) => d.id === "photographie-bases"));

    // Relecture complete, contenu intact.
    const body = await (await f("/api/decks/photographie-bases")).json();
    assert.equal(body.deck.cards.length, 2);
    assert.equal(body.deck.cards[0].sections[0].type, "intro");

    // Import idempotent : re-importer met a jour sans dupliquer.
    await f("/api/decks", { method: "POST", body: JSON.stringify(aiDeck) });
    const list2 = await (await f("/api/decks")).json();
    assert.equal(list2.filter((d) => d.id === "photographie-bases").length, 1);
  } finally {
    await close();
  }
});

test("e2e : la route assets sert une image relative et protege la traversee", async () => {
  const { base, close } = await startApp();
  try {
    // Place une image dans uploads/<deckId>/img/.
    const deckDir = join(uploadsRoot, "photographie-bases", "img");
    mkdirSync(deckDir, { recursive: true });
    writeFileSync(join(deckDir, "test.txt"), "pixels");

    const ok = await fetch(`${base}/api/decks/photographie-bases/assets/img/test.txt`);
    assert.equal(ok.status, 200);
    assert.equal((await ok.text()).trim(), "pixels");

    const missing = await fetch(`${base}/api/decks/photographie-bases/assets/img/nope.png`);
    assert.equal(missing.status, 404);

    const traversal = await fetch(
      `${base}/api/decks/photographie-bases/assets/..%2f..%2fserver.mjs`,
    );
    assert.ok(traversal.status === 400 || traversal.status === 404);
  } finally {
    await close();
  }
});
