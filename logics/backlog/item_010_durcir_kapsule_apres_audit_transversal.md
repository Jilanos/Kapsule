## item_010_durcir_kapsule_apres_audit_transversal - Durcir Kapsule apres audit transversal
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 95
> Confidence: 90
> Progress: 0%
> Complexity: High
> Theme: Security, reliability and repository hardening
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Kapsule remplit son parcours MVP, mais l'audit du 2026-07-18 a identifie des
risques incompatibles avec une ouverture publique plus large : une cle SSH locale
peut entrer dans le contexte Docker, le cache PWA peut melanger les donnees de deux
comptes et plusieurs routes ne reappliquent pas la visibilite des decks. Le depot
ne dispose par ailleurs d'aucune CI obligatoire, licence exploitable, preuve WCAG
ou garde-fou d'exploitation suffisant.

Ce backlog livre un durcissement transversal ordonne par risque. Les protections
de secrets et d'isolation P0 sont traitees avant les travaux de qualite P1/P2.

# Scope
- In:
  - Hygiene des secrets Git/Docker, rotation de la cle exposee au cache et preuves
    d'exploitation sans enregistrer de secret dans le depot.
  - Autorisation uniforme des decks, assets, progressions et revisions, avec tests
    negatifs sur toute la matrice roles/visibilites.
  - Isolation du cache PWA et durcissement de l'authentification, des sessions et
    des limites d'entree.
  - CI, protection de branche, licence, politique de securite et maintenance des
    dependances.
  - Durcissement Docker/Caddy et correction de la reproductibilite du deploiement.
  - Accessibilite WCAG 2.2 AA, fiabilite hors ligne, budgets de performance,
    sauvegarde hors site et presentation README/GitHub.
  - Mise a jour du brief produit et creation des decisions d'architecture requises
    par le cache, les sessions, la CSP et le contrat d'images.
- Out:
  - Nouvelles fonctionnalites pedagogiques sans lien avec l'audit.
  - Migration PostgreSQL, application native ou refonte graphique complete.
  - Deploiement automatique en production sans validation operateur.
  - Stockage de secrets, adresses de production ou preuves sensibles dans Git ou
    dans les documents Logics.

# Acceptance criteria
- AC1 - Hygiene des secrets : `.dockerignore` et le Dockerfile n'envoient que les
  fichiers necessaires ; un scan de secrets bloque toute regression ; la cle de
  deploiement potentiellement entree dans un cache est remplacee et les caches
  concernes sont purges avec une preuve d'operation sans secret dans le depot.
- AC2 - Autorisations : toute route liee a un deck applique une decision centralisee
  de lecture/ecriture ; assets, progression, revision et dues ont des tests negatifs
  couvrant private/general/master et guest/master/admin, y compris un changement de
  visibilite apres creation d'une revision.
- AC3 - Cache et sessions : aucune reponse authentifiee d'un compte ne peut etre
  servie a un autre compte sur le meme navigateur, en ligne ou hors ligne ; le cache
  est desactive ou segmente et purge a login/logout ; le stockage du token et la
  politique de session font l'objet d'une decision de securite documentee.
- AC4 - Resistance aux abus : login/register sont limites en debit, le hachage ne
  bloque pas la boucle evenementielle, les tailles d'entree sont bornees et
  l'inscription de production est fermee par defaut ; des tests prouvent les cas
  limites sans rendre les tests temporels instables.
- AC5 - Chaine CI : chaque PR execute format/lint, tests, build, validation Logics,
  audit des dependances, scan de secrets et analyse de securite ; `main` exige ces
  checks et interdit les pushes directs ; les tests utilisent leurs propres fixtures
  metier plutot que le contenu de demonstration mutable.
- AC6 - Licence et gouvernance : un fichier `LICENSE` coherent avec le choix MIT,
  `SECURITY.md`, contribution et templates GitHub sont presents ; Dependabot ou un
  equivalent est configure ; Vite/esbuild sont mis a niveau sans alerte connue.
