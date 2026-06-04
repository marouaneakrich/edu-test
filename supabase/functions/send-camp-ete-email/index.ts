import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import nodemailer from "npm:nodemailer@6.9.16";

interface CampEteFormData {
  address?: string;
  numberOfChildren?: number;
  dateOfBirth?: string;
  specialNeeds?: string;
  allergies?: string;
  medicalConditions?: string;
  selectedWeeks?: string[];
  campType?: string;
  activities?: string[];
  specialRequests?: string;
  emergencyContactName?: string;
  emergencyPhone?: string;
  insurance?: string;
  medications?: string;
  photoConsent?: boolean;
  termsAccepted?: boolean;
}

interface SubmissionPayload {
  id: string;
  form_type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message?: string;
  form_data?: CampEteFormData;
  created_at: string;
}

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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderEmailShell(params: {
  preheader: string;
  topLabel: string;
  badge: string;
  titleHtml: string;
  introHtml: string;
  summaryHtml: string;
  ctaHref: string;
  ctaText: string;
  footerPill: string;
}) {
  const {
    preheader,
    topLabel,
    badge,
    titleHtml,
    introHtml,
    summaryHtml,
    ctaHref,
    ctaText,
    footerPill,
  } = params;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EducazenKids</title>
</head>
<body style="margin:0; padding:0; background:#f8eaf2; font-family:Arial, Helvetica, sans-serif; color:#262338;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:radial-gradient(circle at top left, #fdeff6 0%, #f8eaf2 35%, #f6f0fb 100%); padding:24px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:680px; background:#fffafc; border:1px solid #f3dce9; border-radius:30px; overflow:hidden; box-shadow:0 18px 50px rgba(104, 42, 88, 0.12);">

          <tr>
            <td style="padding:24px 28px 18px; background:linear-gradient(180deg, #fdeef6 0%, #fff7fb 100%);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:12px; letter-spacing:4px; color:#d11f8b; font-weight:700; text-transform:uppercase;">${escapeHtml(topLabel)}</td>
                  <td align="right" style="width:1%; white-space:nowrap; font-size:12px; color:#8a3a73; font-weight:700; background:#fff2fa; border:1px solid #f4d3e3; padding:8px 12px; border-radius:999px;">${escapeHtml(badge)}</td>
                </tr>
              </table>

              <h1 style="margin:14px 0 10px; font-size:42px; line-height:1.05; color:#262338; font-weight:900; letter-spacing:-0.8px;">
                ${titleHtml}
              </h1>

              <p style="margin:0; font-size:17px; line-height:1.6; color:#5e5a67; font-weight:700; max-width:560px;">
                ${introHtml}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 28px 10px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border:1px solid #f4e4ee; border-radius:24px; box-shadow:0 8px 20px rgba(42, 22, 39, 0.04);">
                <tr>
                  <td style="padding:22px;">
                    ${summaryHtml}
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
                      <a href="${ctaHref}" style="display:inline-block; color:#ffffff; text-decoration:none; font-size:16px; font-weight:800; letter-spacing:0.2px;">${escapeHtml(ctaText)}</a>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:0; font-size:12px; line-height:1.7; color:#7a7080; text-align:center;">
                Si vous souhaitez corriger une information, répondez simplement à cet email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 28px 28px; text-align:center;">
              <div style="display:inline-block; background:#fff2fa; border:1px solid #f4d3e3; border-radius:999px; padding:10px 16px; font-size:12px; color:#8a3a73; font-weight:700;">
                ${escapeHtml(footerPill)}
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
}

