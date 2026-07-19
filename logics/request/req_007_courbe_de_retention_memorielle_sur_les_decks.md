## req_007_courbe_de_retention_memorielle_sur_les_decks - Courbe de retention memorielle sur les decks
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 85
> Confidence: 80
> Complexity: Medium
> Theme: apprentissage
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Rendre visible le travail de la memoire : SM-2 calcule deja implicitement la decroissance de retention (courbe d'Ebbinghaus) pour planifier les revisions, mais l'utilisateur ne voit qu'un compteur "7/12 apprises". Il doit pouvoir VOIR sa retention monter a chaque revision et decliner entre deux.
- Completer la greffe B du redesign (req_006) : la carte de deck doit porter une trace de retention (encre de Prusse pour la retention consolidee, rouge d'annotation pour la portion en decroissance / les fiches dues), dans le langage "cahier de laboratoire" livre par task_007.
- Lever la nuance de perimetre notee dans task_007 (AC3) : les graduations des cartes de deck doivent enfin distinguer les fiches DUES (rouge) des acquises et non lues, ce qui exige d'exposer le "due par deck" cote backend.
- Motiver la revision : la ou un badge "9 fiches dues" culpabilise, une courbe qui decline donne envie de la faire remonter.

# Context
- Suite directe de req_006 / task_007 (redesign livre le 2026-07-19) : la "greffe B complete" (courbe de retention + dues par deck) avait ete explicitement scopee en follow-up.
- La matiere premiere existe integralement dans la table `reviews` (`apps/backend/src/db.mjs`, migration 3) : `easiness`, `interval_days`, `repetitions`, `due_date`, `last_grade`, `updated_at` (par user/deck/carte). AUCUNE nouvelle donnee a persister : la retention est une pure fonction de lecture.
- Modele de retention propose (simple, defendable) : R(t) = 2^(-t/S) par fiche, avec S = `interval_days` (stabilite) et t = jours ecoules depuis `updated_at`. R plafonne a [0,1] ; fiche jamais revisee = hors trace. Retention du deck = moyenne des R des fiches en cycle de revision. Le modele exact est un detail d'implementation tant qu'il est monotone decroissant, ancre sur les vraies donnees SM-2 et teste.
- Cote API : enrichir `GET /api/decks` (ou endpoint dedie leger) avec, par deck : `dueCount`, `retention` (0-1 agregee) et une serie echantillonnee courte pour la trace (ex. retention estimee sur les 14 derniers jours + projection courte), sans casser les clients existants (champ additif).
- Cote frontend : mini-trace SVG inline sur la carte de deck (pas de librairie de charts - budget bundle), encre de Prusse pour la partie consolidee, rouge d'annotation #A63D2A pour la portion sous le seuil de decroissance ; graduations existantes (`Graduations` dans `DeckList.jsx`) enrichies d'un etat `due` (la classe CSS `.grad-tick.due` existe deja, inutilisee).
- Accessibilite : la trace est decorative mais doublee d'une information textuelle (ex. "retention estimee 72 %, 2 fiches dues") ; respecter reduced-motion (pas d'animation de trace).
- Hors perimetre (follow-ups) : notifications/rappels, statistiques historiques persistees (vraie chronologie stockee), reglages du modele de retention par utilisateur, page de statistiques dediee.
- Risques connus : (1) sur-interpretation - la retention est une ESTIMATION, l'UI doit la presenter comme telle (libelle "estimee") ; (2) cout de la requete SQL agregat par deck - a garder en une seule requete indexee (`idx_reviews_due` existe) ; (3) surcharge visuelle des cartes - la trace doit rester discrete (hauteur ~40px max).

# Acceptance criteria
- AC1: Le backend expose par deck (champ additif de `GET /api/decks` ou endpoint dedie) : `dueCount`, `retention` agregee (0-1) et une serie de points de retention estimee, calcules depuis la table `reviews` sans nouvelle table ni migration destructive ; les decks sans fiche en revision renvoient des valeurs neutres explicites.
- AC2: Le modele de retention est une fonction pure, deterministe (horloge injectable), monotone decroissante entre deux revisions, remontant apres une revision reussie ; il est couvert par des tests unitaires (decroissance, bornes 0-1, fiche juste revisee ~1, fiche tres en retard -> proche de 0, agregation deck).
- AC3: La carte de deck affiche une mini-trace SVG de retention dans le langage du redesign (encre de Prusse pour la retention, rouge d'annotation #A63D2A pour la portion en decroissance sous seuil), sans librairie de visualisation ajoutee.
- AC4: Les graduations des cartes de deck distinguent desormais trois etats - acquises (encre pleine), dues (rouge d'annotation, classe `.grad-tick.due`), restantes (filet) - et la legende textuelle les enonce (ex. "7 acquises - 2 dues - 3 non lues").
- AC5: L'information reste accessible sans la trace : texte "retention estimee NN % - N fiches dues" (aria + visible), aucune animation ajoutee (ou neutralisee par prefers-reduced-motion), contrastes AA conserves sur les deux themes.
- AC6: Tests backend et frontend existants + nouveaux passent, `npm run budget` reste respecte, et les clients existants de `GET /api/decks` ne cassent pas (champs additifs uniquement).

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): `adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement` (SM-2, table reviews)

# References
- `apps/backend/src/db.mjs` (schema `reviews`, index `idx_reviews_due`)
- `apps/backend/src/sm2.mjs` (algorithme SM-2 pur existant, meme pattern a suivre pour le modele de retention)
- `apps/backend/src/store.mjs` (`listDecks`, `getDueReviews` - points d'accrochage backend)
- `apps/frontend/src/pages/DeckList.jsx` (`Graduations`, carte de deck - point d'accrochage frontend)
- `apps/frontend/src/styles.css` (tokens `--primary`/`--accent`, classe `.grad-tick.due` prete)
- Requete d'origine du redesign : `req_006_redesign_scientifique_de_l_interface_cahier_de_laboratoire` (greffe B scopee en follow-up)
- Maquette de la direction "trace" : artifact `https://claude.ai/code/artifact/680a2a49-a63f-4060-87e0-9c498aab0e00` (piste B, carte "trace de retention")

# AI Context
- Summary: Visualiser la retention memorielle par deck (courbe d'Ebbinghaus estimee depuis les donnees SM-2) : trace SVG sur les cartes, graduations avec etat "due", exposition backend dueCount/retention.
- Keywords: retention, courbe de l'oubli, ebbinghaus, sm-2, trace, graduations, dues, deck
- Use when: Implementing or reviewing the retention-curve feature on deck cards.
- Skip when: The change concerns auth, deployment, or the visual redesign base (req_006).

# Backlog
- none
- `item_012_courbe_de_retention_memorielle_sur_les_decks`
