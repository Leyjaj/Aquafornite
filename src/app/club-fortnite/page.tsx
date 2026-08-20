"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { useState } from "react";

const steps = [
  {
    number: "01",
    title: "Elige tu suscripción",
    description: "Indícanos qué modalidad del Club Fortnite quieres adquirir.",
    icon: "solar:calendar-bold",
  },
  {
    number: "02",
    title: "Coordina tu compra",
    description: "Te atenderemos por Discord o WhatsApp para confirmar los datos.",
    icon: "solar:chat-round-dots-bold",
  },
  {
    number: "03",
    title: "Recibe confirmación",
    description: "Revisamos el pedido manualmente y te indicamos los siguientes pasos.",
    icon: "solar:check-circle-bold",
  },
];

const benefits: Array<{
  title: string;
  description: string;
  icon: string;
  className: string;
  image?: string;
}> = [
  {
    title: "Paquete de club",
    description: "Recibe la skin destacada incluida en el Club Fortnite.",
    icon: "solar:shirt-bold",
    className: "from-sky-400 via-blue-600 to-[#171a4a]",
    image: "/images/club-fortnite-agosto.webp",
  },
  {
    title: "800 Pavos",
    description: "Recibe 800 pavos incluidos en tu suscripción.",
    icon: "solar:coins-bold",
    className: "from-cyan-300 via-sky-500 to-[#07517b]",
    image: "/images/club-vbucks.webp",
  },
  {
    title: "Pase de batalla",
    description: "Accede al contenido y recompensas de la temporada.",
    icon: "solar:shield-star-bold",
    className: "from-blue-500 via-indigo-600 to-[#171a4a]",
    image: "/images/club-pase-batalla.webp",
  },
  {
    title: "Pase de LEGO",
    description: "Desbloquea recompensas para tu aventura LEGO Fortnite.",
    icon: "solar:buildings-2-bold",
    className: "from-amber-300 via-orange-500 to-[#54220e]",
    image: "/images/club-pase-lego.webp",
  },
  {
    title: "Pase musical",
    description: "Disfruta contenido y recompensas para tu experiencia musical.",
    icon: "solar:music-note-bold",
    className: "from-fuchsia-500 via-purple-600 to-[#260c59]",
    image: "/images/club-pase-musical.webp",
  },
  {
    title: "Rocket League Premium",
    description: "Accede al contenido premium de Rocket League incluido en el Club.",
    icon: "solar:wheel-bold",
    className: "from-slate-300 via-blue-500 to-[#172b66]",
    image: "/images/club-rocket-league-premium.webp",
  },
  {
    title: "Pase de Orígenes",
    description: "Accede al contenido y recompensas del Pase de Orígenes.",
    icon: "solar:gameboy-bold",
    className: "from-orange-300 via-amber-600 to-[#4a210d]",
    image: "/images/club-pase-origenes.webp",
  },
];

