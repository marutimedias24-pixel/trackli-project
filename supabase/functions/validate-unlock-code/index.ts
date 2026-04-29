import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, user_id, plan } = await req.json();

    if (!code || !user_id) {
      return new Response(
        JSON.stringify({ valid: false, message: "Missing required fields." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Use SERVICE ROLE key — never exposed to frontend
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up code in DB
    const { data: codeRow, error } = await sb
      .from("unlock_codes")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .maybeSingle();

    if (error || !codeRow) {
      return new Response(
        JSON.stringify({ valid: false, message: "Invalid code. Please check and try again." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already used by someone else
    if (codeRow.is_used && codeRow.used_by !== user_id) {
      return new Response(
        JSON.stringify({ valid: false, message: "This code has already been used." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if code is expired
    if (codeRow.expires_at && new Date(codeRow.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, message: "This code has expired." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Valid! Mark as used + create subscription
    const selectedPlan = codeRow.plan || plan || "yearly";
    const expiresAt = selectedPlan === "yearly"
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Upsert subscription
    await sb.from("subscriptions").upsert({
      user_id,
      plan: selectedPlan,
      status: "active",
      unlock_code: code.trim().toUpperCase(),
      expires_at: expiresAt,
    }, { onConflict: "user_id" });

    // Mark code as used
    await sb.from("unlock_codes").update({
      is_used: true,
      used_by: user_id,
      used_at: new Date().toISOString(),
    }).eq("code", code.trim().toUpperCase());

    return new Response(
      JSON.stringify({ valid: true, plan: selectedPlan, expires_at: expiresAt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ valid: false, message: "Server error. Please try again." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
