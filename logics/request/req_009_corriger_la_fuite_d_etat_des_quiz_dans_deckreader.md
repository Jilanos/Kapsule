## req_009_corriger_la_fuite_d_etat_des_quiz_dans_deckreader - Corriger la fuite d'etat des quiz dans DeckReader
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Complexity: Low
> Theme: bugfix
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Corriger le bug ou certains quiz apparaissent deja repondus et verrouilles
  lors de la lecture sequentielle d'un deck via "fiche suivante".
- Garantir qu'une nouvelle fiche ouverte dans `DeckReader` remonte une instance
  propre de `CardView` et de ses quiz, afin que les reponses locales ne fuient
  pas depuis la fiche precedente.
- Livrer le correctif principal React : ajouter une identite stable
  `key={card.id}` au rendu de `CardView` dans `DeckReader`.

# Context
- Le bug est observe dans `DeckReader` quand l'utilisateur enchaine les fiches
  avec le bouton "fiche suivante". Certaines questions de quiz s'affichent avec
  des choix deja selectionnes et les boutons deviennent `disabled`.
- Cause identifiee : `CardView` est rendu sans `key` dans
  `apps/frontend/src/pages/DeckReader.jsx`, donc React peut reutiliser la meme
  instance de composant entre deux fiches.
- Dans `CardView`, les sections sont rendues avec `key={i}`. Quand deux fiches
  ont un quiz a la meme position de section, React peut conserver l'instance
  `Quiz` et son etat local `answers`.
- `Quiz` verrouille volontairement une question apres reponse. Le verrouillage
  devient incorrect uniquement parce que l'etat local est reutilise pour une
  autre fiche.
- Le parcours de revision n'est pas le cas principal : `ReviewSession` remonte
  proprement la fiche via `setCard(null)`, ce qui evite cette fuite.
- Le probleme n'est pas specifique au mobile, meme s'il peut y etre plus visible
  car la lecture sequentielle y est plus frequente.
- Un reset automatique des reponses a l'arrivee sur une fiche peut masquer le
  symptome, mais le correctif principal attendu est de donner une identite React
  stable a la fiche rendue par `DeckReader`.

# Acceptance criteria
- AC1: `DeckReader` rend `CardView` avec une cle stable basee sur l'identite de
  la fiche courante, par exemple `key={card.id}`, afin de forcer un remount lors
  du passage a une autre fiche.
- AC2: En lecture sequentielle d'un deck, repondre a un quiz sur une fiche puis
  passer a la fiche suivante n'affiche plus les quiz de la nouvelle fiche comme
  deja repondus, et leurs choix restent modifiables tant qu'aucune reponse n'a
  ete donnee sur cette fiche.
- AC3: Le comportement normal de verrouillage apres reponse dans `Quiz` reste
  inchange pour une meme fiche et une meme question.
- AC4: Le correctif ne degrade pas le parcours de revision, le marquage
  `seen`/`learned`, le calcul du `quizScore` ni la navigation retour deck.
- AC5: Un test frontend ou une verification automatisable couvre la regression
  du parcours `fiche suivante` avec deux fiches contenant des quiz a la meme
  position de section.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): (none yet)

# References
- `apps/frontend/src/pages/DeckReader.jsx`
- `apps/frontend/src/components/CardView.jsx`
- `apps/frontend/src/components/Section.jsx`
- `apps/frontend/src/components/Quiz.jsx`
- `apps/frontend/src/pages/ReviewSession.jsx`

# AI Context
- Summary: Corriger la fuite d'etat React des quiz en lecture sequentielle de deck
  en forcant le remount de `CardView` par `key={card.id}`.
- Keywords: DeckReader, CardView, Quiz, React key, answers, disabled, fiche
  suivante, state leak
- Use when: Implementing or reviewing the bugfix for quiz answers leaking between
  cards in the deck reader.
- Skip when: The change concerns quiz scoring rules, deck import, review session
  scheduling or backend progress persistence.

# Backlog
- none
- `item_014_corriger_la_fuite_d_etat_des_quiz_dans_deckreader`
