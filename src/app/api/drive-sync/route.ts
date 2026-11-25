import { NextRequest, NextResponse } from "next/server";
import { Readable } from "node:stream";
import { google, drive_v3 } from "googleapis";

export const runtime = "nodejs";
export const maxDuration = 60;

const FOLDER_MIME = "application/vnd.google-apps.folder";
const DOC_MIME = "application/vnd.google-apps.document";

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "dj"
  );
}

function getDrive(): drive_v3.Drive {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !key) {
    throw new Error("Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  }
  const auth = new google.auth.JWT({
    email,
    key: key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

async function getOrCreateFolder(drive: drive_v3.Drive, name: string, parentId: string): Promise<string> {
  const safeName = name.replace(/'/g, "\\'");
  const found = await drive.files.list({
    q: `name='${safeName}' and '${parentId}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`,
    fields: "files(id)",
    spaces: "drive",
  });
  const existing = found.data.files?.[0]?.id;
  if (existing) return existing;

  const created = await drive.files.create({
    requestBody: { name, mimeType: FOLDER_MIME, parents: [parentId] },
    fields: "id",
  });
  if (!created.data.id) throw new Error(`No se pudo crear la carpeta "${name}"`);
  return created.data.id;
}

async function uploadTextAsDoc(drive: drive_v3.Drive, name: string, content: string, parentId: string) {
  await drive.files.create({
    requestBody: { name, mimeType: DOC_MIME, parents: [parentId] },
    media: { mimeType: "text/plain", body: content },
    fields: "id",
  });
}

async function uploadFileFromUrl(drive: drive_v3.Drive, url: string, name: string, parentId: string) {
  const resp = await fetch(url);
  if (!resp.ok || !resp.body) throw new Error(`No se pudo descargar ${url} (${resp.status})`);
  const contentType = resp.headers.get("content-type") || "application/octet-stream";
  await drive.files.create({
    requestBody: { name, parents: [parentId] },
    media: { mimeType: contentType, body: Readable.fromWeb(resp.body as never) },
    fields: "id",
  });
}

function label(value: unknown): string {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "string" && value.trim()) return value.trim();
  return "—";
}

function buildSummary(payload: Record<string, unknown>): string {
  const section = (title: string, rows: [string, unknown][]) =>
    `${title}\n${"-".repeat(title.length)}\n` +
    rows.map(([k, v]) => `${k}: ${label(v)}`).join("\n");

  return [
    section("Identidad del artista", [
      ["Nombre artístico", payload.artistName],
      ["Tagline", payload.tagline],
      ["Ubicación", payload.location],
      ["Año de debut", payload.debutYear],
      ["Géneros", payload.genres],
      ["Shows aproximados", payload.showsCount],
      ["Países recorridos", payload.countriesCount],
    ]),
    section("Contacto y redes", [
      ["Email de booking", payload.bookingEmail],
      ["WhatsApp de booking", payload.bookingWhatsapp],
      ["Instagram", payload.instagram],
      ["SoundCloud", payload.soundcloudProfile],
      ["Spotify", payload.spotify],
      ["YouTube", payload.youtube],
      ["Facebook", payload.facebook],
      ["TikTok", payload.tiktok],
    ]),
    section("Biografía", [
      ["Bio (ES)", payload.bioEs],
      ["Bio (EN)", payload.bioEn],
      ["Bio (PT)", payload.bioPt],
      ["Highlights", payload.highlights],
    ]),
    section("Música", [
      ["Sets", payload.sets],
      ["Lanzamientos", payload.releases],
    ]),
    section("Identidad visual", [
      ["Color primario", payload.primaryColor],
      ["Color hover", payload.hoverColor],
    ]),
    section("Shows", [["Próximos shows", payload.upcomingShows]]),
    section("Press kit y extras", [
      ["Link a fotos en HD", payload.hdPhotosLink],
      ["Assets extra", payload.extraAssets],
      ["Dominio deseado", payload.desiredDomain],
    ]),
    section("Validación", [
      ["Fecha límite", payload.deadline],
      ["Notas", payload.notes],
      ["Confirmación", payload.confirmation],
    ]),
  ].join("\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const rootFolderId = process.env.DRIVE_ONBOARDING_FOLDER_ID;
    if (!rootFolderId) {
      return NextResponse.json({ error: "Falta DRIVE_ONBOARDING_FOLDER_ID" }, { status: 500 });
    }

    const payload = (await req.json()) as Record<string, unknown>;
    const artistName = typeof payload.artistName === "string" ? payload.artistName.trim() : "";
    if (!artistName) {
      return NextResponse.json({ error: "Falta artistName" }, { status: 400 });
    }

    const drive = getDrive();
    const folderId = await getOrCreateFolder(drive, slugify(artistName), rootFolderId);

    await uploadTextAsDoc(drive, `Datos - ${artistName}`, buildSummary(payload), folderId);

    const singleFiles: [string, unknown][] = [
      ["foto-hero", payload.heroPhotoUrl],
      ["foto-bio", payload.bioPhotoUrl],
      ["logo-negro", payload.logoBlackUrl],
      ["logo-color", payload.logoColorUrl],
      ["rider", payload.riderUrl],
    ];

    const gallery = (payload.gallery as Record<string, string[]> | undefined) || {};
    const galleryFiles: [string, string][] = [];
    for (const [cat, urls] of Object.entries(gallery)) {
      (urls || []).forEach((url, i) => galleryFiles.push([`galeria-${cat}-${i + 1}`, url]));
    }

    const uploads: Promise<void>[] = [];
    for (const [name, url] of singleFiles) {
      if (typeof url === "string" && url) {
        const ext = url.split(".").pop()?.split("?")[0] || "";
        uploads.push(uploadFileFromUrl(drive, url, ext ? `${name}.${ext}` : name, folderId));
      }
    }
    for (const [name, url] of galleryFiles) {
      const ext = url.split(".").pop()?.split("?")[0] || "";
      uploads.push(uploadFileFromUrl(drive, url, ext ? `${name}.${ext}` : name, folderId));
    }
    await Promise.all(uploads);

    return NextResponse.json({ ok: true, folderUrl: `https://drive.google.com/drive/folders/${folderId}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    console.error("[drive-sync]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
