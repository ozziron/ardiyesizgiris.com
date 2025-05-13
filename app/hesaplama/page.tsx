import { HesaplamaForm } from "@/components/hesaplama-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, FileText, Clock } from "lucide-react"

export const metadata = {
  title: "Ardiyesiz Giriş Hesaplama | Tüm Limanlar İçin",
  description:
    "Konteyner taşımacılığında ardiyesiz giriş tarihlerini hesaplayın. Tüm Türkiye limanları için geçerli ardiyesiz gün hesaplama aracı.",
}

export default function HesaplamaPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">Ardiyesiz Giriş Hesaplama</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Konteyner taşımacılığında ardiyesiz giriş tarihlerini hesaplayın. Tüm Türkiye limanları için geçerli
            ardiyesiz gün hesaplama aracı.
          </p>
        </div>

        <Tabs defaultValue="standart" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="standart" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span>Standart Hesaplama</span>
            </TabsTrigger>
            <TabsTrigger value="toplu" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Toplu Hesaplama</span>
            </TabsTrigger>
            <TabsTrigger value="gelismis" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Gelişmiş Hesaplama</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standart">
            <Card>
              <CardHeader>
                <CardTitle>Standart Hesaplama</CardTitle>
                <CardDescription>Tek bir konteyner için ardiyesiz giriş tarihini hesaplayın.</CardDescription>
              </CardHeader>
              <CardContent>
                <HesaplamaForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="toplu">
            <Card>
              <CardHeader>
                <CardTitle>Toplu Hesaplama</CardTitle>
                <CardDescription>Birden fazla konteyner için ardiyesiz giriş tarihlerini hesaplayın.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Bu özellik yakında kullanıma sunulacaktır. Şimdilik standart hesaplama aracını kullanabilirsiniz.
                </p>
                <HesaplamaForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gelismis">
            <Card>
              <CardHeader>
                <CardTitle>Gelişmiş Hesaplama</CardTitle>
                <CardDescription>Özel durumlar ve istisnalar için detaylı hesaplama yapın.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Bu özellik yakında kullanıma sunulacaktır. Şimdilik standart hesaplama aracını kullanabilirsiniz.
                </p>
                <HesaplamaForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
