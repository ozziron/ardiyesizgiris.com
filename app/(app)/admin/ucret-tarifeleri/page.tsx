"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TariffRuleListItem {
  id: string
  port: { id: string; name: string; city: string | null }
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

interface SelectOption {
  id: string
  name: string
}

interface PortOption {
  id: string
  name: string
  city: string | null
}

export default function TariffRulesPage() {
  const [rules, setRules] = useState<TariffRuleListItem[]>([])
  const [carriers, setCarriers] = useState<SelectOption[]>([])
  const [ports, setPorts] = useState<PortOption[]>([])
  const [selectedCarrierId, setSelectedCarrierId] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedPortId, setSelectedPortId] = useState("")
  const [expandedRuleIds, setExpandedRuleIds] = useState<string[]>([])
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [rulesLoading, setRulesLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const cities = useMemo(
    () => Array.from(new Set(ports.map((port) => port.city).filter(Boolean) as string[])).sort(),
    [ports]
  )

  const filteredPorts = useMemo(
    () => (selectedCity ? ports.filter((port) => port.city === selectedCity) : []),
    [ports, selectedCity]
  )

  const groupedRules = useMemo(() => {
    const groups = new Map<string, { port: TariffRuleListItem["port"]; rules: TariffRuleListItem[] }>()

    for (const rule of rules) {
      const existing = groups.get(rule.port.id)
      if (existing) {
        existing.rules.push(rule)
      } else {
        groups.set(rule.port.id, { port: rule.port, rules: [rule] })
      }
    }

    return Array.from(groups.values())
  }, [rules])

  const fetchRules = async (carrierId: string, city: string, portId: string) => {
    if (!carrierId || !city || !portId) {
      setRules([])
      setExpandedRuleIds([])
      return
    }

    setRulesLoading(true)
    try {
      const params = new URLSearchParams({ shippingCompanyId: carrierId, city, portId })
      const response = await fetch(`/api/admin/tariff-rules?${params.toString()}`)
      if (!response.ok) throw new Error("Tarife listesi yüklenemedi")
      const data = await response.json()
      setRules(
        (data.data || []).map((rule: TariffRuleListItem) => ({
          ...rule,
          tier1PricePerDay: Number(rule.tier1PricePerDay),
          tier2PricePerDay: Number(rule.tier2PricePerDay),
          tier3PricePerDay: Number(rule.tier3PricePerDay),
        }))
      )
      setExpandedRuleIds([])
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ücret tarifeleri yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setRulesLoading(false)
    }
  }

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [carriersResponse, portsResponse] = await Promise.all([
          fetch("/api/carriers"),
          fetch("/api/ports"),
        ])
        if (!carriersResponse.ok || !portsResponse.ok) {
          throw new Error("Filtre seçenekleri yüklenemedi")
        }
        const [carriersData, portsData] = await Promise.all([
          carriersResponse.json(),
          portsResponse.json(),
        ])
        setCarriers(carriersData.data || [])
        setPorts(portsData.data || [])
      } catch (error) {
        toast({
          title: "Hata",
          description: "Filtre seçenekleri yüklenemedi",
          variant: "destructive",
        })
      } finally {
        setOptionsLoading(false)
      }
    }

    fetchOptions()
  }, [toast])

  useEffect(() => {
    fetchRules(selectedCarrierId, selectedCity, selectedPortId)
  }, [selectedCarrierId, selectedCity, selectedPortId])

  const handleCarrierChange = (value: string) => {
    setSelectedCarrierId(value)
    setSelectedCity("")
    setSelectedPortId("")
    setRules([])
    setExpandedRuleIds([])
  }

  const handleCityChange = (value: string) => {
    setSelectedCity(value)
    setSelectedPortId("")
    setRules([])
    setExpandedRuleIds([])
  }

  const handlePortChange = (value: string) => {
    setSelectedPortId(value)
    setRules([])
    setExpandedRuleIds([])
  }

  const toggleRuleDetails = (id: string) => {
    setExpandedRuleIds((current) =>
      current.includes(id) ? current.filter((ruleId) => ruleId !== id) : [...current, id]
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu tarifeyi silmek istediğinize emin misiniz?")) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/admin/tariff-rules/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Silme başarısız")

      toast({
        title: "Başarılı",
        description: "Ücret tarifesi silindi",
      })
      await fetchRules(selectedCarrierId, selectedCity, selectedPortId)
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
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Ücret Tarifeleri</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Hat, liman ve ekipman bazlı kademeli ardiye tarifeleri.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/ucret-tarifeleri/toplu">
              <Plus className="mr-2 h-4 w-4" />
              Toplu Ekle
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/ucret-tarifeleri/yeni">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Tarife
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tarife Kayıtlarını Görüntüle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Hat
              </label>
              <Select
                value={selectedCarrierId}
                onValueChange={handleCarrierChange}
                disabled={optionsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hat seçin" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.map((carrier) => (
                    <SelectItem key={carrier.id} value={carrier.id}>
                      {carrier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                İl
              </label>
              <Select
                value={selectedCity}
                onValueChange={handleCityChange}
                disabled={!selectedCarrierId || optionsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCarrierId ? "İl seçin" : "Önce hat seçin"} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Liman
              </label>
              <Select
                value={selectedPortId}
                onValueChange={handlePortChange}
                disabled={!selectedCity || optionsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCity ? "Liman seçin" : "Önce il seçin"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredPorts.map((port) => (
                    <SelectItem key={port.id} value={port.id}>
                      {port.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {optionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : !selectedCarrierId ? (
            <p className="py-8 text-center text-slate-600">
              Tarifeleri görüntülemek için önce bir hat seçin.
            </p>
          ) : !selectedCity ? (
            <p className="py-8 text-center text-slate-600">
              Seçilen hatta ait tarifeleri görmek için il seçin.
            </p>
          ) : !selectedPortId ? (
            <p className="py-8 text-center text-slate-600">
              Seçilen ildeki tarifeleri görmek için liman seçin.
            </p>
          ) : rulesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : rules.length === 0 ? (
            <p className="py-8 text-center text-slate-600">
              Bu hat, il ve liman için aktif tarife kaydı bulunamadı.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {rules.length} aktif tarife kaydı listeleniyor.
              </div>

              {groupedRules.map((group) => (
                <section key={group.port.id} className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {group.port.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {group.rules.length} tarife kaydı
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ekipman</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>Detay</TableHead>
                          <TableHead>İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.rules.map((rule) => {
                          const isExpanded = expandedRuleIds.includes(rule.id)

                          return (
                            <Fragment key={rule.id}>
                              <TableRow>
                                <TableCell className="font-medium">{rule.containerType}</TableCell>
                                <TableCell>
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                      rule.isActive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    {rule.isActive ? "Aktif" : "Pasif"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleRuleDetails(rule.id)}
                                    aria-expanded={isExpanded}
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                    Detay
                                  </Button>
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
                              {isExpanded && (
                                <TableRow>
                                  <TableCell colSpan={4} className="bg-slate-50 dark:bg-slate-950/40">
                                    <div className="grid gap-3 text-sm md:grid-cols-3">
                                      <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Tier 1</p>
                                        <p className="text-slate-600 dark:text-slate-400">
                                          {rule.tier1DaysFrom}-{rule.tier1DaysTo} gün @{" "}
                                          {rule.tier1PricePerDay} {rule.currency}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Tier 2</p>
                                        <p className="text-slate-600 dark:text-slate-400">
                                          {rule.tier2DaysFrom}-{rule.tier2DaysTo} gün @{" "}
                                          {rule.tier2PricePerDay} {rule.currency}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Tier 3</p>
                                        <p className="text-slate-600 dark:text-slate-400">
                                          {rule.tier3DaysFrom}+ gün @ {rule.tier3PricePerDay}{" "}
                                          {rule.currency}
                                        </p>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Fragment>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </section>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
