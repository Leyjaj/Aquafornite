'use client'

import Link from "next/link";

import { Icon } from "@iconify/react";
import { useSkinCart } from "@/hooks/useSkinCart";
import { useUser as useAppUser } from "@/hooks/useUser";
import SelectedItems from "./SelectedItems";
import Skin from "@/interfaces/skin.interface";
import { useCurrency } from "@/hooks/useCurrency";

import { useClerk, useSession, useUser as useClerkUser } from "@clerk/nextjs";
import { showToast } from "nextjs-toast-notify";

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

const paypalCurrencies = new Set(["USD", "MXN", "BRL"]);
const isPayPalEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYPAL === "true";
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

const Header = () => {
  const { items, removeItem } = useSkinCart();
  const { user: appUser } = useAppUser();
  const { currency } = useCurrency();
  const { isSignedIn } = useSession();
  const { user } = useClerkUser();
  const { signOut, openSignIn } = useClerk();

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getCurrentItemPrice = (item: any) => {
    const vbucks = Number(item?.finalPrice ?? item?.vbucks ?? 0);

    if (vbucks > 0) {
      const per100 = pricePer100[currency] ?? pricePer100.USD;
      return Number(((vbucks * per100) / 100).toFixed(2));
    }

    return Number(item?.customPrice ?? item?.price ?? 0);
  };

  const total = items.reduce(
    (acc, item: any) => acc + getCurrentItemPrice(item),
    0
  );

  const buildCheckoutItems = () =>
    items.map((item: any) => {
      const vbucks = Number(item?.finalPrice ?? item?.vbucks ?? 0);
      const eligibleForCashback = vbucks > 0;
      const itemId = String(item?.brItems?.[0]?.id ?? item?.mainId ?? item?.newDisplayAsset?.cosmeticId ?? "");
      const offerId = String(item?.offerId ?? item?.newDisplayAssetPath ?? "");

      return {
        itemId,
        offerId,
        name: item.bundle?.name || item.brItems?.[0]?.name || item.tracks?.[0]?.title || "Producto",
        price: getCurrentItemPrice(item),
        customPrice: getCurrentItemPrice(item),
        images: item?.newDisplayAsset?.renderImages?.[0]?.image || item?.tracks?.[0]?.albumArt || "",
        quantity: item.quantity ?? 1,
        vbucks,
        eligibleForCashback,
        allowCoupons: true,
      };
    });

  const handlePay = async () => {
    const fortniteId = localStorage.getItem("fortniteId") || "";
    const nickname = localStorage.getItem("nickname") || "";

    if (!fortniteId) {
      showToast.info("Primero guarda tu cuenta de Epic en la tienda", {
        duration: 3500,
        position: 'top-right',
      });
      return;
    }

    const formatedItems = buildCheckoutItems();

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: formatedItems,
          currency,
          epicAccountId: fortniteId,
          epicNickname: nickname,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.url) {
        console.error('Checkout error:', data);
        showToast.error(data?.error || 'No se pudo iniciar el checkout', {
          duration: 3500,
          position: 'top-right',
        });
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout request failed:', error);
      showToast.error('Error de red al crear el checkout', {
        duration: 3500,
        position: 'top-right',
      });
    }
  };

  const handlePayPal = async () => {
    if (!isPayPalEnabled) {
      showToast.info("PayPal estara disponible pronto", {
        duration: 2500,
        position: 'top-right',
      });
      return;
    }

    const fortniteId = localStorage.getItem("fortniteId") || "";
    const nickname = localStorage.getItem("nickname") || "";

    if (!fortniteId) {
      showToast.info("Primero guarda tu cuenta de Epic en la tienda", {
        duration: 3500,
        position: 'top-right',
      });
      return;
    }

    if (!paypalCurrencies.has(currency)) {
      showToast.info("PayPal disponible solo en USD, MXN y BRL", {
        duration: 3500,
        position: 'top-right',
      });
      return;
    }

    if (total <= 0) {
      showToast.info("Tu carrito está vacío", {
        duration: 2500,
        position: 'top-right',
      });
      return;
    }

    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total: Number(total.toFixed(2)),
          currency,
          epicAccountId: fortniteId,
          epicNickname: nickname,
          items: buildCheckoutItems(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.url) {
        showToast.error(data?.error || 'No se pudo iniciar PayPal', {
          duration: 3500,
          position: 'top-right',
        });
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('PayPal request failed:', error);
      showToast.error('Error de red al iniciar PayPal', {
        duration: 3500,
        position: 'top-right',
      });
    }
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
    <div className="fixed z-1000 w-full flex flex-row items-center justify-between bg-black/10 backdrop-blur-md navbar shadow-sm px-3 md:px-8">
      <div className="flex items-center">
        <div className="flex-1 flex-row items-center justify-center mt-2">
          <Link href="/" className="font-fortnite text-xl md:text-3xl text-white hover:opacity-80 transition">
            AQUAFORNAIS
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-3">
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
                              {currency} {formatPrice(getCurrentItemPrice(item))}
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
                    Pagar con tarjeta
                    <Icon icon="solar:wallet-money-bold" fontSize={22} />
                  </button>

                  {isPayPalEnabled && (
                    <>
                      <button
                        className="btn btn-info btn-block gap-2 mt-2"
                        onClick={handlePayPal}
                        disabled={!paypalCurrencies.has(currency)}
                      >
                        Pagar con PayPal
                        <Icon icon="logos:paypal" fontSize={18} />
                      </button>

                      {!paypalCurrencies.has(currency) && (
                        <p className="text-xs text-base-content/70 mt-2 text-center">
                          PayPal solo acepta USD, MXN o BRL.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {isSignedIn ? (
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-circle avatar"
              aria-label="Abrir menu de usuario"
            >
              <div className="w-9 rounded-full border border-white/25 overflow-hidden bg-black/25">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="avatar" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-xs font-bold text-white">
                    {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </button>

            <ul
              tabIndex={0}
              className="dropdown-content menu mt-2 w-48 rounded-box border border-white/15 bg-[#0b1c3f] p-2 text-white shadow-lg"
            >
              <li className="pointer-events-none">
                <span className="flex items-center gap-2 text-cyan-300">
                  <Icon icon="solar:medal-ribbons-star-bold" width="18" />
                  {Number(appUser?.aquacoins ?? 0).toLocaleString()} AQ
                </span>
              </li>
              <li>
                <Link href="/wishlist" className="flex items-center gap-2">
                  <Icon icon="solar:heart-bold" width="18" />
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/aquacoins" className="flex items-center gap-2">
                  <Icon icon="solar:medal-ribbons-star-bold" width="18" />
                  AquaCoins
                </Link>
              </li>
              <li>
                <Link href="/aquacoins-shop" className="flex items-center gap-2">
                  <Icon icon="solar:shop-2-bold" width="18" />
                  Tienda AQ
                </Link>
              </li>
              <li>
                <Link href="/user" className="flex items-center gap-2">
                  <Icon icon="solar:history-bold" width="18" />
                  Historial
                </Link>
              </li>
              <li>
                <Link href="/user-profile" className="flex items-center gap-2">
                  <Icon icon="solar:user-id-bold" width="18" />
                  Mi cuenta
                </Link>
              </li>
              <li>
                <button
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="flex items-center gap-2"
                >
                  <Icon icon="solar:logout-3-bold" width="18" />
                  Cerrar sesion
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                openSignIn?.();
              }
            }}
            className="btn btn-primary btn-sm md:btn-md m-0 px-2 md:px-4 w-auto whitespace-nowrap"
          >
            <span className="text-xs md:hidden">Entrar</span>
            <span className="hidden md:inline">Iniciar Sesión</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
