## task_008_courbe_de_retention_memorielle_sur_les_decks - Courbe de retention memorielle sur les decks
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: claude

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_012_courbe_de_retention_memorielle_sur_les_decks`

# Acceptance criteria
- AC1: Le backend expose par deck (champ additif de `GET /api/decks` ou endpoint dedie) : `dueCount`, `retention` agregee (0-1) et une serie de points de retention estimee, calcules depuis la table `reviews` sans nouvelle table ni migration destructive ; les decks sans fiche en revision renvoient des valeurs neutres explicites.
- AC2: Le modele de retention est une fonction pure, deterministe (horloge injectable), monotone decroissante entre deux revisions, remontant apres une revision reussie ; il est couvert par des tests unitaires (decroissance, bornes 0-1, fiche juste revisee ~1, fiche tres en retard -> proche de 0, agregation deck).
- AC3: La carte de deck affiche une mini-trace SVG de retention dans le langage du redesign (encre de Prusse pour la retention, rouge d'annotation #A63D2A pour la portion en decroissance sous seuil), sans librairie de visualisation ajoutee.
- AC4: Les graduations des cartes de deck distinguent desormais trois etats - acquises (encre pleine), dues (rouge d'annotation, classe `.grad-tick.due`), restantes (filet) - et la legende textuelle les enonce (ex. "7 acquises - 2 dues - 3 non lues").
- AC5: L'information reste accessible sans la trace : texte "retention estimee NN % - N fiches dues" (aria + visible), aucune animation ajoutee (ou neutralisee par prefers-reduced-motion), contrastes AA conserves sur les deux themes.
- AC6: Tests backend et frontend existants + nouveaux passent, `npm run budget` reste respecte, et les clients existants de `GET /api/decks` ne cassent pas (champs additifs uniquement).

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_008_courbe_de_retention_memorielle_sur_les_decks.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_008_courbe_de_retention_memorielle_sur_les_decks.md` after implementation.
- npm test = 54 backend (dont 9 retention + 2 API) + 10 frontend + SSR smoke, 0 echec ; npm run build OK ; npm run budget OK (JS 78.0/85, CSS 3.6/15) ; E2E navigateur headless : app montee 0 erreur, trace + graduations dues rendues
- Finish workflow executed on 2026-07-19.
- Linked backlog/request close verification passed.

