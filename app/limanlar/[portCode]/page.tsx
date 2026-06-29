import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { portLandingData } from "@/lib/content/ports"
import { Card, CardContent } from "@/components/ui/card"
import { CtaSection } from "@/components/cta-section"
import {
  ArrowLeft,
  Ship,
  MapPin,
  CheckCircle2,
  Anchor,
  Calculator,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  params: Promise<{ portCode: string }>
}

export async function generateStaticParams() {
  return portLandingData.map((port) => ({ portCode: port.code }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { portCode } = await params
  const port = portLandingData.find((p) => p.code === portCode)
  if (!port) {
    return { title: "Liman Bulunamadı | Ardiyesiz Giriş" }
  }
  return {
    title: port.metaTitle,
    description: port.metaDescription,
    alternates: {
      canonical: `https://www.ardiyesizgiris.com/limanlar/${port.code}`,
    },
    openGraph: {
      title: port.metaTitle,
      description: port.metaDescription,
      type: "article",
      url: `https://www.ardiyesizgiris.com/limanlar/${port.code}`,
      siteName: "Ardiyesiz Giriş",
      locale: "tr_TR",
    },
  }
}

export default async function PortLandingPage({ params }: Props) {
  const { portCode } = await params
  const port = portLandingData.find((p) => p.code === portCode)

  if (!port) {
    notFound()
  }

  // FAQ structured data
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${port.name} ardiyesiz giriş nasıl hesaplanır?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${port.name} için ardiyesiz giriş hesaplaması; limanın güncel ardiye tarifesi, armatör/hata ait serbest gün sayısı ve konteyner tipine göre yapılır. Hesaplama aracımızla ${port.name} için ardiyesiz gününüzü anında öğrenebilirsiniz.`,
        },
      },
      {
        "@type": "Question",
        name: `${port.name} ardiye ücretleri ne kadar?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${port.name} ardiye ücretleri; konteyner tipi, armatör ve IMO durumuna göre değişkenlik gösterir. Güncel tarifeler için hesaplama aracımızı kullanabilirsiniz.`,
        },
      },
    ],
  }

  // Breadcrumb structured data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: "https://www.ardiyesizgiris.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Limanlar",
        item: "https://www.ardiyesizgiris.com/limanlar",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: port.name,
        item: `https://www.ardiyesizgiris.com/limanlar/${port.code}`,
      },
    ],
  }

  // LocalBusiness structured data for port
  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: port.name,
    description: port.seoDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: port.city,
      addressCountry: "TR",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="pt-28 pb-0" aria-label="Breadcrumb">
        <div className="container mx-auto px-4">
          <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="hover:text-emerald-600 transition-colors"
              >
                Ana Sayfa
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/limanlar"
                className="hover:text-emerald-600 transition-colors"
              >
                Limanlar
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 dark:text-gray-100 font-medium truncate">
              {port.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-8 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/limanlar"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Tüm Limanlar
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <Anchor className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                  {port.name} Ardiyesiz Giriş Hesaplama
                </h1>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {port.city}, Türkiye
                </p>
              </div>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-300">
              {port.seoDescription}
            </p>

            {/* Quick CTA */}
            <div className="mt-6">
              <Button size="lg" asChild>
                <Link href={`/hesaplama?liman=${port.code}`}>
                  <Calculator className="mr-2 h-5 w-5" />
                  {port.name} İçin Hesaplama Yap
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-8 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
              <Ship className="h-5 w-5 text-emerald-600" />
              {port.name} Özellikleri
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {port.keyFeatures.map((feat) => (
                <div
                  key={feat}
                  className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rich Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-6 md:p-8">
                <div
                  className="prose prose-gray dark:prose-invert max-w-none
                    prose-headings:font-display prose-headings:tracking-tight
                    prose-h2:text-xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3
                    prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                    prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                    prose-li:text-gray-600 dark:prose-li:text-gray-300
                    prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-50 dark:prose-blockquote:bg-emerald-950/30
                    prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                    prose-blockquote:text-emerald-800 dark:prose-blockquote:text-emerald-200
                    prose-blockquote:not-italic prose-blockquote:text-sm
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1"
                  dangerouslySetInnerHTML={{
                    __html: port.content
                      .split("\n\n")
                      .map((block) => {
                        if (block.startsWith("## ")) {
                          return `<h2>${block.slice(3)}</h2>`
                        }
                        if (block.startsWith("> ")) {
                          return `<blockquote>${block.slice(2)}</blockquote>`
                        }
                        return `<p>${block.replace(/\n/g, "<br/>")}</p>`
                      })
                      .join(""),
                  }}
                />
              </CardContent>
            </Card>

            {/* Calculator CTA inline */}
            <div className="mt-10 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center">
              <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-3">
                {port.name} için ardiyesiz giriş tarihinizi hesaplayın
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-4">
                {port.city} çıkışlı konteynerleriniz için en uygun gate-in
                tarihini ücretsiz hesaplayın. Ardiye masraflarınızı optimize
                edin.
              </p>
              <Link
                href="/hesaplama"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Ücretsiz Hesaplama Yap
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width CTA */}
      <CtaSection />
    </>
  )
}
