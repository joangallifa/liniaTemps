export const ERA_LABELS = {
  PREHISTORIA: "Prehistòria",
  EDAT_ANTIGA: "Edat Antiga",
  EDAT_MITJANA: "Edat Mitjana",
  EDAT_MODERNA: "Edat Moderna",
  EDAT_CONTEMPORANIA: "Edat Contemporània",
} as const;

export type Era = keyof typeof ERA_LABELS;

export const ERA_OPTIONS = Object.entries(ERA_LABELS) as [Era, string][];

export const ERA_COLORS: Record<
  Era,
  { bg: string; border: string; pill: string }
> = {
  PREHISTORIA: {
    bg: "bg-stone-50",
    border: "border-stone-200",
    pill: "bg-stone-600",
  },
  EDAT_ANTIGA: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    pill: "bg-amber-600",
  },
  EDAT_MITJANA: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    pill: "bg-violet-600",
  },
  EDAT_MODERNA: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    pill: "bg-sky-600",
  },
  EDAT_CONTEMPORANIA: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    pill: "bg-emerald-600",
  },
};
