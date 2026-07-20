import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = readFileSync(
  join(import.meta.dirname, "..", "src", "pages", "DeckReader.jsx"),
  "utf8",
);

test("DeckReader remounts CardView when the active card changes", () => {
  const cardViewOpen = source.indexOf("<CardView");
  assert.notEqual(cardViewOpen, -1, "DeckReader should render CardView");

  const cardViewClose = source.indexOf("/>", cardViewOpen);
  assert.notEqual(cardViewClose, -1, "CardView render should be self-closing in DeckReader");

  const cardViewProps = source.slice(cardViewOpen, cardViewClose);
  assert.match(
    cardViewProps,
    /\bkey=\{card\.id\}/,
    "CardView needs key={card.id} so quiz answers do not leak between cards",
  );
});
