## item_025_administrer_les_comptes_et_roles_kapsule - Administrer les comptes et roles Kapsule
> From version: 1.0.7
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Administration securisee
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Les roles sont attribues en production par SQL ponctuel, operation non decouvrable, non auditée par l'application et risquee.
- L'operateur ne dispose pas d'une vue unique de l'impact d'une suppression de compte.

# Scope
- In:
  - Routes API d'administration protegees par requireAdmin et validations serveur strictes.
  - Liste, recherche et detail de comptes minimisant les donnees exposees.
  - Mutation de role avec protection du dernier administrateur actif.
  - Desactivation ou suppression de compte selon une politique de dependances explicitement choisie et testee.
  - Table d'audit et ecriture transactionnelle pour les mutations sensibles.
  - Ecran frontend /admin utilisable au clavier avec confirmations et retours d'etat.
- Out:
  - Acces SQL libre ou edition de colonnes brutes.
  - Gestion d'identite partagee avec les autres applications.
  - Suppression automatique de comptes fondee sur une heuristique d'inactivite.

# Acceptance criteria
- AC1: Les endpoints comptes et roles exigent une session admin cote serveur et retournent 401 ou 403 selon le contexte; des tests negatifs couvrent guest et master.
- AC2: La recherche par email et le detail de compte retournent uniquement les champs prevus par le contrat admin et les compteurs d'impact necessaires a une decision.
- AC3: La mutation de role est atomique, valide l'enum guest/master/admin et ne peut pas retirer le dernier administrateur actif; chaque refus est comprehensible et teste.
- AC4: La suppression ou desactivation exige une confirmation porteuse de l'identifiant cible, affiche l'impact avant execution et applique la politique de dependances documentee sans laisser de references orphelines.
- AC5: Les mutations de role et de compte produisent des evenements d'audit non modifiables par l'API courante, associes a l'administrateur acteur et sans secret.
- AC6: L'interface admin propose des libelles, etats de chargement, erreurs et succes accessibles; elle ne presente jamais une action non autorisee comme une securite suffisante.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Les endpoints comptes et roles exigent une session admin cote serveur et retournent 401 ou 403 selon le contexte; des tests negatifs couvrent guest et master.
- request-AC2 -> This backlog slice. Proof: AC2: La recherche par email et le detail de compte retournent uniquement les champs prevus par le contrat admin et les compteurs d'impact necessaires a une decision.
- request-AC3 -> This backlog slice. Proof: AC3: La mutation de role est atomique, valide l'enum guest/master/admin et ne peut pas retirer le dernier administrateur actif; chaque refus est comprehensible et teste.
- request-AC5 -> This backlog slice. Proof: AC4: La suppression ou desactivation exige une confirmation porteuse de l'identifiant cible, affiche l'impact avant execution et applique la politique de dependances documentee sans laisser de references orphelines.
- request-AC6 -> This backlog slice. Proof: AC5: Les mutations de role et de compte produisent des evenements d'audit non modifiables par l'API courante, associes a l'administrateur acteur et sans secret.
- request-AC8 -> This backlog slice. Proof: AC6: L'interface admin propose des libelles, etats de chargement, erreurs et succes accessibles; elle ne presente jamais une action non autorisee comme une securite suffisante.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_007_console_d_administration_kapsule`
- Architecture decision(s): (none yet)
- Request: `req_015_administrer_les_utilisateurs_et_contenus_kapsule`
- Primary task(s): `task_016_orchestrer_la_console_d_administration_kapsule`

# AI Context
- Summary: Administrer les comptes et roles Kapsule
- Keywords: scaffolded-backlog, administrer les comptes et roles kapsule, implementation-ready
- Use when: Implementing the scaffolded slice for Administrer les comptes et roles Kapsule.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High - elimine les changements SQL manuels de roles et securise les operations quotidiennes sur les comptes.
- Rationale: Set by scaffold input or defaulted for grooming.
