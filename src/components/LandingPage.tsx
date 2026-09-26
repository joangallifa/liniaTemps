import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { supabase, ADMIN_EMAIL } from "../lib/supabase";
import {
  APP_STATUSES,
  APP_STATUS_LABELS,
  DEFAULT_APP_STATUS,
  type AppKey,
  type AppStatus,
} from "../lib/appSettings";

const APPS: { key: AppKey; to: string; icon: string; title: string; description: string }[] = [
  {
    key: "linia-temps",
    to: "/linia-temps",
    icon: "🕰️",
    title: "Línia del temps",
    description:
      "Explora i afegeix tecnologies al llarg de la història, amb anàlisi SAMR i STEEP.",
  },
  {
    key: "definicions",
    to: "/definicions",
    icon: "📖",
    title: "Definicions de tecnologia",
    description:
      "Escriu la teva definició abans i després de llegir el document.",
  },
];

export function LandingPage() {
  const { session } = useSession();
  const isAdmin = session?.user.email === ADMIN_EMAIL;

  const [statuses, setStatuses] = useState<Record<AppKey, AppStatus> | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("app_settings")
      .select("app_key, status")
      .then(({ data }) => {
        if (cancelled) return;
        const map = {} as Record<AppKey, AppStatus>;
        for (const app of APPS) map[app.key] = DEFAULT_APP_STATUS;
        for (const row of data ?? []) {
          map[row.app_key as AppKey] = row.status as AppStatus;
        }
        setStatuses(map);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleStatusChange(key: AppKey, status: AppStatus) {
    setStatuses((current) => (current ? { ...current, [key]: status } : current));
    await supabase.from("app_settings").update({ status }).eq("app_key", key);
  }

  if (!statuses) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-400">Carregant...</p>
      </div>
    );
  }

  const visibleApps = APPS.filter(
    (app) => isAdmin || statuses[app.key] !== "OCULT"
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Societats i Tecnologies
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Tria quina activitat vols obrir.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {visibleApps.map((app) => {
            const status = statuses[app.key];
            const hidden = status === "OCULT";
            return (
              <div key={app.key} className="flex flex-col gap-2">
                <Link
                  to={app.to}
                  className={`group flex flex-1 flex-col items-center gap-3 rounded-3xl border bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-md ${
                    hidden ? "border-dashed border-slate-300 opacity-60" : "border-slate-200"
                  }`}
                >
                  <span className="text-4xl">{app.icon}</span>
                  <span className="text-base font-semibold text-slate-900">
                    {app.title}
                  </span>
                  <span className="text-xs text-slate-500">
                    {app.description}
                  </span>
                  {status !== "EDITABLE" && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        hidden
                          ? "bg-slate-100 text-slate-500"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {APP_STATUS_LABELS[status]}
                    </span>
                  )}
                </Link>

                {isAdmin && (
                  <select
                    value={status}
                    onChange={(e) =>
                      handleStatusChange(app.key, e.target.value as AppStatus)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs shadow-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                  >
                    {APP_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {APP_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
