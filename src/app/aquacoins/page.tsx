'use client'

import { useSession } from "@clerk/nextjs";
import { showToast } from "nextjs-toast-notify";
import Link from "next/link";

type AquaPack = {
  quantity: number;
  price: number;
  image: string;
  theme: "green" | "blue" | "purple" | "orange";
  extra?: string;
  imageClass?: string;
};

const aquaPacks: AquaPack[] = [
  {
    quantity: 800,
    price: 5,
    image: "/images/aquacoin1.png",
    theme: "green",
    imageClass: "h-[84%] w-[84%] translate-y-2",
  },
  { quantity: 2400, price: 12, image: "/images/aquacoin2.png", theme: "blue", extra: "Oferta" },
  { quantity: 4500, price: 20, image: "/images/aquacoin3.png", theme: "purple", extra: "Popular" },
  { quantity: 12500, price: 50, image: "/images/aquacoin4.png", theme: "orange", extra: "Mejor valor" },
];

const themeClass: Record<AquaPack["theme"], string> = {
  green: "from-emerald-500 to-cyan-700",
  blue: "from-sky-500 to-blue-700",
  purple: "from-indigo-500 to-violet-800",
  orange: "from-orange-500 to-amber-700",
};

export default function AquaCoinsPage() {
  const { isSignedIn } = useSession();

  const handleAqua = async (pack: AquaPack) => {
    if (!isSignedIn) {
      showToast.info("Inicia sesión para recargar AquaCoins", {
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    try {
      const response = await fetch('/api/checkout/aquacoins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coins: {
            quantity: pack.quantity,
            price: pack.price,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.url) {
        showToast.error(data?.error || "No se pudo iniciar el checkout", {
          duration: 3000,
          position: "top-right",
        });
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Aqua checkout error:", error);
      showToast.error("Error de red al iniciar checkout", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  return (
    <main className="min-h-screen text-white px-4 py-16">
      <h1 className="text-4xl font-extrabold mb-4 text-center">Recarga de AquaCoins</h1>
      <p className="text-center text-white/75 mb-12">Compra segura y rápida para tu saldo de la tienda.</p>

      <div className="flex justify-center mb-8">
        <Link href="/aquacoins-shop" className="btn btn-info">
          Ir a Tienda AQ
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {aquaPacks.map((pack) => (
          <article
            key={pack.quantity}
            className={`rounded-3xl shadow-2xl bg-gradient-to-b ${themeClass[pack.theme]} p-6 flex flex-col border border-white/15`}
          >
            {pack.extra && (
              <div className="bg-white text-black font-bold px-4 py-1 rounded-full text-sm self-start mb-4">
                {pack.extra}
              </div>
            )}

            <div className="rounded-2xl overflow-hidden h-[300px] sm:h-[320px] mb-6 bg-black/15 relative">
              <img
                loading="lazy"
                alt={`${pack.quantity} AquaCoins`}
                className={`absolute inset-0 m-auto h-[88%] w-[88%] object-contain transition-transform duration-700 ease-out group-hover:scale-105 ${pack.imageClass ?? ""}`}
                src={pack.image}
              />
            </div>

            <div className="text-center mb-4">
              <div className="text-4xl font-extrabold">{pack.quantity.toLocaleString()}</div>
              <div className="text-xl font-bold tracking-wide">AQUACOINS</div>
            </div>

            <div className="w-full rounded-2xl bg-yellow-300 text-black font-extrabold text-lg py-3 text-center mb-4">
              ${pack.price.toFixed(2)} USD
            </div>

            <button
              onClick={() => handleAqua(pack)}
              className="w-full rounded-xl bg-black/25 hover:bg-black/35 font-semibold py-3 transition mt-auto"
            >
              Comprar
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
