
'use client '

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Skin, { SkinWithDiscount } from "@/interfaces/skin.interface";
import { useSkinCart } from "@/hooks/useSkinCart";
import { useIsMobile } from '@/hooks/useIsMobile';
import { useCurrency } from "@/hooks/useCurrency";
interface Layout {
  id: string,
  name: string,
  rank: number
}
interface Props {
  groupedSkins: Record<string, { layout: Layout, skins: Skin[] }>,

}
export default function SkinGridInfinite({ groupedSkins }: Props) {
  const categories = Object.entries(groupedSkins)
  const [visibleCount, setVisibleCount] = useState(4);
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();
  const {currency,rates} = useCurrency();
  const { addItem } = useSkinCart()

  const sizeSkin: { [key: string]: string } = {
    'Size_4_x_1': "col-span-1 sm:col-span-1 md:col-span-4 ",
    'Size_3_x_1': "col-span-1 sm:col-span-1 md:col-span-3" ,
    'Size_2_x_1': "col-span-1 col-span-2",
    'Size_1_x_1': "col-span-1",
  };
  const scaleSkin: Record<string, string> = {
    'Size_4_x_1': 'scale-115',
    'Size_3_x_1': '',
    'Size_2_x_1': 'translate-y-[10%] scale-120 h-[320px] md:h-[450px]',
    'Size_1_x_1': 'translate-x-[-20%] translate-y-[10%] scale-115',
  };
  const heightByTile: Record<string, string> = {
    'Size_4_x_1': 'h-[400px] md:h-[550px]',
    'Size_3_x_1': 'h-[380px] md:h-[500px]',
    'Size_2_x_1': 'h-[320px] md:h-[450px]',
    'Size_1_x_1': 'h-[280px] md:h-[380px]',
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 2, categories.length))
        }
      },
      {
        rootMargin: "100px",
      }
    )
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    return () => {
      if (observerRef.current) {
        observer.disconnect();
      }
    }
  }, [categories.length])
  const getBackgroundStyle = (skin: Skin) => {
    const colors = skin?.colors;
    if (!colors) {
      return { background: '#333' }; // Default color if no colors are provided
    }
    const colorStops = [];
    if (colors.color1) colorStops.push(`#${colors.color1}`);
    if (colors.color2) colorStops.push(`#${colors.color3}`);
    

    return { background: `linear-gradient(to bottom, ${colorStops.join(', ')})` };
  };

  // const toggle = (id:string) =>{
  //   console.log(id)
  //   setActiveId(prev => (prev === id? null : id));
  // }
  const currencyPrice = 0.0043 * (rates[currency]??1);
  console.log(currencyPrice)
  return (
    <section className="p-6">

      {categories.slice(0, visibleCount).map(([key, value]) => (

        <div className="flex flex-col " key={key}>
          <h2 className="text-3xl font-semibold mt-8 text-white">{key}</h2>
          <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 justify-items-center ">
            {
              value?.skins?.map((skin, idx) => {
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isMobile) addItem(skin)
                    }}
                    className={`${sizeSkin[skin.tileSize]} group rounded-xl overflow-hidden outline-[4px] outline-transparent hover:outline-blue-100 transition-all duration-300 ease-in-out card image-full flex-shrink-0  w-full h-[280px] md:h-[450px] relative  cursor-pointer shadow-[0px_0px_80px_-44px_rgba(0,_0,_0,_0.7)]`}
                    style={{
                      
                      ...getBackgroundStyle(skin)
                    }}
                  >
                    <div 
                    className={`relative  aspect-[1/.76] w-full ${heightByTile[skin.tileSize]} `}
                           
                    >
                      <Image
                        fill
                        objectFit={`${skin.tileSize === "Size_3_x_1" ? "cover" : "contain"}`}
                        
                        // Definimos los `sizes` para que Next.js sepa qué tamaño de imagen generar en cada viewport
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={`z-0 transition-transform duration-700 ease-out ${scaleSkin[skin.tileSize]}`}
                        blurDataURL={`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/Tj7XngAAAABJRU5ErkJggg==`}
                        src={skin?.newDisplayAsset?.renderImages[0].image || skin.tracks[0].albumArt}
                        alt={skin?.displayName || "skin image"}
                      />
                    </div>

                    <div className={`w-full pl-2 pr-2 pb-10  ${isMobile ? '-translate-y-7' : 'translate-y-8'} absolute bg-gradient-to-t from-zinc-900  ellipsis to-transparent bottom-[-50] z-9 pb-2  group-hover:-translate-y-8 transition-transform duration-300`}>
                      <div className="flex flex-col ml-5 mb-5">
                        
                        <span className="text-white  font-semibold text-xl truncate ellipsis">{ skin?.bundle?.name || skin?.brItems?.[0].name || skin.tracks?.[0].title}</span>
                        <span className="text-white/75 text-lg">{skin.finalPrice} V-BUCKS - {parseFloat((skin?.finalPrice * currencyPrice).toFixed(2))} {currency}</span>
                      </div>
                      {
                        !isMobile && (
                          <button
                            onClick={() => addItem(skin)}
                            className=" btn mt-2  w-full  btn-primary text-white font-medium transition-colors">
                            Agregar al carrito
                          </button>
                        )
                      }
                    </div>

                  </div>
                )
              })
            }
          </div>

        </div>

      ))}
      {/* 👇 Sentinel */}
      {visibleCount < categories.length && (
        <div ref={observerRef} className="h-16 mt-8" />
      )}
    </section>
  )
}



