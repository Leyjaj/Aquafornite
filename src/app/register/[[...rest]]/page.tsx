"use client";

import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <SignUp routing="path" path="/register" signInUrl="/login" />
    </main>
  );
}
