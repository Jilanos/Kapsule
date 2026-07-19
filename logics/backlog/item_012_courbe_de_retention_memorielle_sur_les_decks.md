## item_012_courbe_de_retention_memorielle_sur_les_decks - Courbe de retention memorielle sur les decks
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Rendre visible le travail de la memoire : SM-2 calcule deja implicitement la decroissance de retention (courbe d'Ebbinghaus) pour planifier les revisions, mais l'utilisateur ne voit qu'un compteur "7/12 apprises". Il doit pouvoir VOIR sa retention monter a chaque revision et decliner entre deux.
Completer la greffe B du redesign (req_006) : la carte de deck doit porter une trace de retention (encre de Prusse pour la retention consolidee, rouge d'annotation pour la portion en decroissance / les fiches dues), dans le langage "cahier de laboratoire" livre par task_007.
Lever la nuance de perimetre notee dans task_007 (AC3) : les graduations des cartes de deck doivent enfin distinguer les fiches DUES (rouge) des acquises et non lues, ce qui exige d'exposer le "due par deck" cote backend.
Motiver la revision : la ou un badge "9 fiches dues" culpabilise, une courbe qui decline donne envie de la faire remonter.

# Scope
- In:
  - Module backend pur `retention.mjs` (meme pattern que `sm2.mjs`) : R(t) par fiche depuis les donnees `reviews`, agregation par deck, serie echantillonnee pour la trace ; horloge injectable, tests unitaires.
  - Enrichissement de `listDecks` (`store.mjs` + route `GET /api/decks`) : `dueCount`, `retention`, `retentionSeries` par deck, en une requete SQL indexee, champs additifs uniquement.
  - Frontend `DeckList.jsx` : mini-trace SVG inline (composant local, pas de librairie), graduations a trois etats (acquises / dues / restantes) exploitant `.grad-tick.due`, legende textuelle et aria.
  - Ajustements CSS minimes dans `styles.css` (trace) restant dans les tokens existants.
  - Tests : unitaires retention (backend), test API decks enrichis, SSR smoke frontend, budget bundle.
- Out:
  - Notifications/rappels de revision, page de statistiques dediee, historique de retention persiste (nouvelle table), reglages utilisateur du modele.
  - Toute modification de l'algorithme SM-2 lui-meme ou du schema de la table `reviews`.
  - Traces sur d'autres ecrans que la liste des decks (vue deck, session de revision).

# Acceptance criteria
- AC1: Le backend expose par deck (champ additif de `GET /api/decks` ou endpoint dedie) : `dueCount`, `retention` agregee (0-1) et une serie de points de retention estimee, calcules depuis la table `reviews` sans nouvelle table ni migration destructive ; les decks sans fiche en revision renvoient des valeurs neutres explicites.
- AC2: Le modele de retention est une fonction pure, deterministe (horloge injectable), monotone decroissante entre deux revisions, remontant apres une revision reussie ; il est couvert par des tests unitaires (decroissance, bornes 0-1, fiche juste revisee ~1, fiche tres en retard -> proche de 0, agregation deck).
- AC3: La carte de deck affiche une mini-trace SVG de retention dans le langage du redesign (encre de Prusse pour la retention, rouge d'annotation #A63D2A pour la portion en decroissance sous seuil), sans librairie de visualisation ajoutee.
- AC4: Les graduations des cartes de deck distinguent desormais trois etats - acquises (encre pleine), dues (rouge d'annotation, classe `.grad-tick.due`), restantes (filet) - et la legende textuelle les enonce (ex. "7 acquises - 2 dues - 3 non lues").
- AC5: L'information reste accessible sans la trace : texte "retention estimee NN % - N fiches dues" (aria + visible), aucune animation ajoutee (ou neutralisee par prefers-reduced-motion), contrastes AA conserves sur les deux themes.
- AC6: Tests backend et frontend existants + nouveaux passent, `npm run budget` reste respecte, et les clients existants de `GET /api/decks` ne cassent pas (champs additifs uniquement).

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Le backend expose par deck (champ additif de `GET /api/decks` ou endpoint dedie) : `dueCount`, `retention` agregee (0-1) et une serie de points de retention estimee, calcules depuis la table `reviews` sans nouvelle table ni migration destructive ; les decks sans fiche en revision renvoient des valeurs neutres explicites.
- request-AC2 -> This backlog slice. Proof: AC2: Le modele de retention est une fonction pure, deterministe (horloge injectable), monotone decroissante entre deux revisions, remontant apres une revision reussie ; il est couvert par des tests unitaires (decroissance, bornes 0-1, fiche juste revisee ~1, fiche tres en retard -> proche de 0, agregation deck).
- request-AC3 -> This backlog slice. Proof: AC3: La carte de deck affiche une mini-trace SVG de retention dans le langage du redesign (encre de Prusse pour la retention, rouge d'annotation #A63D2A pour la portion en decroissance sous seuil), sans librairie de visualisation ajoutee.
- request-AC4 -> This backlog slice. Proof: AC4: Les graduations des cartes de deck distinguent desormais trois etats - acquises (encre pleine), dues (rouge d'annotation, classe `.grad-tick.due`), restantes (filet) - et la legende textuelle les enonce (ex. "7 acquises - 2 dues - 3 non lues").
- request-AC5 -> This backlog slice. Proof: AC5: L'information reste accessible sans la trace : texte "retention estimee NN % - N fiches dues" (aria + visible), aucune animation ajoutee (ou neutralisee par prefers-reduced-motion), contrastes AA conserves sur les deux themes.
- request-AC6 -> This backlog slice. Proof: AC6: Tests backend et frontend existants + nouveaux passent, `npm run budget` reste respecte, et les clients existants de `GET /api/decks` ne cassent pas (champs additifs uniquement).

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_007_courbe_de_retention_memorielle_sur_les_decks`
- Primary task(s): `task_008_courbe_de_retention_memorielle_sur_les_decks`

# AI Context
- Summary: Courbe de retention memorielle sur les decks
- Keywords: backlog-groom, request, courbe de retention memorielle sur les decks, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Courbe de retention memorielle sur les decks.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Follow-up assume du redesign (req_006) demande par l'operateur ; valeur produit claire (visualiser la memoire) mais aucune urgence technique - passe apres tout correctif de prod eventuel.

# Notes
- Hybrid rationale: Derived from request `req_007_courbe_de_retention_memorielle_sur_les_decks` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_007_courbe_de_retention_memorielle_sur_les_decks.md`.
- Generated locally by logics-manager.
- Task `task_008_courbe_de_retention_memorielle_sur_les_decks` was finished via `logics-manager flow finish task` on 2026-07-19.

# Tasks
- `task_008_courbe_de_retention_memorielle_sur_les_decks`
