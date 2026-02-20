import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const h = headers();
  const hh = new Headers();
  h.forEach((v, k) => hh.set(k, v));

  const session = await auth.api.getSession({ headers: hh });

  if (!session?.user) {
    return NextResponse.json({ error: "No Autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      aquacoins: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json(user);
}
