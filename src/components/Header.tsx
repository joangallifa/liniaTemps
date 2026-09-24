import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type View = "timeline" | "new" | "login";

export function Header({
  session,
  view,
  onNavigate,
}: {
  session: Session | null;
  view: View;
  onNavigate: (view: View) => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
        <button
          onClick={() => onNavigate("timeline")}
          className="flex items-center gap-2"
        >
          <span className="text-xl">🕰️</span>
          <span className="text-base font-semibold tracking-tight text-slate-900">
            Línia del temps tecnològica
          </span>
        </button>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <button
                onClick={() => onNavigate("new")}
                className="rounded-full bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent-600"
              >
                + Afegir tecnologia
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
              >
                Surt
              </button>
            </>
          ) : (
            <button
              onClick={() => onNavigate(view === "login" ? "timeline" : "login")}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Inicia sessió
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
