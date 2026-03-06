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
  description: "uwu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${SpaceGrotesk.variable} antialiased bg-[#0A1F44]`}>
        <UserProvider>
          <CurrencyProvider>

            <Header />

            <div className="pt-24">
              {children}
            </div>

          </CurrencyProvider>
        </UserProvider>
      </body>
    </html>
  );
}