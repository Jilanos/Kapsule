// Signature des URLs d'assets d'images (ADR 003).
//
// Les images de fiches sont rendues via <img src> et n'envoient donc pas
// l'en-tete Authorization : la garde `canViewDeck` ne peut pas etre appliquee
// sur la balise. On applique donc l'autorisation *au moment de la signature*
// (lors de la lecture du deck, deja gardee par canViewDeck) : l'API renvoie des
// `image.src` transformes en URL signee a duree de vie courte, et la route
// assets ne sert un fichier que si la signature est valide et non expiree.

import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { normalize } from "node:path";

// Secret dedie (distinct des tokens de session). En dev/tests, un secret
// aleatoire par process suffit : signature et verification vivent dans le meme
// process, et le TTL court rend l'invalidation au redemarrage sans consequence.
const SECRET = process.env.KAPSULE_ASSET_SECRET ?? randomBytes(32).toString("hex");

// Duree de vie d'une URL signee (secondes) : assez pour une session de lecture,
// assez court pour qu'une URL fuitee ne soit pas durablement partageable.
export const ASSET_URL_TTL_SECONDS = 600;

/**
 * Forme canonique d'un chemin d'asset, identique a la normalisation appliquee
 * par la route (meme entree -> meme signature quel que soit l'encodage d'URL).
 */
export function canonicalAssetPath(relPath) {
  return normalize(String(relPath)).replace(/^(\.\.[/\\])+/, "");
}

function hmac(deckId, canonicalPath, exp) {
  return createHmac("sha256", SECRET)
    .update(`${deckId}\n${canonicalPath}\n${exp}`)
    .digest("hex");
}

/** URL d'asset signee (chemin absolu pret a poser dans <img src>). */
export function signAssetUrl(deckId, relPath, { now = Date.now() } = {}) {
  const path = canonicalAssetPath(relPath);
  const exp = Math.floor(now / 1000) + ASSET_URL_TTL_SECONDS;
  const sig = hmac(deckId, path, exp);
  return `/api/decks/${encodeURIComponent(deckId)}/assets/${path}?exp=${exp}&sig=${sig}`;
}

/** Verifie signature + expiration. `canonicalPath` doit deja etre canonique. */
export function verifyAssetSig(deckId, canonicalPath, exp, sig, { now = Date.now() } = {}) {
  if (!exp || !sig) return false;
  const expNum = Number(exp);
  if (!Number.isInteger(expNum) || expNum < Math.floor(now / 1000)) return false;
  const expected = hmac(deckId, canonicalPath, expNum);
  const a = Buffer.from(String(sig));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const isExternal = (src) => /^(data:|https?:\/\/)/.test(src);

/** Signe en place les images relatives d'une liste de sections. */
function signSections(sections, deckId, opts) {
  for (const section of sections ?? []) {
    const src = section?.image?.src;
    if (typeof src === "string" && src && !isExternal(src)) {
      section.image.src = signAssetUrl(deckId, src, opts);
    }
  }
}

/** Signe en place les images d'une fiche. Renvoie la fiche. */
export function signCardAssets(card, deckId, opts = {}) {
  if (card) signSections(card.sections, deckId, opts);
  return card;
}

/** Signe en place les images de toutes les fiches d'un deck. Renvoie le deck. */
export function signDeckAssets(deck, deckId, opts = {}) {
  for (const card of deck?.cards ?? []) signSections(card.sections, deckId, opts);
  return deck;
}
