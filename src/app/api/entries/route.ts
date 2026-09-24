import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Era } from "@prisma/client";

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autoritzat." }, { status: 401 });
  }

  const formData = await req.formData();
  const title = (formData.get("title") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim();
  const yearRaw = formData.get("year") as string | null;
  const eraRaw = formData.get("era") as string | null;
  const photo = formData.get("photo") as File | null;

  if (!title || !description || !yearRaw || !photo || photo.size === 0) {
    return NextResponse.json(
      { error: "Falten camps obligatoris (títol, descripció, any o foto)." },
      { status: 400 }
    );
  }

  const year = Number.parseInt(yearRaw, 10);
  if (!Number.isFinite(year)) {
    return NextResponse.json({ error: "L'any no és vàlid." }, { status: 400 });
  }

  const era = eraRaw && eraRaw in Era ? (eraRaw as Era) : null;

  if (!photo.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "El fitxer ha de ser una imatge." },
      { status: 400 }
    );
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return NextResponse.json(
      { error: "La imatge no pot superar els 4 MB." },
      { status: 400 }
    );
  }

  const extension = photo.name.split(".").pop() ?? "jpg";
  const blob = await put(
    `entries/${Date.now()}-${crypto.randomUUID()}.${extension}`,
    photo,
    { access: "public" }
  );

  const entry = await prisma.entry.create({
    data: {
      title,
      description,
      year,
      era,
      photoUrl: blob.url,
      authorId: session.user.id,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
