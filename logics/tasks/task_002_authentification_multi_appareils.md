## task_002_authentification_multi_appareils - Authentification multi-appareils
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [ ] The backlog scope is implemented.
- [ ] Acceptance criteria are covered.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_006_authentification_multi_appareils`

# Acceptance criteria
- AC1: Un utilisateur peut creer un compte (email + mot de passe), se connecter et se deconnecter ; le mot de passe est hache (scrypt), jamais stocke en clair.
- AC2: Chaque appareil obtient son propre token de session revocable ; la deconnexion d'un appareil n'affecte pas les autres.
- AC3: Toutes les routes de progression/revisions exigent une session valide et ne renvoient que les donnees de l'utilisateur authentifie.
- AC4: La progression existante de l'utilisateur `default` est migree vers le premier compte cree, sans perte.
- AC5: `KAPSULE_REGISTRATION=closed` ferme l'inscription avec un message clair, sans bloquer les connexions existantes.
- AC6: Le frontend gere le cycle complet : ecran connexion/inscription, expiration de session (retour au login sans crash), affichage de l'utilisateur connecte.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_002_authentification_multi_appareils.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_002_authentification_multi_appareils.md` after implementation.

# Report
- Implementation complete.

# AI Context
- Summary: Implement authentification multi-appareils.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_001_authentification_multi_appareils`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
