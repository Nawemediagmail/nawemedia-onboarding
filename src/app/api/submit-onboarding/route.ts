import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env, validateEnv } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    try {
      validateEnv();
    } catch (e: any) {
      console.error("[Env Validation Error]:", e.message);
      return NextResponse.json({ 
        error: "Configuración del servidor incompleta.",
        debug: e.message 
      }, { status: 500 });
    }

    const supabase = createClient(env.supabaseUrl!, env.supabaseServiceRoleKey!);

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
