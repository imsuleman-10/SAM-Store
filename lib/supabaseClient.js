import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Public client — safe to use in the browser. Can only do what your
// Supabase Row Level Security (RLS) policies allow (read products, insert orders).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
