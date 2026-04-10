import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Función para obtener los detalles de una skin desde la API de Fortnite
async function fetchSkinDetails(skinId: string) {
  try {
    const response = await fetch(`https://fortnite-api.com/api/v1/cosmetics/br/${skinId}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data || !data.data) return null;

    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// GET → Obtener wishlist del usuario
export async function GET() {
  const { userId } = await auth();

  if (!userId) return new Response("No autorizado", { status: 401 });

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: `${userId}@temp.com`,
        aquacoins: 100,
      },
    });
  }

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: user.id },
  });

  return Response.json(wishlist);
}

// POST → Añadir un nuevo item a la wishlist
export async function POST(req: Request) {
  const { userId } = await auth();
  const body = await req.json();  // Obtén los datos de la solicitud

  if (!userId) return new Response("No autorizado", { status: 401 });

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: `${userId}@temp.com`,
        aquacoins: 100,
      },
    });
  }

  // Validamos que los campos necesarios estén presentes
  if (!body.skinId || !body.name || body.price === undefined || body.price === null) {
    return new Response("Faltan datos para guardar en la wishlist", { status: 400 });
  }

  try {
    const skinDetails = await fetchSkinDetails(body.skinId);
    const skinPrice = Number(body.price);

    await prisma.wishlist.upsert({
      where: {
        userId_skinId: {
          userId: user.id,
          skinId: body.skinId,
        },
      },
      create: {
        userId: user.id,
        skinId: body.skinId,
        name: skinDetails?.name || body.name,
        image:
          skinDetails?.images?.icon ||
          skinDetails?.images?.smallIcon ||
          body.image ||
          "",
        price: Number.isFinite(skinPrice) ? Math.round(skinPrice) : 0,
      },
      update: {
        name: skinDetails?.name || body.name,
        image:
          skinDetails?.images?.icon ||
          skinDetails?.images?.smallIcon ||
          body.image ||
          "",
        price: Number.isFinite(skinPrice) ? Math.round(skinPrice) : 0,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return new Response("Error al guardar en la wishlist", { status: 400 });
  }
}

// DELETE → Eliminar un item de la wishlist
export async function DELETE(req: Request) {
  const { userId } = await auth();
  const body = await req.json();  // Obtén los datos de la solicitud

  if (!userId) return new Response("No autorizado", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) return new Response("Usuario no encontrado", { status: 404 });

  // Verifica que el campo `skinId` esté presente
  if (!body.skinId) {
    return new Response("El campo skinId es obligatorio", { status: 400 });
  }

  await prisma.wishlist.delete({
    where: {
      userId_skinId: {
        userId: user.id,
        skinId: body.skinId,  // Eliminar con el skinId
      },
    },
  });

  return Response.json({ ok: true });
}
