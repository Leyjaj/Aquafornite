import { cookies } from "next/headers";
import CosmeticsCatalog from "@/components/CosmeticsCatalog";
import { getAllSkins } from "@/lib/getAllSkins";

export default async function CosmeticosPage() {
  const cookieStore = await cookies();
  const rawLang = cookieStore.get("siteLang")?.value;
  const lang = rawLang === "en" || rawLang === "pt" ? rawLang : "es";

  const skins = await getAllSkins(lang);

  return <CosmeticsCatalog skins={skins} lang={lang} />;
}
