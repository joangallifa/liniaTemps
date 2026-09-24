import { prisma } from "@/lib/prisma";
import { Timeline } from "@/components/Timeline";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const entries = await prisma.entry.findMany({
    orderBy: { year: "asc" },
    include: { author: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Tecnologies al llarg de la història
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {entries.length}{" "}
          {entries.length === 1 ? "tecnologia afegida" : "tecnologies afegides"}{" "}
          per la classe.
        </p>
      </div>
      <Timeline entries={entries} />
    </div>
  );
}
