import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json([]);
  }

  try {
    // 🔥 Historial de compras (skins/vbucks)
    const purchases = await prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // 🟦 Historial AquaCoins
    const coins = await prisma.aquacoinsHistory.findMany({
      where: { user_id: userId },
      orderBy: { createdAt: "desc" },
    });

    // 🔥 UNIMOS TODO EN UN SOLO HISTORIAL
    const history = [
      ...purchases.map((p) => ({
        id: p.id,
        type: "purchase",
        total: p.amountUSD,
        vbucks: p.vbucks,
        createdAt: p.createdAt,
      })),

      ...coins.map((c) => ({
        id: c.id,
        type: "aquacoins",
        total: c.amount,
        vbucks: 0,
        createdAt: c.createdAt,
      })),
    ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return NextResponse.json(history);
  } catch (e) {
    console.error(e);
    return NextResponse.json([]);
  }
}
