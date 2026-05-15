"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TariffRuleForm } from "@/components/admin/tariff-rule-form"

interface TariffRuleEditPageProps {
  params: Promise<{ id: string }>
}

interface TariffRuleApiResponse {
  id: string
  portId: string
  shippingCompanyId: string
  containerType: string
  tier1DaysFrom: number
  tier1DaysTo: number
  tier1PricePerDay: number | string
  tier2DaysFrom: number
  tier2DaysTo: number
  tier2PricePerDay: number | string
  tier3DaysFrom: number
  tier3PricePerDay: number | string
  currency: string
  effectiveFrom: string
  effectiveUntil: string | null
  isActive: boolean
  notes?: string | null
}

export default function TariffRuleEditPage({ params }: TariffRuleEditPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [ruleId, setRuleId] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<TariffRuleApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRule = async () => {
      try {
        const resolvedParams = await params
        setRuleId(resolvedParams.id)

        const response = await fetch(`/api/admin/tariff-rules/${resolvedParams.id}`)
        if (response.status === 404) {
          router.push("/admin/ucret-tarifeleri")
          return
        }
        if (!response.ok) throw new Error("Kayıt yüklenemedi")

        const payload = await response.json()
        const rule = payload.data
        setInitialData({
          ...rule,
          tier1PricePerDay: Number(rule.tier1PricePerDay),
          tier2PricePerDay: Number(rule.tier2PricePerDay),
          tier3PricePerDay: Number(rule.tier3PricePerDay),
          effectiveFrom: new Date(rule.effectiveFrom).toISOString().split("T")[0],
          effectiveUntil: rule.effectiveUntil
            ? new Date(rule.effectiveUntil).toISOString().split("T")[0]
            : null,
        })
      } catch (error) {
        toast({
          title: "Hata",
          description: "Tarife bilgisi yüklenemedi",
          variant: "destructive",
        })
        router.push("/admin/ucret-tarifeleri")
      } finally {
        setLoading(false)
      }
    }

    fetchRule()
  }, [params, router, toast])

  if (loading || !ruleId || !initialData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <TariffRuleForm
      mode="edit"
      initialData={initialData}
      submitMethod="PUT"
      submitUrl={`/api/admin/tariff-rules/${ruleId}`}
    />
  )
}
