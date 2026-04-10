import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const response = await fetch("https://fortnite-api.com/v2/shop?language=en", {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    const data = await response.json();
    const entries = Array.isArray(data?.data?.entries) ? data.data.entries : [];
    const date = data?.data?.date ? new Date(data.data.date) : null;

    const nextRotation = date
      ? new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString()
      : null;

    const ids = new Set<string>();

    for (const entry of entries) {
      if (entry?.mainId) ids.add(String(entry.mainId));

      const brItems = Array.isArray(entry?.brItems) ? entry.brItems : [];
      for (const item of brItems) {
        if (item?.id) ids.add(String(item.id));
      }
    }

    return NextResponse.json({
      ids: Array.from(ids),
      shopDate: date ? date.toISOString() : null,
      nextRotation,
    });
  } catch (error) {
    console.error("SHOP AVAILABLE IDS ERROR:", error);
    return NextResponse.json({ ids: [], shopDate: null, nextRotation: null }, { status: 200 });
  }
}
