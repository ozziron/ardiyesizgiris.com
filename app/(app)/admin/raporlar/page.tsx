"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, FileSpreadsheet, FileText, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ReportRow {
  id: string
  createdAt: string
  portName: string
  portCode: string
  carrierName: string
  carrierCode: string
  containerType: string
  containerId: string
  departureDate: string
  gateInDate: string | null
  freeUntilDate: string
  freeDays: number
  chargeableDays: number
  totalCharge: number
  pdfExports: number
  emailExports: number
  successfulEmailExports: number
}

interface ReportSummary {
  calculations: number
  totalCharge: number
  chargeableDays: number
  pdfExports: number
  emailExports: number
}

interface ReportPayload {
  summary: ReportSummary
  rows: ReportRow[]
}

const columns = [
  "Tarih",
  "Liman",
  "Hat",
  "Ekipman",
  "Konteyner",
  "Kalkış",
  "Gate-in",
  "Ardiyesiz",
  "Muafiyet",
  "Ücretli Gün",
  "Toplam",
  "PDF",
  "Email",
]

function formatDate(value: string | null) {
  if (!value) return "-"
  return new Date(value).toLocaleDateString("tr-TR")
}

function formatMoney(value: number) {
  return value.toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  })
}

function downloadBlob(filename: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function csvCell(value: string | number) {
  const text = String(value).replace(/"/g, '""')
  return `"${text}"`
}

function rowValues(row: ReportRow) {
  return [
    formatDate(row.createdAt),
    `${row.portName} (${row.portCode})`,
    `${row.carrierName} (${row.carrierCode})`,
    row.containerType,
    row.containerId,
    formatDate(row.departureDate),
    formatDate(row.gateInDate),
    formatDate(row.freeUntilDate),
    `${row.freeDays} gün`,
    row.chargeableDays,
    row.totalCharge.toFixed(2),
    row.pdfExports,
    row.emailExports,
  ]
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const rows = data?.rows ?? []
  const summary = data?.summary

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    const value = params.toString()
    return value ? `?${value}` : ""
  }, [from, to])

  const fetchReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/reports${query}`)
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || "Rapor verileri alınamadı")
      }
      setData(payload.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rapor verileri alınamadı")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exportCsv = () => {
    const csv = [
      columns.map(csvCell).join(";"),
      ...rows.map((row) => rowValues(row).map(csvCell).join(";")),
    ].join("\r\n")
    downloadBlob("admin-raporlar.csv", `\uFEFF${csv}`, "text/csv;charset=utf-8")
  }

  const exportExcel = () => {
    const header = columns.map((column) => `<th>${column}</th>`).join("")
    const body = rows
      .map((row) => `<tr>${rowValues(row).map((value) => `<td>${value}</td>`).join("")}</tr>`)
      .join("")
    const html = `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`
    downloadBlob("admin-raporlar.xls", `\uFEFF${html}`, "application/vnd.ms-excel;charset=utf-8")
  }

  const exportPdf = async () => {
    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF({ unit: "mm", format: "a4" })
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFontSize(16)
    doc.text("Ardiyesiz Giriş - Admin Raporu", 14, 18)
    doc.setFontSize(10)
    doc.text(`Kayıt: ${rows.length}`, 14, 26)
    doc.text(`Toplam: ${formatMoney(summary?.totalCharge ?? 0)}`, 14, 32)

    let y = 44
    doc.setFontSize(8)
    rows.slice(0, 35).forEach((row) => {
      if (y > 280) {
        doc.addPage()
        y = 18
      }
      const line = [
        formatDate(row.createdAt),
        row.portName,
        row.carrierName,
        row.containerType,
        formatMoney(row.totalCharge),
      ].join(" | ")
      doc.text(line.slice(0, 120), 14, y, { maxWidth: pageWidth - 28 })
      y += 6
    })

    if (rows.length > 35) {
      doc.text(`İlk 35 kayıt gösterildi. Tam liste için CSV/Excel export kullanın.`, 14, y + 4)
    }

    doc.save("admin-raporlar.pdf")
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Raporlar</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Hesaplama ve export geçmişini filtreleyin, CSV/Excel/PDF olarak dışa aktarın.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Başlangıç</label>
            <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Bitiş</label>
            <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </div>
          <Button onClick={fetchReports} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Yenile
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Hesaplama" value={summary?.calculations ?? 0} />
        <Metric label="Toplam Tutar" value={formatMoney(summary?.totalCharge ?? 0)} />
        <Metric label="Ücretli Gün" value={summary?.chargeableDays ?? 0} />
        <Metric label="PDF Export" value={summary?.pdfExports ?? 0} />
        <Metric label="Email Export" value={summary?.emailExports ?? 0} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <CardTitle>Hesaplama Kayıtları ({rows.length})</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0} className="gap-2">
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={exportExcel} disabled={rows.length === 0} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={exportPdf} disabled={rows.length === 0} className="gap-2">
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : error ? (
            <p className="py-8 text-center text-red-600">{error}</p>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-slate-600">Bu filtrelerle rapor kaydı bulunamadı.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Liman</TableHead>
                  <TableHead>Hat</TableHead>
                  <TableHead>Ekipman</TableHead>
                  <TableHead>Ardiyesiz</TableHead>
                  <TableHead className="text-right">Toplam</TableHead>
                  <TableHead className="text-right">Export</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatDate(row.createdAt)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{row.portName}</div>
                      <div className="text-xs text-slate-500">{row.portCode}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{row.carrierName}</div>
                      <div className="text-xs text-slate-500">{row.carrierCode}</div>
                    </TableCell>
                    <TableCell>
                      <div>{row.containerType}</div>
                      <div className="text-xs text-slate-500">{row.containerId}</div>
                    </TableCell>
                    <TableCell>
                      <div>{formatDate(row.freeUntilDate)}</div>
                      <div className="text-xs text-slate-500">{row.freeDays} gün muafiyet</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatMoney(row.totalCharge)}</TableCell>
                    <TableCell className="text-right text-sm text-slate-600">
                      PDF {row.pdfExports} / Email {row.emailExports}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      </CardContent>
    </Card>
  )
}
