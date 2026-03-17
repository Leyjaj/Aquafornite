"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import PaymentMarquee from "@/components/PaymentMarquee";

type Lang = "en" | "es" | "pt";

export default function HomePage() {
  const { data: session } = useSession();
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();

    if (browserLang.startsWith("pt")) setLang("pt");
    else if (browserLang.startsWith("es")) setLang("es");
    else setLang("en");
  }, []);

  const t = {
    en: {
      heroTitle: "Buy skins and recharge V-Bucks fast and safe",
      heroDesc: "Secure system connected with active session.",
      pavos: "V-Bucks",
      bundles: "Money Bundles",
      recharge: "Recharge other games",
      skins: "Skins 👕👖",
      bots: "Accounts / Bots",
      offers: "Offers",
      club: "Fortnite Club",
      terms: "Terms and Conditions",
      refunds: "Refund Policy",
      faq: "Frequently Asked Questions",
      featured: "🔥 Best Seller"
    },
    es: {
      heroTitle: "Compra skins y recarga pavos rápido y seguro",
      heroDesc: "Sistema seguro conectado con sesión activa.",
      pavos: "Pavos",
      bundles: "Lotes de dinero",
      recharge: "Recargar otros juegos",
      skins: "Skins 👕👖",
      bots: "Cuentas / Bots",
      offers: "Ofertas",
      club: "Club Fortnite",
      terms: "Términos y condiciones",
      refunds: "Política de reembolsos",
      faq: "Preguntas frecuentes",
      featured: "🔥 Más vendido"
    },
    pt: {
      heroTitle: "Compre skins e recarregue V-Bucks rápido e seguro",
      heroDesc: "Sistema seguro conectado com sessão ativa.",
      pavos: "V-Bucks",
      bundles: "Pacotes de Dinheiro",
      recharge: "Recarregar outros jogos",
      skins: "Skins 👕👖",
      bots: "Contas / Bots",
      offers: "Ofertas",
      club: "Clube Fortnite",
      terms: "Termos e Condições",
      refunds: "Política de Reembolso",
      faq: "Perguntas Frequentes",
      featured: "🔥 Mais vendido"
    }
  };

  const text = t[lang] ?? t.en;

  const cardStyle =
    "bg-white/10 hover:bg-white/20 p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl";

  const featuredCard =
    "relative col-span-2 md:col-span-2 bg-gradient-to-br from-blue-400/40 to-blue-700/40 border border-blue-300/40 p-8 rounded-2xl text-center font-bold text-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-2xl";

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_left,_#0774BB_0%,_#052F6F_75%,_#040A3F_100%)] text-white flex flex-col">

      <section className="px-4 pt-16">
        <div className="mx-auto max-w-6xl py-10">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            {text.heroTitle}
          </h1>
          <p className="mt-4 text-white/70">
            {text.heroDesc}
          </p>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">

          <Link href="/shop" className={featuredCard}>
            <div className="absolute top-2 right-3 text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
              {text.featured}
            </div>
            {text.skins}
          </Link>

          <Link href="/pavos" className={cardStyle}>{text.pavos}</Link>
          <Link href="/lotes" className={cardStyle}>{text.bundles}</Link>
          <Link href="/club" className={cardStyle}>{text.club}</Link>
          <Link href="/otros-juegos" className={cardStyle}>{text.recharge}</Link>
          <Link href="/cuentas-bots" className={cardStyle}>{text.bots}</Link>
          <Link href="/ofertas" className={cardStyle}>{text.offers}</Link>

        </div>
      </section>

      <PaymentMarquee />

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
                {lang.toUpperCase()}
              </button>

              <ul className="dropdown-content menu p-2 shadow bg-[#0b1c3f] rounded-box w-48 text-white">
                <li><button onClick={() => setLang("en")}>English</button></li>
                <li><button onClick={() => setLang("es")}>Español</button></li>
                <li><button onClick={() => setLang("pt")}>Português</button></li>
              </ul>

            </div>
          </div>

        </div>
      </footer>

    </main>
  );
}