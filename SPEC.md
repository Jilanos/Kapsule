# SPEC — Format des fiches Kapsule

Ce document est le **contrat de contenu** de Kapsule. Il sert à deux publics :

1. **Les humains** qui veulent comprendre le format des fiches.
2. **Les agents IA** à qui l'on demande : _« Crée-moi des fiches sur le sujet X en
   respectant SPEC.md »_. Le résultat doit être un fichier JSON importable
   **sans aucune retouche**.

La validation est stricte : un deck qui ne respecte pas ce format est **rejeté à
l'import** avec un rapport d'erreurs. Le schéma JSON de référence est
`packages/schema/deck.schema.json` ; ce document en est la version rédigée.

---

## 1. Principe

Un **deck** est un ensemble ordonné de **fiches** (cards) courtes. Chaque fiche
se lit en 5 à 10 minutes et se compose de **sections typées**. Les types de
sections sont **fermés** : on ne peut pas en inventer. C'est ce qui garantit un
affichage toujours correct.

## 2. Consignes pédagogiques (pour les agents IA)

- **Court** : une fiche = un concept digeste, lisible en 5–10 min (`durationMin` ≤ 10).
- **Autonome** : chaque fiche se comprend seule, sans dépendre des autres.
- **Progressif** : ordonner les fiches du plus simple au plus avancé dans le deck.
- **Concret** : préférer des exemples parlants aux définitions abstraites.
- **Actif** : terminer chaque fiche par une section `quiz` (1 à 3 questions) pour
  ancrer l'apprentissage.
- **Structure recommandée d'une fiche** : `intro` → un ou plusieurs `concept`
  (+ `example`) → `takeaways` → `quiz`.
- **Ton** : clair, direct, bienveillant. Éviter le jargon non expliqué.
- **Langue** : rédiger dans la langue demandée par l'utilisateur (français par défaut).

## 3. Markdown léger

Les champs de texte (`content`) acceptent du **Markdown léger** : `**gras**`,
`*italique*`, `` `code inline` ``, listes à puces. Pas de titres (`#`), pas
d'images en Markdown (utiliser le champ `image` dédié), pas de HTML.

## 4. Structure d'un deck

```jsonc
{
  "schemaVersion": 1,          // obligatoire, toujours 1
  "id": "mon-deck",            // obligatoire, slug: [a-z0-9-]
  "title": "Titre du deck",    // obligatoire
  "description": "…",          // optionnel, ≤ 500 caractères
  "tags": ["tag1", "tag2"],    // optionnel, chaînes uniques
  "cards": [ /* … */ ]         // obligatoire, 1 à 200 fiches
}
```

### Fiche (`card`)

```jsonc
{
  "id": "ma-fiche",            // obligatoire, slug unique dans le deck
  "title": "Titre de la fiche",// obligatoire
  "durationMin": 5,            // optionnel, entier 1–10
  "level": "debutant",         // optionnel: "debutant" | "intermediaire" | "avance"
  "sections": [ /* … */ ]      // obligatoire, 1 à 30 sections
}
```

## 5. Types de sections

Chaque section a un champ `type`. **Aucune autre propriété que celles listées
n'est autorisée** (validation stricte).

### `intro`
Accroche d'ouverture.
```json
{ "type": "intro", "content": "Texte d'introduction." }
```

### `concept`
Cœur pédagogique. Image optionnelle.
```json
{
  "type": "concept",
  "heading": "Titre du concept",
  "content": "Explication.",
  "image": { "src": "img/schema.png", "alt": "Description", "caption": "Légende" }
}
```
`heading` et `image` sont optionnels ; `content` est obligatoire.

### `example`
Illustration concrète. Même structure que `concept`.
```json
{ "type": "example", "heading": "En pratique", "content": "Exemple concret." }
```

### `takeaways`
Points clés à retenir.
```json
{
  "type": "takeaways",
  "heading": "À retenir",
  "items": ["Point 1", "Point 2", "Point 3"]
}
```
`items` : 1 à 10 chaînes. `heading` optionnel.

### `quiz`
Questions à choix unique en fin de fiche.
```json
{
  "type": "quiz",
  "questions": [
    {
      "q": "La question ?",
      "choices": ["Choix A", "Choix B", "Choix C"],
      "answer": 1,
      "explanation": "Pourquoi B est correct."
    }
  ]
}
```
- `questions` : 1 à 10.
- `choices` : 2 à 6 propositions.
- `answer` : **index base 0** de la bonne réponse (doit être < nombre de choix).
- `explanation` : optionnel mais recommandé.

## 6. Images

Le champ `image` référence une image par un **chemin relatif** (`img/…`) résolu
dans les assets du deck, ou une **data URI**. Toujours fournir un `alt`.

## 7. Règles de validation (résumé)

| Règle | Effet si violée |
|-------|-----------------|
| `schemaVersion` = 1 | rejet |
| `id` deck/fiche au format slug `[a-z0-9-]` | rejet |
| identifiants de fiches uniques dans le deck | rejet |
| ≥ 1 fiche par deck, ≥ 1 section par fiche | rejet |
| type de section ∈ {intro, concept, example, takeaways, quiz} | rejet |
| aucune propriété hors de celles définies | rejet |
| `quiz.answer` < nombre de `choices` | rejet |

## 8. Vérifier un deck localement

```bash
npm run validate-deck -- chemin/vers/mon-deck.json
```

## 9. Prompt type pour un agent IA

> Tu es un générateur de fiches Kapsule. Lis le contrat `SPEC.md`. Produis un
> **unique fichier JSON** valide (rien d'autre que le JSON) : un deck sur le
> sujet **« … »**, avec **N fiches** de 5–10 min, chacune structurée
> `intro → concept(s) → example → takeaways → quiz`. Respecte strictement les
> types de sections et n'ajoute aucune propriété non prévue. Langue : français.

Un exemple complet et valide est disponible dans
[`decks/reseaux-essentiels.json`](decks/reseaux-essentiels.json).
