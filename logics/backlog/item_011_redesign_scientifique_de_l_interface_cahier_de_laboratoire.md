## item_011_redesign_scientifique_de_l_interface_cahier_de_laboratoire - Redesign scientifique de l'interface - cahier de laboratoire
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
Sortir du look SaaS generique (palette Tailwind slate + indigo, system-ui, cartes arrondies ombrees) : l'interface actuelle est propre mais interchangeable, sans identite propre.
Donner a Kapsule une identite visuelle scientifique alignee sur son sujet (memoire, consolidation, repetition espacee) : direction "cahier de laboratoire" (edition scientifique type Distill), avec une greffe du langage de trace memorielle pour les etats de revision.
Ameliorer l'experience de lecture, geste central du produit (fiches de 5-10 min), via une vraie typographie editoriale.
Preserver integralement l'accessibilite existante (focus-visible, skip-link, reduced-motion, sr-only), qui est un acquis a ne pas regresser.

# Scope
- In:
  - Echange complet des tokens de `apps/frontend/src/styles.css` : palette papier/encre/prusse/annotation, themes clair et sombre.
  - Webfont serif d'edition auto-hebergee (assets + `@font-face` + preload dans `index.html`) appliquee au contenu des fiches ; mono technique pour metadonnees et etats.
  - Restyling des composants existants : cartes de deck (monographie + graduations), banniere de revision, etats des fiches, quiz, encadre "a retenir", ecrans auth/import/admin (echange de tokens seulement).
  - Ajustements JSX minimaux si necessaires au nouveau langage visuel (ex. graduations de progression dans `DeckList.jsx`), sans changement de comportement ni d'API.
  - Verification contrastes AA documentee + non-regression a11y et budget de bundle.
- Out:
  - Courbe de retention calculee sur les cartes de deck (greffe B complete, seconde iteration).
  - Notes de marge dynamiques, theme configurable par utilisateur.
  - Tout changement backend, schema de deck ou logique SM-2.

# Acceptance criteria
- AC1: La nouvelle palette (papier/encre/prusse/annotation) remplace slate+indigo dans les tokens de `styles.css`, en clair comme en sombre, sans aucune valeur Tailwind litterale residuelle (#f8fafc, #4f46e5, etc.).
- AC2: Le contenu des fiches (titres, sections, paragraphes) est rendu dans une serif d'edition auto-hebergee avec pile de secours systeme ; les metadonnees et etats (compteurs, badges, references) passent en mono espacee avec chiffres tabulaires.
- AC3: Les cartes de deck adoptent le langage monographie : reference mono, filets, description italique, et la progression devient une serie de graduations distinguant acquises / dues / non lues (la barre-pilule disparait).
- AC4: Le rouge d'annotation #A63D2A est l'unique couleur d'alerte memorielle : fiches dues, banniere de revision et marqueurs d'echeance l'utilisent de facon coherente sur les deux themes.
- AC5: Tous les contrastes texte/fond respectent WCAG AA sur les deux themes (verification documentee sur les paires principales), et l'accessibilite existante (focus-visible, skip-link, reduced-motion, sr-only) est intacte.
- AC6: Le build frontend et les tests existants passent, et le budget de bundle (`npm run budget`) est respecte webfont incluse.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: La nouvelle palette (papier/encre/prusse/annotation) remplace slate+indigo dans les tokens de `styles.css`, en clair comme en sombre, sans aucune valeur Tailwind litterale residuelle (#f8fafc, #4f46e5, etc.).
- request-AC2 -> This backlog slice. Proof: AC2: Le contenu des fiches (titres, sections, paragraphes) est rendu dans une serif d'edition auto-hebergee avec pile de secours systeme ; les metadonnees et etats (compteurs, badges, references) passent en mono espacee avec chiffres tabulaires.
- request-AC3 -> This backlog slice. Proof: AC3: Les cartes de deck adoptent le langage monographie : reference mono, filets, description italique, et la progression devient une serie de graduations distinguant acquises / dues / non lues (la barre-pilule disparait).
- request-AC4 -> This backlog slice. Proof: AC4: Le rouge d'annotation #A63D2A est l'unique couleur d'alerte memorielle : fiches dues, banniere de revision et marqueurs d'echeance l'utilisent de facon coherente sur les deux themes.
- request-AC5 -> This backlog slice. Proof: AC5: Tous les contrastes texte/fond respectent WCAG AA sur les deux themes (verification documentee sur les paires principales), et l'accessibilite existante (focus-visible, skip-link, reduced-motion, sr-only) est intacte.
- request-AC6 -> This backlog slice. Proof: AC6: Le build frontend et les tests existants passent, et le budget de bundle (`npm run budget`) est respecte webfont incluse.

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
- Request: `req_006_redesign_scientifique_de_l_interface_cahier_de_laboratoire`
- Primary task(s): `task_007_redesign_scientifique_de_l_interface_cahier_de_laboratoire`

# AI Context
- Summary: Redesign scientifique de l'interface - cahier de laboratoire
- Keywords: backlog-groom, request, redesign scientifique de l'interface - cahier de laboratoire, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Redesign scientifique de l'interface - cahier de laboratoire.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: Direction validee par l'operateur (revue de design 2026-07-19) ; prochaine tranche de livraison une fois task_006 (durcissement) close, sans dependance technique bloquante.

# Notes
- Hybrid rationale: Derived from request `req_006_redesign_scientifique_de_l_interface_cahier_de_laboratoire` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_006_redesign_scientifique_de_l_interface_cahier_de_laboratoire.md`.
- Generated locally by logics-manager.
- Task `task_007_redesign_scientifique_de_l_interface_cahier_de_laboratoire` was finished via `logics-manager flow finish task` on 2026-07-19.

# Tasks
- `task_007_redesign_scientifique_de_l_interface_cahier_de_laboratoire`
