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

    if (browserLang.startsWith("pt-BR")) {
      setLang("pt-BR");
    } else if (browserLang === "es-ES") {
      setLang("es-ES");
    } else if (browserLang.startsWith("es")) {
      setLang("es-LATAM");
    } else {
      setLang("en");
    }
  }, []);

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

          <Link href="/cart" className="btn btn-ghost btn-sm text-white hover:bg-white/10">
            🛒
          </Link>

          {!session && (
            <Link
              href="/login"
              className="btn btn-sm border-0 bg-[#5865F2] hover:bg-[#4c58d6] text-white"
            >
              {lang === "pt-BR" && "Entrar"}
              {lang === "es-LATAM" && "Iniciar sesión"}
              {lang === "es-ES" && "Iniciar sesión"}
              {lang === "en" && "Sign in"}
            </Link>
          )}

          {session && (
            <Link
              href="/perfil"
              className="btn btn-sm border-0 bg-[#10B3C7] hover:bg-[#0EA2B4] text-white"
            >
              {lang === "pt-BR" && "Perfil"}
              {lang === "es-LATAM" && "Perfil"}
              {lang === "es-ES" && "Perfil"}
              {lang === "en" && "Profile"}
            </Link>
          )}

          <Link
            href="/shop"
            className="btn btn-sm border-0 bg-[#0B84D8] hover:bg-[#0A73BD] text-white"
          >
            {lang === "pt-BR" && "Ir para loja"}
            {lang === "es-LATAM" && "Ir a la tienda"}
            {lang === "es-ES" && "Ir a la tienda"}
            {lang === "en" && "Go to shop"}
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="px-4 pt-24 flex-1">
        <div className="mx-auto max-w-6xl py-10 md:py-14">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            {lang === "pt-BR" && "Compre skins e recarregue V-Bucks rápido e seguro"}
            {lang === "es-LATAM" && "Compra skins y recarga pavos rápido y seguro"}
            {lang === "es-ES" && "Compra skins y recarga pavos rápido y seguro"}
            {lang === "en" && "Buy skins and recharge V-Bucks fast and safe"}
          </h1>

          <p className="mt-4 text-white/70">
            {lang === "pt-BR" && "Sistema seguro conectado com sessão ativa."}
            {lang === "es-LATAM" && "Sistema seguro conectado con sesión activa."}
            {lang === "es-ES" && "Sistema seguro conectado con sesión activa."}
            {lang === "en" && "Secure system connected with active session."}
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#040A3F] border-t border-white/10 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="text-white/60 text-sm">
            © 2026 Aquafornais
          </div>

          <div className="dropdown dropdown-top">
            <button className="btn btn-sm bg-white/10 border-0 text-white hover:bg-white/20">
              🌎 {lang}
            </button>
            <ul className="dropdown-content menu p-2 shadow bg-[#0b1c3f] rounded-box w-48 text-white">
              <li><button onClick={() => setLang("en")}>🇺🇸 English</button></li>
              <li><button onClick={() => setLang("pt-BR")}>🇧🇷 Português (Brasil)</button></li>
              <li><button onClick={() => setLang("es-LATAM")}>🇲🇽 Español (Latam)</button></li>
              <li><button onClick={() => setLang("es-ES")}>🇪🇸 Español (España)</button></li>
            </ul>
          </div>

        </div>
      </footer>

    </main>
  );
}