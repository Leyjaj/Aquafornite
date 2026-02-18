export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

/**
 * LISTA OFICIAL DE PACKS
 * Precio en centavos (USD)
 */
const PACKS: Record<number, number> = {
  600: 199,     // $1.99
  1000: 299,    // $2.99
  2800: 699,    // $6.99
  5000: 1199,   // $11.99
  13500: 2999,  // $29.99
};

export async function POST(req: Request) {
  try {
    const { coins } = await req.json();

    // 🔒 Validación estricta
    if (!PACKS[coins]) {
      return NextResponse.json(
        { error: "Pack inválido" },
        { status: 400 }
      );
    }

    const amountCents = PACKS[coins];

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