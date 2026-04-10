'use client'

import { OrderSkins } from "@/utils/OrderSkins";
import { useState, useMemo, useEffect, FormEvent } from "react";
import Skin, {  SkinWithDiscount } from "@/interfaces/skin.interface";
import { showToast } from "nextjs-toast-notify";
import Link from "next/link";

import SkinGridInfinite from '@/components/InfiniteSkins';

type ShopLang = "es" | "en" | "pt";

const copy: Record<ShopLang, any> = {
  es: {
    all: "Todos",
    giftTitle: "Sistema de regalos",
    giftDesc: "Ingresa tu usuario o ID de Epic Games para guardar tu cuenta.",
    giftPlaceholder: "Usuario o ID de Epic Games",
    validating: "Validando...",
    saveAccount: "Guardar cuenta",
    activeAccount: "Cuenta activa",
    unnamed: "Sin nombre",
    searchPlaceholder: "Buscar por el nombre de la skin",
    rarityAll: "Todos",
    rarityEpic: "Epico",
    rarityRare: "Raro",
    rarityIcon: "Serie de Idolos",
    rarityUncommon: "Poco comun",
    sortHighLow: "Mayor a Menor",
    sortLowHigh: "Menor a Mayor",
    sortAsc: "Ascendente",
    sortDesc: "Descendente",
    toastEmpty: "Ingresa tu usuario o ID de Epic",
    toastSaved: "ID de Epic guardado",
    toastResolveError: "No se pudo obtener tu ID de Epic",
    toastLinked: "Cuenta de Epic vinculada",
    toastNetwork: "Error de red al validar cuenta",
    nextRotation: "Próxima rotación",
    friendNotice:
      "Para recibir tus cosméticos debes tener agregadas nuestras cuentas por mínimo 48 horas si es tu primera compra.",
    addBots: "Agregar cuentas",
  },
  en: {
    all: "All",
    giftTitle: "Gift System",
    giftDesc: "Enter your Epic username or ID to save your account.",
    giftPlaceholder: "Epic username or ID",
    validating: "Validating...",
    saveAccount: "Save account",
    activeAccount: "Active account",
    unnamed: "No name",
    searchPlaceholder: "Search by skin name",
    rarityAll: "All",
    rarityEpic: "Epic",
    rarityRare: "Rare",
    rarityIcon: "Icon Series",
    rarityUncommon: "Uncommon",
    sortHighLow: "High to Low",
    sortLowHigh: "Low to High",
    sortAsc: "Ascending",
    sortDesc: "Descending",
    toastEmpty: "Enter your Epic username or ID",
    toastSaved: "Epic ID saved",
    toastResolveError: "Could not resolve your Epic ID",
    toastLinked: "Epic account linked",
    toastNetwork: "Network error while validating account",
    nextRotation: "Next rotation",
    friendNotice:
      "To receive your cosmetics, you must have our accounts added for at least 48 hours if this is your first purchase.",
    addBots: "Add accounts",
  },
  pt: {
    all: "Todos",
    giftTitle: "Sistema de presentes",
    giftDesc: "Informe seu usuario ou ID da Epic Games para salvar sua conta.",
    giftPlaceholder: "Usuario ou ID da Epic Games",
    validating: "Validando...",
    saveAccount: "Salvar conta",
    activeAccount: "Conta ativa",
    unnamed: "Sem nome",
    searchPlaceholder: "Buscar pelo nome da skin",
    rarityAll: "Todos",
    rarityEpic: "Epico",
    rarityRare: "Raro",
    rarityIcon: "Serie de Icones",
    rarityUncommon: "Incomum",
    sortHighLow: "Maior para Menor",
    sortLowHigh: "Menor para Maior",
    sortAsc: "Ascendente",
    sortDesc: "Descendente",
    toastEmpty: "Informe seu usuario ou ID da Epic",
    toastSaved: "ID da Epic salvo",
    toastResolveError: "Nao foi possivel obter seu ID da Epic",
    toastLinked: "Conta da Epic vinculada",
    toastNetwork: "Erro de rede ao validar conta",
    nextRotation: "Próxima rotação",
    friendNotice:
      "Para receber seus cosméticos, você precisa ter nossas contas adicionadas por no mínimo 48 horas se for sua primeira compra.",
    addBots: "Adicionar contas",
  },
};

