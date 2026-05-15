"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { freeTimeRuleSchema } from "@/lib/validation/schemas"
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

type FreeTimeRuleFormValues = z.infer<typeof freeTimeRuleSchema>

interface FreeTimeRuleFormSeed {
  portId?: string
  shippingCompanyId?: string
  containerType?: string
  freeDays?: number
  effectiveFrom?: string
  effectiveUntil?: string | null
  isActive?: boolean
  notes?: string | null
}

interface SelectOption {
  id: string
  name: string
}

interface FreeTimeRuleFormProps {
  mode: "create" | "edit"
  initialData?: FreeTimeRuleFormSeed
  submitUrl: string
  submitMethod: "POST" | "PUT"
}

export function FreeTimeRuleForm({
  mode,
  initialData,
  submitUrl,
  submitMethod,
}: FreeTimeRuleFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [ports, setPorts] = useState<SelectOption[]>([])
  const [carriers, setCarriers] = useState<SelectOption[]>([])
  const [loading, setLoading] = useState(true)
  // Container types from DB (admin-managed) — hook returns active types only
  const { options: containerTypes } = useContainerTypes()

  const form = useForm<FreeTimeRuleFormValues>({
    resolver: zodResolver(freeTimeRuleSchema),
    defaultValues: {
      portId: initialData?.portId ?? "",
      shippingCompanyId: initialData?.shippingCompanyId ?? "",
      containerType: initialData?.containerType ?? "20DC",
      freeDays: initialData?.freeDays ?? 7,
      effectiveFrom: initialData?.effectiveFrom ?? new Date().toISOString().split("T")[0],
      effectiveUntil: initialData?.effectiveUntil ?? null,
      isActive: initialData?.isActive ?? true,
      notes: initialData?.notes ?? "",
    },
  })

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
      freeDays: initialData.freeDays ?? 7,
      effectiveFrom: initialData.effectiveFrom ?? new Date().toISOString().split("T")[0],
      effectiveUntil: initialData.effectiveUntil ?? null,
      isActive: initialData.isActive ?? true,
      notes: initialData.notes ?? "",
    })
  }, [form, initialData])

  const onSubmit = async (values: FreeTimeRuleFormValues) => {
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
        description:
          mode === "create" ? "Muafiyet kuralı oluşturuldu" : "Muafiyet kuralı güncellendi",
      })
      router.push("/admin/muafiyet-kurallari")
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
        <Button variant="ghost" onClick={() => router.push("/admin/muafiyet-kurallari")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {mode === "create" ? "Yeni Muafiyet Kuralı" : "Muafiyet Kuralını Düzenle"}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Hat, liman ve ekipman tipine göre muafiyet gününü tanımlayın.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Muafiyet Kuralı Bilgileri</CardTitle>
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
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="containerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ekipman Tipi *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Ekipman tipi seçin" />
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

                <FormField
                  control={form.control}
                  name="freeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Muafiyet Günü *</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="365" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        placeholder="Kurala ait açıklama veya operasyon notu ekleyin"
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
                        Pasif kayıtlar hesaplamada dikkate alınmaz.
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
                <Button type="button" variant="outline" onClick={() => router.push("/admin/muafiyet-kurallari")}>
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
