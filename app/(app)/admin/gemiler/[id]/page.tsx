"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { carrierFormSchema } from "@/lib/validation/schemas"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

type CarrierFormData = z.infer<typeof carrierFormSchema>

interface CarrierEditPageProps {
  params: Promise<{
    id: string
  }>
}

export default function CarrierEditPage({ params }: CarrierEditPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [carrierId, setCarrierId] = useState<string | null>(null)
  const form = useForm<CarrierFormData>({
    resolver: zodResolver(carrierFormSchema),
    defaultValues: {
      name: "",
      code: "",
      isActive: true,
    },
  })

  useEffect(() => {
    const fetchCarrier = async () => {
      try {
        const resolvedParams = await params
        setCarrierId(resolvedParams.id)
        const response = await fetch(`/api/admin/carriers/${resolvedParams.id}`)
        if (!response.ok) throw new Error("Hat yüklenirken hata")

        const data = await response.json()
        form.reset({
          name: data.data.name,
          code: data.data.code,
          isActive: data.data.isActive,
        })
      } catch (error) {
        toast({
          title: "Hata",
          description: "Hat bilgileri yüklenemedi",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCarrier()
  }, [params, form, toast])

  const onSubmit = async (formData: CarrierFormData) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/carriers/${carrierId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Güncellemesi başarısız")

      toast({
        title: "Başarılı",
        description: "Hat başarıyla güncellendi",
      })

      router.push("/admin/gemiler")
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hat güncellenirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
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
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/gemiler")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Hatı Düzenle
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Hat bilgilerini güncelleyin
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hat Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hat Adı *</FormLabel>
                    <FormControl>
                      <Input placeholder="Maersk Lines" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hat Kodu *</FormLabel>
                    <FormControl>
                      <Input placeholder="MAEU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <FormLabel className="text-sm font-medium">
                      Aktif
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Kaydet
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/gemiler")}
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
