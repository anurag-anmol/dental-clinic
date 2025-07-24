import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = context.params
    const treatment = (await query(
      `SELECT t.*, 
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.patient_id,
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

    return NextResponse.json(treatment[0])
  } catch (error) {
    console.error("Error fetching treatment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// export async function PUT(request: NextRequest, context: { params: { id: string } }) {
//   try {
//     const user = await getCurrentUser()
//     if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_EDIT)) {
//       return NextResponse.json(
//         { error: "Unauthorized - You don't have permission to edit treatments" },
//         { status: 403 },
//       )
//     }

//     const { id } = context.params
//     const data = await request.json()

//     // If user is dentist, ensure they can only edit their own treatments
//     if (user.role === "dentist") {
//       const existingTreatment = (await query("SELECT dentist_id FROM treatments WHERE id = ?", [id])) as any[]
//       if (existingTreatment.length === 0 || existingTreatment[0].dentist_id !== user.id) {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
//       }
//     }

//     await query(
//       `UPDATE treatments SET 
//        patient_id = ?, dentist_id = ?, treatment_plan_id = ?, treatment_name = ?, 
//        treatment_date = ?, tooth_number = ?, procedure_notes = ?, cost = ?, status = ?
//        WHERE id = ?`,
//       [
//         data.patientId,
//         data.dentistId,
//         data.treatmentPlanId || null,
//         data.treatmentName,
//         data.treatmentDate,
//         data.toothNumber || null,
//         data.procedureNotes || null,
//         data.cost || null,
//         data.status,
//         id,
//       ],
//     )
//     console.log("update", data);
//     console.log("updateId", id);


//     return NextResponse.json({ message: "Treatment updated successfully" })
//   } catch (error) {
//     console.error("Error updating treatment:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_EDIT)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    const id = context.params
    const data = await request.json()

    // Validate required fields
    if (!id || !data.patientId || !data.dentistId || !data.treatmentName || !data.treatmentDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // If dentist, check ownership
    if (user.role === "dentist") {
      const [row] = (await query("SELECT dentist_id FROM treatments WHERE id = ?", [id])) as any[]
      if (!row || row.dentist_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    await query(
      `UPDATE treatments SET 
       patient_id = ?, dentist_id = ?, treatment_plan_id = ?, treatment_name = ?, 
       treatment_date = ?, tooth_number = ?, procedure_notes = ?, cost = ?, status = ?
       WHERE id = ?`,
      [
        data.patientId,
        data.dentistId,
        data.treatmentPlanId || null,
        data.treatmentName,
        data.treatmentDate,
        data.toothNumber || null,
        data.procedureNotes || null,
        data.cost !== undefined && data.cost !== '' ? Number(data.cost) : null,
        data.status,
        id,
      ],
    )

    return NextResponse.json({ message: "Treatment updated successfully" })
  } catch (error) {
    console.error("Error updating treatment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_DELETE)) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission to delete treatments" },
        { status: 403 },
      )
    }

    const { id } = context.params

    // If user is dentist, ensure they can only delete their own treatments
    if (user.role === "dentist") {
      const existingTreatment = (await query("SELECT dentist_id FROM treatments WHERE id = ?", [id])) as any[]
      if (existingTreatment.length === 0 || existingTreatment[0].dentist_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    await query("DELETE FROM treatments WHERE id = ?", [id])
    return NextResponse.json({ message: "Treatment deleted successfully" })
  } catch (error) {
    console.error("Error deleting treatment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
