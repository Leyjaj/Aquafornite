import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

const currencyMap: Record<string, string> = {
  USD: "usd",
  MXN: "mxn",
  PEN: "pen",
  EUR: "eur",
  COP: "cop",
  CLP: "clp",
  BOB: "bob",
  BRL: "brl",
};

export async function POST(req: NextRequest) {
  const body = await req.json();

  const items = body.items as any[];
  const currency = body.currency || "USD";
  const stripeCurrency = currencyMap[currency] || "usd";

  try {
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No hay productos." }, { status: 400 });
    }

    // 🔥 TOTAL para validar OXXO
    const totalAmount = items.reduce((acc, item) => {
      const price = item.customPrice ?? item.price ?? 0;
      return acc + price * (item.quantity ?? 1);
    }, 0);

    // 🔥 MÉTODOS DE PAGO
    let paymentMethods: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
      ["card"];

    // ✅ OXXO SOLO SI:
    // - moneda MXN
    // - total >= 10 MXN
    if (stripeCurrency === "mxn" && totalAmount >= 10) {
      paymentMethods.push("oxxo");
    }

    const LineItems = items.map((item) => {
      const price = item.customPrice ?? item.price ?? 0;

      return {
        price_data: {
          currency: stripeCurrency,
          product_data: {
            name: item.name,
            ...(item.images ? { images: [item.images] } : {}),
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity ?? 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethods,
      line_items: LineItems,
      mode: "payment",

      allow_promotion_codes: true,

      custom_fields: [
        {
          key: "id_fortnite",
          label: {
            type: "custom",
            custom: "ID Fortnite",
          },
          type: "text",
        },
      ],

      success_url: `${process.env.BETTER_AUTH_URL}/success`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/`,

      metadata: {
        userId: body.userId ?? "",
        currency,
        items: JSON.stringify(items),
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}