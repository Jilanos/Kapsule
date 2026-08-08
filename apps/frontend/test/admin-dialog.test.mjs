// Rendu des composants d'administration sans contexte ni reseau.
// Verifie le contrat d'accessibilite du markup (item_025 AC6, item_026 AC5) :
// libelles associes, impact annonce avant l'action, confirmation inactive tant
// que l'identifiant n'est pas saisi, pagination annoncee.
//
// Meme technique que ssr-smoke.mjs : esbuild compile le JSX, react-dom/server
// le rend en chaine. Aucun navigateur requis.

import { after, test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToString } from "react-dom/server";
import { createElement } from "react";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const tempDir = mkdtempSync(join(root, "test", ".admin-render-"));
const entry = join(tempDir, "entry.jsx");
const outfile = join(tempDir, "bundle.mjs");

writeFileSync(
  entry,
  `export { ConfirmDialog } from "${join(root, "src", "components", "admin", "ConfirmDialog.jsx")}";
   export { EditDeckDialog } from "${join(root, "src", "components", "admin", "EditDeckDialog.jsx")}";
   export { Pager } from "${join(root, "src", "components", "admin", "Pager.jsx")}";`,
);

await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  jsx: "automatic",
  external: ["react", "react-dom", "react/jsx-runtime"],
  logLevel: "silent",
});

const { ConfirmDialog, EditDeckDialog, Pager } = await import(`file://${outfile}`);

// React separe les noeuds texte adjacents par des commentaires d'hydratation
// (`Page <!-- -->2<!-- --> sur 3`) : on les retire pour asserter sur le texte
// tel qu'il sera lu.
const plain = (html) => html.replaceAll("<!-- -->", "");

const dialogProps = {
  title: "Supprimer le compte cible@exemple.fr ?",
  confirmValue: "deck-42",
  impactLines: ["8 fiches supprimées", "2 comptes affectés par cette suppression"],
  onConfirm: () => {},
  onCancel: () => {},
};

test("la confirmation annonce l'impact avant de rendre l'action possible", () => {
  const html = renderToString(createElement(ConfirmDialog, dialogProps));

  // L'impact est present dans le document, pas seulement dans un tooltip.
  assert.match(html, /8 fiches supprimées/);
  assert.match(html, /2 comptes affectés par cette suppression/);
  assert.match(html, /irréversible/);

  // Le champ de confirmation porte l'identifiant attendu et un libelle associe.
  assert.match(html, /<code>deck-42<\/code>/);
  assert.match(html, /<label[^>]*for="[^"]+"/);
  assert.match(html, /<input[^>]*id="[^"]+"/);

  // Le titre est rattache au dialogue.
  assert.match(html, /<dialog[^>]*aria-labelledby="[^"]+"/);
});

