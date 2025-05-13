"use client"

import { useState } from "react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"

interface Liman {
  id: string
  ad: string
  konum: string
  ardiyesizGun: number
  ozellikler: string[]
}

interface LimanKarsilastirmaProps {
  limanlar: Liman[]
}

export function LimanKarsilastirma({ limanlar }: LimanKarsilastirmaProps) {
  const [seciliLimanlar, setSeciliLimanlar] = useState<string[]>([])

  const handleLimanSecimi = (limanId: string) => {
    if (seciliLimanlar.includes(limanId)) {
      setSeciliLimanlar(seciliLimanlar.filter((id) => id !== limanId))
    } else {
      if (seciliLimanlar.length < 3) {
        setSeciliLimanlar([...seciliLimanlar, limanId])
      }
    }
  }

  const filtrelenmisLimanlar = limanlar.filter((liman) => seciliLimanlar.includes(liman.id))

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Karşılaştırmak için liman seçin (en fazla 3)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {limanlar.map((liman) => (
            <div key={liman.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`liman-${liman.id}`}
                checked={seciliLimanlar.includes(liman.id)}
                onChange={() => handleLimanSecimi(liman.id)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor={`liman-${liman.id}`} className="text-sm font-medium">
                {liman.ad}
              </label>
            </div>
          ))}
        </div>
      </div>

      {filtrelenmisLimanlar.length > 0 ? (
        <Table>
          <TableCaption>Seçilen limanların karşılaştırması</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Özellik</TableHead>
              {filtrelenmisLimanlar.map((liman) => (
                <TableHead key={liman.id}>{liman.ad}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Konum</TableCell>
              {filtrelenmisLimanlar.map((liman) => (
                <TableCell key={liman.id}>{liman.konum}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Ardiyesiz Gün</TableCell>
              {filtrelenmisLimanlar.map((liman) => (
                <TableCell key={liman.id}>{liman.ardiyesizGun} gün</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Hizmetler</TableCell>
              {filtrelenmisLimanlar.map((liman) => (
                <TableCell key={liman.id}>{liman.ozellikler.join(", ")}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Tahmini Maliyet</TableCell>
              {filtrelenmisLimanlar.map((liman) => (
                <TableCell key={liman.id}>
                  {liman.ardiyesizGun > 7 ? "Düşük" : liman.ardiyesizGun > 5 ? "Orta" : "Yüksek"}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-gray-500">Karşılaştırma için liman seçin</div>
      )}
    </Card>
  )
}
