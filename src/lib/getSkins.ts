import Skin, { SkinWithDiscount } from "@/interfaces/skin.interface";

interface Layout {
  id: string;
  name: string;
  rank: number;
}

type SupportedLang = "es" | "en" | "pt";

const languageMap: Record<SupportedLang, string> = {
  es: "es-419",
  en: "en",
  pt: "pt-BR",
};

const allCategoryMap: Record<SupportedLang, string> = {
  es: "Todos",
  en: "All",
  pt: "Todos",
};

export async function getSkins(lang: SupportedLang = "es") {
  const shopLanguage = languageMap[lang] || "es-419";

  const res = await fetch(`https://fortnite-api.com/v2/shop?language=${shopLanguage}`, {
    cache: "no-store",
    next: { revalidate: 0 },
  });

  const data = await res.json();
  const shopDate = data?.data?.date ? new Date(data.data.date) : null;
  const nextRotation = shopDate
    ? new Date(shopDate.getTime() + 24 * 60 * 60 * 1000).toISOString()
    : null;

  const skinsRate = data.data.entries;

  const pricePer100: Record<string, number> = {
    USD: 0.37,
    MXN: 6,
    PEN: 1.2,
    EUR: 0.3,
    COP: 1100,
    CLP: 400,
    BOB: 3.5,
    BRL: 1.9,
  };

  const baseCurrency = "USD";
  const pricePerVbuck = (pricePer100[baseCurrency] ?? 0.37) / 100;

  const skins: SkinWithDiscount[] = skinsRate.map((skin: any) => ({
    ...skin,
    discount: parseFloat((skin?.finalPrice * pricePerVbuck).toFixed(2)),
  }));

  let filteredSkins: Record<string, { layout: Layout; skins: Skin[] }> = {};

  skins.forEach((item: any) => {
    const layout = item.layout;

    if (!filteredSkins[layout?.name]) {
      filteredSkins[layout?.name] = {
        layout,
        skins: [],
      };
    }

    filteredSkins[layout?.name].skins.push(item);
  });

  const skinsSorted = Object.values(filteredSkins).sort(
    (a, b) => b.layout?.rank - a.layout?.rank
  );

  const test: Record<string, { layout: Layout; skins: Skin[] }> = {};

  skinsSorted.forEach((item) => {
    test[item.layout?.name] = item;
  });

  filteredSkins = test;

  const categories = [allCategoryMap[lang] || allCategoryMap.es, ...Object.keys(test)];

  return { skins, categories, nextRotation };
}
