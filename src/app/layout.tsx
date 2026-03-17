import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${SpaceGrotesk.variable} antialiased bg-[#0A1F44] text-white`}
      >
        <UserProvider>
          <CurrencyProvider>

            {/* NAVBAR */}
            <Header />

            {/* CONTENT */}
            <main className="pt-24">
              {children}
            </main>

          </CurrencyProvider>
        </UserProvider>
      </body>
    </html>
  );
}