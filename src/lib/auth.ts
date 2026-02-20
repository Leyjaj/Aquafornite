import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { nextCookies } from "better-auth/next-js";

/**
 * 🔥 IMPORTANTE:
 * Esto evita que Vercel cree 20 conexiones nuevas
 * y evita crashes en producción.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
  },

  /**
   * 🔥 SOLO campos que existen en tu schema prisma
   * NO agregamos cosas extras que rompen el bundle.
   */
  user: {
    additionalFields: {
      discordId: {
        type: "string",
        required: false,
      },
    },
  },

  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,

      /**
       * 🔥 Mapear perfil → DB
       */
      mapProfileToUser: async (profile) => {
        return {
          discordId: profile.id,
        };
      },
    },
  },

  plugins: [nextCookies()],
});