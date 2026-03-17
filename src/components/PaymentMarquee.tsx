'use client'

import Image from "next/image";

const logos = [
  "/logos/payments/card_visa.svg",
  "/logos/payments/card_mastercard.svg",
  "/logos/payments/card_american_express.svg",
  "/logos/payments/card_paypal.svg",
  "/logos/payments/card_apple-pay.svg",
  "/logos/payments/card_google-pay.svg",
  "/logos/payments/Binance_logo.svg",
  "/logos/payments/card_oxxo.svg",
  "/logos/payments/Pix.svg",
  "/logos/payments/spei.svg",
  "/logos/payments/Yape.svg",
];

export default function PaymentMarquee() {
  return (
    <div className="w-full overflow-hidden bg-transparent py-6 marquee-mask">

      <p className="text-center text-white text-sm mb-4">
        PAGOS SEGUROS PROCESADOS POR
      </p>

      <div className="flex gap-12 animate-marquee">
        {[...logos, ...logos].map((logo, i) => (
          <Image
            key={i}
            src={logo}
            alt="payment"
            width={120}
            height={60}
            className="h-10 w-auto object-contain opacity-60 hover:opacity-100 transition mix-blend-lighten brightness-125"
          />
        ))}
      </div>

    </div>
  );
}