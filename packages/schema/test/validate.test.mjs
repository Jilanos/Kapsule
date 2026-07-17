import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateDeck } from "../src/index.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const exampleDeck = JSON.parse(
  readFileSync(join(__dirname, "..", "..", "..", "decks", "reseaux-essentiels.json"), "utf8"),
);

/** Copie profonde pour muter un deck sans polluer les autres tests. */
const clone = (v) => JSON.parse(JSON.stringify(v));

test("le deck d'exemple est valide", () => {
  const { valid, errors } = validateDeck(exampleDeck);
  assert.equal(valid, true, JSON.stringify(errors, null, 2));
});

test("rejette une schemaVersion incorrecte", () => {
  const deck = clone(exampleDeck);
  deck.schemaVersion = 2;
  const { valid, errors } = validateDeck(deck);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path.includes("schemaVersion")));
});

test("rejette un deck sans fiches", () => {
  const deck = clone(exampleDeck);
  deck.cards = [];
  const { valid } = validateDeck(deck);
  assert.equal(valid, false);
});

test("rejette un id de deck non slug", () => {
  const deck = clone(exampleDeck);
  deck.id = "Reseaux Essentiels";
  const { valid, errors } = validateDeck(deck);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path.includes("id")));
});

test("rejette un type de section inconnu", () => {
  const deck = clone(exampleDeck);
  deck.cards[0].sections.push({ type: "video", url: "x" });
  const { valid, errors } = validateDeck(deck);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.message.includes("section")));
});

test("rejette une propriete non autorisee dans une section", () => {
  const deck = clone(exampleDeck);
  deck.cards[0].sections[0].couleur = "rouge";
  const { valid, errors } = validateDeck(deck);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.message.includes("non autorisee")));
});

test("rejette un index de reponse quiz hors limites", () => {
  const deck = clone(exampleDeck);
  const quiz = deck.cards[0].sections.find((s) => s.type === "quiz");
  quiz.questions[0].answer = 99;
  const { valid, errors } = validateDeck(deck);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.message.includes("hors limites")));
});

test("rejette des identifiants de fiches dupliques", () => {
  const deck = clone(exampleDeck);
  deck.cards[1].id = deck.cards[0].id;
  const { valid, errors } = validateDeck(deck);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.message.includes("duplique")));
});

test("rejette une fiche sans section", () => {
  const deck = clone(exampleDeck);
  deck.cards[0].sections = [];
  const { valid } = validateDeck(deck);
  assert.equal(valid, false);
});

test("rejette un quiz avec un seul choix", () => {
  const deck = clone(exampleDeck);
  const quiz = deck.cards[0].sections.find((s) => s.type === "quiz");
  quiz.questions[0].choices = ["seul"];
  const { valid } = validateDeck(deck);
  assert.equal(valid, false);
});
