import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { spawnSync } from "node:child_process"
import * as path from "node:path"

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") return null
  return session
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body // "start", "backlog", "review", "done"

    if (!action || !["start", "backlog", "review", "done"].includes(action)) {
      return NextResponse.json({ ok: false, error: "Geçersiz action" }, { status: 400 })
    }

    const workspaceRoot = path.resolve(process.cwd(), "..")
    const ticketCli = path.join(workspaceRoot, "main", "agents", "ticket.js")

    const args = [action, id]
    if (body.assignee) args.push("--assignee", body.assignee)
    if (body.role) args.push("--role", body.role)
    if (body.reviewer) args.push("--reviewer", body.reviewer)
    if (body.commit) args.push("--commit", body.commit)
    if (body.note) args.push("--note", body.note)

    const result = spawnSync(process.execPath, [ticketCli, ...args], {
      cwd: workspaceRoot,
      encoding: "utf8",
      timeout: 30000,
    })

    if (result.status !== 0) {
      return NextResponse.json(
        { ok: false, error: result.stderr || result.stdout },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true, stdout: result.stdout.trim() })
  } catch (error) {
    console.error("Ticket update error:", error)
    return NextResponse.json({ ok: false, error: "Ticket güncellenemedi" }, { status: 500 })
  }
}
