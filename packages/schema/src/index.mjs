// Contrat de contenu Kapsule : validateur de deck partage frontend/backend.
// Fait la validation structurelle (JSON Schema) puis quelques controles
// semantiques que JSON Schema seul ne couvre pas (index de reponse quiz,
// unicite des identifiants de fiches).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Schema JSON du deck, charge une fois. */
export const deckSchema = JSON.parse(
  readFileSync(join(__dirname, "..", "deck.schema.json"), "utf8"),
);

/** Version du contrat de contenu supportee par ce paquet. */
export const SCHEMA_VERSION = 1;

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateStructure = ajv.compile(deckSchema);

/**
 * Traduit une erreur ajv en message lisible et exploitable.
 * @param {import("ajv").ErrorObject} err
 * @returns {{ path: string, message: string }}
 */
function formatAjvError(err) {
  const path = err.instancePath || "(racine)";
  let message = err.message ?? "invalide";
  if (err.keyword === "additionalProperties") {
    message = `propriete non autorisee "${err.params.additionalProperty}"`;
  } else if (err.keyword === "enum") {
    message = `valeur invalide, attendu l'une de : ${err.params.allowedValues.join(", ")}`;
  } else if (err.keyword === "const") {
    message = `doit valoir ${JSON.stringify(err.params.allowedValue)}`;
  } else if (err.keyword === "oneOf") {
    message =
      "ne correspond a aucun type de section connu (intro, concept, example, takeaways, quiz)";
  }
  return { path, message };
}

/**
 * Controles semantiques post-schema.
 * @param {any} deck
 * @returns {{ path: string, message: string }[]}
 */
function semanticErrors(deck) {
  const errors = [];
  const seenCardIds = new Set();

  (deck.cards ?? []).forEach((card, ci) => {
    const cardPath = `/cards/${ci}`;
    if (card && typeof card.id === "string") {
      if (seenCardIds.has(card.id)) {
        errors.push({
          path: `${cardPath}/id`,
          message: `identifiant de fiche duplique "${card.id}"`,
        });
      }
      seenCardIds.add(card.id);
    }

    (card?.sections ?? []).forEach((section, si) => {
      if (section?.type !== "quiz") return;
      (section.questions ?? []).forEach((question, qi) => {
        const qPath = `${cardPath}/sections/${si}/questions/${qi}`;
        if (
          Array.isArray(question?.choices) &&
          typeof question.answer === "number" &&
          question.answer >= question.choices.length
        ) {
          errors.push({
            path: `${qPath}/answer`,
            message: `index de reponse ${question.answer} hors limites (${question.choices.length} choix)`,
          });
        }
      });
    });
  });

  return errors;
}

/**
 * Valide un deck contre le contrat de contenu Kapsule.
 * @param {unknown} deck
 * @returns {{ valid: boolean, errors: { path: string, message: string }[] }}
 */
export function validateDeck(deck) {
  const structureOk = validateStructure(deck);
  const errors = structureOk ? [] : (validateStructure.errors ?? []).map(formatAjvError);

  // Les controles semantiques n'ont de sens que si la structure de base tient.
  if (structureOk) {
    errors.push(...semanticErrors(deck));
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Rend les erreurs de validation sous forme de texte multiligne lisible.
 * @param {{ path: string, message: string }[]} errors
 * @returns {string}
 */
export function formatErrors(errors) {
  if (!errors.length) return "Deck valide.";
  return errors.map((e) => `  - ${e.path} : ${e.message}`).join("\n");
}
