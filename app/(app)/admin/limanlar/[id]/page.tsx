"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { portFormSchema } from "@/lib/validation/schemas"
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

type PortFormData = z.infer<typeof portFormSchema>

interface PortEditPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PortEditPage({ params }: PortEditPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [portId, setPortId] = useState<string | null>(null)

  const form = useForm<PortFormData>({
    resolver: zodResolver(portFormSchema),
    defaultValues: {
      name: "",
      code: "",
      city: "",
      country: "TR",
      isActive: true,
    },
  })

  useEffect(() => {
    const fetchPort = async () => {
      try {
        const resolvedParams = await params
        setPortId(resolvedParams.id)
        const response = await fetch(`/api/admin/ports/${resolvedParams.id}`)
        if (!response.ok) throw new Error("Liman yüklenirken hata")

        const data = await response.json()
        form.reset({
          name: data.data.name,
          code: data.data.code,
          city: data.data.city || "",
          country: data.data.country || "TR",
          isActive: data.data.isActive,
        })
      } catch (error) {
        toast({
          title: "Hata",
          description: "Liman bilgileri yüklenemedi",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPort()
  }, [params, form, toast])

  const onSubmit = async (formData: PortFormData) => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/admin/ports/${portId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Güncellemesi başarısız")

      toast({
        title: "Başarılı",
        description: "Liman başarıyla güncellendi",
      })

      router.push("/admin/limanlar")
    } catch (error) {
      toast({
        title: "Hata",
        description: "Liman güncellenirken hata oluştu",
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
          onClick={() => router.push("/admin/limanlar")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Limanı Düzenle
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Liman bilgilerini güncelleyin
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liman Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liman Adı *</FormLabel>
                    <FormControl>
                      <Input placeholder="İstanbul Limanı" {...field} />
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
                    <FormLabel>Liman Kodu *</FormLabel>
                    <FormControl>
                      <Input placeholder="ISTL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şehir</FormLabel>
                    <FormControl>
                      <Input placeholder="İstanbul" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ülke</FormLabel>
                    <FormControl>
                      <Input placeholder="TR" {...field} />
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
                  onClick={() => router.push("/admin/limanlar")}
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
