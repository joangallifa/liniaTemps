export const ERA_LABELS = {
  PREHISTORIA: "Prehistòria",
  EDAT_ANTIGA: "Edat Antiga",
  EDAT_MITJANA: "Edat Mitjana",
  EDAT_MODERNA: "Edat Moderna",
  EDAT_CONTEMPORANIA: "Edat Contemporània",
} as const;

export type Era = keyof typeof ERA_LABELS;

export const ERA_OPTIONS = Object.entries(ERA_LABELS) as [Era, string][];

// Límits orientatius de cada època (anys negatius = aC).
export const ERA_RANGES: Record<Era, { min: number; max: number }> = {
  PREHISTORIA: { min: -3000000, max: -3500 },
  EDAT_ANTIGA: { min: -3500, max: 476 },
  EDAT_MITJANA: { min: 477, max: 1492 },
  EDAT_MODERNA: { min: 1493, max: 1789 },
  EDAT_CONTEMPORANIA: { min: 1790, max: new Date().getFullYear() },
};

function yearLabel(year: number) {
  return year < 0 ? `${-year} aC` : `${year}`;
}

export function eraRangeLabel(era: Era) {
  const { min, max } = ERA_RANGES[era];
  return era === "PREHISTORIA"
    ? `fins al ${yearLabel(max)}`
    : `del ${yearLabel(min)} al ${yearLabel(max)}`;
}

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
