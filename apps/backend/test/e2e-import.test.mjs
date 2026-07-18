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
// Secret de signature fixe pour ce process de test (ADR 003) : doit etre pose
// avant l'import du module de signature (lu au chargement).
process.env.KAPSULE_ASSET_SECRET = "test-secret-e2e";

const { openDb } = await import("../src/db.mjs");
const { createApp } = await import("../src/app.mjs");
const { signAssetUrl } = await import("../src/asset-signing.mjs");

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

test("e2e : la route assets exige une URL signee et protege la traversee", async () => {
  const { base, close } = await startApp();
  try {
    // Place une image dans uploads/<deckId>/img/.
    const deckDir = join(uploadsRoot, "photographie-bases", "img");
    mkdirSync(deckDir, { recursive: true });
    writeFileSync(join(deckDir, "test.txt"), "pixels");

    // URL signee valide -> 200.
    const ok = await fetch(`${base}${signAssetUrl("photographie-bases", "img/test.txt")}`);
    assert.equal(ok.status, 200);
    assert.equal((await ok.text()).trim(), "pixels");

    // Sans signature -> 403 (l'ancienne route publique est fermee).
    const unsigned = await fetch(`${base}/api/decks/photographie-bases/assets/img/test.txt`);
    assert.equal(unsigned.status, 403);

    // Signature valide mais fichier absent -> 404.
    const missing = await fetch(`${base}${signAssetUrl("photographie-bases", "img/nope.png")}`);
    assert.equal(missing.status, 404);

    // Signature expiree -> 403.
    const expired = await fetch(
      `${base}${signAssetUrl("photographie-bases", "img/test.txt", { now: 0 })}`,
    );
    assert.equal(expired.status, 403);

    // Traversee : quel que soit le code (400 traversee explicite, 403 signature
    // absente sur le chemin neutralise, 404 fichier hors dossier), server.mjs
    // n'est jamais servi.
    const traversal = await fetch(
      `${base}/api/decks/photographie-bases/assets/..%2f..%2fserver.mjs`,
    );
    assert.ok([400, 403, 404].includes(traversal.status));
    assert.notEqual(traversal.status, 200);
  } finally {
    await close();
  }
});
