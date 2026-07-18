// Point d'entree du backend : ouvre la base, seed si vide, demarre Express.

import { openDb } from "./db.mjs";
import { createApp } from "./app.mjs";
import { Store } from "./store.mjs";
import { AuthStore } from "./auth.mjs";
import { seedDecks } from "./seed.mjs";

const PORT = process.env.PORT ?? 3001;

const db = openDb();
const store = new Store(db);

// Purge des sessions expirees au demarrage, puis une fois par jour (AC4/AC10).
const auth = new AuthStore(db);
const purged = auth.purgeExpiredSessions();
if (purged) console.log(`Sessions expirees purgees : ${purged}`);
setInterval(() => auth.purgeExpiredSessions(), 24 * 3600_000).unref();

// Seed automatique au premier demarrage (base vide).
if (store.listDecks().length === 0) {
  const { imported, failed } = seedDecks(store);
  if (imported.length) console.log(`Seed : ${imported.join(", ")}`);
  if (failed.length) console.warn(`Seed : ${failed.length} deck(s) rejete(s)`);
}

const app = createApp(db);
app.listen(PORT, () => {
  console.log(`Kapsule API sur http://localhost:${PORT}`);
});
