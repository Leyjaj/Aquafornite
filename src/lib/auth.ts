import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { nextCookies } from "better-auth/next-js";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      discordName: {
        type: "string",
        required: false,
      },
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
      permissions: 2048 | 16384,
      mapProfileToUser: async (profile) => {
        return {
          discordId: profile.id,
          discordName: profile.username ?? "NO_USERNAME",
        };
      },
    },
  },

  plugins: [nextCookies()],
});
