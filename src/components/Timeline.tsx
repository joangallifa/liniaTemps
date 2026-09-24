import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Entry } from "../types";
import { TimelineCard } from "./TimelineCard";
import { EntryModal } from "./EntryModal";
import { ADMIN_EMAIL } from "../lib/supabase";
import { ERA_LABELS, ERA_COLORS, type Era } from "../lib/era";

type Segment = { era: Era; entries: Entry[] };

function buildSegments(entries: Entry[]): Segment[] {
  const segments: Segment[] = [];
  for (const entry of entries) {
    const last = segments[segments.length - 1];
    if (last && last.era === entry.era) {
      last.entries.push(entry);
    } else {
      segments.push({ era: entry.era, entries: [entry] });
    }
  }
  return segments;
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
  const [selected, setSelected] = useState<Entry | null>(null);

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
  const segments = buildSegments(entries);

  return (
    <div className="-mx-4 overflow-x-auto pb-8 sm:-mx-6">
      <div className="relative flex items-stretch gap-6 px-4 sm:px-6">
        {/* Línia contínua: el punt de cada entrada sempre queda 38px per
            sota del sostre del seu panell (pt-8 + meitat del punt), així
            que un únic top fix alinea totes les entrades. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[38px] z-0 h-0.5 rounded-full bg-gradient-to-r from-accent-200 via-accent-400 to-accent-200"
        />

        {segments.map((segment, segIndex) => {
          const colors = ERA_COLORS[segment.era];
          return (
            <section
              key={`${segment.era}-${segIndex}`}
              className={`relative z-10 flex-shrink-0 rounded-3xl border ${colors.border} ${colors.bg} px-4 pb-4 pt-8 shadow-sm`}
            >
              <span
                className={`absolute -top-3 left-4 whitespace-nowrap rounded-full ${colors.pill} px-3 py-1 text-[11px] font-semibold text-white shadow-sm`}
              >
                {ERA_LABELS[segment.era]}
              </span>

              <div className="flex items-stretch gap-4">
                {segment.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex h-full w-56 flex-shrink-0 flex-col items-center"
                  >
                    <span className="h-3 w-3 flex-shrink-0 rounded-full border-2 border-white bg-accent-500 shadow ring-1 ring-accent-200" />
                    <div className="mt-3 flex w-full flex-1">
                      <TimelineCard
                        entry={entry}
                        canDelete={
                          isAdmin || session?.user.id === entry.author_id
                        }
                        onDelete={onDelete}
                        onOpen={setSelected}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {selected && (
        <EntryModal entry={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
