import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    if (event.type === "checkout.session.completed") {
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

        await prisma.aquacoins_history.create({
          data: {
            user_id: userId,
            amount: coins.quantity,
          },
        });

        console.log("✅ Recarga AquaCoins guardada");
      }

      // ======================================
      // 🟨 COMPRA SKINS / VBUCKS
      // ======================================
      else {
        const items = JSON.parse(session.metadata?.items || "[]");
        const total = session.amount_total! / 100;

        // Guardar orden normal
        await prisma.orders.create({
          data: {
            user_id: userId,
            items: JSON.stringify(items),
            total: total,
          },
        });

        console.log("✅ Orden skins guardada");

        // 🔥 NUEVO → CASHBACK 10%
        // Sacamos pavos del primer item (ajústalo si cambias estructura)
        const vbucks = items?.[0]?.vbucks || 0;
        const cashback = Math.floor(vbucks * 0.1);

        if (cashback > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              aquacoins: {
                increment: cashback,
              },
            },
          });

          await prisma.aquacoins_history.create({
            data: {
              user_id: userId,
              amount: cashback,
            },
          });

          console.log("🔥 Cashback aplicado:", cashback);
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