'use client'

import { useEffect, useState } from "react";
import Link from "next/link";

import { Icon } from "@iconify/react";
import { useSkinCart } from "@/hooks/useSkinCart";
import { useRouter } from "next/navigation";
import SelectedItems from "./SelectedItems";
import { signOut, useSession } from "@/lib/auth-client";
import Skin from "@/interfaces/skin.interface";
import { useCurrency } from "@/hooks/useCurrency";

const countryOptions = [
    { id: "usd", label: "DOLAR", icon: <Icon icon="emojione-v1:flag-for-united-states" fontSize={28} style={{ color: 'white' }} /> },
    { id: "mx", label: "MXN", icon: <Icon icon="emojione-v1:flag-for-mexico" fontSize={28} style={{ color: 'white' }} /> },
    { id: "sol", label: "PEN", icon: <Icon icon="emojione-v1:flag-for-peru" fontSize={28} style={{ color: 'white' }} /> },
]

const Header = () => {

    const [theme, setTheme] = useState('corporate');

    const { data: session } = useSession();
    const { items, removeAll, removeItem } = useSkinCart()
    const { currency, rates } = useCurrency();

    const router = useRouter();

    const skins = items.map(skin => skin.discount)
    const total = skins.reduce((total, price) => total + price, 0)

    useEffect(() => {
        document.querySelector('html')?.setAttribute('data-theme', theme);
    }, [theme])

    const handlePay = async () => {

        const formatedItems = items.map(item => ({
            name: item.bundle?.name || item.brItems?.[0].name || item.tracks?.[0].title,
            price: item.discount,
            images: item?.newDisplayAsset?.renderImages[0].image,
            quantity: 1,
        }))

        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: session?.user?.id ?? null,
                items: formatedItems,
            }),
        })

        const { url } = await response.json();
        window.location.href = url
    }

    const handleCountryChange = (value: any) => {
        console.log("País seleccionado:", value.id)
    }

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push("/");
        } catch (e) {
            console.error("Error", e)
        }
    }

    const getBackgroundStyle = (skin: Skin) => {

        const colors = skin?.colors;

        if (!colors) {
            return { background: '#333' };
        }

        const colorStops = [];

        if (colors.color1) colorStops.push(`#${colors.color1}`);
        if (colors.color2) colorStops.push(`#${colors.color3}`);

        return { background: `linear-gradient(to bottom, ${colorStops.join(', ')})` };

    };

    return (

        <div className="fixed z-1000 w-full flex flex-row items-center justify-between bg-black/10 backdrop-blur-md navbar shadow-sm px-8 z-3">

            <div className="flex items-center">

                <div className="flex-1 flex-row items-center justify-center mt-2">

                    {/* LOGO → AHORA MANDA AL HOME */}
                    <Link href="/" className="font-fortnite text-3xl text-white hover:opacity-80 transition">
                        AQUAFORNAIS
                    </Link>

                </div>

            </div>

            <div className="flex items-center">

                <SelectedItems options={countryOptions} onChange={handleCountryChange} />

                <div className="drawer drawer-end">

                    <input id="my-drawer-4" type="checkbox" className="drawer-toggle btn btn-ghost btn-circle" />

                    <div className="drawer-content">

                        <label htmlFor="my-drawer-4" className="drawer-button border-none btn btn-ghost hover:bg-transparent hover:border-none ">

                            {
                                items.length === 0
                                    ?
                                    <div className="flex flex-row">
                                        <Icon icon="solar:cart-large-2-outline" fontSize={28} style={{ color: 'white' }} />
                                    </div>
                                    :
                                    <div className="flex flex-row items-center">
                                        <Icon icon="solar:cart-large-2-outline" fontSize={28} style={{ color: 'white' }} />
                                        <span className="badge badge-sm badge-secondary">{items.length}</span>
                                    </div>
                            }

                        </label>

                    </div>

                    <div className="top-0 right-0 h-screen drawer-side z-[1000]">

                        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>

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

                                        <p className="text-center">
                                            Agrega algunos productos antes de proceder con la compra
                                        </p>

                                    </div>

                                ) : (

                                    items.map((item, inx) => (

                                        <div key={inx}>

                                            <div className="w-full flex flex-row gap-4">

                                                <div
                                                    className="size-24 shrink-0 overflow-hidden rounded-md"
                                                    style={getBackgroundStyle(item)}
                                                >

                                                    <img
                                                        className="size-full object-cover"
                                                        src={item.newDisplayAsset?.renderImages[0].image || item.tracks[0]?.albumArt}
                                                        alt=""
                                                    />

                                                </div>

                                                <div className="flex flex-1 flex-col">

                                                    <div className="flex justify-between font-medium">

                                                        <h3 className="text-sm line-clamp-2">
                                                            {item?.bundle?.name || item.brItems?.[0].name || item.tracks?.[0].title}
                                                        </h3>

                                                        <p className="ml-4 whitespace-nowrap">${item.discount}</p>

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
                                            <span className="text-lg font-bold text-info">${total.toFixed(2)}</span>
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

                {
                    session?.user ?

                        <div className="dropdown dropdown-end">

                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">

                                <div className="w-10 rounded-full flex items-center">

                                    <img
                                        alt="profile"
                                        src={session?.user?.image ?? "/images/aquaprofile.png"}
                                    />

                                </div>

                            </div>

                            <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">

                                <li>
                                    <a href="/perfil">
                                        Perfil
                                    </a>
                                </li>

                                <li>
                                    <button onClick={() => setTheme(theme === 'corporate' ? 'dark' : 'corporate')}>
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

                        :

                        <div className="dropdown dropdown-end">

                            <a href="/auth" className="btn btn-primary m-0 p-0 w-30 ">
                                Iniciar Sesión
                            </a>

                        </div>
                }

            </div>

        </div>

    );

};

export default Header;