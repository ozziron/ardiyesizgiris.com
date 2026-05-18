"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { tariffRuleSchema } from "@/lib/validation/schemas"
import { useContainerTypes } from "@/hooks/use-container-types"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type TariffRuleFormValues = z.infer<typeof tariffRuleSchema>

interface TariffRuleFormSeed {
  portId?: string
  shippingCompanyId?: string
  containerType?: string
  imoCargo?: boolean
  tier1DaysFrom?: number
  tier1DaysTo?: number
  tier1PricePerDay?: number | string
  tier2DaysFrom?: number
  tier2DaysTo?: number
  tier2PricePerDay?: number | string
  tier2Enabled?: boolean
  tier3DaysFrom?: number
  tier3PricePerDay?: number | string
  tier3Enabled?: boolean
  currency?: string
  effectiveFrom?: string
  effectiveUntil?: string | null
  isActive?: boolean
  notes?: string | null
}

interface SelectOption {
  id: string
  name: string
}

interface TariffRuleFormProps {
  mode: "create" | "edit"
  initialData?: TariffRuleFormSeed
  submitUrl: string
  submitMethod: "POST" | "PUT"
}

export function TariffRuleForm({
  mode,
  initialData,
  submitUrl,
  submitMethod,
}: TariffRuleFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [ports, setPorts] = useState<SelectOption[]>([])
  const [carriers, setCarriers] = useState<SelectOption[]>([])
  const [loading, setLoading] = useState(true)
  // Container types from DB (admin-managed) — hook returns active types only
  const { options: containerTypes } = useContainerTypes()

  const form = useForm<TariffRuleFormValues>({
    resolver: zodResolver(tariffRuleSchema),
    defaultValues: {
      portId: initialData?.portId ?? "",
      shippingCompanyId: initialData?.shippingCompanyId ?? "",
      containerType: initialData?.containerType ?? "20DC",
      imoCargo: (initialData as any)?.imoCargo ?? false,
      tier1DaysFrom: initialData?.tier1DaysFrom ?? 1,
      tier1DaysTo: initialData?.tier1DaysTo ?? 5,
      tier1PricePerDay: Number(initialData?.tier1PricePerDay ?? 0),
      tier2DaysFrom: initialData?.tier2DaysFrom ?? 6,
      tier2DaysTo: initialData?.tier2DaysTo ?? 10,
      tier2PricePerDay: Number(initialData?.tier2PricePerDay ?? 0),
      tier2Enabled: (initialData as any)?.tier2Enabled ?? true,
      tier3DaysFrom: initialData?.tier3DaysFrom ?? 11,
      tier3PricePerDay: Number(initialData?.tier3PricePerDay ?? 0),
      tier3Enabled: (initialData as any)?.tier3Enabled ?? true,
      currency: initialData?.currency ?? "TRY",
      effectiveFrom: initialData?.effectiveFrom ?? new Date().toISOString().split("T")[0],
      effectiveUntil: initialData?.effectiveUntil ?? null,
      isActive: initialData?.isActive ?? true,
      notes: initialData?.notes ?? "",
    },
  })

  const tier2Enabled = form.watch("tier2Enabled")
  const tier3Enabled = form.watch("tier3Enabled")

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [portsResponse, carriersResponse] = await Promise.all([fetch("/api/ports"), fetch("/api/carriers")])
        const [portsData, carriersData] = await Promise.all([portsResponse.json(), carriersResponse.json()])

        setPorts(portsData.data || [])
        setCarriers(carriersData.data || [])
      } catch (error) {
        toast({
          title: "Hata",
          description: "Form seçenekleri yüklenemedi",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [toast])

  useEffect(() => {
    if (!initialData) return

    form.reset({
      portId: initialData.portId ?? "",
      shippingCompanyId: initialData.shippingCompanyId ?? "",
      containerType: initialData.containerType ?? "20DC",
      imoCargo: (initialData as any)?.imoCargo ?? false,
      tier1DaysFrom: initialData.tier1DaysFrom ?? 1,
      tier1DaysTo: initialData.tier1DaysTo ?? 5,
      tier1PricePerDay: Number(initialData.tier1PricePerDay ?? 0),
      tier2DaysFrom: initialData.tier2DaysFrom ?? 6,
      tier2DaysTo: initialData.tier2DaysTo ?? 10,
      tier2PricePerDay: Number(initialData.tier2PricePerDay ?? 0),
      tier2Enabled: (initialData as any)?.tier2Enabled ?? true,
      tier3DaysFrom: initialData.tier3DaysFrom ?? 11,
      tier3PricePerDay: Number(initialData.tier3PricePerDay ?? 0),
      tier3Enabled: (initialData as any)?.tier3Enabled ?? true,
      currency: initialData.currency ?? "TRY",
      effectiveFrom: initialData.effectiveFrom ?? new Date().toISOString().split("T")[0],
      effectiveUntil: initialData.effectiveUntil ?? null,
      isActive: initialData.isActive ?? true,
      notes: initialData.notes ?? "",
    })
  }, [form, initialData])

  const onSubmit = async (values: TariffRuleFormValues) => {
    try {
      const response = await fetch(submitUrl, {
        method: submitMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.error || "Kayıt işlemi başarısız")
      }

      toast({
        title: "Başarılı",
        description: mode === "create" ? "Tarife oluşturuldu" : "Tarife güncellendi",
      })
      router.push("/admin/ucret-tarifeleri")
      router.refresh()
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Kayıt sırasında hata oluştu",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/admin/ucret-tarifeleri")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {mode === "create" ? "Yeni Ücret Tarifesi" : "Ücret Tarifesini Düzenle"}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Hat, liman ve ekipman bazlı kademeli tarife bilgilerini tanımlayın.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tarife Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="shippingCompanyId"
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
                  name="portId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liman *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Bir liman seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ports.map((port) => (
                            <SelectItem key={port.id} value={port.id}>
                              {port.name}
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
                  name="containerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ekipman Tipi *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Ekipman seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {containerTypes.map((option) => (
                            <SelectItem key={option.id} value={option.code}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imoCargo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border p-4">
                    <div>
                      <FormLabel>IMO Cargo (Tehlikeli Yük)</FormLabel>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Bu tarife sadece IMO Cargo seçili hesaplamalarda eşleşir.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                <span aria-hidden className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 font-semibold">i</span>
                <p className="leading-relaxed">
                  <strong className="font-semibold">İpucu:</strong> Tier 1&apos;e <strong>günlük ücret 0</strong> girilirse o gün aralığı <strong>muafiyet penceresi</strong> olarak değerlendirilir.
                </p>
              </div>

              <div className="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-3 dark:border-slate-800">
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
                        <Input type="date" value={field.value ?? ""} onChange={field.onChange} />
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
                        rows={4}
                        placeholder="Tarife kaydına ait açıklama veya istisna notu"
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

              <div className="flex gap-3">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "create" ? "Kaydı Oluştur" : "Değişiklikleri Kaydet"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/admin/ucret-tarifeleri")}>
                  İptal
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
