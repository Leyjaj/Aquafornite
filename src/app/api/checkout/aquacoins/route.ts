import { NextResponse, NextRequest } from "next/server"
import Stripe from "stripe"
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil"
})

export async function POST(req: NextRequest) {
    try{
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
          return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        let user = await prisma.user.findUnique({
          where: { clerkId: clerkUserId },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              clerkId: clerkUserId,
              email: `${clerkUserId}@temp.com`,
              aquacoins: 100,
            },
          });
        }

        const { coins } = await req.json();

    if(!coins || !coins.quantity || !coins.price){
        return NextResponse.json({error: "Faltan datos de la recarga"}, {status: 400});

    }
    const priceInCents = Math.round(coins.price * 100);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: `${coins.quantity} AquaCoins` },
              unit_amount:priceInCents ,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.BETTER_AUTH_URL}/success`,
        cancel_url: `${process.env.BETTER_AUTH_URL}/aquacoins`,
        metadata:{
            userId:user.id,
            items:JSON.stringify(coins),
            type:"aquacoins"
          }
      });
    
      return NextResponse.json({ url: session.url });
    }catch(err:any){
        console.error(err)
        return NextResponse.json(
          { error: err.message || "Internal server error" },
          { status: 500 }
        )
    }
}
