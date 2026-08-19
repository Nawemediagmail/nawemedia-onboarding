import { createClient } from "@supabase/supabase-js";

// Fallback values so the form works with zero Vercel env-var configuration —
// same pattern used across the other NAWEMEDIA EPK projects (anon/publishable
// keys are safe to ship client-side; RLS policies gate what they can do).
const FALLBACK_SUPABASE_URL = "https://qbpjuuesgsrotsagorcr.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFicGp1dWVzZ3Nyb3RzYWdvcmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDc1ODksImV4cCI6MjA5NjE4MzU4OX0.CWCOb23nuq0JkHNAJT3CTLWtfT7cLBYdOKOjRZqVZLc";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ONBOARDING_BUCKET = "onboarding-assets";

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

/**
 * Uploads a single file to the onboarding-assets bucket under
 * {artistSlug}/{folder}/{timestamp}-{filename} and returns its public URL.
 */
export async function uploadOnboardingFile(
  file: File,
  artistName: string,
  folder: string
): Promise<string> {
  const slug = slugify(artistName || "dj");
  const cleanName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const path = `${slug}/${folder}/${Date.now()}-${cleanName}`;

  const { error } = await supabase.storage
    .from(ONBOARDING_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(`Error subiendo ${file.name}: ${error.message}`);

  const { data } = supabase.storage.from(ONBOARDING_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Uploads multiple files in parallel, preserving order. */
export async function uploadOnboardingFiles(
  files: File[],
  artistName: string,
  folder: string
): Promise<string[]> {
  return Promise.all(files.map((f) => uploadOnboardingFile(f, artistName, folder)));
}
