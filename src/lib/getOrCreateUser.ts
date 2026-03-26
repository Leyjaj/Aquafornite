import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getOrCreateUser() {
  const { userId: clerkId } = auth();

  if (!clerkId) return null;

  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        email: `${clerkId}@temp.com`,
      },
    });
  }

  return user;
}