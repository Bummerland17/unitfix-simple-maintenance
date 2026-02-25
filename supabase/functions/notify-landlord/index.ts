const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();

    if (!record || !record.unit_id) {
      return new Response(JSON.stringify({ error: "Missing record data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get unit + property + landlord info
    const { data: unit, error: unitError } = await supabase
      .from("units")
      .select("unit_name, property_id, properties(name, landlord_id)")
      .eq("id", record.unit_id)
      .single();

    if (unitError || !unit) {
      console.error("Unit lookup failed:", unitError);
      return new Response(JSON.stringify({ error: "Unit not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const landlordId = (unit as any).properties?.landlord_id;
    if (!landlordId) {
      return new Response(JSON.stringify({ error: "Landlord not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get landlord email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("user_id", landlordId)
      .single();

    if (!profile?.email) {
      return new Response(JSON.stringify({ error: "Landlord email not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const propertyName = (unit as any).properties?.name || "Unknown Property";
    const urgencyColor = record.urgency === "High" ? "#dc2626" : record.urgency === "Medium" ? "#f59e0b" : "#6b7280";

    // Send email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "UnitFix <onboarding@resend.dev>",
        to: [profile.email],
        subject: `🔧 New ${record.urgency} Maintenance Request — ${propertyName}, ${unit.unit_name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #1e3a5f; margin-bottom: 16px;">New Maintenance Request</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Property</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${propertyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Unit</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${unit.unit_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tenant</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${record.tenant_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Contact</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${record.tenant_contact}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Urgency</td>
                <td style="padding: 8px 0;"><span style="background: ${urgencyColor}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">${record.urgency}</span></td>
              </tr>
            </table>
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 4px;">Issue Description</p>
              <p style="color: #1e293b; font-size: 14px; margin: 0;">${record.issue_description}</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">— UnitFix</p>
          </div>
        `,
      }),
    });

    const emailResult = await emailRes.json();
    console.log("Email sent:", emailResult);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
