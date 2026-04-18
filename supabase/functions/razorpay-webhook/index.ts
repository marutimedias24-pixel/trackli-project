import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const body = await req.json();
    
    // Razorpay payment captured event
    if (body.event === "payment.captured") {
      const payment = body.payload.payment.entity;
      const notes = payment.notes || {};
      
      // User email se user dhundo
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Email se user ID lo
      const { data: userData } = await supabase.auth.admin
        .listUsers();
      
      const userEmail = notes.email || payment.email;
      const user = userData?.users?.find(u => u.email === userEmail);
      
      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
      }

      // Plan detect karo amount se
      const amount = payment.amount / 100; // paise to rupees
      const plan = amount >= 499 ? "yearly" : "monthly";
      const days = plan === "yearly" ? 365 : 30;
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      // Supabase mein subscription save karo
      await supabase.from("subscriptions").upsert({
        user_id:    user.id,
        plan:       plan,
        status:     "active",
        expires_at: expiresAt,
      }, { onConflict: "user_id" });

      return new Response(JSON.stringify({ success: true, plan }), { status: 200 });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});