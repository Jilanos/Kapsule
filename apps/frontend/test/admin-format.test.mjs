import { test } from "node:test";
import assert from "node:assert/strict";
import {
  UNAVAILABLE,
  describeAuditTransition,
  describeDeckImpact,
  describeUserImpact,
  formatBytes,
  formatDateTime,
  formatUsage,
} from "../src/lib/adminFormat.js";

test("formatBytes annonce l'indisponibilite au lieu d'afficher un zero trompeur", () => {
  assert.equal(formatBytes(null), UNAVAILABLE);
  assert.equal(formatBytes(undefined), UNAVAILABLE);
  assert.equal(formatBytes("pas un nombre"), UNAVAILABLE);
  // Un zero mesure reste un zero.
  assert.equal(formatBytes(0), "0 o");
});

test("formatBytes echelonne les unites avec une precision decroissante", () => {
  assert.equal(formatBytes(512), "512 o");
  assert.equal(formatBytes(1024), "1,0 ko");
  assert.equal(formatBytes(1536), "1,5 ko");
  assert.equal(formatBytes(1024 * 1024 * 2.5), "2,5 Mo");
  // Au-dela de 10, plus de decimale.
  assert.equal(formatBytes(1024 * 1024 * 128), "128 Mo");
});

test("formatUsage distingue une categorie indisponible d'une categorie vide", () => {
  assert.equal(formatUsage(null), UNAVAILABLE);
  assert.equal(formatUsage({ available: false, bytes: null }), UNAVAILABLE);
  assert.equal(formatUsage({ available: true, bytes: 0 }), "0 o");
  assert.equal(formatUsage({ available: true, bytes: 2048 }), "2,0 ko");
});

test("formatDateTime rend un tiret quand l'activite est inconnue", () => {
  assert.equal(formatDateTime(null), "—");
  assert.equal(formatDateTime(""), "—");
  assert.equal(formatDateTime("pas une date"), "—");
  assert.match(formatDateTime("2026-08-07T10:30:00.000Z"), /2026/);
});

test("describeUserImpact rend explicite la politique de dependances", () => {
  const lines = describeUserImpact({
    deletedDecks: [{ id: "a", title: "Deck A" }],
    detachedDecks: [{ id: "b", title: "Deck B", visibility: "general" }],
    deletedCards: 3,
    progress: 12,
    reviews: 4,
    sessions: 1,
  });
  const text = lines.join(" | ");
  assert.match(text, /deck privé supprimé : Deck A/);
  assert.match(text, /deck partagé conservé sans propriétaire : Deck B/);
  assert.match(text, /3 fiches supprimées/);
  assert.match(text, /12 lignes de progression supprimées/);
  assert.match(text, /1 session révoquée/);
});

test("describeUserImpact reste lisible quand il n'y a aucun contenu", () => {
  const lines = describeUserImpact({ progress: 0, reviews: 0, sessions: 0 });
  assert.deepEqual(lines, [
    "0 ligne de progression supprimée",
    "0 révision supprimée",
    "0 session révoquée",
  ]);
  assert.deepEqual(describeUserImpact(null), []);
});

test("describeDeckImpact met en avant les comptes tiers affectes", () => {
  const lines = describeDeckImpact({
    cards: 8,
    progress: 5,
    reviews: 5,
    affectedUsers: 2,
    assetBytes: 4096,
  });
  const text = lines.join(" | ");
  assert.match(text, /8 fiches supprimées/);
  assert.match(text, /2 comptes affectés par cette suppression/);
  assert.match(text, /Assets : 4,0 ko/);

  // Sans asset mesurable, l'indisponibilite est annoncee.
  assert.match(
    describeDeckImpact({
      cards: 1,
      progress: 0,
      reviews: 0,
      affectedUsers: 0,
      assetBytes: null,
    }).join(" | "),
    new RegExp(`Assets : ${UNAVAILABLE}`),
  );
  // Aucun compte affecte -> pas de ligne bruyante.
  assert.ok(
    !describeDeckImpact({ cards: 1, progress: 0, reviews: 0, affectedUsers: 0 })
      .join(" | ")
      .includes("affecté"),
  );
});

test("describeAuditTransition resume roles, visibilites et suppressions", () => {
  assert.equal(
    describeAuditTransition({ beforeState: { role: "guest" }, afterState: { role: "master" } }),
    "guest → master",
  );
  assert.equal(
    describeAuditTransition({
      beforeState: { visibility: "general" },
      afterState: { visibility: "master" },
    }),
    "general → master",
  );
  assert.equal(
    describeAuditTransition({ beforeState: { role: "admin" }, afterState: null }),
    "admin → supprimé",
  );
  assert.equal(describeAuditTransition({}), "");
  assert.equal(describeAuditTransition(null), "");
});
