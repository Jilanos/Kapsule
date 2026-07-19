## req_006_redesign_scientifique_de_l_interface_cahier_de_laboratoire - Redesign scientifique de l'interface - cahier de laboratoire
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 85
> Complexity: Medium
> Theme: design
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Sortir du look SaaS generique (palette Tailwind slate + indigo, system-ui, cartes arrondies ombrees) : l'interface actuelle est propre mais interchangeable, sans identite propre.
- Donner a Kapsule une identite visuelle scientifique alignee sur son sujet (memoire, consolidation, repetition espacee) : direction "cahier de laboratoire" (edition scientifique type Distill), avec une greffe du langage de trace memorielle pour les etats de revision.
- Ameliorer l'experience de lecture, geste central du produit (fiches de 5-10 min), via une vraie typographie editoriale.
- Preserver integralement l'accessibilite existante (focus-visible, skip-link, reduced-motion, sr-only), qui est un acquis a ne pas regresser.

# Context
- Revue de design du 2026-07-19 : diagnostic et trois pistes maquettees (artifact `https://claude.ai/code/artifact/680a2a49-a63f-4060-87e0-9c498aab0e00`). Piste retenue : A "Cahier de laboratoire" comme base, avec greffe du langage de trace de la piste B pour les etats memoriels.
- Tout le styling est centralise dans `apps/frontend/src/styles.css` (~800 lignes) avec des tokens CSS (`--bg`, `--surface`, `--primary`...) : le redesign est un echange de tokens + ajustements de composants, pas une refonte structurelle. Aucun changement backend.
- Nouvelle palette : papier #FBFAF6, encre #1D2A32, bleu de Prusse #23566B (primaire), rouge d'annotation #A63D2A (unique couleur d'alerte, remplace l'ambre et le rouge generique), filet #CFD4CC. Mode sombre a transposer avec le meme soin (encre inversee, pas une simple inversion naive).
- Typographie : serif d'edition pour la lecture des fiches (webfont auto-hebergee ~30 ko, ex. Source Serif ou STIX, avec pile de secours Charter/Georgia) ; mono technique en petites capitales espacees pour les metadonnees, references et etats ; chiffres tabulaires.
- Vocabulaire visuel : decks presentes comme des monographies (reference mono type "KPS-042", filets doubles, description en italique facon abstract) ; progression en serie de graduations (acquises / dues / non lues) au lieu de la barre-pilule ; sections de fiches numerotees (paragraphe 2.1) ; encadre "a retenir" a filets.
- Hors perimetre (follow-ups) : courbe de retention calculee sur les cartes de deck (seconde iteration de la greffe B), notes de marge dynamiques, theme configurable par utilisateur, refonte des ecrans d'administration au-dela de l'echange de tokens.
- Risque connu : le serif et les filets peuvent paraitre austeres si mal doses ; valider le rendu mobile (l'app est une PWA) et le contraste AA sur les deux themes.

# Acceptance criteria
- AC1: La nouvelle palette (papier/encre/prusse/annotation) remplace slate+indigo dans les tokens de `styles.css`, en clair comme en sombre, sans aucune valeur Tailwind litterale residuelle (#f8fafc, #4f46e5, etc.).
- AC2: Le contenu des fiches (titres, sections, paragraphes) est rendu dans une serif d'edition auto-hebergee avec pile de secours systeme ; les metadonnees et etats (compteurs, badges, references) passent en mono espacee avec chiffres tabulaires.
- AC3: Les cartes de deck adoptent le langage monographie : reference mono, filets, description italique, et la progression devient une serie de graduations distinguant acquises / dues / non lues (la barre-pilule disparait).
- AC4: Le rouge d'annotation #A63D2A est l'unique couleur d'alerte memorielle : fiches dues, banniere de revision et marqueurs d'echeance l'utilisent de facon coherente sur les deux themes.
- AC5: Tous les contrastes texte/fond respectent WCAG AA sur les deux themes (verification documentee sur les paires principales), et l'accessibilite existante (focus-visible, skip-link, reduced-motion, sr-only) est intacte.
- AC6: Le build frontend et les tests existants passent, et le budget de bundle (`npm run budget`) est respecte webfont incluse.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `apps/frontend/src/styles.css` (tokens et integralite du styling a faire evoluer)
- `apps/frontend/src/pages/DeckList.jsx` (cartes de deck, progression, banniere de revision)
- `apps/frontend/src/components/CardView.jsx` et `Section.jsx` (lecture des fiches, cible de la serif)
- `apps/frontend/index.html` (preload de la webfont)
- `scripts/check-bundle-budget.mjs` (budget a respecter webfont incluse)
- Revue de design + maquettes : artifact `https://claude.ai/code/artifact/680a2a49-a63f-4060-87e0-9c498aab0e00`

# AI Context
- Summary: Redesign visuel "cahier de laboratoire" (edition scientifique) de l'interface Kapsule, palette papier/encre/prusse/annotation, serif editoriale pour la lecture, progression en graduations memorielles.
- Keywords: redesign, design tokens, typographie, serif, palette, cahier de laboratoire, accessibilite
- Use when: Implementing or reviewing the visual redesign of the Kapsule frontend.
- Skip when: The change concerns backend logic, data model, or deployment.

# Backlog
- none
- `item_011_redesign_scientifique_de_l_interface_cahier_de_laboratoire`
