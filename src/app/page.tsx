"use client";

import { useState } from "react";
import OnboardingForm, { FormState } from "@/components/OnboardingForm";
import { supabase, uploadOnboardingFile, uploadOnboardingFiles } from "@/lib/supabase";

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormState) => {
    setError(null);
    try {
      const {
        heroPhoto,
        bioPhoto,
        logoBlack,
        logoColor,
        riderFile,
        galleryLifestyle,
        galleryPrensa,
        galleryShows,
        ...rest
      } = formData;

      const [heroPhotoUrl, bioPhotoUrl, logoBlackUrl, logoColorUrl, riderUrl] = await Promise.all([
        heroPhoto ? uploadOnboardingFile(heroPhoto, formData.artistName, "photos") : Promise.resolve(""),
        bioPhoto ? uploadOnboardingFile(bioPhoto, formData.artistName, "photos") : Promise.resolve(""),
        logoBlack ? uploadOnboardingFile(logoBlack, formData.artistName, "logos") : Promise.resolve(""),
        logoColor ? uploadOnboardingFile(logoColor, formData.artistName, "logos") : Promise.resolve(""),
        riderFile ? uploadOnboardingFile(riderFile, formData.artistName, "presskit") : Promise.resolve(""),
      ]);

      const [lifestyleUrls, prensaUrls, showsUrls] = await Promise.all([
        uploadOnboardingFiles(galleryLifestyle, formData.artistName, "gallery/lifestyle"),
        uploadOnboardingFiles(galleryPrensa, formData.artistName, "gallery/prensa"),
        uploadOnboardingFiles(galleryShows, formData.artistName, "gallery/shows"),
      ]);

      const payload = {
        ...rest,
        heroPhotoUrl,
        bioPhotoUrl,
        logoBlackUrl,
        logoColorUrl,
        riderUrl,
        gallery: {
          lifestyle: lifestyleUrls,
          prensa: prensaUrls,
          shows: showsUrls,
        },
      };

      const { error: insertError } = await supabase
        .from("onboarding_submissions")
        .insert([{ data: payload }]);

      if (insertError) throw new Error(insertError.message);

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Error al enviar");
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-lg">
          <div className="text-6xl">✅</div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            ¡Solicitud enviada!
          </h1>
          <p className="text-slate-400">
            Recibimos tu información. NAWEMEDIA te contactará pronto para
            coordinar la producción de tu EPK.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4">
      {/* Header */}
      <header className="text-center mb-12 space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
          NAWEMEDIA · EPK Studio
        </p>
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight">
          Formulario de Onboarding
        </h1>
        <p className="text-slate-400 max-w-md mx-auto text-sm">
          Completá este formulario para que podamos construir tu EPK profesional.
          Solo te tomará unos minutos.
        </p>
      </header>

      {error && (
        <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      <OnboardingForm
        onSubmit={handleSubmit}
        onLoading={setLoading}
      />

      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400 uppercase tracking-widest">Enviando...</p>
          </div>
        </div>
      )}
    </main>
  );
}
