import { useState } from "react";
import type { Entry } from "../types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ca-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function AdminPage({
  entries,
  onDelete,
}: {
  entries: Entry[];
  onDelete: (entry: Entry) => Promise<void>;
}) {
  const [author, setAuthor] = useState("");

  const authors = Array.from(
    new Set(entries.map((entry) => entry.profiles?.email).filter(Boolean))
  ).sort() as string[];

  const filtered = author
    ? entries.filter((entry) => entry.profiles?.email === author)
    : entries;

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Administració
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} de {entries.length} entrades, ordenades per data
            de creació.
          </p>
        </div>

        {authors.length > 0 && (
          <div>
            <label
              htmlFor="author-filter"
              className="mb-1.5 block text-xs font-medium text-slate-500"
            >
              Filtra per creador
            </label>
            <select
              id="author-filter"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
            >
              <option value="">Tots els creadors</option>
              {authors.map((email) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-400">
          {entries.length === 0
            ? "Encara no hi ha cap entrada."
            : "Cap entrada d'aquest creador."}
        </p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((entry) => (
            <AdminRow key={entry.id} entry={entry} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </div>
  );
}

function AdminRow({
  entry,
  onDelete,
}: {
  entry: Entry;
  onDelete: (entry: Entry) => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Eliminar "${entry.title}" (${entry.profiles?.email})?`))
      return;
    setDeleting(true);
    await onDelete(entry);
  }

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <img
        src={entry.photo_url}
        alt={entry.title}
        className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {entry.title}{" "}
          <span className="font-normal text-slate-400">({entry.year})</span>
        </p>
        <p className="truncate text-xs text-slate-500">
          {entry.profiles?.email ?? "—"} · {formatDate(entry.created_at)}
        </p>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex-shrink-0 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
      >
        {deleting ? "Eliminant..." : "Eliminar"}
      </button>
    </li>
  );
}
