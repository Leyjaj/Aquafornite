import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Asegúrate de que se protejan las rutas de usuario autenticado
    '/perfil', // Puedes cambiar esta ruta según tus necesidades
    '/shop',   // Otras rutas protegidas
    // Puedes añadir más rutas a continuación si lo deseas
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};