import Skins from '@/components/Skins';
import { getSkins } from "@/lib/getSkins";

export default async function Shop() {
  const { skins, categories } = await getSkins();

  // Recuperamos Fortnite ID y Nickname desde localStorage
  const fortniteId = typeof window !== 'undefined' ? localStorage.getItem('fortniteId') : null;
  const nickname = typeof window !== 'undefined' ? localStorage.getItem('nickname') : null;

  // Verifica si tenemos ambos valores
  if (fortniteId && nickname) {
    // Lógica para proceder con la compra rápida, o directamente al checkout
    console.log('Fortnite ID:', fortniteId);
    console.log('Nickname:', nickname);

    // Se podría añadir la lógica de checkout aquí, como redirigir al usuario con el Fortnite ID y Nickname
  }

  return (
    <div>
      <Skins skins={skins} categories={categories} />
    </div>
  );
}