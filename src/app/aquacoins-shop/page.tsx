import { cookies } from "next/headers";
import AquaCoinsShop from "@/components/AquaCoinsShop";
import { getSkins } from "@/lib/getSkins";

export default async function AquaCoinsShopPage() {
  const cookieStore = await cookies();
  const rawLang = cookieStore.get("siteLang")?.value;
  const lang = rawLang === "en" || rawLang === "pt" ? rawLang : "es";

  const { skins } = await getSkins(lang);

  return <AquaCoinsShop skins={skins} />;
}
