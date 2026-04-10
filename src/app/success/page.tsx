'use client'
import { useSkinCart } from "@/hooks/useSkinCart";
import { useUser } from "@/hooks/useUser";


import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { showToast } from "nextjs-toast-notify";

type ReceiptItem = {
    name: string;
    quantity: number;
    amount: number;
    currency: string;
    vbucks: number;
    itemId: string;
    offerId?: string;
};

type ReceiptData = {
    receiptId: string;
    paidAt: string;
    total: number;
    currency: string;
    nickname: string;
    items: ReceiptItem[];
};

function SuccessContent(){
    
    const {items, removeAll} =  useSkinCart();
    const { user, isLoading } = useUser();
    const [hasHandledSuccess, setHasHandledSuccess] = useState(false);
    const [paypalCaptured, setPaypalCaptured] = useState(false);
    const [receipt, setReceipt] = useState<ReceiptData | null>(null);
    const [loadingReceipt, setLoadingReceipt] = useState(false);
    const searchParams = useSearchParams();

    const provider = searchParams.get("provider");
    const paypalOrderId = searchParams.get("token");
    const stripeSessionId = searchParams.get("session_id");

    useEffect(() => {
        if (provider !== "paypal" || !paypalOrderId || paypalCaptured) return;

        const captureOrder = async () => {
            try {
                const res = await fetch('/api/paypal/capture-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ orderId: paypalOrderId })
                });

                const data = await res.json();

                if (!res.ok) {
                    showToast.error(data?.error || 'No se pudo confirmar pago PayPal', {
                        duration: 3500,
                        position: 'top-right',
                    });
                    return;
                }

                setPaypalCaptured(true);
                showToast.success('Pago PayPal confirmado', {
                    duration: 2200,
                    position: 'top-right',
                });
            } catch {
                showToast.error('Error de red confirmando PayPal', {
                    duration: 3500,
                    position: 'top-right',
                });
            }
        }

        captureOrder();
    }, [provider, paypalOrderId, paypalCaptured]);

    useEffect(() => {
        if (provider !== "stripe" || !stripeSessionId || loadingReceipt || receipt) return;

        const fetchReceipt = async () => {
            try {
                setLoadingReceipt(true);
                const res = await fetch(`/api/checkout/receipt?sessionId=${encodeURIComponent(stripeSessionId)}`);
                const data = await res.json();

                if (!res.ok) {
                    showToast.error(data?.error || "No se pudo cargar el recibo", {
                        duration: 3000,
                        position: "top-right",
                    });
                    return;
                }

                setReceipt(data);
            } catch {
                showToast.error("Error cargando recibo", {
                    duration: 3000,
                    position: "top-right",
                });
            } finally {
                setLoadingReceipt(false);
            }
        };

        fetchReceipt();
    }, [provider, stripeSessionId, loadingReceipt, receipt]);
    
    useEffect(() => {
        if (isLoading || hasHandledSuccess) return;
        if (items.length > 0) {
            removeAll();
        }
        setHasHandledSuccess(true);
    }, [isLoading, items.length, removeAll, hasHandledSuccess, user?.id]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
                <div className="mb-4 flex justify-center">
                    <Image src={'/images/check_circle.png'} alt="check" width={100} height={100}/>
                </div>
                <h1 className="text-3xl font-bold mb-2">Gracias!</h1>
                <p className="text-slate-950 mb-8">Tu compra fue exitosa </p>

                {loadingReceipt && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-left mb-6">
                        <p className="text-sm text-slate-600">Cargando recibo...</p>
                    </div>
                )}

                {receipt && (
                    <div className="rounded-xl border border-slate-200 bg-white p-5 text-left mb-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900">Recibo de Aqua Fornais Store</h2>
                        <p className="text-sm text-slate-500">Recibo #{receipt.receiptId}</p>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="rounded-lg border border-slate-200 p-3">
                                <p className="text-[11px] uppercase text-slate-500">Importe pagado</p>
                                <p className="font-bold text-slate-900">{receipt.currency} {receipt.total.toFixed(2)}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 p-3">
                                <p className="text-[11px] uppercase text-slate-500">Fecha de pago</p>
                                <p className="font-bold text-slate-900">{new Date(receipt.paidAt).toLocaleString()}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 p-3">
                                <p className="text-[11px] uppercase text-slate-500">Cuenta Fortnite</p>
                                <p className="font-bold text-slate-900">{receipt.nickname || "Sin nickname"}</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-semibold text-slate-700 mb-2">Resumen</p>
                            <div className="space-y-2">
                                {receipt.items.map((item, idx) => (
                                    <div key={`${item.itemId}-${idx}`} className="rounded-lg border border-slate-200 p-3">
                                        <div className="flex justify-between gap-3">
                                            <p className="font-medium text-slate-900">{item.name} x {item.quantity}</p>
                                            <p className="font-semibold text-slate-900">{item.currency} {item.amount.toFixed(2)}</p>
                                        </div>
                                        <p className="text-sm text-slate-600">{item.vbucks.toLocaleString()} V-Bucks</p>
                                        <p className="text-xs text-slate-500">Cosmetic ID: {item.itemId || "N/A"}</p>
                                        <p className="text-xs text-slate-500 break-all">Offer ID: {item.offerId || "N/A"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <Link href="/">
                    <button className="btn btn-primary">Volver a la inicio</button>
                </Link>
            </div>
        </div>
    )
}

export default function Success() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}
