"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PaymentMarquee from "@/components/PaymentMarquee";
import { useCurrency } from "@/hooks/useCurrency";

type Lang = "en" | "es" | "pt";

export default function PruebaPrincipalPage() {
  const { currency } = useCurrency();
  const [lang, setLang] = useState<Lang>("en");
  const [bundles, setBundles] = useState<Array<{
    id: string;
    name: string;
    finalPrice: number;
    regularPrice: number;
    image: string;
    fitMode: "portrait" | "wide" | "balanced";
    bgFrom: string;
    bgVia: string;
    bgTo: string;
  }>>([]);
  const [activeBundleIndex, setActiveBundleIndex] = useState(0);

  const setLangPreference = (nextLang: Lang) => {
    setLang(nextLang);
    localStorage.setItem("siteLang", nextLang);
    document.cookie = `siteLang=${nextLang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("siteLang") as Lang | null;
    if (savedLang === "es" || savedLang === "en" || savedLang === "pt") {
      setLang(savedLang);
      document.cookie = `siteLang=${savedLang}; path=/; max-age=31536000; SameSite=Lax`;
      return;
    }

    const browserLang = navigator.language.toLowerCase();
    const detectedLang: Lang = browserLang.startsWith("pt")
      ? "pt"
      : browserLang.startsWith("es")
      ? "es"
      : "en";

    setLang(detectedLang);
    localStorage.setItem("siteLang", detectedLang);
    document.cookie = `siteLang=${detectedLang}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  useEffect(() => {
    const loadBundles = async () => {
      try {
        const response = await fetch(`/api/shop/bundles?lang=${lang}`);
        if (!response.ok) return;

        const data = await response.json();
        setBundles(Array.isArray(data?.bundles) ? data.bundles : []);
      } catch {
        setBundles([]);
      }
    };

    loadBundles();
  }, [lang]);

  useEffect(() => {
    if (bundles.length <= 1) return;

    const timer = setInterval(() => {
      setActiveBundleIndex((prev) => (prev + 1) % bundles.length);
    }, 4300);

    return () => clearInterval(timer);
  }, [bundles]);

  useEffect(() => {
    if (activeBundleIndex >= bundles.length) {
      setActiveBundleIndex(0);
    }
  }, [activeBundleIndex, bundles.length]);

  const goToPrevBundle = () => {
    if (bundles.length === 0) return;
    setActiveBundleIndex((prev) => (prev - 1 + bundles.length) % bundles.length);
  };

  const goToNextBundle = () => {
    if (bundles.length === 0) return;
    setActiveBundleIndex((prev) => (prev + 1) % bundles.length);
  };

  const pricePer100: Record<string, number> = {
    USD: 0.45,
    MXN: 8,
    PEN: 1.6,
    EUR: 0.41,
    COP: 1500,
    CLP: 440,
    BOB: 3.9,
    BRL: 2.4,
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const getConvertedPrice = (vbucks: number) => {
    const per100 = pricePer100[currency] ?? pricePer100.USD;
    return (Number(vbucks || 0) * per100) / 100;
  };

  const getImageClass = (fitMode: "portrait" | "wide" | "balanced") => {
    if (fitMode === "portrait") {
      return "absolute -top-1 md:-top-6 right-1 md:right-4 h-[92%] md:h-[112%] w-[60%] md:w-[62%] max-w-none object-contain object-center drop-shadow-[0_18px_28px_rgba(0,0,0,0.48)]";
    }

    if (fitMode === "wide") {
      return "absolute -top-7 md:-top-14 -right-2 md:-right-8 h-[108%] md:h-[142%] w-[78%] md:w-[88%] max-w-none object-contain object-center drop-shadow-[0_20px_30px_rgba(0,0,0,0.52)]";
    }

    return "absolute -top-5 md:-top-12 -right-1 md:-right-5 h-[102%] md:h-[132%] w-[72%] md:w-[78%] max-w-none object-contain object-center drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]";
  };

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
      allSkins: "Skin Catalog",
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
      allSkins: "Catalogo de Skins",
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
      allSkins: "Catalogo de Skins",
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
        {bundles.length > 0 && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg md:text-2xl font-extrabold">
                {lang === "es" ? "Lotes de la tienda diaria" : lang === "pt" ? "Pacotes da loja diaria" : "Daily shop bundles"}
              </h2>
              <span className="text-xs md:text-sm text-white/70">
                {lang === "es" ? "Actualizacion en vivo" : lang === "pt" ? "Atualizacao ao vivo" : "Live update"}
              </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl p-0">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${activeBundleIndex * 100}%)` }}
              >
                {bundles.map((bundle) => (
                  <div key={bundle.id} className="w-full shrink-0 px-1">
                    {(() => {
                      const finalConverted = getConvertedPrice(bundle.finalPrice);
                      const regularConverted = getConvertedPrice(bundle.regularPrice);

                      return (
                    <article
                      className="relative mx-auto h-[330px] md:h-[470px] w-full overflow-hidden rounded-3xl border border-[#ffd36a]/60 shadow-[0_26px_60px_-20px_rgba(0,0,0,0.82)]"
                      style={{
                        background: `linear-gradient(180deg, ${bundle.bgFrom} 0%, ${bundle.bgVia} 52%, ${bundle.bgTo} 100%)`,
                      }}
                    >
                      <img
                        src={bundle.image}
                        alt={bundle.name}
                        className={getImageClass(bundle.fitMode)}
                      />
                      <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.28),transparent_48%)]" />
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-black/22 via-transparent to-black/14" />
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/72 via-transparent to-transparent" />

                      {bundle.regularPrice > bundle.finalPrice && (
                        <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wide text-black">
                          {Math.max(bundle.regularPrice - bundle.finalPrice, 0).toLocaleString()} pavos de descuento
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-4 pb-12 md:p-7 md:pb-7">
                        <p className="line-clamp-2 md:line-clamp-1 text-[26px] md:text-[56px] leading-[0.95] font-black text-white drop-shadow-md max-w-[64%] md:max-w-[58%]">
                          {bundle.name}
                        </p>
                        <div className="mt-2 flex items-center gap-2 md:gap-3 text-white">
                          <span className="rounded-full bg-white/20 px-3 py-1 text-[20px] md:text-[34px] leading-none font-extrabold">
                            {currency} {formatPrice(finalConverted)}
                          </span>
                          {bundle.regularPrice > bundle.finalPrice && (
                            <span className="text-[20px] md:text-[34px] leading-none font-bold text-white/80 line-through">
                              {currency} {formatPrice(regularConverted)}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm md:text-lg font-semibold text-white/90">
                          V {bundle.finalPrice.toLocaleString()}
                          {bundle.regularPrice > bundle.finalPrice && (
                            <span className="ml-2 text-white/70 line-through">
                              V {bundle.regularPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                      );
                    })()}
                  </div>
                ))}
              </div>

              {bundles.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPrevBundle}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-xl font-black text-white backdrop-blur-sm transition hover:bg-black/60"
                    aria-label="Anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={goToNextBundle}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-xl font-black text-white backdrop-blur-sm transition hover:bg-black/60"
                    aria-label="Siguiente"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-2 right-3 md:bottom-3 md:right-4 flex items-center gap-1.5 rounded-full bg-black/25 px-2 py-1 backdrop-blur-sm">
                    {bundles.map((bundle, index) => (
                      <button
                        key={`${bundle.id}-dot`}
                        type="button"
                        onClick={() => setActiveBundleIndex(index)}
                        aria-label={`Ir al lote ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all ${
                          index === activeBundleIndex ? "w-6 bg-white" : "w-2.5 bg-white/45"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/shop" className={featuredCard}>
            <div className="absolute top-2 right-3 text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
              {text.featured}
            </div>
            {text.skins}
          </Link>

          <Link href="/pavos" className={cardStyle}>{text.pavos}</Link>
          <Link href="/pavos" className={cardStyle}>{text.bundles}</Link>
          <Link href="/aquacoins" className={cardStyle}>{text.club}</Link>
          <Link href="/recharge" className={cardStyle}>{text.recharge}</Link>
          <Link href="/cuentas-bots" className={cardStyle}>{text.bots}</Link>
          <Link href="/shop" className={cardStyle}>{text.offers}</Link>
          <Link href="/cosmeticos" className={cardStyle}>{text.allSkins}</Link>
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
                <li><button onClick={() => setLangPreference("en")}>English</button></li>
                <li><button onClick={() => setLangPreference("es")}>Español</button></li>
                <li><button onClick={() => setLangPreference("pt")}>Português</button></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
