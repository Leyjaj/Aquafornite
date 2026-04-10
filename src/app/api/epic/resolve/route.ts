import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const name = req.nextUrl.searchParams.get("name")?.trim();

    if (!name) {
      return NextResponse.json({ error: "Falta el nombre de usuario" }, { status: 400 });
    }

    const apiKey = process.env.FORTNITE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Falta FORTNITE_API_KEY en .env para resolver usuario -> Epic ID. Puedes ingresar el ID manualmente.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://fortnite-api.com/v2/stats/br/v2?name=${encodeURIComponent(name)}`,
      {
        headers: {
          Authorization: apiKey,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || !data?.data?.account?.id) {
      return NextResponse.json(
        { error: data?.error || "No se pudo resolver la cuenta de Epic" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: data.data.account.id,
      name: data.data.account.name,
    });
  } catch (error: any) {
    console.error("EPIC RESOLVE ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno resolviendo cuenta de Epic" },
      { status: 500 }
    );
  }
}
