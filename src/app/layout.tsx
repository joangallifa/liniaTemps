import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Línia del temps tecnològica",
  description:
    "Una línia de temps col·laborativa de les tecnologies més importants de la història humana.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ca">
      <body className={`${inter.variable} font-sans antialiased text-slate-900`}>
        <Providers>
          <Header />
          <main className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
