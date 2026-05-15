import { Resend } from "resend"

export interface CalculationEmailData {
  recipientEmail: string
  recipientName?: string | null
  calculationType?: "planning" | "cost"
  portalName: string
  carrierName: string
  containerType: string
  containerId?: string | null
  departureDate: Date | string
  gateInDate?: Date | string | null
  freeUntilDate: Date | string
  freeDays: number
  totalCharge: number
  /** ISO-4217 (TRY/USD/EUR…). Defaults to TRY for back-compat. */
  currency?: string
  totalDaysAtPort?: number
  chargeableDays?: number
  warning?: string
  chargeBreakdown?: Array<{
    tier: number
    days: number
    price_per_day: number
    subtotal: number
  }>
}

export type SendEmailResult =
  | { status: "sent"; messageId: string }
  | { status: "dry_run"; to: string; subject: string }
  | { status: "not_configured"; reason: string }

const toDate = (value: Date | string | null | undefined) => {
  if (!value) return null
  return value instanceof Date ? value : new Date(value)
}

const CURRENCY_SYMBOL: Record<string, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
  GBP: "£",
}

const moneyFormatter = (currency: string) => (value: number) => {
  const code = (currency || "TRY").toUpperCase()
  const symbol = CURRENCY_SYMBOL[code]
  const num = value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return symbol ? `${num} ${symbol}` : `${num} ${code}`
}

const formatTL = moneyFormatter("TRY")

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

/**
 * Builds the branded HTML email — same visual language as the PDF
 * (emerald header band, hero card, info table, tier breakdown, warning,
 * footer). Uses inline styles only because Gmail/Outlook strip <style>
 * blocks; uses table-based layout for client compatibility.
 */
