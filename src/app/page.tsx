"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export default function HomePage() {

  const { data: session } = useSession();

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
          >
            🛒
          </Link>

          {/* LOGIN / PERFIL DINÁMICO */}
          {!session && (
            <Link
              href="/login"
              className="
                btn btn-sm md:btn-md
                border-0
                bg-[#5865F2] hover:bg-[#4c58d6]
                text-white
              "
            >
              Iniciar sesión
            </Link>
          )}

          {session && (
            <Link
              href="/perfil"
              className="
                btn btn-sm md:btn-md
                border-0
                bg-[#10B3C7] hover:bg-[#0EA2B4]
                text-white
              "
            >
              Perfil
            </Link>
          )}

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
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Compra skins y recarga pavos rápido y seguro
          </h1>

          <p className="mt-4 text-white/70">
            Navbar dinámica ya conectada con sesión.
          </p>
        </div>
      </section>
    </main>
  );
}