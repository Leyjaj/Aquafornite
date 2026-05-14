import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const base = "https://api-m.sandbox.paypal.com";

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

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const response = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "No se pudo capturar la orden de PayPal" },
        { status: 400 }
      );
    }

    const purchaseUnit = data?.purchase_units?.[0];
    const customId = String(purchaseUnit?.custom_id ?? "");
    const amountValue = Number(
      purchaseUnit?.payments?.captures?.[0]?.amount?.value ?? purchaseUnit?.amount?.value ?? 0
    );

    const segments = customId.split("|");
    const segmentMap = Object.fromEntries(
      segments
        .map((segment: string) => segment.split(":"))
        .filter((entry: string[]) => entry.length === 2)
    ) as Record<string, string>;

    const userId = segmentMap.uid;
    const totalVbucks = Number(segmentMap.tv ?? 0);
    const cashbackEligibleVbucks = Number(segmentMap.cv ?? 0);
    const isGuest = String(segmentMap.g ?? "0") === "1";
    const epicAccountId = String(segmentMap.eid ?? "") || null;
    const currency = String(segmentMap.cur ?? "USD").toUpperCase();
    const cashback = Math.floor(cashbackEligibleVbucks * 0.1);

    if (userId) {
      await prisma.purchase.create({
        data: {
          userId,
          amountUSD: Number.isFinite(amountValue) ? amountValue : 0,
          currency,
          vbucks: Number.isFinite(totalVbucks) ? totalVbucks : 0,
          cashback,
          epicAccountId,
          paymentMethod: "paypal",
          status: "confirmed",
          confirmedAt: new Date(),
        },
      });

      if (cashback > 0 && !isGuest) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            aquacoins: {
              increment: cashback,
            },
          },
        });

        await prisma.aquacoinsHistory.create({
          data: {
            user_id: userId,
            amount: cashback,
            source: "cashback",
          },
        });
      }
    }

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error("PAYPAL CAPTURE ORDER ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno al capturar orden de PayPal" },
      { status: 500 }
    );
  }
}
