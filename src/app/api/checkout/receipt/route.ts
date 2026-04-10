import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

type ItemMeta = {
  itemId: string;
  offerId: string;
  vbucks: number;
  priceCents: number;
  quantity: number;
};

function parseItemData(raw: string | undefined): ItemMeta[] {
  if (!raw) return [];

  return raw
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [itemId = "", offerId = "", vbucks = "0", priceCents = "0", quantity = "1"] = chunk.split("|");
      return {
        itemId,
        offerId,
        vbucks: Number(vbucks) || 0,
        priceCents: Number(priceCents) || 0,
        quantity: Number(quantity) || 1,
      };
    });
}

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const appUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });

    if (!appUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const sessionId = req.nextUrl.searchParams.get("sessionId")?.trim();

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (!session || session.metadata?.userId !== appUser.id) {
      return NextResponse.json({ error: "Recibo no disponible" }, { status: 404 });
    }

    const lineItems = (session as any)?.line_items?.data ?? [];
    const itemData = parseItemData(session.metadata?.itemData);

    const items = lineItems.map((line: any, idx: number) => {
      const meta: ItemMeta =
        itemData[idx] ||
        {
          itemId: "",
          offerId: "",
          vbucks: 0,
          priceCents: 0,
          quantity: line.quantity || 1,
        };
      return {
        name: line.description || `Item ${idx + 1}`,
        quantity: Number(line.quantity ?? meta.quantity ?? 1),
        amount: Number((line.amount_total ?? meta.priceCents ?? 0) / 100),
        currency: String(session.metadata?.currency || session.currency || "USD").toUpperCase(),
        vbucks: Number(meta.vbucks || 0),
        itemId: String(meta.itemId || ""),
        offerId: String(meta.offerId || ""),
      };
    });

    return NextResponse.json({
      receiptId: session.id,
      paidAt: session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString(),
      total: Number((session.amount_total ?? 0) / 100),
      currency: String(session.metadata?.currency || session.currency || "USD").toUpperCase(),
      nickname: session.metadata?.epicNickname || "",
      epicId: session.metadata?.epicAccountId || "",
      items,
    });
  } catch (error: any) {
    console.error("CHECKOUT RECEIPT ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno al obtener el recibo" },
      { status: 500 }
    );
  }
}
