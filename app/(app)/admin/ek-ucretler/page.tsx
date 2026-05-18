"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SurchargeRecord {
  id: string
  shippingCompanyId: string
  name: string
  description?: string | null
  amount: number
  currency: string
  applyType: string
  containerTypes: string[]
  isActive: boolean
  shippingCompany: {
    id: string
    name: string
    code: string
  }
}

export default function CarrierSurchargesPage() {
  const [surcharges, setSurcharges] = useState<SurchargeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSurcharges = async () => {
    try {
      const response = await fetch("/api/admin/carrier-surcharges")
      const data = await response.json()
      setSurcharges(data.data || [])
    } catch (error) {
      console.error("Error fetching surcharges:", error)
      toast({
        title: "Hata",
        description: "Ek ücretler yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSurcharges()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ek ücreti silmek istediğinize emin misiniz?")) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/admin/carrier-surcharges/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Silme başarısız")
      toast({
        title: "Başarılı",
        description: "Ek ücret başarıyla silindi",
      })
      await fetchSurcharges()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ek ücret silinirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Ek Ücretler (Surcharge)
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Hat bazlı ek ücret tanımlarını yönetin
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/ek-ucretler/yeni">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Ek Ücret Ekle
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Ek Ücretler ({surcharges.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : surcharges.length === 0 ? (
            <p className="text-center py-8 text-slate-600">Henüz ek ücret tanımlanmamış</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hat</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Konteyner Tipleri</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surcharges.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      {s.shippingCompany.name}
                    </TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>
                      {s.containerTypes.length > 0
                        ? s.containerTypes.join(", ")
                        : "Tümü"}
                    </TableCell>
                    <TableCell>
                      {s.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {s.currency}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          s.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {s.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/ek-ucretler/${s.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(s.id)}
                          disabled={deleting === s.id}
                        >
                          {deleting === s.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-600" />
                          )}
                        </Button>
                      </div>
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
