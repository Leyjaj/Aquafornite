// src/app/wishlist/page.tsx

'use client';

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { showToast } from "nextjs-toast-notify";

interface WishlistItem {
  id: string;
  skinId: string;
  name: string;
  image: string;
  price: number;
}

export default function WishlistPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [availableTodayIds, setAvailableTodayIds] = useState<Set<string>>(new Set());
  const [nextRotationAt, setNextRotationAt] = useState<Date | null>(null);
  const [nowTs, setNowTs] = useState<number>(Date.now());
  const [isFetching, setIsFetching] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "price_desc" | "price_asc" | "name_asc">("latest");

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setIsFetching(true);
      fetch("/api/wishlist")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setWishlist(Array.isArray(data) ? data : []))
        .finally(() => setIsFetching(false));

      fetch("/api/shop/available")
        .then((res) => (res.ok ? res.json() : { ids: [] }))
        .then((data) => {
          const ids = new Set<string>(
            Array.isArray(data?.ids)
              ? data.ids.map((id: unknown) => String(id)).filter(Boolean)
              : []
          );
          setAvailableTodayIds(ids);

          if (data?.nextRotation) {
            setNextRotationAt(new Date(String(data.nextRotation)));
          }
        })
        .catch(() => {
          setAvailableTodayIds(new Set());
          setNextRotationAt(null);
        });
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTs(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeToRotation = useMemo(() => {
    if (!nextRotationAt) return null;

    const diffMs = nextRotationAt.getTime() - nowTs;
    if (diffMs <= 0) return "Actualizando tienda...";

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
  }, [nextRotationAt, nowTs]);

  const removeItem = async (skinId: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skinId }),
      });

      if (!res.ok) {
        showToast.error("No se pudo eliminar de la wishlist", {
          duration: 2500,
          position: "top-right",
        });
        return;
      }

      setWishlist((prev) => prev.filter((item) => item.skinId !== skinId));
      showToast.success("Eliminado de wishlist", {
        duration: 1800,
        position: "top-right",
      });
    } catch {
      showToast.error("Error de red al eliminar", {
        duration: 2500,
        position: "top-right",
      });
    }
  };

  const filteredWishlist = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = query
      ? wishlist.filter((item) => item.name.toLowerCase().includes(query))
      : wishlist;

    const items = [...filtered];

    if (sortBy === "price_desc") items.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (sortBy === "price_asc") items.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sortBy === "name_asc") items.sort((a, b) => a.name.localeCompare(b.name));

    return items;
  }, [wishlist, search, sortBy]);

  const totalVbucks = useMemo(
    () => filteredWishlist.reduce((acc, item) => acc + (item.price ?? 0), 0),
    [filteredWishlist]
  );

  // Verificamos si la sesión está cargada
  if (!isLoaded) {
    return <div className="min-h-screen grid place-items-center text-white">Cargando...</div>;
  }

  // Verificamos si no hay usuario logeado
  if (!isSignedIn || !user) {
    return (
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_left,_#0774BB_0%,_#052F6F_75%,_#040A3F_100%)] px-4 py-20 text-white">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/15 bg-black/25 p-6 text-center backdrop-blur-md">
          <h1 className="text-2xl font-bold">Inicia sesión para ver tu wishlist</h1>
          <p className="mt-2 text-white/75">Guarda skins favoritas y compártelas luego.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_left,_#0d3a7d_0%,_#0a2f67_45%,_#061534_100%)] px-3 pb-10 pt-24 text-white md:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur-md md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/25 bg-white/10">
                {user.imageUrl ? (
                  <Image src={user.imageUrl} alt={user.fullName ?? "user"} fill className="object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-lg font-bold">
                    {user.firstName?.charAt(0) ?? "A"}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-xl font-extrabold uppercase tracking-wide md:text-3xl">Mi Wishlist</h1>
                <p className="text-sm text-white/75">Organiza tus skins favoritas para comprarlas después.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/shop" className="btn btn-sm md:btn-md btn-primary">
                Ir a la tienda
              </Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
              <p className="text-[11px] uppercase text-white/65">Items</p>
              <p className="text-lg font-bold">{filteredWishlist.length}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
              <p className="text-[11px] uppercase text-white/65">Total</p>
              <p className="text-lg font-bold">{totalVbucks.toLocaleString()} V-Bucks</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 col-span-2 md:col-span-1">
              <p className="text-[11px] uppercase text-white/65">Disponibles hoy</p>
              <p className="text-lg font-bold">
                {
                  filteredWishlist.filter((item) => availableTodayIds.has(String(item.skinId))).length
                }
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 col-span-2 md:col-span-1">
              <p className="text-[11px] uppercase text-white/65">Proxima rotacion</p>
              <p className="text-lg font-bold">{timeToRotation || "--:--:--"}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 md:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder="Buscar en wishlist..."
              className="input input-sm md:input-md w-full border-white/15 bg-black/35 text-white placeholder:text-white/50"
            />

            <select
              className="select select-sm md:select-md border-white/15 bg-black/35 text-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="latest">Más recientes</option>
              <option value="price_desc">Mayor precio</option>
              <option value="price_asc">Menor precio</option>
              <option value="name_asc">Nombre A-Z</option>
            </select>
          </div>
        </section>

        {isFetching ? (
          <div className="mt-6 rounded-2xl border border-white/15 bg-black/20 p-8 text-center text-white/80">
            Cargando wishlist...
          </div>
        ) : filteredWishlist.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/15 bg-black/20 p-8 text-center">
            <h2 className="text-xl font-semibold">No tienes items guardados</h2>
            <p className="mt-2 text-white/75">Toca el corazón en la tienda para añadir skins.</p>
          </div>
        ) : (
          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredWishlist.map((item) => (
              <article
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/15 bg-black/30 shadow-[0px_10px_30px_-18px_rgba(0,0,0,0.9)]"
              >
                <button
                  onClick={() => removeItem(item.skinId)}
                  className="btn btn-circle btn-xs absolute right-2 top-2 z-20 border-none bg-black/55 text-red-400 hover:bg-black/75"
                  aria-label={`Eliminar ${item.name}`}
                >
                  ❤
                </button>

                {availableTodayIds.has(String(item.skinId)) && (
                  <span className="badge badge-success absolute left-2 top-2 z-20 border-none">
                    Disponible hoy
                  </span>
                )}

                <div className="relative h-full w-full">
                  <Image
                    src={item.image || "/images/img.png"}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-2 pb-2 pt-8">
                  <h3 className="truncate text-xs font-semibold md:text-sm">{item.name}</h3>
                  <p className="text-[11px] text-white/80 md:text-xs">{(item.price ?? 0).toLocaleString()} V-Bucks</p>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
