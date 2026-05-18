import jsPDF from "jspdf"
import fs from "node:fs"
import path from "node:path"

export interface CalculationPDFData {
  calculationType?: "planning" | "cost"
  portalName: string
  carrierName: string
  containerId?: string | null
  containerType: string
  departureDate: Date | string
  gateInDate?: Date | string | null
  freeDays: number
  freeUntilDate: Date | string
  totalCharge: number
  /** ISO-4217 (TRY/USD/EUR…). Optional for back-compat; defaults to TRY. */
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
  surcharges?: Array<{
    name: string
    amount: number
    currency: string
    apply_type: string
  }>
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
  // jsPDF default font has no €/£ glyphs; use the ISO code suffix as a safe
  // fallback for anything outside TRY/USD. TRY/USD use their well-known sign.
  if (symbol && (code === "TRY" || code === "USD")) {
    return `${num} ${symbol}`
  }
  return `${num} ${code}`
}

const toDate = (value: Date | string | null | undefined) => {
  if (!value) return null
  return value instanceof Date ? value : new Date(value)
}

// Default formatter (TRY) — kept for any legacy call sites and as a
// fallback. Currency-aware sites use moneyFormatter(currency) instead.
const formatTL = moneyFormatter("TRY")

// ─── Brand palette (Tailwind emerald + neutrals) ─────────────────────
const COLORS = {
  EMERALD_PRIMARY: [16, 185, 129] as const, // emerald-500
  EMERALD_DARK: [5, 150, 105] as const, // emerald-600
  EMERALD_DARKER: [4, 120, 87] as const, // emerald-700
  EMERALD_LIGHT: [236, 253, 245] as const, // emerald-50
  EMERALD_BORDER: [167, 243, 208] as const, // emerald-200
  TEXT_PRIMARY: [17, 24, 39] as const, // gray-900
  TEXT_MUTED: [107, 114, 128] as const, // gray-500
  TEXT_SOFT: [75, 85, 99] as const, // gray-600
  BORDER: [229, 231, 235] as const, // gray-200
  SURFACE: [249, 250, 251] as const, // gray-50
  AMBER_LIGHT: [254, 243, 199] as const, // amber-100
  AMBER_BORDER: [252, 211, 77] as const, // amber-300
  AMBER_TEXT: [120, 53, 15] as const, // amber-900
} as const

// ─── Page geometry ──────────────────────────────────────────────────
const PAGE = {
  WIDTH: 210, // A4 mm
  HEIGHT: 297,
  MARGIN_X: 20,
  CONTENT_WIDTH: 170,
  HEADER_HEIGHT: 22,
  FOOTER_Y: 285,
} as const

// ─── Font loading (cached at module level) ───────────────────────────
const FONT_DIR = path.join(process.cwd(), "lib", "pdf", "fonts")
const FONT_FAMILY = "Inter"

let cachedFonts: { regular: string; bold: string } | null = null

const loadFonts = () => {
  if (cachedFonts) return cachedFonts
  cachedFonts = {
    regular: fs.readFileSync(path.join(FONT_DIR, "Inter-Regular.ttf")).toString("base64"),
    bold: fs.readFileSync(path.join(FONT_DIR, "Inter-Bold.ttf")).toString("base64"),
  }
  return cachedFonts
}

const registerFonts = (doc: jsPDF) => {
  const { regular, bold } = loadFonts()
  doc.addFileToVFS("Inter-Regular.ttf", regular)
  doc.addFont("Inter-Regular.ttf", FONT_FAMILY, "normal")
  doc.addFileToVFS("Inter-Bold.ttf", bold)
  doc.addFont("Inter-Bold.ttf", FONT_FAMILY, "bold")
  doc.setFont(FONT_FAMILY, "normal")
}

// ─── Tiny color helpers (jsPDF rgb tuples are spread args) ───────────
const setFill = (doc: jsPDF, c: readonly [number, number, number]) => doc.setFillColor(c[0], c[1], c[2])
const setText = (doc: jsPDF, c: readonly [number, number, number]) => doc.setTextColor(c[0], c[1], c[2])
const setDraw = (doc: jsPDF, c: readonly [number, number, number]) => doc.setDrawColor(c[0], c[1], c[2])

