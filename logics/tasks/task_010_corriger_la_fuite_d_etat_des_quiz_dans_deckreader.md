## task_010_corriger_la_fuite_d_etat_des_quiz_dans_deckreader - Corriger la fuite d'etat des quiz dans DeckReader
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] `DeckReader` rend `CardView` avec une cle stable `key={card.id}` lorsque
  l'utilisateur lit une fiche du deck.
- [x] Le parcours sequentiel "repondre a un quiz puis fiche suivante" ne conserve
  plus les reponses ni l'etat `disabled` sur la fiche suivante.
- [x] Le verrouillage volontaire apres reponse sur la fiche courante reste
  inchange.
- [x] Les validations frontend pertinentes passent et les preuves sont reportees
  avant closeout.

# Backlog
- `item_014_corriger_la_fuite_d_etat_des_quiz_dans_deckreader`

# Acceptance criteria
- AC1 - Identite de fiche : ajouter `key={card.id}` au rendu de `CardView` dans
  `apps/frontend/src/pages/DeckReader.jsx`.
- AC2 - Etat quiz remis a neuf : reproduire ou tester le passage d'une fiche
  avec quiz repondu vers une autre fiche avec quiz a la meme position ; la
  nouvelle fiche doit afficher ses choix non selectionnes et non `disabled`.
- AC3 - Semantique quiz preservee : sur la fiche courante, `Quiz` continue de
  verrouiller une question apres selection et `CardView` continue de transmettre
  le `quizScore` attendu a `onLearnAndNext`.
- AC4 - Navigation preservee : verifier que `onSeen`, `onBack`,
  `onLearnAndNext`, le compteur de fiche, la derniere fiche et les libelles
  restent conformes.
- AC5 - Perimetre maitrise : ne pas introduire de reset automatique de
  `Quiz.answers` comme mecanisme principal, sauf justification documentee si le
  remount par cle ne suffit pas.

# AC Traceability
- request-AC1 -> This task. Proof: `apps/frontend/src/pages/DeckReader.jsx`
  rend maintenant `<CardView key={card.id} ... />`.
- request-AC2 -> This task. Proof: `apps/frontend/test/deck-reader-card-key.test.mjs`
  protege le contrat de remount qui empeche `Quiz.answers` et l'etat `disabled`
  de fuir vers la fiche suivante.
- request-AC3 -> This task. Proof: aucun changement dans `Quiz.jsx`,
  `Section.jsx` ou le contrat `onQuizScore`; le verrouillage local apres reponse
  reste porte par `Quiz`.
- request-AC4 -> This task. Proof: aucune prop de navigation/progression de
  `CardView` n'a ete modifiee ; le smoke test SSR continue de rendre les
  sections et quiz sans erreur.
- request-AC5 -> This task. Proof: aucun reset automatique de `Quiz.answers` n'a
  ete ajoute ; le correctif est limite au remount par cle React.

# Implementation plan
- [x] Vague 1 - Baseline : relire `DeckReader.jsx`, `CardView.jsx`,
  `Section.jsx` et `Quiz.jsx`, puis confirmer le chemin de fuite d'etat.
- [x] Vague 2 - Correctif principal : ajouter `key={card.id}` sur `CardView`
  dans `DeckReader` sans modifier les contrats de props.
- [x] Vague 3 - Regression test : ajouter un test frontend de garde qui verifie
  que `DeckReader` transmet `key={card.id}` a `CardView`, contrat React qui force
  le remount entre deux fiches successives.
- [x] Vague 4 - Validation : executer la suite frontend pertinente et, si le
  changement touche seulement le frontend, documenter pourquoi aucune validation
  backend n'est requise.

# Validation
- `npm test --workspace @kapsule/frontend` : OK, 5 tests passes, incluant
- npm test --workspace @kapsule/frontend OK (5/5); npm run build --workspace @kapsule/frontend OK; npm run budget OK (JS gzip 78.9 KB / 85 KB, CSS gzip 4.0 KB / 15 KB); npm run format:check OK; logics-manager lint --require-status OK. Backend validation not run because this frontend-only change touches no API, store, permissions or persistence.
- Finish workflow executed on 2026-07-20.
- Linked backlog/request close verification passed.
  `DeckReader remounts CardView when the active card changes` et le smoke SSR.
- `npm run build --workspace @kapsule/frontend` : OK.
- `npm run budget` : OK, JS gzip 78.9 KB / 85 KB, CSS gzip 4.0 KB / 15 KB.
- `npm run format:check` : OK.
- `logics-manager lint --require-status`.
- `logics-manager audit --group-by-doc`.
- Utiliser `logics-manager flow progress task logics/tasks/task_010_corriger_la_fuite_d_etat_des_quiz_dans_deckreader.md --progress <n>%`
  pendant les vagues significatives, puis `logics-manager flow finish task ...`
  seulement apres validation du correctif.

# Report
- Etat initial : task prete, implementation non demarree.
- Point de decision : le reset automatique des reponses peut servir de defense
- Finished on 2026-07-20.
- Linked backlog item(s): `item_014_corriger_la_fuite_d_etat_des_quiz_dans_deckreader`
- Related request(s): `req_009_corriger_la_fuite_d_etat_des_quiz_dans_deckreader`
  complementaire, mais le correctif principal retenu est le remount de
  `CardView` via `key={card.id}`.
- Livraison :
  - `apps/frontend/src/pages/DeckReader.jsx` ajoute `key={card.id}` sur
    `CardView`.
  - `apps/frontend/test/deck-reader-card-key.test.mjs` ajoute un test de garde
    du contrat de remount.
  - `apps/frontend/test/ssr-smoke.mjs` deplace ses artefacts temporaires dans un
    dossier `.ssr-smoke-*` ignore par Prettier pour eviter les courses avec
    `format:check`.
  - `.prettierignore` ignore ces artefacts temporaires.
- Validation backend non executee : le changement ne touche ni API, ni store, ni
  permissions, ni schema de progression.

# AI Context
- Summary: Ajouter `key={card.id}` sur `CardView` dans `DeckReader` et couvrir
  la regression de fuite d'etat `Quiz.answers` entre fiches.
- Keywords: DeckReader, CardView, Quiz, React key, remount, answers, disabled,
  quizScore, fiche suivante
- Use when: Implementing or validating the quiz state leak bugfix in the deck
  reader.
- Skip when: The work concerns review scheduling, backend progress persistence,
  deck import or quiz scoring changes.

# Links
- Request: `req_009_corriger_la_fuite_d_etat_des_quiz_dans_deckreader`
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): (none yet)
