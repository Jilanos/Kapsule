import { useState } from "react";

/**
 * Quiz interactif a choix unique.
 * @param {{ questions: any[], onScore?: (score:number, total:number)=>void }} props
 */
export function Quiz({ questions, onScore }) {
  // answers[i] = index choisi, ou undefined tant que non repondu.
  const [answers, setAnswers] = useState({});

  const choose = (qi, ci) => {
    if (answers[qi] !== undefined) return; // verrouille apres reponse
    const next = { ...answers, [qi]: ci };
    setAnswers(next);
    if (Object.keys(next).length === questions.length) {
      const score = questions.reduce((acc, q, i) => acc + (next[i] === q.answer ? 1 : 0), 0);
      onScore?.(score, questions.length);
    }
  };

  return (
    <div className="quiz">
      {questions.map((q, qi) => {
        const answered = answers[qi] !== undefined;
        return (
          <div key={qi} className="quiz-question">
            <p className="quiz-q">{q.q}</p>
            <div className="quiz-choices">
              {q.choices.map((choice, ci) => {
                const isChosen = answers[qi] === ci;
                const isCorrect = q.answer === ci;
                let cls = "quiz-choice";
                if (answered && isCorrect) cls += " correct";
                else if (answered && isChosen && !isCorrect) cls += " wrong";
                return (
                  <button
                    key={ci}
                    type="button"
                    className={cls}
                    disabled={answered}
                    onClick={() => choose(qi, ci)}
                  >
                    {choice}
                    {answered && isCorrect && <span aria-hidden> ✓</span>}
                    {answered && isChosen && !isCorrect && <span aria-hidden> ✗</span>}
                  </button>
                );
              })}
            </div>
            {/* Annonce le resultat aux lecteurs d'ecran : le code couleur et les
                symboles ✓/✗ (aria-hidden) ne suffisent pas seuls (AC8). */}
            {answered && (
              <p className="sr-only" role="status">
                {answers[qi] === q.answer
                  ? "Bonne reponse."
                  : `Mauvaise reponse. La bonne reponse est : ${q.choices[q.answer]}.`}
              </p>
            )}
            {answered && q.explanation && <p className="quiz-explain">{q.explanation}</p>}
          </div>
        );
      })}
    </div>
  );
}