// ─── Components ──────────────────────────────────────────────────────
/**
 * Top brand band: full-width emerald strip with a stylised "Ship" glyph
 * built from a couple of triangles (no image asset needed) and the
 * site name in white. Mirrors the public header look.
 */
const drawHeaderBand = (doc: jsPDF) => {
  setFill(doc, COLORS.EMERALD_DARK)
  doc.rect(0, 0, PAGE.WIDTH, PAGE.HEADER_HEIGHT, "F")

  // Subtle bottom accent line in lighter emerald
  setFill(doc, COLORS.EMERALD_PRIMARY)
  doc.rect(0, PAGE.HEADER_HEIGHT, PAGE.WIDTH, 1.2, "F")

  // Small geometric ship-ish glyph (white, simple triangle hull + sail)
  const glyphX = PAGE.MARGIN_X
  const glyphY = 8
  doc.setDrawColor(255, 255, 255)
  doc.setFillColor(255, 255, 255)
  // Sail triangle
  doc.triangle(glyphX + 3, glyphY, glyphX + 3, glyphY + 6, glyphX + 7, glyphY + 6, "F")
  // Hull (trapezoid as two triangles)
  doc.triangle(glyphX, glyphY + 7.5, glyphX + 10, glyphY + 7.5, glyphX + 9, glyphY + 10, "F")
  doc.triangle(glyphX, glyphY + 7.5, glyphX + 9, glyphY + 10, glyphX + 1, glyphY + 10, "F")

  // Brand name
  doc.setFont(FONT_FAMILY, "bold")
  doc.setFontSize(13)
  doc.setTextColor(255, 255, 255)
  doc.text("ARDİYESİZ GİRİŞ", glyphX + 14, 14)

  // Tagline (right side)
  doc.setFont(FONT_FAMILY, "normal")
  doc.setFontSize(9)
  doc.text("ardiyesizgiris.com", PAGE.WIDTH - PAGE.MARGIN_X, 14, { align: "right" })
}

/**
 * Page title + subtle meta line + thin divider beneath.
 * Returns the y-coordinate where the next block should start.
 */
const drawTitleSection = (doc: jsPDF, title: string): number => {
  let y = PAGE.HEADER_HEIGHT + 14

  doc.setFont(FONT_FAMILY, "bold")
  doc.setFontSize(18)
  setText(doc, COLORS.TEXT_PRIMARY)
  doc.text(title, PAGE.MARGIN_X, y)

  y += 7
  doc.setFont(FONT_FAMILY, "normal")
  doc.setFontSize(9)
  setText(doc, COLORS.TEXT_MUTED)
  doc.text(
    `Rapor tarihi: ${new Date().toLocaleDateString("tr-TR")}`,
    PAGE.MARGIN_X,
    y
  )

  y += 3
  setDraw(doc, COLORS.BORDER)
  doc.setLineWidth(0.3)
  doc.line(PAGE.MARGIN_X, y, PAGE.WIDTH - PAGE.MARGIN_X, y)

  return y + 8
}

/**
 * The "headline" emerald result card — the single thing the user
 * cares about most. Shows the free-entry start date in big numbers
 * with a small caption above and a contextual sub-line below.
 */
const drawHeroCard = (
  doc: jsPDF,
  caption: string,
  big: string,
  subtitle: string,
  y: number
): number => {
  const h = 30
  // Card background
  setFill(doc, COLORS.EMERALD_LIGHT)
  setDraw(doc, COLORS.EMERALD_BORDER)
  doc.setLineWidth(0.4)
  doc.roundedRect(PAGE.MARGIN_X, y, PAGE.CONTENT_WIDTH, h, 3, 3, "FD")

  // Caption (small, dark emerald)
  doc.setFont(FONT_FAMILY, "normal")
  doc.setFontSize(9)
  setText(doc, COLORS.EMERALD_DARKER)
  doc.text(caption.toUpperCase(), PAGE.MARGIN_X + 6, y + 8)

  // Big value
  doc.setFont(FONT_FAMILY, "bold")
  doc.setFontSize(22)
  setText(doc, COLORS.EMERALD_DARKER)
  doc.text(big, PAGE.MARGIN_X + 6, y + 19)

  // Subtitle / context
  doc.setFont(FONT_FAMILY, "normal")
  doc.setFontSize(9)
  setText(doc, COLORS.EMERALD_DARK)
  doc.text(subtitle, PAGE.MARGIN_X + 6, y + 26)

  return y + h + 8
}

