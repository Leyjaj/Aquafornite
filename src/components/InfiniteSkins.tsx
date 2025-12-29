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

export default function SkinGridInfinite({ groupedSkins }: Props) {
  // 🔹 Si por cualquier razón viene vacío/undefined, salimos
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

  const scaleSkin: Record<string, string> = {
    Size_4_x_1: "scale-115",
    Size_3_x_1: "",
    Size_2_x_1: "translate-y-[10%] scale-120 h-[320px] md:h-[450px]",
    Size_1_x_1: "translate-x-[-20%] translate-y-[10%] scale-115",
  };

  const heightByTile: Record<string, string> = {
    Size_4_x_1: "h-[400px] md:h-[550px]",
    Size_3_x_1: "h-[380px] md:h-[500px]",
    Size_2_x_1: "h-[320px] md:h-[450px]",
    Size_1_x_1: "h-[280px] md:h-[380px]",
  };

  // Infinite scroll
  useEffect(() => {
    if (!observerRef.current) return;
    if (categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 2, categories.length));
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [categories.length]);

  const getBackgroundStyle = (skin: Skin) => {
    const colors = skin?.colors;
    if (!colors) return { background: "#333" };

    const colorStops: string[] = [];
    if (colors.color1) colorStops.push(`#${colors.color1}`);
    if (colors.color2) colorStops.push(`#${colors.color2}`);
    if (colors.color3) colorStops.push(`#${colors.color3}`);

    if (colorStops.length === 0) return { background: "#333" };

    return { background: `linear-gradient(to bottom, ${colorStops.join(", ")})` };
  };

  // ✅ REGLA FIJA: 100 V-Bucks = X (lo que tú definiste)
  const PRICE_PER_100: Record<string, number> = {
    USD: 0.35,
    MXN: 6,
    PEN: 1.2,
    BRL: 1.8,
    CLP: 300,
    COP: 1250,
    EUR: 0.3,
  };

  const ZERO_DECIMAL = new Set(["CLP", "COP"]);

  const calcPrice = (vbucks: number) => {
    const c = String(currency).toUpperCase();
    const per100 = PRICE_PER_100[c] ?? 0;
    const amount = (Number(vbucks) / 100) * per100;

    // CLP/COP sin decimales
    if (ZERO_DECIMAL.has(c)) return Math.round(amount);

    return Number(amount.toFixed(2));
  };

  return (
    <section className="p-6">
      {categories.slice(0, visibleCount).map(([key, value]) => (
        <div className="flex flex-col" key={key}>
          <h2 className="text-3xl font-semibold mt-8 text-white">{key}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 justify-items-center">
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

                const imageSrc = renderImages[0]?.image ?? tracks[0]?.albumArt ?? null;

                if (!imageSrc) return null;

                const tileSize = (skin as any).tileSize || "Size_1_x_1";

                const displayName =
                  (skin as any)?.bundle?.name ||
                  (skin as any)?.brItems?.[0]?.name ||
                  tracks[0]?.title ||
                  (skin as any)?.displayName ||
                  "Skin";

                const finalPrice = Number((skin as any)?.finalPrice ?? 0) || 0;

                const shown = calcPrice(finalPrice);
                const shownText = ZERO_DECIMAL.has(String(currency).toUpperCase())
                  ? String(shown)
                  : Number(shown).toFixed(2);

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isMobile) addItem(skin);
                    }}
                    className={`${
                      sizeSkin[tileSize] ?? "col-span-1"
                    } group rounded-xl overflow-hidden outline-[4px] outline-transparent hover:outline-blue-100 transition-all duration-300 ease-in-out card image-full flex-shrink-0 w-full h-[280px] md:h-[450px] relative cursor-pointer shadow-[0px_0px_80px_-44px_rgba(0,_0,_0,_0.7)]`}
                    style={getBackgroundStyle(skin)}
                  >
                    <div
                      className={`relative aspect-[1/.76] w-full ${
                        heightByTile[tileSize] ?? "h-[280px] md:h-[380px]"
                      }`}
                    >
                      <Image
                        fill
                        className={`z-0 transition-transform duration-700 ease-out ${
                          scaleSkin[tileSize] ?? ""
                        } ${tileSize === "Size_3_x_1" ? "object-cover" : "object-contain"}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/Tj7XngAAAABJRU5ErkJggg=="
                        src={imageSrc}
                        alt={displayName}
                      />
                    </div>

                    <div
                      className={`w-full pl-2 pr-2 pb-10 ${
                        isMobile ? "-translate-y-7" : "translate-y-8"
                      } absolute bg-gradient-to-t from-zinc-900 to-transparent bottom-[-50] z-9 pb-2 group-hover:-translate-y-8 transition-transform duration-300`}
                    >
                      <div className="flex flex-col ml-5 mb-5">
                        <span className="text-white font-semibold text-xl truncate ellipsis">
                          {displayName}
                        </span>
                        <span className="text-white/75 text-lg">
                          {finalPrice} V-BUCKS - {shownText} {currency}
                        </span>
                      </div>

                      {!isMobile && (
                        <button
                          onClick={() => addItem(skin)}
                          className="btn mt-2 w-full btn-primary text-white font-medium transition-colors"
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

      {/* Sentinel para infinite scroll */}
      {visibleCount < categories.length && (
        <div ref={observerRef} className="h-16 mt-8" />
      )}
    </section>
  );
}
