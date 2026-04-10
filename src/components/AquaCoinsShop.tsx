'use client'

import { useEffect, useMemo, useState } from "react";
import { showToast } from "nextjs-toast-notify";
import { useUser } from "@/hooks/useUser";
import type { SkinWithDiscount } from "@/interfaces/skin.interface";

type ShopItem = {
  id: string;
  name: string;
  image: string;
  category: string;
  vbucks: number;
};

export default function AquaCoinsShop({ skins }: { skins: SkinWithDiscount[] }) {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [balance, setBalance] = useState<number>(user?.aquacoins ?? 0);
  const [cart, setCart] = useState<ShopItem[]>([]);
  const [epicInput, setEpicInput] = useState("");
  const [epicId, setEpicId] = useState("");
  const [epicName, setEpicName] = useState("");
  const [isResolvingEpic, setIsResolvingEpic] = useState(false);

  useEffect(() => {
    setBalance(user?.aquacoins ?? 0);
  }, [user?.aquacoins]);

  useEffect(() => {
    const savedId = localStorage.getItem("fortniteId") || "";
    const savedName = localStorage.getItem("nickname") || "";
    setEpicId(savedId);
    setEpicName(savedName);
    setEpicInput(savedName || savedId);
  }, []);

  const handleEpicSave = async () => {
    const value = epicInput.trim();

    if (!value) {
      showToast.info("Ingresa tu usuario o ID de Epic", {
        duration: 2500,
        position: "top-right",
      });
      return;
    }

    const looksLikeId = /^[a-f0-9]{32}$/i.test(value);

    if (looksLikeId) {
      localStorage.setItem("fortniteId", value);
      localStorage.setItem("nickname", epicName || value);
      setEpicId(value);
      if (!epicName) setEpicName(value);
      showToast.success("ID de Epic guardado", {
        duration: 1800,
        position: "top-right",
      });
      return;
    }

    try {
      setIsResolvingEpic(true);
      const res = await fetch(`/api/epic/resolve?name=${encodeURIComponent(value)}`);
      const data = await res.json();

      if (!res.ok || !data?.id) {
        showToast.error(data?.error || "No se pudo resolver la cuenta", {
          duration: 2500,
          position: "top-right",
        });
        return;
      }

      localStorage.setItem("fortniteId", data.id);
      localStorage.setItem("nickname", data.name || value);
      setEpicId(data.id);
      setEpicName(data.name || value);
      setEpicInput(data.name || value);
      showToast.success("Cuenta de Epic vinculada", {
        duration: 1800,
        position: "top-right",
      });
    } catch {
      showToast.error("Error de red al validar cuenta", {
        duration: 2500,
        position: "top-right",
      });
    } finally {
      setIsResolvingEpic(false);
    }
  };

  const items = useMemo<ShopItem[]>(() => {
    return skins
      .map((skin) => {
        const id = String(skin?.brItems?.[0]?.id ?? skin?.mainId ?? skin?.newDisplayAsset?.cosmeticId ?? "");
        const name =
          skin?.bundle?.name ||
          skin?.brItems?.[0]?.name ||
          skin?.displayName ||
          skin?.tracks?.[0]?.title ||
          "Cosmetico";
        const image =
          skin?.newDisplayAsset?.renderImages?.[0]?.image ||
          skin?.bundle?.image ||
          skin?.imageUrl ||
          skin?.tracks?.[0]?.albumArt ||
          "";
        const category = skin?.layout?.name || "General";
        const vbucks = Math.floor(Number(skin?.finalPrice ?? 0));

        return { id, name, image, category, vbucks };
      })
      .filter((item) => item.id && item.image && item.vbucks > 0);
  }, [skins]);

  const categories = useMemo(() => {
    const set = new Set(items.map((item) => item.category));
    return ["Todos", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const okCategory = selectedCategory === "Todos" || item.category === selectedCategory;
      const okSearch = !q || item.name.toLowerCase().includes(q);
      return okCategory && okSearch;
    });
  }, [items, selectedCategory, search]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, ShopItem[]>();

    for (const item of filtered) {
      const key = item.category || "General";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }

    return Array.from(groups.entries());
  }, [filtered]);

  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.vbucks, 0),
    [cart]
  );

  const canCheckout = cart.length > 0 && balance >= cartTotal && !isCheckingOut;

  const addToCart = (item: ShopItem) => {
    setCart((prev) => {
      if (prev.some((existing) => existing.id === item.id)) {
        showToast.info("Ese cosmetico ya esta en tu carrito AQ", {
          duration: 1800,
          position: "top-right",
        });
        return prev;
      }

      return [...prev, item];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleCheckout = async () => {
    if (!user?.id) {
      showToast.info("Inicia sesion para comprar con AquaCoins", {
        duration: 2500,
        position: "top-right",
      });
      return;
    }

    if (cart.length === 0) {
      showToast.info("Agrega cosmeticos al carrito AQ", {
        duration: 2200,
        position: "top-right",
      });
      return;
    }

    if (!epicId) {
      showToast.info("Guarda primero tu cuenta de Epic", {
        duration: 2500,
        position: "top-right",
      });
      return;
    }

    if (balance < cartTotal) {
      showToast.error("Saldo insuficiente de AquaCoins", {
        duration: 2500,
        position: "top-right",
      });
      return;
    }

    try {
      setIsCheckingOut(true);
      const res = await fetch("/api/aquacoins-shop/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          epicAccountId: epicId,
          epicNickname: epicName,
          items: cart.map((item) => ({
            itemId: item.id,
            itemName: item.name,
            vbucksPrice: item.vbucks,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast.error(data?.error || "No se pudo completar la compra", {
          duration: 2500,
          position: "top-right",
        });
        return;
      }

      setBalance(Number(data?.balance ?? 0));
      showToast.success(`Compra completada con AquaCoins: ${cart.length} items`, {
        duration: 2500,
        position: "top-right",
      });
      setCart([]);
    } catch {
      showToast.error("Error de red al comprar", {
        duration: 2500,
        position: "top-right",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_left,_#0d3a7d_0%,_#0a2f67_45%,_#061534_100%)] px-3 pb-10 pt-24 text-white md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur-md md:p-6">
          <h1 className="text-xl md:text-3xl font-extrabold uppercase tracking-wide">Tienda AquaCoins</h1>
          <p className="mt-1 text-white/75 text-sm">Compra cosmeticos usando solo tu saldo de AquaCoins.</p>

          <div className="mt-3 rounded-xl border border-white/15 bg-black/25 p-3">
            <p className="text-sm font-semibold">Cuenta destino para regalos</p>
            <div className="mt-2 flex flex-col md:flex-row gap-2">
              <input
                value={epicInput}
                onChange={(e) => setEpicInput(e.target.value)}
                type="text"
                placeholder="Usuario o ID de Epic Games"
                className="input input-sm md:input-md w-full border-white/15 bg-black/35 text-white placeholder:text-white/50"
              />
              <button
                type="button"
                onClick={handleEpicSave}
                disabled={isResolvingEpic}
                className="btn btn-sm btn-primary"
              >
                {isResolvingEpic ? "Validando..." : "Guardar cuenta"}
              </button>
            </div>
            {epicId && (
              <p className="text-xs text-white/80 mt-2">
                Cuenta activa: <span className="font-semibold">{epicName || "Sin nombre"}</span> ({epicId})
              </p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
              <p className="text-[11px] uppercase text-white/65">Saldo</p>
              <p className="text-lg font-bold">{balance.toLocaleString()} AQ</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
              <p className="text-[11px] uppercase text-white/65">Items</p>
              <p className="text-lg font-bold">{filtered.length}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
              <p className="text-[11px] uppercase text-white/65">Carrito AQ</p>
              <p className="text-lg font-bold">{cart.length} items</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
              <p className="text-[11px] uppercase text-white/65">Total carrito</p>
              <p className="text-lg font-bold">{cartTotal.toLocaleString()} AQ</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 md:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder="Buscar cosmetico..."
              className="input input-sm md:input-md w-full border-white/15 bg-black/35 text-white placeholder:text-white/50"
            />

            <select
              className="select select-sm md:select-md border-white/15 bg-black/35 text-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 rounded-xl border border-white/15 bg-black/30 p-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold">Checkout AquaCoins</p>
                <p className="text-xs text-white/70">Compra tus skins seleccionadas usando solo saldo AQ.</p>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={!canCheckout}
                className="btn btn-success btn-sm"
              >
                {isCheckingOut ? "Procesando..." : "Comprar carrito AQ"}
              </button>
            </div>

            {cart.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {cart.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="badge badge-outline badge-info gap-2 py-3"
                  >
                    {item.name} ({item.vbucks} AQ)
                    <span>×</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {groupedItems.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-white/15 bg-black/20 p-6 text-center text-white/75">
            No se encontraron cosméticos con esos filtros.
          </section>
        ) : (
          <section className="mt-6 space-y-5">
            {groupedItems.map(([groupName, groupItems]) => (
              <div key={groupName} className="rounded-2xl border border-white/10 bg-black/20 p-3 md:p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-white md:text-base">{groupName}</h2>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/80 md:text-xs">
                    {groupItems.length} items
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
                  {groupItems.map((item) => {
                    const isInCart = cart.some((cartItem) => cartItem.id === item.id);
                    return (
                      <article
                        key={item.id}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-white/15 bg-black/30 shadow-[0px_10px_30px_-18px_rgba(0,0,0,0.9)]"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-2 pb-2 pt-8">
                          <h3 className="truncate text-xs font-semibold md:text-sm">{item.name}</h3>
                          <p className="text-[11px] text-white/80 md:text-xs">{item.vbucks.toLocaleString()} AQ</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          disabled={isInCart}
                          className="btn btn-xs btn-primary absolute bottom-2 right-2 z-20"
                        >
                          {isInCart ? "En carrito" : "Agregar"}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
