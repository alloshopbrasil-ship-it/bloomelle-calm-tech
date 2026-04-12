import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BodySchema = z.object({
  token: z.string().uuid(),
  newPassword: z.string().min(8).max(128),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Dados inválidos' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { token, newPassword } = parsed.data;

    // Find valid token
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !tokenRecord) {
      return new Response(JSON.stringify({ error: 'Token inválido ou já utilizado.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check expiration
    if (new Date(tokenRecord.expires_at) < new Date()) {
      await supabase.from('password_reset_tokens').update({ used: true }).eq('id', tokenRecord.id);
      return new Response(JSON.stringify({ error: 'Token expirado. Solicite um novo link.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    const user = userData.users.find(u => u.email === tokenRecord.email);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Usuária não encontrada.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return new Response(JSON.stringify({ error: 'Erro ao atualizar senha.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark token as used
    await supabase.from('password_reset_tokens').update({ used: true }).eq('id', tokenRecord.id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('reset-password error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
