import { NextResponse, NextRequest } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil"
})

export async function POST(req: NextRequest) {
  const body = await req.json();

  const items = body.items as {
    id: string;
    name: string,
    images: string,
    price: number,
    quantity: number,
  }[]

  console.log(items)

  try {

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No hay productos." }, { status: 400 })
    }

    const LineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.images]
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: LineItems,
      mode: 'payment',

      // ✅ ADAPTIVE PRICING (ÚNICA LÍNEA NUEVA)
      adaptive_pricing: { enabled: true },

      // 👇👇👇 HABILITA EL BOTÓN "AGREGAR CÓDIGO" EN STRIPE CHECKOUT
      allow_promotion_codes: true,

      custom_fields: [
        {
          key: 'id_fortnite',
          label: {
            type: 'custom',
            custom: 'ID Fortnite'
          },
          type: 'text',
        }
      ],
      success_url: `${process.env.BETTER_AUTH_URL}/success`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/`,
      metadata: {
        userId: body.userId ?? "",
        items: JSON.stringify(items),
      }
    });

    return NextResponse.json({ url: session.url }, { status: 200 })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    )
  }
}
