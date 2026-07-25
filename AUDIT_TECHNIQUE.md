# Audit technique - Kapsule

Date : 2026-07-25  
Revision auditee : `b986d35` (`main`)  
Perimetre : schema de decks, API, authentification, autorisations, SQLite, PWA, tests,
conteneur, CI/CD et gouvernance Logics.

## Verdict

Kapsule est le depot le plus mature du perimetre : architecture claire, autorisations largement
testees, migrations versionnees, PWA prudente sur les donnees authentifiees, image non-root et CI
complete.

La prochaine release est cependant bloquee par l'audit de dependances actuel. Les principaux
risques fonctionnels restants concernent l'identification IP derriere proxy, la croissance sans
quota des donnees importees et une contradiction entre le schema d'images et la CSP de production.

## Verifications executees

| Controle               | Resultat                                              |
| ---------------------- | ----------------------------------------------------- |
| `npm test`             | 10 tests schema, 57 backend, 5 frontend : tous passes |
| `npm run build`        | OK                                                    |
| `npm run format:check` | OK                                                    |
| `npm run budget`       | OK : JS 78,9 kB gzip / 85 kB ; CSS 4,0 kB / 15 kB     |
| `npm audit --omit=dev` | Echec : 2 vulnerabilites elevees React Router         |
| `logics-manager audit` | OK                                                    |
| `logics-manager lint`  | OK                                                    |
| Etat release Logics    | Non configure                                         |
| Etat i18n Logics       | Contrat absent                                        |

## Constats prioritaires

### P0 - L'audit de production est rouge

`react-router-dom@7.18.1` installe `react-router@7.18.1`, inclus dans l'avis
`GHSA-qwww-vcr4-c8h2`. `npm audit --omit=dev` remonte deux vulnerabilites de severite elevee et
propose un retour a `7.11.0` comme correction avec changement potentiellement cassant.

L'avis vise le mode RSC et l'application est une SPA classique, ce qui reduit probablement
l'exploitabilite directe. Cela ne change pas le fait que la gate CI/release documentee doit echouer.

Solution :

- confirmer l'applicabilite de l'avis au mode utilise ;
- passer a une version corrigee compatible, avec tests de navigation ;
- ne pas utiliser `npm audit fix --force` sans revue ;
- ajouter une politique documentee d'exception temporaire seulement si le risque est formellement
  non applicable et avec date d'expiration.

### P0 - `trust proxy: true` rend la limite d'authentification falsifiable

Express fait confiance a toute la chaine `X-Forwarded-For`. Derriere Caddy, un client peut
potentiellement injecter une valeur en amont et influencer `req.ip`, selon la chaine exacte
d'en-tetes. Comme la limite login/register est indexee uniquement par cette valeur, le brute force
peut etre reparti sur des adresses forgees.

Solution :

- faire confiance uniquement au proxy Compose attendu ou a un nombre exact de sauts ;
- faire nettoyer/recreer `X-Forwarded-For` par Caddy ;
- tester une requete contenant deja cet en-tete ;
- combiner limite IP, limite par email normalise et ralentissement progressif.

### P1 - Imports et stockage sans quota

Tout compte `guest` peut creer un nombre illimite de decks prives. Le corps JSON est limite a 5 Mo,
mais le deck complet est stocke dans `decks.data` et chaque fiche est dupliquee dans `cards.data`.
Des imports repetes peuvent donc faire croitre la base et les sauvegardes rapidement, puis saturer le
volume du VPS.

Solution :

- quota de decks, octets et imports par utilisateur ;
- limite globale de stockage avec alerte ;
- rate limit des imports et refus avant transaction ;
- mesurer la taille serialisee et eviter la duplication complete a terme ;
- ajouter une politique de retention/suppression des comptes et donnees.

### P1 - Le schema accepte des images que la production bloque

Le contrat autorise chemins relatifs, data URI et URL HTTP(S). La CSP Caddy de production impose
`img-src 'self' data:` et bloque donc toutes les images externes HTTPS pourtant valides au schema.
Un deck peut etre accepte puis afficher des images cassees.

Solution :

- choisir un contrat unique : refuser les URL externes dans le schema ;
- ou les importer/proxifier vers le stockage Kapsule apres controles de taille, MIME et SSRF ;
- eviter d'elargir globalement la CSP a `https:` si les contenus tiers ne sont pas maitrises ;
- ajouter un test de rendu pour chaque type de source autorise.

### P1 - Jetons de session a forte valeur en clair

