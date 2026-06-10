const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter from environment variables.
 * Supports any SMTP provider (Gmail, SendGrid SMTP, Mailtrap, etc.).
 *
 * Required env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 *
 * Optional:
 *   EMAIL_FROM  — defaults to SMTP_USER
 *
 * If SMTP credentials are not configured the mailer is a no-op so the app
 * still works in environments where email is not set up.
 */

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null; // email not configured
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465, // true for 465, false for others
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/**
 * Sends a recommendation email to the user.
 *
 * @param {{fullName: string, email: string, recommendation: string, explanation: string, roadmap: string[]}} params
 */
async function sendRecommendationEmail({ fullName, email, recommendation, explanation, roadmap }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.info('Email notification skipped — SMTP not configured.');
    return;
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  const roadmapHtml = roadmap
    .map(
      (step, i) => `
      <tr>
        <td style="padding:8px 0;vertical-align:top;">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;
                       border-radius:50%;background:#4f46e5;color:#fff;font-size:12px;font-weight:700;
                       flex-shrink:0;margin-right:12px;">${i + 1}</span>
        </td>
        <td style="padding:8px 0;color:#374151;font-size:14px;line-height:1.6;">${step}</td>
      </tr>`,
    )
    .join('');

  const badgeColors = {
    'Certification Program': '#16a34a',
    DBA:                      '#2563eb',
    PhD:                      '#7c3aed',
    'Honorary Doctorate':     '#d97706',
  };
  const badgeColor = badgeColors[recommendation] || '#4f46e5';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Your Academic Pathway Recommendation</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#3b82f6,#7c3aed);padding:40px 40px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:28px;">🎓</p>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                Your Academic Pathway
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                Personalised recommendation from AcademicPath
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
                Hi <strong>${fullName}</strong>,<br />
                Thank you for using AcademicPath. Based on your profile and career goals,
                here is your personalised academic pathway recommendation:
              </p>

              <!-- Recommendation badge -->
              <div style="text-align:center;margin:0 0 28px;">
                <span style="display:inline-block;padding:12px 28px;border-radius:9999px;
                             background:${badgeColor};color:#ffffff;font-size:18px;
                             font-weight:800;letter-spacing:0.3px;">
                  ${recommendation}
                </span>
              </div>

              <!-- Explanation -->
              <h2 style="margin:0 0 12px;color:#111827;font-size:16px;font-weight:700;">
                Why this recommendation?
              </h2>
              <p style="margin:0 0 28px;color:#4b5563;font-size:14px;line-height:1.7;
                        background:#f9fafb;border-left:4px solid ${badgeColor};
                        padding:16px 20px;border-radius:0 8px 8px 0;">
                ${explanation}
              </p>

              <!-- Roadmap -->
              <h2 style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:700;">
                Your recommended roadmap
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${roadmapHtml}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 36px;text-align:center;">
              <a href="${process.env.FRONTEND_URL || 'https://your-app.vercel.app'}/submissions"
                 style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#3b82f6,#7c3aed);
                        color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;
                        border-radius:10px;box-shadow:0 4px 12px rgba(79,70,229,0.35);">
                View All Submissions
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                You received this email because you submitted your profile on AcademicPath.<br />
                © ${new Date().getFullYear()} AcademicPath · All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `
Hi ${fullName},

Your recommended academic pathway: ${recommendation}

Why: ${explanation}

Your roadmap:
${roadmap.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Visit: ${process.env.FRONTEND_URL || 'https://your-app.vercel.app'}

© ${new Date().getFullYear()} AcademicPath
  `.trim();

  await transporter.sendMail({
    from: `"AcademicPath" <${from}>`,
    to: email,
    subject: `Your Academic Pathway: ${recommendation} 🎓`,
    text,
    html,
  });

  console.info(`Recommendation email sent to ${email}`);
}

module.exports = { sendRecommendationEmail };
