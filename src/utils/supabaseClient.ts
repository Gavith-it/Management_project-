import { createClient } from "@supabase/supabase-js";

// Safe fallback credentials for compilation/build phases
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== "your_supabase_project_url" &&
  supabaseAnonKey !== "your_supabase_anon_public_key";

export const supabase = createClient(
  isConfigured ? supabaseUrl : "https://placeholder-project.supabase.co",
  isConfigured ? supabaseAnonKey : "placeholder-anon-key"
);

export function getIsSupabaseConfigured(): boolean {
  return !!isConfigured;
}
