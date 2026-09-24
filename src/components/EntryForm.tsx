import { useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { ERA_OPTIONS, ERA_RANGES, ERA_LABELS, eraRangeLabel, type Era } from "../lib/era";
import { sanitizeHtml, htmlToText } from "../lib/richText";
import { RichTextEditor } from "./RichTextEditor";
import type { Entry } from "../types";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function EntryForm({
  session,
  entry,
  onSaved,
}: {
  session: Session;
  entry?: Entry;
  onSaved: () => void;
}) {
  const isEditing = !!entry;
  const [description, setDescription] = useState(entry?.description ?? "");
  const [eraInput, setEraInput] = useState<string>(entry?.era ?? "");
  const [yearInput, setYearInput] = useState(entry?.year?.toString() ?? "");
  const [preview, setPreview] = useState<string | null>(entry?.photo_url ?? null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedRange = eraInput ? ERA_RANGES[eraInput as Era] : null;
  const parsedYear = Number.parseInt(yearInput, 10);
  const yearOutOfRange =
    selectedRange !== null &&
    Number.isFinite(parsedYear) &&
    (parsedYear < selectedRange.min || parsedYear > selectedRange.max);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : entry?.photo_url ?? null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = (formData.get("title") as string).trim();
    const descriptionHtml = sanitizeHtml(description);
    const yearRaw = yearInput.trim();
    const eraRaw = eraInput;
    const photo = formData.get("photo") as File | null;
    const hasNewPhoto = !!photo && photo.size > 0;

    if (
      !title ||
      !htmlToText(descriptionHtml) ||
      !yearRaw ||
      !eraRaw ||
      (!isEditing && !hasNewPhoto)
    ) {
      setError(
        "Falten camps obligatoris (títol, descripció, any, època o foto)."
      );
      return;
    }

    const year = Number.parseInt(yearRaw, 10);
    if (!Number.isFinite(year)) {
      setError("L'any no és vàlid.");
      return;
    }

    const range = ERA_RANGES[eraRaw as Era];
    if (year < range.min || year > range.max) {
      setError(
        `Aquest any no correspon a l'època ${ERA_LABELS[eraRaw as Era]} (${eraRangeLabel(eraRaw as Era)}).`
      );
      return;
    }

    if (hasNewPhoto) {
      if (!photo!.type.startsWith("image/")) {
        setError("El fitxer ha de ser una imatge.");
        return;
      }
      if (photo!.size > MAX_PHOTO_BYTES) {
        setError("La imatge no pot superar els 5 MB.");
        return;
      }
    }

    setSubmitting(true);

    let photoUrl = entry?.photo_url ?? "";
    let photoPath = entry?.photo_path ?? "";

    if (hasNewPhoto) {
      const extension = photo!.name.split(".").pop() ?? "jpg";
      const newPath = `${session.user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(newPath, photo!);

      if (uploadError) {
        setError("No s'ha pogut pujar la foto: " + uploadError.message);
        setSubmitting(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("photos").getPublicUrl(newPath);

      photoUrl = publicUrl;
      photoPath = newPath;
    }

    const payload = {
      title,
      description: descriptionHtml,
      year,
      era: eraRaw as Era,
      photo_url: photoUrl,
      photo_path: photoPath,
    };

    const { error: saveError } = isEditing
      ? await supabase.from("entries").update(payload).eq("id", entry!.id)
      : await supabase
          .from("entries")
          .insert({ ...payload, author_id: session.user.id });

    if (saveError) {
      setError("No s'ha pogut desar la tecnologia: " + saveError.message);
      setSubmitting(false);
      return;
    }

    if (hasNewPhoto && entry?.photo_path && entry.photo_path !== photoPath) {
      supabase.storage.from("photos").remove([entry.photo_path]);
    }

    onSaved();
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
          defaultValue={entry?.title ?? ""}
          placeholder="Ex: La impremta"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="era" className="mb-1.5 block text-sm font-medium text-slate-700">
            Època
          </label>
          <select
            id="era"
            name="era"
            required
            value={eraInput}
            onChange={(e) => setEraInput(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
          >
            <option value="" disabled hidden>
              Selecciona una època
            </option>
            {ERA_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="year" className="mb-1.5 block text-sm font-medium text-slate-700">
            Any aproximat
          </label>
          <input
            id="year"
            name="year"
            type="number"
            required
            disabled={!selectedRange}
            min={selectedRange?.min}
            max={selectedRange?.max}
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            placeholder={
              selectedRange ? "Negatiu per aC (ex: -3000)" : "Tria primer l'època"
            }
            className={`w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-accent-100 disabled:bg-slate-50 disabled:text-slate-400 ${
              yearOutOfRange
                ? "border-red-400 focus:border-red-400"
                : "border-slate-300 focus:border-accent-400"
            }`}
          />
          <p
            className={`mt-1 text-xs ${
              yearOutOfRange ? "text-red-600" : "text-slate-400"
            }`}
          >
            {selectedRange
              ? `${ERA_LABELS[eraInput as Era]}: ${eraRangeLabel(eraInput as Era)}`
              : "El rang d'anys depèn de l'època."}
          </p>
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Descripció
        </span>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Explica breument què és i per què va ser important..."
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
          required={!isEditing}
          onChange={handlePhotoChange}
          className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none file:mr-3 file:rounded-full file:border-0 file:bg-accent-500 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
        />
        <p className="mt-1 text-xs text-slate-400">
          {isEditing
            ? "Deixa-ho buit per mantenir la foto actual. Màxim 5 MB."
            : "Màxim 5 MB."}
        </p>
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
        {submitting
          ? "Desant..."
          : isEditing
            ? "Desar els canvis"
            : "Afegir a la línia de temps"}
      </button>
    </form>
  );
}
