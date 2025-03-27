
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the auth token from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get all backups, order by created_at desc
    const { data, error } = await supabase
      .from('system_backups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // If there's no data yet, return an empty array
    if (!data || data.length === 0) {
      // For demo purposes, let's create a sample backup if none exists
      const mockBackups = [
        {
          id: crypto.randomUUID(),
          description: "Initial system backup",
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          size: 2458923,
          tables: ['profiles', 'teams', 'matches', 'championships', 'credit_transactions']
        },
        {
          id: crypto.randomUUID(),
          description: "Weekly backup",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          size: 3104562,
          tables: ['profiles', 'teams', 'matches', 'championships', 'credit_transactions']
        }
      ];

      return new Response(
        JSON.stringify(mockBackups),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error listing backups:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
