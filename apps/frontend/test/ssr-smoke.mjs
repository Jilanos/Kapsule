// Verification sans navigateur : compile les composants du lecteur avec esbuild
// et les rend en chaine (SSR) avec le deck d'exemple. Confirme que chaque type
// de section + le quiz se rendent sans erreur.
import { build } from "esbuild";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToString } from "react-dom/server";
import { createElement } from "react";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const deck = JSON.parse(
  readFileSync(join(root, "..", "..", "decks", "reseaux-essentiels.json"), "utf8"),
);

// Entree temporaire qui reexporte les composants a tester.
const tempDir = mkdtempSync(join(root, "test", ".ssr-smoke-"));
const entry = join(tempDir, "entry.jsx");
writeFileSync(
  entry,
  `export { Section } from "${join(root, "src", "components", "Section.jsx")}";
   export { CardView } from "${join(root, "src", "components", "CardView.jsx")}";
   export { Markdown } from "${join(root, "src", "lib", "markdown.jsx")}";`,
);
const outfile = join(tempDir, "bundle.mjs");

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

const { Section, Markdown } = await import(`file://${outfile}`);

let failures = 0;
const check = (name, fn) => {
  try {
    const html = fn();
    if (!html || html.length < 3) throw new Error("rendu vide");
    console.log(`  ok  ${name}`);
  } catch (e) {
    failures++;
    console.error(`FAIL  ${name} : ${e.message}`);
  }
};

// Markdown leger
check("markdown gras/italique/code", () =>
  renderToString(createElement(Markdown, { text: "**g** *i* `c`\n- a\n- b" })),
);

// Chaque type de section du deck d'exemple
const card = deck.cards[0];
const types = new Set();
for (const section of card.sections) types.add(section.type);
// on veut couvrir tous les types du contrat
for (const c of deck.cards) for (const s of c.sections) types.add(s.type);
for (const type of ["intro", "concept", "example", "takeaways", "quiz"]) {
  if (!types.has(type)) {
    console.error(`FAIL  couverture : type "${type}" absent du deck d'exemple`);
    failures++;
  }
}
for (const c of deck.cards) {
  c.sections.forEach((section, i) => {
    check(`section ${section.type} (${c.id}/${i})`, () =>
      renderToString(createElement(Section, { section, deckId: deck.id })),
    );
  });
}

rmSync(tempDir, { recursive: true, force: true });

if (failures) {
  console.error(`\n${failures} echec(s).`);
  process.exit(1);
}
console.log("\nSSR smoke: tout est rendu sans erreur.");
