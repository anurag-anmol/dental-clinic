import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"
import { Erica_One } from "next/font/google"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    // Fetch medicines for the treatment
    const medicines = (await query("SELECT * FROM treatment_medicines WHERE treatment_id = ? ORDER BY created_at ASC", [
      id,
    ])) as any[]

    return NextResponse.json(medicines)
  } catch (error) {
    console.error("Error fetching treatment medicines:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_EDIT)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await context.params
    const { medicines } = await request.json()

    // Delete existing medicines for this treatment
    await query("DELETE FROM treatment_medicines WHERE treatment_id = ?", [id])

    // Insert new medicines
    for (const medicine of medicines) {
      await query(
        `INSERT INTO treatment_medicines (treatment_id, medicine_name, new_medicines_name, dosage, frequency, duration, instructions, quantity, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?,?, NOW())`,
        [
          id,
          medicine.name,
          medicine.newName,
          medicine.dosage,
          medicine.frequency,
          medicine.duration || null,
          medicine.instructions || null,
          medicine.quantity || 1,
        ],
      )
    }

    return NextResponse.json({ message: "Medicines saved successfully" })
  } catch (error) {
    console.error("Error saving treatment medicines:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 },)
  }
}
