// Libelles et regles de visibilite cote UI (miroir des regles backend).

export const VISIBILITY_LABEL = {
  private: "Privé",
  general: "Général",
  master: "Maître",
};

export const VISIBILITY_ORDER = ["private", "general", "master"];

/** Visibilites qu'un role peut choisir a la creation d'un deck. */
export function creatableVisibilities(role) {
  if (role === "master" || role === "admin") return ["private", "general", "master"];
  return ["private"]; // invite : uniquement des decks prives
}

export const isAdmin = (role) => role === "admin";
