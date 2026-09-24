import type { Era } from "./lib/era";

export type Entry = {
  id: string;
  title: string;
  description: string;
  photo_url: string;
  photo_path: string;
  year: number;
  era: Era | null;
  author_id: string;
  created_at: string;
  profiles: { email: string } | null;
};
