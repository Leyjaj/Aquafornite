import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="
        min-h-screen
        bg-[radial-gradient(ellipse_at_left,_#0774BB_0%,_#052F6F_75%,_#040A3F_100%)]
        bg-fixed
        text-white
      "
    >
      {/* TOP NAVBAR */}
      <div
        className="
          navbar
          fixed top-0 left-0 right-0 z-50
          bg-gradient-to-b from-[#052F6F] to-[#040A3F]
          shadow-md
          px-4 md:px-8
        "
      >
        {/* LOGO */}
        <div className="navbar-start">
          <Link
            href="/"
            className="btn btn-ghost text-xl font-bold text-white hover:bg-white/10"
          >
            Aquafornais
          </Link>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="navbar-end gap-2 items-center">
          {/* MONEDA */}
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-sm text-white hover:bg-white/10">
              🇺🇸 USD ▾
            </button>
            <ul className="menu dropdown-content mt-2 w-32 rounded-xl bg-[#0b1c3f] text-white shadow-lg border border-white/10">
              <li><button>🇺🇸 USD</button></li>
              <li><button>🇲🇽 MXN</button></li>
              <li><button>🇵🇪 PEN</button></li>
            </ul>
          </div>

          {/* IDIOMA */}
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-sm text-white hover:bg-white/10">
              🇪🇸 Español ▾
            </button>
            <ul className="menu dropdown-content mt-2 w-36 rounded-xl bg-[#0b1c3f] text-white shadow-lg border border-white/10">
              <li><button>🇪🇸 Español</button></li>
              <li><button>🇺🇸 English</button></li>
            </ul>
          </div>

          {/* CARRITO */}
          <Link
            href="/cart"
            className="btn btn-ghost btn-sm text-white hover:bg-white/10"
            title="Carrito"
          >
            🛒
          </Link>

          {/* LOGIN */}
          <Link
            href="/auth"
            className="
              btn btn-sm md:btn-md
              border-0
              bg-[#5865F2] hover:bg-[#4c58d6]
              text-white
            "
          >
            Iniciar sesión
          </Link>

          {/* CTA */}
          <Link
            href="/shop"
            className="
              btn btn-sm md:btn-md
              border-0
              bg-[#0B84D8] hover:bg-[#0A73BD]
              text-white
            "
          >
            Ir a la tienda
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="px-4 pt-20">
        <div className="mx-auto max-w-6xl py-10 md:py-14">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Compra skins y recarga pavos{" "}
                <span className="text-[#4FB8FF]">rápido</span> y{" "}
                <span className="text-[#4FB8FF]">seguro</span>.
              </h1>

              <p className="mt-4 text-base md:text-lg text-white/70">
                Elige tu sección y entra directo. Diseñado para móvil y checkout por Stripe.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/shop"
                  className="btn btn-lg border-0 bg-[#0B84D8] hover:bg-[#0A73BD] text-white"
                >
                  🛒 Ver catálogo
                </Link>

                <Link
                  href="/recargas"
                  className="btn btn-lg bg-transparent border border-white/25 text-white hover:bg-white/10"
                >
                  💳 Recargar pavos
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/70">
                <span className="badge bg-white/10 border border-white/10">Soporte rápido</span>
                <span className="badge bg-white/10 border border-white/10">Entrega ágil</span>
                <span className="badge bg-white/10 border border-white/10">Pago seguro</span>
              </div>
            </div>

            {/* ACCESOS RAPIDOS */}
            <div className="card bg-white/5 border border-white/10 shadow-xl backdrop-blur-md">
              <div className="card-body">
                <h2 className="card-title text-white">Accesos rápidos</h2>
                <p className="text-white/70">
                  Entra directo a lo que buscas. Todo optimizado para que compres sin vueltas.
                </p>

                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/shop" className="btn w-full border-0 bg-[#0B84D8] hover:bg-[#0A73BD] text-white">
                    🛍️ Skins
                  </Link>
                  <Link href="/recargas" className="btn w-full border-0 bg-[#0F6AAE] hover:bg-[#0D5F9B] text-white">
                    🔥 Pavos
                  </Link>
                  <Link href="/club" className="btn w-full sm:col-span-2 bg-[#10B3C7] hover:bg-[#0EA2B4] border-0 text-white">
                    ⭐ Club / Membresías
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* SECTIONS */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Tienda de Skins", "Explora skins y agrega al carrito en segundos.", "/shop"],
              ["Recargar Pavos", "Recargas rápidas con métodos disponibles por región.", "/recargas"],
              ["Club", "Beneficios, membresías y ofertas especiales.", "/club"],
            ].map(([title, desc, href]) => (
              <Link
                key={title}
                href={href}
                className="card bg-white/5 border border-white/10 shadow-md hover:shadow-xl transition backdrop-blur-md"
              >
                <div className="card-body">
                  <h3 className="card-title text-white">{title}</h3>
                  <p className="text-white/70">{desc}</p>
                  <div className="card-actions justify-end">
                    <span className="btn btn-ghost btn-sm text-white hover:bg-white/10">Entrar →</span>
                  </div>
                </div>
              </Link>
            ))}

            {["Otros juegos", "Soporte", "Ofertas"].map((t) => (
              <div
                key={t}
                className="card bg-white/5 border border-white/10 shadow-md backdrop-blur-md"
              >
                <div className="card-body">
                  <h3 className="card-title text-white">{t}</h3>
                  <p className="text-white/70">Próximamente disponible.</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-outline btn-sm text-white border-white/25" disabled>
                      Pronto
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="mt-12 pb-10 text-center text-sm text-white/60">
            © {new Date().getFullYear()} AquaFortnite — tu diosa de confianza 💧
          </div>
        </div>
      </section>
    </main>
  );
}
