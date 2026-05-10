import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import bcryptjs from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("Geçerli bir email girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  name: z.string().optional(),
  companyName: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email zaten kayıtlı" },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcryptjs.hash(validatedData.password, 10)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash: hashedPassword,
        name: validatedData.name,
        companyName: validatedData.companyName,
        role: "USER",
        membershipType: "FREE",
      },
    })
    
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Doğrulama hatası", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu" },
      { status: 500 }
    )
  }
}
