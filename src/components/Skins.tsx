'use client'

import { OrderSkins } from "@/utils/OrderSkins";
import { useState, useMemo, useEffect, FormEvent } from "react";
import Skin, {  SkinWithDiscount } from "@/interfaces/skin.interface";
import { showToast } from "nextjs-toast-notify";
import Link from "next/link";
import { Icon } from "@iconify/react";

import SkinGridInfinite from '@/components/InfiniteSkins';

type ShopLang = "es" | "en" | "pt";

const copy: Record<ShopLang, any> = {
  es: {
    all: "Todos",
    giftTitle: "Sistema de regalos",
    giftEyebrow: "Entrega de skins",
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
      "Debes tener agregada una de nuestras cuentas de entrega durante al menos 48 horas antes de comprar una skin.",
    friendSteps: "Así funciona la entrega",
    friendStepOne: "Agrega una de nuestras cuentas de entrega.",
    friendStepTwo: "Espera 48 horas si es tu primera compra.",
    friendStepThree: "Guarda tu cuenta y realiza tu pedido.",
    accountHint: "Esta cuenta se usará para entregar tus skins.",
    addBots: "Agregar cuentas",
  },
  en: {
    all: "All",
    giftTitle: "Gift System",
    giftEyebrow: "Skin delivery",
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
      "You must have one of our delivery accounts added for at least 48 hours before buying a skin.",
    friendSteps: "How delivery works",
    friendStepOne: "Add one of our delivery accounts.",
    friendStepTwo: "Wait 48 hours if this is your first purchase.",
    friendStepThree: "Save your account and place your order.",
    accountHint: "This account will be used to deliver your skins.",
    addBots: "Add accounts",
  },
  pt: {
    all: "Todos",
    giftTitle: "Sistema de presentes",
    giftEyebrow: "Entrega de skins",
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
      "Você precisa ter uma de nossas contas de entrega adicionada por pelo menos 48 horas antes de comprar uma skin.",
    friendSteps: "Como funciona a entrega",
    friendStepOne: "Adicione uma de nossas contas de entrega.",
    friendStepTwo: "Aguarde 48 horas se for sua primeira compra.",
    friendStepThree: "Salve sua conta e faça seu pedido.",
    accountHint: "Essa conta será usada para entregar suas skins.",
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
        <div className="w-full overflow-hidden rounded-2xl border border-white/15 bg-black/25 backdrop-blur-md">
          <div className="border-b border-white/10 bg-gradient-to-r from-cyan-300/10 via-transparent to-transparent p-4 md:p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-200">
                <Icon icon="solar:gift-bold" width="25" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                  {text.giftEyebrow}
                </p>
                <h2 className="mt-1 text-lg font-bold text-white md:text-xl">{text.giftTitle}</h2>
                <p className="mt-1 text-sm text-white/65">{text.giftDesc}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-[1.05fr_1fr] md:p-5">
            <div className="rounded-xl border border-cyan-300/25 bg-cyan-400/10 p-4">
              <div className="flex items-start gap-2.5">
                <Icon className="mt-0.5 shrink-0 text-cyan-200" icon="solar:info-circle-bold" width="21" />
                <div>
                  <p className="text-sm font-semibold text-cyan-50">{text.friendSteps}</p>
                  <p className="mt-1 text-xs leading-5 text-cyan-100/80">{text.friendNotice}</p>
                </div>
              </div>

              <ol className="mt-4 space-y-2.5 text-xs text-white/80">
                {[text.friendStepOne, text.friendStepTwo, text.friendStepThree].map((step, index) => (
                  <li key={step} className="flex items-center gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/20 text-[10px] font-bold text-cyan-100">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              <Link href="/cuentas-bots" className="btn btn-sm mt-4 border-none bg-cyan-400 text-[#04234f] hover:bg-cyan-300">
                <Icon icon="solar:user-plus-bold" width="17" />
                {text.addBots}
              </Link>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/60" htmlFor="epic-account">
                {text.giftPlaceholder}
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  id="epic-account"
                  value={epicInput}
                  onChange={(e) => setEpicInput(e.target.value)}
                  type="text"
                  placeholder={text.giftPlaceholder}
                  className="input w-full border-white/10 bg-[#031b3a]/80 font-poppins text-white placeholder-white/40 outline-transparent focus:border-cyan-300/60 focus:outline-2 focus:outline-cyan-300/30"
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

              {epicId ? (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100">
                  <Icon className="mt-0.5 shrink-0" icon="solar:check-circle-bold" width="17" />
                  <p>
                    {text.activeAccount}: <span className="font-bold">{epicName || text.unnamed}</span>
                    <span className="block break-all text-emerald-100/70">{epicId}</span>
                    <span className="mt-1 block text-emerald-100/70">{text.accountHint}</span>
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-white/45">{text.accountHint}</p>
              )}
            </div>
          </div>
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
