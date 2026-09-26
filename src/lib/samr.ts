export const SAMR_LEVELS = [
  "SUBSTITUCIO",
  "AUGMENT",
  "MODIFICACIO",
  "REDEFINICIO",
] as const;

export type SamrLevel = (typeof SAMR_LEVELS)[number];

export const SAMR_LABELS: Record<SamrLevel, string> = {
  SUBSTITUCIO: "Substitució",
  AUGMENT: "Augment",
  MODIFICACIO: "Modificació",
  REDEFINICIO: "Redefinició",
};

// Model SAMR del Dr. Ruben Puentedura.
export const SAMR_DESCRIPTIONS: Record<SamrLevel, string> = {
  SUBSTITUCIO:
    "Substitueix una eina o tècnica anterior, sense cap canvi funcional.",
  AUGMENT:
    "Substitueix l'eina anterior i hi afegeix una millora funcional directa.",
  MODIFICACIO:
    "Permet redissenyar significativament com es feia la tasca.",
  REDEFINICIO:
    "Permet crear tasques noves, abans inconcebibles sense aquesta tecnologia.",
};

export const SAMR_OPTIONS = SAMR_LEVELS.map(
  (level) => [level, SAMR_LABELS[level]] as const
);
