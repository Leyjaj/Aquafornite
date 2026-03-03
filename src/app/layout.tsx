import type { Metadata } from "next";
import {  Space_Grotesk } from "next/font/google";
import { signOut, useSession } from "@/lib/auth-client";
import "./globals.css";
import { UserProvider } from "@/hooks/useUser";
import { CurrencyProvider } from "@/hooks/useCurrency";

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
}: Readonly<{
  children: React.ReactNode;
}>) {

  
  return (
    
      
      <html lang="en" suppressHydrationWarning={true}   >
        <body
          className={`${SpaceGrotesk.variable}  antialiased`}
        >                 

            <UserProvider>
                <CurrencyProvider>
                {children}    
                </CurrencyProvider>
            </UserProvider>      
        </body>
      </html>
      
    
  );
}
