import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.PATIENTS_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const patient = (await query("SELECT * FROM patients WHERE id = ?", [id])) as any[]

    if (patient.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json(patient[0])
  } catch (error) {
    console.error("Error fetching patient:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.PATIENTS_EDIT)) {
      return NextResponse.json({ error: "Unauthorized - You don't have permission to edit patients" }, { status: 403 })
    }

    const { id } = await context.params
    const data = await request.json()

    // Check if patient exists
    const existingPatient = (await query("SELECT id FROM patients WHERE id = ?", [id])) as any[]
    if (existingPatient.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    await query(
      `UPDATE patients SET
        first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?, 
        gender = ?, address = ?, emergency_contact_name = ?, emergency_contact_phone = ?,
        insurance_provider = ?, insurance_policy_number = ?, medical_history = ?,
        allergies = ?, current_medications = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
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
        id,
      ],
    )

    return NextResponse.json({ message: "Patient updated successfully" })
  } catch (error) {
    console.error("Error updating patient:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.PATIENTS_DELETE)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to delete patients" },
        { status: 403 },
      )
    }

    const { id } = await context.params

    // Check if patient exists
    const existingPatient = (await query("SELECT id FROM patients WHERE id = ?", [id])) as any[]
    if (existingPatient.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Check if patient has any treatments, appointments, etc.
    const hasRecords = (await query(
      `SELECT
        (SELECT COUNT(*) FROM treatments WHERE patient_id = ?) +
        (SELECT COUNT(*) FROM appointments WHERE patient_id = ?) +
        (SELECT COUNT(*) FROM treatment_plans WHERE patient_id = ?) as total_records`,
      [id, id, id],
    )) as any[]

    if (hasRecords[0].total_records > 0) {
      return NextResponse.json(
        { error: "Cannot delete patient with existing treatments, appointments, or treatment plans" },
        { status: 400 },
      )
    }

    await query("DELETE FROM patients WHERE id = ?", [id])
    return NextResponse.json({ message: "Patient deleted successfully" })
  } catch (error) {
    console.error("Error deleting patient:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
