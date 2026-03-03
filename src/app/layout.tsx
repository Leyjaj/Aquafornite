// src/app/layout.tsx

import { ClerkProvider } from '@clerk/nextjs';
import { Space_Grotesk } from 'next/font/google';
import { UserProvider } from '@/hooks/useUser';
import { CurrencyProvider } from '@/hooks/useCurrency';
import { clerkClient } from '@/lib/auth-client'; // Asegúrate de importar el cliente Clerk si lo necesitas

const SpaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider client={clerkClient}>
      <html lang="en">
        <body className={`${SpaceGrotesk.variable} antialiased`}>
          <UserProvider>
            <CurrencyProvider>
              {children}
            </CurrencyProvider>
          </UserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}