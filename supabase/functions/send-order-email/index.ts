import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import nodemailer from "npm:nodemailer@6.9.16";

interface OrderItem {
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

interface OrderPayload {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: string;
  order_status: string;
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
                  <td align="right" style="font-size:12px; color:#8a3a73; font-weight:700; background:#fff2fa; border:1px solid #f4d3e3; padding:8px 12px; border-radius:999px;">${escapeHtml(badge)}</td>
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
              <p style="margin:0; font-size:12px; line-height:1.7; color:#c9c2d5;">L’enseignement sur mesure, dans un cadre bienveillant où chaque enfant trouve sa place.</p>
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
    const order: OrderPayload = await req.json();
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

    const ctaHref = "https://tanstack-start-app.educazenkid.workers.dev/";
    const ctaText = "Découvrir EducazenKids";

    const itemsRowsHtml = order.items.map((item) => {
      return `
        <tr>
          <td style="padding: 10px 12px; border: 1px solid #f3e6ee; background:#ffffff;">${escapeHtml(item.product_name)}</td>
          <td style="padding: 10px 12px; border: 1px solid #f3e6ee; text-align:center; background:#ffffff; font-weight:700;">${escapeHtml(String(item.quantity))}</td>
          <td style="padding: 10px 12px; border: 1px solid #f3e6ee; text-align:right; background:#ffffff;">${escapeHtml(String(item.product_price))} MAD</td>
          <td style="padding: 10px 12px; border: 1px solid #f3e6ee; text-align:right; background:#ffffff; font-weight:800;">${escapeHtml(String(item.subtotal))} MAD</td>
        </tr>`;
    }).join("");

    const recapHtml = `
      <div style="font-size:12px; letter-spacing:3px; color:#6d6475; text-transform:uppercase; font-weight:700; margin-bottom:14px;">Récapitulatif de la commande</div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px; line-height:1.7; color:#2d2634;">
        <tr>
          <td style="width:50%; padding:10px 10px 10px 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Nom</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(order.customer_name)}</div>
          </td>
          <td style="width:50%; padding:10px 0 10px 10px; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Prénom</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(order.customer_name)}</div>
          </td>
        </tr>

        <tr>
          <td style="width:50%; padding:10px 10px 10px 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Téléphone</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(order.customer_phone)}</div>
          </td>
          <td style="width:50%; padding:10px 0 10px 10px; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Email</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:13px 15px; font-weight:700;">${escapeHtml(order.customer_email)}</div>
          </td>
        </tr>

        <tr>
          <td colspan="2" style="padding:10px 0 0; vertical-align:top;">
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:6px;">Adresse de livraison</div>
            <div style="background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:16px 15px; color:#463d4e; line-height:1.8;">${escapeHtml(order.customer_address)}<br/>${escapeHtml(order.customer_city)}</div>
          </td>
        </tr>
      </table>

      <div style="margin-top:16px;">
        <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#7f7585; margin-bottom:8px;">Articles commandés</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="background:#fff2fa;">
              <th align="left" style="padding: 10px 12px; border: 1px solid #f3e6ee; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#8a3a73;">Produit</th>
              <th align="center" style="padding: 10px 12px; border: 1px solid #f3e6ee; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#8a3a73;">Qté</th>
              <th align="right" style="padding: 10px 12px; border: 1px solid #f3e6ee; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#8a3a73;">Prix</th>
              <th align="right" style="padding: 10px 12px; border: 1px solid #f3e6ee; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#8a3a73;">Sous-total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>

        <div style="margin-top:14px; display:block; text-align:right;">
          <div style="display:inline-block; background:#fbf7f9; border:1px solid #f3e6ee; border-radius:18px; padding:12px 14px; font-weight:900;">
            Total: ${escapeHtml(String(order.total_amount))} MAD
          </div>
        </div>
      </div>

      <div style="margin-top:16px; font-size:12px; color:#7a7080; line-height:1.7;">
        <div><strong>Commande ID:</strong> ${escapeHtml(order.id)}</div>
        <div><strong>Paiement:</strong> Paiement à la livraison</div>
      </div>
    `;

    const adminHtml = renderEmailShell({
      preheader: "Nouvelle commande reçue.",
      topLabel: "Commande",
      badge: "NOUVELLE COMMANDE",
      titleHtml: "Nouvelle <span style=\"color:#d11f8b;\">commande</span> reçue",
      introHtml: `Une nouvelle commande a été passée par <strong>${escapeHtml(order.customer_name)}</strong>.`,
      summaryHtml: recapHtml,
      ctaHref,
      ctaText,
      footerPill: "Traitement recommandé sous 24h.",
    });

    // Send to admin
    await transporter.sendMail({
      from: SMTP_FROM,
      to: ADMIN_EMAIL,
      subject: `Nouvelle commande #${order.id.slice(0, 8)} - ${order.total_amount} MAD`,
      html: adminHtml,
    });

    // Send confirmation to customer
    const customerHtml = renderEmailShell({
      preheader: "Merci pour votre commande. Nous vous contacterons bientôt pour la livraison.",
      topLabel: "Commande",
      badge: "COMMANDE REÇUE",
      titleHtml: "Confirmation de votre <span style=\"color:#d11f8b;\">commande</span>",
      introHtml: `Bonjour ${escapeHtml(order.customer_name)}, merci pour votre commande. Nous avons bien reçu votre commande et notre équipe vous recontactera sous 24h pour la livraison.`,
      summaryHtml: recapHtml,
      ctaHref,
      ctaText,
      footerPill: "Nous vous recontactons sous 24h.",
    });

    await transporter.sendMail({
      from: SMTP_FROM,
      to: order.customer_email,
      subject: `Confirmation de votre commande #${order.id.slice(0, 8)}`,
      html: customerHtml,
    });

    transporter.close();

    return new Response(JSON.stringify({
      success: true,
      message: "Order confirmation emails sent",
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error) {
    console.error("Error sending order email:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
