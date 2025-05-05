import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""; // Changed from SUPABASE_SERVICE_ROLE_KEY
export const supabaseClient = createClient(supabaseUrl, supabaseKey);
