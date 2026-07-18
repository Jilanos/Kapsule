## req_005_durcir_kapsule_apres_audit_transversal - Durcir Kapsule apres audit transversal
> From version: 0.1.0
> Schema version: 1.0
> Status: Draft
> Understanding: 95
> Confidence: 91
> Complexity: High
> Theme: hardening
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Corriger les risques P0/P1 identifies dans `docs/audit-2026-07-18.md` avant
  d'augmenter l'exposition publique de Kapsule.
- Garantir qu'aucun secret local n'entre dans un contexte ou une couche Docker.
- Appliquer la visibilite d'un deck a toutes ses ressources et operations, y
  compris assets, progression et repetition espacee.
- Isoler strictement les caches, sessions et donnees entre comptes sur un meme
  navigateur.
- Installer des garde-fous automatises de qualite, securite, accessibilite et
  exploitation, puis remettre la documentation publique et la licence en coherence.

# Priority
- Priority: High
- Rationale: Une cle de deploiement peut entrer dans le cache Docker et plusieurs
  routes ou caches ne respectent pas completement la frontiere entre utilisateurs.

# Context
- L'audit du 2026-07-18 couvre le commit `1cf2ed0` et l'etat public GitHub du depot.
- Le MVP livre schema JSON, import, lecture, progression, SM-2, authentification,
  roles, PWA et deploiement Docker/Caddy.
- Le build frontend passe et reste compact (181,43 kB JS, 58,86 kB gzip).
- `npm audit --omit=dev` ne remonte aucune vulnerabilite de production ; l'audit
  complet remonte Vite (elevee) et esbuild (moderee) dans l'outillage.
- La suite backend est couplee au nombre de questions du deck exemple : 34/35 tests
  passent lorsque ce contenu evolue de 2 a 6 questions.
- GitHub ne detecte aucune licence, aucune CI et aucune protection de `main` ; le
  Community Profile observe est de 28 %.
- Une cle SSH locale est ignoree par Git, mais pas par `.dockerignore`, alors que le
  Dockerfile utilise `COPY . .`.
- Le cache Workbox des `/api/decks` n'est pas segmente par session et n'est pas
  purge au logout.
- Les assets de decks sont publics et les routes progression/revision ne verifient
  pas la visibilite du deck.
- La requete doit etre promue en backlog multi-slices : les corrections P0 ne
  doivent pas attendre les travaux UX ou de presentation.

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

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Scope
## In
- Durcissement application, PWA, Docker/Caddy, CI et gouvernance du depot.
- Tests de non-regression et preuves d'exploitation necessaires aux criteres.
- Mise a jour de la documentation publique et du corpus Logics affecte.

## Out
- Nouvelles fonctions pedagogiques sans lien avec les constats de l'audit.
- Migration vers PostgreSQL, application native ou refonte graphique complete.
- Deploiement automatique en production depuis la CI sans validation operateur.

# Sequencing
1. P0 : secrets Docker, rotation/purge, cache inter-comptes et controles d'acces.
2. P1 : authentification anti-abus, CI/protection de branche, licence et deploiement.
3. P2 : accessibilite, fiabilite hors ligne, performances, README et GitHub.

# Risks and dependencies
- La rotation de cle et la purge des caches sont des actions d'exploitation a
  coordonner sans jamais enregistrer la nouvelle cle dans Git ou Logics.
- Une modification du stockage de session/cache peut deconnecter les utilisateurs ;
  la strategie de migration doit etre explicite.
- La protection de branche depend des capacites du plan GitHub et des droits admin.
- Les en-tetes CSP doivent tenir compte des images externes et data URI autorisees
  par le schema ; ce contrat doit etre resserre ou documente.
- Les travaux sont assez larges pour plusieurs backlog items et taches independantes.

# Companion docs
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): (none yet)

# References
- `docs/audit-2026-07-18.md`
- `apps/backend/src/app.mjs`
- `apps/backend/src/auth.mjs`
- `apps/backend/src/store.mjs`
- `apps/frontend/src/api.js`
- `apps/frontend/vite.config.mjs`
- `.dockerignore`
- `Dockerfile`
- `deploy/`
- `README.md`

# AI Context
- Summary: Corriger les risques de securite, qualite, accessibilite, performance et
  gouvernance identifies par l'audit transversal de Kapsule.
- Keywords: hardening, security, authorization, PWA cache, Docker, CI, accessibility,
  performance, license, GitHub
- Use when: Grooming or implementing remediation work from the 2026-07-18 audit.
- Skip when: The work adds unrelated learning features or changes deck content.

# Backlog
- none
- `item_010_durcir_kapsule_apres_audit_transversal`
