import { useEffect } from "react";
import type { Entry } from "../types";
import { ERA_LABELS } from "../lib/era";
import { formatYear, authorLabel, initials } from "../lib/entryDisplay";

export function EntryModal({
  entry,
  onClose,
}: {
  entry: Entry;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 w-full flex-shrink-0 bg-slate-100">
          <img
            src={entry.photo_url}
            alt={entry.title}
            className="h-full w-full object-cover"
          />
          <button
            onClick={onClose}
            title="Tancar"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
              {formatYear(entry.year)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {ERA_LABELS[entry.era]}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
            {entry.title}
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {entry.description}
          </p>

          <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-xs font-semibold text-white">
              {initials(entry)}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {authorLabel(entry)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
