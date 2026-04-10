'use client'

import { useEffect, useMemo, useRef, useState } from "react";
import type { CatalogSkin } from "@/lib/getAllSkins";
import { useSession } from "@clerk/nextjs";
import { showToast } from "nextjs-toast-notify";

type ShopLang = "es" | "en" | "pt";

const copy: Record<ShopLang, any> = {
  es: {
    title: "Catalogo Completo de Cosmeticos",
    subtitle: "Explora cosmeticos del juego para planear tus compras y regalos.",
    search: "Buscar cosmetico...",
    showing: "Mostrando",
    noResults: "No se encontraron skins con ese nombre.",
    added: "Agregado a wishlist",
    removed: "Quitado de wishlist",
    signInFirst: "Inicia sesion para usar wishlist",
    approx: "aprox.",
    allTypes: "Todos",
    loadingMore: "Cargando mas...",
    markOwned: "Ya la tengo",
    owned: "En mi locker",
  },
  en: {
    title: "Complete Cosmetics Catalog",
    subtitle: "Browse game cosmetics to plan purchases and gifts.",
    search: "Search cosmetic...",
    showing: "Showing",
    noResults: "No skins found for that search.",
    added: "Added to wishlist",
    removed: "Removed from wishlist",
    signInFirst: "Sign in to use wishlist",
    approx: "approx.",
    allTypes: "All",
    loadingMore: "Loading more...",
    markOwned: "I own this",
    owned: "In my locker",
  },
  pt: {
    title: "Catalogo Completo de Cosmeticos",
    subtitle: "Explore cosmeticos do jogo para planejar compras e presentes.",
    search: "Buscar cosmetico...",
    showing: "Mostrando",
    noResults: "Nenhuma skin encontrada para essa busca.",
    added: "Adicionado a wishlist",
    removed: "Removido da wishlist",
    signInFirst: "Faca login para usar wishlist",
    approx: "aprox.",
    allTypes: "Todos",
    loadingMore: "Carregando mais...",
    markOwned: "Ja tenho",
    owned: "No meu locker",
  },
};

const INITIAL_RENDER = 120;
const RENDER_STEP = 120;
const OWNED_STORAGE_KEY = "ownedCosmetics";

