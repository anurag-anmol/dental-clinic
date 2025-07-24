import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { fullName, email, phone, preferredDate, preferredTime, message } = data

    if (!fullName || !phone) {
      return NextResponse.json({ error: "Full name and phone number are required." }, { status: 400 })
    }

    const result = (await query(
      `INSERT INTO appointment_requests (full_name, email, phone, preferred_date, preferred_time, message, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'new')`,
      [fullName, email || null, phone, preferredDate || null, preferredTime || null, message || null],
    )) as any

    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error("Error submitting appointment request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
