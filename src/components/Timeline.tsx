import type { Entry } from "../types";
import { TimelineCard } from "./TimelineCard";

export function Timeline({ entries }: { entries: Entry[] }) {
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

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200"
      />
      <ol className="space-y-8">
        {entries.map((entry) => (
          <li key={entry.id} className="relative pl-10">
            <span className="absolute left-0 top-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[#f7f8fb] bg-accent-500" />
            <TimelineCard entry={entry} />
          </li>
        ))}
      </ol>
    </div>
  );
}
