"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith("/admin")

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdminRoute && <Header />}
      <main className="flex-1">{children}</main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}
