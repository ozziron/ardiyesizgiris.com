import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { spawnSync } from "node:child_process"
import * as path from "node:path"

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") return null
  return session
}

const ALLOWED_ACTIONS = [
  "check", "sync-roadmap", "enrich-roadmap",
  "session-list", "session-current",
] as const

export async function POST(request: Request) {
  const session = await checkAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, args: extraArgs } = body

    if (!action || !ALLOWED_ACTIONS.includes(action)) {
      return NextResponse.json({ ok: false, error: "Geçersiz action" }, { status: 400 })
    }

    const workspaceRoot = path.resolve(process.cwd(), "..")
    const ticketCli = path.join(workspaceRoot, "main", "agents", "ticket.js")

    const args = action === "session-list" || action === "session-current"
      ? ["session", action === "session-list" ? "list" : "current"]
      : [action]

    if (extraArgs && Array.isArray(extraArgs)) args.push(...extraArgs)

    const result = spawnSync(process.execPath, [ticketCli, ...args], {
      cwd: workspaceRoot,
      encoding: "utf8",
      timeout: 60000,
    })

    return NextResponse.json({
      ok: result.status === 0,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
    })
  } catch (error) {
    console.error("Agent run error:", error)
    return NextResponse.json({ ok: false, error: "Komut çalıştırılamadı" }, { status: 500 })
  }
}
