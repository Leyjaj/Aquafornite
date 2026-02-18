export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const PRICE_PER_100 = 0.38;

export async function POST(req: Request) {
  try {
    const { coins } = await req.json();

    if (!coins || coins < 100) {
      return NextResponse.json(
        { error: "Cantidad inválida" },
        { status: 400 }
      );
    }

    const amountUSD = (coins / 100) * PRICE_PER_100;
    const amountCents = Math.round(amountUSD * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${coins} AquaCoins`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/recharge/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/recharge/cancel`,
      metadata: {
        coins: String(coins),
        source: "aquacoins-recharge",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Error creando sesión" },
      { status: 500 }
    );
  }
}