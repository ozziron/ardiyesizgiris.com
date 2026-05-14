"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { containerTypeFormSchema } from "@/lib/validation/schemas"
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

type ContainerTypeFormValues = z.infer<typeof containerTypeFormSchema>

interface ContainerTypeFormSeed {
  code?: string
  label?: string
  displayOrder?: number
  isActive?: boolean
  notes?: string | null
}

interface ContainerTypeFormProps {
  mode: "create" | "edit"
  initialData?: ContainerTypeFormSeed
  submitUrl: string
  submitMethod: "POST" | "PUT"
}

/**
 * Shared form for creating + editing a ContainerType. The schema enforces
 * the `code` regex (uppercase letters and digits only, e.g. 20DC, 40HC,
 * 20RF) so admins don't accidentally introduce inconsistent casing or
 * stray characters that would mismatch existing rule rows.
 */
export function ContainerTypeForm({
  mode,
  initialData,
  submitUrl,
  submitMethod,
}: ContainerTypeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<ContainerTypeFormValues>({
    resolver: zodResolver(containerTypeFormSchema),
    defaultValues: {
      code: initialData?.code ?? "",
      label: initialData?.label ?? "",
      displayOrder: initialData?.displayOrder ?? 0,
      isActive: initialData?.isActive ?? true,
      notes: initialData?.notes ?? "",
    },
  })

  useEffect(() => {
    if (!initialData) return
    form.reset({
      code: initialData.code ?? "",
      label: initialData.label ?? "",
      displayOrder: initialData.displayOrder ?? 0,
      isActive: initialData.isActive ?? true,
      notes: initialData.notes ?? "",
    })
  }, [form, initialData])

  const onSubmit = async (values: ContainerTypeFormValues) => {
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
          mode === "create" ? "Ekipman tipi oluşturuldu" : "Ekipman tipi güncellendi",
      })
      router.push("/admin/ekipman-tipleri")
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

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/ekipman-tipleri")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {mode === "create" ? "Yeni Ekipman Tipi" : "Ekipman Tipini Düzenle"}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Konteyner tipini tanımlayın. Aktif tipler hesaplama formunda ve yeni kural
          tanımlarında görünür.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ekipman Tipi Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kod *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="örn. 20DC, 40HC, 20RF"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormDescription>
                        Büyük harf ve rakam. Mevcut kurallarda kullanılan kodlar değiştirilirse
                        eski kayıtlar eşleşemez.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sıra</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value || "0", 10))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Listede gösterim sırası (küçük → büyük).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="örn. 20 Feet Standart (20DC)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Kullanıcının select listesinde göreceği etiket.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="İç açıklama (kullanıcıya gösterilmez)"
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
                      <FormDescription>
                        Pasif tipler hesaplama formunda ve yeni kural tanımlarında listelenmez.
                        Mevcut kayıtları bozmaz.
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
                  onClick={() => router.push("/admin/ekipman-tipleri")}
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
