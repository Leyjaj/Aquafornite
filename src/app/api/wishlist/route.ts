import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Función para obtener los detalles de una skin desde la API de Fortnite
async function fetchSkinDetails(skinId: string) {
  try {
    // Hacemos la solicitud a la API de Fortnite para obtener los detalles de la skin
    const response = await fetch(`https://fortnite-api.com/api/v1/cosmetics/br/${skinId}`);
    const data = await response.json();
    
    if (!data || !data.data) {
      throw new Error('No se encontraron datos para esta skin.');
    }

    return data.data;  // Devolver la información de la skin
  } catch (error) {
    console.error(error);
    throw new Error('Error al obtener los detalles de la skin desde la API de Fortnite.');
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
      },
    });
  }

  // Validamos que los campos necesarios estén presentes
  if (!body.skinId || !body.name || !body.price) {
    return new Response("Faltan datos para guardar en la wishlist", { status: 400 });
  }

  try {
    // Obtener detalles de la skin usando la API de Fortnite
    const skinDetails = await fetchSkinDetails(body.skinId); 

    await prisma.wishlist.create({
      data: {
        userId: user.id,
        skinId: body.skinId,  // Asegúrate de pasar skinId correctamente
        name: skinDetails.name || body.name,  // Usar nombre de la API o el que pasa el cliente
        image: skinDetails.image || body.image || "",  // Si no hay imagen, dejamos vacío
        price: skinDetails.price || body.price,  // Usar precio de la API o el que pasa el cliente
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