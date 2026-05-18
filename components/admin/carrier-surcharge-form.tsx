"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { carrierSurchargeFormSchema } from "@/lib/validation/schemas"
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
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type SurchargeFormValues = z.infer<typeof carrierSurchargeFormSchema>

interface SurchargeFormSeed {
  shippingCompanyId?: string
  name?: string
  description?: string | null
  amount?: number
  currency?: string
  applyType?: string
  containerTypes?: string[]
  isActive?: boolean
}

interface CarrierSurchargeFormProps {
  mode: "create" | "edit"
  initialData?: SurchargeFormSeed
  submitUrl: string
  submitMethod: "POST" | "PUT"
}

interface CarrierOption {
  id: string
  name: string
  code: string
}

export function CarrierSurchargeForm({
  mode,
  initialData,
  submitUrl,
  submitMethod,
}: CarrierSurchargeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [carriers, setCarriers] = useState<CarrierOption[]>([])
  const [containerTypesInput, setContainerTypesInput] = useState(
    (initialData?.containerTypes ?? []).join(", ")
  )

  const form = useForm<SurchargeFormValues>({
    resolver: zodResolver(carrierSurchargeFormSchema),
    defaultValues: {
      shippingCompanyId: initialData?.shippingCompanyId ?? "",
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      amount: initialData?.amount ?? 0,
      currency: initialData?.currency ?? "USD",
      applyType: initialData?.applyType ?? "PER_CONTAINER",
      containerTypes: initialData?.containerTypes ?? [],
      isActive: initialData?.isActive ?? true,
    },
  })

  useEffect(() => {
    fetch("/api/admin/carriers")
      .then((r) => r.json())
      .then((d) => setCarriers(d.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!initialData) return
    form.reset({
      shippingCompanyId: initialData.shippingCompanyId ?? "",
      name: initialData.name ?? "",
      description: initialData.description ?? "",
      amount: initialData.amount ?? 0,
      currency: initialData.currency ?? "USD",
      applyType: initialData.applyType ?? "PER_CONTAINER",
      containerTypes: initialData.containerTypes ?? [],
      isActive: initialData.isActive ?? true,
    })
    setContainerTypesInput((initialData.containerTypes ?? []).join(", "))
  }, [form, initialData])

  const onSubmit = async (values: SurchargeFormValues) => {
    setSubmitting(true)
    try {
      const res = await fetch(submitUrl, {
        method: submitMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.error || "Kayıt işlemi başarısız")
      }
      toast({
        title: "Başarılı",
        description:
          mode === "create" ? "Ek ücret oluşturuldu" : "Ek ücret güncellendi",
      })
      router.push("/admin/ek-ucretler")
      router.refresh()
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Kayıt sırasında hata oluştu",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const availableCarriers = carriers.filter((c) => c.id !== "")

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/ek-ucretler")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {mode === "create" ? "Yeni Ek Ücret" : "Ek Ücreti Düzenle"}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Hat bazlı tek seferlik ek masraf tanımlayın (surcharge).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ek Ücret Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="shippingCompanyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hat *</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          value={field.value}
                          onChange={field.onChange}
                          disabled={mode === "edit"}
                        >
                          <option value="">Hat seçiniz</option>
                          {availableCarriers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.code})
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tutar *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value || "0"))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ek Ücret Adı *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="örn. DTE-Freetime Extension Surcharge"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Sonuç kartında ve exportlarda görünecek başlık.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Ek ücretin kapsamı ve koşulları (isteğe bağlı)"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Para Birimi</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="TRY">TRY (₺)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uygulama Tipi</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="PER_CONTAINER">Konteyner Başına</option>
                        </select>
                      </FormControl>
                      <FormDescription>
                        Şimdilik sadece konteyner başına.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="containerTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konteyner Tipleri</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="örn. 20RF, 40RF (boş bırakılırsa tüm tiplere uygulanır)"
                        value={containerTypesInput}
                        onChange={(e) => {
                          setContainerTypesInput(e.target.value)
                          const parts = e.target.value
                            .split(",")
                            .map((s) => s.trim().toUpperCase())
                            .filter(Boolean)
                          field.onChange(parts)
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Virgülle ayrılmış konteyner tip kodları (örn. 20RF, 40RF). Boş
                      bırakılırsa tüm konteyner tiplerine uygulanır.
                    </FormDescription>
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
                      <FormDescription>
                        Pasif ek ücretler hesaplamalara dahil edilmez.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "create" ? "Oluştur" : "Değişiklikleri Kaydet"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/ek-ucretler")}
                >
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