- AC7 - Deploiement : `.env.example` est versionne sans secret, le chemin distant par
  defaut fonctionne, les images sont maitrisees, l'app tourne sans root avec
  healthcheck et durcissement raisonnable, et Caddy pose les en-tetes HTTP retenus.
- AC8 - Accessibilite : auth, liste, import, lecture, quiz et revision passent les
  controles automatises axe sans violation serieuse et un parcours clavier manuel
  WCAG 2.2 AA ; focus de route, statuts live, progression semantique, contraste et
  reduction des animations sont couverts.
- AC9 - Fiabilite produit : les ecritures hors ligne ou en erreur sont rejouees ou
  presentees comme non synchronisees avec une action de retry ; les suppressions
  demandent confirmation ; les promesses hors ligne sont conformes au comportement.
- AC10 - Performance et operations : un budget frontend et des seuils API sont
  mesures en CI ou smoke ; les ecritures de session sont reduites, les sessions
  expirees purgees, les gros decks bornes/pagines si necessaire ; sauvegarde hors
  site et restauration periodique produisent une preuve.
- AC11 - Presentation : README et metadata GitHub decrivent les fonctionnalites
  reelles, prerequis, configuration, architecture, securite, tests, limites et
  licence, avec une capture ou demo ; le brief produit est aligne sur le produit
  livre et ne conserve pas de donnees personnelles d'exploitation inutiles.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: vague P0 secrets/Docker et preuve operateur de rotation/purge.
- request-AC2 -> This backlog slice. Proof: vague P0 autorisations et tests negatifs API.
- request-AC3 -> This backlog slice. Proof: vague P0 cache/session et test inter-comptes navigateur.
- request-AC4 -> This backlog slice. Proof: vague P1 authentification anti-abus et tests de charge bornes.
- request-AC5 -> This backlog slice. Proof: vague P1 CI obligatoire, fixtures autonomes et protection de `main`.
- request-AC6 -> This backlog slice. Proof: vague P1 licence, gouvernance et maintenance des dependances.
- request-AC7 -> This backlog slice. Proof: vague P1 deploiement reproductible et smoke Docker/Caddy.
- request-AC8 -> This backlog slice. Proof: vague P2 tests axe et parcours clavier WCAG 2.2 AA.
- request-AC9 -> This backlog slice. Proof: vague P2 synchronisation/retry et confirmation des suppressions.
- request-AC10 -> This backlog slice. Proof: vague P2 budgets, metriques et preuves sauvegarde/restauration.
- request-AC11 -> This backlog slice. Proof: vague P2 README, metadata GitHub et brief produit alignes.

# Decision framing
- Product framing: Needed
- Product signals: promesse hors ligne partielle, brief `Proposed` obsolete, parcours
  d'erreur et suppression a clarifier.
- Product follow-up: mettre a jour `prod_001_kapsule_product_brief` pendant la vague P2.
- Architecture framing: Needed
- Architecture signals: cache authentifie, stockage de session, CSP/URL d'images,
  hachage asynchrone et frontiere d'autorisation commune.
- Architecture follow-up: produire ou mettre a jour une ADR avant les choix
  irreversibles des vagues P0/P1.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_005_durcir_kapsule_apres_audit_transversal.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Livrer le durcissement securite, fiabilite, accessibilite, performance et
  gouvernance issu de l'audit Kapsule du 2026-07-18.
- Keywords: hardening, Docker secrets, authorization, PWA cache, sessions, CI,
  accessibility, performance, license, operations
- Use when: Implementing or reviewing `task_006` and its P0/P1/P2 checkpoints.
- Skip when: Adding unrelated learning features or changing deck content.

# Priority
- Priority: High
- Rationale: Le risque de secret dans le cache Docker et les fuites potentielles
  entre comptes doivent etre corriges avant toute nouvelle ouverture publique.

# Notes
- Le backlog reste une livraison coherente mais sera execute en vagues : aucun
  travail P2 ne doit retarder les protections P0.
- Source file: `logics/request/req_005_durcir_kapsule_apres_audit_transversal.md`.
- Generated locally by logics-manager.

# Tasks
- `task_006_durcir_kapsule_apres_audit_transversal`
