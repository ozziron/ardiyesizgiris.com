import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const testimonials = [
  {
    name: "Ahmet Yılmaz",
    title: "Lojistik Müdürü",
    company: "Global Kargo A.Ş.",
    image: "/placeholder.svg?height=40&width=40",
    content:
      "Ardiyesiz Giriş hesaplama aracı sayesinde lojistik süreçlerimizi çok daha verimli yönetiyoruz. Zaman ve maliyet tasarrufu sağlıyoruz.",
  },
  {
    name: "Ayşe Demir",
    title: "İthalat Uzmanı",
    company: "Deniz Ticaret Ltd.",
    image: "/placeholder.svg?height=40&width=40",
    content:
      "Artık her limandaki ardiyesiz gün hesaplamalarını tek bir yerden yapabiliyorum. Bu araç işimi çok kolaylaştırdı.",
  },
  {
    name: "Mehmet Kaya",
    title: "Operasyon Direktörü",
    company: "Anadolu Lojistik",
    image: "/placeholder.svg?height=40&width=40",
    content:
      "Doğru ve güncel hesaplamalar sayesinde ardiye maliyetlerimizi %30 oranında azalttık. Kesinlikle tavsiye ediyorum.",
  },
]

export function Testimonials() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Müşterilerimiz Ne Diyor?</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ardiyesiz Giriş hesaplama aracımızı kullanan profesyonellerin deneyimleri.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.image || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    <CardDescription>
                      {testimonial.title}, {testimonial.company}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
