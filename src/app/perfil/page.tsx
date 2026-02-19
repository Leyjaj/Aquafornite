'use client'

import Header from "@/components/Header";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";

export default function Page() {

    const { user, isLoading } = useUser();
    const { data: session } = useSession();
    const [history, setHistory] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const res = await fetch(`/api/history?userId=${user.id}`);
                const data = await res.json();
                setHistory(data);
            } catch (err) {
                console.error("Error al obtener historial:", err);
            }
        };

        fetchHistory();
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin border-4 border-blue-500 border-t-transparent rounded-full w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="bg-[radial-gradient(ellipse_at_left,_#0774BB_0%,_#052F6F_75%,_#040A3F_100%)] bg-fixed">
            <Header />

            <div className="pt-20 w-full h-screen flex justify-center align-center">
                <div className="gap-1 h-full px-6 flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col max-w-[920px] flex-1">

                        {/* PERFIL */}
                        <div className="flex p-4">
                            <div className="flex w-full flex-col gap-4 items-center">

                                <div className="avatar">
                                    <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring-2 ring-offset-2">
                                        <img
                                            src={session?.user?.image ?? "/images/aquaprofile.png"}
                                            alt="avatar"
                                        />
                                    </div>
                                </div>

                                <p className="text-white text-[22px] font-bold">
                                    {session?.user?.name}
                                </p>

                                <p className="text-slate-200">
                                    {user?.discord_name}
                                </p>

                            </div>
                        </div>

                        {/* HISTORIAL */}
                        <h2 className="text-white text-[22px] font-bold px-4 pb-3 pt-5">
                            Historial de compra
                        </h2>

                        <div className="overflow-x-auto h-full">
                            <table className="table bg-slate-200">

                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Contenido</th>
                                        <th>Total</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        history.length > 0 ? (
                                            history.map((elm, idx) => (
                                                <tr key={idx}>

                                                    <td>{elm.id}</td>

                                                    <td>
                                                        {
                                                            elm.type === "purchase"
                                                                ? (
                                                                    <select className="select">
                                                                        {
                                                                            JSON.parse(elm.items || "[]").map((item:any, i:number) => (
                                                                                <option key={i}>{item.name}</option>
                                                                            ))
                                                                        }
                                                                    </select>
                                                                )
                                                                :
                                                                <span className="badge badge-info">
                                                                    Recarga AquaCoins
                                                                </span>
                                                        }
                                                    </td>

                                                    <td>
                                                        <span className="badge badge-success">
                                                            {elm.total}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {new Date(elm.createdAt).toLocaleDateString()}
                                                    </td>

                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4}>No hay pedidos registrados.</td>
                                            </tr>
                                        )
                                    }
                                </tbody>

                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
