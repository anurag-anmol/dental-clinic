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

    let sql = `
      SELECT * FROM medicines
      WHERE is_active = TRUE
    `
    const params: any[] = []

    if (search) {
      sql += ` AND (name LIKE ? OR generic_name LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }

    sql += ` ORDER BY name ASC`

    const medicines = await query(sql, params)
    return NextResponse.json(medicines)
  } catch (error) {
    console.error("Error fetching medicines:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
