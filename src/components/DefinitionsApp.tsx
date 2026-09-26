import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase, ADMIN_EMAIL } from "../lib/supabase";
import { useSession } from "../hooks/useSession";
import { useAppStatus } from "../hooks/useAppStatus";
import type { Definition } from "../types";
import { LoginForm } from "./LoginForm";
import { AppUnavailable } from "./AppUnavailable";

function TopBar({ isAdmin }: { isAdmin: boolean }) {
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
          <span className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <span className="text-base font-semibold tracking-tight text-slate-900">
              Definicions de tecnologia
            </span>
          </span>
        </div>

        {isAdmin && (
          <button
            onClick={() => supabase.auth.signOut()}
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            Surt
          </button>
        )}
      </div>
    </header>
  );
}

export function DefinitionsApp() {
  const { session, loading: sessionLoading } = useSession();
  const { status: appStatus, loading: statusLoading } = useAppStatus("definicions");

  if (sessionLoading || statusLoading) {
    return (
      <div className="min-h-screen text-slate-900">
        <TopBar isAdmin={false} />
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6">
          <p className="text-sm text-slate-400">Carregant...</p>
        </main>
      </div>
    );
  }

  const isAdmin = session?.user.email === ADMIN_EMAIL;

  if (appStatus === "OCULT" && !isAdmin) {
    return <AppUnavailable />;
  }

  const readOnly = appStatus === "CONSULTA" && !isAdmin;

  return (
    <div className="min-h-screen text-slate-900">
      <TopBar isAdmin={isAdmin} />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6">
        {!session && <LoginForm />}
        {session && isAdmin && <AdminDefinitions />}
        {session && !isAdmin && (
          <MyDefinition userId={session.user.id} readOnly={readOnly} />
        )}
      </main>
    </div>
  );
}

function MyDefinition({
  userId,
  readOnly,
}: {
  userId: string;
  readOnly: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initial, setInitial] = useState("");
  const [final, setFinal] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    supabase
      .from("definitions")
      .select("*")
      .eq("author_id", userId)
      .maybeSingle()
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }
        const row = data as Definition | null;
        setInitial(row?.initial_definition ?? "");
        setFinal(row?.final_definition ?? "");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    const { error: saveError } = await supabase.from("definitions").upsert(
      {
        author_id: userId,
        initial_definition: initial.trim() || null,
        final_definition: final.trim() || null,
      },
      { onConflict: "author_id" }
    );

    setSaving(false);

    if (saveError) {
      setError("No s'ha pogut desar la definició: " + saveError.message);
      return;
    }

    setSaved(true);
  }

  if (loading) return <p className="text-sm text-slate-400">Carregant...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        La meva definició de tecnologia
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Aquesta activitat és privada: només tu i el professor la podeu veure.
      </p>
      {readOnly && (
        <p className="mt-2 text-sm font-medium text-amber-600">
          Aquesta activitat és ara mateix només de consulta.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <fieldset disabled={readOnly} className="contents disabled:opacity-70">
        <div>
          <label
            htmlFor="initial"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Definició inicial
          </label>
          <p className="mb-2 text-xs text-slate-400">
            Abans de llegir el document: què entens per "tecnologia"?
          </p>
          <textarea
            id="initial"
            rows={4}
            value={initial}
            onChange={(e) => setInitial(e.target.value)}
            placeholder="La meva definició de tecnologia és..."
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
          />
        </div>

        <div>
          <label
            htmlFor="final"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Definició després de llegir el document
          </label>
          <p className="mb-2 text-xs text-slate-400">
            Ara que has llegit el document: com definiries "tecnologia"?
          </p>
          <textarea
            id="final"
            rows={4}
            value={final}
            onChange={(e) => setFinal(e.target.value)}
            placeholder="Després de llegir el document, defineixo tecnologia com..."
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && !error && (
          <p className="text-sm font-medium text-emerald-600">
            Definició desada.
          </p>
        )}

        {!readOnly && (
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-accent-600 disabled:opacity-60"
          >
            {saving ? "Desant..." : "Desa la definició"}
          </button>
        )}
      </fieldset>
      </form>
    </div>
  );
}

function AdminDefinitions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Definition[]>([]);

  useEffect(() => {
    supabase
      .from("definitions")
      .select("*, profiles(email)")
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }
        const sorted = ((data ?? []) as Definition[]).sort((a, b) =>
          (a.profiles?.email ?? "").localeCompare(b.profiles?.email ?? "")
        );
        setRows(sorted);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Definicions de l'alumnat
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {rows.length} {rows.length === 1 ? "alumne ha" : "alumnes han"}{" "}
        escrit alguna definició.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Carregant...</p>
      ) : error ? (
        <p className="mt-6 text-sm text-red-600">
          No s&apos;han pogut carregar les definicions: {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">
          Encara ningú ha escrit cap definició.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-800">
                {row.profiles?.email ?? "—"}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Definició inicial
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {row.initial_definition || (
                      <span className="text-slate-400">— sense resposta —</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Definició posterior
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {row.final_definition || (
                      <span className="text-slate-400">— sense resposta —</span>
                    )}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
