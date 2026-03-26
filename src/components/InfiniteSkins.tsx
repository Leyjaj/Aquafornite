"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Skin from "@/interfaces/skin.interface";
import { useSkinCart } from "@/hooks/useSkinCart";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useCurrency } from "@/hooks/useCurrency";

interface Layout {
  id: string;
  name: string;
  rank: number;
}

interface Props {
  groupedSkins: Record<string, { layout: Layout; skins: Skin[] }>;
}

const toggleWishlist = async (item: any, isSaved: boolean, setSaved: any) => {
  if (isSaved) {
    await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skinId: item.id }),
    });
    setSaved(false);
  } else {
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skinId: item.id,
        name: item.name,
        image: item.images?.icon || item.image,
        price: item.price,
      }),
    });
    setSaved(true);
  }
};

function WishlistButton({ item }: { item: any }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      if (data.some((w: any) => w.skinId === item.id)) {
        setSaved(true);
      }
    };
    load();
  }, [item.id]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleWishlist(item, saved, setSaved);
      }}
      className={`absolute top-2 right-2 z-20 text-xl ${
        saved ? "text-red-500" : "text-white"
      }`}
    >
      ♥
    </button>
  );
}

export default function SkinGridInfinite({ groupedSkins }: Props) {
  if (!groupedSkins || Object.keys(groupedSkins).length === 0) {
    return null;
  }

  const categories = Object.entries(groupedSkins);
  const [visibleCount, setVisibleCount] = useState(4);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();
  const { currency } = useCurrency();
  const { addItem } = useSkinCart();

  const sizeSkin: Record<string, string> = {
    Size_4_x_1: "col-span-1 sm:col-span-1 md:col-span-4",
    Size_3_x_1: "col-span-1 sm:col-span-1 md:col-span-3",
    Size_2_x_1: "col-span-1 sm:col-span-1 md:col-span-2",
    Size_1_x_1: "col-span-1",
  };

  const heightByTile: Record<string, string> = {
    Size_4_x_1: "h-[400px] md:h-[550px]",
    Size_3_x_1: "h-[380px] md:h-[500px]",
    Size_2_x_1: "h-[320px] md:h-[450px]",
    Size_1_x_1: "h-[280px] md:h-[380px]",
  };

  const pricePer100: Record<string, number> = {
    USD: 0.36,
    MXN: 6.5,
    PEN: 1.3,
    EUR: 0.32,
    COP: 1300,
    CLP: 330,
    BOB: 2.5,
    BRL: 1.9,
  };

  const pricePerVbuck = (pricePer100[currency] ?? 0.36) / 100;

  useEffect(() => {
    if (!observerRef.current) return;
    if (categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 2, categories.length));
        }
      },
      {
        rootMargin: "100px",
      }
    );

    observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [categories.length]);

  const getBackgroundStyle = (skin: Skin) => {
    const colors = skin?.colors;
    if (!colors) return { background: "#333" };

    const colorStops: string[] = [];
    if (colors.color1) colorStops.push(`#${colors.color1}`);
    if (colors.color2) colorStops.push(`#${colors.color2}`);
    if (colors.color3) colorStops.push(`#${colors.color3}`);

    if (colorStops.length === 0) return { background: "#333" };

    return {
      background: `linear-gradient(to bottom, ${colorStops.join(", ")})`,
    };
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <section className="p-6">
      {categories.slice(0, visibleCount).map(([key, value]) => (
        <div className="flex flex-col" key={key}>
          <h2 className="text-3xl font-semibold mt-8 text-white">{key}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {Array.isArray(value?.skins) &&
              value.skins.map((skin, idx) => {
                const renderImages = Array.isArray(
                  (skin as any)?.newDisplayAsset?.renderImages
                )
                  ? (skin as any).newDisplayAsset.renderImages
                  : [];

                const tracks = Array.isArray((skin as any)?.tracks)
                  ? (skin as any).tracks
                  : [];

                const imageSrc =
                  renderImages[0]?.image ?? tracks[0]?.albumArt ?? null;

                if (!imageSrc) return null;

                const tileSize = (skin as any).tileSize || "Size_1_x_1";

                const displayName =
                  (skin as any)?.bundle?.name ||
                  (skin as any)?.brItems?.[0]?.name ||
                  tracks[0]?.title ||
                  (skin as any)?.displayName ||
                  "Skin";

                const finalPrice = (skin as any)?.finalPrice ?? 0;
                const converted = finalPrice * pricePerVbuck;

                const skinWithPrice = {
                  ...skin,
                  customPrice: parseFloat(converted.toFixed(2)),
                  currency,
                };

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isMobile) addItem(skinWithPrice as any);
                    }}
                    className={`${
                      sizeSkin[tileSize] ?? "col-span-1"
                    } group rounded-xl overflow-hidden outline-[4px] outline-transparent hover:outline-blue-100 transition-all duration-300 ease-in-out flex flex-col w-full ${
                      heightByTile[tileSize]
                    } relative cursor-pointer shadow-[0px_0px_80px_-44px_rgba(0,_0,_0,_0.7)]`}
                    style={getBackgroundStyle(skin)}
                  >
                    <WishlistButton item={{ ...skin, id: skin.id, name: displayName, image: imageSrc, price: finalPrice }} />

                    <div className="relative w-full flex-1 flex items-center justify-center p-4 overflow-hidden">
                      <Image
                        fill
                        src={imageSrc}
                        alt={displayName}
                        className={`object-contain object-center transition-transform duration-500 group-hover:scale-105 ${
                          tileSize === "Size_1_x_1" ? "scale-110" : ""
                        } ${
                          tileSize === "Size_2_x_1" ? "scale-105" : ""
                        } ${
                          tileSize === "Size_4_x_1" ? "scale-95" : ""
                        }`}
                      />
                    </div>

                    <div className="w-full px-4 pb-4 bg-gradient-to-t from-zinc-900/90 to-transparent">
                      <div className="flex flex-col">
                        <span className="text-white font-semibold text-lg truncate">
                          {displayName}
                        </span>
                        <span className="text-white/75 text-sm">
                          {finalPrice} V-BUCKS -{" "}
                          {formatPrice(converted)} {currency}
                        </span>
                      </div>

                      {!isMobile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem(skinWithPrice as any);
                          }}
                          className="btn mt-2 w-full btn-primary text-white font-medium"
                        >
                          Agregar al carrito
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {visibleCount < categories.length && (
        <div ref={observerRef} className="h-16 mt-8" />
      )}
    </section>
  );
}