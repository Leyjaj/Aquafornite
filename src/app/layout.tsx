import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";

import { UserProvider } from "@/hooks/useUser";
import { CurrencyProvider } from "@/hooks/useCurrency";
import Header from "@/components/Header";

const SpaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aquafornais",
  description: "Aquafornais Fortnite Store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${SpaceGrotesk.variable} antialiased bg-[#0A1F44] text-white`}
        >
          <UserProvider>
            <CurrencyProvider>

              <Header />

              <main className="pt-24">
                {children}
              </main>

            </CurrencyProvider>
          </UserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}