import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// Las cuentas de servicio de Google no pueden escribir en un Drive personal
// (ni compartiendo una carpeta con ellas), así que la copia la hace un Google
// Apps Script Web App desplegado por el dueño de la cuenta: corre con su
// propia identidad/cuota, sin tokens de OAuth que venzan.
export async function POST(req: NextRequest) {
  try {
    const webAppUrl = process.env.DRIVE_SYNC_WEBAPP_URL;
    const secret = process.env.DRIVE_SYNC_WEBAPP_SECRET;
    if (!webAppUrl || !secret) {
      return NextResponse.json(
        { error: "Falta DRIVE_SYNC_WEBAPP_URL / DRIVE_SYNC_WEBAPP_SECRET" },
        { status: 500 }
      );
    }

    const payload = (await req.json()) as Record<string, unknown>;
    if (typeof payload.artistName !== "string" || !payload.artistName.trim()) {
      return NextResponse.json({ error: "Falta artistName" }, { status: 400 });
    }

    const resp = await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, secret }),
      redirect: "follow",
    });

    const data = (await resp.json().catch(() => ({}))) as { ok?: boolean; error?: string; folderUrl?: string };
    if (!resp.ok || !data.ok) {
      return NextResponse.json({ error: data.error || "El Apps Script no pudo copiar a Drive" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, folderUrl: data.folderUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    console.error("[drive-sync]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
