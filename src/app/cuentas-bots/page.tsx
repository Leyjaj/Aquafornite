"use client";

import { useState } from "react";

type Lang = "es" | "en" | "pt";

export default function BotsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const lang: Lang = "es";

  const texts = {
    es: {
      title: "Información de Bots",
      alert: "Añade estas cuentas 48 horas antes para poder comprar usando el método de regalos",
      extra: "Las solicitudes se aceptan automáticamente. Se recomienda agregar una o varias cuentas.",
      list: "IDs a agregar:",
      copy: "Copiar",
      copied: "Copiado",
      error: "No se pudo copiar",
    },
    en: {
      title: "Bot Information",
      alert: "Add these accounts 48 hours before to be able to buy using the gift method",
      extra: "Requests are accepted automatically. It is recommended to add one or multiple accounts.",
      list: "IDs to add:",
      copy: "Copy",
      copied: "Copied",
      error: "Could not copy",
    },
    pt: {
      title: "Informação dos Bots",
      alert: "Adicione essas contas 48 horas antes para poder comprar usando o método de presente",
      extra: "As solicitações são aceitas automaticamente. Recomenda-se adicionar uma ou várias contas.",
      list: "IDs para adicionar:",
      copy: "Copiar",
      copied: "Copiado",
      error: "Não foi possível copiar",
    },
  };

  const t = texts[lang];

  const accounts = Array.from({ length: 14 }, (_, i) =>
    i === 0 ? "aquafornais" : `aquafornais${i}`
  );

  const handleCopy = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      alert(t.error);
    }
  };

  return (
    <main className="min-h-screen text-white px-4 py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8 text-center">
        {t.title}
      </h1>

      <div className="bg-green-600/90 rounded-xl p-4 mb-8 text-sm font-semibold space-y-2">
        <p>{t.alert}</p>
        <p className="opacity-90">{t.extra}</p>
      </div>

      <div className="bg-white/10 rounded-xl p-4">
        <h2 className="font-bold mb-4">{t.list}</h2>

        <div className="space-y-2">
          {accounts.map((acc) => (
            <div
              key={acc}
              className="flex items-center justify-between bg-white/10 px-4 py-3 rounded-lg"
            >
              <span className="font-semibold">{acc}</span>

              <button
                onClick={() => handleCopy(acc)}
                className="bg-white text-black px-4 py-1 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition"
              >
                {copied === acc ? t.copied : t.copy}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}