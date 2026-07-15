import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { spawnSync } from "node:child_process"
import * as path from "node:path"

async function checkAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") return null
  return session
}

export async function POST(request: Request) {
  const session = await checkAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, priority, type, assignee, role } = body

    if (!title) {
      return NextResponse.json({ ok: false, error: "Başlık gerekli" }, { status: 400 })
    }

    const workspaceRoot = path.resolve(process.cwd(), "..")
    const ticketCli = path.join(workspaceRoot, "main", "agents", "ticket.js")

    const args = ["new", title]
    if (priority) args.push("--priority", priority)
    if (type) args.push("--type", type)
    if (assignee) args.push("--assignee", assignee)
    if (role) args.push("--role", role)

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

    return NextResponse.json({ ok: true, stdout: result.stdout.trim() }, { status: 201 })
  } catch (error) {
    console.error("Ticket create error:", error)
    return NextResponse.json({ ok: false, error: "Ticket oluşturulamadı" }, { status: 500 })
  }
}
