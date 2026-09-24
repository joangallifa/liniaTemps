import type { Session } from "@supabase/supabase-js";
import type { Entry } from "../types";
import { TimelineCard } from "./TimelineCard";
import { ADMIN_EMAIL } from "../lib/supabase";
import { ERA_LABELS, type Era } from "../lib/era";

type Item =
  | { kind: "marker"; era: Era; key: string }
  | { kind: "entry"; entry: Entry; key: string };

function buildItems(entries: Entry[]): Item[] {
  const items: Item[] = [];
  let lastEra: Era | null = null;

  entries.forEach((entry, index) => {
    if (entry.era && entry.era !== lastEra) {
      items.push({ kind: "marker", era: entry.era, key: `era-${index}` });
      lastEra = entry.era;
    }
    items.push({ kind: "entry", entry, key: entry.id });
  });

  return items;
}

export function Timeline({
  entries,
  session,
  onDelete,
}: {
  entries: Entry[];
  session: Session | null;
  onDelete: (entry: Entry) => Promise<void>;
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
        <p className="text-sm text-slate-500">
          Encara no hi ha cap tecnologia afegida. Sigues el primer a
          compartir-ne una!
        </p>
      </div>
    );
  }

  const isAdmin = session?.user.email === ADMIN_EMAIL;
  const items = buildItems(entries);

  return (
    <div className="-mx-4 overflow-x-auto pb-6 sm:-mx-6">
      <div className="relative inline-grid grid-flow-col auto-cols-[220px] gap-5 px-4 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-4 top-[18px] h-px bg-slate-200 sm:inset-x-6"
        />

        {items.map((item) =>
          item.kind === "marker" ? (
            <div key={item.key} className="flex flex-col items-center">
              <div className="relative z-10 flex h-9 items-center justify-center">
                <span className="h-3.5 w-0.5 rounded-full bg-accent-500" />
              </div>
              <span className="mt-2 whitespace-nowrap rounded-full bg-accent-500 px-3 py-1 text-center text-xs font-semibold text-white shadow-sm">
                {ERA_LABELS[item.era]}
              </span>
            </div>
          ) : (
            <div key={item.key} className="flex flex-col items-stretch">
              <div className="relative z-10 flex h-9 items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-500 ring-4 ring-[#f7f8fb]" />
              </div>
              <div className="mt-2 flex-1">
                <TimelineCard
                  entry={item.entry}
                  canDelete={isAdmin || session?.user.id === item.entry.author_id}
                  onDelete={onDelete}
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
