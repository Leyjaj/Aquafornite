import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
<<<<<<< HEAD

export async function GET() {
  const h = headers();
  const hh = new Headers();
  h.forEach((v, k) => hh.set(k, v));

  const session = await auth.api.getSession({ headers: hh });

  if (!session?.user) {
    return NextResponse.json({ error: "No Autorizado" }, { status: 401 });
=======

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // ✅ ESTA ERA LA PUTA LINEA
    });

    if (!session?.user) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        aquacoins: true,
      },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    return NextResponse.json({ user: null });
>>>>>>> 76f1c6f03b18346dc6345869b23ae8241a8d4ef0
  }
}