const drawSectionTitle = (doc: jsPDF, text: string, y: number): number => {
  doc.setFont(FONT_FAMILY, "bold")
  doc.setFontSize(11)
  setText(doc, COLORS.TEXT_PRIMARY)
  doc.text(text, PAGE.MARGIN_X, y)
  // Tiny emerald accent under the title
  setFill(doc, COLORS.EMERALD_PRIMARY)
  doc.rect(PAGE.MARGIN_X, y + 1.5, 18, 0.8, "F")
  return y + 7
}

/**
 * Key/value information card: alternating row backgrounds, gray border,
 * key column left-aligned, value column right-aligned for cleaner read.
 */
const drawInfoCard = (
  doc: jsPDF,
  rows: Array<[label: string, value: string]>,
  y: number
): number => {
  const rowHeight = 7
  const padding = 5
  const cardHeight = rows.length * rowHeight + padding * 2

  // Card frame
  setFill(doc, COLORS.SURFACE)
  setDraw(doc, COLORS.BORDER)
  doc.setLineWidth(0.3)
  doc.roundedRect(PAGE.MARGIN_X, y, PAGE.CONTENT_WIDTH, cardHeight, 2, 2, "FD")

  let rowY = y + padding + 5
  rows.forEach((row, idx) => {
    // Zebra background for odd rows
    if (idx % 2 === 1) {
      setFill(doc, [255, 255, 255])
      doc.rect(PAGE.MARGIN_X + 1, rowY - 4.5, PAGE.CONTENT_WIDTH - 2, rowHeight, "F")
    }

    doc.setFont(FONT_FAMILY, "normal")
    doc.setFontSize(9.5)
    setText(doc, COLORS.TEXT_MUTED)
    doc.text(row[0], PAGE.MARGIN_X + padding, rowY)

    doc.setFont(FONT_FAMILY, "bold")
    setText(doc, COLORS.TEXT_PRIMARY)
    doc.text(row[1], PAGE.WIDTH - PAGE.MARGIN_X - padding, rowY, { align: "right" })

    rowY += rowHeight
  })

  return y + cardHeight + 8
}

/**
 * Tier-pricing breakdown table with an emerald header row and a
 * highlighted total row at the bottom.
 */
