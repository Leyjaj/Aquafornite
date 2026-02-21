import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function AuthPage() {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  // ✅ Si tiene sesión → perfil
  if (session) {
    redirect("/perfil");
  }

  // ✅ Si NO tiene sesión → login
  redirect("/login");
}