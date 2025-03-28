
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tweomllxipueawgvotle.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW9tbGx4aXB1ZWF3Z3ZvdGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNzgxMjksImV4cCI6MjA1ODY1NDEyOX0.18ClT7jsJ9em8D_3FuV64VKEYxv2cxEtPrAvwSs_vxk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
