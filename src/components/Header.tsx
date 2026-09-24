import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🕰️</span>
          <span className="text-base font-semibold tracking-tight text-slate-900">
            Línia del temps tecnològica
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link
                href="/nou"
                className="rounded-full bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent-600"
              >
                + Afegir tecnologia
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Inicia sessió
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