Deno.serve(async (req: Request) => {
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
    const submission: SubmissionPayload = await req.json();
    const SMTP_USER = Deno.env.get("SMTP_USER") || "admin@educazenkids.com";
    const SMTP_FROM = Deno.env.get("SMTP_FROM") || `EducazenKids <${SMTP_USER}>`;
    const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "admin@educazenkids.com";

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
    const fullName = submission.last_name;
    const phoneValue = submission.phone || "";
    const fd = submission.form_data || {};

    const ctaHref = "https://tanstack-start-app.educazenkid.workers.dev/";
    const ctaText = "Découvrir EducazenKids";

    const weeksList = Array.isArray(fd.selectedWeeks) ? fd.selectedWeeks.join(", ") : "";
    const activitiesList = Array.isArray(fd.activities) ? fd.activities.join(", ") : "";
    const specialRequestsValue = fd.specialRequests || "";
    const safeSpecialRequests = escapeHtml(specialRequestsValue);

    // Admin notification email
    const adminSummaryHtml = `
      <div style="font-size:12px; letter-spacing:3px; color:#6d6475; text-transform:uppercase; font-weight:700; margin-bottom:14px;">Inscription Summer Camp</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px; line-height:1.7; color:#2d2634;">
        <tr>
          <td style="width:50%; padding:10px 10px 10px 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Parent</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(submission.last_name)}</div>
          </td>
          <td style="width:50%; padding:10px 0 10px 10px; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Téléphone</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(phoneValue)}</div>
          </td>
        </tr>
        <tr>
          <td style="width:50%; padding:10px 10px 10px 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Email</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(submission.email)}</div>
          </td>
          <td style="width:50%; padding:10px 0 10px 10px; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Adresse</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(fd.address || "Non spécifié")}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 10px 10px 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Date de naissance</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(fd.dateOfBirth || "Non spécifié")}</div>
          </td>
          <td style="padding:10px 0 10px 10px; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Nombre d'enfants</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${fd.numberOfChildren ?? "1"}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 10px 10px 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Semaines choisies</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(weeksList || "Non spécifié")}</div>
          </td>
          <td style="padding:10px 0 10px 10px; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Activités</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(activitiesList || "Non spécifié")}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 10px 10px 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Type de camp</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${fd.campType === "fulltime" ? "Temps plein" : "Temps partiel"}</div>
          </td>
          <td style="padding:10px 0 10px 10px; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Besoins spéciaux</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(fd.specialNeeds || "Aucun")}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 10px 10px 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Allergies</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(fd.allergies || "Aucune")}</div>
          </td>
          <td style="padding:10px 0 10px 10px; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Conditions médicales</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(fd.medicalConditions || "Aucune")}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 10px 10px 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Médicaments</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(fd.medications || "Aucun")}</div>
          </td>
          <td style="padding:10px 0 10px 10px; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Assurance</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(fd.insurance || "Non spécifié")}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 10px 10px 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Contact urgence</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(fd.emergencyContactName || "Non spécifié")}</div>
          </td>
          <td style="padding:10px 0 10px 10px; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Tél urgence</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(fd.emergencyPhone || "Non spécifié")}</div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:10px 0 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Demandes spéciales</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:16px 15px; min-height:48px; white-space:pre-line; color:#463d4e; line-height:1.8;">${safeSpecialRequests}</div>
          </td>
        </tr>
      </table>
      <div style="margin-top:16px; font-size:12px; color:#7a7080; line-height:1.7;">
        <div><strong>Photo:</strong> ${fd.photoConsent ? "Consentement donné" : "Pas de consentement"}</div>
        <div><strong>ID:</strong> ${escapeHtml(submission.id)}</div>
        <div><strong>Soumis le:</strong> ${escapeHtml(new Date(submission.created_at).toLocaleString("fr-FR"))}</div>
      </div>
    `;

    const adminHtml = renderEmailShell({
      preheader: "Nouvelle inscription au Summer Camp reçue.",
      topLabel: "Summer Camp",
      badge: "NOUVELLE INSCRIPTION",
      titleHtml: 'Nouvelle <span style="color:#d11f8b;">inscription au Summer Camp</span> reçue',
      introHtml: `Une nouvelle inscription au Summer Camp a été soumise par <strong>${escapeHtml(fullName)}</strong>.`,
      summaryHtml: adminSummaryHtml,
      ctaHref,
      ctaText,
      footerPill: "Traitement recommandé sous 24h.",
    });

    await transporter.sendMail({
      from: SMTP_FROM,
      to: ADMIN_EMAIL,
      subject: `Nouvelle inscription au Summer Camp de ${fullName}`,
      html: adminHtml,
    });

    // Customer confirmation email
    const customerSummaryHtml = `
      <div style="font-size:12px; letter-spacing:3px; color:#6d6475; text-transform:uppercase; font-weight:700; margin-bottom:14px;">Récapitulatif de votre inscription</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px; line-height:1.7; color:#2d2634;">
        <tr>
          <td style="width:50%; padding:10px 10px 10px 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Nom complet</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(submission.last_name)}</div>
          </td>
          <td style="width:50%; padding:10px 0 10px 10px; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Téléphone</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(phoneValue)}</div>
          </td>
        </tr>
        <tr>
          <td style="width:50%; padding:10px 10px 10px 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Email</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(submission.email)}</div>
          </td>
          <td style="width:50%; padding:10px 0 10px 10px; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Nombre d'enfants</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${fd.numberOfChildren ?? "1"}</div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:10px 0 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Semaines choisies</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(weeksList || "Non spécifié")}</div>
          </td>
        </tr>
        <tr>
          <td style="width:50%; padding:10px 10px 10px 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Nom du contact d'urgence</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(fd.emergencyContactName || "Non spécifié")}</div>
          </td>
          <td style="width:50%; padding:10px 0 10px 10px; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Téléphone d'urgence</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(fd.emergencyPhone || "Non spécifié")}</div>
          </td>
        </tr>
      </table>
    `;

    const customerHtml = renderEmailShell({
      preheader: "Merci pour votre inscription au Summer Camp. Notre équipe vous contactera sous 24h.",
      topLabel: "Summer Camp",
      badge: "INSCRIPTION REÇUE",
      titleHtml: 'Confirmation de votre <span style="color:#d11f8b;">inscription au Summer Camp</span>',
      introHtml: `Bonjour ${escapeHtml(fullName)}, merci pour votre inscription au Summer Camp EducazenKids. Nous avons bien reçu votre demande et notre équipe vous contactera sous 24h pour finaliser les détails.`,
      summaryHtml: customerSummaryHtml,
      ctaHref,
      ctaText,
      footerPill: "Nous vous recontactons sous 24h.",
    });

    await transporter.sendMail({
      from: SMTP_FROM,
      to: submission.email,
      subject: "Confirmation de votre inscription au Summer Camp",
      html: customerHtml,
    });

    transporter.close();

    return new Response(JSON.stringify({
      success: true,
      message: "Camp-ete email sent",
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error) {
    console.error("Error sending camp-ete email:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
