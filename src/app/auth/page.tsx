import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  // 🔥 Next 15 headers async
  const h = await headers();

  const hh = new Headers();
  h.forEach((v, k) => hh.set(k, v));

  const session = await auth.api.getSession({
    headers: hh,
  });

  if (session) {
    redirect("/perfil");
  }

  return (
    <div>
      {/* Tu UI actual aquí */}
    </div>
  );
}