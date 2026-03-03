import { withClerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Esto aplica el middleware de Clerk a las rutas de autenticación
export default withClerkMiddleware(() => NextResponse.next());

// Configuración del matcher para proteger las rutas relacionadas con autenticación
export const config = {
  matcher: ['/api/auth/(.*)', '/auth/(.*)'], // Proteger todas las rutas relacionadas con auth
};