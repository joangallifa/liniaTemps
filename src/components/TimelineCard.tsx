import { useState } from "react";
import type { Entry } from "../types";
import { formatYear, authorLabel, initials } from "../lib/entryDisplay";

export function TimelineCard({
  entry,
  canDelete,
  onDelete,
  onOpen,
}: {
  entry: Entry;
  canDelete: boolean;
  onDelete: (entry: Entry) => Promise<void>;
  onOpen: (entry: Entry) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm(`Segur que vols eliminar "${entry.title}"?`)) return;
    setDeleting(true);
    await onDelete(entry);
  }

  return (
    <article
      onClick={() => onOpen(entry)}
      className="group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-32 w-full flex-shrink-0 bg-slate-100">
        <img
          src={entry.photo_url}
          alt={entry.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Eliminar"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm transition hover:bg-white disabled:opacity-60"
          >
            {deleting ? "…" : "✕"}
          </button>
        )}
        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-accent-700 shadow-sm">
          {formatYear(entry.year)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-slate-900">
          {entry.title}
        </h2>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
          {entry.description}
        </p>
        <span className="mt-1 text-[11px] font-medium text-accent-600 group-hover:underline">
          Veure més
        </span>

        <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-500 text-[10px] font-semibold text-white">
            {initials(entry)}
          </span>
          <span className="truncate text-[11px] font-medium text-slate-500">
            {authorLabel(entry)}
          </span>
        </div>
      </div>
    </article>
  );
}
