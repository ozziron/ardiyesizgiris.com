"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useContainerTypes } from "@/hooks/use-container-types"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface SelectOption {
  id: string
  name: string
}

interface PortOption {
  id: string
  name: string
  code: string
  city: string | null
}

const bulkFormSchema = z
  .object({
    carrierId: z.string().min(1, "Hat zorunludur"),
    cityFilter: z.string().optional(),
    portIds: z.array(z.string()).min(1, "En az bir liman seçilmelidir"),
    containerTypeCodes: z.array(z.string()).min(1, "En az bir ekipman tipi seçilmelidir"),
    imoCargo: z.boolean().default(false),
    tier1DaysFrom: z.coerce.number().int().min(1),
    tier1DaysTo: z.coerce.number().int().min(1),
    tier1PricePerDay: z.coerce.number().nonnegative("Fiyat negatif olamaz"),
    tier2DaysFrom: z.coerce.number().int().min(1),
    tier2DaysTo: z.coerce.number().int().min(1),
    tier2PricePerDay: z.coerce.number().positive("Tier 2 ücreti 0'dan büyük olmalıdır"),
    tier2Enabled: z.boolean().default(true),
    tier3DaysFrom: z.coerce.number().int().min(1),
    tier3PricePerDay: z.coerce.number().positive("Tier 3 ücreti 0'dan büyük olmalıdır"),
    tier3Enabled: z.boolean().default(true),
    currency: z.string().min(1),
    effectiveFrom: z.string().min(1, "Başlangıç tarihi zorunludur"),
    effectiveUntil: z.string().optional(),
    isActive: z.boolean(),
    notes: z.string().optional(),
  })
  .refine((data) => data.tier1DaysTo >= data.tier1DaysFrom, {
    message: "Tier 1 gün aralığı geçersiz",
    path: ["tier1DaysTo"],
  })
  .refine((data) => {
    if (!data.tier2Enabled) return true
    return data.tier2DaysFrom > data.tier1DaysTo
  }, {
    message: "Tier 2, Tier 1 bittikten sonra başlamalı",
    path: ["tier2DaysFrom"],
  })
  .refine((data) => {
    if (!data.tier2Enabled) return true
    return data.tier2DaysTo >= data.tier2DaysFrom
  }, {
    message: "Tier 2 gün aralığı geçersiz",
    path: ["tier2DaysTo"],
  })
  .refine((data) => {
    if (!data.tier3Enabled) return true
    if (!data.tier2Enabled) return false
    return data.tier3DaysFrom > data.tier2DaysTo
  }, {
    message: "Tier 3, Tier 2 bittikten sonra başlamalı",
    path: ["tier3DaysFrom"],
  })
  .refine((data) => {
    if (data.tier3Enabled && !data.tier2Enabled) return false
    return true
  }, {
    message: "Tier 3'ü açmak için Tier 2 de aktif olmalıdır",
    path: ["tier3Enabled"],
  })

type BulkFormValues = z.infer<typeof bulkFormSchema>

interface SkippedItem {
  port: string
  equipment: string
  reason: string
}