Les tokens Bearer durent 90 jours glissants, sont stockes en clair dans SQLite et dans
`localStorage`. Un XSS ou une fuite de base/sauvegarde donne directement acces aux sessions actives.
La CSP stricte et le rendu React sans HTML brut reduisent fortement le risque XSS, mais la
consequence d'une fuite reste elevee.

Solution :

- stocker uniquement un digest des tokens en base ;
- definir une duree absolue en plus de l'expiration glissante ;
- permettre a l'utilisateur de voir et revoquer ses appareils ;
- evaluer un cookie `HttpOnly; Secure; SameSite` avec protection CSRF pour le web.

### P1 - CORS est ouvert sans besoin fonctionnel clair

`cors()` autorise toutes les origines alors que le frontend et l'API sont servis en meme origine.
Les Bearer tokens ne sont pas envoyes automatiquement, mais toute origine peut appeler l'API si un
token fuit. Cette surface ne correspond pas a une integration publique documentee.

Solution : meme origine par defaut en production, allowlist explicite pour les clients autorises,
et contrat d'API externe separe si necessaire.

### P1 - Tests navigateur absents

La couverture backend est bonne, mais le frontend ne dispose que de tests de fonctions et d'un smoke
SSR. Les flux reels login, import, changement de compte, quiz, revision, PWA, expiration de session,
responsive et accessibilite ne sont pas pilotes dans un navigateur.

Solution : suite Playwright courte sur les parcours critiques, incluant deux comptes successifs et
verification qu'aucune reponse API n'est restituee par le cache.

### P1 - Assets orphelins et contrat d'upload incomplet

La suppression d'un deck supprime les donnees SQL par cascade, mais pas necessairement son repertoire
d'uploads. L'interface importe du JSON sans flux complet d'upload d'images relatives. Le schema
promet donc un type d'asset dont le cycle creation, remplacement et suppression n'est pas entierement
gere.

Solution : transaction logique DB/fichiers, collecte des assets orphelins, upload controle ou retrait
temporaire de la promesse de chemins relatifs.

### P1 - Readiness trop superficielle

`/api/health` retourne seulement `{ok:true}`. Il ne verifie ni ouverture/ecriture SQLite, ni
migrations, ni presence du secret d'asset requis en production. La release peut etre declaree saine
alors que la premiere operation metier echoue.

Solution : separer liveness et readiness, avec lecture DB, version de schema, espace disque et
configuration obligatoire.

### P2 - Course sur le premier compte

`register()` determine `isFirst` avant le calcul scrypt asynchrone. Deux inscriptions concurrentes
sur une base vide peuvent toutes deux se croire premieres et rattacher successivement la progression
historique `default`. Le cas est rare car les inscriptions sont normalement ouvertes de facon
controlee.

Solution : decider le premier compte dans la transaction avec une contrainte/etat de migration
atomique.

### P2 - Workflow Logics inacheve

Une tache de durcissement est encore `In progress` et une demande reste `Draft`, malgre un audit
Logics sans erreur. L'etat release n'est pas configure et le contrat i18n est absent alors que le
produit possede beaucoup de texte utilisateur.

Solution : clore ou requalifier les documents ouverts, initialiser le contrat de release et declarer
au minimum le francais comme locale source.

### P2 - Supply chain encore partiellement mutable

CI, CodeQL, gitleaks, Trivy et Dependabot sont de tres bons controles. Les images de base et actions
restent toutefois referencees par tags, et la release ne publie pas explicitement SBOM/provenance.

Solution : pinner par digest/SHA, activer attestations et SBOM, puis deployer le digest produit.

## Plan recommande

### Immediat

- Resoudre ou documenter formellement l'alerte React Router.
- Restreindre `trust proxy` et tester les en-tetes Caddy.
- Aligner schema d'images et CSP.

### Prochaine iteration

- Ajouter quotas d'import/stockage et readiness reelle.
- Hasher les tokens de session et ajouter leur gestion utilisateur.
- Ajouter les parcours Playwright multi-comptes/PWA.

### Ensuite

- Completer le cycle de vie des assets.
- Clore Logics, initialiser release/i18n.
- Renforcer encore la supply chain.

## Points forts a conserver

- Autorisations centralisees et tres largement testees.
- Validation JSON stricte et transactions SQLite.
- PWA configurée `NetworkOnly` pour les API authentifiees.
- CI complete avec format, tests, build, budget, audit, gitleaks, CodeQL et Trivy.
- Image multi-stage non-root et contexte Docker cible.
- Documentation publique, politique de securite et ADR de bon niveau.
