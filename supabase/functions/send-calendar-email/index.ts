// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

console.log("Hello from Functions!");

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    // Called by another service with a secret key
    // ctx.supabaseAdmin bypasses RLS — use for privileged operations
    /*
    if (ctx.authMode === "secret") {
      const { user_id } = await req.json();
      const { data } = await ctx.supabaseAdmin.auth.admin.getUserById(user_id);

      return Response.json({
        email: data?.user?.email,
      });
    }
    */

    const { name } = await req.json();

    return Response.json({
      message: `Hello ${name}!`,
    });
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-calendar-email' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateICS(event: {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  uid: string;
}) {
  const dateStr = event.startDate.replace(/-/g, "");
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Royal Engineering Service//Warranty PM//TH
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${event.uid}@royalres.co.th
DTSTAMP:${now}
DTSTART;VALUE=DATE:${dateStr}
DTEND;VALUE=DATE:${dateStr}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:แจ้งเตือน PM พรุ่งนี้
END:VALARM
BEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
DESCRIPTION:แจ้งเตือน PM อีก 2 ชั่วโมง
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  icsContent: string;
  icsFilename: string;
}) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  const boundary = "boundary_" + Date.now();

  const emailBody = [
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    params.html,
    `--${boundary}`,
    `Content-Type: text/calendar; charset=UTF-8; method=REQUEST`,
    `Content-Disposition: attachment; filename="${params.icsFilename}"`,
    ``,
    params.icsContent,
    `--${boundary}--`,
  ].join("\r\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Royal Engineering Service <noreply@royalres.co.th>",
      to: [params.to],
      subject: params.subject,
      html: params.html,
      attachments: [
        {
          filename: params.icsFilename,
          content: btoa(params.icsContent),
        },
      ],
    }),
  });

  return response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      to,           // email ผู้รับ
      pmDate,       // วันที่ PM (YYYY-MM-DD)
      serialNo,     // เลขซีเรียล
      model,        // รุ่นสินค้า
      installationSite, // สถานที่ติดตั้ง
      assignee,     // ผู้รับผิดชอบ
      note,         // หมายเหตุ
      pmIndex,      // ครั้งที่
      registrationId, // รหัสการลงทะเบียน
    } = body;

    if (!to || !pmDate || !serialNo) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, pmDate, serialNo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const title = `🔧 PM ครั้งที่ ${pmIndex} — ${model} (${serialNo})`;
    const description = `การบำรุงรักษา (PM) ครั้งที่ ${pmIndex}\\nรุ่นสินค้า: ${model}\\nเลขซีเรียล: ${serialNo}\\nสถานที่: ${installationSite || "-"}\\nผู้รับผิดชอบ: ${assignee || "-"}\\nหมายเหตุ: ${note || "-"}\\nรหัสลงทะเบียน: ${registrationId}`;

    const icsContent = generateICS({
      title,
      description,
      location: installationSite || "",
      startDate: pmDate,
      uid: `${registrationId}-pm${pmIndex}-${pmDate}`,
    });

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0a1628; padding: 20px; border-bottom: 2px solid #c9a84c;">
          <img src="https://warranty.royalres.co.th/res-logo.png" style="height: 50px;" alt="Royal Engineering Service" />
        </div>
        <div style="padding: 24px; background: #f8fafc;">
          <h2 style="color: #0a1628; margin-bottom: 8px;">แจ้งกำหนดการบำรุงรักษา (PM)</h2>
          <p style="color: #64748b; font-size: 14px;">ครั้งที่ ${pmIndex} — วันที่ ${new Date(pmDate).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; color: #64748b; width: 40%;">รุ่นสินค้า</td>
                <td style="padding: 10px; font-weight: 600; color: #1e293b;">${model}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; color: #64748b;">เลขซีเรียล</td>
                <td style="padding: 10px; font-weight: 600; color: #1e293b;">${serialNo}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; color: #64748b;">สถานที่ติดตั้ง</td>
                <td style="padding: 10px; font-weight: 600; color: #1e293b;">${installationSite || "-"}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; color: #64748b;">ผู้รับผิดชอบ</td>
                <td style="padding: 10px; font-weight: 600; color: #1e293b;">${assignee || "-"}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; color: #64748b;">รหัสลงทะเบียน</td>
                <td style="padding: 10px; font-weight: 600; color: #1e293b;">${registrationId}</td>
              </tr>
              ${note ? `<tr>
                <td style="padding: 10px; color: #64748b;">หมายเหตุ</td>
                <td style="padding: 10px; color: #1e293b;">${note}</td>
              </tr>` : ""}
            </table>
          </div>

          <div style="background: #fef9c3; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              📅 ไฟล์ Calendar (.ics) แนบมาด้วยในอีเมลนี้ กดเปิดเพื่อเพิ่มใน Google Calendar / Outlook ได้เลยครับ
            </p>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            Royal Engineering Service Co., Ltd. | warranty.royalres.co.th
          </p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to,
      subject: `📅 แจ้งกำหนด PM ครั้งที่ ${pmIndex} — ${model} (${serialNo})`,
      html,
      icsContent,
      icsFilename: `PM-${serialNo}-${pmIndex}.ics`,
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});