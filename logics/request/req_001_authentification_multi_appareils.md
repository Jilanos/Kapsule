## req_001_authentification_multi_appareils - Authentification multi-appareils
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: auth
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Retrouver sa progression Kapsule sur n'importe quel appareil (PC, telephone Android en PWA) en se connectant a son compte.
- Cloisonner la progression et les revisions par utilisateur : plusieurs personnes peuvent utiliser la meme instance sans se marcher dessus.
- Pouvoir revoquer une session (deconnexion d'un appareil) sans invalider les autres.
- Garder la bibliotheque de decks commune a tous les utilisateurs de l'instance.

# Context
- Le MVP fonctionne avec un utilisateur unique `default` : la "synchronisation" n'isole rien et ne s'applique qu'a une instance mono-personne.
- Decision d'architecture (ADR 002) : email + mot de passe geres en propre, hachage scrypt natif Node, sessions par token opaque en base (pas de JWT), duree 90 jours renouvelee a l'usage.
- Les progressions `default` existantes doivent etre rattachees au premier compte cree (migration).
- L'inscription doit pouvoir etre fermee par variable d'environnement une fois les comptes du foyer crees.
- La PWA peut rester longtemps hors-ligne : un token expire doit re-demander la connexion sans perdre la progression accumulee localement.
- Hors perimetre (follow-ups) : verification d'email, reset de mot de passe, OAuth.

# Acceptance criteria
- AC1: Un utilisateur peut creer un compte (email + mot de passe), se connecter et se deconnecter ; le mot de passe est hache (scrypt), jamais stocke en clair.
- AC2: Chaque appareil obtient son propre token de session revocable ; la deconnexion d'un appareil n'affecte pas les autres.
- AC3: Toutes les routes de progression/revisions exigent une session valide et ne renvoient que les donnees de l'utilisateur authentifie.
- AC4: La progression existante de l'utilisateur `default` est migree vers le premier compte cree, sans perte.
- AC5: `KAPSULE_REGISTRATION=closed` ferme l'inscription avec un message clair, sans bloquer les connexions existantes.
- AC6: Le frontend gere le cycle complet : ecran connexion/inscription, expiration de session (retour au login sans crash), affichage de l'utilisateur connecte.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): `adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement`

# References
- `apps/backend/src/store.mjs` (user_id `default` actuel)
- `apps/backend/src/db.mjs` (schema a migrer : tables users, sessions)
- `apps/frontend/src/api.js` (client API a enrichir du token)

# AI Context
- Summary: Authentification email + mot de passe avec sessions par appareil et cloisonnement de la progression par utilisateur.
- Keywords: auth, sessions, scrypt, multi-appareils, migration default
- Use when: Implementing or reviewing the v0.2 authentication work.
- Skip when: The change concerns SM-2 scheduling or deployment infrastructure.

# Backlog
- none
- `item_006_authentification_multi_appareils`
