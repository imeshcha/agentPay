import { createClient } from "@supabase/supabase-js";

// These come from your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// The "!" tells TypeScript "trust me, this value exists"
// If the env vars are missing, you'll get a clear error

export const supabase = createClient(supabaseUrl, supabaseAnonKey);