const buildEmailHtml = (data: CalculationEmailData) => {
  const departureDate = toDate(data.departureDate)
  const gateInDate = toDate(data.gateInDate)
  const freeUntilDate = toDate(data.freeUntilDate)
  const isPlanning = data.calculationType === "planning"
  const containerId = data.containerId?.trim() || "Belirtilmedi"
  const greetingName = data.recipientName?.trim() || "Merhaba"
  const fmt = moneyFormatter(data.currency || "TRY")
  const zeroLabel = `${(0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${
    (data.currency || "TRY") === "TRY"
      ? "₺"
      : (data.currency || "TRY") === "USD"
        ? "$"
        : data.currency
  }`

  const subject = isPlanning
    ? "Ardiyesiz giriş tarihi planlama sonucu"
    : "Ardiyesiz giriş masraf hesap sonucu"

  // Hero block content varies by mode (mirrors the PDF logic exactly).
  const hero = isPlanning
    ? {
        caption: "ARDİYESİZ GİRİŞ BAŞLANGICI",
        big: freeUntilDate?.toLocaleDateString("tr-TR") ?? "-",
        sub: `Konteyneriniz bu tarihten itibaren ücretsiz dolu giriş yapabilir (${data.freeDays} gün muafiyet).`,
      }
    : data.totalCharge === 0
      ? {
          caption: "SONUÇ",
          big: `${zeroLabel} — Ücretsiz`,
          sub: "Operasyonun tamamı muafiyet süresi içinde gerçekleşti.",
        }
      : {
          caption: "TOPLAM MASRAF",
          big: fmt(data.totalCharge),
          sub: `${data.chargeableDays ?? 0} ücretli gün üzerinden hesaplandı.`,
        }

  // Information rows (label, value), mirroring the PDF info card.
  const infoRows: Array<[string, string]> = [
    ["Liman", data.portalName],
    ["Hat", data.carrierName],
    ["Konteyner Tipi", data.containerType],
    ["Konteyner ID", containerId],
    ["Gemi Kalkış Tarihi", departureDate?.toLocaleDateString("tr-TR") ?? "-"],
    ["Ardiyesiz Giriş Başlangıcı", freeUntilDate?.toLocaleDateString("tr-TR") ?? "-"],
    ["Muafiyet Süresi", `${data.freeDays} gün`],
  ]
  if (gateInDate) infoRows.push(["Gate-in Tarihi", gateInDate.toLocaleDateString("tr-TR")])
  if (typeof data.totalDaysAtPort === "number") infoRows.push(["Toplam Liman Günü", `${data.totalDaysAtPort} gün`])
  if (typeof data.chargeableDays === "number") infoRows.push(["Ücretli Gün", `${data.chargeableDays} gün`])

  const infoRowsHtml = infoRows
    .map(
      ([label, value], idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? "#f9fafb" : "#ffffff"};">
        <td style="padding: 10px 16px; color: #6b7280; font-size: 14px;">${label}</td>
        <td style="padding: 10px 16px; color: #111827; font-weight: 600; text-align: right; font-size: 14px;">${value}</td>
      </tr>`
    )
    .join("")

  // Tier breakdown table — only for cost mode with actual charges.
  const showTiers =
    !isPlanning && data.totalCharge > 0 && data.chargeBreakdown && data.chargeBreakdown.length > 0
  const tierRowsHtml = showTiers
    ? data
        .chargeBreakdown!.map(
          (row, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? "#ffffff" : "#f9fafb"};">
          <td style="padding: 10px 12px; font-size: 14px; color: #111827;">Kademe ${row.tier}</td>
          <td style="padding: 10px 12px; font-size: 14px; color: #111827;">${row.days} gün</td>
          <td style="padding: 10px 12px; font-size: 14px; color: #111827;">${fmt(row.price_per_day)}</td>
          <td style="padding: 10px 12px; font-size: 14px; color: #111827; text-align: right; font-weight: 600;">${fmt(row.subtotal)}</td>
        </tr>`
        )
        .join("")
    : ""

  const tiersBlock = showTiers
    ? `
      <h2 style="font-size: 14px; margin: 24px 16px 8px; color: #111827; font-weight: 700;">
        Masraf Kırılımı
        <span style="display: inline-block; width: 20px; height: 2px; background: #10b981; vertical-align: middle; margin-left: 4px;"></span>
      </h2>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: calc(100% - 32px); margin: 0 16px; border-collapse: separate; border-spacing: 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background-color: #059669;">
            <th style="padding: 10px 12px; text-align: left; color: #ffffff; font-size: 13px; font-weight: 700;">Kademe</th>
            <th style="padding: 10px 12px; text-align: left; color: #ffffff; font-size: 13px; font-weight: 700;">Gün</th>
            <th style="padding: 10px 12px; text-align: left; color: #ffffff; font-size: 13px; font-weight: 700;">Birim Fiyat</th>
            <th style="padding: 10px 12px; text-align: right; color: #ffffff; font-size: 13px; font-weight: 700;">Tutar</th>
          </tr>
        </thead>
        <tbody>${tierRowsHtml}</tbody>
        <tfoot>
          <tr style="background-color: #ecfdf5;">
            <td colspan="3" style="padding: 12px; font-size: 14px; font-weight: 700; color: #047857;">TOPLAM MASRAF</td>
            <td style="padding: 12px; font-size: 14px; font-weight: 700; color: #047857; text-align: right;">${fmt(data.totalCharge)}</td>
          </tr>
        </tfoot>
      </table>`
    : ""

  // Warning card (amber) — only when we have a warning to show.
  const warningBlock = data.warning
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: calc(100% - 32px); margin: 16px 16px 0; border-collapse: separate; background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px;">
        <tr>
          <td style="padding: 12px 16px; vertical-align: top; width: 24px; font-size: 16px; font-weight: 700; color: #78350f;">!</td>
          <td style="padding: 12px 16px 12px 0; font-size: 14px; color: #78350f; line-height: 1.5;">${data.warning}</td>
        </tr>
      </table>`
    : ""

  const planningNote = isPlanning
    ? `
      <p style="margin: 16px 16px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
        Bu rapor planlama amaçlıdır. Toplam masrafı görmek için gate-in tarihiyle birlikte Masraf Hesabı akışını kullanın.
      </p>`
    : ""

  // Outer wrapper: table layout for max compatibility (Outlook ignores
  // most modern CSS), 640px max width, hidden preheader for inbox preview.
  const html = `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
      ${hero.caption}: ${hero.big} — ${hero.sub}
    </div>

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

            <!-- Greeting + title -->
            <tr>
              <td style="padding: 24px 16px 8px;">
                <p style="margin: 0 0 4px; font-size: 14px; color: #6b7280;">${greetingName},</p>
                <h1 style="margin: 0; font-size: 22px; color: #111827; font-weight: 700; line-height: 1.3;">
                  ${subject}
                </h1>
                <p style="margin: 6px 0 0; font-size: 13px; color: #9ca3af;">
                  Rapor tarihi: ${new Date().toLocaleDateString("tr-TR")}
                </p>
              </td>
            </tr>

            <!-- Hero card -->
            <tr>
              <td style="padding: 16px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px;">
                  <tr>
                    <td style="padding: 18px 20px;">
                      <p style="margin: 0; font-size: 11px; font-weight: 700; color: #047857; letter-spacing: 0.5px;">${hero.caption}</p>
                      <p style="margin: 6px 0; font-size: 30px; font-weight: 700; color: #047857; line-height: 1.1;">${hero.big}</p>
                      <p style="margin: 6px 0 0; font-size: 13px; color: #059669; line-height: 1.5;">${hero.sub}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Info table -->
            <tr>
              <td style="padding: 8px 16px 0;">
                <h2 style="font-size: 14px; margin: 0 0 8px; color: #111827; font-weight: 700;">
                  Hesaplama Bilgileri
                  <span style="display: inline-block; width: 20px; height: 2px; background: #10b981; vertical-align: middle; margin-left: 4px;"></span>
                </h2>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
                  ${infoRowsHtml}
                </table>
              </td>
            </tr>

            <!-- Tier breakdown (cost mode w/ charges only) -->
            <tr><td>${tiersBlock}</td></tr>

            <!-- Warning (if any) -->
            <tr><td>${warningBlock}</td></tr>

            <!-- Planning note (planning mode only) -->
            <tr><td>${planningNote}</td></tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 24px 16px 20px;">
                <div style="border-top: 1px solid #d1fae5; padding-top: 12px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                    <tr>
                      <td style="font-size: 12px; color: #9ca3af;">ardiyesizgiris.com · Otomatik oluşturulmuş rapor</td>
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

  return { headline: subject, html }
}

