"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Phone, MapPin, Send } from "lucide-react"

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

const initialFormData: FormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
}

const contactInfo = [
  { icon: Mail, label: "E-posta", value: "info@ardiyesizgiris.com", href: "mailto:info@ardiyesizgiris.com" },
  { icon: Phone, label: "Telefon", value: "+90 (212) 123 45 67", href: "tel:+902121234567" },
  { icon: MapPin, label: "Adres", value: "İstanbul, Türkiye", href: null },
]

export default function IletisimPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Mesajınız gönderilemedi.")
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mesajınız gönderilemedi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Bize Ulaşın
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Sorularınız, önerileriniz veya iş birliği için aşağıdaki formu doldurabilirsiniz.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>İletişim Formu</CardTitle>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <Alert className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
                      <Send className="h-4 w-4 text-emerald-600" />
                      <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                        Mesajınız için teşekkür ederiz. En kısa sürede size geri dönüş yapacağız.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Adınız Soyadınız</Label>
                        <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="Adınız ve soyadınız" />
                      </div>

                      <div>
                        <Label htmlFor="email">E-posta Adresiniz</Label>
                        <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="ornek@firma.com" />
                      </div>

                      <div>
                        <Label htmlFor="subject">Konu</Label>
                        <Input id="subject" name="subject" required value={formData.subject} onChange={handleChange} placeholder="Mesajınızın konusu" />
                      </div>

                      <div>
                        <Label htmlFor="message">Mesajınız</Label>
                        <Textarea id="message" name="message" required value={formData.message} onChange={handleChange} placeholder="Mesajınızı buraya yazın..." rows={5} />
                      </div>

                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        <Send className="mr-2 h-4 w-4" />
                        {isLoading ? "Gönderiliyor..." : "Mesajı Gönder"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {contactInfo.map((info) => {
                const Icon = info.icon
                return (
                  <Card key={info.label}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{info.label}</p>
                        {info.href ? (
                          <a href={info.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{info.value}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
