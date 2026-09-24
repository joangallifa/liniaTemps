"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ERA_OPTIONS } from "@/lib/era";

export function EntryForm() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No s'ha pogut desar la tecnologia.");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperat.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700">
          Títol de la tecnologia
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Ex: La impremta"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="year" className="mb-1.5 block text-sm font-medium text-slate-700">
            Any
          </label>
          <input
            id="year"
            name="year"
            type="number"
            required
            placeholder="Ex: 1440 (o -3000 per a.C.)"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="era" className="mb-1.5 block text-sm font-medium text-slate-700">
            Època{" "}
            <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <select
            id="era"
            name="era"
            defaultValue=""
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
          >
            <option value="">Sense especificar</option>
            {ERA_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Descripció
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          placeholder="Explica breument què és i per què va ser important..."
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
        />
      </div>

      <div>
        <label htmlFor="photo" className="mb-1.5 block text-sm font-medium text-slate-700">
          Fotografia
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          required
          onChange={handlePhotoChange}
          className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none file:mr-3 file:rounded-full file:border-0 file:bg-accent-500 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
        />
        <p className="mt-1 text-xs text-slate-400">Màxim 4 MB.</p>
        {preview && (
          <img
            src={preview}
            alt="Previsualització"
            className="mt-3 h-40 w-full rounded-xl object-cover"
          />
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-accent-600 disabled:opacity-60"
      >
        {submitting ? "Desant..." : "Afegir a la línia de temps"}
      </button>
    </form>
  );
}
