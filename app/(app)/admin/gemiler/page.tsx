"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Carrier {
  id: string
  name: string
  code: string
  isActive: boolean
}

export default function CarriersManagementPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCarriers = async () => {
    try {
      const response = await fetch("/api/admin/carriers")
      const data = await response.json()
      setCarriers(data.data || [])
    } catch (error) {
      console.error("Error fetching carriers:", error)
      toast({
        title: "Hata",
        description: "Hatlar yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCarriers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Bu hatı silmek istediğinize emin misiniz?")) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/admin/carriers/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Silme başarısız")

      toast({
        title: "Başarılı",
        description: "Hat başarıyla silindi",
      })

      await fetchCarriers()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hat silinirken hata oluştu",
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gemiler / Hatlar</h1>
          <p className="text-slate-600 dark:text-slate-400">Gemi şirketlerini ve hatları yönetin</p>
        </div>
        <Button asChild>
          <Link href="/admin/gemiler/yeni">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Hat Ekle
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Hatlar ({carriers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : carriers.length === 0 ? (
            <p className="text-center py-8 text-slate-600">Henüz hat eklenmemiş</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Adı</TableHead>
                  <TableHead>Kodu</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carriers.map((carrier) => (
                  <TableRow key={carrier.id}>
                    <TableCell className="font-medium">{carrier.name}</TableCell>
                    <TableCell>{carrier.code}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        carrier.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {carrier.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/gemiler/${carrier.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(carrier.id)}
                          disabled={deleting === carrier.id}
                        >
                          {deleting === carrier.id ? (
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
