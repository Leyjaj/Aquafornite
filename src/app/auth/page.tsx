import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function AuthPage() {
  const incomingHeaders = await headers();
  const hh = new Headers();

  incomingHeaders.forEach((value, key) => {
    hh.set(key, value);
  });

  const session = await auth.api.getSession({
    headers: hh,
  });

  // ✅ SOLO si ya tiene sesión
  if (session) {
    redirect("/perfil");
  }

  // ⚠️ IMPORTANTE:
  // NO redirigimos a /login
  // better-auth se encarga solo

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading auth...</p>
    </div>
  );
}