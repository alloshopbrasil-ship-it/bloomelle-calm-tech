import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

const BodySchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { name, email, message } = parsed.data;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#E26FA7,#f0a0c8);padding:32px;text-align:center;">
      <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:600;">Nova mensagem de contato 💌</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#333;font-size:15px;margin:0 0 8px;"><strong>Nome:</strong> ${name}</p>
      <p style="color:#333;font-size:15px;margin:0 0 16px;"><strong>E-mail:</strong> ${email}</p>
      <div style="background:#fdf2f8;border-radius:12px;padding:20px;margin:0 0 16px;">
        <p style="color:#333;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
      </div>
      <p style="color:#aaa;font-size:12px;margin:16px 0 0;">Enviado via formulário de contato da Bloomelle</p>
    </div>
  </div>
</body>
</html>`;

    const response = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'Bloomelle <no-reply@bloomelle.com>',
        to: ['contato@bloomelle.com'],
        reply_to: email,
        subject: `Contato Bloomelle: ${name}`,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Resend error:', JSON.stringify(data));
      throw new Error(`Resend API error [${response.status}]`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-contact error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send contact email' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
