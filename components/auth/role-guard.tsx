"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: "ADMIN" | "USER"
}

export function RoleGuard({ children, requiredRole = "ADMIN" }: RoleGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/giris")
      return
    }

    const userRole = (session?.user as any)?.role
    if (requiredRole && userRole !== requiredRole) {
      router.push("/")
    }
  }, [status, session, router, requiredRole])

  if (status === "loading") {
    return <div className="p-8 text-center">Yükleniyor...</div>
  }

  const userRole = (session?.user as any)?.role
  if (requiredRole && userRole !== requiredRole) {
    return null
  }

  return <>{children}</>
}
