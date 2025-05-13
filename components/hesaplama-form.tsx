"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { CalendarIcon, Ship, Loader2, Calculator } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  liman: z.string({
    required_error: "Lütfen bir liman seçin.",
  }),
  konteynerTipi: z.string({
    required_error: "Lütfen konteyner tipini seçin.",
  }),
  konteynerId: z.string().min(5, {
    message: "Konteyner ID en az 5 karakter olmalıdır.",
  }),
  konsimentoTarihi: z.date({
    required_error: "Lütfen konşimento tarihini seçin.",
  }),
  varisTarihi: z.date({
    required_error: "Lütfen varış tarihini seçin.",
  }),
  ihracatMi: z.boolean().default(false).optional(),
  tehlikeliYukMu: z.boolean().default(false).optional(),
})

const limanlar = [
  { value: "istanbul", label: "İstanbul Limanı" },
  { value: "izmir", label: "İzmir Limanı" },
  { value: "mersin", label: "Mersin Limanı" },
  { value: "iskenderun", label: "İskenderun Limanı" },
  { value: "samsun", label: "Samsun Limanı" },
  { value: "tekirdag", label: "Tekirdağ Limanı" },
  { value: "antalya", label: "Antalya Limanı" },
  { value: "trabzon", label: "Trabzon Limanı" },
]

const konteynerTipleri = [
  { value: "20DC", label: "20' Standart (DC)" },
  { value: "40DC", label: "40' Standart (DC)" },
  { value: "40HC", label: "40' Yüksek (HC)" },
  { value: "20OT", label: "20' Açık Üst (OT)" },
  { value: "40OT", label: "40' Açık Üst (OT)" },
  { value: "20FR", label: "20' Flat Rack (FR)" },
  { value: "40FR", label: "40' Flat Rack (FR)" },
  { value: "20RF", label: "20' Buzdolabı (RF)" },
  { value: "40RF", label: "40' Buzdolabı (RF)" },
]

export function HesaplamaForm() {
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState<{
    ardiyesizGirisTarihi: Date | null
    kalanGun: number | null
    detaylar: string | null
  } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ihracatMi: false,
      tehlikeliYukMu: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsCalculating(true)

    // Simüle edilmiş API çağrısı
    setTimeout(() => {
      // Örnek hesaplama - gerçek uygulamada bu sunucu tarafında yapılmalıdır
      const konsimentoTarihi = new Date(values.konsimentoTarihi)
      const varisTarihi = new Date(values.varisTarihi)

      // Liman kurallarına göre ardiyesiz gün sayısı (örnek)
      let ardiyesizGunSayisi = 7 // Varsayılan

      if (values.liman === "istanbul") ardiyesizGunSayisi = 7
      else if (values.liman === "izmir") ardiyesizGunSayisi = 5
      else if (values.liman === "mersin") ardiyesizGunSayisi = 10

      // İhracat ve tehlikeli yük durumlarına göre ayarlamalar
      if (values.ihracatMi) ardiyesizGunSayisi += 3
      if (values.tehlikeliYukMu) ardiyesizGunSayisi -= 2

      // Ardiyesiz giriş tarihini hesapla
      const ardiyesizGirisTarihi = new Date(varisTarihi)
      ardiyesizGirisTarihi.setDate(varisTarihi.getDate() + ardiyesizGunSayisi)

      // Kalan gün hesaplama
      const bugun = new Date()
      const kalanGun = Math.ceil((ardiyesizGirisTarihi.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24))

      setResult({
        ardiyesizGirisTarihi,
        kalanGun,
        detaylar: `${values.liman} limanı için ardiyesiz süre ${ardiyesizGunSayisi} gündür.`,
      })

      setIsCalculating(false)
    }, 1500)
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="liman"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liman</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Liman seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {limanlar.map((liman) => (
                        <SelectItem key={liman.value} value={liman.value}>
                          {liman.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>İşlem yapacağınız limanı seçin.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="konteynerTipi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konteyner Tipi</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Konteyner tipi seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {konteynerTipleri.map((tip) => (
                        <SelectItem key={tip.value} value={tip.value}>
                          {tip.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Konteyner tipini seçin.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="konteynerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konteyner ID</FormLabel>
                <FormControl>
                  <Input placeholder="ABCD1234567" {...field} />
                </FormControl>
                <FormDescription>Konteyner ID numarasını girin.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="konsimentoTarihi"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Konşimento Tarihi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP", { locale: tr }) : <span>Tarih seçin</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Konşimento tarihini seçin.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="varisTarihi"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Varış Tarihi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP", { locale: tr }) : <span>Tarih seçin</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Geminin limana varış tarihini seçin.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="ihracatMi"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>İhracat Yükü</FormLabel>
                    <FormDescription>Bu bir ihracat yükü ise işaretleyin.</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tehlikeliYukMu"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Tehlikeli Yük</FormLabel>
                    <FormDescription>Bu bir tehlikeli yük ise işaretleyin.</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isCalculating}>
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Hesaplanıyor
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Hesapla
              </>
            )}
          </Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Hesaplama Sonucu</span>
              <Badge variant={result.kalanGun && result.kalanGun > 0 ? "outline" : "destructive"}>
                {result.kalanGun && result.kalanGun > 0 ? `${result.kalanGun} gün kaldı` : "Süre doldu"}
              </Badge>
            </CardTitle>
            <CardDescription>{result.detaylar}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ardiyesiz Giriş Tarihi</p>
                  <p className="text-lg font-semibold">
                    {result.ardiyesizGirisTarihi
                      ? format(result.ardiyesizGirisTarihi, "PPP", { locale: tr })
                      : "Hesaplanamadı"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kalan Gün</p>
                  <p className="text-lg font-semibold">
                    {result.kalanGun !== null ? `${result.kalanGun} gün` : "Hesaplanamadı"}
                  </p>
                </div>
              </div>

              <Alert>
                <Ship className="h-4 w-4" />
                <AlertTitle>Bilgilendirme</AlertTitle>
                <AlertDescription>
                  Bu hesaplama tahmini bir değerdir. Kesin bilgi için liman yetkililerine danışınız.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setResult(null)}>
              Yeni Hesaplama
            </Button>
            <Button variant="secondary">Sonucu Kaydet</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
