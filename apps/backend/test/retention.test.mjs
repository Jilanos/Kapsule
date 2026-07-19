// Tests du modele de retention pur (courbe de l'oubli derivee de SM-2).

import { test } from "node:test";
import assert from "node:assert/strict";
import { daysSince, retentionOfCard, retentionOfDeck, retentionSeries } from "../src/retention.mjs";

// Horloge fixe injectee pour un determinisme total.
const NOW = new Date("2026-07-19T12:00:00.000Z");
const isoDaysAgo = (d) => new Date(NOW.getTime() - d * 86_400_000).toISOString();

test("daysSince mesure l'ecart en jours", () => {
  assert.equal(Math.round(daysSince(isoDaysAgo(3), NOW)), 3);
});

test("une fiche juste revisee a une retention ~ 1", () => {
  const r = retentionOfCard({ interval: 6, updatedAt: NOW.toISOString() }, NOW);
  assert.ok(r > 0.99, `attendu ~1, obtenu ${r}`);
});

test("la retention decroit de facon monotone avec le temps", () => {
  const review = { interval: 6, updatedAt: isoDaysAgo(0) };
  const r0 = retentionOfCard({ ...review, updatedAt: isoDaysAgo(0) }, NOW);
  const r3 = retentionOfCard({ ...review, updatedAt: isoDaysAgo(3) }, NOW);
  const r6 = retentionOfCard({ ...review, updatedAt: isoDaysAgo(6) }, NOW);
  assert.ok(r0 > r3 && r3 > r6, `${r0} > ${r3} > ${r6}`);
});

test("a t = S (un intervalle ecoule), la retention vaut 0.5", () => {
  const r = retentionOfCard({ interval: 6, updatedAt: isoDaysAgo(6) }, NOW);
  assert.ok(Math.abs(r - 0.5) < 1e-9, `attendu 0.5, obtenu ${r}`);
});

test("une fiche tres en retard a une retention proche de 0", () => {
  const r = retentionOfCard({ interval: 2, updatedAt: isoDaysAgo(60) }, NOW);
  assert.ok(r < 0.001, `attendu ~0, obtenu ${r}`);
});

test("la retention reste bornee dans [0,1]", () => {
  const future = retentionOfCard({ interval: 6, updatedAt: isoDaysAgo(-5) }, NOW); // revisee "apres" now
  assert.ok(future <= 1 && future >= 0);
  const old = retentionOfCard({ interval: 1, updatedAt: isoDaysAgo(999) }, NOW);
  assert.ok(old >= 0 && old <= 1);
});

test("une revision reussie fait remonter la retention (intervalle plus long, updatedAt recent)", () => {
  const avant = retentionOfCard({ interval: 6, updatedAt: isoDaysAgo(6) }, NOW); // ~0.5
  const apres = retentionOfCard({ interval: 15, updatedAt: isoDaysAgo(0) }, NOW); // ~1
  assert.ok(apres > avant);
});

test("retentionOfDeck moyenne les fiches ; deck sans fiche -> null", () => {
  assert.equal(retentionOfDeck([], NOW), null);
  const reviews = [
    { interval: 6, updatedAt: isoDaysAgo(0) }, // ~1
    { interval: 6, updatedAt: isoDaysAgo(6) }, // ~0.5
  ];
  const r = retentionOfDeck(reviews, NOW);
  assert.ok(r > 0.7 && r < 0.8, `moyenne attendue ~0.75, obtenue ${r}`);
});

test("retentionSeries : vide sans fiche, sinon monotone decroissante du present vers le futur", () => {
  assert.deepEqual(retentionSeries([], NOW), []);
  const series = retentionSeries([{ interval: 6, updatedAt: isoDaysAgo(0) }], NOW, {
    days: 14,
    samples: 8,
  });
  assert.equal(series.length, 8);
  assert.ok(series[0] > 0.99, "commence au present ~1");
  for (let i = 1; i < series.length; i++) {
    assert.ok(series[i] <= series[i - 1], `point ${i} (${series[i]}) <= ${series[i - 1]}`);
  }
  assert.ok(series.every((r) => r >= 0 && r <= 1));
});