export default function BulkTariffPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { options: containerTypes, loading: containerTypesLoading } = useContainerTypes()

  const [carriers, setCarriers] = useState<SelectOption[]>([])
  const [allPorts, setAllPorts] = useState<PortOption[]>([])
  const [loading, setLoading] = useState(true)

  const form = useForm<BulkFormValues>({
    resolver: zodResolver(bulkFormSchema),
    defaultValues: {
      carrierId: "",
      cityFilter: "",
      portIds: [],
      containerTypeCodes: [],
      imoCargo: false,
      tier1DaysFrom: 1,
      tier1DaysTo: 5,
      tier1PricePerDay: 0,
      tier2DaysFrom: 6,
      tier2DaysTo: 10,
      tier2PricePerDay: 100,
      tier2Enabled: true,
      tier3DaysFrom: 11,
      tier3PricePerDay: 200,
      tier3Enabled: true,
      currency: "TRY",
      effectiveFrom: new Date().toISOString().split("T")[0],
      effectiveUntil: "",
      isActive: true,
      notes: "",
    },
  })

  const cityFilter = form.watch("cityFilter") ?? ""
  const selectedPortIds = form.watch("portIds")
  const selectedContainerTypeCodes = form.watch("containerTypeCodes")
  const tier2Enabled = form.watch("tier2Enabled")
  const tier3Enabled = form.watch("tier3Enabled")

  // Distinct cities from ports
  const cities = Array.from(
    new Set(allPorts.map((p) => p.city).filter(Boolean) as string[])
  ).sort()

  // Ports filtered by selected city
  const filteredPorts = cityFilter
    ? allPorts.filter((p) => p.city === cityFilter)
    : allPorts

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carriersRes, portsRes] = await Promise.all([
          fetch("/api/carriers"),
          fetch("/api/ports"),
        ])
        const [carriersData, portsData] = await Promise.all([
          carriersRes.json(),
          portsRes.json(),
        ])
        setCarriers(carriersData.data || [])
        setAllPorts(portsData.data || [])
      } catch {
        toast({
          title: "Hata",
          description: "Veriler yüklenemedi",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  // İl değiştiğinde seçili limanları sıfırla
  useEffect(() => {
    form.setValue("portIds", [])
  }, [cityFilter, form])

  const togglePortId = (portId: string, checked: boolean) => {
    const current = form.getValues("portIds")
    if (checked) {
      form.setValue("portIds", [...current, portId], { shouldValidate: true })
    } else {
      form.setValue(
        "portIds",
        current.filter((id) => id !== portId),
        { shouldValidate: true }
      )
    }
  }

  const toggleContainerType = (code: string, checked: boolean) => {
    const current = form.getValues("containerTypeCodes")
    if (checked) {
      form.setValue("containerTypeCodes", [...current, code], { shouldValidate: true })
    } else {
      form.setValue(
        "containerTypeCodes",
        current.filter((c) => c !== code),
        { shouldValidate: true }
      )
    }
  }

  const onSubmit = async (values: BulkFormValues) => {
    try {
      const payload = {
        carrierId: values.carrierId,
        portIds: values.portIds,
        containerTypeCodes: values.containerTypeCodes,
        imoCargo: values.imoCargo,
        tier1DaysFrom: values.tier1DaysFrom,
        tier1DaysTo: values.tier1DaysTo,
        tier1PricePerDay: values.tier1PricePerDay,
        tier2DaysFrom: values.tier2DaysFrom,
        tier2DaysTo: values.tier2DaysTo,
        tier2PricePerDay: values.tier2PricePerDay,
        tier2Enabled: values.tier2Enabled,
        tier3DaysFrom: values.tier3DaysFrom,
        tier3PricePerDay: values.tier3PricePerDay,
        tier3Enabled: values.tier3Enabled,
        currency: values.currency,
        effectiveFrom: values.effectiveFrom,
        effectiveUntil: values.effectiveUntil || null,
        isActive: values.isActive,
        notes: values.notes || null,
      }

      const response = await fetch("/api/admin/tariff-rules/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "İşlem başarısız")
      }

      const skipped: SkippedItem[] = data.skipped || []
      const created: number = data.created ?? 0

      if (created === 0 && skipped.length > 0) {
        toast({
          title: "Tüm kombinasyonlar zaten mevcut",
          description: `${skipped.length} kombinasyon atlandı.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Başarılı",
          description:
            skipped.length > 0
              ? `${created} tarife oluşturuldu, ${skipped.length} kombinasyon atlandı (zaten mevcut).`
              : `${created} tarife başarıyla oluşturuldu.`,
        })
        router.push("/admin/ucret-tarifeleri")
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "İşlem sırasında hata oluştu",
        variant: "destructive",
      })
    }
  }

  const combinationCount = selectedPortIds.length * selectedContainerTypeCodes.length

  if (loading || containerTypesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/ucret-tarifeleri")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Toplu Tarife Girişi
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Birden fazla liman ve ekipman tipi için tek seferde tarife oluşturun.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Adım 1: Hat ve İl seçimi */}
          <Card>
            <CardHeader>
              <CardTitle>1. Hat ve Bölge Seçimi</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="carrierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hat *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Bir hat seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {carriers.map((carrier) => (
                          <SelectItem key={carrier.id} value={carrier.id}>
                            {carrier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cityFilter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İl Filtresi</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val === "__all__" ? "" : val)}
                      value={field.value || "__all__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tüm iller" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__all__">Tüm iller</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Adım 2: Liman seçimi */}
          <Card>
            <CardHeader>
              <CardTitle>
                2. Liman Seçimi{" "}
                {selectedPortIds.length > 0 && (
                  <span className="text-sm font-normal text-emerald-600">
                    ({selectedPortIds.length} seçili)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPorts.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {cityFilter ? "Bu ile ait liman bulunamadı." : "Hiç liman bulunamadı."}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {filteredPorts.map((port) => {
                    const checked = selectedPortIds.includes(port.id)
                    return (
                      <label
                        key={port.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
                          checked
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(val) => togglePortId(port.id, !!val)}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{port.name}</p>
                          {port.city && (
                            <p className="text-xs text-slate-500">{port.city}</p>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
              {form.formState.errors.portIds && (
                <p className="mt-2 text-sm text-red-600">
                  {form.formState.errors.portIds.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Adım 3: Ekipman tipi seçimi */}
          <Card>
            <CardHeader>
              <CardTitle>
                3. Ekipman Tipi Seçimi{" "}
                {selectedContainerTypeCodes.length > 0 && (
                  <span className="text-sm font-normal text-emerald-600">
                    ({selectedContainerTypeCodes.length} seçili)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {containerTypes.length === 0 ? (
                <p className="text-sm text-slate-500">Ekipman tipi bulunamadı.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {containerTypes.map((ct) => {
                    const checked = selectedContainerTypeCodes.includes(ct.code)
                    return (
                      <label
                        key={ct.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
                          checked
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(val) => toggleContainerType(ct.code, !!val)}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{ct.label}</p>
                          <p className="text-xs text-slate-500">{ct.code}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
              {form.formState.errors.containerTypeCodes && (
                <p className="mt-2 text-sm text-red-600">
                  {form.formState.errors.containerTypeCodes.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Adım 4: Tarife bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>4. Tarife Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="imoCargo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border p-4">
                    <div>
                      <FormLabel>IMO Cargo (Tehlikeli Yük)</FormLabel>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Bu tarifeler sadece IMO Cargo seçili hesaplamalarda eşleşir.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 font-semibold"
                >
                  i
                </span>
                <p className="leading-relaxed">
                  <strong className="font-semibold">İpucu:</strong> Tier 1&apos;e{" "}
                  <strong>günlük ücret 0</strong> girilirse o gün aralığı{" "}
                  <strong>muafiyet penceresi</strong> olarak değerlendirilir.
                </p>
              </div>

              <div className="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-3 dark:border-slate-800">
                {/* Tier 1 */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Tier 1</p>
                  <FormField
                    control={form.control}
                    name="tier1DaysFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gün Başlangıcı</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tier1DaysTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gün Bitişi</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tier1PricePerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Günlük Ücret</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tier 2 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Tier 2</p>
                    <FormField
                      control={form.control}
                      name="tier2Enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormLabel className="text-xs text-slate-500">Aktif</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked)
                                if (!checked) form.setValue("tier3Enabled", false)
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  {tier2Enabled && (
                    <>
                      <FormField
                        control={form.control}
                        name="tier2DaysFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gün Başlangıcı</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tier2DaysTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gün Bitişi</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tier2PricePerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Günlük Ücret</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                {/* Tier 3 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Tier 3</p>
                    <FormField
                      control={form.control}
                      name="tier3Enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormLabel className="text-xs text-slate-500">Aktif</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              disabled={!tier2Enabled}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  {tier3Enabled && (
                    <>
                      <FormField
                        control={form.control}
                        name="tier3DaysFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gün Başlangıcı</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tier3PricePerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Günlük Ücret</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Para Birimi</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  {!tier3Enabled && (
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Para Birimi</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="effectiveFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Başlangıç Tarihi *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="effectiveUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bitiş Tarihi</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Tarife kayıtlarına ait açıklama veya istisna notu"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border p-4">
                    <div>
                      <FormLabel>Aktif</FormLabel>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Pasif tarifeler yeni hesaplamalarda kullanılmaz.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Özet ve kaydet */}
          {combinationCount > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Toplam{" "}
                <strong>
                  {selectedPortIds.length} liman × {selectedContainerTypeCodes.length} ekipman ={" "}
                  {combinationCount} tarife kaydı
                </strong>{" "}
                oluşturulacak.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {combinationCount > 0
                ? `${combinationCount} Tarife Oluştur`
                : "Toplu Kaydet"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/ucret-tarifeleri")}
            >
              İptal
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
