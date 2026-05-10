"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TariffRuleListItem {
  id: string
  port: { id: string; name: string }
  shippingCompany: { id: string; name: string }
  containerType: string
  tier1DaysFrom: number
  tier1DaysTo: number
  tier1PricePerDay: number | string
  tier2DaysFrom: number
  tier2DaysTo: number
  tier2PricePerDay: number | string
  tier3DaysFrom: number
  tier3PricePerDay: number | string
  currency: string
  isActive: boolean
}

export default function TariffRulesPage() {
  const [rules, setRules] = useState<TariffRuleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchRules = async () => {
    try {
      const response = await fetch("/api/admin/tariff-rules")
      const data = await response.json()
      setRules(
        (data.data || []).map((rule: TariffRuleListItem) => ({
          ...rule,
          tier1PricePerDay: Number(rule.tier1PricePerDay),
          tier2PricePerDay: Number(rule.tier2PricePerDay),
          tier3PricePerDay: Number(rule.tier3PricePerDay),
        }))
      )
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ucret tarifeleri yuklenemedi",
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
    if (!confirm("Bu tarifeyi silmek istediginize emin misiniz?")) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/admin/tariff-rules/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Silme basarisiz")

      toast({
        title: "Basarili",
        description: "Ucret tarifesi silindi",
      })
      await fetchRules()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Tarife silinirken hata oluştu",
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
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Ucret Tarifeleri</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Hat, liman ve ekipman bazli kademeli ardiye tarifeleri.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/ucret-tarifeleri/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Tarife
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tum Tarife Kayitlari ({rules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : rules.length === 0 ? (
            <p className="py-8 text-center text-slate-600">Henuz ucret tarifesi eklenmemis</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hat</TableHead>
                    <TableHead>Liman</TableHead>
                    <TableHead>Ekipman</TableHead>
                    <TableHead>Tier 1</TableHead>
                    <TableHead>Tier 2</TableHead>
                    <TableHead>Tier 3</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Islemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.shippingCompany.name}</TableCell>
                      <TableCell>{rule.port.name}</TableCell>
                      <TableCell>{rule.containerType}</TableCell>
                      <TableCell>
                        {rule.tier1DaysFrom}-{rule.tier1DaysTo} gun @ {rule.tier1PricePerDay} {rule.currency}
                      </TableCell>
                      <TableCell>
                        {rule.tier2DaysFrom}-{rule.tier2DaysTo} gun @ {rule.tier2PricePerDay} {rule.currency}
                      </TableCell>
                      <TableCell>
                        {rule.tier3DaysFrom}+ gun @ {rule.tier3PricePerDay} {rule.currency}
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
                            <Link href={`/admin/ucret-tarifeleri/${rule.id}`}>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
