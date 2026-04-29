import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import nodemailer from "npm:nodemailer@6.9.16";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function createTransporter() {
  const host = Deno.env.get("SMTP_HOST") || "smtp.hostinger.com";
  const port = parseInt(Deno.env.get("SMTP_PORT") || "465");
  const user = Deno.env.get("SMTP_USER") || "";
  const pass = Deno.env.get("SMTP_PASS") || "";

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const { customer, payment } = await req.json();

    if (!customer || !payment) {
      throw new Error("Missing customer or payment data");
    }

    const SMTP_USER = Deno.env.get("SMTP_USER") || "admin@educazenkids.com";
    const SMTP_FROM = Deno.env.get("SMTP_FROM") || `EducazenKids <${SMTP_USER}>`;

    if (!Deno.env.get("SMTP_PASS")) {
      console.error("SMTP_PASS not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const transporter = createTransporter();

    // Generate HTML receipt
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reçu de Paiement - EducazenKids</title>
</head>
<body style="margin:0; padding:0; background:#f8eaf2; font-family:Arial, Helvetica, sans-serif; color:#262338;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:radial-gradient(circle at top left, #fdeff6 0%, #f8eaf2 35%, #f6f0fb 100%); padding:24px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:680px; background:#fffafc; border:1px solid #f3dce9; border-radius:30px; overflow:hidden; box-shadow:0 18px 50px rgba(104, 42, 88, 0.12);">
          <tr>
            <td style="padding:24px 28px 18px; background:linear-gradient(180deg, #fdeef6 0%, #fff7fb 100%);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:12px; letter-spacing:4px; color:#d11f8b; font-weight:700; text-transform:uppercase;">EducazenKids</td>
                  <td align="right" style="font-size:12px; color:#8a3a73; font-weight:700; background:#fff2fa; border:1px solid #f4d3e3; padding:8px 12px; border-radius:999px;">REÇU DE PAIEMENT</td>
                </tr>
              </table>
              <h1 style="margin:14px 0 10px; font-size:42px; line-height:1.05; color:#262338; font-weight:900; letter-spacing:-0.8px;">
                Reçu de <span style="color:#d11f8b;">paiement</span>
              </h1>
              <p style="margin:0; font-size:17px; line-height:1.6; color:#5e5a67; font-weight:700; max-width:560px;">
                Merci ${customer.parent_name}, voici votre reçu de paiement.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px 10px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border:1px solid #f4e4ee; border-radius:24px; box-shadow:0 8px 20px rgba(42, 22, 39, 0.04);">
                <tr>
                  <td style="padding:22px;">
                    <div style="font-size:12px; letter-spacing:3px; color:#6d6475; text-transform:uppercase; font-weight:700; margin-bottom:14px;">Détails du paiement</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:8px 0; color:#5e5a67; font-weight:700;">Parent:</td>
                        <td style="padding:8px 0; color:#262338;">${customer.parent_name}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; color:#5e5a67; font-weight:700;">Enfant:</td>
                        <td style="padding:8px 0; color:#262338;">${customer.child_name}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; color:#5e5a67; font-weight:700;">Montant:</td>
                        <td style="padding:8px 0; color:#262338; font-weight:900; font-size:18px;">${payment.amount} MAD</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; color:#5e5a67; font-weight:700;">Date:</td>
                        <td style="padding:8px 0; color:#262338;">${new Date(payment.payment_date).toLocaleDateString('fr-FR')}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; color:#5e5a67; font-weight:700;">Période:</td>
                        <td style="padding:8px 0; color:#262338;">${payment.period_covered}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; color:#5e5a67; font-weight:700;">Mode:</td>
                        <td style="padding:8px 0; color:#262338;">${payment.payment_method}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; color:#5e5a67; font-weight:700;">Reçu #:</td>
                        <td style="padding:8px 0; color:#262338; font-weight:700;">${payment.receipt_number}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 28px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 0 14px;">
                    <div style="background:linear-gradient(90deg, #ff2f9e 0%, #8d1fb0 100%); border-radius:22px; padding:16px 20px; text-align:center; box-shadow:0 12px 24px rgba(141,31,176,0.18);">
                      <a href="https://tanstack-start-app.educazenkid.workers.dev/" style="display:inline-block; color:#ffffff; text-decoration:none; font-size:16px; font-weight:800; letter-spacing:0.2px;">Voir votre espace client</a>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:0; font-size:12px; line-height:1.7; color:#7a7080; text-align:center;">
                Conservez ce reçu pour vos records.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px; text-align:center;">
              <div style="display:inline-block; background:#fff2fa; border:1px solid #f4d3e3; border-radius:999px; padding:10px 16px; font-size:12px; color:#8a3a73; font-weight:700;">
                Merci de votre confiance.
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#1f1a2b; padding:22px 28px; text-align:center;">
              <div style="font-size:24px; font-weight:900; letter-spacing:-0.4px; margin-bottom:8px;">
                <span style="color:#ffffff;">educa</span><span style="color:#39d0c8;">zen</span><span style="color:#ff4aa2;">kids</span>
              </div>
              <p style="margin:0; font-size:12px; line-height:1.7; color:#c9c2d5;">L'enseignement sur mesure, dans un cadre bienveillant où chaque enfant trouve sa place.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Send email using SMTP
    await transporter.sendMail({
      from: SMTP_FROM,
      to: customer.email,
      subject: `Reçu de paiement - ${payment.receipt_number}`,
      html: htmlTemplate,
    });

    transporter.close();

    // Initialize Supabase client to mark payment as sent
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('ez_crm_payments')
      .update({
        certificate_sent: true,
        certificate_sent_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Receipt sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error sending certificate:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
