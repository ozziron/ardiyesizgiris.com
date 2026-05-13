import { NextResponse } from "next/server"
import { z } from "zod"

const contactSchema = z.object({
  name: z.string().min(1, "Ad soyad zorunludur").max(100),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  subject: z.string().min(1, "Konu zorunludur").max(200),
  message: z.string().min(1, "Mesaj zorunludur").max(5000),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = contactSchema.parse(body)

    // Log the contact form submission
    console.log("Contact form submission:", {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      timestamp: new Date().toISOString(),
    })

    // TODO: Send notification email to admin when email service is configured
    // await sendContactNotification(validatedData)

    return NextResponse.json({
      success: true,
      message: "Mesajınız başarıyla gönderildi.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Doğrulama hatası", details: error.errors },
        { status: 400 },
      )
    }

    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin." },
      { status: 500 },
    )
  }
}