test("le bouton de suppression reste desactive tant que l'identifiant n'est pas saisi", () => {
  const html = renderToString(createElement(ConfirmDialog, dialogProps));
  // Au premier rendu, rien n'est saisi : le submit est desactive et la raison
  // est annoncee dans une region live.
  assert.match(html, /type="submit"[^>]*disabled/);
  assert.match(html, /role="status"[^>]*>L&#x27;identifiant saisi ne correspond pas encore/);
});

test("la confirmation en cours desactive l'annulation et signale l'attente", () => {
  const html = renderToString(createElement(ConfirmDialog, { ...dialogProps, busy: true }));
  assert.match(html, /Suppression…/);
  // Les deux boutons sont hors d'atteinte pendant l'operation.
  assert.equal(html.match(/disabled/g).length >= 2, true);
});

test("une erreur de suppression est rendue dans une alerte", () => {
  const html = renderToString(
    createElement(ConfirmDialog, {
      ...dialogProps,
      error: "impossible de supprimer le dernier administrateur",
    }),
  );
  assert.match(html, /role="alert"/);
  assert.match(html, /dernier administrateur/);
});

// --- Edition bornee d'un deck (item_032 AC4) -------------------------------

const editProps = {
  deck: {
    id: "reseaux",
    title: "Titre initial",
    description: "Description initiale",
    visibility: "general",
    ownerEmail: "proprio@exemple.fr",
  },
  onSave: () => {},
  onCancel: () => {},
};

test("l'edition n'expose que les trois champs modifiables, chacun etiquete", () => {
  const html = renderToString(createElement(EditDeckDialog, editProps));

  assert.match(html, /<dialog[^>]*aria-labelledby="[^"]+"/);
  // Trois champs, trois libelles associes : titre, description, visibilite.
  assert.match(html, /<span>Titre<\/span>/);
  assert.match(html, /<span>Description<\/span>/);
  assert.match(html, /<span>Visibilité<\/span>/);
  assert.equal(html.match(/<label[^>]*for="[^"]+"/g).length, 3);
  assert.match(html, /<input[^>]*value="Titre initial"/);
  assert.match(html, /<textarea[^>]*>Description initiale<\/textarea>/);
  assert.match(html, /<select[^>]/);

  // L'identifiant et le proprietaire sont rappeles, mais en lecture seule, et
  // la portee de l'edition est dite explicitement.
  assert.match(html, /<code>reseaux<\/code>/);
  assert.match(plain(html), /propriétaire proprio@exemple\.fr/);
  assert.match(plain(html), /fiches et les assets ne sont pas modifiables/);
  // Aucun champ de saisie pour l'identifiant, le proprietaire ou les fiches.
  assert.equal(/name="(id|ownerId|cards)"/.test(html), false);
});

test("l'edition refuse l'enregistrement d'un titre vide et l'annonce", () => {
  const html = renderToString(
    createElement(EditDeckDialog, { ...editProps, deck: { ...editProps.deck, title: "  " } }),
  );
  assert.match(html, /type="submit"[^>]*disabled/);
  assert.match(html, /role="status"[^>]*>Le titre ne peut pas être vide/);
});

test("l'enregistrement en cours verrouille le formulaire et signale l'attente", () => {
  const html = renderToString(createElement(EditDeckDialog, { ...editProps, busy: true }));
  assert.match(html, /Enregistrement…/);
  // Champs et boutons sont hors d'atteinte pendant l'appel.
  assert.equal(html.match(/disabled/g).length >= 5, true);
});

test("une erreur d'edition est rendue dans une alerte", () => {
  const html = renderToString(
    createElement(EditDeckDialog, {
      ...editProps,
      error: "titre invalide : 120 caracteres maximum",
    }),
  );
  assert.match(html, /role="alert"/);
  assert.match(html, /120 caracteres maximum/);
});

test("la pagination s'annonce et disparait quand tout tient sur une page", () => {
  const single = renderToString(
    createElement(Pager, {
      page: { offset: 0, limit: 25, total: 3 },
      onOffset: () => {},
      label: "comptes",
    }),
  );
  assert.equal(single, "", "sans seconde page, aucune pagination n'est rendue");

  const html = renderToString(
    createElement(Pager, {
      page: { offset: 25, limit: 25, total: 60 },
      onOffset: () => {},
      label: "comptes",
    }),
  );
  assert.match(html, /aria-label="Pagination des comptes"/);
  assert.match(plain(html), /Page 2 sur 3/);
  assert.match(html, /role="status"/);
  // Ni premiere ni derniere page : les deux boutons restent actifs.
  assert.equal(html.includes("disabled"), false);
});

test("la premiere et la derniere page desactivent le bouton correspondant", () => {
  const first = renderToString(
    createElement(Pager, {
      page: { offset: 0, limit: 25, total: 60 },
      onOffset: () => {},
      label: "comptes",
    }),
  );
  assert.match(first, /<button[^>]*disabled[^>]*>← Précédent/);

  const last = renderToString(
    createElement(Pager, {
      page: { offset: 50, limit: 25, total: 60 },
      onOffset: () => {},
      label: "comptes",
    }),
  );
  assert.match(last, /<button[^>]*disabled[^>]*>Suivant/);
});

after(() => rmSync(tempDir, { recursive: true, force: true }));
