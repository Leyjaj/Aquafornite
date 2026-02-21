"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function crearCuenta() {
    const res = await authClient.signUp.email({
      email,
      password,
      name: "AquaUser",
    });

    if (res?.data?.user) {
      // 🔥 login automático después de crear cuenta
      await authClient.signIn.email({
        email,
        password,
      });

      router.push("/perfil");
    } else {
      alert("Error creando cuenta");
    }
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-screen">
      <input
        placeholder="correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input input-bordered"
      />

      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input input-bordered"
      />

      <button onClick={crearCuenta} className="btn btn-primary">
        Crear cuenta
      </button>
    </div>
  );
}