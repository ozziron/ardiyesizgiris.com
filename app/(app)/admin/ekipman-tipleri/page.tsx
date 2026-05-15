"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ContainerType {
  id: string
  code: string
  label: string
  displayOrder: number
  isActive: boolean
  notes?: string | null
}

export default function ContainerTypesPage() {
  const [types, setTypes] = useState<ContainerType[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchTypes = async () => {
    try {
      const res = await fetch("/api/admin/container-types")
      const data = await res.json()
      setTypes(data.data || [])
    } catch {
      toast({
        title: "Hata",
        description: "Ekipman tipleri yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTypes()
  }, [])

  // Soft-delete by default. Existing TariffRule rows that reference this
  // code keep working; the type just stops appearing in new-rule selects.
  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`"${code}" tipini pasife alalım mı? Mevcut kurallar bozulmaz, sadece yeni kayıtlarda seçilemez.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/container-types/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Silme başarısız")
      toast({ title: "Başarılı", description: "Ekipman tipi pasife alındı" })
      await fetchTypes()
    } catch {
      toast({
        title: "Hata",
        description: "Ekipman tipi silinirken hata oluştu",
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Ekipman Tipleri</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Hesaplama formu ve kural tanımlarında kullanılan konteyner tiplerini yönetin
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/ekipman-tipleri/yeni">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Tip Ekle
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Ekipman Tipleri ({types.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : types.length === 0 ? (
            <p className="text-center py-8 text-slate-600">Henüz ekipman tipi eklenmemiş</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sıra</TableHead>
                  <TableHead>Kod</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Notlar</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="tabular-nums">{t.displayOrder}</TableCell>
                    <TableCell className="font-mono font-medium">{t.code}</TableCell>
                    <TableCell>{t.label}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {t.notes || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          t.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {t.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/ekipman-tipleri/${t.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        {t.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(t.id, t.code)}
                            disabled={deleting === t.id}
                          >
                            {deleting === t.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600" />
                            )}
                          </Button>
                        )}
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
