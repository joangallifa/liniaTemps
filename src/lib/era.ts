import { Era } from "@prisma/client";

export const ERA_LABELS: Record<Era, string> = {
  PREHISTORIA: "Prehistòria",
  EDAT_ANTIGA: "Edat Antiga",
  EDAT_MITJANA: "Edat Mitjana",
  EDAT_MODERNA: "Edat Moderna",
  EDAT_CONTEMPORANIA: "Edat Contemporània",
};

export const ERA_OPTIONS = Object.entries(ERA_LABELS) as [Era, string][];