const drawTierTable = (
  doc: jsPDF,
  rows: NonNullable<CalculationPDFData["chargeBreakdown"]>,
  totalCharge: number,
  y: number,
  currency: string = "TRY"
): number => {
  const fmt = moneyFormatter(currency)
  const headerH = 8
  const rowH = 7
  const totalRowH = 9
  const cols = {
    tier: { x: PAGE.MARGIN_X, w: 40 },
    days: { x: PAGE.MARGIN_X + 40, w: 30 },
    unit: { x: PAGE.MARGIN_X + 70, w: 50 },
    sub: { x: PAGE.MARGIN_X + 120, w: 50 },
  }
  const tableHeight = headerH + rows.length * rowH + totalRowH

  // Outer border
  setDraw(doc, COLORS.BORDER)
  doc.setLineWidth(0.3)
  doc.roundedRect(PAGE.MARGIN_X, y, PAGE.CONTENT_WIDTH, tableHeight, 2, 2, "S")

  // Header
  setFill(doc, COLORS.EMERALD_DARK)
  doc.roundedRect(PAGE.MARGIN_X, y, PAGE.CONTENT_WIDTH, headerH, 2, 2, "F")
  // Square off bottom of header (since the rounded rect rounds all 4 corners)
  doc.rect(PAGE.MARGIN_X, y + headerH - 2, PAGE.CONTENT_WIDTH, 2, "F")

  doc.setFont(FONT_FAMILY, "bold")
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text("Kademe", cols.tier.x + 4, y + 5.5)
  doc.text("Gün", cols.days.x + 4, y + 5.5)
  doc.text("Birim Fiyat", cols.unit.x + 4, y + 5.5)
  doc.text("Tutar", PAGE.WIDTH - PAGE.MARGIN_X - 4, y + 5.5, { align: "right" })

  // Body
  let rowY = y + headerH + 5
  rows.forEach((row, idx) => {
    if (idx % 2 === 1) {
      setFill(doc, COLORS.SURFACE)
      doc.rect(PAGE.MARGIN_X + 0.3, rowY - 4.5, PAGE.CONTENT_WIDTH - 0.6, rowH, "F")
    }
    doc.setFont(FONT_FAMILY, "normal")
    doc.setFontSize(9.5)
    setText(doc, COLORS.TEXT_PRIMARY)
    doc.text(`Kademe ${row.tier}`, cols.tier.x + 4, rowY)
    doc.text(`${row.days} gün`, cols.days.x + 4, rowY)
    doc.text(fmt(row.price_per_day), cols.unit.x + 4, rowY)
    doc.text(fmt(row.subtotal), PAGE.WIDTH - PAGE.MARGIN_X - 4, rowY, { align: "right" })
    rowY += rowH
  })

  // Total row (light emerald background, bold)
  setFill(doc, COLORS.EMERALD_LIGHT)
  doc.rect(PAGE.MARGIN_X + 0.3, rowY - 4.5, PAGE.CONTENT_WIDTH - 0.6, totalRowH, "F")
  // Top divider above total
  setDraw(doc, COLORS.EMERALD_BORDER)
  doc.setLineWidth(0.4)
  doc.line(PAGE.MARGIN_X, rowY - 4.5, PAGE.WIDTH - PAGE.MARGIN_X, rowY - 4.5)

  doc.setFont(FONT_FAMILY, "bold")
  doc.setFontSize(10)
  setText(doc, COLORS.EMERALD_DARKER)
  doc.text("TOPLAM MASRAF", cols.tier.x + 4, rowY + 1)
  doc.text(fmt(totalCharge), PAGE.WIDTH - PAGE.MARGIN_X - 4, rowY + 1, { align: "right" })

  return y + tableHeight + 8
}

/**
 * Amber-bordered notice card for warnings — visually distinct from
 * the emerald hero so users notice it without alarm.
 */
const drawSurchargeTable = (
  doc: jsPDF,
  surcharges: NonNullable<CalculationPDFData["surcharges"]>,
  y: number
): number => {
  if (!surcharges || surcharges.length === 0) return y

  const headerH = 8
  const rowH = 7
  const totalRowH = 9
  const tableHeight = headerH + surcharges.length * rowH + totalRowH

  // Outer border
  setDraw(doc, [252, 211, 77]) // amber-300
  doc.setLineWidth(0.3)
  doc.roundedRect(PAGE.MARGIN_X, y, PAGE.CONTENT_WIDTH, tableHeight, 2, 2, "S")

  // Header
  setFill(doc, [217, 119, 6]) // amber-600
  doc.roundedRect(PAGE.MARGIN_X, y, PAGE.CONTENT_WIDTH, headerH, 2, 2, "F")
  doc.rect(PAGE.MARGIN_X, y + headerH - 2, PAGE.CONTENT_WIDTH, 2, "F")

  doc.setFont(FONT_FAMILY, "bold")
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text("Açıklama", PAGE.MARGIN_X + 4, y + 5.5)
  doc.text("Tutar", PAGE.WIDTH - PAGE.MARGIN_X - 4, y + 5.5, { align: "right" })

  // Body rows
  let rowY = y + headerH + 5
  surcharges.forEach((s, idx) => {
    if (idx % 2 === 1) {
      setFill(doc, COLORS.SURFACE)
      doc.rect(PAGE.MARGIN_X + 0.3, rowY - 4.5, PAGE.CONTENT_WIDTH - 0.6, rowH, "F")
    }
    const fmts = moneyFormatter(s.currency)
    doc.setFont(FONT_FAMILY, "normal")
    doc.setFontSize(9.5)
    setText(doc, COLORS.TEXT_PRIMARY)
    doc.text(s.name, PAGE.MARGIN_X + 4, rowY)
    doc.text(fmts(s.amount), PAGE.WIDTH - PAGE.MARGIN_X - 4, rowY, { align: "right" })
    rowY += rowH
  })

  // Total row
  setFill(doc, COLORS.AMBER_LIGHT)
  doc.rect(PAGE.MARGIN_X + 0.3, rowY - 4.5, PAGE.CONTENT_WIDTH - 0.6, totalRowH, "F")
  setDraw(doc, COLORS.AMBER_BORDER)
  doc.setLineWidth(0.4)
  doc.line(PAGE.MARGIN_X, rowY - 4.5, PAGE.WIDTH - PAGE.MARGIN_X, rowY - 4.5)

  const totalSurcharge = surcharges.reduce((sum, s) => sum + s.amount, 0)
  const fmtsFirst = moneyFormatter(surcharges[0].currency)
  doc.setFont(FONT_FAMILY, "bold")
  doc.setFontSize(10)
  setText(doc, COLORS.AMBER_TEXT)
  doc.text("SURCHARGE TOPLAM", PAGE.MARGIN_X + 4, rowY + 1)
  doc.text(fmtsFirst(totalSurcharge), PAGE.WIDTH - PAGE.MARGIN_X - 4, rowY + 1, { align: "right" })

  return y + tableHeight + 8
}

