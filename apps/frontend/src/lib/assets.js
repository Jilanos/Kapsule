// Resolution de la source d'une image de fiche.
// - data URI ou URL absolue : utilisee telle quelle.
// - URL d'asset deja signee par le backend (chemin absolu commencant par "/",
//   ADR 003) : utilisee telle quelle ; l'autorisation est portee par la
//   signature emise a la lecture du deck.
// - chemin relatif non signe : fallback defensif (ancienne resolution).
export function resolveImageSrc(deckId, src) {
  if (!src) return src;
  if (/^(data:|https?:\/\/)/.test(src)) return src;
  if (src.startsWith("/")) return src;
  const clean = src.replace(/^\/+/, "");
  return `/api/decks/${encodeURIComponent(deckId)}/assets/${clean}`;
}
