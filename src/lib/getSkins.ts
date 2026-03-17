import Skin, { SkinWithDiscount } from "@/interfaces/skin.interface";

interface Layout {
  id: string;
  name: string;
  rank: number;
}

export async function getSkins() {
  const res = await fetch("https://fortnite-api.com/v2/shop?language=es-419", {
    cache: "no-store",
    next: { revalidate: 0 },
  });

  const data = await res.json();

  const skinsRate = data.data.entries;

  const pricePer100: Record<string, number> = {
    USD: 0.36,
    MXN: 6.5,
    PEN: 1.3,
    EUR: 0.32,
    COP: 1300,
    CLP: 330,
    BOB: 2.5,
    BRL: 1.9,
  };

  const baseCurrency = "USD";
  const pricePerVbuck = (pricePer100[baseCurrency] ?? 0.36) / 100;

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

  const categories = ["Todos", ...Object.keys(test)];

  return { skins, categories };
}