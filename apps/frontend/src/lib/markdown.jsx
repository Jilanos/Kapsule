// Rendu Markdown leger, volontairement limite a ce que le contrat autorise :
// **gras**, *italique*, `code inline`, et listes a puces (lignes "- ...").
// Aucune injection HTML : on ne produit que des elements React.

import { Fragment } from "react";

/** Rend les marques inline (gras, italique, code) d'un texte en noeuds React. */
function renderInline(text, keyPrefix) {
  // Ordre : code d'abord (protege son contenu), puis gras, puis italique.
  const tokens = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) tokens.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyPrefix}-${i++}`;
    if (tok.startsWith("`")) {
      tokens.push(<code key={key}>{tok.slice(1, -1)}</code>);
    } else if (tok.startsWith("**")) {
      tokens.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    } else {
      tokens.push(<em key={key}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) tokens.push(text.slice(last));
  return tokens;
}

/**
 * Rend un texte Markdown leger en blocs (paragraphes + listes a puces).
 * @param {string} text
 */
export function Markdown({ text }) {
  const lines = String(text).split("\n");
  const blocks = [];
  let list = null;

  const flushList = () => {
    if (list) {
      blocks.push(
        <ul key={`ul-${blocks.length}`}>
          {list.map((item, i) => (
            <li key={i}>{renderInline(item, `li-${blocks.length}-${i}`)}</li>
          ))}
        </ul>,
      );
      list = null;
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      (list ??= []).push(trimmed.slice(2));
    } else if (trimmed === "") {
      flushList();
    } else {
      flushList();
      blocks.push(<p key={`p-${i}`}>{renderInline(trimmed, `p-${i}`)}</p>);
    }
  });
  flushList();

  return <Fragment>{blocks}</Fragment>;
}
