import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        aquacoins: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: `${userId}@temp.com`,
          aquacoins: 100,
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          aquacoins: true,
        },
      });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("PROFILE API ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
