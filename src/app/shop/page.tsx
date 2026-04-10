import Skins from '@/components/Skins';
import { getSkins } from "@/lib/getSkins";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Shop() {
  const cookieStore = await cookies();
  const rawLang = cookieStore.get("siteLang")?.value;
  const lang = rawLang === "en" || rawLang === "pt" ? rawLang : "es";

  const { skins, categories, nextRotation } = await getSkins(lang);

  const catalogLabel =
    lang === "en"
      ? "Browse full cosmetics catalog"
      : lang === "pt"
      ? "Ver catalogo completo de cosmeticos"
      : "Ver catalogo completo de cosmeticos";

  return (
    <div>
      <div className="px-4 pt-6">
        <div className="mx-auto max-w-7xl rounded-2xl border border-white/15 bg-black/25 p-3 text-white backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm md:text-base text-white/80">{catalogLabel}</p>
            <Link href="/cosmeticos" className="btn btn-sm btn-primary">
              {lang === "en" ? "All Cosmetics" : "Todos los cosmeticos"}
            </Link>
          </div>
        </div>
      </div>
      <Skins skins={skins} categories={categories} lang={lang} nextRotationAt={nextRotation} />
    </div>
  );
}
