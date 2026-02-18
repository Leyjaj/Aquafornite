"use client";

import { useState } from "react";

const PACKS = [
  { coins: 600 },
  { coins: 1000 },
  { coins: 2800 },
  { coins: 5000 },
  { coins: 13500 },
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
    <main style={{ padding: 40 }}>
      <h1>Recargar AquaCoins</h1>

      <p style={{ opacity: 0.7 }}>
        Elige el paquete que deseas recargar
      </p>

      <div
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        {PACKS.map(({ coins }) => (
          <button
            key={coins}
            onClick={() => startCheckout(coins)}
            disabled={loading !== null}
            style={{
              padding: 20,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            {loading === coins
              ? "Procesando..."
              : `${coins} AquaCoins`}
          </button>
        ))}
      </div>
    </main>
  );
}