import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.PATIENTS_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const patient = (await query(
      `SELECT p.*, 
        (SELECT MAX(appointment_date) FROM appointments WHERE patient_id = p.id) as last_visit,
        (SELECT MIN(appointment_date) FROM appointments WHERE patient_id = p.id AND appointment_date > CURDATE()) as next_appointment
      FROM patients p
      WHERE p.id = ?`,
      [id],
    )) as any[]

    if (patient.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json(patient[0])
  } catch (error) {
    console.error("Error fetching patient:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.PATIENTS_EDIT)) {
      return NextResponse.json({ error: "Unauthorized - You don't have permission to edit patients" }, { status: 403 })
    }

    const { id } = params
    const data = await request.json()

    await query(
      `UPDATE patients SET 
       first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?, gender = ?, address = ?, 
       emergency_contact_name = ?, emergency_contact_phone = ?, insurance_provider = ?, 
       insurance_policy_number = ?, medical_history = ?, allergies = ?, current_medications = ?
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.PATIENTS_DELETE)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to delete patients" },
        { status: 403 },
      )
    }

    const { id } = params
    // Consider cascading deletes or preventing deletion if related records exist (appointments, invoices, etc.)
    await query("DELETE FROM patients WHERE id = ?", [id])
    return NextResponse.json({ message: "Patient deleted successfully" })
  } catch (error) {
    console.error("Error deleting patient:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
