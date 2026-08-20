import Skins from '@/components/Skins';
import { getSkins } from "@/lib/getSkins";
import { cookies } from "next/headers";

export default async function Shop() {
  const cookieStore = await cookies();
  const rawLang = cookieStore.get("siteLang")?.value;
  const lang = rawLang === "en" || rawLang === "pt" ? rawLang : "es";

  const { skins, categories, nextRotation } = await getSkins(lang);

  return (
    <div>
      <Skins skins={skins} categories={categories} lang={lang} nextRotationAt={nextRotation} />
    </div>
  );
}
