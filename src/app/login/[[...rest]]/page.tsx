"use client";

import { ClerkFailed, ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <ClerkLoading>
        <div className="text-white/80">Cargando inicio de sesion...</div>
      </ClerkLoading>

      <ClerkLoaded>
        <SignIn routing="path" path="/login" signUpUrl="/register" />
      </ClerkLoaded>

      <ClerkFailed>
        <div className="max-w-md rounded-xl border border-red-400/40 bg-red-950/40 p-4 text-sm text-red-100">
          No se pudo cargar el login. Revisa las variables de Clerk en Vercel (Production) y que el dominio este agregado en Clerk.
        </div>
      </ClerkFailed>
    </main>
  );
}
