import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const tests = await query(
      `SELECT tt.*, t.normal_range, t.price 
       FROM treatment_tests tt
       LEFT JOIN tests t ON tt.test_id = t.id
       WHERE tt.treatment_id = ?
       ORDER BY tt.created_at ASC`,
      [id],
    )

    return NextResponse.json(tests)
  } catch (error) {
    console.error("Error fetching treatment tests:", error)
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
    const data = await request.json()

    const result = await query(
      `INSERT INTO treatment_tests (treatment_id, test_id, test_name, category, instructions, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.testId || null, data.testName, data.category, data.instructions, "requested"],
    )

    return NextResponse.json({ id: (result as any).insertId })
  } catch (error) {
    console.error("Error adding test:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
