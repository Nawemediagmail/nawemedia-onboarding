import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      console.error(`[Env Error] URL present: ${!!url}, KEY present: ${!!key}`);
      return NextResponse.json({ 
        error: "Configuración del servidor incompleta o llaves inválidas. Por favor, contacte con el administrador.",
        debug: `supabase is null. URL length: ${url ? url.length : 0}, KEY length: ${key ? key.length : 0}` 
      }, { status: 500 });
    }

    const { error } = await supabase
      .from("onboarding_submissions")
      .insert([{ data }]);

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ 
        error: `Error de base de datos: ${error.message}`,
        details: error 
      }, { status: 500 });
    }

    console.log("NOTIFICATION SENT TO nawemedia@gmail.com: New EPK Submission from", data.artistName);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("General API Error:", e);
    return NextResponse.json({ 
      error: "Error interno del servidor", 
      details: e.message 
    }, { status: 500 });
  }
}
