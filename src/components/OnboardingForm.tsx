"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Upload,
  Globe,
  Music,
  User,
  Calendar,
  Camera,
  Images,
  X,
  FileCheck2,
} from "lucide-react";

interface OnboardingFormProps {
  onSubmit: (data: FormState) => Promise<void>;
  onLoading: (loading: boolean) => void;
}

export interface FormState {
  // Section 1: Identity
  artistName: string;
  tagline: string;
  location: string;
  debutYear: string;
  genres: string;
  showsCount: string;
  countriesCount: string;
  // Section 2: Contact & Socials
  bookingEmail: string;
  bookingWhatsapp: string;
  instagram: string;
  soundcloudProfile: string;
  spotify: string;
  youtube: string;
  facebook: string;
  tiktok: string;
  // Section 3: Bio
  bioEs: string;
  bioEn: string;
  bioPt: string;
  highlights: string;
  // Section 4: Music
  sets: string;
  releases: string;
  // Section 5: Visuals (files)
  heroPhoto: File | null;
  bioPhoto: File | null;
  logoBlack: File | null;
  logoColor: File | null;
  primaryColor: string;
  hoverColor: string;
  // Section 6: Gallery (files, categorized)
  galleryLifestyle: File[];
  galleryPrensa: File[];
  galleryShows: File[];
  // Section 7: Shows
  upcomingShows: string;
  // Section 8: Press Kit & Extras
  hdPhotosLink: string;
  riderFile: File | null;
  extraAssets: string;
  desiredDomain: string;
  // Section 9: Validation
  deadline: string;
  notes: string;
  confirmation: string;
}

const initialState: FormState = {
  artistName: "",
  tagline: "",
  location: "",
  debutYear: "",
  genres: "",
  showsCount: "",
  countriesCount: "",
  bookingEmail: "",
  bookingWhatsapp: "",
  instagram: "",
  soundcloudProfile: "",
  spotify: "",
  youtube: "",
  facebook: "",
  tiktok: "",
  bioEs: "",
  bioEn: "",
  bioPt: "",
  highlights: "",
  sets: "",
  releases: "",
  heroPhoto: null,
  bioPhoto: null,
  logoBlack: null,
  logoColor: null,
  primaryColor: "#c026d3",
  hoverColor: "#7c3aed",
  galleryLifestyle: [],
  galleryPrensa: [],
  galleryShows: [],
  upcomingShows: "",
  hdPhotosLink: "",
  riderFile: null,
  extraAssets: "",
  desiredDomain: "",
  deadline: "",
  notes: "",
  confirmation: "",
};

const TOTAL_STEPS = 9;

