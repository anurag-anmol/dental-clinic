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

        const treatmentPlans = await query(
            `SELECT tp.*,
        CONCAT(u.first_name, ' ', u.last_name) as dentist_name
      FROM treatment_plans tp
      JOIN users u ON tp.dentist_id = u.id
      WHERE tp.patient_id = ?
      ORDER BY tp.created_at DESC`,
            [id],
        )

        return NextResponse.json(treatmentPlans)
    } catch (error) {
        console.error("Error fetching patient treatment plans:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
