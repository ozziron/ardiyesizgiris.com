"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqItems = [
  {
    question: "Ardiyesiz giriş nedir?",
    answer:
      "Ardiyesiz giriş, konteyner taşımacılığında konteynerlerin limana vardıktan sonra belirli bir süre içinde herhangi bir depolama ücreti ödemeden çekilebilmesi anlamına gelir. Bu süre, her liman için farklılık gösterebilir.",
  },
  {
    question: "Ardiyesiz giriş süresi nasıl hesaplanır?",
    answer:
      "Ardiyesiz giriş süresi genellikle geminin limana varış tarihinden itibaren başlar ve limanın belirlediği gün sayısı kadar devam eder. Hesaplamada konşimento tarihi, varış tarihi, konteyner tipi ve özel durumlar (ihracat/ithalat, tehlikeli madde vb.) dikkate alınır.",
  },
  {
    question: "Hesaplama aracı hangi limanları destekliyor?",
    answer:
      "Hesaplama aracımız şu anda İstanbul, İzmir, Mersin, İskenderun, Samsun, Antalya ve Tekirdağ limanlarını desteklemektedir. Düzenli olarak yeni limanlar eklenmektedir.",
  },
  {
    question: "Hesaplama sonuçları ne kadar güvenilir?",
    answer:
      "Hesaplama aracımız, her limanın güncel kurallarını ve politikalarını dikkate alarak çalışır. Ancak, limanların politikalarında ani değişiklikler olabileceğinden, kesin bilgi için her zaman liman yetkililerine danışmanızı öneririz.",
  },
  {
    question: "Hesaplama sonuçlarını nasıl kaydedebilirim?",
    answer:
      "Hesaplama sonuçlarını kaydetmek için üye olmanız gerekmektedir. Üye girişi yaptıktan sonra, tüm hesaplamalarınız otomatik olarak kaydedilir ve istediğiniz zaman erişebilirsiniz.",
  },
  {
    question: "Ardiye ücretleri nasıl hesaplanır?",
    answer:
      "Ardiye ücretleri, ardiyesiz süre dolduktan sonra başlar ve genellikle konteyner başına günlük olarak hesaplanır. Ücretler, konteyner tipi, boyutu ve limana göre değişiklik gösterir. Bazı limanlarda artan oranlı bir tarife uygulanabilir.",
  },
]

export function FaqSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Sık Sorulan Sorular</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ardiyesiz giriş hesaplama ve liman süreçleri hakkında en çok sorulan sorular.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
