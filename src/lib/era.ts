export const ERA_LABELS = {
  PREHISTORIA: "Prehistòria",
  EDAT_ANTIGA: "Edat Antiga",
  EDAT_MITJANA: "Edat Mitjana",
  EDAT_MODERNA: "Edat Moderna",
  EDAT_CONTEMPORANIA: "Edat Contemporània",
} as const;

export type Era = keyof typeof ERA_LABELS;

export const ERA_OPTIONS = Object.entries(ERA_LABELS) as [Era, string][];
