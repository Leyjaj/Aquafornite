'use client'

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useSkinCart } from "@/hooks/useSkinCart";
import { useRouter } from "next/navigation";
import SelectedItems from "./SelectedItems";
import { signOut, useSession } from "@/lib/auth-client";
import Skin from "@/interfaces/skin.interface";

type CurrencyId = "usd" | "mxn" | "pen" | "brl" | "clp" | "cop" | "eur";

const countryOptions = [
  { id: "usd", label: "USD", icon: <Icon icon="emojione-v1:flag-for-united-states" fontSize={28} style={{ color: 'white' }} /> },
  { id: "mxn", label: "MXN", icon: <Icon icon="emojione-v1:flag-for-mexico" fontSize={28} style={{ color: 'white' }} /> },
  { id: "pen", label: "PEN", icon: <Icon icon="emojione-v1:flag-for-peru" fontSize={28} style={{ color: 'white' }} /> },
  { id: "brl", label: "BRL", icon: <Icon icon="emojione-v1:flag-for-brazil" fontSize={28} style={{ color: 'white' }} /> },
  { id: "clp", label: "CLP", icon: <Icon icon="emojione-v1:flag-for-chile" fontSize={28} style={{ color: 'white' }} /> },
  { id: "cop", label: "COP", icon: <Icon icon="emojione-v1:flag-for-colombia" fontSize={28} style={{ color: 'white' }} /> },
  { id: "eur", label: "EUR", icon: <Icon icon="emojione:flag-for-european-union" fontSize={28} style={{ color: 'white' }} /> },
];

// ✅ REGLA FIJA: 100 V-Bucks = X moneda
const PRICE_PER_100: Record<CurrencyId, number> = {
  usd: 0.35,
  mxn: 6.00,
  pen: 1.20,
  brl: 1.80,
  clp: 300,
  cop: 1250,
  eur: 0.30,
};

const SYMBOL: Record<CurrencyId, string> = {
  usd: "$",
  mxn: "$",
  pen: "S/",
  brl: "R$",
  clp: "$",
  cop: "$",
  eur: "€",
};

const ZERO_DECIMAL = new Set<CurrencyId>(["clp", "cop"]);

