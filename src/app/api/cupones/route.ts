import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

export async function GET() {
  try {
    const promotionCodes = await stripe.promotionCodes.list({
      active: true,
      limit: 100,
      expand: ["data.coupon"],
    });

    const coupons = promotionCodes.data.map((promotionCode: any) => {
      const coupon = promotionCode.coupon;
      const expiresAt = promotionCode.expires_at
        ? new Date(promotionCode.expires_at * 1000)
        : null;
      const hasExpired = expiresAt ? expiresAt.getTime() <= Date.now() : false;
      const remainingUses = promotionCode.max_redemptions === null
        ? null
        : Math.max(promotionCode.max_redemptions - promotionCode.times_redeemed, 0);
      const available = !hasExpired && remainingUses !== 0;

      return {
        code: promotionCode.code,
        available,
        discount: coupon?.percent_off
          ? `${coupon.percent_off}% de descuento`
          : coupon?.amount_off
            ? `${(coupon.amount_off / 100).toFixed(2)} ${String(coupon.currency || "").toUpperCase()} de descuento`
            : "Descuento especial",
      };
    });

    return NextResponse.json({ coupons }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("COUPONS ERROR:", error);
    return NextResponse.json(
      { error: "No se pudieron consultar los cupones." },
      { status: 500 }
    );
  }
}
