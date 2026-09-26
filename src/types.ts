import type { Era } from "./lib/era";
import type { SamrLevel } from "./lib/samr";

export type Entry = {
  id: string;
  title: string;
  description: string;
  photo_url: string;
  photo_path: string;
  year: number;
  era: Era;
  author_id: string;
  created_at: string;
  profiles: { email: string } | null;
};

export type Analysis = {
  id: string;
  entry_id: string;
  author_id: string;
  samr_level: SamrLevel;
  steep_social: string;
  steep_tecnologic: string;
  steep_economic: string;
  steep_ecologic: string;
  steep_politic: string;
  created_at: string;
  profiles: { email: string } | null;
};
