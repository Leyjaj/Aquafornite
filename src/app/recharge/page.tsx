"use client";

import { useState } from "react";

const PACKS = [
  { coins: 600, price: "1.99", color: "bg-cyan-400 text-black" },
  { coins: 1000, price: "2.99", color: "bg-green-400 text-black" },
  { coins: 2800, price: "6.99", color: "bg-purple-500 text-white" },
  { coins: 5000, price: "11.99", color: "bg-red-500 text-white" },
  { coins: 13500, price: "29.99", color: "bg-yellow-400 text-black" },
];

export default function RechargePage() {
  const [loading, setLoading] = useState<number | null>(null);

  async function startCheckout(coins: number) {
    try {
      setLoading(coins);

      const res = await fetch("/api/aquacoins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins }),
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("No se pudo iniciar el pago");
        setLoading(null);
      }
    } catch (err) {
      console.error(err);
      setLoading(null);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center py-12 px-6 bg-gradient-to-b from-blue-900 to-indigo-800 text-white min-h-screen">
      <h1 className="text-4xl font-extrabold mb-6 drop-shadow-lg">
        Recargar AquaCoins
      </h1>
      <p className="text-lg mb-8 text-gray-200 text-center max-w-xl">
        Elige uno de los paquetes disponibles para obtener AquaCoins.
        Los precios son en USD y mostrados bajo cada paquete, como un
        cartel claro para el cliente.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {PACKS.map(({ coins, price, color }) => (
          <button
            key={coins}
            onClick={() => startCheckout(coins)}
            disabled={loading !== null}
            className={`
              ${color}
              flex flex-col items-center justify-center
              p-6
              rounded-xl
              shadow-2xl
              transform transition-transform duration-300
              hover:scale-105
              focus:outline-none focus:ring-4 focus:ring-white
            `}
          >
            <span className="text-3xl font-extrabold">
              {coins.toLocaleString()} AquaCoins
            </span>

            <span className="text-xl font-semibold mt-2">
              ${price} USD
            </span>
            
            {loading === coins && (
              <span className="text-base mt-1 opacity-80">
                Procesando...
              </span>
            )}
          </button>
        ))}
      </div>
    </main>
  );
}