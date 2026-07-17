// Resolution de la source d'une image de fiche.
// - data URI ou URL absolue : utilisee telle quelle.
// - chemin relatif (ex: "img/schema.png") : servi par le backend depuis les
//   assets du deck (route ajoutee en slice 5).
export function resolveImageSrc(deckId, src) {
  if (/^(data:|https?:\/\/)/.test(src)) return src;
  const clean = src.replace(/^\/+/, "");
  return `/api/decks/${encodeURIComponent(deckId)}/assets/${clean}`;
}
