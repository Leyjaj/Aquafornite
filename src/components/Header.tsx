'use client'

import { useEffect, useState } from "react";
import Link from "next/link";

import { Icon } from "@iconify/react";
import { useSkinCart } from "@/hooks/useSkinCart";
import { useRouter } from "next/navigation";
import SelectedItems from "./SelectedItems";
import Skin from "@/interfaces/skin.interface";
import { useCurrency } from "@/hooks/useCurrency";

import { SignInButton, UserButton, useSession } from "@clerk/nextjs";  // Importación de Clerk

const countryOptions = [
  { id: "usd", label: "USD", icon: <Icon icon="twemoji:flag-united-states" width="22" /> },
  { id: "mxn", label: "MXN", icon: <Icon icon="twemoji:flag-mexico" width="22" /> },
  { id: "pen", label: "PEN", icon: <Icon icon="twemoji:flag-peru" width="22" /> },
  { id: "clp", label: "CLP", icon: <Icon icon="twemoji:flag-chile" width="22" /> },
  { id: "cop", label: "COP", icon: <Icon icon="twemoji:flag-colombia" width="22" /> },
  { id: "bob", label: "BOB", icon: <Icon icon="twemoji:flag-bolivia" width="22" /> },
  { id: "eur", label: "EUR", icon: <Icon icon="twemoji:flag-european-union" width="22" /> },
  { id: "brl", label: "BRL", icon: <Icon icon="twemoji:flag-brazil" width="22" /> },
];

const Header = () => {
  const [theme, setTheme] = useState('corporate');

  const { items, removeItem } = useSkinCart();
  const { currency } = useCurrency();
  const { isSignedIn } = useSession();  // Verifica si el usuario está logueado

  const router = useRouter();

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const total = items.reduce(
    (acc, item: any) => acc + Number(item.customPrice ?? item.price ?? 0),
    0
  );

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme])

  const handlePay = async () => {
    const formatedItems = items.map((item: any) => ({
      name: item.bundle?.name || item.brItems?.[0]?.name || item.tracks?.[0]?.title || "Producto",
      price: Number(item.customPrice ?? item.price ?? 0),
      customPrice: Number(item.customPrice ?? item.price ?? 0),
      images: item?.newDisplayAsset?.renderImages?.[0]?.image || item?.tracks?.[0]?.albumArt || "",
      quantity: item.quantity ?? 1,
    }));

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: formatedItems,
        currency,
      }),
    });

    const { url } = await response.json();
    window.location.href = url;
  };

  const handleCountryChange = (value: any) => {
    console.log("Moneda seleccionada:", value.id)
  };

  const getBackgroundStyle = (skin: Skin) => {
    const colors = skin?.colors;

    if (!colors) {
      return { background: '#333' };
    }

    const colorStops = [];

    if (colors.color1) colorStops.push(`#${colors.color1}`);
    if (colors.color2) colorStops.push(`#${colors.color2}`);
    if (colors.color3) colorStops.push(`#${colors.color3}`);

    return { background: `linear-gradient(to bottom, ${colorStops.join(', ')})` };
  };

  return (
    <div className="fixed z-1000 w-full flex flex-row items-center justify-between bg-black/10 backdrop-blur-md navbar shadow-sm px-8">
      <div className="flex items-center">
        <div className="flex-1 flex-row items-center justify-center mt-2">
          <Link href="/" className="font-fortnite text-3xl text-white hover:opacity-80 transition">
            AQUAFORNAIS
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SelectedItems options={countryOptions} onChange={handleCountryChange} />

        <div className="drawer drawer-end">
          <input id="my-drawer-4" type="checkbox" className="drawer-toggle btn btn-ghost btn-circle" />

          <div className="drawer-content">
            <label htmlFor="my-drawer-4" className="drawer-button border-none btn btn-ghost hover:bg-transparent">
              {
                items.length === 0
                  ? <Icon icon="solar:cart-large-2-outline" fontSize={28} style={{ color: 'white' }} />
                  : <div className="flex flex-row items-center">
                      <Icon icon="solar:cart-large-2-outline" fontSize={28} style={{ color: 'white' }} />
                      <span className="badge badge-sm badge-secondary">{items.length}</span>
                    </div>
              }
            </label>
          </div>

          <div className="top-0 right-0 h-screen drawer-side z-[1000]">
            <label htmlFor="my-drawer-4" className="drawer-overlay"></label>

            <div className="menu bg-base-200 text-base-content min-h-full w-70 md:w-80 flex flex-col">
              <div className="flex items-center p-4 border-b border-base-300">
                <h1 className="flex-1 text-lg font-semibold">
                  Carrito de compras
                </h1>

                <label htmlFor="my-drawer-4" className="btn btn-ghost btn-sm btn-circle">
                  <Icon icon="solar:exit-bold" fontSize={25} />
                </label>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="flex flex-col justify-center gap-7 items-center h-full">
                    <Icon icon="bi:cart-x" fontSize={75} />
                    <h1 className="text-lg text-center">
                      Carrito de compras <span className="text-error font-bold">vacío!</span>
                    </h1>
                  </div>
                ) : (
                  items.map((item: any, inx) => (
                    <div key={inx}>
                      <div className="w-full flex flex-row gap-4">
                        <div
                          className="size-24 shrink-0 overflow-hidden rounded-md"
                          style={getBackgroundStyle(item)}
                        >
                          <img
                            className="size-full object-cover"
                            src={item.newDisplayAsset?.renderImages?.[0]?.image || item.tracks?.[0]?.albumArt}
                            alt=""
                          />
                        </div>

                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between font-medium">
                            <h3 className="text-sm line-clamp-2">
                              {item?.bundle?.name || item.brItems?.[0]?.name || item.tracks?.[0]?.title}
                            </h3>

                            <p className="ml-4 whitespace-nowrap">
                              {currency} {formatPrice(Number(item.customPrice ?? item.price ?? 0))}
                            </p>
                          </div>

                          <div className="flex flex-1 items-end justify-between text-sm mt-2">
                            <span
                              className="group cursor-pointer"
                              onClick={() => removeItem(item.devName)}
                            >
                              <Icon
                                className="group-hover:text-error transition-colors"
                                icon="solar:trash-bin-2-bold"
                                fontSize={25}
                              />
                            </span>
                          </div>
                        </div>
                      </div>

                      {inx < items.length - 1 && <div className="divider my-2"></div>}
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-base-300 p-4 bg-base-200">
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-base-content/70">Artículos:</span>
                      <span className="font-semibold">{items.length} skins</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-lg font-bold text-info">
                        {currency} {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-success btn-block gap-2"
                    onClick={handlePay}
                  >
                    Comprar
                    <Icon icon="solar:wallet-money-bold" fontSize={22} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Aquí verificamos si el usuario está logueado */}
        {isSignedIn ? (
          <UserButton />
        ) : (
          <SignInButton mode="modal">
            <button className="btn btn-primary m-0 p-0 w-30">
              Iniciar Sesión
            </button>
          </SignInButton>
        )}
      </div>
    </div>
  );
};

export default Header;