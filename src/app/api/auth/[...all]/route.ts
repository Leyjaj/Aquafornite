import { auth } from "@/lib/auth";

/**
 * ❌ NO EDGE
 * Edge rompe prisma y hace crecer el bundle.
 */
export const runtime = "nodejs";

export const GET = auth.handler;
export const POST = auth.handler;