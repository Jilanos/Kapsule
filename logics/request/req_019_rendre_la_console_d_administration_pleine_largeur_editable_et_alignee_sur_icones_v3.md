## req_019_rendre_la_console_d_administration_pleine_largeur_editable_et_alignee_sur_icones_v3 - Rendre la console d'administration pleine largeur, editable et alignee sur Icones V3
> From version: 1.0.10
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Console d'administration et identité visuelle
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- L'administrateur utilise la largeur utile de son écran : la console et ses tableaux ne sont pas artificiellement contraints et les adresses email restent lisibles.
- L'administrateur peut effectivement changer le rôle d'un compte, supprimer un compte, supprimer un deck et modifier les métadonnées éditables d'un deck depuis la console.
- Toutes les marques et icônes effectivement affichées par Kapsule sont remplacées par leurs masters SVG correspondants du lot Icones V3 fourni, sans ajouter de marques non utilisées.

# Context
- La console actuelle expose déjà les mutations de rôle, les suppressions avec confirmation et le changement de visibilité ; les routes serveur doivent rester la source d'autorité.
- Le tableau de comptes applique actuellement une largeur maximale de 18rem à l'email et autorise la coupure des mots, ce qui écrase les adresses longues.
- Aucune route ni interface ne permet aujourd'hui de modifier le titre ou la description d'un deck ; l'édition demandée est donc bornée aux métadonnées métier title, description et visibility, et exclut le JSON des cartes, l'identifiant, les assets et le propriétaire.
- Les assets visuels réellement référencés sont les marques Kapsule, Paul Mondou et Gnosis ; les masters sémantiquement correspondants du lot Icones V3 sont kapsule-emblem.svg, paulmondou-emblem.svg et gnosis.svg.

# Acceptance criteria
- AC1: Sur un viewport desktop de 1440 px, la route /admin exploite toute la largeur disponible du contenu applicatif ; la colonne Email a une largeur minimale documentée et les adresses ne sont ni coupées caractère par caractère ni tronquées sans moyen de les consulter.
- AC2: Un administrateur peut modifier le rôle d'un autre compte et supprimer un compte depuis /admin ; l'interface affiche succès ou erreur, respecte les protections du dernier administrateur et de l'auto-modification, et les routes restent inaccessibles aux non-admins.
- AC3: Un administrateur peut supprimer un deck et éditer son titre, sa description et sa visibilité depuis /admin ; les modifications sont validées côté serveur, atomiques, journalisées, puis visibles après rechargement. L'identifiant, le propriétaire, les cartes et les assets ne sont pas éditables par cette fonction.
- AC4: Les trois assets visuels actuellement affichés (Kapsule, Paul Mondou, Gnosis), le favicon et les icônes PWA dérivées sont remplacés depuis les masters Icones V3 correspondants ; aucun asset d'une autre marque du lot n'est affiché par Kapsule.
- AC5: Les actions restent accessibles au clavier, ont des libellés explicites, annoncent leurs états asynchrones et conservent les confirmations renforcées avant suppression.
- AC6: La livraison couvre tests frontend/backend, build et contrôles Logics ; toute source temporaire d'assets externe est retirée ou ignorée avant commit afin que seuls les assets versionnés nécessaires restent dans le dépôt.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_010_console_d_administration_exploitable_et_identite_icones_v3_complete`
- Architecture decision(s): (none yet)

# References
- apps/frontend/src/pages/AdminConsole.jsx
- apps/frontend/src/components/admin/AdminUsers.jsx
- apps/frontend/src/components/admin/AdminDecks.jsx
- apps/frontend/src/styles.css
- apps/backend/src/app.mjs
- apps/backend/src/admin.mjs
- apps/frontend/public/brand/

# AI Context
- Summary: Rendre la console d'administration pleine largeur, editable et alignee sur Icones V3
- Keywords: request-chain-scaffold, rendre la console d'administration pleine largeur, editable et alignee sur icones v3, development-ready
- Use when: You need to implement or review the scaffolded workflow for Rendre la console d'administration pleine largeur, editable et alignee sur Icones V3.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_031_etendre_et_rendre_lisible_la_console_d_administration`
- `item_032_editer_de_facon_securisee_les_metadonnees_d_un_deck_depuis_l_administration`
- `item_033_remplacer_les_marques_et_icones_visibles_par_les_masters_icones_v3`
