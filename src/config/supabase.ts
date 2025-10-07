// Supabase configuration
import { createClient } from '@supabase/supabase-js';

// Validate required environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase configuration incomplete. Missing environment variables:');
  if (!supabaseUrl) console.warn('- VITE_SUPABASE_URL');
  if (!supabaseAnonKey) console.warn('- VITE_SUPABASE_ANON_KEY');
  console.warn('📋 Please check your .env.local file and restart the dev server.');
}

// Create Supabase client
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false // For now, we'll handle auth later if needed
      }
    })
  : null;

export { supabase };
export default supabase;