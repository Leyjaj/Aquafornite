'use client'

import { useMemo, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useUser } from '@/hooks/useUser';

type HistoryItem = {
  id: string;
  type: 'purchase' | 'aquacoins' | string;
  total: number;
  vbucks?: number;
  cashback?: number;
  paymentMethod?: string | null;
  createdAt: string;
};

export default function UserPage() {
  const { user, isLoading } = useUser();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isLoading || !user?.id) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetch(`/api/history?userId=${user.id}`);
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [isLoading, user?.id]);

  const stats = useMemo(() => {
    const purchases = history.filter((h) => h.type === 'purchase');
    const coins = history.filter((h) => h.type === 'aquacoins');

    return {
      purchases: purchases.length,
      coinsTopups: coins.length,
      spentUsd: purchases.reduce((acc, item) => acc + (item.total || 0), 0),
      totalVbucks: purchases.reduce((acc, item) => acc + (item.vbucks || 0), 0),
      totalCashback: purchases.reduce((acc, item) => acc + (item.cashback || 0), 0),
    };
  }, [history]);

  const purchaseHistory = useMemo(
    () => history.filter((item) => item.type === 'purchase'),
    [history]
  );

  const rechargeHistory = useMemo(
    () => history.filter((item) => item.type === 'aquacoins'),
    [history]
  );

  const avatar = user?.image || '/images/aquaprofile.png';

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_left,_#0d3a7d_0%,_#0a2f67_45%,_#061534_100%)] px-3 pb-10 pt-24 text-white md:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur-md md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/25 bg-white/10">
                <Image src={avatar} alt="avatar" fill className="object-cover" />
              </div>

              <div>
                <h1 className="text-xl font-extrabold uppercase tracking-wide md:text-3xl">Historial</h1>
                <p className="text-sm text-white/75">Movimientos de compras y recargas de AquaCoins.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/user-profile" className="btn btn-sm md:btn-md btn-primary">
                Mi cuenta
              </Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
              <p className="text-[11px] uppercase text-white/65">Compras</p>
              <p className="text-lg font-bold">{stats.purchases}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
              <p className="text-[11px] uppercase text-white/65">Recargas</p>
              <p className="text-lg font-bold">{stats.coinsTopups}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
              <p className="text-[11px] uppercase text-white/65">Gastado</p>
              <p className="text-lg font-bold">${stats.spentUsd.toFixed(2)} USD</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
              <p className="text-[11px] uppercase text-white/65">V-Bucks</p>
              <p className="text-lg font-bold">{stats.totalVbucks.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 col-span-2 md:col-span-1">
              <p className="text-[11px] uppercase text-white/65">Cashback ganado</p>
              <p className="text-lg font-bold">{stats.totalCashback.toLocaleString()} AquaCoins</p>
            </div>
          </div>
        </section>

        {loadingHistory ? (
          <div className="mt-6 rounded-2xl border border-white/15 bg-black/20 p-8 text-center text-white/80">
            Cargando historial...
          </div>
        ) : history.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/15 bg-black/20 p-8 text-center">
            <h2 className="text-xl font-semibold">Aun no tienes movimientos</h2>
            <p className="mt-2 text-white/75">Cuando compres o recargues AquaCoins aparecera aqui.</p>
          </div>
        ) : (
          <section className="mt-6 space-y-6">
            <div>
              <h2 className="mb-3 text-lg font-bold">Historial de compras</h2>
              {purchaseHistory.length === 0 ? (
                <div className="rounded-xl border border-white/15 bg-black/20 p-4 text-sm text-white/75">
                  Aun no tienes compras registradas.
                </div>
              ) : (
                <div className="space-y-3">
                  {purchaseHistory.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-white/15 bg-black/25 p-4 backdrop-blur-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${item.paymentMethod === 'aquacoins' ? 'badge-warning' : 'badge-info'}`}>
                      {item.paymentMethod === 'aquacoins' ? 'Compra con AQ' : 'Compra'}
                    </span>
                    <span className="text-white/70 text-sm">#{item.id.slice(0, 8)}</span>
                  </div>

                  <span className="text-sm text-white/75">
                    {format(new Date(item.createdAt), 'yyyy-MM-dd / HH:mm')}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-4">
                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-white/60">Total</p>
                    <p className="font-bold">${(item.total || 0).toFixed(2)}</p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-white/60">V-Bucks</p>
                    <p className="font-bold">{(item.vbucks || 0).toLocaleString()}</p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-white/60">Cashback</p>
                    <p className="font-bold">{(item.cashback || 0).toLocaleString()} AQ</p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-white/60">Estado</p>
                    <p className="font-bold flex items-center gap-1">
                      <Icon icon="solar:check-circle-bold" width="18" className="text-emerald-400" />
                      Completado
                    </p>
                  </div>
                </div>
              </article>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold">Historial de recargas AquaCoins</h2>
              {rechargeHistory.length === 0 ? (
                <div className="rounded-xl border border-white/15 bg-black/20 p-4 text-sm text-white/75">
                  Aun no tienes recargas registradas.
                </div>
              ) : (
                <div className="space-y-3">
                  {rechargeHistory.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-white/15 bg-black/25 p-4 backdrop-blur-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-success">Recarga AquaCoins</span>
                    <span className="text-white/70 text-sm">#{item.id.slice(0, 8)}</span>
                  </div>

                  <span className="text-sm text-white/75">
                    {format(new Date(item.createdAt), 'yyyy-MM-dd / HH:mm')}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-white/60">AquaCoins</p>
                    <p className="font-bold">{Math.floor(item.total || 0)}</p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-white/60">V-Bucks</p>
                    <p className="font-bold">0</p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-white/60">Estado</p>
                    <p className="font-bold flex items-center gap-1">
                      <Icon icon="solar:check-circle-bold" width="18" className="text-emerald-400" />
                      Completado
                    </p>
                  </div>
                </div>
              </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
