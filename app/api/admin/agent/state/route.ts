import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import * as fs from "node:fs"
import * as path from "node:path"

const STATUSES = ["backlog", "todo", "in-review", "done"]
const PRIORITIES = ["P0", "P1", "P2", "P3"]
const TYPES = ["feature", "fix", "refactor", "docs", "chore"]
const ASSIGNEES = ["opus", "claude", "human", "unassigned"]
const ROLES = ["developer", "designer", "reviewer", "unassigned"]

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") return null
  return session
}

function parseFrontmatter(content: string) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { data: {} as Record<string, string>, body: content }
  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (pair) data[pair[1]] = pair[2]
  }
  return { data, body: content.slice(match[0].length) }
}

function readTickets(workspaceRoot: string) {
  const grouped: Record<string, unknown[]> = Object.fromEntries(STATUSES.map((s) => [s, []]))
  const ticketsDir = path.join(workspaceRoot, "tickets")

  for (const status of STATUSES) {
    const dir = path.join(ticketsDir, status)
    if (!fs.existsSync(dir)) continue

    for (const name of fs.readdirSync(dir)) {
      if (!/^TICKET-\d{3}-.+\.md$/.test(name)) continue

      const filePath = path.join(dir, name)
      const content = fs.readFileSync(filePath, "utf8").replace(/^﻿/, "")
      const parsed = parseFrontmatter(content)

      grouped[status].push({
        id: parsed.data.id || name.match(/^(TICKET-\d{3})/)?.[1] || name,
        name,
        status,
        frontmatter: parsed.data,
      })
    }
  }

  for (const status of STATUSES) {
    grouped[status].sort((a: any, b: any) => a.id.localeCompare(b.id))
  }

  return grouped
}

function readRequests(workspaceRoot: string) {
  const grouped: Record<string, unknown[]> = { pending: [], promoted: [], rejected: [] }
  const requestsDir = path.join(workspaceRoot, "requests")

  for (const status of ["pending", "promoted", "rejected"]) {
    const dir = path.join(requestsDir, status)
    if (!fs.existsSync(dir)) continue

    for (const name of fs.readdirSync(dir)) {
      if (!/^REQ-\d{3}-.+\.md$/.test(name)) continue

      const filePath = path.join(dir, name)
      const content = fs.readFileSync(filePath, "utf8").replace(/^﻿/, "")
      const parsed = parseFrontmatter(content)

      grouped[status].push({
        id: parsed.data.id,
        name,
        status,
        frontmatter: parsed.data,
      })
    }
  }

  return grouped
}

export async function GET() {
  const session = await checkAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const workspaceRoot = path.resolve(process.cwd(), "..")
    const tickets = readTickets(workspaceRoot)
    const requests = readRequests(workspaceRoot)

    const counts = Object.fromEntries(STATUSES.map((s) => [s, (tickets[s] as unknown[]).length]))
    const requestCounts = {
      pending: (requests.pending as unknown[]).length,
      promoted: (requests.promoted as unknown[]).length,
      rejected: (requests.rejected as unknown[]).length,
    }

    return NextResponse.json({
      data: {
        tickets,
        counts,
        requests,
        requestCounts,
        enums: {
          assignees: ASSIGNEES,
          roles: ROLES,
          priorities: PRIORITIES,
          types: TYPES,
          statuses: STATUSES,
        },
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Agent state fetch error:", error)
    return NextResponse.json({ error: "Agent durumu alınamadı" }, { status: 500 })
  }
}