const drawWarningCard = (doc: jsPDF, message: string, y: number): number => {
  const padding = 5
  const lines = doc.splitTextToSize(message, PAGE.CONTENT_WIDTH - padding * 2 - 8)
  const h = lines.length * 5 + padding * 2 + 2

  setFill(doc, COLORS.AMBER_LIGHT)
  setDraw(doc, COLORS.AMBER_BORDER)
  doc.setLineWidth(0.4)
  doc.roundedRect(PAGE.MARGIN_X, y, PAGE.CONTENT_WIDTH, h, 2, 2, "FD")

  // ! glyph
  doc.setFont(FONT_FAMILY, "bold")
  doc.setFontSize(11)
  setText(doc, COLORS.AMBER_TEXT)
  doc.text("!", PAGE.MARGIN_X + padding + 1, y + padding + 4)

  doc.setFont(FONT_FAMILY, "normal")
  doc.setFontSize(9.5)
  setText(doc, COLORS.AMBER_TEXT)
  doc.text(lines, PAGE.MARGIN_X + padding + 6, y + padding + 4)

  return y + h + 6
}

/**
 * Footer band: thin emerald line, brand line on the left, page meta
 * on the right. Same on every page.
 */
const drawFooter = (doc: jsPDF) => {
  setDraw(doc, COLORS.EMERALD_BORDER)
  doc.setLineWidth(0.4)
  doc.line(PAGE.MARGIN_X, PAGE.FOOTER_Y, PAGE.WIDTH - PAGE.MARGIN_X, PAGE.FOOTER_Y)

  doc.setFont(FONT_FAMILY, "normal")
  doc.setFontSize(8)
  setText(doc, COLORS.TEXT_MUTED)
  doc.text(
    "ardiyesizgiris.com · Otomatik oluşturulmuş rapor",
    PAGE.MARGIN_X,
    PAGE.FOOTER_Y + 5
  )
  doc.text(
    new Date().toLocaleString("tr-TR"),
    PAGE.WIDTH - PAGE.MARGIN_X,
    PAGE.FOOTER_Y + 5,
    { align: "right" }
  )
}

