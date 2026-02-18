"use client";

import { useState } from "react";

const PACKS = [
  { coins: 600, color: 'bg-cyan-400' },
  { coins: 1000, color: 'bg-green-400' },
  { coins: 2800, color: 'bg-purple-500' },
  { coins: 5000, color: 'bg-red-500' },
  { coins: 13500, color: 'bg-yellow-500' },
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
    <main className="flex flex-col items-center py-12 px-6 bg-gradient-to-b from-blue-800 to-blue-400 text-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6">Recargar AquaCoins</h1>
      <p className="text-lg mb-6 text-gray-100">
        Elige un paquete para recargar tus AquaCoins
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-4xl">
        {PACKS.map(({ coins, color }) => (
          <button
            key={coins}
            onClick={() => startCheckout(coins)}
            disabled={loading !== null}
            className={`${
              loading === coins ? "opacity-50 cursor-not-allowed" : ""
            } ${color} text-white text-xl py-4 px-6 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white`}
          >
            {loading === coins ? "Procesando..." : `${coins} AquaCoins`}
          </button>
        ))}
      </div>
    </main>
  );
}