import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      console.error("Missing environment variables: URL or SERVICE_ROLE_KEY");
      return NextResponse.json({ 
        error: "Configuración del servidor incompleta. Por favor, contacte con el administrador.",
        debug: "Missing Env Vars" 
      }, { status: 500 });
    }

    const supabase = createClient(url, key);

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

