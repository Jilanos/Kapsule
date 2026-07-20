export const DECK_LIST_OPTIONS_KEY = "kapsule.deckListOptions.v1";

export const DEFAULT_DECK_LIST_OPTIONS = {
  wide: false,
  showRetention: true,
};

export function normalizeForSearch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR")
    .trim();
}

export function deckMatchesSearch(deck, query) {
  const needle = normalizeForSearch(query);
  if (!needle) return true;
  const haystack = normalizeForSearch(
    [deck.title, deck.description, ...(deck.tags ?? [])].filter(Boolean).join(" "),
  );
  return haystack.includes(needle);
}

export function filterDecks(decks, query) {
  return decks.filter((deck) => deckMatchesSearch(deck, query));
}

export function parseDeckListOptions(raw) {
  if (!raw) return DEFAULT_DECK_LIST_OPTIONS;
  try {
    const parsed = JSON.parse(raw);
    return {
      wide: typeof parsed?.wide === "boolean" ? parsed.wide : DEFAULT_DECK_LIST_OPTIONS.wide,
      showRetention:
        typeof parsed?.showRetention === "boolean"
          ? parsed.showRetention
          : DEFAULT_DECK_LIST_OPTIONS.showRetention,
    };
  } catch {
    return DEFAULT_DECK_LIST_OPTIONS;
  }
}

export function readDeckListOptions(storage = globalThis.localStorage) {
  if (!storage) return DEFAULT_DECK_LIST_OPTIONS;
  return parseDeckListOptions(storage.getItem(DECK_LIST_OPTIONS_KEY));
}

export function writeDeckListOptions(options, storage = globalThis.localStorage) {
  if (!storage) return;
  storage.setItem(DECK_LIST_OPTIONS_KEY, JSON.stringify(options));
}
