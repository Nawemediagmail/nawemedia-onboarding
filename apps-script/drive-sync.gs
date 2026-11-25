// Google Apps Script Web App: copia cada submission del onboarding a Drive.
//
// Por qué existe esto en vez de una cuenta de servicio: las cuentas de
// servicio de Google no pueden escribir en un Drive personal (ni aunque se
// comparta una carpeta con ellas con permiso de Editor) — Google solo les da
// cuota en Shared Drives de Google Workspace. Este script corre como vos
// mismo (el dueño del Drive), así que usa tu cuota normal y no tiene tokens
// que venzan.
//
// Cómo desplegarlo:
//   1. https://script.google.com/home → Proyecto nuevo.
//   2. Reemplazá el contenido de Code.gs por este archivo completo.
//   3. Completá ROOT_FOLDER_ID y SHARED_SECRET abajo.
//   4. Desplegar → Nueva implementación → tipo "Aplicación web".
//      - Ejecutar como: Yo
//      - Quién tiene acceso: Cualquier usuario
//   5. Copiá la URL que termina en /exec — es DRIVE_SYNC_WEBAPP_URL en Vercel.
//   6. SHARED_SECRET (el mismo valor) va en DRIVE_SYNC_WEBAPP_SECRET en Vercel.

const ROOT_FOLDER_ID = 'PEGAR_AQUI_EL_ID_DE_LA_CARPETA_ONBOARDING_DJS';
const SHARED_SECRET = 'PEGAR_AQUI_UN_SECRETO_LARGO_Y_ALEATORIO';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SHARED_SECRET) {
      return jsonResponse({ error: 'No autorizado' });
    }

    const artistName = (body.artistName || '').trim();
    if (!artistName) return jsonResponse({ error: 'Falta artistName' });

    const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
    const folder = getOrCreateFolder(root, slugify(artistName));

    uploadTextAsDoc(folder, 'Datos - ' + artistName, buildSummary(body));

    const singles = [
      ['foto-hero', body.heroPhotoUrl],
      ['foto-bio', body.bioPhotoUrl],
      ['logo-negro', body.logoBlackUrl],
      ['logo-color', body.logoColorUrl],
      ['rider', body.riderUrl],
    ];
    singles.forEach(function (pair) {
      if (pair[1]) uploadFileFromUrl(folder, pair[1], pair[0]);
    });

    const gallery = body.gallery || {};
    Object.keys(gallery).forEach(function (cat) {
      (gallery[cat] || []).forEach(function (url, i) {
        uploadFileFromUrl(folder, url, 'galeria-' + cat + '-' + (i + 1));
      });
    });

    return jsonResponse({ ok: true, folderUrl: folder.getUrl() });
  } catch (err) {
    return jsonResponse({ error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function slugify(value) {
  return (
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'dj'
  );
}

function getOrCreateFolder(parent, name) {
  const it = parent.getFoldersByName(name);
  if (it.hasNext()) return it.next();
  return parent.createFolder(name);
}

function uploadTextAsDoc(folder, name, content) {
  const doc = DocumentApp.create(name);
  doc.getBody().setText(content);
  doc.saveAndClose();
  const file = DriveApp.getFileById(doc.getId());
  DriveApp.getRootFolder().removeFile(file); // DocumentApp.create() siempre crea en la raíz de Mi Unidad
  folder.addFile(file);
}

function uploadFileFromUrl(folder, url, name) {
  const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (resp.getResponseCode() >= 300) throw new Error('No se pudo descargar ' + url);
  const blob = resp.getBlob();
  const ext = (url.split('.').pop() || '').split('?')[0];
  blob.setName(ext ? name + '.' + ext : name);
  folder.createFile(blob);
}

function buildSummary(payload) {
  function label(v) {
    if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
    if (typeof v === 'string' && v.trim()) return v.trim();
    return '—';
  }
  function section(title, rows) {
    return (
      title +
      '\n' +
      '-'.repeat(title.length) +
      '\n' +
      rows.map(function (r) { return r[0] + ': ' + label(r[1]); }).join('\n')
    );
  }
  return [
    section('Identidad del artista', [
      ['Nombre artístico', payload.artistName],
      ['Tagline', payload.tagline],
      ['Ubicación', payload.location],
      ['Año de debut', payload.debutYear],
      ['Géneros', payload.genres],
      ['Shows aproximados', payload.showsCount],
      ['Países recorridos', payload.countriesCount],
    ]),
    section('Contacto y redes', [
      ['Email de booking', payload.bookingEmail],
      ['WhatsApp de booking', payload.bookingWhatsapp],
      ['Instagram', payload.instagram],
      ['SoundCloud', payload.soundcloudProfile],
      ['Spotify', payload.spotify],
      ['YouTube', payload.youtube],
      ['Facebook', payload.facebook],
      ['TikTok', payload.tiktok],
    ]),
    section('Biografía', [
      ['Bio (ES)', payload.bioEs],
      ['Bio (EN)', payload.bioEn],
      ['Bio (PT)', payload.bioPt],
      ['Highlights', payload.highlights],
    ]),
    section('Música', [
      ['Sets', payload.sets],
      ['Lanzamientos', payload.releases],
    ]),
    section('Identidad visual', [
      ['Color primario', payload.primaryColor],
      ['Color hover', payload.hoverColor],
    ]),
    section('Shows', [['Próximos shows', payload.upcomingShows]]),
    section('Press kit y extras', [
      ['Link a fotos en HD', payload.hdPhotosLink],
      ['Assets extra', payload.extraAssets],
      ['Dominio deseado', payload.desiredDomain],
    ]),
    section('Validación', [
      ['Fecha límite', payload.deadline],
      ['Notas', payload.notes],
      ['Confirmación', payload.confirmation],
    ]),
  ].join('\n\n');
}
