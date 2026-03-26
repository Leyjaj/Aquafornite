// src/app/wishlist/page.tsx

'use client';

import { useEffect, useState } from "react";
import { useSession } from "@clerk/nextjs";
import Image from "next/image";

export default function WishlistPage() {
  const { isLoaded, user } = useSession(); // Esto se asegura de que useSession se haya cargado
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (isLoaded && user) {
      fetch("/api/wishlist")
        .then((res) => res.json())
        .then((data) => setWishlist(data));
    }
  }, [isLoaded, user]);

  // Verificamos si la sesión está cargada
  if (!isLoaded) {
    return <div>Cargando...</div>;
  }

  // Verificamos si no hay usuario logeado
  if (!user) {
    return <div>Por favor, inicia sesión para ver tu wishlist.</div>;
  }

  return (
    <div className="wishlist-page">
      <h1>Mi Wishlist</h1>
      {wishlist.length === 0 ? (
        <p>No tienes items guardados.</p>
      ) : (
        <div className="wishlist-items">
          {wishlist.map((item) => (
            <div key={item.id} className="wishlist-item">
              <Image
                src={item.image}
                alt={item.name}
                width={100}
                height={100}
              />
              <div>
                <h3>{item.name}</h3>
                <p>{item.price} V-Bucks</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}