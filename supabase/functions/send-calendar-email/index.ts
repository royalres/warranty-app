import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateICS(event: {
  title: string;
  description: string;
  location: string;
  startDate: string;
  uid: string;
}) {
  const dateStr = event.startDate.replace(/-/g, "");
  const now = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";

  // ใช้ ASCII เท่านั้น ไม่มีภาษาไทยใน ICS
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Royal Engineering Service//Warranty PM//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${event.uid}@royalres.co.th`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${dateStr}`,
    `SUMMARY:PM - ${event.uid}`,
    `LOCATION:${event.location.replace(/[^\x00-\x7F]/g, "")}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:PM Reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return ics;
}

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      to,
      pmDate,
      serialNo,
      model,
      installationSite,
      assignee,
      note,
      pmIndex,
      registrationId,
    } = body;

    if (!to || !pmDate || !serialNo) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const icsContent = generateICS({
      title: `PM ${pmIndex} - ${serialNo}`,
      description: `Serial: ${serialNo} | Model: ${model}`,
      location: installationSite || "",
      startDate: pmDate,
      uid: `${registrationId}-pm${pmIndex}-${pmDate}`,
    });

    const pmDateFormatted = new Date(pmDate).toLocaleDateString("th-TH", {
      year: "numeric", month: "long", day: "numeric"
    });

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0a1628; padding: 20px; border-bottom: 2px solid #c9a84c; text-align: center;">
          <h2 style="color: #c9a84c; margin: 0;">Royal Engineering Service</h2>
          <p style="color: #7a9cc0; margin: 4px 0 0;">แจ้งกำหนดการบำรุงรักษา (PM)</p>
        </div>
        <div style="padding: 24px; background: #f8fafc;">
          <h3 style="color: #0a1628;">PM ครั้งที่ ${pmIndex} — วันที่ ${pmDateFormatted}</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 16px;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; color: #64748b; width: 40%;">รุ่นสินค้า</td>
              <td style="padding: 10px; font-weight: 600;">${model}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; color: #64748b;">เลขซีเรียล</td>
              <td style="padding: 10px; font-weight: 600;">${serialNo}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; color: #64748b;">สถานที่ติดตั้ง</td>
              <td style="padding: 10px; font-weight: 600;">${installationSite || "-"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; color: #64748b;">ผู้รับผิดชอบ</td>
              <td style="padding: 10px; font-weight: 600;">${assignee || "-"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; color: #64748b;">รหัสลงทะเบียน</td>
              <td style="padding: 10px; font-weight: 600;">${registrationId}</td>
            </tr>
            ${note ? `<tr><td style="padding: 10px; color: #64748b;">หมายเหตุ</td><td style="padding: 10px;">${note}</td></tr>` : ""}
          </table>
          <div style="background: #fef9c3; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin-top: 20px;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              📅 ไฟล์ Calendar (.ics) แนบมาด้วย กดเปิดเพื่อเพิ่มใน Google Calendar / Outlook ได้เลย
            </p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">
            Royal Engineering Service Co., Ltd. | warranty.royalres.co.th
          </p>
        </div>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Royal Engineering Service <noreply@royalres.co.th>",
        to: [to],
        subject: `PM ครั้งที่ ${pmIndex} — ${model} (${serialNo}) วันที่ ${pmDateFormatted}`,
        html: html,
        attachments: [
          {
            filename: `PM-${serialNo}-${pmIndex}.ics`,
            content: toBase64(icsContent),
          },
        ],
      }),
    });

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: !result.error, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});