export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <a
        href="/api/auth/signin/discord"
        className="btn btn-primary"
      >
        Continue with Discord
      </a>
    </main>
  );
}