## task_011_orchestrer_l_extraction_de_l_infra_vps_vers_paulmondou_infra - Orchestrer l'extraction de l'infra VPS vers paulmondou-infra
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Creer la chaine Logics et demarrer la task d'extraction.
- [x] 2. Inventorier deploy/ et separer ce qui appartient a l'infra globale de ce qui reste applicatif.
- [x] 3. Creer /home/paul/dev/paulmondou-infra, initialiser Git et transferer les fichiers globaux.
- [x] 4. Mettre a jour les READMEs et references Kapsule pour pointer vers le repo infra.
- [x] 5. Executer les validations locales Kapsule et les controles basiques infra.
- [x] 6. Creer le repo GitHub paulmondou-infra, puis committer et pousser Kapsule et paulmondou-infra.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_015_extraire_le_repo_infra_paulmondou_infra`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.
- request-AC2 -> This task. Proof: `deploy/` a ete supprime de Kapsule, le
  `Dockerfile` racine reste applicatif, et `README.md` pointe vers
  `Jilanos/paulmondou-infra`.
- request-AC3 -> This task. Proof: `README.md`, `.gitignore` et `.dockerignore`
  ont ete mis a jour pour supprimer les references actives a l'ancien
  `deploy/` applicatif.
- request-AC5 -> This task. Proof: `paulmondou-infra` contient `README.md`,
  `.gitignore`, `docker-compose.yml`, `Caddyfile`, `deploy.sh`, `backup.sh` et
  `sites/`; les scripts conservent le mode executable, `bash -n` et Prettier
  passent, et le grep de secrets evident ne retourne aucun resultat.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Termine le 2026-07-22 : paulmondou-infra cree localement et pousse en repo GitHub prive (commit ed06a78) ; Kapsule pousse sur main (commit 119d38f) avec deploy/ extrait, README mis a jour et chaine Logics creee ; CI GitHub Kapsule 29903482117 verte (format, tests, build, budget, audit, gitleaks, Docker+Trivy). Validations locales : npm run format:check, npm test, npm run build, npm run budget, npm audit --omit=dev, logics-manager lint --require-status, bash -n deploy.sh backup.sh et Prettier infra OK. Docker local indisponible dans cet environnement, donc docker compose config local non execute ; le build Docker CI a valide l'image Kapsule.
- Finish workflow executed on 2026-07-22.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-22.
- Linked backlog item(s): `item_015_extraire_le_repo_infra_paulmondou_infra`
- Related request(s): `req_010_extraire_l_infrastructure_vps_multi_projets_vers_paulmondou_infra`

# AI Context
- Summary: Orchestrer l'extraction de l'infra VPS vers paulmondou-infra
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_010_extraire_l_infrastructure_vps_multi_projets_vers_paulmondou_infra`
- Product brief(s): `prod_002_brief_infrastructure_vps_multi_projets_paulmondou_infra`
- Architecture decision(s): (none yet)
