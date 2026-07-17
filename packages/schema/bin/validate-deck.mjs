#!/usr/bin/env node
// CLI de validation : `node packages/schema/bin/validate-deck.mjs <deck.json>`
import { readFileSync } from "node:fs";
import { validateDeck, formatErrors } from "../src/index.mjs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: validate-deck <deck.json>");
  process.exit(2);
}

let deck;
try {
  deck = JSON.parse(readFileSync(file, "utf8"));
} catch (err) {
  console.error(`JSON illisible dans ${file} : ${err.message}`);
  process.exit(2);
}

const { valid, errors } = validateDeck(deck);
if (valid) {
  console.log(`OK : ${file} respecte le contrat de contenu Kapsule.`);
  process.exit(0);
}
console.error(`INVALIDE : ${file}`);
console.error(formatErrors(errors));
process.exit(1);