const Header = () => {
  const [theme, setTheme] = useState('corporate');
  const [cartOpen, setCartOpen] = useState(false);

  // ✅ moneda seleccionada para el checkout (lo que mandamos al backend)
  // ✅ A) PERSISTENCIA: leer localStorage al iniciar (sin romper SSR)
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<CurrencyId>(() => {
    if (typeof window === "undefined") return "usd";
    const saved = (localStorage.getItem("currency") || "usd").toLowerCase() as CurrencyId;
    return PRICE_PER_100[saved] !== undefined ? saved : "usd";
  });

  const { data: session } = useSession();
  const { items, removeItem } = useSkinCart();
  const router = useRouter();

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme]);

  // ✅ A) PERSISTENCIA: guardar moneda cuando cambie
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currency", selectedCurrencyId);
    }
  }, [selectedCurrencyId]);

  // ✅ helper: obtener V-Bucks reales del item (normalmente viene como finalPrice)
  const getVbucks = (item: any) => {
    const vb = Number(
      item?.finalPrice ??
      item?.regularPrice ??
      item?.bundle?.finalPrice ??
      item?.bundle?.regularPrice ??
      item?.brItems?.[0]?.finalPrice ??
      item?.brItems?.[0]?.regularPrice ??
      0
    );
    return Number.isFinite(vb) ? vb : 0;
  };

  // ✅ helper: convierte V-Bucks -> moneda seleccionada con regla fija
  const vbucksToAmount = (vbucks: number, currency: CurrencyId) => {
    const per100 = Number(PRICE_PER_100[currency] ?? 0);
    const amount = (Number(vbucks) / 100) * per100;

    if (ZERO_DECIMAL.has(currency)) return Math.round(amount);
    return Number(amount.toFixed(2));
  };

  // ✅ B) FORMATEO BONITO (Intl) — mantiene símbolos correctos y decimales correctos
  const formatMoney = (amount: number, currencyId: CurrencyId) => {
    const c = currencyId.toUpperCase();
    const zero = ZERO_DECIMAL.has(currencyId);

    // Si por algo Intl falla en algún entorno, caemos al formato anterior
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: c,
        minimumFractionDigits: zero ? 0 : 2,
        maximumFractionDigits: zero ? 0 : 2,
      }).format(amount);
    } catch {
      const symbol = SYMBOL[currencyId] ?? "";
      const formatted = zero ? String(Math.round(amount)) : Number(amount).toFixed(2);
      return `${symbol}${formatted}`;
    }
  };

  // (tu símbolo lo dejamos por si lo sigues usando en algún lugar)
  const symbol = SYMBOL[selectedCurrencyId];

  // ✅ total mostrado en moneda seleccionada
  const total = items.reduce((sum: number, item: any) => {
    return sum + vbucksToAmount(getVbucks(item), selectedCurrencyId);
  }, 0);

  const handlePay = async () => {
    const formatedItems = items.map((item: any) => {
      const name =
        item.bundle?.name || item.brItems?.[0]?.name || item.tracks?.[0]?.title || "Artículo";

      const vbucks = getVbucks(item);
      const priceInCurrency = vbucksToAmount(vbucks, selectedCurrencyId);

      return {
        name,
        price: priceInCurrency, // ✅ YA viene en la moneda elegida (MXN/PEN/BRL/CLP/COP/EUR/USD)
        quantity: 1,
      };
    });

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session?.user?.id ?? null,
        items: formatedItems,
        currency: selectedCurrencyId, // ✅ Stripe cobrará en esta moneda
      }),
    });

    const data = await response.json();
    if (!data?.url) return;
    window.location.href = data.url;
  };

  const handleCountryChange = (value: any) => {
    const id = String(value?.id ?? "usd").toLowerCase() as CurrencyId;
    if (PRICE_PER_100[id] !== undefined) {
      setSelectedCurrencyId(id);
      console.log("Moneda seleccionada:", id);
    } else {
      setSelectedCurrencyId("usd");
      console.log("Moneda seleccionada:", "usd");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (e) {
      console.error("Error", e);
    }
  };

  const getBackgroundStyle = (skin: Skin) => {
    const colors = skin?.colors;
    if (!colors) return { background: '#333' };
    const colorStops: string[] = [];
    if (colors.color1) colorStops.push(`#${colors.color1}`);
    if (colors.color2) colorStops.push(`#${colors.color2}`);
    return { background: `linear-gradient(to bottom, ${colorStops.join(', ')})` };
  };

  return (
    <>
      <div className="fixed w-full flex flex-row items-center justify-between bg-black/10 backdrop-blur-md navbar shadow-sm px-8 z-[1000]">

        <div className="flex items-center">
          <div className="flex-1 flex-row items-center justify-center mt-2">
            <div className="font-fortnite text-3xl text-white">AQUAFORNAIS</div>
          </div>
        </div>

        <div className="flex items-center gap-2">

          <SelectedItems options={countryOptions} onChange={handleCountryChange} />

          <div className="drawer drawer-end">
            <input
              id="my-drawer-4"
              type="checkbox"
              className="drawer-toggle"
              onChange={(e) => setCartOpen(e.currentTarget.checked)}
            />

            <div className="drawer-content">
              <label
                htmlFor="my-drawer-4"
                className="hidden sm:flex drawer-button border-none btn btn-ghost hover:bg-transparent hover:border-none"
              >
                {items.length === 0 ? (
                  <div className="flex flex-row">
                    <Icon icon="solar:cart-large-2-outline" fontSize={28} style={{ color: 'white' }} />
                  </div>
                ) : (
                  <div className="flex flex-row items-center">
                    <Icon icon="solar:cart-large-2-outline" fontSize={28} style={{ color: 'white' }} />
                    <span className="badge badge-sm badge-secondary">{items.length}</span>
                  </div>
                )}
              </label>
            </div>

            <div className="top-0 right-0 h-screen drawer-side z-[2000]">
              <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>

              <div className="menu bg-base-200 text-base-content min-h-full w-full sm:w-72 md:w-80 flex flex-col">

                <div className="flex items-center p-4 border-b border-base-300">
                  <h1 className="flex-1 text-lg font-semibold">Carrito de compras</h1>
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
                      <p className="text-center">
                        Agrega algunos productos antes de proceder con la compra
                      </p>
                    </div>
                  ) : (
                    items.map((item: any, inx: number) => {
                      const vbucks = getVbucks(item);
                      const priceShown = vbucksToAmount(vbucks, selectedCurrencyId);

                      return (
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
                                  {/* ✅ B) formateo bonito */}
                                  {formatMoney(priceShown, selectedCurrencyId)}
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
                      )
                    })
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
                          {/* ✅ B) formateo bonito */}
                          {formatMoney(total, selectedCurrencyId)}
                        </span>
                      </div>
                    </div>

                    <button className="btn btn-success btn-block gap-2" onClick={handlePay}>
                      Comprar
                      <Icon icon="solar:wallet-money-bold" fontSize={22} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {session?.user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full flex items-center">
                  <img
                    alt="User"
                    src={session?.user?.image ?? "/images/aquaprofile.png"}
                  />
                </div>
              </div>

              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
              >
                <li>
                  <a className="justify-between" href="/perfil">
                    Perfil
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setTheme(theme === 'corporate' ? 'dark' : 'corporate')}
                  >
                    Dark/Light
                  </button>
                </li>
                <li>
                  <button onClick={handleSignOut}>
                    Cerrar Sesion
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="dropdown dropdown-end">
              <a href="/auth" className="btn btn-primary m-0 p-0 w-30">
                Iniciar Sesión
              </a>
            </div>
          )}

        </div>
      </div>

      {!cartOpen && (
        <label
          htmlFor="my-drawer-4"
          aria-label="Abrir carrito"
          className="sm:hidden fixed z-[999999] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl active:scale-95"
          style={{
            bottom: "max(1.5rem, env(safe-area-inset-bottom))",
            right: "max(1.5rem, env(safe-area-inset-right))",
          }}
        >
          <Icon icon="solar:cart-large-2-outline" fontSize={28} style={{ color: "white" }} />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[22px] px-1.5 py-0.5 rounded-full bg-red-600 text-xs font-bold text-center leading-none">
              {items.length}
            </span>
          )}
        </label>
      )}
    </>
  );
};

export default Header;
