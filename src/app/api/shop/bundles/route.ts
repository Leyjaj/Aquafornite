import { NextResponse } from "next/server";

export const runtime = "nodejs";

const languageMap: Record<string, string> = {
  es: "es-419",
  en: "en",
  pt: "pt-BR",
};

const normalizeColor = (input: unknown, fallback: string) => {
  const raw = String(input || "").trim().replace("#", "");
  if (!raw) return fallback;
  if (raw.length === 8) return `#${raw.slice(0, 6)}`;
  if (raw.length === 6) return `#${raw}`;
  return fallback;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const lang = String(url.searchParams.get("lang") || "es").toLowerCase();
    const apiLang = languageMap[lang] || "es-419";

    const response = await fetch(`https://fortnite-api.com/v2/shop?language=${apiLang}`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    const data = await response.json();
    const entries = Array.isArray(data?.data?.entries) ? data.data.entries : [];

    const bundles = entries
      .map((entry: any, index: number) => {
        const name = String(
          entry?.bundle?.name ||
            entry?.brItems?.[0]?.name ||
            entry?.title ||
            entry?.layout?.name ||
            ""
        ).trim();

        const finalPrice = Number(entry?.finalPrice ?? 0);
        const regularPrice = Number(entry?.regularPrice ?? finalPrice);
        const image =
          entry?.newDisplayAsset?.renderImages?.[0]?.image ||
          entry?.bundle?.image ||
          entry?.brItems?.[0]?.images?.featured ||
          entry?.brItems?.[0]?.images?.icon ||
          "";

        return {
          id: String(entry?.offerId || entry?.mainId || `${name}-${index}`),
          name,
          finalPrice,
          regularPrice,
          image,
          itemCount: Array.isArray(entry?.brItems) ? entry.brItems.length : 0,
          fitMode:
            (Array.isArray(entry?.brItems) ? entry.brItems.length : 0) <= 2
              ? "portrait"
              : (Array.isArray(entry?.brItems) ? entry.brItems.length : 0) >= 7
              ? "wide"
              : "balanced",
          bgFrom: normalizeColor(entry?.colors?.color1, "#f59f0b"),
          bgVia: normalizeColor(entry?.colors?.color2, "#f3ad2f"),
          bgTo: normalizeColor(entry?.colors?.color3, "#e9c95f"),
          isBundle:
            String(entry?.layout?.id || "").toLowerCase().includes("bundle") ||
            String(entry?.layout?.name || "").toLowerCase().includes("bundle") ||
            Array.isArray(entry?.brItems) && entry.brItems.length > 1,
        };
      })
      .filter((item: any) => item.name && item.image && item.finalPrice > 0 && item.isBundle)
      .sort((a: any, b: any) => b.finalPrice - a.finalPrice);

    const unique: any[] = [];
    const seen = new Set<string>();

    for (const item of bundles) {
      const key = `${item.name}-${item.finalPrice}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
      if (unique.length >= 12) break;
    }

    return NextResponse.json({ bundles: unique }, { status: 200 });
  } catch (error) {
    console.error("SHOP BUNDLES ERROR:", error);
    return NextResponse.json({ bundles: [] }, { status: 200 });
  }
}
