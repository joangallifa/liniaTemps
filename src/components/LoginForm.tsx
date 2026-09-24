import { useState, type FormEvent } from "react";
import { supabase, ALLOWED_EMAIL_DOMAIN } from "../lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "sent" | "domain-error" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
      setStatus("domain-error");
      return;
    }

    setStatus("loading");

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Inicia sessió
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Introdueix el teu correu de l&apos;institut (
        <span className="font-medium text-slate-700">
          @{ALLOWED_EMAIL_DOMAIN}
        </span>
        ) i et enviarem un enllaç d&apos;accés.
      </p>

      {status === "sent" ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          T&apos;hem enviat un correu a <strong>{email}</strong> amb un enllaç
          per entrar. Revisa també la carpeta de spam.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Correu electrònic
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder={`nom.cognom@${ALLOWED_EMAIL_DOMAIN}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setStatus("idle");
              }}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
            />
          </div>

          {status === "domain-error" && (
            <p className="text-sm text-red-600">
              Només s&apos;admeten comptes del domini @{ALLOWED_EMAIL_DOMAIN}.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-accent-600 disabled:opacity-60"
          >
            {status === "loading" ? "Enviant..." : "Envia l'enllaç d'accés"}
          </button>
        </form>
      )}
    </div>
  );
}
