import type { Entry } from "../types";

export function formatYear(year: number) {
  return year < 0 ? `${Math.abs(year)} aC` : `${year}`;
}

export function authorLabel(entry: Entry) {
  return entry.profiles?.email.split("@")[0] ?? "Anònim";
}

export function initials(entry: Entry) {
  return authorLabel(entry).slice(0, 1).toUpperCase();
}
