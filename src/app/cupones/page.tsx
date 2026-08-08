"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

type Coupon = {
  code: string;
  available: boolean;
  discount: string;
};

export default function CuponesPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const loadCoupons = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/cupones", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "No se pudieron cargar los cupones.");
      }

      setCoupons(Array.isArray(data?.coupons) ? data.coupons : []);
    } catch (requestError) {
      console.error("Coupons request failed:", requestError);
      setError("No se pudieron cargar los cupones. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const copyCoupon = async (code: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const copied = document.execCommand("copy");
        textArea.remove();

        if (!copied) throw new Error("Copy command failed");
      }

      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 2200);
    } catch {
      setError("No se pudo copiar el código. Cópialo manualmente.");
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_left,_#0774BB_0%,_#052F6F_75%,_#040A3F_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl border border-white/10 bg-black/10 p-6 shadow-2xl backdrop-blur-sm md:p-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
              <Icon icon="solar:ticket-sale-bold" width="16" />
              Promociones
            </span>

            <h1 className="mt-5 text-4xl font-extrabold md:text-6xl">
              Cupones disponibles
            </h1>
            <p className="mt-4 text-base text-white/70 md:text-lg">
              Consulta aquí las promociones activas de Aquafornais y utiliza el
              código durante el checkout.
            </p>
          </div>

          <div className="mt-10 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold md:text-2xl">Promociones activas</h2>
            <button
              type="button"
              onClick={loadCoupons}
              className="btn btn-sm border-white/15 bg-white/10 text-white hover:bg-white/20"
              disabled={loading}
            >
              <Icon icon="solar:refresh-bold" width="17" />
              Actualizar
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-300/30 bg-red-400/10 p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-8 text-center text-white/70">
              Consultando promociones...
            </div>
          ) : coupons.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-[#040A3F]/35 p-8 text-center">
              <Icon className="mx-auto text-cyan-200" icon="solar:ticket-sale-bold" width="38" />
              <h2 className="mt-4 text-xl font-bold">No hay cupones activos</h2>
              <p className="mt-2 text-sm text-white/65">
                Las promociones disponibles aparecerán aquí automáticamente.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {coupons.map((coupon) => (
                <article
                  key={coupon.code}
                  className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-200">
                      <Icon icon="solar:ticket-sale-bold" width="28" />
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        coupon.available
                          ? "bg-emerald-300/15 text-emerald-200"
                          : "bg-red-300/15 text-red-200"
                      }`}
                    >
                      {coupon.available ? "Disponible" : "Agotado"}
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-white/65">{coupon.discount}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <code className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 font-mono text-lg font-bold tracking-wide">
                      {coupon.code}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyCoupon(coupon.code)}
                      className="btn btn-sm border-0 bg-cyan-400 text-[#04234f] hover:bg-cyan-300"
                      disabled={!coupon.available}
                    >
                      <Icon icon={copiedCode === coupon.code ? "solar:check-circle-bold" : "solar:copy-bold"} width="17" />
                      {copiedCode === coupon.code ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-dashed border-white/20 bg-[#040A3F]/35 p-5 text-sm text-white/65">
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 shrink-0 text-orange-200" icon="solar:info-circle-bold" width="22" />
              <p>
                Copia el código y úsalo en el checkout seguro de Stripe. La disponibilidad
                se consulta directamente desde Stripe.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-primary border-0">
              Ir a la tienda
              <Icon icon="solar:arrow-right-bold" width="18" />
            </Link>
            <Link href="/" className="btn border-white/15 bg-white/10 text-white hover:bg-white/20">
              Volver al inicio
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
