import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

type Currency = "usd" | "mxn" | "pen" | "brl" | "clp" | "cop" | "eur";
const ZERO_DECIMAL = new Set<Currency>(["clp", "cop"]);

export async function POST(req: NextRequest) {
  const body = await req.json();

  const items = (body.items ?? []) as {
    id?: string;
    name: string;
    images?: string;
    price: number;     // 👈 ya viene en la moneda seleccionada desde el frontend
    quantity: number;
  }[];

  try {
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No hay productos." }, { status: 400 });
    }

    // ✅ currency desde frontend (fallback usd)
    const currencyRaw = String(body?.currency ?? "usd").toLowerCase();
    const allowed = new Set<Currency>(["usd", "mxn", "pen", "brl", "clp", "cop", "eur"]);
    const currency: Currency = allowed.has(currencyRaw as Currency)
      ? (currencyRaw as Currency)
      : "usd";

    const line_items = items.map((item) => {
      const name = String(item?.name ?? "Artículo").slice(0, 200);
      const quantity = Number(item?.quantity ?? 1);
      const price = Number(item?.price ?? 0);

      const unit_amount = ZERO_DECIMAL.has(currency)
        ? Math.round(price)        // CLP/COP enteros
        : Math.round(price * 100); // resto centavos

      if (!Number.isFinite(unit_amount) || unit_amount < 1) {
        throw new Error(`Precio inválido para: ${name}`);
      }
      if (!Number.isFinite(quantity) || quantity < 1) {
        throw new Error(`Cantidad inválida para: ${name}`);
      }

      const imagesArr = item?.images ? [item.images] : undefined;

      return {
        price_data: {
          currency,
          product_data: {
            name,
            ...(imagesArr ? { images: imagesArr } : {}),
          },
          unit_amount,
        },
        quantity,
      };
    });

    // ✅ total en minor units
    const totalAmount = line_items.reduce((sum: number, li: any) => {
      return sum + li.price_data.unit_amount * li.quantity;
    }, 0);

    // ✅ OXXO solo MXN y >= 10.00 MXN (1000 centavos)
    const enableOxxo = currency === "mxn" && totalAmount >= 1000;

    const payment_method_types: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
      enableOxxo ? ["card", "oxxo"] : ["card"];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types,
      line_items,

      adaptive_pricing: { enabled: true },

      allow_promotion_codes: true,

      // ✅ ID Fortnite vuelve a salir debajo del correo
      custom_fields: [
        {
          key: "id_fortnite",
          label: { type: "custom", custom: "ID Fortnite" },
          type: "text",
        },
      ],

      success_url: `${process.env.BETTER_AUTH_URL}/success`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/`,

      metadata: {
        userId: String(body?.userId ?? ""),
        currency,
        oxxoEnabled: String(enableOxxo),
        itemCount: String(items.length),
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
