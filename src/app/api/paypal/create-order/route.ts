import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const base = "https://api-m.sandbox.paypal.com"; // luego cambias a live
const supportedCurrencies = new Set(["USD", "MXN", "BRL"]);

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString("base64");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    if (process.env.ENABLE_PAYPAL !== "true") {
      return NextResponse.json(
        { error: "PayPal temporalmente deshabilitado" },
        { status: 503 }
      );
    }

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

    const { total, currency, epicAccountId, epicNickname, items } = await req.json();
    const normalizedCurrency = String(currency ?? "USD").toUpperCase();
    const normalizedEpicId = String(epicAccountId ?? "").trim();
    const normalizedEpicName = String(epicNickname ?? "").trim();
    const parsedTotal = Number(total);

    const cartItems = Array.isArray(items) ? items : [];
    const totalVbucks = cartItems.reduce((acc, item) => {
      const vbucks = Number(item?.vbucks ?? 0);
      const quantity = Number(item?.quantity ?? 1);
      return acc + vbucks * quantity;
    }, 0);

    const cashbackEligibleVbucks = totalVbucks;

    if (!supportedCurrencies.has(normalizedCurrency)) {
      return NextResponse.json(
        { error: "PayPal solo admite USD, MXN o BRL" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(parsedTotal) || parsedTotal <= 0) {
      return NextResponse.json({ error: "Total inválido" }, { status: 400 });
    }

    if (!normalizedEpicId) {
      return NextResponse.json(
        { error: "Falta ID de Epic. Guárdalo en la tienda antes de pagar." },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();
    const totalAsString = parsedTotal.toFixed(2);
    const appUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    const customId = `uid:${user.id}|tv:${totalVbucks}|cv:${cashbackEligibleVbucks}`;

    const order = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: customId,
            description: normalizedEpicName
              ? `Epic: ${normalizedEpicName} (${normalizedEpicId})`
              : `Epic ID: ${normalizedEpicId}`,
            amount: {
              currency_code: normalizedCurrency,
              value: totalAsString,
            },
          },
        ],
        application_context: {
          return_url: `${appUrl}/success?provider=paypal`,
          cancel_url: `${appUrl}/shop?provider=paypal&status=cancelled`,
          user_action: "PAY_NOW",
        },
      }),
    });

    const data = await order.json();

    if (!order.ok) {
      return NextResponse.json(
        { error: data?.message || "No se pudo crear la orden de PayPal" },
        { status: 400 }
      );
    }

    const approveUrl = data?.links?.find((link: any) => link.rel === "approve")?.href;

    if (!approveUrl) {
      return NextResponse.json(
        { error: "No se encontró enlace de aprobación de PayPal" },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: approveUrl, id: data.id });
  } catch (error: any) {
    console.error("PAYPAL CREATE ORDER ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno al crear orden PayPal" },
      { status: 500 }
    );
  }
}
