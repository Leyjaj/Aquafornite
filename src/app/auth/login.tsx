import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <SignIn path="/auth/sign-in" routing="path" signUpUrl="/auth/sign-up" />
    </main>
  );
}