export default function ClubFortnitePage() {
  const [months, setMonths] = useState(1);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError("");

    try {
      const response = await fetch("/api/checkout/club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months }),
      });
      const data = await response.json();

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "No se pudo iniciar el checkout.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Club checkout failed:", error);
      setCheckoutError("No se pudo iniciar la compra. Intenta de nuevo.");
      setIsCheckingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_left,_#0774BB_0%,_#052F6F_75%,_#040A3F_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-black/15 shadow-2xl backdrop-blur-sm">
          <div className="relative p-6 md:p-12">
            <div className="absolute -right-20 -top-24 size-72 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="relative max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                <Icon icon="solar:star-bold" width="16" />
                Servicio manual
              </span>

              <h1 className="mt-5 text-4xl font-extrabold md:text-6xl">
                Club Fortnite
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                Solicita tu suscripción del Club Fortnite con atención directa y
                confirmación manual de tu pedido.
              </p>
            </div>
          </div>

          <div className="grid gap-5 border-t border-white/10 bg-white/[0.03] p-6 md:grid-cols-3 md:p-8">
            {steps.map((step) => (
              <article key={step.number} className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-200">
                    <Icon icon={step.icon} width="24" />
                  </div>
                  <span className="font-mono text-sm font-bold text-white/35">{step.number}</span>
                </div>
                <h2 className="mt-5 text-lg font-bold">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/65">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="relative mt-8 overflow-hidden rounded-3xl border border-white/15 bg-[#101936] shadow-2xl"
          style={{ backgroundImage: "url('/images/club-fortnite-agosto.webp')" }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(4,10,63,0.98)_0%,rgba(5,47,111,0.72)_48%,rgba(7,116,187,0.45)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040a3f] via-transparent to-[#040a3f]/35" />

          <div className="relative px-4 pb-10 pt-8 md:px-8 md:pb-14 md:pt-10">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span className="rounded-md border border-amber-300/30 bg-black/45 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200">
                ✦ Pases incluidos
              </span>
              <span className="rounded-md border border-cyan-300/30 bg-black/45 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200">
                Contenido mensual
              </span>
              <span className="rounded-md border border-fuchsia-300/30 bg-black/45 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-fuchsia-200">
                Servicio manual
              </span>
            </div>

            <div className="mt-8 text-center md:mt-10">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-200 drop-shadow-md">
                Beneficios incluidos
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.55)] md:text-5xl">
                Todo tu contenido del Club
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 md:text-base">
                Explora lo que puedes recibir con tu suscripción de Fortnite Crew.
              </p>
            </div>

            <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-10">
              {benefits.map((benefit) => (
                <article
                  key={benefit.title}
                  className="w-[78vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/15 bg-[#292830] shadow-[0_18px_35px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1 md:w-[280px]"
                >
                  <div className={`relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br p-2 ${benefit.className}`}>
                    <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/20 blur-2xl" />
                    {benefit.image ? (
                      <img
                        src={benefit.image}
                        alt={benefit.title}
                        className="relative size-full scale-[1.06] object-contain object-center drop-shadow-[0_12px_16px_rgba(0,0,0,0.25)]"
                      />
                    ) : (
                      <Icon className="relative text-white drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]" icon={benefit.icon} width="92" />
                    )}
                  </div>
                  <div className="flex min-h-24 items-center bg-[#292830] px-4 py-5">
                    <h3 className="text-lg font-extrabold leading-tight text-white">{benefit.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-3xl border border-white/10 bg-black/15 p-6 backdrop-blur-sm md:p-8">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-300/15 text-orange-200">
                <Icon icon="solar:clipboard-text-bold" width="24" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Antes de solicitarlo</h2>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Como este servicio se gestiona manualmente, primero confirmaremos
                  disponibilidad, precio y los datos necesarios para completar la compra.
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-3">
                <Icon className="mt-0.5 shrink-0 text-cyan-200" icon="solar:check-circle-bold" width="18" />
                No debes tener el Club Fortnite activo al momento de solicitarlo.
              </li>
              <li className="flex items-start gap-3">
                <Icon className="mt-0.5 shrink-0 text-cyan-200" icon="solar:check-circle-bold" width="18" />
                Necesitas tener libre una plataforma, es decir, sin una cuenta vinculada: Xbox, PlayStation o Nintendo.
              </li>
              <li className="flex items-start gap-3">
                <Icon className="mt-0.5 shrink-0 text-cyan-200" icon="solar:check-circle-bold" width="18" />
                También existe un método alternativo que no requiere plataforma libre ni vincular nada.
              </li>
              <li className="flex items-start gap-3">
                <Icon className="mt-0.5 shrink-0 text-cyan-200" icon="solar:chat-round-dots-bold" width="18" />
                Consulta disponibilidad y detalles por WhatsApp o Discord antes de elegir el método alternativo.
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 shrink-0 text-amber-200" icon="solar:gameboy-bold" width="21" />
                <div>
                  <h3 className="text-sm font-bold text-amber-100">Importante para Nintendo Switch</h3>
                  <p className="mt-2 text-xs leading-5 text-amber-50/75">
                    Los pavos de la cuenta solo se muestran dentro de Nintendo Switch 1 y 2.
                    Los pavos siguen estando en tu cuenta, pero no son visibles en las demás
                    plataformas que usan la cartera compartida.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-amber-50/75">
                    Si eliges el método de Nintendo, también puedes pedir objetos usando tus
                    pavos de Switch. Además, estamos desarrollando un panel para que puedas
                    utilizar esos pavos sin necesitar una Nintendo Switch.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-100">
                Dos métodos de entrega, mismos beneficios
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Icon className="text-cyan-200" icon="solar:link-bold" width="19" />
                    Método por plataforma
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/65">
                    Vinculamos una cuenta propia a la cuenta del cliente y realizamos la
                    compra desde la plataforma elegida: Xbox, PlayStation o Nintendo.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Icon className="text-orange-200" icon="solar:shop-2-bold" width="19" />
                    Método alternativo
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/65">
                    Realizamos el pago desde una tienda externa sin vincular ninguna cuenta.
                    Tiene más limitaciones y depende de disponibilidad, por lo que debes
                    consultarlo antes por WhatsApp o Discord.
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-white/55">
                Ambos métodos entregan el mismo Club Fortnite y los mismos beneficios; lo
                único que cambia es la forma de gestionarlo.
              </p>
            </div>
          </article>

          <aside className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6 md:p-8">
            <Icon className="text-cyan-200" icon="solar:headphones-round-sound-bold" width="34" />
            <h2 className="mt-5 text-2xl font-bold">Elige tu duración</h2>
            <p className="mt-2 text-sm leading-6 text-cyan-50/75">
              El precio es de 6 USD por mes y se realiza un pago único por el periodo
              elegido. Después coordinaremos los pasos finales por Discord o WhatsApp.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }, (_, index) => index + 1).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMonths(option)}
                  className={`rounded-xl border px-2 py-2 text-sm font-bold transition ${
                    months === option
                      ? "border-cyan-200 bg-cyan-200 text-[#04234f]"
                      : "border-white/15 bg-black/15 text-white hover:bg-white/10"
                  }`}
                >
                  {option} {option === 1 ? "mes" : "meses"}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
              <span className="text-sm text-white/65">Total</span>
              <span className="text-2xl font-extrabold">${(months * 6).toFixed(2)} USD</span>
            </div>

            {checkoutError && (
              <p className="mt-3 text-sm text-red-200">{checkoutError}</p>
            )}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="btn mt-5 w-full border-0 bg-cyan-300 text-[#04234f] hover:bg-cyan-200"
            >
              {isCheckingOut ? "Preparando checkout..." : "Comprar Club Fortnite"}
            </button>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-4 text-xs leading-5 text-white/65">
              La atención y activación se gestionan manualmente después de confirmar el pago.
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <a
                href="https://discord.gg/cWhtwxrFec"
                target="_blank"
                rel="noreferrer"
                className="btn border-0 bg-[#5865F2] text-white hover:bg-[#4752C4]"
              >
                <Icon icon="logos:discord-icon" width="18" />
                Discord
              </a>
              <a
                href="https://wa.me/message/OUQ2AIGIAB4EC1"
                target="_blank"
                rel="noreferrer"
                className="btn border-0 bg-[#25D366] text-white hover:bg-[#1DA851]"
              >
                <Icon icon="logos:whatsapp-icon" width="18" />
                WhatsApp
              </a>
            </div>
          </aside>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary border-0">
            Volver al inicio
          </Link>
          <Link href="/pavos" className="btn border-white/15 bg-white/10 text-white hover:bg-white/20">
            Ver pavos
          </Link>
        </div>
      </div>
    </main>
  );
}