// ─── Main entry ──────────────────────────────────────────────────────
export function generateCalculationPDF(data: CalculationPDFData): string {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  registerFonts(doc)

  const departureDate = toDate(data.departureDate)
  const gateInDate = toDate(data.gateInDate)
  const freeUntilDate = toDate(data.freeUntilDate)
  const isPlanning = data.calculationType === "planning"
  const containerId = data.containerId?.trim() || "Belirtilmedi"
  const currency = data.currency || "TRY"
  const fmt = moneyFormatter(currency)
  const zeroLabel = `${(0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${
    currency === "TRY" ? "₺" : currency === "USD" ? "$" : currency
  }`

  drawHeaderBand(doc)

  let y = drawTitleSection(
    doc,
    isPlanning
      ? "Ardiyesiz Giriş Tarihi Planlama Raporu"
      : "Ardiyesiz Giriş Hesaplama Raporu"
  )

  // Hero — varies by mode. Planning shows the free-entry date. Cost
  // shows total charge when there is one, otherwise the muafiyet message.
  if (isPlanning) {
    y = drawHeroCard(
      doc,
      "Ardiyesiz giriş başlangıcı",
      freeUntilDate?.toLocaleDateString("tr-TR") ?? "-",
      `Konteyneriniz bu tarihten itibaren ücretsiz dolu giriş yapabilir (${data.freeDays} gün muafiyet).`,
      y
    )
  } else if (data.totalCharge === 0) {
    y = drawHeroCard(
      doc,
      "Sonuç",
      `${zeroLabel} — Ücretsiz`,
      "Operasyonun tamamı muafiyet süresi içinde gerçekleşti.",
      y
    )
  } else {
    y = drawHeroCard(
      doc,
      "Toplam masraf",
      fmt(data.totalCharge),
      `${data.chargeableDays ?? 0} ücretli gün üzerinden hesaplandı.`,
      y
    )
  }

  // Information card
  y = drawSectionTitle(doc, "Hesaplama Bilgileri", y)
  const infoRows: Array<[string, string]> = [
    ["Liman", data.portalName],
    ["Hat", data.carrierName],
    ["Konteyner Tipi", data.containerType],
    ["Konteyner ID", containerId],
    ["Gemi Kalkış Tarihi", departureDate?.toLocaleDateString("tr-TR") ?? "-"],
    ["Ardiyesiz Giriş Başlangıcı", freeUntilDate?.toLocaleDateString("tr-TR") ?? "-"],
    ["Muafiyet Süresi", `${data.freeDays} gün`],
  ]
  if (gateInDate) {
    infoRows.push(["Gate-in Tarihi", gateInDate.toLocaleDateString("tr-TR")])
  }
  if (typeof data.totalDaysAtPort === "number") {
    infoRows.push(["Toplam Liman Günü", `${data.totalDaysAtPort} gün`])
  }
  if (typeof data.chargeableDays === "number") {
    infoRows.push(["Ücretli Gün", `${data.chargeableDays} gün`])
  }
  y = drawInfoCard(doc, infoRows, y)

  // Tier breakdown — only for cost mode with actual charges
  if (!isPlanning && data.totalCharge > 0 && data.chargeBreakdown && data.chargeBreakdown.length > 0) {
    y = drawSectionTitle(doc, "Masraf Kırılımı", y)
    y = drawTierTable(doc, data.chargeBreakdown, data.totalCharge, y, currency)
  }

  // Surcharge table — cost mode when surcharges present
  if (!isPlanning && data.surcharges && data.surcharges.length > 0) {
    y = drawSectionTitle(doc, "Hat Ek Ücretleri (Surcharge)", y)
    y = drawSurchargeTable(doc, data.surcharges, y)
  }

  // Warning (cost mode edge cases like gate-in before departure)
  if (data.warning) {
    y = drawWarningCard(doc, data.warning, y)
  }

  // Planning footer note
  if (isPlanning) {
    doc.setFont(FONT_FAMILY, "normal")
    doc.setFontSize(9)
    setText(doc, COLORS.TEXT_SOFT)
    const note = doc.splitTextToSize(
      "Bu rapor planlama amaçlıdır. Toplam masrafı görmek için gate-in tarihiyle birlikte Masraf Hesabı akışını kullanın.",
      PAGE.CONTENT_WIDTH
    )
    doc.text(note, PAGE.MARGIN_X, y + 2)
  }

  drawFooter(doc)

  return doc.output("datauristring")
}

export function downloadPDF(
  pdfDataUri: string,
  filename: string = "ardiyesiz-giris-raporu.pdf"
) {
  const link = document.createElement("a")
  link.href = pdfDataUri
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
