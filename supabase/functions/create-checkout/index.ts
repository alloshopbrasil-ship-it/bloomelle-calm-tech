import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

const PRICE_ALLOWLIST = {
  premium: {
    month: {
      eur: "price_1SvNGmDIX4T0C71HKIICjjcD",
      usd: "price_1SxC0aDIX4T0C71Hfv5vHJzp",
    },
    year: {
      eur: "price_1SvNJDDIX4T0C71HW0xfOcIE",
      usd: "price_1SxBvoDIX4T0C71HzbmeUFQd",
    },
  },
} as const;

const ALLOWED_PRICE_IDS = new Set<string>([
  PRICE_ALLOWLIST.premium.month.eur,
  PRICE_ALLOWLIST.premium.month.usd,
  PRICE_ALLOWLIST.premium.year.eur,
  PRICE_ALLOWLIST.premium.year.usd,
]);

const normalizeCurrency = (value: unknown): "eur" | "usd" => {
  const v = typeof value === "string" ? value.toLowerCase() : "";
  return v === "usd" ? "usd" : "eur";
};

const normalizeInterval = (value: unknown): "month" | "year" => {
  const v = typeof value === "string" ? value.toLowerCase() : "";
  return v === "month" ? "month" : "year";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Body may include interval/currency OR a direct priceId (legacy)
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const requestedPriceId = typeof body.priceId === "string" ? body.priceId : undefined;
    const currency = normalizeCurrency(body.currency);
    const interval = normalizeInterval(body.interval);

    const computedPriceId = PRICE_ALLOWLIST.premium[interval][currency];
    const priceId = requestedPriceId ?? computedPriceId;
    if (!ALLOWED_PRICE_IDS.has(priceId)) {
      throw new Error("Invalid price selection");
    }
    logStep("Using price ID", { priceId, interval, currency, requestedPriceId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?checkout=success`,
      cancel_url: `${req.headers.get("origin")}/plans?checkout=canceled`,
      metadata: {
        user_id: user.id,
        currency,
        interval,
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
