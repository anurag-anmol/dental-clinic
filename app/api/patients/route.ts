import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.PATIENTS_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    let sql = `
      SELECT * FROM patients
      WHERE 1=1
    `
    const params: any[] = []

    if (search) {
      sql += ` AND (first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR patient_id LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    sql += ` ORDER BY created_at DESC`

    const patients = await query(sql, params)
    return NextResponse.json(patients)
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.PATIENTS_CREATE)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to create patients" },
        { status: 403 },
      )
    }

    const data = await request.json()

    // Generate patient ID
    const lastPatient = (await query("SELECT patient_id FROM patients ORDER BY id DESC LIMIT 1")) as any[]

    let nextPatientNumber = 1
    if (lastPatient.length > 0) {
      const lastId = lastPatient[0].patient_id
      const lastNumber = Number.parseInt(lastId.replace("P", ""))
      nextPatientNumber = lastNumber + 1
    }

    const patientId = `P${nextPatientNumber.toString().padStart(4, "0")}`

    const result = (await query(
      `INSERT INTO patients (
        patient_id, first_name, last_name, email, phone, date_of_birth, gender, address,
        emergency_contact_name, emergency_contact_phone, insurance_provider, 
        insurance_policy_number, medical_history, allergies, current_medications
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        data.firstName,
        data.lastName,
        data.email,
        data.phone,
        data.dateOfBirth,
        data.gender,
        data.address,
        data.emergencyContactName,
        data.emergencyContactPhone,
        data.insuranceProvider,
        data.insurancePolicyNumber,
        data.medicalHistory,
        data.allergies,
        data.currentMedications,
      ],
    )) as any

    return NextResponse.json({
      id: result.insertId,
      patient_id: patientId,
      message: "Patient created successfully",
    })
  } catch (error) {
    console.error("Error creating patient:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
