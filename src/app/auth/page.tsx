import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function AuthPage() {

  // 👇 Next 15 FIX
  const incomingHeaders = await headers();
  const hh = new Headers();

  incomingHeaders.forEach((value, key) => {
    hh.set(key, value);
  });

  const session = await auth.api.getSession({
    headers: hh,
  });

  if (session) {
    redirect("/perfil");
  }

  redirect("/login");
}