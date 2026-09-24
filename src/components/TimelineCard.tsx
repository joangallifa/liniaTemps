import type { Entry } from "../types";
import { ERA_LABELS } from "../lib/era";

function formatYear(year: number) {
  return year < 0 ? `${Math.abs(year)} aC` : `${year}`;
}

function authorLabel(entry: Entry) {
  return entry.profiles?.email.split("@")[0] ?? "Anònim";
}

function initials(entry: Entry) {
  return authorLabel(entry).slice(0, 1).toUpperCase();
}

export function TimelineCard({ entry }: { entry: Entry }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-48 w-full bg-slate-100">
        <img
          src={entry.photo_url}
          alt={entry.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
            {formatYear(entry.year)}
          </span>
          {entry.era && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {ERA_LABELS[entry.era]}
            </span>
          )}
        </div>

        <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
          {entry.title}
        </h2>
        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {entry.description}
        </p>

        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-xs font-semibold text-white">
            {initials(entry)}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {authorLabel(entry)}
          </span>
        </div>
      </div>
    </article>
  );
}
