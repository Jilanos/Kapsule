## item_026_inspecter_et_administrer_les_contenus_et_stockage_kapsule - Inspecter et administrer les contenus et stockage Kapsule
> From version: 1.0.7
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Observation des donnees
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Les administrateurs ne peuvent pas voir simplement quels decks, contenus et donnees occupent l'espace Kapsule.
- Une suppression de contenu doit respecter les relations entre deck, cartes, progression, revisions et assets sans transformer l'interface en editeur de base brut.

# Scope
- In:
  - Tableaux et details admin des decks, proprietaires, visibilites, compteurs de cartes et metriques de stockage autorisees.
  - Apercu agrégé de la taille SQLite, uploads et sauvegardes disponibles par categories non sensibles.
  - Actions metier admin existantes ou nouvelles, ciblees et journalisees, pour supprimer un contenu apres analyse d'impact et confirmation.
  - Tests de calculs, d'autorisations, de suppression et de non-divulgation.
- Out:
  - Navigation libre dans toutes les tables SQLite, execution de requetes ou export complet de la base.
  - Lecture ou telechargement arbitraire d'uploads et de sauvegardes.
  - Analyse de stockage des volumes d'autres applications ou de l'hote Docker.

# Acceptance criteria
- AC1: Seul un admin peut obtenir les listings et details de contenus; les resultats appliquent des limites, pagination et champs explicitement allowlistes.
- AC2: Chaque deck affiche son proprietaire, sa visibilite, ses compteurs utiles et une estimation de volume lorsque celle-ci est definissable de facon fiable; les valeurs indisponibles sont indiquees sans approximation trompeuse.
- AC3: Le tableau de stockage affiche les tailles agregees de base, uploads et sauvegardes disponibles, sans chemin absolu ni acces au contenu des fichiers.
- AC4: Toute suppression de contenu affiche les dependances et consequences, demande confirmation, s'execute dans une transaction ou selon une strategie compensee documentee, puis laisse un evenement d'audit.
- AC5: Les ecrans de contenus restent navigables au clavier, les tableaux ont des intitules accessibles et les retours asynchrones sont annonces.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Seul un admin peut obtenir les listings et details de contenus; les resultats appliquent des limites, pagination et champs explicitement allowlistes.
- request-AC4 -> This backlog slice. Proof: AC2: Chaque deck affiche son proprietaire, sa visibilite, ses compteurs utiles et une estimation de volume lorsque celle-ci est definissable de facon fiable; les valeurs indisponibles sont indiquees sans approximation trompeuse.
- request-AC5 -> This backlog slice. Proof: AC3: Le tableau de stockage affiche les tailles agregees de base, uploads et sauvegardes disponibles, sans chemin absolu ni acces au contenu des fichiers.
- request-AC6 -> This backlog slice. Proof: AC4: Toute suppression de contenu affiche les dependances et consequences, demande confirmation, s'execute dans une transaction ou selon une strategie compensee documentee, puis laisse un evenement d'audit.
- request-AC7 -> This backlog slice. Proof: AC5: Les ecrans de contenus restent navigables au clavier, les tableaux ont des intitules accessibles et les retours asynchrones sont annonces.
- request-AC8 -> This backlog slice. Proof: AC5: Les ecrans de contenus restent navigables au clavier, les tableaux ont des intitules accessibles et les retours asynchrones sont annonces.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_007_console_d_administration_kapsule`
- Architecture decision(s): (none yet)
- Request: `req_015_administrer_les_utilisateurs_et_contenus_kapsule`
- Primary task(s): `task_016_orchestrer_la_console_d_administration_kapsule`

# AI Context
- Summary: Inspecter et administrer les contenus et stockage Kapsule
- Keywords: scaffolded-backlog, inspecter et administrer les contenus et stockage kapsule, implementation-ready
- Use when: Implementing the scaffolded slice for Inspecter et administrer les contenus et stockage Kapsule.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium - apporte la visibilite operationnelle apres la suppression du besoin urgent de SQL pour les comptes.
- Rationale: Set by scaffold input or defaulted for grooming.
