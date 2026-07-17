import { Markdown } from "../lib/markdown.jsx";
import { Quiz } from "./Quiz.jsx";
import { resolveImageSrc } from "../lib/assets.js";

/**
 * Rend une section typee. Chaque type a son propre gabarit ; un type inconnu
 * n'est jamais rendu (le contrat garantit qu'il n'y en a pas, mais on reste sur).
 */
export function Section({ section, deckId, onQuizScore }) {
  switch (section.type) {
    case "intro":
      return (
        <div className="section section-intro">
          <Markdown text={section.content} />
        </div>
      );

    case "concept":
    case "example":
      return (
        <div className={`section section-${section.type}`}>
          {section.heading && <h3 className="section-heading">{section.heading}</h3>}
          <Markdown text={section.content} />
          {section.image && <Figure image={section.image} deckId={deckId} />}
        </div>
      );

    case "takeaways":
      return (
        <div className="section section-takeaways">
          <h3 className="section-heading">{section.heading ?? "À retenir"}</h3>
          <ul className="takeaways-list">
            {section.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case "quiz":
      return (
        <div className="section section-quiz">
          <h3 className="section-heading">{section.heading ?? "Quiz"}</h3>
          <Quiz questions={section.questions} onScore={onQuizScore} />
        </div>
      );

    default:
      return null;
  }
}

function Figure({ image, deckId }) {
  return (
    <figure className="section-figure">
      <img src={resolveImageSrc(deckId, image.src)} alt={image.alt ?? ""} loading="lazy" />
      {image.caption && <figcaption>{image.caption}</figcaption>}
    </figure>
  );
}
