// Largeur et lisibilite de la console d'administration (item_031 AC1/AC2).
//
// Il n'y a pas de navigateur dans la chaine de tests : on verifie donc la regle
// plutot que le pixel. La regle de largeur est une fonction pure testee
// directement ; les invariants CSS qui la rendent effective sont asseris sur la
// feuille de style, pour qu'une reintroduction de `word-break: break-word` sur
// la colonne Email ou d'une largeur maximale sur la console casse un test au
// lieu de passer inapercue.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mainWidthClass } from "../src/lib/layout.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(__dirname, "..", "src", "styles.css"), "utf8");

/** Corps d'une regle CSS, selecteur exact en tete de bloc. */
function ruleBody(selector) {
  const match = css.match(
    new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`),
  );
  assert.ok(match, `regle CSS introuvable : ${selector}`);
  return match[1];
}

test("AC1 : seule la console d'administration prend toute la largeur", () => {
  assert.equal(mainWidthClass("/admin"), " app-main-admin");
  assert.equal(mainWidthClass("/"), " app-main-decks");
  // Le lecteur et les revisions gardent la colonne etroite par defaut.
  assert.equal(mainWidthClass("/decks/reseaux"), "");
  assert.equal(mainWidthClass("/reviews"), "");

  assert.match(ruleBody(".app-main-admin"), /max-width:\s*none/);
});

test("AC1 : le defilement horizontal reste local au tableau", () => {
  // Sur viewport etroit, c'est le conteneur du tableau qui defile, jamais la
  // page : la regle porte l'`overflow-x`, pas `.app-main`.
  assert.match(ruleBody(".admin-table-scroll"), /overflow-x:\s*auto/);
  assert.equal(/overflow-x/.test(ruleBody(".app-main")), false);
});

test("AC2 : la colonne Email a une largeur minimale et ne se coupe pas", () => {
  const email = ruleBody(".admin-cell-email");
  assert.match(email, /min-width:\s*20rem/);
  assert.match(email, /white-space:\s*nowrap/);
  // La coupure caractere par caractere est precisement ce qui rendait les
  // adresses illisibles : elle ne doit pas revenir.
  assert.equal(/word-break/.test(email), false);
  assert.equal(/max-width/.test(email), false);

  // Un titre de deck reste du texte libre : il se replie aux limites de mots.
  const deck = ruleBody(".admin-cell-deck");
  assert.match(deck, /min-width:\s*18rem/);
  assert.match(deck, /overflow-wrap:\s*break-word/);
});
