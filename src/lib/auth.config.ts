import type { NextAuthConfig } from "next-auth";

export const ALLOWED_EMAIL_DOMAIN =
  process.env.ALLOWED_EMAIL_DOMAIN ?? "umanresa.cat";

/**
 * Configuració compartida entre el middleware (Edge runtime) i el
 * handler complet de Node.js. No inclou l'adapter de Prisma ni els
 * proveïdors: cap dels dos funciona a l'Edge runtime.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
    error: "/login",
  },
  providers: [],
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase() ?? "";
      return email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = request.nextUrl.pathname.startsWith("/nou");
      return isProtected ? isLoggedIn : true;
    },
  },
} satisfies NextAuthConfig;
