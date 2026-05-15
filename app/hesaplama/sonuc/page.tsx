"use client"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Loader2, SearchX, ArrowLeft } from "lucide-react"
import { formatDate } from "@/lib/utils-date"
import { CalculationResultSkeleton } from "@/components/calculation/result-skeleton"

function ResultContent() {
  const searchParams = useSearchParams()
  const freeUntilStr = searchParams.get("freeUntil")
  const freeDays = searchParams.get("freeDays")
  const warning = searchParams.get("warning")

  if (!freeUntilStr || !freeDays) {
    return (
      <div className="container max-w-2xl py-12">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
              <SearchX className="h-12 w-12 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Hesaplama Sonucu Bulunamadı
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Aradığınız hesaplama kriterlerine uygun bir sonuç kaydı bulunamadı veya link geçersiz olabilir.
            </p>
            <Button asChild variant="outline" className="mt-8">
              <Link href="/hesaplama" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Hesaplama Sayfasına Dön
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const freeUntil = new Date(freeUntilStr)

  return (
    <div className="container max-w-2xl py-8">
      {warning && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-yellow-700 mt-0.5" />
            <p className="text-yellow-700">{warning}</p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-4">
            Ardiyesiz Giriş Planlaması
          </h2>
          <p className="text-lg text-green-800 mb-6">
            Konteynerinizi <span className="font-bold">{formatDate(freeUntil)}</span> tarihinden itibaren
            limana <span className="font-bold">ÜCRETSİZ</span> olarak dolu giriş yapabilirsiniz!
          </p>
          <div className="bg-white rounded-lg p-4 text-left">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Muafiyet Dönemi:</span> {formatDate(freeUntil)} ile 
              devam eden {freeDays} gün
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Bu tarihten ÖNCE giriş yaparsanız ardiye ücreti ödemeniz gerekecektir.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button asChild variant="default">
          <Link href="/hesaplama">Yeni Hesapla</Link>
        </Button>
        <Button variant="outline">
          PDF İndir
        </Button>
        <Button variant="outline">
          Email Gönder
        </Button>
      </div>
    </div>
  )
}

export default function CalculationResultPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-2xl py-8">
        <CalculationResultSkeleton />
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
