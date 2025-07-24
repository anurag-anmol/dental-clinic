import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const patientId = searchParams.get("patient") || "all"

    let sql = `
      SELECT t.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.patient_id,
        CONCAT(u.first_name, ' ', u.last_name) as dentist_name,
        tp.diagnosis,
        tp.treatment_description as plan_description
      FROM treatments t
      JOIN patients p ON t.patient_id = p.id
      JOIN users u ON t.dentist_id = u.id
      LEFT JOIN treatment_plans tp ON t.treatment_plan_id = tp.id
      WHERE 1=1
    `
    const params: any[] = []

    if (search) {
      sql += ` AND (p.first_name LIKE ? OR p.last_name LIKE ? OR t.treatment_name LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (status !== "all") {
      sql += ` AND t.status = ?`
      params.push(status)
    }

    if (patientId !== "all") {
      sql += ` AND t.patient_id = ?`
      params.push(patientId)
    }

    // If user is dentist, only show their treatments
    if (user.role === "dentist") {
      sql += ` AND t.dentist_id = ?`
      params.push(user.id)
    }

    sql += ` ORDER BY t.treatment_date DESC`

    const treatments = await query(sql, params)
    return NextResponse.json(treatments)
  } catch (error) {
    console.error("Error fetching treatments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_CREATE)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to create treatments" },
        { status: 403 },
      )
    }

    const data = await request.json()

    const result = (await query(
      `INSERT INTO treatments (patient_id, dentist_id, treatment_plan_id, treatment_name, 
       treatment_date, tooth_number, procedure_notes, cost, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.patientId,
        data.dentistId,
        data.treatmentPlanId || null,
        data.treatmentName,
        data.treatmentDate,
        data.toothNumber,
        data.procedureNotes,
        data.cost,
        data.status || "completed",
      ],
    )) as any

    return NextResponse.json({ id: result.insertId })
  } catch (error) {
    console.error("Error creating treatment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
