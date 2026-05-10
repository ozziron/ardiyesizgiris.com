"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Anchor, Ship, Zap, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    ports: 0,
    carriers: 0,
    calculations: 0,
  })

  useEffect(() => {
    // Fetch stats
    const fetchStats = async () => {
      try {
        const portCount = await fetch("/api/admin/ports").then(r => r.json())
        setStats(prev => ({
          ...prev,
          ports: Array.isArray(portCount.data) ? portCount.data.length : 0,
        }))
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  const dashboardCards = [
    {
      label: "Limanlar",
      value: stats.ports,
      icon: Anchor,
      href: "/admin/limanlar",
      color: "bg-blue-500",
    },
    {
      label: "Gemiler",
      value: stats.carriers,
      icon: Ship,
      href: "/admin/gemiler",
      color: "bg-green-500",
    },
    {
      label: "Muafiyet Kuralları",
      value: "-",
      icon: Zap,
      href: "/admin/muafiyet-kurallari",
      color: "bg-yellow-500",
    },
    {
      label: "Ücret Tarifeleri",
      value: "-",
      icon: TrendingUp,
      href: "/admin/ucret-tarifeleri",
      color: "bg-purple-500",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Sistemi yönetin ve verilerinizi kontrol edin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.href} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {card.label}
                  </CardTitle>
                  <div className={`${card.color} p-2 rounded-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {card.value}
                </div>
                <Link href={card.href}>
                  <p className="text-xs text-emerald-600 hover:text-emerald-700 mt-2">
                    Yönet →
                  </p>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button asChild variant="default">
            <Link href="/admin/limanlar?action=create">Yeni Liman Ekle</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/gemiler?action=create">Yeni Gemi Ekle</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/muafiyet-kurallari?action=create">Muafiyet Kuralı Ekle</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/ucret-tarifeleri?action=create">Ücret Tarifesi Ekle</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
