## task_007_redesign_scientifique_de_l_interface_cahier_de_laboratoire - Redesign scientifique de l'interface - cahier de laboratoire
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
- `item_011_redesign_scientifique_de_l_interface_cahier_de_laboratoire`

# Acceptance criteria
- AC1: La nouvelle palette (papier/encre/prusse/annotation) remplace slate+indigo dans les tokens de `styles.css`, en clair comme en sombre, sans aucune valeur Tailwind litterale residuelle (#f8fafc, #4f46e5, etc.).
- AC2: Le contenu des fiches (titres, sections, paragraphes) est rendu dans une serif d'edition auto-hebergee avec pile de secours systeme ; les metadonnees et etats (compteurs, badges, references) passent en mono espacee avec chiffres tabulaires.
- AC3: Les cartes de deck adoptent le langage monographie : reference mono, filets, description italique, et la progression devient une serie de graduations distinguant acquises / dues / non lues (la barre-pilule disparait).
- AC4: Le rouge d'annotation #A63D2A est l'unique couleur d'alerte memorielle : fiches dues, banniere de revision et marqueurs d'echeance l'utilisent de facon coherente sur les deux themes.
- AC5: Tous les contrastes texte/fond respectent WCAG AA sur les deux themes (verification documentee sur les paires principales), et l'accessibilite existante (focus-visible, skip-link, reduced-motion, sr-only) est intacte.
- AC6: Le build frontend et les tests existants passent, et le budget de bundle (`npm run budget`) est respecte webfont incluse.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_007_redesign_scientifique_de_l_interface_cahier_de_laboratoire.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_007_redesign_scientifique_de_l_interface_cahier_de_laboratoire.md` after implementation.
- npm run build OK ; npm test = 43 backend + 10 + SSR smoke, 0 echec ; npm run budget OK (JS 78.9/85 KB, CSS 3.5/15 KB) ; contrastes WCAG AA verifies sur les 2 themes (min 5.16 clair / 6.01 sombre)
- Finish workflow executed on 2026-07-19.
- Linked backlog/request close verification passed.

# AC Traceability
- request-AC1 -> This task. Proof: tokens papier/encre/prusse/annotation dans `apps/frontend/src/styles.css` (`:root`, `@media (prefers-color-scheme: dark)`, overrides `data-theme`) ; grep de controle : aucune valeur Tailwind residuelle (#f8fafc/#4f46e5/...).
- request-AC2 -> This task. Proof: `@font-face` Source Serif 4 (400/400 italic/600) auto-hebergee dans `apps/frontend/public/fonts/`, preload dans `index.html` ; `--serif` par defaut sur le contenu, `--mono` + `tabular-nums` sur metadonnees/etats.
- request-AC3 -> This task. Proof: `deckRef` (cote KPS·NNN) + filets doubles + description italique dans `DeckList.jsx`/`styles.css` ; composant `Graduations` remplace `ProgressBar` (classes `.progress`/`.progress-fill` supprimees). Nuance dues: cf. Report (portee par la banniere faute d'exposition backend du due-par-deck, hors perimetre).
- request-AC4 -> This task. Proof: `--accent` #A63D2A applique a `.review-banner`, `.sync-status`, `.import-errors`, `.quiz-choice.wrong`, `.btn-danger` ; ambre generique supprime ; verifie sur les deux themes.
- request-AC5 -> This task. Proof: 8 paires de contraste par theme calculees, toutes >= 4.5 (min 5.16 clair / 6.01 sombre) ; bloc accessibilite (focus-visible, skip-link, reduced-motion, sr-only) conserve a l'identique.
- request-AC6 -> This task. Proof: `npm run build` (frontend) OK ; `npm test` = 43 backend + 10 + SSR smoke, 0 echec ; `npm run budget` OK (JS 78.9/85 KB, CSS 3.5/15 KB).

# Report
- Livre en 3 vagues (ADR 009). Redesign "Cahier de laboratoire" (piste A + greffe B) applique.
- Vague 1 - fondations (AC1, AC2) :
  - `apps/frontend/src/styles.css` reecrit autour de tokens : palette papier/encre/prusse/annotation en clair ET sombre (media query + overrides `data-theme`). Zero valeur Tailwind residuelle (grep #f8fafc/#4f46e5/... = aucun).
  - Webfont Source Serif 4 (SIL OFL, 3 graisses : 400, 400 italic, 600) auto-hebergee dans `apps/frontend/public/fonts/`, `@font-face` avec `font-display: swap`, preload de la 400 dans `index.html`.
  - Piles typographiques : serif d'edition par defaut pour la lecture ; mono technique en petites capitales pour metadonnees/etats ; chiffres tabulaires (compteurs, cotes, comptes).
- Vague 2 - langage visuel (AC3, AC4) :
  - Cartes de deck en monographie : cote mono stable `KPS·NNN` (helper `deckRef` deterministe), filet double en tete, description en italique.
  - Progression : `ProgressBar` (barre-pilule) remplacee par `Graduations` (une graduation par fiche, plafond 24 ; acquises en encre pleine, restantes en filet). Classes `.progress`/`.progress-fill` supprimees.
  - Rouge d'annotation #A63D2A comme UNIQUE alerte memorielle : banniere de revision, `sync-status`, erreurs d'import, quiz "wrong", bouton de suppression. Ambre generique supprime (etats "vue" passent en contour prusse).
  - Restyling quiz, encadre "a retenir" (filets doubles), ecrans auth/import/admin par echange de tokens.
- Vague 3 - verification (AC5, AC6) :
  - Contrastes WCAG AA verifies sur 8 paires principales par theme : toutes >= 4.5 (min 5.16 clair, 6.01 sombre). Voir tableau ci-dessous.
  - Accessibilite preservee a l'identique (focus-visible, skip-link, reduced-motion, sr-only) en fin de `styles.css`.
  - Build frontend OK ; `npm test` = 43/43 backend + 10/10 + SSR smoke OK ; `npm run budget` OK (JS 78.9/85 KB, CSS 3.5/15 KB ; fontes en assets separes, hors budget JS/CSS).
- Contrastes (ratio min par theme) : clair 5.16 (muted/fond), sombre 6.01 (accent/surface) ; textes principaux 12-14.
- Nuance de perimetre (AC3) : faute d'exposition backend du "due par deck" (hors perimetre), les graduations des cartes distinguent acquises vs restantes ; la dimension "dues" est portee par la banniere de revision (rouge d'annotation) et les marqueurs d'echeance. Le "due par deck" reste un follow-up (avec la courbe de retention de la greffe B).
- Verification visuelle : rendu reel (vrai `styles.css` + Source Serif 4) des deux themes cote a cote -> artifact `https://claude.ai/code/artifact/d54f05e6-a885-4695-a28a-b52b523142d7`. Reference de direction : `https://claude.ai/code/artifact/680a2a49-a63f-4060-87e0-9c498aab0e00`.
- Fichiers modifies : `apps/frontend/src/styles.css`, `apps/frontend/src/pages/DeckList.jsx`, `apps/frontend/index.html`, `apps/frontend/vite.config.mjs`, + `apps/frontend/public/fonts/*.woff2` (nouveaux).
- Finished on 2026-07-19.
- Linked backlog item(s): `item_011_redesign_scientifique_de_l_interface_cahier_de_laboratoire`
- Related request(s): `req_006_redesign_scientifique_de_l_interface_cahier_de_laboratoire`

# AI Context
- Summary: Implement redesign scientifique de l'interface - cahier de laboratoire.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_006_redesign_scientifique_de_l_interface_cahier_de_laboratoire`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
