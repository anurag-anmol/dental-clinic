// import { type NextRequest, NextResponse } from "next/server"
// import { query } from "@/lib/db"
// import { getCurrentUser } from "@/lib/auth"
// import { hasPermission, PERMISSIONS } from "@/lib/permissions"

// export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
//     try {
//         const user = await getCurrentUser()
//         if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_VIEW)) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//         }

//         const { id } = await context.params

//         // Get all treatments for the patient with photos
//         const treatments = (await query(
//             `SELECT t.*,
//         CONCAT(u.first_name, ' ', u.last_name) as dentist_name
//       FROM treatments t
//       JOIN users u ON t.dentist_id = u.id
//       WHERE t.patient_id = ?
//       ORDER BY t.treatment_date DESC`,
//             [id],
//         )) as any[]

//         // Get photos for each treatment
//         const treatmentsWithPhotos = await Promise.all(
//             treatments.map(async (treatment) => {
//                 const photos = (await query(
//                     "SELECT photo_url FROM treatment_photos WHERE treatment_id = ? ORDER BY created_at ASC",
//                     [treatment.id],
//                 )) as any[]

//                 return {
//                     ...treatment,
//                     photos: photos.map((p) => p.photo_url),
//                 }
//             }),
//         )

//         return NextResponse.json(treatmentsWithPhotos)
//     } catch (error) {
//         console.error("Error fetching patient treatments:", error)
//         return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//     }
// }




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

        const treatments = await query(
            `SELECT t.*, 
        CONCAT(u.first_name, ' ', u.last_name) as dentist_name,
        (SELECT COUNT(*) FROM treatment_medicines WHERE treatment_id = t.id) as medicine_count,
        (SELECT COUNT(*) FROM treatment_tests WHERE treatment_id = t.id) as test_count,
        (SELECT COUNT(*) FROM treatment_reports WHERE treatment_id = t.id) as report_count
      FROM treatments t
      JOIN users u ON t.dentist_id = u.id
      WHERE t.patient_id = ?
      ORDER BY t.treatment_date DESC`,
            [id],
        )

        return NextResponse.json(treatments)
    } catch (error) {
        console.error("Error fetching patient treatments:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
