import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.APPOINTMENTS_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const date = searchParams.get("date") || ""
    const status = searchParams.get("status") || "all"
    const dentistId = searchParams.get("dentist") || "all"

    let sql = `
      SELECT a.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.patient_id,
        CONCAT(u.first_name, ' ', u.last_name) as dentist_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON a.dentist_id = u.id
      WHERE 1=1
    `
    const params: any[] = []

    if (search) {
      sql += ` AND (p.first_name LIKE ? OR p.last_name LIKE ? OR a.treatment_type LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (date) {
      sql += ` AND a.appointment_date = ?`
      params.push(date)
    }

    if (status !== "all") {
      sql += ` AND a.status = ?`
      params.push(status)
    }

    if (dentistId !== "all") {
      sql += ` AND a.dentist_id = ?`
      params.push(dentistId)
    }

    // If user is dentist, only show their appointments
    if (user.role === "dentist") {
      sql += ` AND a.dentist_id = ?`
      params.push(user.id)
    }

    sql += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`

    const appointments = await query(sql, params)
    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.APPOINTMENTS_CREATE)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to create appointments" },
        { status: 403 },
      )
    }

    const data = await request.json()

    const result = (await query(
      `INSERT INTO appointments (patient_id, dentist_id, appointment_date, appointment_time, 
       duration_minutes, treatment_type, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [
        data.patientId,
        data.dentistId,
        data.appointmentDate,
        data.appointmentTime,
        data.duration,
        data.treatmentType,
        data.notes,
      ],
    )) as any

    return NextResponse.json({ id: result.insertId })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
