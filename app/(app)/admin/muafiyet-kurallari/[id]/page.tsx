"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FreeTimeRuleForm } from "@/components/admin/free-time-rule-form"

interface FreeTimeRuleEditPageProps {
  params: Promise<{ id: string }>
}

interface FreeTimeRuleApiResponse {
  id: string
  portId: string
  shippingCompanyId: string
  containerType: string
  freeDays: number
  effectiveFrom: string
  effectiveUntil: string | null
  isActive: boolean
  notes?: string | null
}

export default function FreeTimeRuleEditPage({ params }: FreeTimeRuleEditPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [ruleId, setRuleId] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<FreeTimeRuleApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRule = async () => {
      try {
        const resolvedParams = await params
        setRuleId(resolvedParams.id)

        const response = await fetch(`/api/admin/free-time-rules/${resolvedParams.id}`)
        if (response.status === 404) {
          router.push("/admin/muafiyet-kurallari")
          return
        }
        if (!response.ok) throw new Error("Kayit yuklenemedi")

        const payload = await response.json()
        const rule = payload.data
        setInitialData({
          ...rule,
          effectiveFrom: new Date(rule.effectiveFrom).toISOString().split("T")[0],
          effectiveUntil: rule.effectiveUntil
            ? new Date(rule.effectiveUntil).toISOString().split("T")[0]
            : null,
        })
      } catch (error) {
        toast({
          title: "Hata",
          description: "Muafiyet kurali yuklenemedi",
          variant: "destructive",
        })
        router.push("/admin/muafiyet-kurallari")
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
    <FreeTimeRuleForm
      mode="edit"
      initialData={initialData}
      submitMethod="PUT"
      submitUrl={`/api/admin/free-time-rules/${ruleId}`}
    />
  )
}