const Skins = ({
  skins,
  categories,
  lang = "es",
  nextRotationAt,
}: {
  skins: SkinWithDiscount[];
  categories: string[];
  lang?: ShopLang;
  nextRotationAt?: string | null;
}) => {
  const text = copy[lang] || copy.es;
  const allCategoryLabel = categories[0] || text.all;

  const [searchQuery, setSearchQuery] = useState("");

  const [rarity, setRarity] = useState("All");
  const [category, setCategory] = useState(allCategoryLabel);

  const [sortBy, setSortBy] = useState("");

  const [listSkins, setListSkins] = useState<Skin[]>([]);
  const [listCategory, setListCategory] = useState<string[]>(["Todos"]);
  const [epicInput, setEpicInput] = useState("");
  const [epicId, setEpicId] = useState("");
  const [epicName, setEpicName] = useState("");
  const [isResolvingEpic, setIsResolvingEpic] = useState(false);
  const [nowTs, setNowTs] = useState<number>(Date.now());



  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setSearchQuery(formData.get("search") as string);
    setRarity(formData.get("rarity") as string);
    setCategory(formData.get("category") as string);
    console.log(formData.get('search') as string)

  }

  useEffect(() => {
    const savedId = localStorage.getItem("fortniteId") || "";
    const savedName = localStorage.getItem("nickname") || "";

    setEpicId(savedId);
    setEpicName(savedName);
    setEpicInput(savedName || savedId);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTs(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeToRotation = useMemo(() => {
    if (!nextRotationAt) return "--:--:--";

    const target = new Date(nextRotationAt).getTime();
    const diff = target - nowTs;

    if (!Number.isFinite(target) || diff <= 0) return "00:00:00";

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [nextRotationAt, nowTs]);

  const handleEpicSave = async () => {
    const value = epicInput.trim();

    if (!value) {
      showToast.info(text.toastEmpty, {
        duration: 2500,
        position: "top-right",
      });
      return;
    }

    const looksLikeId = /^[a-f0-9]{32}$/i.test(value);

    if (looksLikeId) {
      localStorage.setItem("fortniteId", value);
      localStorage.setItem("nickname", epicName || value);
      setEpicId(value);
      if (!epicName) setEpicName(value);
      showToast.success(text.toastSaved, {
        duration: 2200,
        position: "top-right",
      });
      return;
    }

    try {
      setIsResolvingEpic(true);

      const res = await fetch(`/api/epic/resolve?name=${encodeURIComponent(value)}`);
      const data = await res.json();

      if (!res.ok || !data?.id) {
        showToast.error(data?.error || text.toastResolveError, {
          duration: 3000,
          position: "top-right",
        });
        return;
      }

      localStorage.setItem("fortniteId", data.id);
      localStorage.setItem("nickname", data.name || value);

      setEpicId(data.id);
      setEpicName(data.name || value);
      setEpicInput(data.name || value);

      showToast.success(text.toastLinked, {
        duration: 2200,
        position: "top-right",
      });
    } catch (error) {
      console.error("Epic resolve failed:", error);
      showToast.error(text.toastNetwork, {
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsResolvingEpic(false);
    }
  };

  const filteredSkins = useMemo(() => {
    return OrderSkins(skins, {
      rarity: rarity,
      category: category,
      search: searchQuery,
      sortBy: sortBy,
    })

  }, [rarity, category, searchQuery,sortBy])


  const rari = [
    { key: "All", label: text.rarityAll },
    { key: "epic", label: text.rarityEpic },
    { key: "rare", label: text.rarityRare },
    { key: "icon", label: text.rarityIcon },
    { key: "uncommon", label: text.rarityUncommon },
  ]

   const sortByItems = [
    { key: "price_desc", label: text.sortHighLow },
    { key: "price_asc", label: text.sortLowHigh },
    { key: "name_asc", label: text.sortAsc },
    { key: "name_desc", label: text.sortDesc },
  ]
  return (
    <main className="pt-4 w-full flex flex-col min-h-screen p-2 bg-[radial-gradient(ellipse_at_left,_#0774BB_0%,_#052F6F_75%,_#040A3F_100%)] bg-fixed">
      <div className="w-full p-3">
        <div className="w-full rounded-2xl border border-white/15 bg-black/25 p-3.5 backdrop-blur-md">
          <h2 className="text-lg md:text-xl font-bold text-white">{text.giftTitle}</h2>
          <p className="text-white/70 text-sm mt-1">{text.giftDesc}</p>

          <div className="mt-2 rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
            <p>{text.friendNotice}</p>
            <Link href="/cuentas-bots" className="btn btn-xs btn-info mt-2 border-none">
              {text.addBots}
            </Link>
          </div>

          <div className="mt-2.5 flex flex-col md:flex-row gap-2">
            <input
              value={epicInput}
              onChange={(e) => setEpicInput(e.target.value)}
              type="text"
              placeholder={text.giftPlaceholder}
              className="input w-full border-none placeholder-white/50 font-poppins rounded-[8px] text-white bg-black/35 backdrop-blur-md outline-[2px] outline-transparent outline-offset-2 hover:outline-2px hover:outline-blue-100"
            />

            <button
              type="button"
              onClick={handleEpicSave}
              disabled={isResolvingEpic}
              className="btn btn-primary min-w-38"
            >
              {isResolvingEpic ? text.validating : text.saveAccount}
            </button>
          </div>

          {epicId && (
            <p className="text-sm text-white/85 mt-1.5">
              {text.activeAccount}: <span className="font-bold">{epicName || text.unnamed}</span> ({epicId})
            </p>
          )}
        </div>
      </div>

      <div className="w-full bg-content1 p-4 md:p-6">

        <form className="flex flex-col md:flex-row gap-4 flex-wrap">
          <div className="w-full md:flex-1 ">
            <input
              onChange={e => setSearchQuery(e.target.value)}
              
              type="search"
              placeholder={text.searchPlaceholder}
              className="inputs border-none placeholder-white-50 font-poppins rounded-[8px] text-white w-full bg-black/30 backdrop-blur-md input outline-[2px] outline-transparent outline-offset-2 hover:outline-2px hover:outline-blue-100"
              name="search"
            />
          </div>
          
          <div className="w-full md:w-64">
            <select
              defaultValue=" Pick a color"
              className="select w-full border-none placeholder-white-50 font-poppins rounded-[8px] text-white w-full bg-black/30 backdrop-blur-md outline-[2px] outline-transparent outline-offset-2 hover:outline-2px hover:outline-blue-100"
              onChange={e => setRarity(e.target.value)}
              name="rarity"
            >
              {rari.map((item) => (
                <option
                  key={item.key}
                  value={item.key}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-64">
            <select
              onChange={e => setCategory(e.target.value)}
              className=" w-full select border-none placeholder-white-50 font-poppins rounded-[8px] text-white w-full bg-black/30 backdrop-blur-md outline-[2px] outline-transparent outline-offset-2 hover:outline-2px hover:outline-blue-100"
              name="category"
            >
              {categories?.map((item, inx) => (
                <option
                  key={inx}
                  value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          {/** 
           * 
           <div className="w-full md:w-auto md:self-end">
            <button className="btn btn-active btn-primary" type="submit">Filtrar</button>
          </div>
          */}
          <div className="w-full md:w-64">
            <select
              defaultValue="Pick a color"
              className=" w-full select border-none placeholder-white-50 font-poppins rounded-[8px] text-white w-full bg-black/30 backdrop-blur-md outline-[2px] outline-transparent outline-offset-2 hover:outline-2px hover:outline-blue-100"
              name="order"
              onChange={e => {
                setSortBy(e.target.value)
              }}
            >
              {sortByItems.map((item) => (
                <option
                  key={item.key}
                  value={item.key}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

        </form>

        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80">
          <span className="font-semibold">{text.nextRotation}:</span>
          <span className="font-mono text-white">{timeToRotation}</span>
        </div>

      </div>
      <SkinGridInfinite groupedSkins={filteredSkins.filteredSkins} />
    </main>
  );
}

export default Skins;
