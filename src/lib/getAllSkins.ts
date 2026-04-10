type SupportedLang = "es" | "en" | "pt";

const languageMap: Record<SupportedLang, string> = {
  es: "es-419",
  en: "en",
  pt: "pt-BR",
};

export type CatalogSkin = {
  id: string;
  name: string;
  image: string;
  rarity: string;
  type: string;
  vbucks: number;
  isEstimatedPrice: boolean;
};

const vbucksByRarity: Record<string, number> = {
  common: 800,
  uncommon: 800,
  rare: 1200,
  epic: 1500,
  legendary: 2000,
  icon: 1500,
  gaminglegends: 1500,
  marvel: 1500,
  dc: 1500,
  starwars: 1500,
};

export async function getAllSkins(lang: SupportedLang = "es", limit?: number) {
  const apiLang = languageMap[lang] || "es-419";

  const res = await fetch(
    `https://fortnite-api.com/v2/cosmetics/br?language=${apiLang}`,
    {
      cache: "no-store",
      next: { revalidate: 0 },
    }
  );

  const data = await res.json();
  const entries = Array.isArray(data?.data) ? data.data : [];

  let skins: CatalogSkin[] = entries
    .map((item: any) => ({
      id: String(item?.id ?? ""),
      name: String(item?.name ?? "Unknown"),
      image:
        item?.images?.icon ||
        item?.images?.smallIcon ||
        item?.images?.featured ||
        "/images/img.png",
      rarity: String(item?.rarity?.displayValue || item?.rarity?.value || "Common"),
      type: String(item?.type?.displayValue || item?.type?.value || "Cosmetic"),
      vbucks: vbucksByRarity[String(item?.rarity?.value || "").toLowerCase()] ?? 1200,
      isEstimatedPrice: true,
    }))
    .filter((item: CatalogSkin) => item.id && item.image);

  if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
    skins = skins.slice(0, limit);
  }

  return skins;
}
