
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Lida com solicitações OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Cria um cliente Supabase usando as variáveis de ambiente
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Obtém o cliente JWT do cabeçalho de autorização
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({
          error: "Não autorizado",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Obtém os dados do corpo da requisição
    const { user_id, amount } = await req.json();

    if (!user_id || !amount || isNaN(amount)) {
      return new Response(
        JSON.stringify({
          error: "Dados inválidos. user_id e amount são obrigatórios",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Obter o usuário atual
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Erro ao obter usuário autenticado",
          details: userError,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Verifica se o usuário é administrador
    const { data: adminData, error: adminError } = await supabaseClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (adminError || !adminData || !adminData.is_admin) {
      return new Response(
        JSON.stringify({
          error: "Acesso negado. Apenas administradores podem executar esta ação",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    // Atualiza os créditos do usuário
    const { data: updateData, error: updateError } = await supabaseClient.rpc(
      "increment_credits",
      {
        uid: user_id,
        increment_amount: amount,
      }
    );

    if (updateError) {
      console.error("Erro ao incrementar créditos:", updateError);
      return new Response(
        JSON.stringify({
          error: "Erro ao atualizar créditos",
          details: updateError,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${amount} créditos adicionados com sucesso`,
        data: updateData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro na função:", error);
    return new Response(
      JSON.stringify({
        error: "Erro interno do servidor",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
