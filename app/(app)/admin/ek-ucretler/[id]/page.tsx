"use client"

import { useEffect, useState, use } from "react"
import { Loader2 } from "lucide-react"
import { CarrierSurchargeForm } from "@/components/admin/carrier-surcharge-form"

interface SurchargeData {
  id: string
  shippingCompanyId: string
  name: string
  description?: string | null
  amount: number
  currency: string
  applyType: string
  containerTypes: string[]
  isActive: boolean
  shippingCompany: {
    id: string
    name: string
    code: string
  }
}

export default function EditCarrierSurchargePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [data, setData] = useState<SurchargeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/carrier-surcharges/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error)
        } else {
          setData(d.data)
        }
      })
      .catch(() => setError("Ek ücret yüklenemedi"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">{error || "Ek ücret bulunamadı"}</p>
      </div>
    )
  }

  return (
    <CarrierSurchargeForm
      mode="edit"
      initialData={{
        shippingCompanyId: data.shippingCompanyId,
        name: data.name,
        description: data.description,
        amount: Number(data.amount),
        currency: data.currency,
        applyType: data.applyType,
        containerTypes: data.containerTypes,
        isActive: data.isActive,
      }}
      submitMethod="PUT"
      submitUrl={`/api/admin/carrier-surcharges/${id}`}
    />
  )
}
