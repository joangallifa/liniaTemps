import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useSession } from "../hooks/useSession";

export function AppUnavailable() {
  const { session } = useSession();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      {session && (
        <button
          onClick={() => supabase.auth.signOut()}
          className="absolute right-4 top-4 rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-800 sm:right-6 sm:top-6"
        >
          Surt
        </button>
      )}

      <span className="text-4xl">🔒</span>
      <p className="text-sm text-slate-500">
        Aquesta activitat no està disponible ara mateix.
      </p>
      <Link
        to="/"
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
      >
        Torna a l&apos;inici
      </Link>
    </div>
  );
}