export default function OnboardingForm({ onSubmit, onLoading }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(initialState);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSingleFile = (name: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  const handleMultiFile = (name: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      [name]: [...(prev[name] as File[]), ...files],
    }));
    e.target.value = "";
  };

  const removeFromMulti = (name: "galleryLifestyle" | "galleryPrensa" | "galleryShows", idx: number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: (prev[name] as File[]).filter((_, i) => i !== idx),
    }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const isStepValid = () => {
    if (step === 1) return formData.artistName && formData.tagline && formData.genres;
    if (step === 2) return formData.bookingEmail && formData.instagram && formData.soundcloudProfile;
    if (step === 3) return formData.bioEs;
    if (step === 4) return formData.sets && formData.releases;
    if (step === 5) return formData.heroPhoto && formData.logoColor;
    return true;
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      {/* Progress Header */}
      <div className="mb-8 text-center">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Step {step} of {TOTAL_STEPS}
          </span>
          <span className="text-xs font-bold text-gold uppercase tracking-widest">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[40px] p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader icon={<User size={24} />} color="gold" title="Identidad del Artista" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Nombre Artístico *">
                <input name="artistName" value={formData.artistName} onChange={handleChange} className="input-field" placeholder="Ej. DJ NAWEL" />
              </Field>
              <Field label="Tagline *" hint="Frase corta que te define, máx. 6 palabras">
                <input name="tagline" value={formData.tagline} onChange={handleChange} className="input-field" placeholder="Ej. La Diva del Tribal" />
              </Field>
              <Field label="Ubicación" hint="Ciudad y/o país">
                <input name="location" value={formData.location} onChange={handleChange} className="input-field" placeholder="Ej. Lima · Perú" />
              </Field>
              <Field label="Año de Debut">
                <input name="debutYear" value={formData.debutYear} onChange={handleChange} className="input-field" placeholder="Ej. 2020" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Géneros Principales *">
                  <input name="genres" value={formData.genres} onChange={handleChange} className="input-field" placeholder="Ej. Afro House, Tribal, Circuit" />
                </Field>
              </div>
              <Field label="Shows Aproximados">
                <input name="showsCount" value={formData.showsCount} onChange={handleChange} className="input-field" placeholder="Ej. 100+" />
              </Field>
              <Field label="Países Recorridos">
                <input name="countriesCount" value={formData.countriesCount} onChange={handleChange} className="input-field" placeholder="Ej. 5" />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader icon={<Globe size={24} />} color="purple" title="Contacto & Redes" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Email de Booking *">
                <input name="bookingEmail" value={formData.bookingEmail} onChange={handleChange} type="email" className="input-field" placeholder="booking@domain.com" />
              </Field>
              <Field label="WhatsApp de Booking">
                <input name="bookingWhatsapp" value={formData.bookingWhatsapp} onChange={handleChange} className="input-field" placeholder="+56 9 ..." />
              </Field>
              <Field label="Instagram *">
                <input name="instagram" value={formData.instagram} onChange={handleChange} className="input-field" placeholder="https://instagram.com/..." />
              </Field>
              <Field label="SoundCloud Perfil *">
                <input name="soundcloudProfile" value={formData.soundcloudProfile} onChange={handleChange} className="input-field" placeholder="https://soundcloud.com/..." />
              </Field>
              <Field label="Spotify Artista">
                <input name="spotify" value={formData.spotify} onChange={handleChange} className="input-field" placeholder="https://open.spotify.com/..." />
              </Field>
              <Field label="YouTube Canal">
                <input name="youtube" value={formData.youtube} onChange={handleChange} className="input-field" placeholder="https://youtube.com/..." />
              </Field>
              <Field label="Facebook">
                <input name="facebook" value={formData.facebook} onChange={handleChange} className="input-field" placeholder="https://facebook.com/..." />
              </Field>
              <Field label="TikTok">
                <input name="tiktok" value={formData.tiktok} onChange={handleChange} className="input-field" placeholder="https://tiktok.com/@..." />
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader icon={<User size={24} />} color="blue" title="Biografía" />
            <div className="grid grid-cols-1 gap-6">
              <Field label="Bio en Español *">
                <textarea name="bioEs" value={formData.bioEs} onChange={handleChange} className="input-field min-h-[150px]" placeholder="Cuéntanos tu historia..." />
              </Field>
              <Field label="Bio en Inglés (Opcional)">
                <textarea name="bioEn" value={formData.bioEn} onChange={handleChange} className="input-field min-h-[150px]" placeholder="English version..." />
              </Field>
              <Field label="Bio en Portugués (Opcional)">
                <textarea name="bioPt" value={formData.bioPt} onChange={handleChange} className="input-field min-h-[150px]" placeholder="Versão em português..." />
              </Field>
              <Field label="Hitos Clave / Logros">
                <textarea name="highlights" value={formData.highlights} onChange={handleChange} className="input-field min-h-[100px]" placeholder="Festivales, sellos, premios, colaboraciones..." />
              </Field>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader icon={<Music size={24} />} color="amber" title="Música & Video" />
            <div className="grid grid-cols-1 gap-6">
              <Field label="Sets de SoundCloud * (Un link por línea)">
                <textarea name="sets" value={formData.sets} onChange={handleChange} className="input-field min-h-[100px]" placeholder="https://soundcloud.com/..." />
              </Field>
              <Field label="Tracks/Releases SoundCloud * (Un link por línea)">
                <textarea name="releases" value={formData.releases} onChange={handleChange} className="input-field min-h-[100px]" placeholder="https://soundcloud.com/..." />
              </Field>
              <Field label="Video Principal (YouTube/Vimeo)">
                <input name="youtube" value={formData.youtube} onChange={handleChange} className="input-field" placeholder="https://youtube.com/..." />
              </Field>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader icon={<Camera size={24} />} color="pink" title="Material Visual" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FileField label="Foto Hero *" hint="Fondo/paisaje, alta resolución" file={formData.heroPhoto} onChange={handleSingleFile("heroPhoto")} onRemove={() => setFormData((p) => ({ ...p, heroPhoto: null }))} />
              <FileField label="Foto Bio" hint="Retrato, buena luz" file={formData.bioPhoto} onChange={handleSingleFile("bioPhoto")} onRemove={() => setFormData((p) => ({ ...p, bioPhoto: null }))} />
              <FileField label="Logo Negro" hint="PNG transparente" file={formData.logoBlack} onChange={handleSingleFile("logoBlack")} onRemove={() => setFormData((p) => ({ ...p, logoBlack: null }))} />
              <FileField label="Logo Color *" hint="PNG transparente" file={formData.logoColor} onChange={handleSingleFile("logoColor")} onRemove={() => setFormData((p) => ({ ...p, logoColor: null }))} />
              <Field label="Color Primario" hint="Color de marca (hex)">
                <div className="flex items-center gap-3">
                  <input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="h-11 w-14 rounded-xl border border-white/10 bg-transparent" />
                  <input name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="input-field" placeholder="#c026d3" />
                </div>
              </Field>
              <Field label="Color Hover / Secundario">
                <div className="flex items-center gap-3">
                  <input type="color" name="hoverColor" value={formData.hoverColor} onChange={handleChange} className="h-11 w-14 rounded-xl border border-white/10 bg-transparent" />
                  <input name="hoverColor" value={formData.hoverColor} onChange={handleChange} className="input-field" placeholder="#7c3aed" />
                </div>
              </Field>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader icon={<Images size={24} />} color="pink" title="Galería de Fotos" />
            <p className="text-sm text-slate-400 -mt-4">
              Subí varias fotos por categoría. Podés agregar más de una a la vez.
            </p>
            <MultiFileField
              label="Lifestyle / Editoriales"
              hint="Sesiones de fotos, backstage"
              files={formData.galleryLifestyle}
              onChange={handleMultiFile("galleryLifestyle")}
              onRemove={(i) => removeFromMulti("galleryLifestyle", i)}
            />
            <MultiFileField
              label="Prensa"
              hint="Retratos oficiales para medios"
              files={formData.galleryPrensa}
              onChange={handleMultiFile("galleryPrensa")}
              onRemove={(i) => removeFromMulti("galleryPrensa", i)}
            />
            <MultiFileField
              label="Shows"
              hint="En el escenario, con el público"
              files={formData.galleryShows}
              onChange={handleMultiFile("galleryShows")}
              onRemove={(i) => removeFromMulti("galleryShows", i)}
            />
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader icon={<Calendar size={24} />} color="cyan" title="Agenda de Shows" />
            <Field label="Shows Confirmados">
              <textarea
                name="upcomingShows"
                value={formData.upcomingShows}
                onChange={handleChange}
                className="input-field min-h-[200px]"
                placeholder={"Sigue este formato:\nYYYY-MM-DD | Lugar | Ciudad | País | estado (upcoming/sold-out) | link tickets"}
              />
            </Field>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader icon={<Upload size={24} />} color="green" title="Press Kit & Extras" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Link Carpeta Fotos HD" hint="Drive / Dropbox — dump completo en alta resolución">
                <input name="hdPhotosLink" value={formData.hdPhotosLink} onChange={handleChange} className="input-field" placeholder="Drive / Dropbox" />
              </Field>
              <FileField label="Rider Técnico" hint="PDF" accept="application/pdf,image/*" file={formData.riderFile} onChange={handleSingleFile("riderFile")} onRemove={() => setFormData((p) => ({ ...p, riderFile: null }))} />
              <Field label="Dominio Deseado" hint="Ej. nawellopez.com">
                <input name="desiredDomain" value={formData.desiredDomain} onChange={handleChange} className="input-field" placeholder="tunombre.com" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Otros Assets / Notas">
                  <textarea name="extraAssets" value={formData.extraAssets} onChange={handleChange} className="input-field min-h-[100px]" placeholder="Videos, reels, referencias visuales..." />
                </Field>
              </div>
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader icon={<CheckCircle2 size={24} />} color="white" title="Validación Final" />
            <div className="grid grid-cols-1 gap-6">
              <Field label="Fecha Límite deseada">
                <input name="deadline" value={formData.deadline} onChange={handleChange} type="date" className="input-field" />
              </Field>
              <Field label="Notas Adicionales">
                <textarea name="notes" value={formData.notes} onChange={handleChange} className="input-field min-h-[100px]" placeholder="Cualquier detalle extra..." />
              </Field>
              <Field label="Confirmación de Material *">
                <select name="confirmation" value={formData.confirmation} onChange={handleChange} className="input-field">
                  <option value="">Selecciona una opción</option>
                  <option value="ready">Confirmo que todo el material está completo y puede publicarse</option>
                  <option value="pending">Faltan algunos detalles que enviaré posteriormente</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-10 gap-4">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-0 transition-all"
          >
            Anterior
          </button>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid()}
              className="btn-primary px-10 py-3 rounded-full text-sm font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={async () => {
                onLoading(true);
                try {
                  await onSubmit(formData);
                } finally {
                  onLoading(false);
                }
              }}
              disabled={!formData.confirmation}
              className="btn-primary px-10 py-3 rounded-full text-sm font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Enviar Solicitud
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, color, title }: { icon: React.ReactNode; color: string; title: string }) {
  const colorMap: Record<string, string> = {
    gold: "bg-gold/20 text-gold",
    purple: "bg-purple-500/20 text-purple-400",
    blue: "bg-blue-500/20 text-blue-400",
    amber: "bg-amber-500/20 text-amber-400",
    pink: "bg-pink-500/20 text-pink-400",
    cyan: "bg-cyan-500/20 text-cyan-400",
    green: "bg-green-500/20 text-green-400",
    white: "bg-white/10 text-white",
  };
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-3 rounded-2xl ${colorMap[color]}`}>{icon}</div>
      <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      {children}
      {hint && <span className="text-[11px] text-slate-500 ml-1">{hint}</span>}
    </div>
  );
}

function FileField({
  label,
  hint,
  file,
  accept = "image/*",
  onChange,
  onRemove,
}: {
  label: string;
  hint?: string;
  file: File | null;
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <Field label={label} hint={hint}>
      {file ? (
        <div className="input-field flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 truncate text-sm">
            <FileCheck2 size={16} className="text-green-400 shrink-0" />
            <span className="truncate">{file.name}</span>
          </span>
          <button type="button" onClick={onRemove} className="text-slate-400 hover:text-white shrink-0">
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="input-field flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white transition-colors">
          <Upload size={16} />
          <span className="text-sm">Subir archivo</span>
          <input type="file" accept={accept} onChange={onChange} className="hidden" />
        </label>
      )}
    </Field>
  );
}

function MultiFileField({
  label,
  hint,
  files,
  onChange,
  onRemove,
}: {
  label: string;
  hint?: string;
  files: File[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-300">{label}</p>
          {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <Upload size={14} />
          Agregar fotos
          <input type="file" accept="image/*" multiple onChange={onChange} className="hidden" />
        </label>
      </div>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <span key={`${f.name}-${i}`} className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 text-xs">
              {f.name}
              <button type="button" onClick={() => onRemove(i)} className="text-slate-400 hover:text-white">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
