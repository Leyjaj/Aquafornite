export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") as string;
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const type = session.metadata?.type;

      if (!userId) {
        return NextResponse.json({ received: true });
      }

      // ======================================
      // 🟦 RECARGA AQUACOINS
      // ======================================
      if (type === "aquacoins") {
        const coins = JSON.parse(session.metadata?.items || "{}");

        await prisma.user.update({
          where: { id: userId },
          data: {
            aquacoins: {
              increment: coins.quantity,
            },
          },
        });

        await prisma.aquacoinsHistory.create({
          data: {
            user_id: userId,
            amount: coins.quantity,
            source: "recharge",
          },
        });

        console.log("✅ Recarga AquaCoins guardada");
      }

      // ======================================
      // 🟨 COMPRA SKINS / VBUCKS + CASHBACK
      // ======================================
      else {
        const total = session.amount_total! / 100;

        const legacyItems = JSON.parse(session.metadata?.items || "[]");
        const metadataVbucks = Number(session.metadata?.vbucksTotal ?? 0);
        const metadataCashbackEligible = Number(session.metadata?.cashbackEligibleVbucks ?? 0);

        const vbucks = metadataVbucks || legacyItems?.[0]?.vbucks || 0;
        const cashbackEligibleVbucks = metadataCashbackEligible || 0;
        const cashback = Math.floor(cashbackEligibleVbucks * 0.1);

        const existing = await prisma.purchase.findFirst({
          where: {
            stripeSessionId: session.id,
          },
          select: { id: true },
        });

        if (existing) {
          console.log("ℹ️ Compra ya registrada, se omite duplicado", session.id);
        } else {
          await prisma.$transaction(async (tx) => {
            await tx.purchase.create({
              data: {
                stripeSessionId: session.id,
                userId,
                amountUSD: total,
                vbucks,
                cashback,
                epicAccountId: session.metadata?.epicAccountId || null,
                epicNickname: session.metadata?.epicNickname || null,
                itemsSummary: session.metadata?.itemData || session.metadata?.items || null,
                paymentMethod: "stripe",
                status: "confirmed",
                confirmedAt: new Date(),
              },
            });

            if (cashback > 0) {
              await tx.user.update({
                where: { id: userId },
                data: {
                  aquacoins: {
                    increment: cashback,
                  },
                },
              });

              await tx.aquacoinsHistory.create({
                data: {
                  user_id: userId,
                  amount: cashback,
                  source: "cashback",
                },
              });
            }
          });

          console.log("✅ Compra guardada", session.id);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Error en Webhook:", e.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
