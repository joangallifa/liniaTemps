export const APP_KEYS = ["linia-temps", "definicions"] as const;
export type AppKey = (typeof APP_KEYS)[number];

export const APP_LABELS: Record<AppKey, string> = {
  "linia-temps": "Línia del temps",
  definicions: "Definicions de tecnologia",
};

export const APP_STATUSES = [
  "OCULT",
  "EDITABLE",
  "EDITAR_TECNOLOGIES",
  "EDITAR_METODOLOGIES",
  "CONSULTA",
] as const;
export type AppStatus = (typeof APP_STATUSES)[number];

export const APP_STATUS_LABELS: Record<AppStatus, string> = {
  OCULT: "Ocult",
  EDITABLE: "Visible per editar",
  EDITAR_TECNOLOGIES: "Editar tecnologies",
  EDITAR_METODOLOGIES: "Editar metodologies",
  CONSULTA: "Visible per consultar",
};

// La línia de temps separa l'edició en dues fases (tecnologies i
// metodologies SAMR/STEEP); definicions manté un únic estat editable.
export const APP_STATUS_OPTIONS: Record<AppKey, readonly AppStatus[]> = {
  "linia-temps": ["OCULT", "EDITAR_TECNOLOGIES", "EDITAR_METODOLOGIES", "CONSULTA"],
  definicions: ["OCULT", "EDITABLE", "CONSULTA"],
};

export const DEFAULT_APP_STATUS: Record<AppKey, AppStatus> = {
  "linia-temps": "EDITAR_TECNOLOGIES",
  definicions: "EDITABLE",
};
