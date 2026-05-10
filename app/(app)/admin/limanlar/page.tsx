"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Port {
  id: string
  name: string
  code: string
  city?: string
  isActive: boolean
}

export default function PortsManagementPage() {
  const [ports, setPorts] = useState<Port[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchPorts = async () => {
    try {
      const response = await fetch("/api/admin/ports")
      const data = await response.json()
      setPorts(data.data || [])
    } catch (error) {
      console.error("Error fetching ports:", error)
      toast({
        title: "Hata",
        description: "Limanlar yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPorts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Bu limanı silmek istediğinize emin misiniz?")) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/admin/ports/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Silme başarısız")

      toast({
        title: "Başarılı",
        description: "Liman başarıyla silindi",
      })

      await fetchPorts()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Liman silinirken hata oluştu",
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Limanlar</h1>
          <p className="text-slate-600 dark:text-slate-400">Liman bilgilerini yönetin</p>
        </div>
        <Button asChild>
          <Link href="/admin/limanlar/yeni">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Liman Ekle
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Limanlar ({ports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : ports.length === 0 ? (
            <p className="text-center py-8 text-slate-600">Henüz liman eklenmemiş</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Adı</TableHead>
                  <TableHead>Kodu</TableHead>
                  <TableHead>Şehir</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ports.map((port) => (
                  <TableRow key={port.id}>
                    <TableCell className="font-medium">{port.name}</TableCell>
                    <TableCell>{port.code}</TableCell>
                    <TableCell>{port.city || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        port.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {port.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/limanlar/${port.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(port.id)}
                          disabled={deleting === port.id}
                        >
                          {deleting === port.id ? (
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
