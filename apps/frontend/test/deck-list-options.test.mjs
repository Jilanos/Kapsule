import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DECK_LIST_OPTIONS_KEY,
  DEFAULT_DECK_LIST_OPTIONS,
  filterDecks,
  parseDeckListOptions,
  readDeckListOptions,
  writeDeckListOptions,
} from "../src/lib/deckListOptions.js";

const decks = [
  {
    title: "Réseaux essentiels",
    description: "Adresses IP, DNS et routage",
    tags: ["TCP/IP", "infra"],
  },
  {
    title: "Déploiement web",
    description: "Caddy, Docker et sauvegardes",
    tags: ["ops"],
  },
];

test("deck list search filters title, description and tags without case or accents", () => {
  assert.deepEqual(
    filterDecks(decks, "reseaux").map((deck) => deck.title),
    ["Réseaux essentiels"],
  );
  assert.deepEqual(
    filterDecks(decks, "CADDY").map((deck) => deck.title),
    ["Déploiement web"],
  );
  assert.deepEqual(
    filterDecks(decks, "tcp").map((deck) => deck.title),
    ["Réseaux essentiels"],
  );
  assert.equal(filterDecks(decks, "absent").length, 0);
});

test("deck list options parse invalid storage with defaults", () => {
  assert.deepEqual(parseDeckListOptions(null), DEFAULT_DECK_LIST_OPTIONS);
  assert.deepEqual(parseDeckListOptions("{invalid"), DEFAULT_DECK_LIST_OPTIONS);
  assert.deepEqual(parseDeckListOptions(JSON.stringify({ wide: true })), {
    wide: true,
    showRetention: true,
  });
  assert.deepEqual(parseDeckListOptions(JSON.stringify({ showRetention: false })), {
    wide: false,
    showRetention: false,
  });
});

test("deck list options read and write versioned local storage", () => {
  const storage = new Map();
  const adapter = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
  writeDeckListOptions({ wide: true, showRetention: false }, adapter);
  assert.equal(storage.has(DECK_LIST_OPTIONS_KEY), true);
  assert.deepEqual(readDeckListOptions(adapter), { wide: true, showRetention: false });
});
