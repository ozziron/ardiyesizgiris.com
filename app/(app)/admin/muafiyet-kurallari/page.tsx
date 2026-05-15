"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface FreeTimeRuleListItem {
  id: string
  port: { id: string; name: string }
  shippingCompany: { id: string; name: string }
  containerType: string
  freeDays: number
  effectiveFrom: string
  effectiveUntil: string | null
  isActive: boolean
}

export default function FreeTimeRulesPage() {
  const [rules, setRules] = useState<FreeTimeRuleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchRules = async () => {
    try {
      const response = await fetch("/api/admin/free-time-rules")
      const data = await response.json()
      setRules(data.data || [])
    } catch (error) {
      toast({
        title: "Hata",
        description: "Muafiyet kuralları yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kuralı silmek istediğinize emin misiniz?")) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/admin/free-time-rules/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Silme başarısız")

      toast({
        title: "Başarılı",
        description: "Muafiyet kuralı silindi",
      })
      await fetchRules()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kural silinirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Muafiyet Kuralları</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Sıralama mantığı: Hat, liman ve ekipman tipine göre exact muafiyet kuralı.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/muafiyet-kurallari/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kural
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Muafiyet Kayıtları ({rules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : rules.length === 0 ? (
            <p className="py-8 text-center text-slate-600">Henüz muafiyet kuralı eklenmemiş</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hat</TableHead>
                  <TableHead>Liman</TableHead>
                  <TableHead>Ekipman</TableHead>
                  <TableHead>Muafiyet</TableHead>
                  <TableHead>Başlangıç</TableHead>
                  <TableHead>Bitiş</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.shippingCompany.name}</TableCell>
                    <TableCell>{rule.port.name}</TableCell>
                    <TableCell>{rule.containerType}</TableCell>
                    <TableCell>{rule.freeDays} gün</TableCell>
                    <TableCell>{new Date(rule.effectiveFrom).toLocaleDateString("tr-TR")}</TableCell>
                    <TableCell>
                      {rule.effectiveUntil ? new Date(rule.effectiveUntil).toLocaleDateString("tr-TR") : "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          rule.isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {rule.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/muafiyet-kurallari/${rule.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(rule.id)}
                          disabled={deleting === rule.id}
                        >
                          {deleting === rule.id ? (
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
