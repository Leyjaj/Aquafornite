import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const months = Number(body?.months);

    if (!Number.isInteger(months) || months < 1 || months > 6) {
      return NextResponse.json(
        { error: "La duración debe ser de 1 a 6 meses." },
        { status: 400 }
      );
    }

    const total = months * 6;
    const monthLabel = months === 1 ? "mes" : "meses";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Club Fortnite - ${months} ${monthLabel} (pago único)`,
              description: "Periodo del Club Fortnite gestionado manualmente.",
            },
            unit_amount: total * 100,
          },
          quantity: 1,
        },
      ],
      allow_promotion_codes: false,
      success_url: `${process.env.BETTER_AUTH_URL}/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/club-fortnite`,
      metadata: {
        type: "club",
        months: String(months),
        product: "fortnite-club",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("CLUB CHECKOUT ERROR:", error);
    return NextResponse.json(
      { error: "No se pudo iniciar el checkout del Club Fortnite." },
      { status: 500 }
    );
  }
}
