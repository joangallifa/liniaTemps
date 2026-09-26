export const APP_KEYS = ["linia-temps", "definicions"] as const;
export type AppKey = (typeof APP_KEYS)[number];

export const APP_LABELS: Record<AppKey, string> = {
  "linia-temps": "Línia del temps",
  definicions: "Definicions de tecnologia",
};

export const APP_STATUSES = ["OCULT", "EDITABLE", "CONSULTA"] as const;
export type AppStatus = (typeof APP_STATUSES)[number];

export const APP_STATUS_LABELS: Record<AppStatus, string> = {
  OCULT: "Ocult",
  EDITABLE: "Visible per editar",
  CONSULTA: "Visible per consultar",
};

export const DEFAULT_APP_STATUS: AppStatus = "EDITABLE";
