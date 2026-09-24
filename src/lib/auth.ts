import NextAuth from "next-auth";
import SendGrid from "next-auth/providers/sendgrid";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

const FROM_EMAIL = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const FROM_NAME = process.env.EMAIL_FROM_NAME ?? "Línia del temps tecnològica";

function emailHtml(url: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <p style="font-size: 15px; color: #0f172a;">Fes clic al botó per accedir a la Línia del temps tecnològica:</p>
      <p style="text-align: center; margin: 28px 0;">
        <a href="${url}" style="background: #3357ff; color: #fff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Accedeix a l'aplicació
        </a>
      </p>
      <p style="font-size: 13px; color: #64748b;">Si no has sol·licitat aquest correu, pots ignorar-lo.</p>
    </div>
  `;
}

const sendgridProvider = SendGrid({
  apiKey: process.env.AUTH_SENDGRID_KEY,
  from: FROM_EMAIL,
});

// Sobreescrivim l'enviament per personalitzar el contingut en català i
// perquè el remitent inclogui el nom (Single Sender Verification de SendGrid
// exigeix que l'adreça de "from" sigui exactament la bústia verificada).
sendgridProvider.sendVerificationRequest = async ({ identifier: to, url, provider }) => {
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: provider.from, name: FROM_NAME },
      subject: "Accedeix a la Línia del temps tecnològica",
      content: [
        { type: "text/plain", value: `Fes clic per entrar: ${url}` },
        { type: "text/html", value: emailHtml(url) },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error("Error enviant el correu amb SendGrid: " + (await res.text()));
  }
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [sendgridProvider],
});
