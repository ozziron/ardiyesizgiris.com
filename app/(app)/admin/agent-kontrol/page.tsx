"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiFetch } from "@/lib/api-client"
import {
  CheckCircle2,
  Clock,
  FileText,
  ListTodo,
  MessageSquare,
  Plus,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────

interface TicketFrontmatter {
  id?: string
  title?: string
  date?: string
  assignee?: string
  role?: string
  status?: string
  priority?: string
  type?: string
  sessions?: string
}

interface Ticket {
  id: string
  name: string
  status: string
  frontmatter: TicketFrontmatter
}

interface Request_ {
  id: string
  name: string
  status: string
  frontmatter: Record<string, string>
}

interface AgentState {
  tickets: Record<string, Ticket[]>
  counts: Record<string, number>
  requests: Record<string, Request_[]>
  requestCounts: Record<string, number>
  enums: {
    assignees: string[]
    roles: string[]
    priorities: string[]
    types: string[]
    statuses: string[]
  }
  generatedAt: string
}

// ─── Helpers ────────────────────────────────────────────

const priorityColors: Record<string, string> = {
  P0: "bg-red-500/15 text-red-600 border-red-500/30",
  P1: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  P2: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  P3: "bg-slate-500/15 text-slate-600 border-slate-500/30",
}

const typeLabels: Record<string, string> = {
  feature: "Özellik",
  fix: "Düzeltme",
  refactor: "Yeniden Düzenleme",
  docs: "Doküman",
  chore: "Altyapı",
}

const statusLabels: Record<string, string> = {
  backlog: "Backlog",
  todo: "Yapılacak",
  "in-review": "İncelemede",
  done: "Tamamlandı",
}

const statusIcons: Record<string, typeof ListTodo> = {
  backlog: ListTodo,
  todo: Clock,
  "in-review": AlertCircle,
  done: CheckCircle2,
}

// ─── Page ───────────────────────────────────────────────

export default function AgentKontrolPage() {
  const [state, setState] = useState<AgentState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchState = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch("/api/admin/agent/state")
      if (!res.ok) throw new Error("Durum alınamadı")
      const json = await res.json()
      setState(json.data)
    } catch (e: any) {
      setError(e.message || "Bilinmeyen hata")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchState()
  }, [fetchState])

  const runAction = async (endpoint: string, body: Record<string, unknown>) => {
    setActionLoading(body.action as string || "loading")
    try {
      const res = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.ok) {
        alert("Hata: " + (json.error || "Bilinmeyen"))
      }
      await fetchState()
    } catch (e: any) {
      alert("Bağlantı hatası: " + e.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleTicketAction = async (ticketId: string, action: string) => {
    await runAction(`/api/admin/agent/tickets/${ticketId}`, { action })
  }

  const handleRunCheck = async () => {
    await runAction("/api/admin/agent/run", { action: "check" })
  }

  // ─── New Ticket Form State ──────────────────────────────

  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newTicket, setNewTicket] = useState({
    title: "",
    priority: "P2",
    type: "feature",
    assignee: "claude",
    role: "developer",
  })

  const handleCreateTicket = async () => {
    if (!newTicket.title.trim()) return
    await runAction("/api/admin/agent/tickets", {
      title: newTicket.title,
      priority: newTicket.priority,
      type: newTicket.type,
      assignee: newTicket.assignee,
      role: newTicket.role,
    })
    setShowNewTicket(false)
    setNewTicket({ title: "", priority: "P2", type: "feature", assignee: "claude", role: "developer" })
  }

  // ─── Loading State ──────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-slate-600 dark:text-slate-400">{error}</p>
        <Button variant="outline" onClick={fetchState}>Tekrar Dene</Button>
      </div>
    )
  }

  if (!state) return null

  const allTickets = Object.values(state.tickets).flat()
  const { enums } = state

  // ─── Render ─────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Agent Kontrol
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Ticket ve request yönetimi
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchState} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          <Button variant="outline" size="sm" onClick={handleRunCheck} disabled={actionLoading === "check"}>
            {actionLoading === "check" ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-1" />
            )}
            Check
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {state.enums.statuses.map((status) => {
          const Icon = statusIcons[status] || FileText
          const count = state.counts[status] || 0
          return (
            <Card key={status}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {statusLabels[status] || status}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{count}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tickets">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="tickets">
              <FileText className="h-4 w-4 mr-1" />
              Ticket'lar
            </TabsTrigger>
            <TabsTrigger value="requests">
              <MessageSquare className="h-4 w-4 mr-1" />
              Talepler
            </TabsTrigger>
          </TabsList>

          <Button
            size="sm"
            onClick={() => setShowNewTicket(!showNewTicket)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Yeni Ticket
          </Button>
        </div>

        {/* New Ticket Form */}
        {showNewTicket && (
          <Card className="mb-4 border-emerald-500/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <input
                  className="col-span-2 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Ticket başlığı..."
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                />
                <select
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                >
                  {enums.priorities.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newTicket.type}
                  onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value })}
                >
                  {enums.types.map((t) => (
                    <option key={t} value={t}>{typeLabels[t] || t}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleCreateTicket}
                    disabled={!newTicket.title.trim() || actionLoading !== null}
                  >
                    {actionLoading === "create" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : "Oluştur"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNewTicket(false)}
                  >
                    İptal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tickets Tab */}
        <TabsContent value="tickets">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {enums.statuses.map((status) => {
              const tickets = state.tickets[status] || []
              return (
                <div key={status} className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    {statusLabels[status] || status}
                    <Badge variant="secondary" className="ml-1 text-xs">{tickets.length}</Badge>
                  </h3>
                  {tickets.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-4">Boş</p>
                  )}
                  {tickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow text-sm">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-mono text-xs text-slate-400">{ticket.id}</span>
                          <div className="flex gap-1">
                            {ticket.frontmatter.priority && (
                              <Badge className={`text-[10px] border ${priorityColors[ticket.frontmatter.priority] || ""}`}>
                                {ticket.frontmatter.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white mb-2 line-clamp-2">
                          {ticket.frontmatter.title || ticket.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1 flex-wrap">
                            {ticket.frontmatter.type && (
                              <Badge variant="outline" className="text-[10px]">
                                {typeLabels[ticket.frontmatter.type] || ticket.frontmatter.type}
                              </Badge>
                            )}
                          </div>
                          {/* Action buttons based on status */}
                          <div className="flex gap-1">
                            {status === "backlog" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => handleTicketAction(ticket.id, "start")}
                                disabled={actionLoading !== null}
                              >
                                Başlat
                              </Button>
                            )}
                            {status === "todo" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => handleTicketAction(ticket.id, "backlog")}
                                >
                                  Geri Al
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => handleTicketAction(ticket.id, "review")}
                                >
                                  Review
                                </Button>
                              </>
                            )}
                            {status === "in-review" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs bg-emerald-500/10"
                                onClick={() => handleTicketAction(ticket.id, "done")}
                              >
                                Done
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <div className="grid grid-cols-1 gap-3">
            {(["pending", "promoted", "rejected"] as const).map((reqStatus) => {
              const reqs = state.requests[reqStatus] || []
              if (reqs.length === 0) return null
              return (
                <div key={reqStatus}>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 capitalize">
                    {reqStatus === "pending" ? "Bekleyen" : reqStatus === "promoted" ? "Ticket'a Çevrilen" : "Reddedilen"}
                    <Badge variant="secondary" className="ml-2 text-xs">{reqs.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    {reqs.map((req) => (
                      <Card key={req.id} className="text-sm">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <span className="font-mono text-xs text-slate-400 mr-2">{req.id}</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {req.frontmatter.title || req.name}
                            </span>
                          </div>
                          <div>
                            {req.frontmatter.promoted_to && (
                              <Badge variant="outline" className="text-xs">
                                → {req.frontmatter.promoted_to}
                              </Badge>
                            )}
                            {req.frontmatter.rejected_reason && (
                              <span className="text-xs text-red-500 italic">
                                {req.frontmatter.rejected_reason}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
            {(!state.requests.pending?.length && !state.requests.promoted?.length && !state.requests.rejected?.length) && (
              <p className="text-sm text-slate-400 italic py-8 text-center">Henüz talep yok.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
