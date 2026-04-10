"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <SignIn routing="path" path="/login" signUpUrl="/register" />
    </main>
  );
}
