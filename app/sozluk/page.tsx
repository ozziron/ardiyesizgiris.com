import type { Metadata } from "next"
import Link from "next/link"
import { glossaryTerms } from "@/lib/content/glossary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CtaSection } from "@/components/cta-section"
import { BookOpen, ArrowRight, Search } from "lucide-react"

export const metadata: Metadata = {
  title: "Lojistik Terimleri Sözlüğü | Ardiyesiz Giriş",
  description:
    "Konteyner taşımacılığı ve lojistik terimleri sözlüğü. Ardiye, demuraj, detention, konşimento ve daha fazlası hakkında detaylı bilgiler.",
  alternates: { canonical: "https://www.ardiyesizgiris.com/sozluk" },
  openGraph: {
    title: "Lojistik Terimleri Sözlüğü | Ardiyesiz Giriş",
    description:
      "Konteyner taşımacılığı ve lojistik terimleri sözlüğü. Ardiye, demuraj, detention, konşimento ve daha fazlası.",
    type: "website",
    url: "https://www.ardiyesizgiris.com/sozluk",
    siteName: "Ardiyesiz Giriş",
    locale: "tr_TR",
  },
}

export default function SozlukPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 -z-10" />
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Lojistik Terimleri Sözlüğü
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Konteyner taşımacılığı, liman operasyonları ve uluslararası
              lojistikte sık kullanılan terimlerin açıklamaları. Ardiye,
              demuraj, detention ve daha fazlası hakkında kapsamlı bilgiler.
            </p>
          </div>
        </div>
      </section>

      {/* Glossary Terms Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Arama ipucu — ileride canlı arama eklenebilir */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <div className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-10 pr-4 flex items-center text-sm text-gray-400">
                Terim ara... (çok yakında)
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {glossaryTerms.map((term) => (
              <Link
                key={term.slug}
                href={`/sozluk/${term.slug}`}
                className="group"
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{term.title}</span>
                      <ArrowRight className="h-4 w-4 text-emerald-500 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {term.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaSection />
    </>
  )
}
