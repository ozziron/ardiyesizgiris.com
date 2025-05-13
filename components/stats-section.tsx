"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Calculator, Anchor, Clock } from "lucide-react"

export function StatsSection() {
  const [animatedStats, setAnimatedStats] = useState({
    kullaniciSayisi: 0,
    hesaplamaSayisi: 0,
    limanSayisi: 0,
    tasarrufSaati: 0,
  })

  const hedefDegerler = {
    kullaniciSayisi: 1000,
    hesaplamaSayisi: 25000,
    limanSayisi: 12,
    tasarrufSaati: 5000,
  }

  useEffect(() => {
    const animasyonSuresi = 2000 // 2 saniye
    const adimSayisi = 50
    const aralik = animasyonSuresi / adimSayisi
    let adim = 0

    const animasyonInterval = setInterval(() => {
      adim++
      const oran = adim / adimSayisi

      setAnimatedStats({
        kullaniciSayisi: Math.floor(hedefDegerler.kullaniciSayisi * oran),
        hesaplamaSayisi: Math.floor(hedefDegerler.hesaplamaSayisi * oran),
        limanSayisi: Math.floor(hedefDegerler.limanSayisi * oran),
        tasarrufSaati: Math.floor(hedefDegerler.tasarrufSaati * oran),
      })

      if (adim >= adimSayisi) {
        clearInterval(animasyonInterval)
      }
    }, aralik)

    return () => clearInterval(animasyonInterval)
  }, [])

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Rakamlarla Ardiyesiz Giriş</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Platformumuz lojistik profesyonellerine nasıl değer katıyor?
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Users className="h-12 w-12 text-emerald-600 mb-4" />
              <div className="text-4xl font-bold mb-2">{animatedStats.kullaniciSayisi.toLocaleString()}+</div>
              <p className="text-gray-600 dark:text-gray-400 text-center">Aktif Kullanıcı</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Calculator className="h-12 w-12 text-emerald-600 mb-4" />
              <div className="text-4xl font-bold mb-2">{animatedStats.hesaplamaSayisi.toLocaleString()}+</div>
              <p className="text-gray-600 dark:text-gray-400 text-center">Yapılan Hesaplama</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Anchor className="h-12 w-12 text-emerald-600 mb-4" />
              <div className="text-4xl font-bold mb-2">{animatedStats.limanSayisi}</div>
              <p className="text-gray-600 dark:text-gray-400 text-center">Desteklenen Liman</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Clock className="h-12 w-12 text-emerald-600 mb-4" />
              <div className="text-4xl font-bold mb-2">{animatedStats.tasarrufSaati.toLocaleString()}+</div>
              <p className="text-gray-600 dark:text-gray-400 text-center">Tasarruf Edilen Saat</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
