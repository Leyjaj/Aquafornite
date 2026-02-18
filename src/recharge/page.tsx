"use client";

import { useState } from "react";

const PACKS = [600, 1000, 2800, 5000, 13500];

export default function RechargePage() {
  const [loading, setLoading] = useState<number | null>(null);

  async function handleRecharge(coins: number) {
    try {
      setLoading(coins);

      const res = await fetch("/api/aquacoins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coins }),
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("No se pudo iniciar el pago");
        setLoading(null);
      }
    } catch (error) {
      console.error("Error creando sesión:", error);
      setLoading(null);
    }
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>Recargar AquaCoins</h1>

      <div
        style={{
          marginTop: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
        {PACKS.map((coins) => (
          <button
            key={coins}
            onClick={() => handleRecharge(coins)}
            disabled={loading !== null}
            style={{
              padding: "16px",
              fontSize: "16px",
              cursor: "pointer",
              opacity: loading && loading !== coins ? 0.6 : 1,
            }}
          >
            {loading === coins ? "Procesando..." : `${coins} AquaCoins`}
          </button>
        ))}
      </div>
    </main>
  );
}