"use client"
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

export default function NewCarrierPage() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<CarrierFormData>({
    resolver: zodResolver(carrierFormSchema),
    defaultValues: {
      name: "",
      code: "",
      isActive: true,
    },
  })

  const onSubmit = async (formData: CarrierFormData) => {
    try {
      const response = await fetch("/api/admin/carriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Oluşturma başarısız")

      toast({
        title: "Başarılı",
        description: "Hat başarıyla oluşturuldu",
      })

      router.push("/admin/gemiler")
    } catch (error) {
      toast({
        title: "Hata",
        description: "Hat oluşturulurken hata oluştu",
        variant: "destructive",
      })
    }
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
          Yeni Hat Ekle
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Yeni bir gemi şirketi/hattı ekleyin
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
                      <Input placeholder="Örneğin: Maersk Lines" {...field} />
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
                <Button type="submit">
                  {form.formState.isSubmitting ? (
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
