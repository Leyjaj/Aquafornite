import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET,

  /**
   * 🔥 ACTIVA EMAIL + PASSWORD CORRECTAMENTE
   */
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  /**
   * 🔥 IMPORTANTE
   * BetterAuth necesita saber cómo guardar credenciales
   */
  credential: {
    enabled: true,
  },

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

      mapProfileToUser: async (profile) => {
        return {
          discordId: profile.id,
        };
      },
    },
  },

  plugins: [nextCookies()],
});