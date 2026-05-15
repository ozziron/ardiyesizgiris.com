"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { AlertCircle, KeyRound, Plus, RefreshCw, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type TeamMember = {
  id: string
  role: string
  user: {
    name?: string | null
    email?: string | null
  }
}

type ApiKey = {
  id: string
  name: string
  keyPrefix: string
  lastUsedAt?: string | null
  createdAt: string
}

type Team = {
  id: string
  name: string
  members: TeamMember[]
  apiKeys: ApiKey[]
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "-"
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function CorporatePage() {
  const { status } = useSession()
  const [team, setTeam] = useState<Team | null>(null)
  const [error, setError] = useState("")
  const [keyName, setKeyName] = useState("Production API")
  const [newApiKey, setNewApiKey] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingKey, setIsCreatingKey] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)

  const loadTeam = async () => {
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/corporate/team")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Kurumsal takım bilgisi alınamadı.")
      }

      setTeam(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kurumsal takım bilgisi alınamadı.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status !== "loading") {
      loadTeam()
    }
  }, [status])

  const createApiKey = async () => {
    setError("")
    setNewApiKey("")
    setIsCreatingKey(true)

    try {
      const response = await fetch("/api/corporate/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "API anahtarı oluşturulamadı.")
      }

      setNewApiKey(data.data.apiKey)
      await loadTeam()
    } catch (err) {
      setError(err instanceof Error ? err.message : "API anahtarı oluşturulamadı.")
    } finally {
      setIsCreatingKey(false)
    }
  }

  const addMember = async () => {
    setError("")
    setIsAddingMember(true)

    try {
      const response = await fetch("/api/corporate/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: "MEMBER" }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Takım üyesi eklenemedi.")
      }

      setInviteEmail("")
      await loadTeam()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Takım üyesi eklenemedi.")
    } finally {
      setIsAddingMember(false)
    }
  }

  return (
    <div className="container mx-auto px-4 pb-12 pt-28">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-3">
          <Badge variant="outline" className="w-fit">
            Corporate
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Kurumsal Erişim
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Takım üyelerinizi yönetin ve kurumsal API hesaplama erişimi için anahtar oluşturun.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>İşlem yapılamadı</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Kurumsal bilgiler yükleniyor...
            </CardContent>
          </Card>
        ) : team ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  {team.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium">{member.user.name || member.user.email}</p>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 border-t pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <Label htmlFor="inviteEmail">Takım üyesi email</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      value={inviteEmail}
                      onChange={(event) => setInviteEmail(event.target.value)}
                      placeholder="operasyon@firma.com"
                    />
                  </div>
                  <Button type="button" onClick={addMember} disabled={isAddingMember || !inviteEmail.trim()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-emerald-600" />
                  API Anahtarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {newApiKey && (
                  <Alert>
                    <KeyRound className="h-4 w-4" />
                    <AlertTitle>Yeni API anahtarı</AlertTitle>
                    <AlertDescription className="break-all font-mono text-xs">{newApiKey}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="keyName">Anahtar adı</Label>
                  <Input id="keyName" value={keyName} onChange={(event) => setKeyName(event.target.value)} />
                  <Button type="button" onClick={createApiKey} disabled={isCreatingKey || !keyName.trim()} className="w-full gap-2">
                    <KeyRound className="h-4 w-4" />
                    {isCreatingKey ? "Oluşturuluyor..." : "API Anahtarı Oluştur"}
                  </Button>
                </div>

                <div className="space-y-3">
                  {team.apiKeys.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Henüz aktif API anahtarı yok.</p>
                  ) : (
                    team.apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="rounded-md border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{apiKey.name}</p>
                          <Badge variant="outline">{apiKey.keyPrefix}</Badge>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Son kullanım: {formatDateTime(apiKey.lastUsedAt)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}