# AC Traceability
- request-AC1 -> This task. Proof: `Store.getReviewSummary` (une requete indexee sur `reviews`) + route `GET /api/decks` enrichie de `dueCount`/`retention`/`retentionSeries` (champs additifs) ; decks sans fiche en cycle -> `dueCount:0, retention:null, retentionSeries:[]` (test "valeurs neutres"). Aucune table ni migration ajoutee.
- request-AC2 -> This task. Proof: `apps/backend/src/retention.mjs` (fonction pure, horloge injectee) : R(t)=2^(-t/S) ; `apps/backend/test/retention.test.mjs` (9 tests : decroissance monotone, bornes [0,1], juste revisee ~1, R=0.5 a t=S, tres en retard ~0, remontee post-revision, agregation deck, serie monotone).
- request-AC3 -> This task. Proof: composant `RetentionTrace` (SVG inline, aucune librairie) dans `DeckList.jsx` : polyline prusse (`--primary`), segments sous seuil 0.5 en `--accent` (#A63D2A), ligne de seuil pointillee ; CSS `.retention-trace`/`.trace-line`/`.trace-line-low`. Rendu confirme au navigateur headless (capture E2E).
- request-AC4 -> This task. Proof: `Graduations` a trois etats (acquises `--primary`, dues `.grad-tick.due` `--accent`, restantes filet) pilotes par `dueCount` ; legende `deckLegend` "N acquises · N dues · N non lues" ; E2E : 2 graduations `due` + legende correcte.
- request-AC5 -> This task. Proof: info portee par la legende visible + `aria-label` de `Graduations` et `RetentionTrace` ; trace sans animation ; tokens de couleur inchanges (contrastes AA conserves de task_007).
- request-AC6 -> This task. Proof: `npm test` = 54 backend (dont 9 retention + 2 retention-api) + 10 frontend + SSR smoke, 0 echec ; `npm run build` OK ; `npm run budget` OK (JS 78.0/85, CSS 3.6/15) ; champs additifs -> anciens clients de `GET /api/decks` intacts (test "non-cassure").

# Report
- Livre en 3 vagues (ADR 009). "Greffe B" du redesign : courbe de retention memorielle sur les cartes de deck.
- Vague 1 - modele backend (AC2) : `apps/backend/src/retention.mjs` (pur, meme pattern que `sm2.mjs`) : `retentionOfCard` (R(t)=2^(-t/S), S=intervalle SM-2, t=jours depuis `updated_at`, borne [0,1]), `retentionOfDeck` (moyenne, null si vide), `retentionSeries` (echantillonnage present->futur, monotone decroissant). 9 tests unitaires (`retention.test.mjs`).
- Vague 2 - API (AC1, AC6) : `Store.getReviewSummary` (une requete sur `reviews`, agregation par deck) ; `GET /api/decks` enrichi de `dueCount`/`retention`/`retentionSeries` en champs additifs (aucune table/migration ; decks sans revision -> valeurs neutres). 2 tests API (`retention-api.test.mjs`).
- Vague 3 - frontend + verification (AC3, AC4, AC5) : `RetentionTrace` (SVG inline, prusse + segment rouge sous seuil, ligne de seuil) ; `Graduations` a trois etats via `dueCount` (`.grad-tick.due`) ; legende `deckLegend` + aria ; CSS trace dans les tokens existants. `.deck-count` passe en wrap (legende plus longue).
- Verification E2E (navigateur headless, backend reel servant le build) : app montee sans erreur (#root peuple, 0 pageerror), API `{due:2, retention:0.854, series decroissante}`, 1 trace + 2 graduations `due` rendues, legende "1 acquise · 2 dues · 0 non lue · rétention ~85 %". Capture d'ecran validee.
- Decision d'implementation : `GET /api/decks` enrichi directement (un seul aller-retour), retenu ; cout SQL faible (une requete indexee, agregation en memoire).
- Nuance assumee : la retention est une ESTIMATION (pas de chronologie stockee, hors perimetre) ; l'UI le dit ("rétention ~NN %", "estimée"). La serie est une projection de decroissance du present vers le futur.
- Fichiers : `apps/backend/src/retention.mjs` (nouveau), `apps/backend/src/store.mjs`, `apps/backend/src/app.mjs`, `apps/backend/test/retention.test.mjs` + `retention-api.test.mjs` (nouveaux), `apps/frontend/src/pages/DeckList.jsx`, `apps/frontend/src/styles.css`.
- Finished on 2026-07-19.
- Linked backlog item(s): `item_012_courbe_de_retention_memorielle_sur_les_decks`
- Related request(s): `req_007_courbe_de_retention_memorielle_sur_les_decks`

# Plan initial (3 vagues)
- Non demarre. Plan de livraison prevu en 3 vagues (ADR 009) :
  - Vague 1 - modele backend : `apps/backend/src/retention.mjs` (fonction pure, meme pattern que `sm2.mjs`) : `retentionOfCard(review, now)` = 2^(-t/S) borne [0,1] (S = `interval_days`, t = jours depuis `updated_at`), `retentionOfDeck(reviews, now)` (moyenne des fiches en cycle), `retentionSeries(reviews, now, {days, step})` (serie echantillonnee passee + projection courte). Tests unitaires : decroissance monotone, bornes, fiche juste revisee ~1, fiche tres en retard -> ~0, deck vide -> valeur neutre, horloge injectee. Couvre AC2.
  - Vague 2 - exposition API : `store.mjs` : agregat par deck en une requete sur `reviews` (dueCount via `due_date <= today`, lignes necessaires au calcul) ; `listDecks` enrichi de `dueCount`, `retention`, `retentionSeries` (champs additifs, decks sans revision -> `retention: null`, `dueCount: 0`, serie vide). Test API : deck avec revisions -> champs presents et coherents ; deck vierge -> valeurs neutres ; anciens champs intacts. Couvre AC1, AC6 (non-cassure).
  - Vague 3 - frontend + verification : composant local `RetentionTrace` (SVG inline ~40px, polyline prusse + segment sous seuil en `--accent`, aucun ajout de dependance) ; `Graduations` etendues a trois etats via `dueCount` (`.grad-tick.due` deja stylee) ; legende "N acquises - N dues - N non lues" + texte "retention estimee NN %" (visible + aria) ; pas d'animation. Verification : tests complets, SSR smoke, `npm run budget`, contrastes AA inchanges (tokens existants). Couvre AC3, AC4, AC5, AC6.
- Reference visuelle : carte "trace de retention" de la piste B (artifact `https://claude.ai/code/artifact/680a2a49-a63f-4060-87e0-9c498aab0e00`), transposee dans la palette "cahier de laboratoire" (prusse/annotation) et non dans le monde sombre de la maquette.
- Decision a confirmer en debut d'implementation : enrichir `GET /api/decks` directement (choix par defaut, un seul aller-retour) plutot qu'un endpoint dedie ; basculer si le cout SQL par deck s'avere excessif.

# AI Context
- Summary: Implement courbe de retention memorielle sur les decks.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_007_courbe_de_retention_memorielle_sur_les_decks`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
