import { Resend } from "resend"

export type SendVerificationEmailResult =
  | { status: "sent"; messageId: string }
  | { status: "dry_run"; to: string; subject: string }
  | { status: "not_configured"; reason: string }

/**
 * Decides whether the configured Resend API key looks real.
 * Empty, missing, the literal "re_xxxxx" sample, or anything containing
 * "YOUR_API_KEY" is treated as "not configured yet".
 */
const isApiKeyValid = (key?: string): boolean => {
  if (!key) return false
  const trimmed = key.trim()
  if (trimmed.length < 8) return false
  if (!trimmed.startsWith("re_")) return false
  if (trimmed.toUpperCase().includes("YOUR_API_KEY")) return false
  if (/^re_x+$/i.test(trimmed)) return false
  return true
}

const buildVerificationEmailHtml = (verificationUrl: string, recipientName?: string | null): string => {
  const greeting = recipientName?.trim() ? recipientName.trim() : "Merhaba"

  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Email Adresinizi Onaylayın</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #f3f4f6;">
      <tr>
        <td align="center" style="padding: 24px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 640px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">

            <!-- Brand header band -->
            <tr>
              <td style="background-color: #059669; padding: 16px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                  <tr>
                    <td style="color: #ffffff; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                      ⚓ ARDİYESİZ GİRİŞ
                    </td>
                    <td style="color: #d1fae5; font-size: 13px; text-align: right;">ardiyesizgiris.com</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="background-color: #10b981; height: 3px; line-height: 3px; font-size: 0;">&nbsp;</td></tr>

            <!-- Content -->
            <tr>
              <td style="padding: 32px 24px 16px;">
                <p style="margin: 0 0 8px; font-size: 15px; color: #6b7280;">${greeting},</p>
                <h1 style="margin: 0 0 16px; font-size: 22px; color: #111827; font-weight: 700; line-height: 1.3;">
                  Email Adresinizi Onaylayın
                </h1>
                <p style="margin: 0 0 24px; font-size: 15px; color: #374151; line-height: 1.6;">
                  Ardiyesiz Giriş hesabınızı aktif etmek için aşağıdaki butona tıklayarak email adresinizi onaylayın.
                  Bu link <strong>24 saat</strong> geçerlidir.
                </p>

                <!-- CTA Button -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px;">
                  <tr>
                    <td style="background-color: #059669; border-radius: 8px;">
                      <a href="${verificationUrl}"
                         style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px;">
                        Email Adresimi Onayla
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; line-height: 1.5;">
                  Butona tıklayamıyorsanız aşağıdaki bağlantıyı kopyalayıp tarayıcınıza yapıştırın:
                </p>
                <p style="margin: 0 0 24px; font-size: 12px; color: #9ca3af; word-break: break-all;">
                  ${verificationUrl}
                </p>

                <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                  Bu emaili siz istemediyseniz güvenle görmezden gelebilirsiniz.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 16px 24px 20px;">
                <div style="border-top: 1px solid #d1fae5; padding-top: 12px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                    <tr>
                      <td style="font-size: 12px; color: #9ca3af;">ardiyesizgiris.com · Otomatik oluşturulmuş mesaj</td>
                      <td style="font-size: 12px; color: #9ca3af; text-align: right;">${new Date().toLocaleDateString("tr-TR")}</td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

/**
 * Sends an email verification link to the newly registered user.
 *
 * Graceful failure behaviour (context.md):
 * - When Resend is not configured / dry-run mode: returns structured result, does NOT throw.
 * - Callers must wrap this in try/catch and handle gracefully (warn, never block registration).
 */
export async function sendVerificationEmail(
  recipientEmail: string,
  verificationUrl: string,
  recipientName?: string | null
): Promise<SendVerificationEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM?.trim() || "noreply@ardiyesizgiris.com"
  const dryRun = process.env.EMAIL_DRY_RUN === "true"

  const subject = "Email adresinizi onaylayın — Ardiyesiz Giriş"
  const html = buildVerificationEmailHtml(verificationUrl, recipientName)

  if (dryRun) {
    console.log("[email:dry-run] verification", {
      to: recipientEmail,
      from,
      subject,
      verificationUrl,
    })
    return { status: "dry_run", to: recipientEmail, subject }
  }

  if (!isApiKeyValid(apiKey)) {
    return {
      status: "not_configured",
      reason:
        "RESEND_API_KEY is missing or contains a placeholder value. Set a real Resend key in .env.local to enable email delivery.",
    }
  }

  const resend = new Resend(apiKey)
  const result = await resend.emails.send({
    from,
    to: recipientEmail,
    subject,
    html,
  })

  if (result.error) {
    throw new Error(result.error.message || "Resend send failed")
  }

  return { status: "sent", messageId: result.data?.id ?? "sent" }
}
