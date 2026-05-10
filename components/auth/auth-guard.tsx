"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris")
    }
  }, [status, router])

  if (status === "loading") {
    return <div className="p-8 text-center">Yükleniyor...</div>
  }

  if (status === "unauthenticated") {
    return null
  }

  return <>{children}</>
}
