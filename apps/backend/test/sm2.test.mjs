import { test } from "node:test";
import assert from "node:assert/strict";
import { schedule, gradeFromQuiz, addDays } from "../src/sm2.mjs";

test("premiere planification reussie -> interval 1 jour", () => {
  const s = schedule(null, 5);
  assert.equal(s.interval, 1);
  assert.equal(s.repetitions, 1);
});

test("progression des intervalles sur rappels reussis", () => {
  let s = schedule(null, 4); // rep 1 -> interval 1
  assert.equal(s.interval, 1);
  s = schedule(s, 4); // rep 2 -> interval 6
  assert.equal(s.interval, 6);
  s = schedule(s, 4); // rep 3 -> interval ~ 6 * easiness
  assert.ok(s.interval > 6);
  assert.equal(s.repetitions, 3);
});

test("un rappel rate (grade < 3) remet l'intervalle a 1 jour", () => {
  let s = schedule(null, 5);
  s = schedule(s, 5); // interval 6, rep 2
  const failed = schedule(s, 1);
  assert.equal(failed.interval, 1);
  assert.equal(failed.repetitions, 0);
});

test("le facteur de facilite ne descend jamais sous 1.3", () => {
  let s = null;
  for (let i = 0; i < 10; i++) s = schedule(s, 0); // toujours rate
  assert.ok(s.easiness >= 1.3);
});

test("un rappel facile augmente le facteur de facilite", () => {
  const easy = schedule(null, 5);
  const hard = schedule(null, 3);
  assert.ok(easy.easiness > hard.easiness);
});

test("gradeFromQuiz : bornes et sans quiz", () => {
  assert.equal(gradeFromQuiz(0, 0), 4); // pas de quiz -> 4 par defaut
  assert.equal(gradeFromQuiz(0, 4), 1); // tout faux -> 1
  assert.equal(gradeFromQuiz(4, 4), 5); // tout juste -> 5
  assert.equal(gradeFromQuiz(2, 4), 3); // moitie -> 3
});

test("gradeFromQuiz rate (< moitie) donne un grade < 3", () => {
  assert.ok(gradeFromQuiz(1, 4) < 3); // 25% -> 2
});

test("addDays gere les changements de mois", () => {
  assert.equal(addDays("2026-01-31", 1), "2026-02-01");
  assert.equal(addDays("2026-07-15", 6), "2026-07-21");
});
