"use client";

import { useState } from "react";
import OnboardingForm from "@/components/OnboardingForm";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(data: any) {
    try {
      const res = await fetch("/api/submit-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Hubo un error al enviar la solicitud.");
      }
      
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || "Hubo un error al enviar la solicitud. Por favor intenta de nuevo.");
    }
  }

  if (submitted) {
    return (
      <main className="min-h-svh flex items-center justify-center p-6 text-center" style={{background:"var(--bg)"}}>
        <div className="max-w-md p-10 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-full bg-gold/20 text-gold flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4">¡Solicitud Enviada!</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Hemos recibido toda tu información. El equipo de <span className="text-white font-bold">NAWEMEDIA</span> revisará tus assets y se pondrá en contacto contigo pronto.
          </p>
          <a href="/" className="btn-primary px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest block text-center">
            Volver al Inicio
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh flex flex-col items-center justify-center p-4 sm:p-8" style={{background:"var(--bg)"}}>
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[.2em] mb-6 border border-white/10 bg-white/5 backdrop-blur-md text-slate-400">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            NAWEMEDIA Onboarding Portal
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter mb-4 bg-gradient-to-r from-white via-slate-400 to-slate-600 bg-clip-text text-transparent">
            Crea tu Identidad Digital
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Completa este formulario con toda tu información y material. 
            Utilizaremos estos datos para diseñar un EPK de alto impacto que potencie tu carrera profesional.
          </p>
        </div>
        <OnboardingForm onSubmit={handleSubmit} onLoading={setLoading} />
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest text-gold">Procesando solicitud...</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
