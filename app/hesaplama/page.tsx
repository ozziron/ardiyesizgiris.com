'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const formatLocalDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
};

export default function HesaplamaPage() {
  const [liman, setLiman] = useState("");
  const [hat, setHat] = useState("");
  const [kalkisTarihi, setKalkisTarihi] = useState("");
  const [gateInTarihi, setGateInTarihi] = useState("");
  const [sonuc, setSonuc] = useState<null | { freeDays: number; freeUntil: string; daysLeft: number }>(null);

 const handleHesapla = () => {
  const fetchData = async () => {
    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          liman,
          hat,
          kalkisTarihi,
          gateInTarihi: gateInTarihi || null,
        }),
      });
      if (!response.ok) throw new Error("API isteği başarısız");
      const data = await response.json();
      setSonuc(data);
    } catch (error) {
      console.error(error);
      alert("Hesaplama sırasında bir hata oluştu.");
    }
  };
  fetchData();
};

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="ardiye">
        <TabsList>
          <TabsTrigger value="ardiye">Ardiye Hesaplama</TabsTrigger>
          <TabsTrigger value="detention">Detention Hesaplama</TabsTrigger>
        </TabsList>

        <TabsContent value="ardiye">
          <Card>
            <CardHeader>
              <CardTitle>Ardiye Hesaplama</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Liman</Label>
                <Select onValueChange={setLiman}>
                  <SelectTrigger>
                    <SelectValue placeholder="Liman seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ambarli">Ambarlı</SelectItem>
                    <SelectItem value="Mersin">Mersin</SelectItem>
                    <SelectItem value="Izmir">İzmir</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Hat (Carrier)</Label>
                <Select onValueChange={setHat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hat seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maersk">Maersk</SelectItem>
                    <SelectItem value="MSC">MSC</SelectItem>
                    <SelectItem value="CMA CGM">CMA CGM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Gemi Kalkış Tarihi</Label>
                <Input type="date" value={kalkisTarihi} onChange={(e) => setKalkisTarihi(e.target.value)} />
              </div>

              <div>
                <Label>Gate-in Tarihi (Opsiyonel)</Label>
                <Input type="date" value={gateInTarihi} onChange={(e) => setGateInTarihi(e.target.value)} />
              </div>

             <Button onClick={handleHesapla} className="w-full">Hesapla</Button>
                {sonuc && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Hesaplama Sonucu</CardTitle>
                    </CardHeader>
                  <CardContent className="space-y-2">
                      <p>Free Time Süresi: {sonuc.freeDays} Gün</p>
                      <p>Ardiyesiz Giriş Tarihi: {format(new Date(sonuc.freeUntil), "dd.MM.yyyy")}</p>
                  </CardContent>
                  </Card>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detention">
          <Card>
            <CardHeader>
              <CardTitle>Detention Hesaplama</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Aynı form burada da kullanılabilir, ama şimdilik boş */}
              <p>Detention hesaplama formu buraya gelecek.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
