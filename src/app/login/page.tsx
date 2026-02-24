"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);

  async function handleLogin(e:any){
    e.preventDefault();
    setLoading(true);

    try {

      await signIn.email({
        email,
        password,
        callbackURL:"/perfil"
      });

    } catch(err){
      console.log(err);
      alert("Error al iniciar sesión");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
      >

        <h1 className="text-2xl font-bold text-center mb-4">
          Iniciar sesión
        </h1>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="input input-bordered w-full mb-3"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="input input-bordered w-full mb-4"
        />

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Entrar"}
        </button>

        <div className="divider">o</div>

        <button
          type="button"
          onClick={()=>signIn.social({provider:"discord"})}
          className="btn w-full bg-[#5865F2] text-white"
        >
          Continue with Discord
        </button>

      </form>
    </main>
  );
}