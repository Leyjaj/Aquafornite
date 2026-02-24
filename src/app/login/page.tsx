"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn.email({
        email,
        password,
        callbackURL: "/perfil",
      });
    } catch (err) {
      alert("Error iniciando sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_left,_#0774BB_0%,_#052F6F_75%,_#040A3F_100%)] text-white px-4">
      <div className="w-full max-w-sm bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">

        <h1 className="text-2xl font-bold text-center mb-6">
          Iniciar sesión
        </h1>

        {/* LOGIN EMAIL */}
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered bg-white/10 border-white/20 text-white placeholder-white/50"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered bg-white/10 border-white/20 text-white placeholder-white/50"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="btn border-0 bg-[#0B84D8] hover:bg-[#0A73BD] text-white mt-2"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="divider text-white/40">o</div>

        {/* DISCORD LOGIN */}
        <a
          href="/api/auth/signin/discord"
          className="btn w-full border-0 bg-[#5865F2] hover:bg-[#4c58d6] text-white"
        >
          Continue with Discord
        </a>

        {/* REGISTER LINK */}
        <p className="text-center text-sm mt-4 text-white/70">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-[#4FB8FF]">
            Crear cuenta
          </Link>
        </p>

      </div>
    </main>
  );
}