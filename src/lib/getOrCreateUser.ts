import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getOrCreateUser() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        email: `${clerkId}@temp.com`,
        aquacoins: 100,
      },
    });
  }

  return user;
}
