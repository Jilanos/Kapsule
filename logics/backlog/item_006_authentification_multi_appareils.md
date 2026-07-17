## item_006_authentification_multi_appareils - Authentification multi-appareils
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
Retrouver sa progression Kapsule sur n'importe quel appareil (PC, telephone Android en PWA) en se connectant a son compte.
Cloisonner la progression et les revisions par utilisateur : plusieurs personnes peuvent utiliser la meme instance sans se marcher dessus.
Pouvoir revoquer une session (deconnexion d'un appareil) sans invalider les autres.
Garder la bibliotheque de decks commune a tous les utilisateurs de l'instance.

# Scope
- In:
  - one coherent delivery slice from the source request
- Out:
  - unrelated sibling slices that should stay in separate backlog items instead of widening this doc

# Acceptance criteria
- AC1: Un utilisateur peut creer un compte (email + mot de passe), se connecter et se deconnecter ; le mot de passe est hache (scrypt), jamais stocke en clair.
- AC2: Chaque appareil obtient son propre token de session revocable ; la deconnexion d'un appareil n'affecte pas les autres.
- AC3: Toutes les routes de progression/revisions exigent une session valide et ne renvoient que les donnees de l'utilisateur authentifie.
- AC4: La progression existante de l'utilisateur `default` est migree vers le premier compte cree, sans perte.
- AC5: `KAPSULE_REGISTRATION=closed` ferme l'inscription avec un message clair, sans bloquer les connexions existantes.
- AC6: Le frontend gere le cycle complet : ecran connexion/inscription, expiration de session (retour au login sans crash), affichage de l'utilisateur connecte.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Un utilisateur peut creer un compte (email + mot de passe), se connecter et se deconnecter ; le mot de passe est hache (scrypt), jamais stocke en clair.
- request-AC2 -> This backlog slice. Proof: AC2: Chaque appareil obtient son propre token de session revocable ; la deconnexion d'un appareil n'affecte pas les autres.
- request-AC3 -> This backlog slice. Proof: AC3: Toutes les routes de progression/revisions exigent une session valide et ne renvoient que les donnees de l'utilisateur authentifie.
- request-AC4 -> This backlog slice. Proof: AC4: La progression existante de l'utilisateur `default` est migree vers le premier compte cree, sans perte.
- request-AC5 -> This backlog slice. Proof: AC5: `KAPSULE_REGISTRATION=closed` ferme l'inscription avec un message clair, sans bloquer les connexions existantes.
- request-AC6 -> This backlog slice. Proof: AC6: Le frontend gere le cycle complet : ecran connexion/inscription, expiration de session (retour au login sans crash), affichage de l'utilisateur connecte.

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
- Request: `logics/request/req_001_authentification_multi_appareils.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Authentification multi-appareils
- Keywords: backlog-groom, request, authentification multi-appareils, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Authentification multi-appareils.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- Hybrid rationale: Derived from request `req_001_authentification_multi_appareils` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_001_authentification_multi_appareils.md`.
- Generated locally by logics-manager.

# Tasks
- `task_002_authentification_multi_appareils`
