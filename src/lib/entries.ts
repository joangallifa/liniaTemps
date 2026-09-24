import { supabase } from "./supabase";
import type { Entry } from "../types";

export async function deleteEntry(entry: Entry): Promise<string | null> {
  const { error: storageError } = await supabase.storage
    .from("photos")
    .remove([entry.photo_path]);

  if (storageError) {
    // No bloquegem l'esborrat de l'entrada si falla l'esborrat de la foto.
    console.error("No s'ha pogut esborrar la foto:", storageError.message);
  }

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", entry.id);

  return error ? error.message : null;
}
