"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
    >
      Surt
    </button>
  );
}
