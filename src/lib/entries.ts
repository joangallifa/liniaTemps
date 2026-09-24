import { supabase } from "./supabase";
import type { Entry } from "../types";

export async function deleteEntry(entry: Entry): Promise<string | null> {
  // Esborrem primer l'entrada: si l'esborrat de la foto fallés després,
  // val més una foto òrfena (recuperable manualment) que una entrada
  // que no es pot eliminar mai perquè un error d'storage ho bloqueja.
  const { error } = await supabase.from("entries").delete().eq("id", entry.id);

  if (error) return error.message;

  if (entry.photo_path) {
    const { error: storageError } = await supabase.storage
      .from("photos")
      .remove([entry.photo_path]);

    if (storageError) {
      console.error("No s'ha pogut esborrar la foto:", storageError.message);
    }
  }

  return null;
}