export default function CosmeticsCatalog({
  skins,
  lang = "es",
}: {
  skins: CatalogSkin[];
  lang?: ShopLang;
}) {
  const text = copy[lang] || copy.es;
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("__all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_RENDER);
  const { isSignedIn, isLoaded } = useSession();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const types = useMemo(() => {
    const unique = Array.from(new Set(skins.map((skin) => skin.type).filter(Boolean)));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [skins]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(OWNED_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setOwnedIds(new Set(parsed.map((id: unknown) => String(id)).filter(Boolean)));
      }
    } catch {
      setOwnedIds(new Set());
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setSavedIds(new Set());
      return;
    }

    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const ids = new Set<string>(
          Array.isArray(data) ? data.map((item: any) => String(item.skinId)).filter(Boolean) : []
        );
        setSavedIds(ids);
      })
      .catch(() => setSavedIds(new Set()));
  }, [isLoaded, isSignedIn]);

  const toggleOwned = (skinId: string) => {
    setOwnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(skinId)) next.delete(skinId);
      else next.add(skinId);
      localStorage.setItem(OWNED_STORAGE_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skins.filter((skin) => {
      const matchType = selectedType === "__all" || skin.type === selectedType;
      const matchQuery = !q || skin.name.toLowerCase().includes(q);
      return matchType && matchQuery;
    });
  }, [skins, query, selectedType]);

  const visibleSkins = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  useEffect(() => {
    setVisibleCount(INITIAL_RENDER);
  }, [query, selectedType]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;

        setVisibleCount((prev) => {
          if (prev >= filtered.length) return prev;
          return Math.min(prev + RENDER_STEP, filtered.length);
        });
      },
      {
        rootMargin: "500px 0px 500px 0px",
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filtered.length]);

  const toggleWishlist = async (skin: CatalogSkin) => {
    if (!isSignedIn) {
      showToast.info(text.signInFirst, {
        duration: 2500,
        position: "top-right",
      });
      return;
    }

    const alreadySaved = savedIds.has(skin.id);

    try {
      const res = await fetch("/api/wishlist", {
        method: alreadySaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          alreadySaved
            ? { skinId: skin.id }
            : {
                skinId: skin.id,
                name: skin.name,
                image: skin.image,
                price: skin.vbucks,
              }
        ),
      });

      if (!res.ok) return;

      setSavedIds((prev) => {
        const next = new Set(prev);
        if (alreadySaved) next.delete(skin.id);
        else next.add(skin.id);
        return next;
      });

      showToast.success(alreadySaved ? text.removed : text.added, {
        duration: 1800,
        position: "top-right",
      });
    } catch {
      return;
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_left,_#0d3a7d_0%,_#0a2f67_45%,_#061534_100%)] px-3 pb-10 pt-24 text-white md:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur-md md:p-6">
          <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-wide">{text.title}</h1>
          <p className="mt-2 text-white/75">{text.subtitle}</p>

          <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder={text.search}
              className="input input-sm md:input-md w-full md:max-w-xl border-white/15 bg-black/35 text-white placeholder:text-white/50"
            />
            <span className="text-sm text-white/75">
              {text.showing} <strong className="text-white">{visibleSkins.length}</strong> / {filtered.length}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <div className="flex min-w-max items-center gap-2 pb-1">
              <button
                type="button"
                onClick={() => setSelectedType("__all")}
                className={`btn btn-sm rounded-xl ${
                  selectedType === "__all" ? "btn-primary" : "btn-ghost bg-white/10 text-white"
                }`}
              >
                {text.allTypes}
              </button>

              {types.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`btn btn-sm rounded-xl whitespace-nowrap ${
                    selectedType === type ? "btn-primary" : "btn-ghost bg-white/10 text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </section>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/15 bg-black/20 p-6 text-center text-white/80">
            {text.noResults}
          </div>
        ) : (
          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
            {visibleSkins.map((skin) => (
              <article
                key={skin.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/15 bg-black/30 shadow-[0px_10px_30px_-18px_rgba(0,0,0,0.9)]"
              >
                {ownedIds.has(skin.id) && (
                  <span className="badge badge-info absolute left-2 top-2 z-20 border-none">
                    {text.owned}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => toggleWishlist(skin)}
                  className={`absolute right-2 top-2 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/45 text-xl backdrop-blur-sm transition ${
                    savedIds.has(skin.id) ? "text-red-500" : "text-white"
                  }`}
                >
                  ♥
                </button>

                <button
                  type="button"
                  onClick={() => toggleOwned(skin.id)}
                  className={`btn btn-xs absolute right-2 z-20 border-none ${
                    ownedIds.has(skin.id) ? "btn-success" : "btn-ghost bg-black/60 text-white"
                  } top-12`}
                >
                  {text.markOwned}
                </button>

                <img
                  src={skin.image}
                  alt={skin.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-2 pb-2 pt-8">
                  <h3 className="truncate text-xs font-semibold md:text-sm">{skin.name}</h3>
                  <p className="text-[11px] text-white/75 md:text-xs">{skin.type} · {skin.rarity}</p>
                  <p className="text-[11px] text-white/85 md:text-xs">
                    {skin.vbucks.toLocaleString()} V-Bucks
                  </p>
                </div>
              </article>
            ))}
          </section>
        )}

        {visibleSkins.length < filtered.length && (
          <div ref={loadMoreRef} className="mt-6 rounded-xl border border-white/10 bg-black/20 p-3 text-center text-sm text-white/75">
            {text.loadingMore}
          </div>
        )}
      </div>
    </main>
  );
}
