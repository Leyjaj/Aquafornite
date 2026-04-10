import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: `${clerkUserId}@temp.com`,
          aquacoins: 100,
        },
      });
    }

    const body = await req.json();
    const epicAccountId = String(body?.epicAccountId ?? "").trim();
    const epicNickname = String(body?.epicNickname ?? "").trim();

    if (!epicAccountId) {
      return NextResponse.json(
        { error: "Falta ID de Epic. Guarda tu cuenta antes de comprar." },
        { status: 400 }
      );
    }

    const itemsInput = Array.isArray(body?.items)
      ? body.items
      : body?.itemId
      ? [
          {
            itemId: body.itemId,
            itemName: body.itemName,
            vbucksPrice: body.vbucksPrice,
          },
        ]
      : [];

    const items = itemsInput
      .map((item: any) => ({
        itemId: String(item?.itemId ?? "").trim(),
        itemName: String(item?.itemName ?? "Cosmetico").trim(),
        vbucksPrice: Math.floor(Number(item?.vbucksPrice ?? 0)),
      }))
      .filter((item: any) => item.itemId && Number.isFinite(item.vbucksPrice) && item.vbucksPrice > 0);

    if (items.length === 0) {
      return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
    }

    const cost = items.reduce((acc: number, item: any) => acc + item.vbucksPrice, 0);

    if (user.aquacoins < cost) {
      return NextResponse.json(
        { error: "No tienes suficientes AquaCoins", balance: user.aquacoins },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user!.id },
        data: {
          aquacoins: {
            decrement: cost,
          },
        },
      });

      await tx.aquacoinsHistory.create({
        data: {
          user_id: user!.id,
          amount: -cost,
          source: "shop_purchase",
        },
      });

      await tx.purchase.create({
        data: {
          userId: user!.id,
          amountUSD: 0,
          vbucks: cost,
          cashback: 0,
          epicAccountId,
          epicNickname,
          itemsSummary: JSON.stringify(items),
          paymentMethod: "aquacoins",
          status: "confirmed",
          confirmedAt: new Date(),
        },
      });

      return updatedUser;
    });

    return NextResponse.json({
      ok: true,
      itemsCount: items.length,
      spent: cost,
      balance: result.aquacoins,
    });
  } catch (error: any) {
    console.error("AQUACOINS SHOP PURCHASE ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno al procesar la compra" },
      { status: 500 }
    );
  }
}
