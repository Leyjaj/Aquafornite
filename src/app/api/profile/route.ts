import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 🔥 Next 15 -> headers() ES ASYNC
    const h = await headers();

    const hh = new Headers();
    h.forEach((v, k) => hh.set(k, v));

    const session = await auth.api.getSession({
      headers: hh,
    });

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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
  } catch (err) {
    console.error("PROFILE API ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}