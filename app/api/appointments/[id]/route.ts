import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.APPOINTMENTS_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const appointment = (await query(
      `SELECT a.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.patient_id,
        CONCAT(u.first_name, ' ', u.last_name) as dentist_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON a.dentist_id = u.id
      WHERE a.id = ?`,
      [id],
    )) as any[]

    if (appointment.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // If user is dentist, ensure they can only view their own appointments
    if (user.role === "dentist" && appointment[0].dentist_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(appointment[0])
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.APPOINTMENTS_EDIT)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to edit appointments" },
        { status: 403 },
      )
    }

    const { id } = params
    const data = await request.json()

    const {
      patientId,
      dentistId,
      appointmentDate,
      appointmentTime,
      duration,
      treatmentType,
      status,
      notes,
    } = data

    // Validate required fields
    if (!patientId || !dentistId || !appointmentDate || !appointmentTime || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // If user is dentist, ensure they can only edit their own appointments
    if (user.role === "dentist") {
      const existingAppointment = (await query("SELECT dentist_id FROM appointments WHERE id = ?", [id])) as any[]
      if (existingAppointment.length === 0 || existingAppointment[0].dentist_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    // Execute update
    await query(
      `UPDATE appointments SET 
        patient_id = ?, 
        dentist_id = ?, 
        appointment_date = ?, 
        appointment_time = ?, 
        duration_minutes = ?, 
        treatment_type = ?, 
        status = ?, 
        notes = ?
       WHERE id = ?`,
      [
        patientId,
        dentistId,
        appointmentDate,
        appointmentTime,
        duration,
        treatmentType ?? null, // Convert undefined → null
        status ?? null,
        notes ?? null,
        id,
      ]
    )

    return NextResponse.json({ message: "Appointment updated successfully" })
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.APPOINTMENTS_DELETE)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to delete appointments" },
        { status: 403 },
      )
    }

    const { id } = params

    // If user is dentist, ensure they can only delete their own appointments
    if (user.role === "dentist") {
      const existingAppointment = (await query("SELECT dentist_id FROM appointments WHERE id = ?", [id])) as any[]
      if (existingAppointment.length === 0 || existingAppointment[0].dentist_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    await query("DELETE FROM appointments WHERE id = ?", [id])
    return NextResponse.json({ message: "Appointment deleted successfully" })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
