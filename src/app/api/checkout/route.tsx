import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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

  const items = body.items as any[];
  const currency = body.currency || "USD";
  const epicAccountId = String(body.epicAccountId ?? "");
  const epicNickname = String(body.epicNickname ?? "");
  const stripeCurrency = currencyMap[currency] || "usd";

  try {
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No hay productos." }, { status: 400 });
    }

    if (!epicAccountId) {
      return NextResponse.json(
        { error: "Falta ID de Epic. Guárdalo en la tienda antes de pagar." },
        { status: 400 }
      );
    }

    // 🔥 TOTAL para validar OXXO
    const totalAmount = items.reduce((acc, item) => {
      const price = item.customPrice ?? item.price ?? 0;
      return acc + price * (item.quantity ?? 1);
    }, 0);

    // 🔥 MÉTODOS DE PAGO
    let paymentMethods: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
      ["card"];

    if (stripeCurrency === "mxn" && totalAmount >= 10) {
      paymentMethods.push("oxxo");
    }

    // 🔥 CONTROL DE CUPONES POR PRODUCTO
    // Shop normal: por default permitido
    // Pavos/otros: deben mandar allowCoupons=false explícito
    const allowCoupons = items.length > 0 && items.every((item) => item.allowCoupons !== false);

    const lineItems = items.map((item) => {
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

    const vbucksTotal = items.reduce((acc, item) => {
      const vbucks = Number(item.vbucks ?? 0);
      const quantity = Number(item.quantity ?? 1);
      return acc + vbucks * quantity;
    }, 0);

    const cashbackEligibleVbucks = vbucksTotal;

    const itemData = items
      .map((item) => {
        const id = String(item.itemId ?? "").replace(/[;,|]/g, "");
        const offerId = String(item.offerId ?? "").replace(/[;,|]/g, "");
        const vbucks = Number(item.vbucks ?? 0);
        const priceCents = Math.round(Number(item.customPrice ?? item.price ?? 0) * 100);
        const quantity = Number(item.quantity ?? 1);
        return `${id}|${offerId}|${vbucks}|${priceCents}|${quantity}`;
      })
      .join(";");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethods,
      line_items: lineItems,
      mode: "payment",

      // 👇 AQUÍ YA ES DINÁMICO
      allow_promotion_codes: allowCoupons,

      success_url: `${process.env.BETTER_AUTH_URL}/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/`,

      metadata: {
        userId: user.id,
        currency,
        itemCount: String(items.length),
        vbucksTotal: String(vbucksTotal),
        cashbackEligibleVbucks: String(cashbackEligibleVbucks),
        itemData,
        epicAccountId,
        epicNickname,
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
