import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

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
  }
}