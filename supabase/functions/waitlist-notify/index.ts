import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const body = await req.json();
    const email = body?.record?.email;
    if (!email) return new Response("No email", { status: 400 });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Trackli <noreply@trackli.in>",
        to: [Deno.env.get("marutimedias.24@gmail.com")],
        subject: `New waitlist signup: ${email}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
            <div style="background:#0d2a16;border-radius:12px;padding:20px 24px;margin-bottom:20px">
              <h2 style="color:#22c55e;margin:0;font-size:18px">⚡ Trackli</h2>
            </div>
            <h3 style="color:#111827;margin-bottom:8px">New Waitlist Signup</h3>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px 22px;margin-bottom:16px">
              <p style="font-size:18px;font-weight:700;color:#166534;margin:0">${email}</p>
              <p style="font-size:12px;color:#86efac;margin:6px 0 0">
                ${new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata',dateStyle:'full',timeStyle:'short'})} IST
              </p>
            </div>
            <p style="color:#6b7280;font-size:13px;line-height:1.6">
              View all signups: <a href="https://supabase.com/dashboard/project/afcdoobasrvoxtzwfayf/editor" style="color:#16a34a">Supabase Dashboard</a>
            </p>
          </div>
        `,
      }),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});