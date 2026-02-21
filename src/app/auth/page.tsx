import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/perfil");
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading auth...</p>
    </div>
  );
}