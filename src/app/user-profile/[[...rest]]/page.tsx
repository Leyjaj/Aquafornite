'use client'

import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
  return (
    <main className="min-h-screen px-4 py-24">
      <div className="mx-auto flex max-w-5xl justify-center">
        <UserProfile path="/user-profile" routing="path" />
      </div>
    </main>
  );
}
