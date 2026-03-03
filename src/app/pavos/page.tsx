"use client";

type Pack = {
  amount: number;
  price: number;
  image: string;
  extra?: string;
  theme: "green" | "blue" | "purple" | "orange";
};

export default function PavosPage() {
  const packs: Pack[] = [
    { amount: 1000, price: 5.5, image: "/pavos/1000-pavos.jpg", theme: "green" },
    { amount: 2800, price: 13, image: "/pavos/2800-pavos.jpg", theme: "blue", extra: "9% EXTRA*" },
    { amount: 5000, price: 24, image: "/pavos/5000-pavos.jpg", theme: "purple", extra: "22% EXTRA*" },
    { amount: 13500, price: 55, image: "/pavos/13500-pavos.jpg", theme: "orange", extra: "35% EXTRA*" },
  ];

  const themeClass: Record<Pack["theme"], string> = {
    green: "from-green-500 to-green-700",
    blue: "from-sky-500 to-blue-700",
    purple: "from-fuchsia-500 to-purple-800",
    orange: "from-orange-500 to-amber-700",
  };

  const handleCheckout = async (pack: Pack) => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          {
            id: `pavos_${pack.amount}`,
            name: `${pack.amount} Pavos`,
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
      <h1 className="text-4xl font-extrabold mb-12 text-center">
        Recarga de Pavos
      </h1>

      <div className="max-w-6xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {packs.map((pack) => (
          <div
            key={pack.amount}
            className={`rounded-3xl shadow-2xl bg-gradient-to-b ${themeClass[pack.theme]} p-6 flex flex-col`}
          >
            {pack.extra && (
              <div className="bg-white text-black font-bold px-4 py-1 rounded-full text-sm self-start mb-4">
                {pack.extra}
              </div>
            )}

            <div className="rounded-2xl overflow-hidden h-[300px] sm:h-[320px] mb-6 bg-black/15">
              <div
                className="w-full h-full bg-center bg-cover"
                style={{
                  backgroundImage: `url(${pack.image})`,
                  transform: "scale(1.15)",
                }}
              />
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-extrabold">
                {pack.amount.toLocaleString()}
              </div>
              <div className="text-xl font-bold tracking-wide">
                PAVOS
              </div>
            </div>

            <button
              onClick={() => handleCheckout(pack)}
              className="w-full rounded-2xl bg-yellow-300 text-black font-extrabold text-lg py-3 hover:brightness-95 transition mb-4"
            >
              ${pack.price} USD
            </button>

            <button
              onClick={() => handleCheckout(pack)}
              className="w-full rounded-xl bg-black/25 hover:bg-black/35 font-semibold py-3 transition mt-auto"
            >
              Comprar
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}