/**
 * Sends a calculation summary email.
 *
 * Configuration is driven by environment variables — no code change needed
 * to enable, switch providers, or run in dry-run mode:
 *
 *   RESEND_API_KEY   — real Resend key (re_...). When missing/placeholder,
 *                      sendCalculationEmail returns { status: "not_configured" }
 *                      so callers can show a friendly "henüz aktif değil" message.
 *   EMAIL_FROM       — verified sender address. Defaults to noreply@ardiyesizgiris.com.
 *   EMAIL_DRY_RUN    — when "true", skips Resend entirely and logs the
 *                      composed email to the server console. Useful for local
 *                      development before the domain is verified.
 */
export async function sendCalculationEmail(
  data: CalculationEmailData
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM?.trim() || "noreply@ardiyesizgiris.com"
  const dryRun = process.env.EMAIL_DRY_RUN === "true"

  const { headline, html } = buildEmailHtml(data)

  // Dry-run: render the template, log it, and return success without
  // hitting any external service. Lets the UI flow be tested end-to-end.
  if (dryRun) {
    console.log("[email:dry-run]", {
      to: data.recipientEmail,
      from,
      subject: headline,
      htmlPreview: html.slice(0, 240) + "...",
    })
    return { status: "dry_run", to: data.recipientEmail, subject: headline }
  }

  // Not configured yet — surface a structured signal so the API layer
  // can return 503 with a soft message instead of a generic 500.
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
    to: data.recipientEmail,
    subject: headline,
    html,
  })

  if (result.error) {
    // Bubble the Resend error so the route handler can log details and
    // return a 500. Never silently swallow — operations need to know.
    throw new Error(result.error.message || "Resend send failed")
  }

  return { status: "sent", messageId: result.data?.id ?? "sent" }
}
