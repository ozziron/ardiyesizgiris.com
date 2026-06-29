import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { glossaryTerms } from "@/lib/content/glossary"
import { Card, CardContent } from "@/components/ui/card"
import { CtaSection } from "@/components/cta-section"
import { ArrowLeft, BookOpen, LinkIcon } from "lucide-react"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return glossaryTerms.map((term) => ({ slug: term.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const term = glossaryTerms.find((t) => t.slug === slug)
  if (!term) {
    return { title: "Terim Bulunamadı | Ardiyesiz Giriş" }
  }
  return {
    title: `${term.title} Nedir? | Ardiyesiz Giriş Sözlük`,
    description: term.description,
    alternates: {
      canonical: `https://www.ardiyesizgiris.com/sozluk/${term.slug}`,
    },
    openGraph: {
      title: `${term.title} Nedir? | Ardiyesiz Giriş Sözlük`,
      description: term.description,
      type: "article",
      url: `https://www.ardiyesizgiris.com/sozluk/${term.slug}`,
      siteName: "Ardiyesiz Giriş",
      locale: "tr_TR",
    },
  }
}

export default async function SozlukTermPage({ params }: Props) {
  const { slug } = await params
  const term = glossaryTerms.find((t) => t.slug === slug)

  if (!term) {
    notFound()
  }

  const relatedTerms = term.relatedTerms
    .map((s) => glossaryTerms.find((t) => t.slug === s))
    .filter(Boolean)

  // FAQ structured data for this glossary term
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${term.title} nedir?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: term.description,
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
        name: "Sözlük",
        item: "https://www.ardiyesizgiris.com/sozluk",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: term.title,
        item: `https://www.ardiyesizgiris.com/sozluk/${term.slug}`,
      },
    ],
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
                href="/sozluk"
                className="hover:text-emerald-600 transition-colors"
              >
                Sözlük
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 dark:text-gray-100 font-medium truncate">
              {term.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* Content */}
      <article className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/sozluk"
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Sözlüğe Dön
              </Link>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                  {term.title} Nedir?
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {term.description}
              </p>
            </div>

            {/* Definition */}
            <Card className="mb-10">
              <CardContent className="p-6 md:p-8">
                <div
                  className="prose prose-gray dark:prose-invert max-w-none
                    prose-headings:font-display prose-headings:tracking-tight
                    prose-h2:text-xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3
                    prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                    prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                    prose-li:text-gray-600 dark:prose-li:text-gray-300
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1"
                  dangerouslySetInnerHTML={{
                    __html: term.definition
                      .split("\n\n")
                      .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
                      .join(""),
                  }}
                />
              </CardContent>
            </Card>

            {/* Related Terms */}
            {relatedTerms.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-emerald-600" />
                  İlgili Terimler
                </h2>
                <div className="flex flex-wrap gap-3">
                  {relatedTerms.map((rt) => (
                    <Link
                      key={rt!.slug}
                      href={`/sozluk/${rt!.slug}`}
                      className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      {rt!.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Calculator CTA inline */}
            <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center">
              <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-3">
                Ardiyesiz giriş tarihinizi hemen hesaplayın
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-4">
                Hesaplama aracımızla tüm limanlar için ardiyesiz gününüzü
                anında öğrenin.
              </p>
              <Link
                href="/hesaplama"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
              >
                Hesaplama Yap
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Full-width CTA */}
      <CtaSection />
    </>
  )
}
