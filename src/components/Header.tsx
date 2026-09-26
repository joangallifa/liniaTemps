import type { Session } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { supabase, ADMIN_EMAIL } from "../lib/supabase";

type View = "timeline" | "new" | "login" | "admin";

export function Header({
  session,
  view,
  readOnly = false,
  onNavigate,
  onAddNew,
}: {
  session: Session | null;
  view: View;
  readOnly?: boolean;
  onNavigate: (view: View) => void;
  onAddNew: () => void;
}) {
  const isAdmin = session?.user.email === ADMIN_EMAIL;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            title="Torna a l'inici"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ←
          </Link>
          <button
            onClick={() => onNavigate("timeline")}
            className="flex items-center gap-2"
          >
            <span className="text-xl">🕰️</span>
            <span className="text-base font-semibold tracking-tight text-slate-900">
              Línia del temps tecnològica
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              {isAdmin && (
                <button
                  onClick={() => onNavigate("admin")}
                  className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
                >
                  Administració
                </button>
              )}
              {!readOnly && (
                <button
                  onClick={onAddNew}
                  className="rounded-full bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent-600"
                >
                  + Afegir tecnologia
                </button>
              )}
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
