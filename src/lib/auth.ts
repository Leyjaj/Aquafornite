import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from '@prisma/client/edge'
import { nextCookies } from "better-auth/next-js"
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaD1 } from "@prisma/adapter-d1";

const prisma = new PrismaClient()

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
  },

  user:{
    additionalFields:{
      discord_name:{
        type:"string",
        required:false,
      }
    }
  },

  account:{
    additionalFields:{
      global_name:{
        type:"string",
        required:false,
      }
    }
  },

  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      permissions: 2048 | 16384,

      // 🔥 AQUÍ TAMBIÉN ARREGLADO
      mapProfileToUser: async (profile) => {        
        return {
          discordId: profile.id,        // ✅ ANTES: discord_id
          discord_name: profile.username || "NO ES USERNAME"
        }
      }
    },
  },

  plugins: [nextCookies()],  

  databaseHooks:{
    account:{
      update:{
        after:async (account)=>{
          if(account.id){
            await prisma.user.update({
              where: { id: account.userId },
              data:{
                discordId: account.accountId,   // ✅ ANTES: discord_id
              }
            })
          }
        }
      }
    }
  }
});
