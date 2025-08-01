import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const reports = await query(
      `SELECT tr.*, CONCAT(u.first_name, ' ', u.last_name) as uploaded_by_name
       FROM treatment_reports tr
       JOIN users u ON tr.uploaded_by = u.id
       WHERE tr.treatment_id = ?
       ORDER BY tr.report_type, tr.created_at ASC`,
      [id],
    )

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching treatment reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_EDIT)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const formData = await request.formData()
    const file = formData.get("file") as File
    const reportType = formData.get("reportType") as string
    const description = formData.get("description") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), "public", "uploads", "reports")
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const filename = `report_${id}_${timestamp}.${extension}`
    const filepath = join(uploadDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Save to database
    const fileUrl = `/uploads/reports/${filename}`
    const result = await query(
      `INSERT INTO treatment_reports (treatment_id, report_type, file_url, file_name, description, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, reportType, fileUrl, file.name, description, user.id],
    )

    return NextResponse.json({
      success: true,
      id: (result as any).insertId,
      fileUrl,
      message: "Report uploaded successfully",
    })
  } catch (error) {
    console.error("Error uploading report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
