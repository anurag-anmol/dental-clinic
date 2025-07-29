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
    const treatment = (await query(
      `SELECT t.*,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.patient_id,
        p.id as patient_db_id,
        CONCAT(u.first_name, ' ', u.last_name) as dentist_name,
        tp.diagnosis,
        tp.treatment_description as plan_description
      FROM treatments t
      JOIN patients p ON t.patient_id = p.id
      JOIN users u ON t.dentist_id = u.id
      LEFT JOIN treatment_plans tp ON t.treatment_plan_id = tp.id
      WHERE t.id = ?`,
      [id],
    )) as any[]

    if (treatment.length === 0) {
      return NextResponse.json({ error: "Treatment not found" }, { status: 404 })
    }

    // If user is dentist, ensure they can only view their own treatments
    if (user.role === "dentist" && treatment[0].dentist_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Fetch treatment photos
    const photos = (await query(
      "SELECT photo_url FROM treatment_photos WHERE treatment_id = ? ORDER BY created_at ASC",
      [id],
    )) as any[]

    const treatmentWithPhotos = {
      ...treatment[0],
      photos: photos.map((p) => p.photo_url),
    }

    return NextResponse.json(treatmentWithPhotos)
  } catch (error) {
    console.error("Error fetching treatment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_EDIT)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to edit treatments" },
        { status: 403 },
      )
    }

    const { id } = await context.params
    const body = await req.json()

    // Get current treatment to get the actual patient_id
    const currentTreatment = (await query("SELECT patient_id, dentist_id FROM treatments WHERE id = ?", [id])) as any[]
    if (currentTreatment.length === 0) {
      return NextResponse.json({ error: "Treatment not found" }, { status: 404 })
    }

    // If user is dentist, ensure they can only edit their own treatments
    if (user.role === "dentist" && currentTreatment[0].dentist_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const {
      patientId,
      dentistId,
      treatmentPlanId,
      treatmentName,
      treatmentType,
      treatmentDate,
      toothNumber,
      procedureNotes,
      cost,
      status,
    } = body

    // Use current patient_id if patientId is null or undefined
    const finalPatientId = patientId || currentTreatment[0].patient_id
    const finalDentistId = dentistId || currentTreatment[0].dentist_id

    const result = await query(
      `
      UPDATE treatments
      SET
        patient_id = ?,
        dentist_id = ?,
        treatment_plan_id = ?,
        treatment_name = ?,
        treatment_type = ?,
        treatment_date = ?,
        tooth_number = ?,
        procedure_notes = ?,
        cost = ?,
        status = ?
      WHERE id = ?
      `,
      [
        finalPatientId,
        finalDentistId,
        treatmentPlanId || null,
        treatmentName,
        treatmentType || null,
        treatmentDate,
        toothNumber || null,
        procedureNotes || null,
        cost || null,
        status,
        id,
      ],
    )

    return NextResponse.json({ success: true, result })
  } catch (err: any) {
    console.error("Update error:", err)
    return NextResponse.json({ error: "Failed to update treatment." }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_DELETE)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to delete treatments" },
        { status: 403 },
      )
    }

    const { id } = await context.params

    // If user is dentist, ensure they can only delete their own treatments
    if (user.role === "dentist") {
      const existingTreatment = (await query("SELECT dentist_id FROM treatments WHERE id = ?", [id])) as any[]
      if (existingTreatment.length === 0 || existingTreatment[0].dentist_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    // Delete treatment photos first
    await query("DELETE FROM treatment_photos WHERE treatment_id = ?", [id])

    // Delete treatment
    await query("DELETE FROM treatments WHERE id = ?", [id])

    return NextResponse.json({ message: "Treatment deleted successfully" })
  } catch (error) {
    console.error("Error deleting treatment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
