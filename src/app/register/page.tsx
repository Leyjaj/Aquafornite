"use client";

import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <SignUp path="/register" routing="path" signInUrl="/login" />
    </main>
  );
}
