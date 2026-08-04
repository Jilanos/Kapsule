## req_013_corriger_le_bandeau_de_lecture_desktop_et_aligner_l_identite_visuelle_kapsule - Corriger le bandeau de lecture desktop et aligner l'identite visuelle Kapsule
> From version: 1.0.4
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Experience de lecture, branding et release
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Conserver le bon rendu mobile du bandeau de lecture tout en corrigeant son cadrage desktop.
- Supprimer l'effet de fond blanc mal integre du bandeau desktop et harmoniser son fond avec la page.
- Remplacer les icones de site par les assets Kapsule disponibles dans le dossier personnel d'icones.
- Afficher l'embleme Kapsule en haut a gauche de l'application.
- Ajouter a droite de la barre superieure, pres de la deconnexion, un embleme Paulmondou qui pointe vers https://paulmondou.fr.
- Livrer le changement selon la politique finale de deploiement par tag de version.

# Context
- Le bandeau actuel du DeckReader est satisfaisant sur mobile mais presente sur desktop un cadrage et un fond blanc juges incorrects.
- Les assets Kapsule source sont dans /home/paul/dev/WORK/perso/Icones/kapsule.
- Les assets Paulmondou source sont dans /home/paul/dev/WORK/perso/Icones/paulmondou.
- La politique de release canonique impose validation locale, commits de preparation, push, CI verte, tag annote vX.Y.Z et verification du workflow declenche par tag.

# Acceptance criteria
- AC1: Sur desktop, le bandeau de lecture est correctement cadre, aligne avec le contenu, sans fond blanc incoherent, et reste lisible.
- AC2: Sur mobile, le comportement et le rendu satisfaisants du bandeau sont preserves.
- AC3: Les assets Kapsule sont copies dans le public frontend, l'embleme apparait en haut a gauche et le favicon de l'onglet utilise l'icone Kapsule appropriee.
- AC4: Un embleme Paulmondou apparait dans la barre superieure a droite de la deconnexion et ouvre https://paulmondou.fr via un lien accessible.
- AC5: Les images references sont servies par le frontend sans chemin local absolu ni dependance au dossier personnel d'icones.
- AC6: Le changement est verifie en local sur desktop et mobile, puis livre selon la sequence release: validation, commit implementation, preparation SemVer, commit version, push, CI verte, tag annote vX.Y.Z, verification release tagguee.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_005_identite_visuelle_et_navigation_de_lecture_kapsule`
- Architecture decision(s): (none yet)

# References
- apps/frontend/src/pages/DeckReader.jsx
- apps/frontend/src/styles.css
- apps/frontend/index.html
- apps/frontend/public
- /home/paul/dev/WORK/perso/Icones/kapsule
- /home/paul/dev/WORK/perso/Icones/paulmondou
- logics/instructions.md

# AI Context
- Summary: Corriger le bandeau de lecture desktop et aligner l'identite visuelle Kapsule
- Keywords: request-chain-scaffold, corriger le bandeau de lecture desktop et aligner l'identite visuelle kapsule, development-ready
- Use when: You need to implement or review the scaffolded workflow for Corriger le bandeau de lecture desktop et aligner l'identite visuelle Kapsule.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_020_corriger_le_bandeau_de_lecture_desktop_sans_regression_mobile`
- `item_021_integrer_les_emblemes_kapsule_et_paulmondou_dans_la_barre_superieure`
- `item_022_verifier_et_livrer_par_tag_de_version`
