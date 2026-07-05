"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Skin from "@/interfaces/skin.interface";
import { useSkinCart } from "@/hooks/useSkinCart";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useCurrency } from "@/hooks/useCurrency";
import { useSession } from "@clerk/nextjs";
import { showToast } from "nextjs-toast-notify";

interface Layout {
  id: string;
  name: string;
  rank: number;
}

interface Props {
  groupedSkins: Record<string, { layout: Layout; skins: Skin[] }>;
}

function WishlistButton({
  canUseWishlist,
  isSaved,
  onToggle,
}: {
  canUseWishlist: boolean;
  isSaved: boolean;
  onToggle: () => void;
}) {
  if (!canUseWishlist) return null;

  return (
    <button
      type="button"
      data-wishlist-button="true"
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`absolute top-2 right-2 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/45 text-xl backdrop-blur-sm transition ${
        isSaved ? "text-red-500" : "text-white"
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
  const { isSignedIn, isLoaded } = useSession();
  const [savedSkinIds, setSavedSkinIds] = useState<Set<string>>(new Set());

  const pricePer100: Record<string, number> = {
    USD: 0.36,
    MXN: 6,
    PEN: 1.2,
    EUR: 0.3,
    COP: 1200,
    CLP: 320,
    BOB: 2.7,
    BRL: 0.8,
  };

  const pricePerVbuck = (pricePer100[currency] ?? 0.36) / 100;

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setSavedSkinIds(new Set());
      return;
    }

    const loadWishlist = async () => {
      try {
        const res = await fetch("/api/wishlist");

        if (!res.ok) return;

        const data = await res.json();
        const nextIds = new Set<string>(
          Array.isArray(data)
            ? data.map((item: any) => String(item.skinId)).filter(Boolean)
            : []
        );

        setSavedSkinIds(nextIds);
      } catch {
        setSavedSkinIds(new Set());
      }
    };

    loadWishlist();
  }, [isLoaded, isSignedIn]);

  const toggleWishlist = async (item: {
    id: string;
    name: string;
    image: string;
    price: number;
  }) => {
    if (!isSignedIn) {
      showToast.info("Inicia sesión para usar wishlist", {
        duration: 2500,
        position: "top-right",
      });
      return;
    }

    if (!item.id) {
      showToast.error("No se pudo identificar esta skin", {
        duration: 2500,
        position: "top-right",
      });
      return;
    }

    const alreadySaved = savedSkinIds.has(item.id);

    try {
      const response = await fetch("/api/wishlist", {
        method: alreadySaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          alreadySaved
            ? { skinId: item.id }
            : {
                skinId: item.id,
                name: item.name,
                image: item.image,
                price: item.price,
              }
        ),
      });

      if (!response.ok) return;

      setSavedSkinIds((prev) => {
        const next = new Set(prev);
        if (alreadySaved) next.delete(item.id);
        else next.add(item.id);
        return next;
      });

      showToast.success(alreadySaved ? "Quitado de wishlist" : "Agregado a wishlist", {
        duration: 1700,
        position: "top-right",
      });
    } catch {
      showToast.error("Error al actualizar wishlist", {
        duration: 2500,
        position: "top-right",
      });
      return;
    }
  };

  const visibleCategories = useMemo(
    () => categories.slice(0, visibleCount),
    [categories, visibleCount]
  );

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
    <section className="px-1 py-4 md:px-4 md:py-6">
      {visibleCategories.map(([key, value]) => (
        <div
          className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-2.5 md:p-4"
          key={key}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-white md:text-base">
              {key}
            </h2>
            <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/80 md:text-xs">
              {value?.skins?.length ?? 0} items
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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

                const displayName =
                  (skin as any)?.bundle?.name ||
                  (skin as any)?.brItems?.[0]?.name ||
                  tracks[0]?.title ||
                  (skin as any)?.displayName ||
                  "Skin";

                const finalPrice = (skin as any)?.finalPrice ?? 0;
                const converted = finalPrice * pricePerVbuck;
                const skinId = String(
                  (skin as any)?.brItems?.[0]?.id ??
                    (skin as any)?.mainId ??
                    (skin as any)?.id ??
                    (skin as any)?.offerId ??
                    tracks?.[0]?.id ??
                    ""
                );

                const skinWithPrice = {
                  ...skin,
                  customPrice: parseFloat(converted.toFixed(2)),
                  currency,
                };

                return (
                  <div
                    key={idx}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('[data-wishlist-button="true"]')) return;

                      if (isMobile) addItem(skinWithPrice as any);
                    }}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-white/15 shadow-[0px_8px_24px_-14px_rgba(0,0,0,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0px_10px_30px_-10px_rgba(0,0,0,0.85)]"
                    style={getBackgroundStyle(skin)}
                  >
                    <WishlistButton
                      canUseWishlist={Boolean(isSignedIn)}
                      isSaved={savedSkinIds.has(skinId)}
                      onToggle={() =>
                        toggleWishlist({
                          id: skinId,
                          name: displayName,
                          image: imageSrc,
                          price: finalPrice,
                        })
                      }
                    />

                    <div className="relative h-full w-full overflow-hidden">
                      <Image
                        fill
                        src={imageSrc}
                        alt={displayName}
                        className="object-contain object-center p-2 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2.5 pb-2 pt-6">
                      <div className="flex flex-col leading-tight">
                        <span className="truncate text-xs font-semibold text-white md:text-sm">
                          {displayName}
                        </span>
                        <span className="text-[11px] text-white/80 md:text-xs">
                          {finalPrice} V-Bucks
                        </span>
                        <span className="text-[11px] text-white/80 md:text-xs">
                          {formatPrice(converted)} {currency}
                        </span>
                      </div>
                    </div>

                    {!isMobile && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(skinWithPrice as any);
                        }}
                        className="btn btn-sm btn-primary absolute bottom-2 right-2 z-30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      >
                        + carrito
                      </button>
                    )}
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
