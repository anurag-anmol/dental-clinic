import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser()
        if (!user || !hasPermission(user.role, PERMISSIONS.APPOINTMENTS_VIEW)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await context.params

        const appointments = await query(
            `SELECT a.*,
        CONCAT(u.first_name, ' ', u.last_name) as dentist_name
      FROM appointments a
      JOIN users u ON a.dentist_id = u.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
            [id],
        )

        return NextResponse.json(appointments)
    } catch (error) {
        console.error("Error fetching patient appointments:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
