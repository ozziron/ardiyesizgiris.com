import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { portFormSchema } from "@/lib/validation/schemas"

async function checkAdmin() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return null
  }
  return session
}

export async function GET() {
  const session = await checkAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const ports = await prisma.port.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ data: ports })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ports" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await checkAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = portFormSchema.parse(body)

    const port = await prisma.port.create({
      data: {
        ...validatedData,
        createdBy: session.user?.id ?? "",
      },
    })

    return NextResponse.json({ data: port }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create port" }, { status: 400 })
  }
}
