"use client";

import { ClerkFailed, ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <ClerkLoading>
        <div className="text-white/80">Cargando registro...</div>
      </ClerkLoading>

      <ClerkLoaded>
        <SignUp routing="path" path="/register" signInUrl="/login" />
      </ClerkLoaded>

      <ClerkFailed>
        <div className="max-w-md rounded-xl border border-red-400/40 bg-red-950/40 p-4 text-sm text-red-100">
          No se pudo cargar el registro. Revisa las variables de Clerk en Vercel (Production) y que el dominio este agregado en Clerk.
        </div>
      </ClerkFailed>
    </main>
  );
}
