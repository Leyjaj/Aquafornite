"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

type Lang = "en" | "pt-BR" | "es-LATAM" | "es-ES";

export default function HomePage() {
  const { data: session } = useSession();
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const browserLang = navigator.language;

    if (browserLang.startsWith("pt-BR")) setLang("pt-BR");
    else if (browserLang === "es-ES") setLang("es-ES");
    else if (browserLang.startsWith("es")) setLang("es-LATAM");
    else setLang("en");
  }, []);

  const t = {
    en: {
      signIn: "Sign in",
      profile: "Profile",
      shop: "Shop",
      heroTitle: "Buy skins and recharge V-Bucks fast and safe",
      heroDesc: "Secure system connected with active session.",
      pavos: "V-Bucks",
      bundles: "Bundles",
      recharge: "Recharge other games",
      skins: "Skins",
      bots: "Accounts / Bots",
      offers: "Offers",
      terms: "Terms and Conditions",
      refunds: "Refund Policy",
      faq: "Frequently Asked Questions"
    },
    "pt-BR": {
      signIn: "Entrar",
      profile: "Perfil",
      shop: "Loja",
      heroTitle: "Compre skins e recarregue V-Bucks rápido e seguro",
      heroDesc: "Sistema seguro conectado com sessão ativa.",
      pavos: "V-Bucks",
      bundles: "Pacotes",
      recharge: "Recarregar outros jogos",
      skins: "Skins",
      bots: "Contas / Bots",
      offers: "Ofertas",
      terms: "Termos e Condições",
      refunds: "Política de Reembolso",
      faq: "Perguntas Frequentes"
    },
    "es-LATAM": {
      signIn: "Iniciar sesión",
      profile: "Perfil",
      shop: "Tienda",
      heroTitle: "Compra skins y recarga pavos rápido y seguro",
      heroDesc: "Sistema seguro conectado con sesión activa.",
      pavos: "Pavos",
      bundles: "Lotes",
      recharge: "Recargar otros juegos",
      skins: "Skins",
      bots: "Cuentas / Bots",
      offers: "Ofertas",
      terms: "Términos y condiciones",
      refunds: "Política de reembolsos",
      faq: "Preguntas frecuentes"
    },
    "es-ES": {
      signIn: "Iniciar sesión",
      profile: "Perfil",
      shop: "Tienda",
      heroTitle: "Compra skins y recarga pavos rápido y seguro",
      heroDesc: "Sistema seguro conectado con sesión activa.",
      pavos: "Pavos",
      bundles: "Lotes",
      recharge: "Recargar otros juegos",
      skins: "Skins",
      bots: "Cuentas / Bots",
      offers: "Ofertas",
      terms: "Términos y condiciones",
      refunds: "Política de reembolsos",
      faq: "Preguntas frecuentes"
    }
  };

  const text = t[lang];

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_left,_#0774BB_0%,_#052F6F_75%,_#040A3F_100%)] text-white flex flex-col">

      {/* NAVBAR */}
      <div className="navbar fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#052F6F] to-[#040A3F] shadow-md px-4 md:px-8">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost text-xl font-bold text-white hover:bg-white/10">
            Aquafornais
          </Link>
        </div>

        <div className="navbar-end gap-2 items-center">
          {!session && (
            <Link
              href="/auth/login"
              className="btn btn-sm border-0 bg-[#5865F2] hover:bg-[#4c58d6] text-white"
            >
              {text.signIn}
            </Link>
          )}

          {session && (
            <Link
              href="/perfil"
              className="btn btn-sm border-0 bg-[#10B3C7] hover:bg-[#0EA2B4] text-white"
            >
              {text.profile}
            </Link>
          )}

          <Link
            href="/shop"
            className="btn btn-sm border-0 bg-[#0B84D8] hover:bg-[#0A73BD] text-white"
          >
            {text.shop}
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="px-4 pt-24">
        <div className="mx-auto max-w-6xl py-10">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            {text.heroTitle}
          </h1>
          <p className="mt-4 text-white/70">
            {text.heroDesc}
          </p>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="px-4 py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">

          <Link href="/pavos" className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl text-center transition">
            {text.pavos}
          </Link>

          <Link href="/lotes" className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl text-center transition">
            {text.bundles}
          </Link>

          <Link href="/otros-juegos" className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl text-center transition">
            {text.recharge}
          </Link>

          <Link href="/skins" className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl text-center transition">
            {text.skins}
          </Link>

          <Link href="/cuentas-bots" className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl text-center transition">
            {text.bots}
          </Link>

          <Link href="/ofertas" className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl text-center transition">
            {text.offers}
          </Link>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#040A3F] border-t border-white/10 py-10 px-4 mt-auto">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-sm">

          <div className="flex flex-col gap-2">
            <Link href="/terminos">{text.terms}</Link>
            <Link href="/rembolsos">{text.refunds}</Link>
            <Link href="/faq">{text.faq}</Link>
          </div>

          <div></div>

          <div className="flex flex-col gap-4 items-start md:items-end">
            <div>© 2026 Aquafornais</div>

            <div className="dropdown dropdown-top">
              <button className="btn btn-sm bg-white/10 border-0 text-white hover:bg-white/20">
                {lang}
              </button>
              <ul className="dropdown-content menu p-2 shadow bg-[#0b1c3f] rounded-box w-48 text-white">
                <li><button onClick={() => setLang("en")}>English</button></li>
                <li><button onClick={() => setLang("pt-BR")}>Português (Brasil)</button></li>
                <li><button onClick={() => setLang("es-LATAM")}>Español (Latam)</button></li>
                <li><button onClick={() => setLang("es-ES")}>Español (España)</button></li>
              </ul>
            </div>
          </div>

        </div>
      </footer>

    </main>
  );
}