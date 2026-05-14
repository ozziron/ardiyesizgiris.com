"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ContainerTypeForm } from "@/components/admin/container-type-form"

interface ContainerTypeEditPageProps {
  params: Promise<{ id: string }>
}

interface ContainerTypeApiResponse {
  id: string
  code: string
  label: string
  displayOrder: number
  isActive: boolean
  notes?: string | null
}

export default function ContainerTypeEditPage({ params }: ContainerTypeEditPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [id, setId] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<ContainerTypeApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchType = async () => {
      try {
        const resolvedParams = await params
        setId(resolvedParams.id)

        const res = await fetch(`/api/admin/container-types/${resolvedParams.id}`)
        if (res.status === 404) {
          router.push("/admin/ekipman-tipleri")
          return
        }
        if (!res.ok) throw new Error("Kayıt yüklenemedi")

        const payload = await res.json()
        setInitialData(payload.data)
      } catch {
        toast({
          title: "Hata",
          description: "Ekipman tipi yüklenemedi",
          variant: "destructive",
        })
        router.push("/admin/ekipman-tipleri")
      } finally {
        setLoading(false)
      }
    }

    fetchType()
  }, [params, router, toast])

  if (loading || !id || !initialData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <ContainerTypeForm
      mode="edit"
      initialData={initialData}
      submitMethod="PUT"
      submitUrl={`/api/admin/container-types/${id}`}
    />
  )
}
