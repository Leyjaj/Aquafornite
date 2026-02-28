"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function PavosPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const packs = [
    { amount: 1000, price: 5.5, color: "from-blue-500 to-blue-700" },
    { amount: 2800, price: 13, color: "from-purple-500 to-purple-700" },
    { amount: 5000, price: 24, color: "from-green-500 to-green-700" },
    { amount: 13500, price: 55, color: "from-yellow-500 to-orange-500" },
  ];

  const handleCheckout = async (pack: any) => {
    if (!session?.user?.id) {
      router.push("/auth/login");
      return;
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.user.id,
        items: [
          {
            id: `pavos_${pack.amount}`,
            name: `${pack.amount} Pavos`,
            images: "https://i.imgur.com/YOUR_IMAGE.png",
            price: pack.price,
            quantity: 1,
          },
        ],
      }),
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <main className="min-h-screen bg-[#0A1F44] text-white px-4 py-16">
      <h1 className="text-4xl font-bold mb-12 text-center">
        Recarga de Pavos
      </h1>

      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
        {packs.map((pack) => (
          <div
            key={pack.amount}
            className={`bg-gradient-to-br ${pack.color} p-6 rounded-2xl shadow-xl hover:scale-105 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
          >
            <h2 className="text-2xl font-bold">
              {pack.amount} Pavos
            </h2>

            <p className="text-xl mt-2">
              ${pack.price} USD
            </p>

            <button
              onClick={() => handleCheckout(pack)}
              className="mt-6 w-full bg-black/30 hover:bg-black/50 rounded-lg py-2 font-semibold transition"
            >
              Comprar
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}